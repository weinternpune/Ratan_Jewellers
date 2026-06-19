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

export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const customer: any = await Customer.findById(id).populate(
      "userId",
      "name email phone createdAt",
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: customer._id,
        name: customer.userId?.name || "",
        email: customer.userId?.email || "",
        phone: customer.userId?.phone || "",
        totalSpend: customer.totalPurchases || 0,
        loyaltyPoints: customer.loyaltyPoints || 0,
        segment: customer.segment,
        birthday: customer.dateOfBirth,
        notes: customer.notes,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.notes = req.body.notes ?? customer.notes;
    customer.totalPurchases = req.body.totalSpend ?? customer.totalPurchases;

    customer.segment = req.body.segment ?? customer.segment;

    if (req.body.birthday) {
      customer.dateOfBirth = new Date(req.body.birthday);
    }

    await customer.save();

    res.json({
      success: true,
      message: "Customer updated",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted",
    });
  } catch (error) {
    next(error);
  }
};