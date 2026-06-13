import { Request, Response, NextFunction } from 'express';
import { Invoice } from '../models/Invoice';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const clearAllBillingData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Count documents before deletion
    const [invoiceCount, orderCount, customerCount] = await Promise.all([
      Invoice.countDocuments(),
      Order.countDocuments(),
      Customer.countDocuments()
    ]);

    // Clear all billing data
    await Promise.all([
      Invoice.deleteMany({}),
      Order.deleteMany({}),
      Customer.deleteMany({})
    ]);

    res.json({ 
      success: true, 
      message: 'All billing data cleared successfully',
      data: {
        cleared: {
          invoices: invoiceCount,
          orders: orderCount,
          customers: customerCount
        }
      }
    });
  } catch (err) { 
    next(err); 
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [invoiceStats, orderStats, customerCount] = await Promise.all([
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            totalCgst: { $sum: '$cgst' },
            totalSgst: { $sum: '$sgst' }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]),
      Customer.countDocuments()
    ]);

    const stats = invoiceStats[0] || { totalInvoices: 0, totalAmount: 0, totalCgst: 0, totalSgst: 0 };
    const ordersByStatus = orderStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        invoices: {
          total: stats.totalInvoices,
          totalAmount: stats.totalAmount,
          totalGst: stats.totalCgst + stats.totalSgst
        },
        orders: ordersByStatus,
        customers: customerCount
      }
    });
  } catch (err) {
    next(err);
  }
};