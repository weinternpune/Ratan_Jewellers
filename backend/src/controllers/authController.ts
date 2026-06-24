import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import { v4 as uuidv4 } from "uuid";
import { User } from "../models/User";
import { Customer } from "../models/Customer";
import { Session } from "../models/index";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

const JWT_SECRET         = process.env.JWT_SECRET         || '8kX92@mnP#qL7zV$Rt!2BxPq2026'
const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET  || '9uY#72Lm@vQx!P4sKd2026Refresh'
const JWT_EXPIRE          = process.env.JWT_EXPIRE          || '15m'
const JWT_REFRESH_EXPIRE  = process.env.JWT_REFRESH_EXPIRE  || '7d'

const generateTokens = (userId: string) => ({
  accessToken: jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRE || "15m") as any,
  }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE || "7d") as any,
  }),
});

const formatUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
});

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, phone, password, name } = req.body;
    if (!name || !password) throw new AppError('Name and password are required', 400);
    const orConditions: any[] = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });
    if (!orConditions.length) throw new AppError('Email or phone is required', 400);
    const exists = await User.findOne({ $or: orConditions });
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    if (exists) {
      if (exists.isVerified) {
        throw new AppError('Account already exists with this email or phone', 409);
      }
      exists.name = name;
      exists.passwordHash = passwordHash;
      if (email) exists.email = email;
      if (phone) exists.phone = phone;
      user = await exists.save();
      // Ensure a Customer record exists even when re-using a previously
      // unverified User document, so this account always shows up in the
      // admin CRM customer list regardless of which registration attempt
      // actually completed.
      const hasCustomer = await Customer.findOne({ userId: user._id });
      if (!hasCustomer) {
        await Customer.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() });
      }
    } else {
      user = await User.create({ email, phone, passwordHash, name, isVerified: false });
      await Customer.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() });
    }
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await Session.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res
      .status(201)
      .json({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
  } catch (err) {
    next(err);
  }
};

const STAFF_ROLES = ['ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF','INVENTORY_MANAGER'];

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase?.()?.trim() || email });
    if (!user || !user.passwordHash)
      throw new AppError("Invalid credentials", 401);
    if (!user.isActive) throw new AppError("Account is deactivated", 401);
    if (!(await bcrypt.compare(password, user.passwordHash)))
      throw new AppError("Invalid credentials", 401);

    // Staff first-time login: email not verified → send OTP
    if (STAFF_ROLES.includes(user.role?.toUpperCase?.()) && !user.isVerified) {
      const { sendOTP: sendStaffOTP } = await import("../services/otpService");
      const result = await sendStaffOTP(user.email, "email", "login");
      if (!result.success) throw new AppError(result.message, 429);
      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email: user.email,
        message: `A verification code has been sent to ${user.email}. Please verify to continue.`,
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    await Session.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    res.json({
      success: true,
      requiresVerification: false,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

import { sendOTP, verifyOTP } from "../services/otpService";

// ─── OTP Handlers ─────────────────────────────────────────────────────────────
export const sendOTPHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identifier, type = "phone", purpose } = req.body;
    if (!identifier || !purpose)
      throw new AppError("Identifier and purpose are required", 400);
    if (!["register", "login", "reset_password"].includes(purpose))
      throw new AppError("Invalid purpose", 400);
    if (purpose === "login") {
      const field =
        type === "phone" ? { phone: identifier } : { email: identifier };
      if (!(await User.findOne(field)))
        throw new AppError("No account found. Please register first.", 404);
    }

    if (purpose === "register") {
      const field =
        type === "phone" ? { phone: identifier } : { email: identifier };
      if (await User.findOne(field))
        throw new AppError(
          "Account already exists. Please login instead.",
          409,
        );
    }
    const result = await sendOTP(
      identifier,
      type as "phone" | "email",
      purpose,
    );
    if (!result.success) throw new AppError(result.message, 429);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

export const verifyOTPHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identifier, code, purpose, name, type = "phone" } = req.body;
    if (!identifier || !code || !purpose)
      throw new AppError("All fields required", 400);

    const result = await verifyOTP(identifier, code, purpose);
    if (!result.success) throw new AppError(result.message, 400);

    if (purpose === "register") {
      if (!name) throw new AppError("Name is required for registration", 400);
      const exists = await User.findOne(
        type === "phone" ? { phone: identifier } : { email: identifier },
      );
      if (exists) throw new AppError("Account already exists", 409);
      const userData: any = { name, isVerified: true };
      if (type === "phone") userData.phone = identifier;
      else userData.email = identifier;
      const user = await User.create(userData);
      await Customer.create({
        userId: user._id,
        referralCode: uuidv4().substring(0, 8).toUpperCase(),
      });
      const tokens = generateTokens(user._id.toString());
      await Session.create({
        userId: user._id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      return res
        .status(201)
        .json({
          success: true,
          message: "Registration successful! Welcome to Ratan Jewellers.",
          data: { user: formatUser(user), ...tokens },
        });
    }

    if (purpose === "login") {
      const field =
        type === "phone" ? { phone: identifier } : { email: identifier };
      const user = await User.findOne(field);
      if (!user) throw new AppError("User not found", 404);
      if (!user.isActive) throw new AppError("Account deactivated", 401);
      const tokens = generateTokens(user._id.toString());
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        isVerified: true,
      });
      await Session.create({
        userId: user._id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        data: { user: formatUser(user), ...tokens },
      });
    }
    res.json({
      success: true,
      message: "OTP verified. You may now set a new password.",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identifier, code, newPassword } = req.body;
    if (!identifier || !code || !newPassword)
      throw new AppError("All fields required", 400);
    if (newPassword.length < 8)
      throw new AppError("Password must be at least 8 characters", 400);

    const result = await verifyOTP(identifier, code, "reset_password");
    if (!result.success) throw new AppError(result.message, 400);

    const isPhone = /^\+?\d{10,15}$/.test(identifier);
    const user = await User.findOne(
      isPhone ? { phone: identifier } : { email: identifier },
    );
    if (!user) throw new AppError("User not found", 404);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { passwordHash, isVerified: true });
    await Session.deleteMany({ userId: user._id });
    res.json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (err) {
    next(err);
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user)
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=google_failed`,
    );
  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await Session.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  res.redirect(
    `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
  );
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError("Refresh token required", 400);
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { userId: string };
    const session = await Session.findOne({ token: refreshToken });
    if (!session || session.expiresAt < new Date())
      throw new AppError("Invalid refresh token", 401);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
    );
    await Session.findOneAndUpdate(
      { token: refreshToken },
      {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    );
    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await Session.deleteMany({ token: refreshToken });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    const customer = await Customer.findOne({ userId: req.user!.id });
    res.json({ success: true, data: { ...user?.toObject(), customer } });
  } catch (err) {
    next(err);
  }
};

// ─── Email OTP (post-registration email verification) ─────────────────────
// Used by /register → /send-otp → /verify-otp on the storefront.
export const sendEmailOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required", 400);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new AppError("No account found for this email", 404);

    const result = await sendOTP(email.toLowerCase().trim(), "email", "register");
    if (!result.success) throw new AppError(result.message, 429);

    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

export const verifyEmailOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) throw new AppError("Email and OTP are required", 400);

    const result = await verifyOTP(email.toLowerCase().trim(), otp, "register");
    if (!result.success) throw new AppError(result.message, 400);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { isVerified: true, lastLogin: new Date() },
      { new: true },
    );
    if (!user) throw new AppError("No account found for this email", 404);

    const tokens = generateTokens(user._id.toString());
    await Session.create({
      userId: user._id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      success: true,
      message: "Email verified successfully!",
      data: { user: formatUser(user), ...tokens },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password ────────────────────────────────────────────────────────
export const checkAccountExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required", 400);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    res.json({ success: true, exists: !!user });
  } catch (err) {
    next(err);
  }
};

export const sendPasswordResetOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError("Email is required", 400);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new AppError("No account found with this email", 404);

    const result = await sendOTP(email.toLowerCase().trim(), "email", "reset_password");
    if (!result.success) throw new AppError(result.message, 429);

    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordWithOTP = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      throw new AppError("Email, OTP and new password are required", 400);
    if (newPassword.length < 6)
      throw new AppError("Password must be at least 6 characters", 400);

    const result = await verifyOTP(email.toLowerCase().trim(), otp, "reset_password");
    if (!result.success) throw new AppError(result.message, 400);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new AppError("No account found with this email", 404);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { passwordHash, isVerified: true });
    await Session.deleteMany({ userId: user._id });

    res.json({
      success: true,
      message: "Password reset successfully. Please sign in with your new password.",
    });
  } catch (err) {
    next(err);
  }
};
