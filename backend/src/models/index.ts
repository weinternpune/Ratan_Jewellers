import mongoose, { Document, Schema } from 'mongoose';

// ── Category ──────────────────────────────────────────────────────
export interface ICategory extends Document {
  name: string; slug: string; description?: string; image?: string;
  parentId?: mongoose.Types.ObjectId; isActive: boolean; sortOrder: number;
}
const CategorySchema = new Schema<ICategory>({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String }, image: { type: String },
  parentId:    { type: Schema.Types.ObjectId, ref: 'Category' },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });
export const Category = (mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)) as mongoose.Model<ICategory>;

// ── GoldRate ──────────────────────────────────────────────────────
export interface IGoldRate extends Document {
  purity: string; ratePerGram: number; date: Date; source: string;
}
const GoldRateSchema = new Schema<IGoldRate>({
  purity:      { type: String, required: true },
  ratePerGram: { type: Number, required: true },
  date:        { type: Date, default: Date.now },
  source:      { type: String, default: 'MANUAL' },
}, { timestamps: true });
GoldRateSchema.index({ purity: 1, date: -1 });
export const GoldRate = (mongoose.models.GoldRate || mongoose.model<IGoldRate>('GoldRate', GoldRateSchema)) as mongoose.Model<IGoldRate>;

// ── Inventory ─────────────────────────────────────────────────────
export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId; currentStock: number; reservedStock: number;
  lowStockAlert: number; location?: string; supplierId?: mongoose.Types.ObjectId; lastRestocked?: Date;
}
const InventorySchema = new Schema<IInventory>({
  productId:     { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  currentStock:  { type: Number, default: 0 },
  reservedStock: { type: Number, default: 0 },
  lowStockAlert: { type: Number, default: 2 },
  location:      { type: String },
  supplierId:    { type: Schema.Types.ObjectId, ref: 'Supplier' },
  lastRestocked: { type: Date },
}, { timestamps: true });
export const Inventory = (mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema)) as mongoose.Model<IInventory>;

// ── Session ───────────────────────────────────────────────────────
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId; token: string; expiresAt: Date;
}
const SessionSchema = new Schema<ISession>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const Session = (mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)) as mongoose.Model<ISession>;

// ── Supplier ──────────────────────────────────────────────────────
export interface ISupplier extends Document {
  name: string; email?: string; phone: string; address?: object; gstin?: string; isActive: boolean;
}
const SupplierSchema = new Schema<ISupplier>({
  name:     { type: String, required: true },
  email:    { type: String },
  phone:    { type: String, required: true },
  address:  { type: Object },
  gstin:    { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const Supplier = (mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema)) as mongoose.Model<ISupplier>;
