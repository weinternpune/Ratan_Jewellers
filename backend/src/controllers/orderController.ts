import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear(), month = String(new Date().getMonth()+1).padStart(2,'0');
  const count = await Order.countDocuments({ createdAt: { $gte: new Date(`${year}-${month}-01`) } });
  return `RJ-${year}${month}-${String(count+1).padStart(4,'0')}`;
};

// ── Place Order ───────────────────────────────────────────────────────────────
export const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { items, address, paymentMethod, subtotal, gst, deliveryCharge, discount, grandTotal, couponCode } = req.body;

    if (!items?.length)   throw new AppError('Order must have at least one item', 400);
    if (!address?.name)   throw new AppError('Delivery address is required', 400);
    if (!paymentMethod)   throw new AppError('Payment method is required', 400);

    const order = await Order.create({
      userId,
      items,
      address,
      paymentMethod,
      subtotal:       subtotal       || 0,
      gst:            gst            || 0,
      deliveryCharge: deliveryCharge || 0,
      discount:       discount       || 0,
      grandTotal:     grandTotal     || 0,
      couponCode,
      status: 'CONFIRMED',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (err) { next(err); }
};

// ── Get My Orders ─────────────────────────────────────────────────────────────
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const page  = parseInt(req.query.page  as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip  = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

// ── Get Single Order ──────────────────────────────────────────────────────────
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId  = (req as AuthRequest).user!.id;
    const { id }  = req.params;

    // Support lookup by orderNumber or _id
    const query = id.startsWith('RJ-')
      ? { orderNumber: id, userId }
      : { _id: id,        userId };

    const order = await Order.findOne(query).lean();
    if (!order) throw new AppError('Order not found', 404);

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// ── Cancel Order ──────────────────────────────────────────────────────────────
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) throw new AppError('Order not found', 404);
    if (['SHIPPED','DELIVERED','CANCELLED'].includes(order.status)) {
      throw new AppError(`Cannot cancel an order that is ${order.status.toLowerCase()}`, 400);
    }

    order.status = 'CANCELLED';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (err) { next(err); }
};

// ── Admin Functions ───────────────────────────────────────────────────────────
export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page='1', limit='20', search, status } = req.query;
    const pageNum = parseInt(page as string), limitNum = parseInt(limit as string);
    const filter: any = {};
    if (search) filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }];
    if (status) filter.status = status;
    const [orders, total] = await Promise.all([Order.find(filter).sort({ createdAt: -1 }).skip((pageNum-1)*limitNum).limit(limitNum), Order.countDocuments(filter)]);
    res.json({ success: true, data: { orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total/limitNum) } } });
  } catch (err) { next(err); }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (err) { next(err); }
};

export const deleteOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) { next(err); }
};