import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    }
  }
}

export type AuthRequest = Request;

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new AppError('Authentication required', 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const dbUser = await User.findById(decoded.userId).select('_id email role name isActive');
    if (!dbUser || !dbUser.isActive) throw new AppError('User not found or inactive', 401);
    req.user = { id: dbUser._id.toString(), email: dbUser.email, role: dbUser.role, name: dbUser.name };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) return next(new AppError('Invalid token', 401));
    next(err);
  }
};

export const authorize = (...roles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!roles.includes(req.user.role)) return next(new AppError('Insufficient permissions', 403));
    next();
  };
};
