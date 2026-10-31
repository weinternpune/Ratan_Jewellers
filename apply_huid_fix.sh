#!/bin/bash
set -e
if [ ! -d "frontend/src/store" ]; then
  echo "ERROR: run this from your project root (the folder that contains frontend/ and backend/)"
  exit 1
fi
python3 - <<'PYEOF'
import re, sys, os
STORE = 'frontend/src/store/adminStore.ts'
BILL  = 'frontend/src/app/admin/billing/page.tsx'
NEW   = 'frontend/src/lib/invoiceNotes.ts'

for p in (STORE, BILL):
    if not os.path.isfile(p):
        print(f"ERROR: {p} not found - run this from your project root (folder with frontend/ and backend/)."); sys.exit(1)

def rd(p): return open(p, encoding='utf-8').read()
def once(s, old, new, label):
    if s.count(old) != 1: raise ValueError(f"{label}: expected line not found exactly once ({s.count(old)} found)")
    return s.replace(old, new)

out, problems = {}, []

# ---------- store: save + read HUID through notes ----------
s = rd(STORE)
if 'invoiceNotes' not in s:
    try:
        s = once(s, "import { invoiceApi, orderApi, customerApi, adminApi, handleApiError } from '@/lib/billingApi'",
                    "import { invoiceApi, orderApi, customerApi, adminApi, handleApiError } from '@/lib/billingApi'\nimport { buildInvoiceNotes, parseHuidsFromNotes } from '@/lib/invoiceNotes'", 'store import')
        s = once(s, "notes: invData.lessURD ? `Less URD: ${invData.lessURD}` : ''",
                    "notes: buildInvoiceNotes((invData.items || []).map((i: any) => i.huid || ''), invData.lessURD)", 'store save notes')
        s = once(s, "const parsedItems: InvoiceLineItem[] = (invoice.items || []).map((it: any) => {",
                    "const huidsFromNotes = parseHuidsFromNotes(invoice.notes)\n      const parsedItems: InvoiceLineItem[] = (invoice.items || []).map((it: any, idx: number) => {", 'store read items')
        s = once(s, "huid: it.huid || '',", "huid: it.huid || huidsFromNotes[idx] || '',", 'store read huid')
        out[STORE] = s
    except ValueError as e: problems.append(str(e))

# ---------- billing table: Discount column ----------
s = rd(BILL)
if "'Discount'" not in s:
    try:
        s = once(s, "'Amount','GST (3%)','Total'", "'Amount','GST (3%)','Discount','Total'", 'table header')
        gst = """<td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">₹{inv.gst.toLocaleString('en-IN')}</td>"""
        disc = gst + """
                    <td className={`px-5 py-4 text-xs whitespace-nowrap ${(inv.discount||0)>0?'text-red-600 font-medium':'text-gray-400'}`}>{(inv.discount||0)>0?`−₹${(inv.discount||0).toLocaleString('en-IN')}`:'₹0'}</td>"""
        s = once(s, gst, disc, 'table cell')
        # keep an empty-state row spanning the whole table (+1 column)
        s = re.sub(r'colSpan=\{(\d+)\}', lambda m: 'colSpan={%d}' % (int(m.group(1)) + 1) if int(m.group(1)) >= 15 else m.group(0), s)
        out[BILL] = s
    except ValueError as e: problems.append(str(e))

if problems:
    print("NOTHING WAS CHANGED. These lines were not found in your files:")
    for p in problems: print("  -", p)
    sys.exit(1)

for path, content in out.items():
    open(path + '.bak', 'w', encoding='utf-8').write(rd(path))
    open(path, 'w', encoding='utf-8').write(content)
print("Edited:", ", ".join(out) if out else "(already applied)")
PYEOF
mkdir -p frontend/src/lib
cat > frontend/src/lib/invoiceNotes.ts <<'EOF_NOTES_H7'
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
EOF_NOTES_H7
echo "Done - HUID is now saved permanently with the invoice, and the billing table shows Discount."
echo "Rebuild/redeploy the FRONTEND. (Backend needs no change for this.)"
