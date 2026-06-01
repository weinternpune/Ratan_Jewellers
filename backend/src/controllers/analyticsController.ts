import { Request, Response, NextFunction } from 'express';
import { Invoice, Order } from '../models/Invoice';
import { Customer } from '../models/Customer';
import { Product } from '../models/Product';
import { Inventory } from '../models/index';

export const getSalesDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfDay   = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear  = new Date(now.getFullYear(), 0, 1);
    const lastMonth    = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const [todayAgg, monthAgg, yearAgg, lastMonthAgg, totalCustomers, recentInvoices] = await Promise.all([
      Invoice.aggregate([{ $match: { createdAt: { $gte: startOfDay } } },    { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Invoice.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } },  { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Invoice.aggregate([{ $match: { createdAt: { $gte: startOfYear } } },   { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Invoice.aggregate([{ $match: { createdAt: { $gte: lastMonth, $lte: endLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Customer.countDocuments(),
      Invoice.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    const monthRev = monthAgg[0]?.total || 0, lastMonthRev = lastMonthAgg[0]?.total || 1;
    const monthGrowth = ((monthRev - lastMonthRev) / lastMonthRev) * 100;
    const monthlyRevenue = await Invoice.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth()-12)) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }, { $project: { month: '$_id', revenue: 1, count: 1, _id: 0 } },
    ]);
    const lowStockItems = await Inventory.countDocuments({ $expr: { $lte: ['$currentStock','$lowStockAlert'] } });
    res.json({ success: true, data: { kpis: { todayRevenue: todayAgg[0]?.total||0, todayOrders: todayAgg[0]?.count||0, monthRevenue: monthRev, monthOrders: monthAgg[0]?.count||0, yearRevenue: yearAgg[0]?.total||0, yearOrders: yearAgg[0]?.count||0, monthGrowth: Math.round(monthGrowth*100)/100, totalCustomers, lowStockItems }, monthlyRevenue, recentOrders: recentInvoices } });
  } catch (err) { next(err); }
};

export const getInventoryAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [total, lowStock, outOfStock] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Inventory.countDocuments({ $expr: { $and: [{ $gt: ['$currentStock',0] }, { $lte: ['$currentStock','$lowStockAlert'] }] } }),
      Inventory.countDocuments({ currentStock: 0 }),
    ]);
    res.json({ success: true, data: { total, lowStock, outOfStock, healthy: total-lowStock-outOfStock } });
  } catch (err) { next(err); }
};

export const getCustomerAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [total, newThisMonth, topCustomers] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Customer.find().sort({ totalPurchases: -1 }).limit(10).populate('userId','name email'),
    ]);
    res.json({ success: true, data: { total, newThisMonth, topCustomers } });
  } catch (err) { next(err); }
};
