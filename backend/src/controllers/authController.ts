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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone, password, name } = req.body;
    const exists = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
    if (exists) throw new AppError('User already exists', 409);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, phone, passwordHash, name });
    await Customer.create({ userId: user._id, referralCode: uuidv4().substring(0, 8).toUpperCase() });
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await Session.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
    res.status(201).json({ success: true, message: 'Registration successful', data: { user: { id: user._id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken } });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('Account is deactivated', 401);
    if (!await bcrypt.compare(password, user.passwordHash)) throw new AppError('Invalid credentials', 401);
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    await Session.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
    res.json({ success: true, message: 'Login successful', data: { user: { id: user._id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken } });
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
    const session = await Session.findOne({ token: refreshToken });
    if (!session || session.expiresAt < new Date()) throw new AppError('Invalid refresh token', 401);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    await Session.findOneAndUpdate({ token: refreshToken }, { token: newRefreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
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

// ── Admin/Staff login — returns role-specific session ─────────────────────
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) throw new AppError('Email and password required', 400);

    const id = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: id }, { phone: id.replace(/\D/g,'') }]
    });

    if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('Account deactivated', 403);
    if (user.role === 'CUSTOMER') throw new AppError('Invalid credentials', 401);
    if (!await bcrypt.compare(password, user.passwordHash)) throw new AppError('Invalid credentials', 401);

    const roleMap: Record<string, string> = {
      'SUPER_ADMIN':'super_admin','ADMIN':'admin','STORE_MANAGER':'store_manager',
      'INVENTORY_MANAGER':'inventory_manager','SALES_STAFF':'sales_staff',
    };

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    await Session.create({ userId: user._id, token: refreshToken, expiresAt: new Date(Date.now() + 8*60*60*1000) });

    const avatar = user.name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(), name: user.name, email: user.email,
          phone: user.phone || '', role: roleMap[user.role] || 'sales_staff',
          avatar, status: 'active',
        },
        accessToken, refreshToken,
      }
    });
  } catch (err) { next(err); }
};
