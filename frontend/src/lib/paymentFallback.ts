// ─────────────────────────────────────────────────────────────────────────
// Safety net for the Record Payment window.
//
// The new server route  POST /api/invoices/:id/payments  only exists once the
// UPDATED backend is deployed. If the live server is still an older build, that
// route answers 404 - and then the payment must NOT be lost: we save it through
// the older endpoint that every backend version has  (PUT /api/invoices/:id).
// ─────────────────────────────────────────────────────────────────────────

// A 404/405 that is NOT "Invoice not found" means "this server has no payment route".
export const isPaymentRouteMissing = (err: any): boolean => {
  const status = err?.response?.status
  if (status !== 404 && status !== 405) return false
  const msg = String(err?.response?.data?.message || '')
  return !/invoice not found/i.test(msg)
}

export const buildLegacyPaymentBody = (p: {
  total: number        // invoice total (recalculated)
  paidBefore: number   // amount already paid
  amount: number       // this payment
  mode: string
  notes: string
  date: string         // YYYY-MM-DD chosen in the window
  today: string        // YYYY-MM-DD
  status: string       // current invoice status
}) => {
  const amountPaid = p.paidBefore + p.amount
  const balanceDue = Math.max(p.total - amountPaid, 0)
  // the older server always stamps "today" on the payment, so keep a back-dated date in the note
  const noteParts = [p.notes.trim(), p.date && p.date !== p.today ? `received ${p.date}` : ''].filter(Boolean)
  return {
    amountPaid,
    balanceDue,
    paymentMode: p.mode,
    paymentNotes: noteParts.join(' · ') || 'Additional payment',
    // keep pending/overdue/draft as it was; the server marks it paid itself when the balance reaches 0
    ...(balanceDue > 0 && p.status !== 'paid' ? { status: p.status } : {}),
  }
}
