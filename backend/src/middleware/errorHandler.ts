import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma errors
  if (err.message.includes('Unique constraint')) {
    return res.status(409).json({
      success: false,
      message: 'A record with this information already exists.',
    });
  }

  if (err.message.includes('Record to update not found')) {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  // Default
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
