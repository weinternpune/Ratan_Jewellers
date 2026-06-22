import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { Invoice } from "../models/Invoice";
import { Order } from "../models/Order";
import { Customer } from "../models/Customer";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { User, UserRole } from "../models/User";

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

const STAFF_ROLES: UserRole[] = [
  "SALES_STAFF",
  "INVENTORY_MANAGER",
  "STORE_MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
];

// Dedicated admin-only path for creating staff accounts.
// Deliberately separate from the public /auth/register endpoint so that
// staff creation always persists the chosen role and never collides with
// public customer signups that happen to use the same email.
export const createStaffUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError("Name, email, password and role are required", 400);
    }
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    const normalizedRole = String(role).toUpperCase() as UserRole;
    if (!STAFF_ROLES.includes(normalizedRole)) {
      throw new AppError(
        `Invalid role. Must be one of: ${STAFF_ROLES.join(", ")}`,
        400,
      );
    }

    // Only an existing Super Admin may create another Super Admin.
    if (normalizedRole === "SUPER_ADMIN" && req.user?.role !== "SUPER_ADMIN") {
      throw new AppError("Only a Super Admin can create another Super Admin", 403);
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, ...(phone ? [{ phone }] : [])],
    });

    if (existing) {
      const matchedByEmail = existing.email === normalizedEmail;

      // Auto-heal: if this is a CUSTOMER-role account that has never placed
      // a real order, it's almost certainly a leftover from someone
      // accidentally going through the public registration flow while
      // trying to create a staff account — a bug that existed before this
      // endpoint did. Rather than reject and force a manual DB cleanup
      // every time, upgrade it in place to the requested staff role.
      if (existing.role === "CUSTOMER") {
        const orderCount = await Order.countDocuments({ userId: existing._id });
        if (orderCount === 0) {
          if (normalizedRole === "SUPER_ADMIN" && req.user?.role !== "SUPER_ADMIN") {
            throw new AppError("Only a Super Admin can create another Super Admin", 403);
          }

          const passwordHash = await bcrypt.hash(password, 12);
          existing.name = name;
          existing.passwordHash = passwordHash;
          existing.role = normalizedRole;
          existing.isVerified = true;
          existing.isActive = true;
          if (phone) existing.phone = phone;
          await existing.save();

          // The original public-registration flow auto-creates a matching
          // Customer document; it no longer makes sense once this account
          // is a staff account, so remove it.
          await Customer.deleteOne({ userId: existing._id });

          return res.status(200).json({
            success: true,
            message:
              "An unused customer account with this email was found and converted to a staff account.",
            data: {
              id: existing._id,
              name: existing.name,
              email: existing.email,
              phone: existing.phone,
              role: existing.role,
              isActive: existing.isActive,
            },
          });
        }
      }

      throw new AppError(
        matchedByEmail
          ? "An account with this email already exists"
          : "An account with this phone number already exists",
        409,
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: phone || undefined,
      passwordHash,
      role: normalizedRole,
      isVerified: true, // admin-issued credentials don't need email verification
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err: any) {
    // Guard against a duplicate-key race (two requests at once with the
    // same email) that slips past the findOne pre-check above.
    if (err?.code === 11000) {
      return next(new AppError("An account with this email already exists", 409));
    }
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

// Generates a fresh temporary password for an existing staff account and
// returns it once, in this response only. There is no way to retrieve a
// previously-set password — it's bcrypt-hashed the instant it's saved and
// cannot be reversed by this server, this database, or anyone with access
// to either. This is the only safe path to recover access to an account
// whose original password was lost or never recorded.
function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid visual ambiguity
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const rest = Array.from({ length: 8 }, () => pick(all));

  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

export const resetStaffPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("Staff member not found", 404);
    }
    if (user.role === "CUSTOMER") {
      throw new AppError("This endpoint is for staff accounts only", 400);
    }
    // A Super Admin may reset their own password this way, but not another
    // Super Admin's, to prevent one admin from silently locking out another.
    if (user.role === "SUPER_ADMIN" && String(user._id) !== req.user?.id) {
      throw new AppError("Cannot reset another Super Admin's password", 403);
    }

    const tempPassword = generateTempPassword();
    user.passwordHash = await bcrypt.hash(tempPassword, 12);
    await user.save();

    res.json({
      success: true,
      message: "Temporary password generated. It will not be shown again after you close this window.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        tempPassword,
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
