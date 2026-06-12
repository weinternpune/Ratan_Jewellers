import { Request, Response, NextFunction } from "express";
import { Customer } from "../models/Customer";

export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customers = await Customer.find()
      .populate("userId", "name email phone createdAt")
      .sort({ createdAt: -1 });

    const formatted = customers.map((c: any) => ({
      id: c._id,
      name: c.userId?.name || "",
      email: c.userId?.email || "",
      phone: c.userId?.phone || "",
      totalSpend: c.totalPurchases || 0,
      loyaltyPoints: c.loyaltyPoints || 0,
      segment: c.segment,
      birthday: c.dateOfBirth,
      notes: c.notes,
      createdAt: c.createdAt,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};
