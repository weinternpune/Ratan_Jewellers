// ─────────────────────────────────────────────────────────────────────────
// Invoice maths — MUST stay identical to frontend/src/lib/invoiceCalc.ts
// so the amounts stored in the database are exactly what the bill shows.
//
//   line base      = round(netWeight × rate per gram)
//   making amount  = round(line base × making% / 100)      (making is a %)
//   extra charges  = round(stoneCharges)
//   subtotal       = Σ (base + making + extra) × quantity
//   GST (3%)       = round(subtotal × 3%)  → CGST = round(GST/2), SGST = rest
//   total          = max(subtotal + GST − discount − old gold exchange, 0)
// ─────────────────────────────────────────────────────────────────────────

const toNum = (v: any): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export const rupee = (n: number): number => Math.round(n + 1e-9);

export interface InvoiceTotals {
  subtotal: number;
  cgst: number;
  sgst: number;
  gst: number;
  discount: number;
  oldGoldExchange: number;
  totalAmount: number;
}

// Per-line amounts (also returned so each stored item carries correct values)
export const calcItem = (item: any) => {
  const quantity = toNum(item.quantity) || 1;
  const base = rupee(toNum(item.netWeight) * toNum(item.goldRate));
  const makingAmount = rupee((base * toNum(item.makingCharges)) / 100);
  const stone = rupee(toNum(item.stoneCharges));
  const unitPrice = base + makingAmount + stone;
  const lineBase = unitPrice * quantity;
  const cgstAmount = rupee((lineBase * (item.cgstRate ?? 1.5)) / 100);
  const sgstAmount = rupee((lineBase * (item.sgstRate ?? 1.5)) / 100);
  return { quantity, unitPrice, makingAmount, lineBase, cgstAmount, sgstAmount, totalAmount: lineBase + cgstAmount + sgstAmount };
};

export const calcInvoiceTotals = (items: any[], discountAmount: any = 0, oldGoldExchange: any = 0): InvoiceTotals => {
  const subtotal = (items || []).reduce((s, it) => s + calcItem(it).lineBase, 0);
  const gst = rupee(subtotal * 0.03);
  const cgst = rupee(gst / 2);
  const sgst = gst - cgst;
  const discount = rupee(toNum(discountAmount));
  const old = rupee(toNum(oldGoldExchange));
  const totalAmount = Math.max(subtotal + gst - discount - old, 0);
  return { subtotal, cgst, sgst, gst, discount, oldGoldExchange: old, totalAmount };
};

// An invoice can only be re-calculated when its items carry weight AND rate.
// (Otherwise we leave the stored numbers alone instead of turning them to 0.)
export const isCalculable = (items: any[] | undefined): boolean =>
  Array.isArray(items) && items.length > 0 && items.some(i => toNum(i.netWeight) > 0 && toNum(i.goldRate) > 0);
