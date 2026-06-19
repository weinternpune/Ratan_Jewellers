
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { Session } from '../models/index';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET         = process.env.JWT_SECRET         || '8kX92@mnP#qL7zV$Rt!2BxPq2026'
const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET  || '9uY#72Lm@vQx!P4sKd2026Refresh'
const JWT_EXPIRE          = process.env.JWT_EXPIRE          || '15m'
const JWT_REFRESH_EXPIRE  = process.env.JWT_REFRESH_EXPIRE  || '7d'

const generateTokens = (userId: string) => ({
  accessToken:  jwt.sign({ userId }, JWT_SECRET,         { expiresIn: JWT_EXPIRE as any }),
  refreshToken: jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE as any }),
});

const formatUser = (user: any) => ({ id: user._id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password, name, role } = req.body;
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
    } else {
      user = await User.create({ email, phone, passwordHash, name, isVerified: false });
      await Customer.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() });
    }
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await Session.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    res.status(201).json({ success: true, message: 'Registration successful', data: { user: formatUser(user), accessToken, refreshToken } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('Account is deactivated. Contact support.', 401);
    if (!await bcrypt.compare(password, user.passwordHash)) throw new AppError('Invalid credentials', 401);
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    await Session.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    res.json({ success: true, message: 'Login successful', data: { user: formatUser(user), accessToken, refreshToken } });
  } catch (err) { next(err); }
};


import { sendOTP, verifyOTP } from '../services/otpService';


// ─── OTP Handlers ─────────────────────────────────────────────────────────────
export const sendOTPHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, type = 'phone', purpose } = req.body;
    if (!identifier || !purpose) throw new AppError('Identifier and purpose are required', 400);
    if (!['register', 'login', 'reset_password'].includes(purpose)) throw new AppError('Invalid purpose', 400);
    if (purpose === 'login') {
      const field = type === 'phone' ? { phone: identifier } : { email: identifier };
      if (!await User.findOne(field)) throw new AppError('No account found. Please register first.', 404);
    }

    if (purpose === 'register') {
      const field = type === 'phone' ? { phone: identifier } : { email: identifier };
      const exists = await User.findOne(field);
      if (exists && exists.isVerified) throw new AppError('Account already exists. Please login instead.', 409);
    }
    const result = await sendOTP(identifier, type as 'phone' | 'email', purpose);
    if (!result.success) throw new AppError(result.message, 429);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
};

export const verifyOTPHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, code, purpose, name, type = 'phone' } = req.body;
    if (!identifier || !code || !purpose) throw new AppError('All fields required', 400);

    const result = await verifyOTP(identifier, code, purpose);
    if (!result.success) throw new AppError(result.message, 400);

    if (purpose === 'register') {
      if (!name) throw new AppError('Name is required for registration', 400);
      const exists = await User.findOne(type === 'phone' ? { phone: identifier } : { email: identifier });
      if (exists) throw new AppError('Account already exists', 409);
      const userData: any = { name, isVerified: true };
      if (type === 'phone') userData.phone = identifier; else userData.email = identifier;
      const user = await User.create(userData);
      await Customer.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() });
      const tokens = generateTokens(user._id.toString());
      await Session.create({ userId: user._id, token: tokens.refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
      return res.status(201).json({ success: true, message: 'Registration successful! Welcome to Ratan Jewellers.', data: { user: formatUser(user), ...tokens } });
    }

    if (purpose === 'login') {
      const field = type === 'phone' ? { phone: identifier } : { email: identifier };
      const user = await User.findOne(field);
      if (!user) throw new AppError('User not found', 404);
      if (!user.isActive) throw new AppError('Account deactivated', 401);
      const tokens = generateTokens(user._id.toString());
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date(), isVerified: true });
      await Session.create({ userId: user._id, token: tokens.refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
      return res.json({ success: true, message: `Welcome back, ${user.name}!`, data: { user: formatUser(user), ...tokens } });
    }
    res.json({ success: true, message: 'OTP verified. You may now set a new password.' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, code, newPassword } = req.body;
    if (!identifier || !code || !newPassword) throw new AppError('All fields required', 400);
    if (newPassword.length < 8) throw new AppError('Password must be at least 8 characters', 400);

    const result = await verifyOTP(identifier, code, 'reset_password');
    if (!result.success) throw new AppError(result.message, 400);

    const isPhone = /^\+?\d{10,15}$/.test(identifier);
    const user = await User.findOne(isPhone ? { phone:identifier } : { email:identifier });
    if (!user) throw new AppError('User not found', 404);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { passwordHash, isVerified:true });
    await Session.deleteMany({ userId: user._id });
    res.json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
  } catch (err) { next(err); }
};

export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  await Session.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError('Refresh token required', 400);
    }
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      // Malformed/expired/invalid signature — always a clean 401, never a 500
      throw new AppError('Invalid or expired refresh token. Please sign in again.', 401);
    }
    const session = await Session.findOne({ token: refreshToken });
    if (!session || session.expiresAt < new Date()) {
      throw new AppError('Session expired. Please sign in again.', 401);
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    await Session.findOneAndUpdate({ token: refreshToken }, { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await Session.deleteMany({ token: refreshToken });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.id).select('-passwordHash');
    const customer = await Customer.findOne({ userId: req.user!.id });
    res.json({ success: true, data: { ...user?.toObject(), customer } });
  } catch (err) { next(err); }
};
// ── Send Email OTP ────────────────────────────────────────────────────────
export const sendEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    if (!email) throw new AppError('Email is required', 400)

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new AppError('No account found with this email. Please register first.', 404)

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    logger.info(`🔑 [OTP] Generated OTP for ${email}: ${otp}`);

    await User.findByIdAndUpdate(user._id, {
      emailOTP: otp,
      emailOTPExpiry: otpExpiry,
    })

    // Send via nodemailer
    const transporter = require('nodemailer').createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Ratan Jewellers" <noreply@ratanjewellers.com>',
        to: email,
        subject: 'Your Ratan Jewellers Verification Code',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e0d5b8;padding:0">
          <div style="background:#1a0004;padding:24px;text-align:center">
            <h2 style="color:#C9A84C;margin:0;font-size:22px">RATAN JEWELLERS</h2>
            <p style="color:#e8d5a3;margin:4px 0;font-size:12px">Email Verification</p>
          </div>
          <div style="padding:32px;background:#fff">
            <p style="color:#333;font-size:14px">Hello ${user.name},</p>
            <p style="color:#555;font-size:13px">Your verification code is:</p>
            <div style="background:#f9f5e7;border:2px solid #C9A84C;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
              <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1a0004">${otp}</span>
            </div>
            <p style="color:#888;font-size:12px">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <div style="padding:16px;background:#f5f5f5;text-align:center;font-size:11px;color:#999">
            Ratan Jewellers &bull; Est. 1985 &bull; BIS Hallmarked
          </div>
        </div>`,
      })
      return res.json({ success: true, message: 'OTP sent to your email' })
    } catch (sendErr: any) {
      logger.error('Failed to send verification email', sendErr)
      if (process.env.NODE_ENV === 'development') {
        return res.json({ success: true, message: 'Email delivery failed. Dev bypass OTP code: 123456' })
      }
      throw new AppError('Email delivery failed.', 500)
    }
  } catch (err) { next(err) }
}

// ── Verify Email OTP ──────────────────────────────────────────────────────
export const verifyEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) throw new AppError('Email and OTP are required', 400)

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new AppError('Account not found', 404)

    const isDevFallback = process.env.NODE_ENV === 'development' && otp.toString().trim() === '123456';
    if (!isDevFallback) {
      if (!user.emailOTP || !user.emailOTPExpiry) throw new AppError('No OTP requested. Please request a new one.', 400)
      if (new Date() > user.emailOTPExpiry) throw new AppError('OTP has expired. Please request a new one.', 400)
      if (user.emailOTP !== otp.toString().trim()) throw new AppError('Invalid OTP', 400)
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      emailOTP: null,
      emailOTPExpiry: null,
    })

    const { accessToken, refreshToken } = generateTokens(user._id.toString())
    await Session.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) })

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken,
      }
    })
  } catch (err) { next(err) }
}

// ── Check if account exists (for forgot password) ─────────────────────────
export const checkAccountExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    if (!email) throw new AppError('Email is required', 400)
    const user = await User.findOne({ email: email.toLowerCase() })
    res.json({ success: true, exists: !!user, name: user?.name })
  } catch (err) { next(err) }
}

// ── Send Password Reset OTP ───────────────────────────────────────────────
export const sendPasswordResetOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    if (!email) throw new AppError('Email is required', 400)
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new AppError('No account found with this email. Please register first.', 404)

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000)

    logger.info(`🔑 [OTP] Generated Password Reset OTP for ${email}: ${otp}`);

    await User.findByIdAndUpdate(user._id, { emailOTP: otp, emailOTPExpiry: otpExpiry })

    const transporter = require('nodemailer').createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Ratan Jewellers" <noreply@ratanjewellers.com>',
        to: email,
        subject: 'Reset Your Ratan Jewellers Password',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e0d5b8">
            <div style="background:#1a0004;padding:24px;text-align:center">
              <h2 style="color:#C9A84C;margin:0">RATAN JEWELLERS</h2>
              <p style="color:#e8d5a3;margin:4px 0;font-size:12px">Password Reset</p>
            </div>
            <div style="padding:32px;background:#fff">
              <p style="color:#333;font-size:14px">Hello ${user.name},</p>
              <p style="color:#555;font-size:13px">Your password reset code is:</p>
              <div style="background:#fff3cd;border:2px solid #C9A84C;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
                <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1a0004">${otp}</span>
              </div>
              <p style="color:#888;font-size:12px">Expires in <strong>15 minutes</strong>. If you didn't request this, ignore this email.</p>
            </div>
          </div>`,
      })
      res.json({ success: true, message: 'Password reset OTP sent to your email' })
    } catch (sendErr: any) {
      logger.error('Failed to send password reset email', sendErr)
      if (process.env.NODE_ENV === 'development') {
        return res.json({ success: true, message: 'Email delivery failed. Dev bypass OTP code: 123456' })
      }
      throw new AppError('Email delivery failed.', 500)
    }
  } catch (err) { next(err) }
}

// ── Reset Password with OTP ───────────────────────────────────────────────
export const resetPasswordWithOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) throw new AppError('Email, OTP and new password are required', 400)
    if (newPassword.length < 6) throw new AppError('Password must be at least 6 characters', 400)

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) throw new AppError('Account not found', 404)

    const isDevFallback = process.env.NODE_ENV === 'development' && otp.toString().trim() === '123456';
    if (!isDevFallback) {
      if (!user.emailOTP || !user.emailOTPExpiry) throw new AppError('No OTP requested', 400)
      if (new Date() > user.emailOTPExpiry) throw new AppError('OTP expired. Please request a new one.', 400)
      if (user.emailOTP !== otp.toString().trim()) throw new AppError('Invalid OTP', 400)
    }

    const hash = await bcrypt.hash(newPassword, 12)
    await User.findByIdAndUpdate(user._id, { passwordHash: hash, emailOTP: null, emailOTPExpiry: null })

    res.json({ success: true, message: 'Password reset successfully. You can now sign in.' })
  } catch (err) { next(err) }
}

// ── TEMPORARY DIAGNOSTIC — remove after debugging ──────────────────────────
export const debugCheckUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.json({ found: false, message: 'No user document exists with this email at all.' });
    }
    const hasHash = !!user.passwordHash;
    const matches = hasHash ? await bcrypt.compare(password, user.passwordHash as string) : false;
    res.json({
      found: true,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      hasPasswordHash: hasHash,
      passwordHashPrefix: hasHash ? user.passwordHash!.substring(0, 10) : null,
      passwordMatches: matches,
    });
  } catch (err) { next(err); }
};
