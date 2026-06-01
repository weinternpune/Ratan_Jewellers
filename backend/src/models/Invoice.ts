import mongoose, { Document, Schema } from 'mongoose';

// ── Order ─────────────────────────────────────────────────────────
const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true }, quantity: { type: Number, required: true },
  goldRate: { type: Number, required: true }, grossWeight: { type: Number },
  netWeight: { type: Number }, makingCharges: { type: Number, default: 0 },
  stoneCharges: { type: Number, default: 0 }, unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true }, cgst: { type: Number, default: 0 }, sgst: { type: Number, default: 0 },
}, { _id: false });

export interface IOrder extends Document {
  orderNumber: string; userId: mongoose.Types.ObjectId; customerId?: mongoose.Types.ObjectId;
  status: string; paymentStatus: string; paymentMode?: string;
  subtotal: number; discountAmount: number; cgst: number; sgst: number; igst: number; totalAmount: number;
  shippingAddress?: object; couponCode?: string; notes?: string;
  razorpayOrderId?: string; razorpayPaymentId?: string;
  trackingNumber?: string; deliveredAt?: Date; items: any[];
  createdAt: Date; updatedAt: Date;
}
const OrderSchema = new Schema<IOrder>({
  orderNumber:       { type: String, required: true, unique: true },
  userId:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId:        { type: Schema.Types.ObjectId, ref: 'Customer' },
  status:            { type: String, enum: ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'], default: 'PENDING' },
  paymentStatus:     { type: String, enum: ['PENDING','PAID','FAILED','REFUNDED'], default: 'PENDING' },
  paymentMode:       { type: String },
  subtotal:          { type: Number, required: true }, discountAmount: { type: Number, default: 0 },
  cgst:              { type: Number, default: 0 }, sgst: { type: Number, default: 0 }, igst: { type: Number, default: 0 },
  totalAmount:       { type: Number, required: true }, shippingAddress: { type: Object },
  couponCode:        { type: String }, notes: { type: String },
  razorpayOrderId:   { type: String }, razorpayPaymentId: { type: String },
  trackingNumber:    { type: String }, deliveredAt: { type: Date },
  items:             [OrderItemSchema],
}, { timestamps: true });
OrderSchema.index({ orderNumber: 1 }); OrderSchema.index({ userId: 1 }); OrderSchema.index({ status: 1 });
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

// ── Invoice ───────────────────────────────────────────────────────
const InvoiceItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true }, hsnCode: { type: String, default: '7113' },
  purity: { type: String, required: true }, grossWeight: { type: Number }, netWeight: { type: Number },
  goldRate: { type: Number, required: true }, makingCharges: { type: Number, default: 0 },
  stoneCharges: { type: Number, default: 0 }, quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true }, cgstRate: { type: Number, default: 1.5 },
  sgstRate: { type: Number, default: 1.5 }, cgstAmount: { type: Number, required: true },
  sgstAmount: { type: Number, required: true }, totalAmount: { type: Number, required: true },
}, { _id: false });

export interface IInvoice extends Document {
  invoiceNumber: string; orderId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; customerId?: mongoose.Types.ObjectId;
  customerName: string; customerPhone: string; customerEmail?: string;
  customerAddress?: object; customerGstin?: string; paymentMode: string;
  subtotal: number; discountAmount: number; cgst: number; sgst: number; igst: number;
  totalAmount: number; oldGoldExchange: number; pdfUrl?: string; notes?: string;
  isEdited: boolean; editHistory: object[]; items: any[];
  createdAt: Date; updatedAt: Date;
}
const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber:   { type: String, required: true, unique: true },
  orderId:         { type: Schema.Types.ObjectId, ref: 'Order' },
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId:      { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerName:    { type: String, required: true }, customerPhone: { type: String, required: true },
  customerEmail:   { type: String }, customerAddress: { type: Object }, customerGstin: { type: String },
  paymentMode:     { type: String, required: true },
  subtotal:        { type: Number, required: true }, discountAmount: { type: Number, default: 0 },
  cgst:            { type: Number, default: 0 }, sgst: { type: Number, default: 0 }, igst: { type: Number, default: 0 },
  totalAmount:     { type: Number, required: true }, oldGoldExchange: { type: Number, default: 0 },
  pdfUrl:          { type: String }, notes: { type: String },
  isEdited:        { type: Boolean, default: false }, editHistory: [{ type: Object }],
  items:           [InvoiceItemSchema],
}, { timestamps: true });
InvoiceSchema.index({ invoiceNumber: 1 }); InvoiceSchema.index({ customerPhone: 1 }); InvoiceSchema.index({ createdAt: -1 });
export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

// ── Review ────────────────────────────────────────────────────────
const ReviewSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  productId:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String }, content: { type: String }, images: [{ type: String }],
  isVerified: { type: Boolean, default: false }, isApproved: { type: Boolean, default: false },
}, { timestamps: true });
ReviewSchema.index({ productId: 1 });
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

// ── Coupon ────────────────────────────────────────────────────────
const CouponSchema = new Schema({
  code:           { type: String, required: true, unique: true, uppercase: true },
  type:           { type: String, required: true }, value: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 }, maxUsage: { type: Number },
  usedCount:      { type: Number, default: 0 }, isActive: { type: Boolean, default: true },
  expiresAt:      { type: Date },
}, { timestamps: true });
export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

// ── WAMessage ────────────────────────────────────────────────────
const WAMessageSchema = new Schema({
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  phone: { type: String, required: true }, templateName: { type: String },
  message: { type: String }, pdfUrl: { type: String },
  status: { type: String, enum: ['PENDING','SENT','DELIVERED','FAILED','READ'], default: 'PENDING' },
  retryCount: { type: Number, default: 0 }, errorLog: { type: String },
  sentAt: { type: Date }, deliveredAt: { type: Date },
}, { timestamps: true });
export const WAMessage = mongoose.models.WAMessage || mongoose.model('WAMessage', WAMessageSchema);

// ── AuditLog ──────────────────────────────────────────────────────
const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, entity: { type: String, required: true },
  entityId: { type: String }, oldData: { type: Object }, newData: { type: Object },
  ipAddress: { type: String }, userAgent: { type: String },
}, { timestamps: true });
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
