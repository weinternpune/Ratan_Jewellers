import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// ─────────────────────────────────────────────────────────────────────────
// Records ONE payment against an existing invoice (partial payment workflow):
//   bill → customer pays some → later pays some more → ... → fully paid.
//
// The server is the only place that decides the new paid amount, balance and
// status, always from the invoice's stored total — nothing is trusted from the
// browser except the amount, mode, date and note of this single payment.
// ─────────────────────────────────────────────────────────────────────────

export const PAYMENT_MODES = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'];

export interface PaymentPlan {
  amount: number;
  newPaid: number;
  newBalance: number;
  status: string;
  payment: { amount: number; date: Date; mode: string; notes: string };
}

// Pure decision logic (no database) so it can be tested on its own.
export const planPayment = (inv: any, body: any, now: Date = new Date()): PaymentPlan => {
  const amount = Math.round(Number(body?.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Enter a payment amount greater than 0', 400);
  }

  const total = Number(inv.totalAmount) || 0;
  const paid = Number(inv.amountPaid) || 0;
  const balance = Math.max(total - paid, 0);

  if (balance <= 0) throw new AppError('This invoice is already fully paid', 400);
  if (amount > balance) {
    throw new AppError(`Amount cannot be more than the balance due (₹${balance.toLocaleString('en-IN')})`, 400);
  }

  let when = now;
  if (body?.date) {
    const d = new Date(body.date);
    // accept a past/today date; never a date more than a day in the future
    if (!isNaN(d.getTime()) && d.getTime() <= now.getTime() + 24 * 3600 * 1000) when = d;
  }

  const mode = PAYMENT_MODES.includes(body?.mode) ? body.mode : 'Cash';
  const notes = typeof body?.notes === 'string' ? body.notes.trim().slice(0, 200) : '';

  const newPaid = paid + amount;
  const newBalance = Math.max(total - newPaid, 0);
  // fully paid → "paid". Otherwise keep pending/overdue/draft as it was.
  const status = newBalance === 0 ? 'paid' : (inv.status && inv.status !== 'paid' ? inv.status : 'pending');

  return { amount, newPaid, newBalance, status, payment: { amount, date: when, mode, notes } };
};

export const addInvoicePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // by invoice number first (what the app uses), then by database id
    let inv: any = await Invoice.findOne({ invoiceNumber: req.params.id }).lean();
    if (!inv && mongoose.Types.ObjectId.isValid(req.params.id)) {
      inv = await Invoice.findById(req.params.id).lean();
    }
    if (!inv) throw new AppError('Invoice not found', 404);

    const plan = planPayment(inv, req.body);

    // Optimistic lock: only update if nobody else changed the paid amount since
    // we read it, so two people recording at the same moment cannot overwrite
    // each other or collect more than the balance.
    const filter: any = { _id: inv._id };
    filter.amountPaid = inv.amountPaid === undefined ? { $exists: false } : inv.amountPaid;

    const updated = await Invoice.findOneAndUpdate(
      filter,
      {
        $set: { amountPaid: plan.newPaid, balanceDue: plan.newBalance, status: plan.status },
        $push: { paymentHistory: plan.payment },
      },
      { new: true }
    );

    if (!updated) {
      throw new AppError('This invoice was just updated by someone else. Please refresh and try again.', 409);
    }

    res.json({
      success: true,
      message: plan.newBalance === 0 ? 'Payment recorded - invoice is now fully paid' : 'Payment recorded',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
