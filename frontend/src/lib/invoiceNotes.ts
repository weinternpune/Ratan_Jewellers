// ─────────────────────────────────────────────────────────────────────────
// Keeps each item's HUID (and the display-only "Less URD") inside the invoice's
// `notes` text, which the server ALWAYS saves and returns. So a HUID can never
// disappear after a refresh - even if the server's item schema has no HUID field.
//
// Layout:  "HUID: A1B2C3|D4E5F6; Less URD: 500"     (one HUID per item, in item order; empty = none)
// ─────────────────────────────────────────────────────────────────────────

export const buildInvoiceNotes = (huids: string[], lessURD?: number): string => {
  const clean = huids.map(h => (h || '').replace(/[;|]/g, '').trim())
  const parts: string[] = []
  if (clean.some(h => h !== '')) parts.push(`HUID: ${clean.join('|')}`)
  if (lessURD && lessURD > 0) parts.push(`Less URD: ${lessURD}`)
  return parts.join('; ')
}

export const parseHuidsFromNotes = (notes?: string): string[] => {
  const m = (notes || '').match(/HUID:\s*([^;]*)/)
  return m ? m[1].split('|').map(x => x.trim()) : []
}
