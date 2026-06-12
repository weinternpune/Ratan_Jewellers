
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { Session } from '../models/index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (userId: string) => ({
  accessToken:  jwt.sign({ userId }, process.env.JWT_SECRET as string,         { expiresIn: (process.env.JWT_EXPIRE || '15m') as any }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '7d') as any }),
});

const formatUser = (user: any) => ({ id: user._id, email: user.email, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password, name } = req.body;
    if (!name || !password) throw new AppError('Name and password are required', 400);
    const orConditions: any[] = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });
    if (!orConditions.length) throw new AppError('Email or phone is required', 400);
    const exists = await User.findOne({ $or: orConditions });
    if (exists) throw new AppError('Account already exists with this email or phone', 409);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, phone, passwordHash, name, isVerified: false });
    await Customer.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() });
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
      if (await User.findOne(field)) throw new AppError('Account already exists. Please login instead.', 409);
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
    if (!refreshToken) throw new AppError('Refresh token required', 400);
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
    const session = await Session.findOne({ token: refreshToken });
    if (!session || session.expiresAt < new Date()) throw new AppError('Invalid refresh token', 401);
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