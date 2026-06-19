import { Request, Response, NextFunction } from "express";
import { Invoice } from "../models/Invoice";
import { Order } from "../models/Order";
import { Customer } from "../models/Customer";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

export const clearAllBillingData = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Count documents before deletion
    const [invoiceCount, orderCount, customerCount] = await Promise.all([
      Invoice.countDocuments(),
      Order.countDocuments(),
      Customer.countDocuments(),
    ]);

    // Clear all billing data
    await Promise.all([
      Invoice.deleteMany({}),
      Order.deleteMany({}),
      Customer.deleteMany({}),
    ]);

    res.json({
      success: true,
      message: "All billing data cleared successfully",
      data: {
        cleared: {
          invoices: invoiceCount,
          orders: orderCount,
          customers: customerCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [invoiceStats, orderStats, customerCount] = await Promise.all([
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
            totalCgst: { $sum: "$cgst" },
            totalSgst: { $sum: "$sgst" },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]),
      Customer.countDocuments(),
    ]);

    const stats = invoiceStats[0] || {
      totalInvoices: 0,
      totalAmount: 0,
      totalCgst: 0,
      totalSgst: 0,
    };
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
          totalGst: stats.totalCgst + stats.totalSgst,
        },
        orders: ordersByStatus,
        customers: customerCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

//all users

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await User.find(
      { role: { $ne: "CUSTOMER" } },
      "name email role isActive",
    ).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "name email phone role isActive isVerified createdAt updatedAt lastLogin avatar",
    );

    if (!user) {
      throw new AppError("Staff member not found", 404);
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Prevent deleting Super Admin
    if (user.role === "SUPER_ADMIN") {
      throw new AppError("Super Admin account cannot be deleted", 403);
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Staff account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};