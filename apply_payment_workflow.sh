#!/bin/bash
set -e
if [ ! -d "backend/src/controllers" ] || [ ! -d "frontend/src/store" ]; then
  echo "ERROR: run this from your project root (the folder that contains frontend/ and backend/)"
  exit 1
fi

echo "Checking your files..."
python3 - <<'PYEOF'
import re, sys, os

BILL = 'frontend/src/app/admin/billing/page.tsx'
STORE = 'frontend/src/store/adminStore.ts'
ROUTE = 'backend/src/routes/invoices.ts'
NEW_CTRL = 'backend/src/controllers/invoicePaymentController.ts'
NEW_MODAL = 'frontend/src/components/billing/RecordPaymentModal.tsx'

def read(p):
    with open(p, encoding='utf-8') as f: return f.read()

def once(s, old, new, label):
    if s.count(old) != 1:
        raise ValueError(f"{label}: expected line not found exactly once ({s.count(old)} found)")
    return s.replace(old, new)

def once_re(s, pattern, new, label):
    m = re.findall(pattern, s)
    if len(m) != 1:
        raise ValueError(f"{label}: expected block not found exactly once ({len(m)} found)")
    return re.sub(pattern, lambda _m: new, s, count=1)

for p in (BILL, STORE, ROUTE):
    if not os.path.isfile(p):
        print(f"ERROR: {p} not found - run this from your project root (folder with frontend/ and backend/)."); sys.exit(1)

out = {}
problems = []
warnings = []

# ───────────────────────── backend route ─────────────────────────
s = read(ROUTE)
if 'addInvoicePayment' not in s:
    try:
        s = once(s, "import { authenticate, authorize } from '../middleware/auth';",
                 "import { authenticate, authorize } from '../middleware/auth';\nimport { addInvoicePayment } from '../controllers/invoicePaymentController';", 'routes import')
        s = once(s, "export default router;",
                 "// Record one payment (partial-payment workflow)\nrouter.post('/:id/payments', authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF'), addInvoicePayment);\nexport default router;", 'routes export')
        out[ROUTE] = s
    except ValueError as e: problems.append(str(e))

# ───────────────────────── billing page ─────────────────────────
s = read(BILL)
if 'RecordPaymentModal' not in s:
    try:
        s = once(s, "import toast from 'react-hot-toast'",
                 "import toast from 'react-hot-toast'\nimport RecordPaymentModal, { PaymentHistory } from '@/components/billing/RecordPaymentModal'", 'billing import')
        s = once(s, "const [previewInvoice, setPreviewInvoice] = useState<Invoice|null>(null)",
                 "const [previewInvoice, setPreviewInvoice] = useState<Invoice|null>(null)\n  const [paymentInvoice, setPaymentInvoice] = useState<Invoice|null>(null)", 'billing state')
        # choosing "Paid" while money is still due opens the payment window instead of silently marking it paid
        s = once(s, "onChange={e=>updateInvoiceStatus(inv.id,e.target.value as InvoiceStatus)}",
                 "onChange={e=>{ const v=e.target.value as InvoiceStatus; if(v==='paid' && Math.max(inv.total-(inv.amountPaid||0),0)>0){ if(canShare) setPaymentInvoice(inv); else toast.error('Balance is still due - record the payment first') } else { updateInvoiceStatus(inv.id,v) } }}", 'billing status select')
        s = once(s, 'title="Preview"><Eye size={13}/></button>',
                 'title="Preview"><Eye size={13}/></button>\n                      {canShare && Math.max(inv.total-(inv.amountPaid||0),0)>0 && <button onClick={()=>setPaymentInvoice(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-teal-600" title="Record Payment"><Wallet size={13}/></button>}', 'billing row button')
        s = once_re(s, r'<div className="flex flex-col gap-2">\s*<div className="flex gap-2">',
                    '<PaymentHistory invoice={previewInvoice} />\n              {canShare && Math.max(previewInvoice.total-(previewInvoice.amountPaid||0),0)>0 && <button onClick={()=>setPaymentInvoice(previewInvoice)} className="w-full mb-2 flex items-center justify-center gap-1.5 bg-teal-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-teal-700"><Wallet size={14}/>Record Payment</button>}\n              <div className="flex flex-col gap-2">\n                <div className="flex gap-2">', 'billing preview block')
        s = once(s, "{/* Delete Invoice Confirmation Modal */}",
                 "{paymentInvoice && <RecordPaymentModal invoice={paymentInvoice} onClose={()=>setPaymentInvoice(null)} onPaid={(u)=>setPreviewInvoice(p=>p && p.id===u.id ? u : p)} />}\n\n      {/* Delete Invoice Confirmation Modal */}", 'billing mount')
        out[BILL] = s
    except ValueError as e: problems.append(str(e))

# ───────────────────────── store ─────────────────────────
s = read(STORE)
changed = False

# (a) the server is the source of truth for payments (so a second computer / second person always sees the real balance)
if 'serverInvoice.paymentHistory' not in s:
    try:
        if 'amountPaid: localInvoice.amountPaid ?? serverInvoice.amountPaid,' in s:      # version made by the billing-fix script
            s = once(s, 'amountPaid: localInvoice.amountPaid ?? serverInvoice.amountPaid,', 'amountPaid: serverInvoice.amountPaid,', 'store paid')
            s = once(s, 'balanceDue: Math.max(serverInvoice.total - (localInvoice.amountPaid ?? serverInvoice.amountPaid ?? 0), 0),', 'balanceDue: serverInvoice.balanceDue,', 'store balance')
            s = once(s, 'paymentHistory: localInvoice.paymentHistory', 'paymentHistory: serverInvoice.paymentHistory', 'store history')
        else:                                                                           # original version
            s = once(s, 'amountPaid: localInvoice.amountPaid,', 'amountPaid: serverInvoice.amountPaid,', 'store paid')
            s = once(s, 'balanceDue: localInvoice.balanceDue,', 'balanceDue: serverInvoice.balanceDue,', 'store balance')
            s = once(s, 'paymentHistory: localInvoice.paymentHistory', 'paymentHistory: serverInvoice.paymentHistory', 'store history')
        changed = True
    except ValueError as e: problems.append(str(e))

# (b) payments listed on the printed bill
if 'Payments received:' not in s:
    old = """<div style="color:#555;">Narration: By ${amountPaid > 0 ? 'Cash/UPI' : 'Pending'}</div>"""
    new = """${(inv.paymentHistory && inv.paymentHistory.length > 0)
          ? `<div style="color:#333;"><strong>Payments received:</strong>${(amountPaid - inv.paymentHistory.reduce((t: number, p: any) => t + (p.amount || 0), 0)) > 0 ? `<div style="font-size:10.5px;color:#444;">At billing &nbsp;-&nbsp; Rs ${(amountPaid - inv.paymentHistory.reduce((t: number, p: any) => t + (p.amount || 0), 0)).toLocaleString('en-IN')}.00</div>` : ''}${inv.paymentHistory.map((p: any) => `<div style="font-size:10.5px;color:#444;">${new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} &nbsp;-&nbsp; ${p.mode || 'Cash'} &nbsp;-&nbsp; Rs ${Number(p.amount).toLocaleString('en-IN')}.00</div>`).join('')}</div>`
          : `<div style="color:#555;">Narration: By ${amountPaid > 0 ? 'Cash/UPI' : 'Pending'}</div>`}"""
    try:
        s = once(s, old, new, 'store printed bill'); changed = True
    except ValueError as e: warnings.append(str(e) + '  (bill will still print, just without the payments list)')
if changed: out[STORE] = s

if problems:
    print("NOTHING WAS CHANGED. These required lines were not found in your files:")
    for p in problems: print("  -", p)
    print("Send me a screenshot of this message and I will adjust.")
    sys.exit(1)

# everything matched → write
os.makedirs(os.path.dirname(NEW_MODAL), exist_ok=True)
for path, content in out.items():
    if os.path.isfile(path): open(path + '.bak', 'w', encoding='utf-8').write(read(path))
    open(path, 'w', encoding='utf-8').write(content)
print("Edited:", ", ".join(out.keys()) if out else "(already up to date)")
for w in warnings: print("NOTE:", w)
PYEOF

echo "Writing new files..."
mkdir -p frontend/src/components/billing
cat > backend/src/controllers/invoicePaymentController.ts <<'EOF_CTRL_PAY_7Q'
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
EOF_CTRL_PAY_7Q
cat > frontend/src/components/billing/RecordPaymentModal.tsx <<'EOF_MODAL_PAY_7Q'
'use client'
import { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/billingApi'
import { useAdminStore, Invoice, InvoiceStatus } from '@/store/adminStore'

const MODES = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque']
const rs = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtDate = (d: string) => {
  const x = new Date(d)
  return isNaN(x.getTime()) ? '—' : x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Every payment taken on an invoice, oldest first. Whatever was paid when the
// bill was made (and has no entry of its own) is shown as "At billing", so
// the list always adds up to the Amount Paid on the bill.
export function PaymentHistory({ invoice }: { invoice: Invoice }) {
  const history = invoice.paymentHistory || []
  const paid = invoice.amountPaid || 0
  const atBilling = Math.max(paid - history.reduce((s, p) => s + (p.amount || 0), 0), 0)
  if (paid <= 0 && history.length === 0) return null
  const balance = Math.max(invoice.total - paid, 0)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
      <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Payments received</div>
      <div className="divide-y divide-gray-50 text-sm">
        {atBilling > 0 && (
          <div className="flex justify-between px-4 py-2"><span className="text-gray-600">At billing</span><span className="font-semibold text-emerald-700">{rs(atBilling)}</span></div>
        )}
        {history.map((p, i) => (
          <div key={i} className="flex justify-between px-4 py-2 gap-3">
            <span className="text-gray-600 min-w-0">{fmtDate(p.date)} · {p.mode || 'Cash'}{p.notes ? <span className="text-gray-400"> · {p.notes}</span> : null}</span>
            <span className="font-semibold text-emerald-700 whitespace-nowrap">{rs(p.amount || 0)}</span>
          </div>
        ))}
        <div className="flex justify-between px-4 py-2 bg-gray-50/60"><span className="font-semibold text-gray-700">Total paid</span><span className="font-bold text-emerald-700">{rs(paid)}</span></div>
        <div className="flex justify-between px-4 py-2 bg-gray-50/60"><span className="font-semibold text-gray-700">Balance due</span><span className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{balance > 0 ? rs(balance) : 'Fully paid'}</span></div>
      </div>
    </div>
  )
}

export default function RecordPaymentModal({
  invoice, onClose, onPaid,
}: { invoice: Invoice; onClose: () => void; onPaid?: (updated: Invoice) => void }) {
  const paid = invoice.amountPaid || 0
  const balance = Math.max(invoice.total - paid, 0)
  // No pre-filled amount: the person taking the money types what was received.
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('Cash')
  const [date, setDate] = useState(todayISO())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const n = parseInt(amount || '0', 10) || 0
  const valid = n > 0 && n <= balance
  const after = Math.max(balance - n, 0)

  const submit = async () => {
    if (!valid || saving) return
    setSaving(true)
    try {
      const res = await api.post<any>(`/invoices/${encodeURIComponent(invoice.id)}/payments`, { amount: n, mode, date, notes: notes.trim() })
      const u = res.data
      // always build on the newest copy in the store, not the (possibly older) one this window was opened with
      const latest = useAdminStore.getState().invoices.find(i => i.id === invoice.id) || invoice
      const newPaid = typeof u?.amountPaid === 'number' ? u.amountPaid : paid + n
      const updated: Invoice = {
        ...latest,
        amountPaid: newPaid,
        balanceDue: Math.max(latest.total - newPaid, 0),
        status: ((u?.status as InvoiceStatus) || (newPaid >= latest.total ? 'paid' : latest.status)) as InvoiceStatus,
        paymentHistory: u?.paymentHistory || latest.paymentHistory,
      }
      useAdminStore.setState(s => ({ invoices: s.invoices.map(i => (i.id === invoice.id ? updated : i)) }))
      useAdminStore.getState().addLog({
        type: 'billing', action: 'Payment recorded', user: 'Admin', role: 'Admin', ip: '—',
        details: `${invoice.id} - ${rs(n)} received via ${mode}`,
      })
      toast.success(updated.balanceDue && updated.balanceDue > 0 ? `${rs(n)} recorded. Balance due ${rs(updated.balanceDue)}` : `${rs(n)} recorded. Invoice fully paid`)
      onPaid?.(updated)
      onClose()
    } catch (err: any) {
      handleApiError(err)
      // someone else changed this invoice at the same time → load the latest figures
      if (err?.response?.status === 409) useAdminStore.getState().fetchInvoices()
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400 bg-white'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#0D0700] to-[#241300]">
          <h2 className="font-bold text-[#C9A84C] flex items-center gap-2"><Wallet size={18} />Record Payment</h2>
          <button onClick={onClose} className="text-[#C9A84C]/70 hover:text-[#C9A84C]"><X size={18} /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <div className="text-sm text-gray-500 mb-3"><span className="font-mono font-semibold text-[#C9A84C]">{invoice.id}</span> · {invoice.customer}</div>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-gray-50 rounded-xl py-2"><div className="text-[10px] uppercase text-gray-500">Total</div><div className="text-sm font-bold">{rs(invoice.total)}</div></div>
            <div className="bg-emerald-50 rounded-xl py-2"><div className="text-[10px] uppercase text-emerald-600">Paid</div><div className="text-sm font-bold text-emerald-700">{rs(paid)}</div></div>
            <div className="bg-red-50 rounded-xl py-2"><div className="text-[10px] uppercase text-red-500">Balance</div><div className="text-sm font-bold text-red-600">{rs(balance)}</div></div>
          </div>

          <PaymentHistory invoice={invoice} />

          {balance <= 0 ? (
            <div className="text-center text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl py-3">This invoice is fully paid.</div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">Amount received (₹) *</label>
                  <button type="button" onClick={() => setAmount(String(balance))} className="text-xs font-semibold text-teal-700 hover:underline">Pay full balance {rs(balance)}</button>
                </div>
                <input inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} className={inputCls} placeholder="Enter amount received" />
                {n > balance && <div className="text-xs text-red-600 mt-1">Cannot be more than the balance due ({rs(balance)})</div>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Payment mode</label>
                  <select value={mode} onChange={e => setMode(e.target.value)} className={inputCls + ' cursor-pointer'}>
                    {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date received</label>
                  <input type="date" value={date} max={todayISO()} onChange={e => setDate(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Note (optional)</label>
                <input value={notes} maxLength={200} onChange={e => setNotes(e.target.value)} className={inputCls} placeholder="e.g. UPI ref no., cheque no." />
              </div>
              {n > 0 && n <= balance && (
                <div className={`text-xs rounded-xl px-3 py-2 ${after === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {after === 0 ? 'After this payment the invoice will be fully paid.' : `After this payment ${rs(after)} will still be due.`}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-100 bg-white">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium">Close</button>
          {balance > 0 && (
            <button onClick={submit} disabled={!valid || saving} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-3 text-sm font-semibold hover:bg-[#1a0e00] disabled:opacity-40 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Save Payment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
EOF_MODAL_PAY_7Q

echo ""
echo "Done - partial payment workflow added (old files saved as *.bak)."
echo "  1) Backend: restart/redeploy it (new payment API)."
echo "  2) Frontend: npm run dev / rebuild + redeploy."
