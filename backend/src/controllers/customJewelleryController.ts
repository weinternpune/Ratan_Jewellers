import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler';

const Schema = mongoose.Schema;

// Inline model (no separate file needed for simple use)
const CJSchema = new Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, required: true },
  category:  { type: String, required: true },
  metal:     { type: String },
  budget:    { type: String },
  description: { type: String, required: true },
  status:    { type: String, default: 'new' },
  requestId: { type: String },
}, { timestamps: true });

const CJRequest = (mongoose.models.CustomJewellery || mongoose.model('CustomJewellery', CJSchema)) as any;

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, category, description } = req.body;
    if (!name || !email || !phone || !category || !description)
      throw new AppError('All required fields must be filled', 400);

    const requestId = 'CJR-' + Date.now();
    const record = await CJRequest.create({ ...req.body, requestId });

    res.status(201).json({ success: true, message: 'Request submitted successfully', data: record });
  } catch (err) { next(err); }
};

export const getRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await CJRequest.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
};
