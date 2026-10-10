// ─────────────────────────────────────────────────────────────────────────
// Single source of truth for ALL invoice maths.
//
// Every screen (billing table, preview, PDF/print, WhatsApp image, admin
// dashboard) and the create-invoice form call these functions, so the same
// invoice can never show two different totals.  The backend keeps an
// identical copy in backend/src/utils/invoiceCalc.ts — if you ever change a
// rule here, change it there too.
//
// Rules (all amounts are whole rupees):
//   line base      = round(netWeight × rate per gram)
//   making amount  = round(line base × making% / 100)       (making is a %)
//   extra charges  = round(additional / stone price)
//   line subtotal  = base + making + extra
//   subtotal       = Σ line subtotals
//   GST (3%)       = round(subtotal × 3%)   → CGST = round(GST/2), SGST = rest
//   total          = max(subtotal + GST − discount, 0)
//   balance due    = max(total − amount paid, 0)
//   "Less URD" is display-only and is NEVER used in any calculation.
// ─────────────────────────────────────────────────────────────────────────

export type NumLike = number | string | null | undefined

// Tolerant number parser: accepts "3.5", "3.", "1,200", 7, '' and undefined.
export const num = (v: NumLike): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

// Whole-rupee rounding that is immune to floating point noise (e.g. 1.005).
export const rupee = (n: number): number => Math.round(n + 1e-9)

export interface CalcItem {
  netWeight: NumLike
  goldRate: NumLike
  makingCharges: NumLike
  price: NumLike
}

export const calcLine = (item: CalcItem) => {
  const base = rupee(num(item.netWeight) * num(item.goldRate))
  const making = rupee((base * num(item.makingCharges)) / 100)
  const extra = rupee(num(item.price))
  return { base, making, extra, subtotal: base + making + extra }
}

export const calcInvoice = (
  items: CalcItem[],
  discount: NumLike = 0,
  amountPaid: NumLike = 0
) => {
  const lines = items.map(calcLine)
  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0)
  const gst = rupee(subtotal * 0.03)
  const cgst = rupee(gst / 2)
  const sgst = gst - cgst
  const disc = rupee(num(discount))
  const total = Math.max(subtotal + gst - disc, 0)
  const paid = rupee(num(amountPaid))
  const balanceDue = Math.max(total - paid, 0)
  return { lines, subtotal, gst, cgst, sgst, discount: disc, total, amountPaid: paid, balanceDue }
}

// True when the items carry enough data (weight AND rate) to be re-calculated.
// Used for old/legacy invoices: if it is false we keep whatever totals were
// stored instead of recalculating to a wrong ₹0.
export const isCalculable = (items?: CalcItem[]): boolean =>
  !!items && items.length > 0 && items.some(i => num(i.netWeight) > 0 && num(i.goldRate) > 0)

// One-line summary of a multi-item invoice for the invoices table, so the
// table never shows only "item 1" for an invoice that has several items.
export const summarizeItems = (
  items: Array<CalcItem & { purity?: string; huid?: string }>
) => {
  const uniq = <T,>(arr: T[]) => Array.from(new Set(arr))
  const uniqText = (arr: string[]) => uniq(arr.map(s => s.trim()).filter(s => s !== ''))
  const rates = uniq(items.map(i => num(i.goldRate)).filter(r => r > 0))
  const makings = uniq(items.map(i => num(i.makingCharges)))
  return {
    totalWeight: Math.round(items.reduce((s, i) => s + num(i.netWeight), 0) * 1000) / 1000,
    extraTotal: items.reduce((s, i) => s + rupee(num(i.price)), 0),
    purities: uniqText(items.map(i => i.purity || '')),
    huids: uniqText(items.map(i => i.huid || '')),
    rate: rates.length === 1 ? rates[0] : rates.length > 1 ? ('varies' as const) : 0,
    making: makings.length === 1 ? makings[0] : makings.length > 1 ? ('varies' as const) : 0,
  }
}

// Only letters/digits/dash for HUID; always stored upper-case.
export const cleanHuid = (v: string): string =>
  v.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)

// Lets a text input accept decimals while typing ("3." and "3.5" stay intact).
export const cleanDecimal = (v: string): string =>
  v.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1')
