import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId; gstin?: string;
  dateOfBirth?: Date; anniversary?: Date; address?: object;
  loyaltyPoints: number; totalPurchases: number;
  referralCode: string; referredBy?: string; segment: string; notes?: string;
  createdAt: Date; updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  gstin:          { type: String },
  dateOfBirth:    { type: Date },
  anniversary:    { type: Date },
  address:        { type: Object, default: {} },
  loyaltyPoints:  { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  referralCode:   { type: String, required: true, unique: true },
  referredBy:     { type: String },
  segment:        { type: String, default: 'REGULAR' },
  notes:          { type: String },
}, { timestamps: true });

export const Customer = (mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema)) as mongoose.Model<ICustomer>;
