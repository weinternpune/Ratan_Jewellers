import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'CUSTOMER' | 'SALES_STAFF' | 'INVENTORY_MANAGER' | 'STORE_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string; phone?: string; passwordHash?: string;
  name: string; role: UserRole; isActive: boolean; isVerified: boolean;
  avatar?: string; googleId?: string; lastLogin?: Date;
  createdAt: Date; updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:        { type: String, unique: true, sparse: true, trim: true },
  passwordHash: { type: String },
  name:         { type: String, required: true, trim: true },
  role:         { type: String, enum: ['CUSTOMER','SALES_STAFF','INVENTORY_MANAGER','STORE_MANAGER','ADMIN','SUPER_ADMIN'], default: 'CUSTOMER' },
  isActive:     { type: Boolean, default: true },
  isVerified:   { type: Boolean, default: false },
  avatar:       { type: String },
  googleId:     { type: String, unique: true, sparse: true },
  lastLogin:    { type: Date },
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
