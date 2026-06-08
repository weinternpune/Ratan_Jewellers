import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface IOrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  purity: string;
  weight: number;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  subtotal: number;
  gst: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  status: OrderStatus;
  couponCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  sku:       { type: String },
  image:     { type: String },
  purity:    { type: String },
  weight:    { type: Number },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber:    { type: String, required: true, unique: true },
  userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items:          { type: [OrderItemSchema], required: true },
  address: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    line1:   { type: String, required: true },
    line2:   { type: String },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
  },
  paymentMethod:  { type: String, required: true },
  subtotal:       { type: Number, required: true },
  gst:            { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  discount:       { type: Number, default: 0 },
  grandTotal:     { type: Number, required: true },
  status:         { type: String, enum: ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'], default: 'CONFIRMED' },
  couponCode:     { type: String },
  notes:          { type: String },
}, { timestamps: true });

// Generate order number: RJ-YYYYMMDD-XXXXX
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `RJ-${dateStr}-${random}`;
  }
  next();
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);