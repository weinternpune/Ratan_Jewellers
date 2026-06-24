import mongoose, { Document, Schema } from 'mongoose';
export interface IOTP extends Document {
  identifier: string; type: 'phone' | 'email';
  purpose: 'register' | 'login' | 'reset_password';
  code: string; expiresAt: Date; verified: boolean; attempts: number;
}
const OTPSchema = new Schema<IOTP>({
  identifier: { type: String, required: true },
  type:       { type: String, enum: ['phone', 'email'], required: true },
  purpose:    { type: String, enum: ['register', 'login', 'reset_password'], required: true },
  code:       { type: String, required: true },
  expiresAt:  { type: Date, required: true },
  verified:   { type: Boolean, default: false },
  attempts:   { type: Number, default: 0 },
}, { timestamps: true });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OTP = (mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema)) as mongoose.Model<IOTP>;
