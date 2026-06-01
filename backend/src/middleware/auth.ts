import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: UserRole; name: string; };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new AppError('Authentication required', 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId).select('id email role name isActive');
    if (!user || !user.isActive) throw new AppError('User not found or inactive', 401);
    req.user = { id: user._id.toString(), email: user.email, role: user.role, name: user.name };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) return next(new AppError('Invalid token', 401));
    next(err);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('Insufficient permissions', 403));
    next();
  };
};
