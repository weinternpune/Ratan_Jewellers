import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const ADMIN_ROLES = ['ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF','INVENTORY_MANAGER'];

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) throw new AppError('Email and password required', 400);

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase().trim() }, { phone: identifier.trim() }],
    });

    if (!user || !user.passwordHash) throw new AppError('Invalid credentials', 401);
    if (!ADMIN_ROLES.includes(user.role))  throw new AppError('Access denied. Not an admin account.', 403);
    if (!user.isActive) throw new AppError('Account deactivated', 401);
    if (!await bcrypt.compare(password, user.passwordHash)) throw new AppError('Invalid credentials', 401);

    const accessToken  = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string,         { expiresIn: '8h' });
    const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
};
