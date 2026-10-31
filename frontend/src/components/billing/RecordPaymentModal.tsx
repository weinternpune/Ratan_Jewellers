'use client'
import { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/billingApi'
import { useAdminStore, Invoice, InvoiceStatus } from '@/store/adminStore'
import { isPaymentRouteMissing, buildLegacyPaymentBody } from '@/lib/paymentFallback'

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
      // always build on the newest copy in the store, not the (possibly older) one this window was opened with
      const latest = useAdminStore.getState().invoices.find(i => i.id === invoice.id) || invoice
      let u: any
      try {
        const res = await api.post<any>(`/invoices/${encodeURIComponent(invoice.id)}/payments`, { amount: n, mode, date, notes: notes.trim() })
        u = res.data
      } catch (err: any) {
        // The live server does not have the new payment route yet -> save through the older update route instead.
        if (!isPaymentRouteMissing(err)) throw err
        u = await api.put<any>(
          `/invoices/${encodeURIComponent(invoice.id)}`,
          buildLegacyPaymentBody({
            total: latest.total, paidBefore: latest.amountPaid || 0, amount: n, mode, notes, date, today: todayISO(), status: latest.status,
          })
        )
      }
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
