import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sku: string; barcode?: string; name: string; slug: string; description?: string;
  categoryId: mongoose.Types.ObjectId; metal: string; purity: string;
  grossWeight: number; netWeight: number; stoneWeight: number;
  makingCharges: number; stoneCharges: number; hsnCode: string;
  warrantyMonths: number; careInstructions?: string; bisHallmark?: string;
  images: string[]; isActive: boolean; isFeatured: boolean; isTrending: boolean; tags: string[];
  createdAt: Date; updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  sku:              { type: String, required: true, unique: true, uppercase: true },
  barcode:          { type: String, unique: true, sparse: true },
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, required: true, unique: true, lowercase: true },
  description:      { type: String },
  categoryId:       { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  metal:            { type: String, required: true },
  purity:           { type: String, required: true },
  grossWeight:      { type: Number, required: true, min: 0 },
  netWeight:        { type: Number, required: true, min: 0 },
  stoneWeight:      { type: Number, default: 0 },
  makingCharges:    { type: Number, default: 0 },
  stoneCharges:     { type: Number, default: 0 },
  hsnCode:          { type: String, default: '7113' },
  warrantyMonths:   { type: Number, default: 12 },
  careInstructions: { type: String },
  bisHallmark:      { type: String },
  images:           [{ type: String }],
  isActive:         { type: Boolean, default: true },
  isFeatured:       { type: Boolean, default: false },
  isTrending:       { type: Boolean, default: false },
  tags:             [{ type: String }],
}, { timestamps: true });

ProductSchema.index({ sku: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ metal: 1, purity: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
