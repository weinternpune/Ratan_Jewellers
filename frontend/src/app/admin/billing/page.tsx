'use client'
import { useState } from 'react'
import { Search, Plus, Download, Eye, Receipt, CheckCircle2, Clock, AlertCircle, X, Send, Printer, MessageCircle } from 'lucide-react'
import { useAdminStore, Invoice, InvoiceStatus } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const statusConfig: Record<InvoiceStatus,{label:string;color:string}> = {
  paid:{label:'Paid',color:'bg-green-50 text-green-600'},
  pending:{label:'Pending',color:'bg-amber-50 text-amber-600'},
  overdue:{label:'Overdue',color:'bg-red-50 text-red-600'},
  draft:{label:'Draft',color:'bg-gray-100 text-gray-500'},
}

const emptyInv = { order:'', customer:'', email:'', gstin:'', amount:0, gst:0, total:0, status:'draft' as InvoiceStatus, date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), due:'—' }

export default function BillingPage() {
  const { invoices, orders, addInvoice, updateInvoiceStatus, sendInvoiceEmail, exportInvoicePDF } = useAdminStore()
  const { getEffectiveRole } = useAuthStore()
  const role = getEffectiveRole()
  // Permissions: 'full' = create+edit+delete+share, 'create' = create+share own, 'own_only' = view own only
  const canCreate = ['sales_staff','store_manager','admin','super_admin'].includes(role)
  const canFull   = ['store_manager','admin','super_admin'].includes(role)
  const canShare  = ['sales_staff','store_manager','admin','super_admin'].includes(role)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus|'all'>('all')
  const [previewInvoice, setPreviewInvoice] = useState<Invoice|null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(emptyInv)

  const filtered = invoices.filter(inv =>
    (statusFilter==='all'||inv.status===statusFilter) &&
    (inv.id.toLowerCase().includes(search.toLowerCase())||inv.customer.toLowerCase().includes(search.toLowerCase()))
  )

  const totals = {
    paid: invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.total,0),
    pending: invoices.filter(i=>i.status==='pending').reduce((a,i)=>a+i.total,0),
    overdue: invoices.filter(i=>i.status==='overdue').reduce((a,i)=>a+i.total,0),
    totalGST: invoices.reduce((a,i)=>a+i.gst,0),
  }


  const shareInvoiceWhatsApp = (inv: Invoice) => {
    const msg = encodeURIComponent(
      `Dear ${inv.customer},\n\nYour invoice *${inv.id}* from Ratan Jewellers is ready.\n\n` +
      `Amount: ₹${inv.amount.toLocaleString('en-IN')}\n` +
      `GST (3%): ₹${inv.gst.toLocaleString('en-IN')}\n` +
      `*Total: ₹${inv.total.toLocaleString('en-IN')}*\n\n` +
      `Status: ${inv.status.toUpperCase()}\nDate: ${inv.date}\n\n` +
      'For any queries, contact us at +91 98765 43210.\nThank you for shopping with Ratan Jewellers!'
    )
    // Try to find customer phone from customers list
    window.open('https://wa.me/?text=' + msg, '_blank')
    toast.success('Invoice shared on WhatsApp')
  }

  const handleAmountChange = (val: number) => {
    const gst = Math.round(val * 0.03)
    setForm(p=>({...p, amount:val, gst, total:val+gst}))
  }

  const handleSubmit = () => {
    if (!form.customer.trim()) { toast.error('Customer name required'); return }
    if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return }
    addInvoice(form)
    setShowCreate(false)
    setForm(emptyInv)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Billing & Invoices</h1><p className="text-sm text-gray-500 mt-0.5">GST invoices, billing history & payment tracking</p></div>
        {canCreate && <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Plus size={15}/>Create Invoice</button>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><CheckCircle2 size={14} className="text-green-500"/><span className="text-xs text-gray-500">Paid</span></div><div className="text-lg font-bold text-green-600">₹{(totals.paid/100000).toFixed(1)}L</div><div className="text-xs text-gray-400">{invoices.filter(i=>i.status==='paid').length} invoices</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Clock size={14} className="text-amber-500"/><span className="text-xs text-gray-500">Pending</span></div><div className="text-lg font-bold text-amber-600">₹{(totals.pending/100000).toFixed(1)}L</div><div className="text-xs text-gray-400">{invoices.filter(i=>i.status==='pending').length} invoices</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><AlertCircle size={14} className="text-red-500"/><span className="text-xs text-gray-500">Overdue</span></div><div className="text-lg font-bold text-red-600">₹{(totals.overdue/1000).toFixed(0)}K</div><div className="text-xs text-gray-400">{invoices.filter(i=>i.status==='overdue').length} invoices</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Receipt size={14} className="text-blue-500"/><span className="text-xs text-gray-500">GST Collected</span></div><div className="text-lg font-bold text-blue-600">₹{(totals.totalGST/1000).toFixed(1)}K</div><div className="text-xs text-gray-400">This month</div></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5"><Search size={14} className="text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoices..." className="flex-1 text-sm outline-none placeholder-gray-400 text-gray-700"/></div>
        <div className="flex gap-2 flex-wrap">
          {(['all','paid','pending','overdue','draft'] as const).map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${statusFilter===s?'bg-[#0D0700] text-[#C9A84C]':'bg-white border border-gray-200 text-gray-600'}`}>{s==='all'?'All':s}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Invoice #','Order','Customer','Amount','GST (3%)','Total','Date','Due','Status','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(inv=>{
                const cfg=statusConfig[inv.status]
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[#C9A84C]">{inv.id}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{inv.order||'—'}</td>
                    <td className="px-5 py-4"><div className="font-medium text-gray-900">{inv.customer}</div>{inv.gstin&&<div className="text-[10px] font-mono text-gray-400">{inv.gstin}</div>}</td>
                    <td className="px-5 py-4 text-gray-700">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs">₹{inv.gst.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">₹{inv.total.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.date}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.due}</td>
                    <td className="px-5 py-4">
                      {canFull ? (
                        <select value={inv.status} onChange={e=>updateInvoiceStatus(inv.id,e.target.value as InvoiceStatus)} className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${cfg.color}`}>
                          {(Object.keys(statusConfig) as InvoiceStatus[]).map(s=><option key={s} value={s}>{statusConfig[s].label}</option>)}
                        </select>
                      ) : (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      )}
                    </td>
                    <td className="px-5 py-4"><div className="flex gap-1">
                      <button onClick={()=>setPreviewInvoice(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800" title="Preview"><Eye size={13}/></button>
                      {canShare && <button onClick={()=>sendInvoiceEmail(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600" title="Send Email"><Send size={13}/></button>}
                      {canShare && <button onClick={()=>shareInvoiceWhatsApp(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-600" title="Share via WhatsApp"><MessageCircle size={13}/></button>}
                      {canFull && <button onClick={()=>exportInvoicePDF(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800" title="Download PDF"><Download size={13}/></button>}
                      {canFull && <button onClick={()=>exportInvoicePDF(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800" title="Print"><Printer size={13}/></button>}
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">Showing {filtered.length} of {invoices.length} invoices</div>
      </div>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Invoice Preview</h2>
              <button onClick={()=>setPreviewInvoice(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div><div className="text-lg font-bold text-[#0D0700]">RATAN JEWELLERS</div><div className="text-xs text-gray-500">123 Gold Market, Bhubaneswar, Odisha</div><div className="text-xs text-gray-500">GSTIN: 21AAAAA0000A1Z5</div></div>
                <div className="text-right"><div className="text-[#C9A84C] font-mono font-bold text-base">{previewInvoice.id}</div><div className="text-xs text-gray-500">{previewInvoice.date}</div><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[previewInvoice.status].color}`}>{statusConfig[previewInvoice.status].label}</span></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Bill To</div>
                <div className="font-semibold text-gray-900">{previewInvoice.customer}</div>
                {previewInvoice.gstin&&<div className="text-xs text-gray-500 font-mono">GSTIN: {previewInvoice.gstin}</div>}
                {previewInvoice.email&&<div className="text-xs text-gray-500">{previewInvoice.email}</div>}
              </div>
              <table className="w-full text-sm mb-6">
                <thead className="border-b border-gray-200"><tr className="text-xs text-gray-500"><th className="text-left pb-2">Description</th><th className="text-right pb-2">Amount</th></tr></thead>
                <tbody>
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-700">Jewellery Purchase{previewInvoice.order?` (${previewInvoice.order})`:''}</td><td className="py-3 text-right text-gray-900">₹{previewInvoice.amount.toLocaleString('en-IN')}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-500 text-xs">CGST @ 1.5%</td><td className="py-3 text-right text-gray-600 text-xs">₹{(previewInvoice.gst/2).toLocaleString('en-IN')}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-500 text-xs">SGST @ 1.5%</td><td className="py-3 text-right text-gray-600 text-xs">₹{(previewInvoice.gst/2).toLocaleString('en-IN')}</td></tr>
                </tbody>
                <tfoot><tr><td className="pt-3 font-bold text-gray-900">Total</td><td className="pt-3 text-right font-bold text-gray-900 text-base">₹{previewInvoice.total.toLocaleString('en-IN')}</td></tr></tfoot>
              </table>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {canShare && <button onClick={()=>sendInvoiceEmail(previewInvoice.id)} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs text-gray-600 hover:bg-gray-50"><Send size={13}/>Send Email</button>}
                  {canShare && <button onClick={()=>shareInvoiceWhatsApp(previewInvoice)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-green-600"><MessageCircle size={13}/>WhatsApp</button>}
                </div>
                {canFull && <button onClick={()=>exportInvoicePDF(previewInvoice.id)} className="w-full flex items-center justify-center gap-1.5 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]"><Download size={13}/>Export PDF / Print</button>}
                {!canShare && !canFull && <p className="text-xs text-center text-gray-400">You have view-only access to this invoice.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Create Invoice</h2>
              <button onClick={()=>setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Link to Order (optional)</label>
                <select value={form.order} onChange={e=>{
                  const order=orders.find(o=>o.id===e.target.value)
                  if(order){const gst=Math.round(order.total*0.03);setForm(p=>({...p,order:order.id,customer:order.customer,email:order.email,amount:order.total,gst,total:order.total+gst}))}
                  else setForm(p=>({...p,order:e.target.value}))
                }} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  <option value="">— No linked order —</option>
                  {orders.map(o=><option key={o.id} value={o.id}>{o.id} — {o.customer}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Customer Name *</label><input value={form.customer} onChange={e=>setForm(p=>({...p,customer:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="Customer name"/></div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email</label><input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="customer@email.com"/></div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">GSTIN (optional)</label><input value={form.gstin} onChange={e=>setForm(p=>({...p,gstin:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] font-mono" placeholder="27AABCU9603R1ZX"/></div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (₹) *</label><input type="number" value={form.amount||''} onChange={e=>handleAmountChange(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="Amount before GST"/></div>
              <div className="bg-amber-50 rounded-xl p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">GST (3%)</span><span className="font-semibold">₹{form.gst.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>₹{form.total.toLocaleString('en-IN')}</span></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as InvoiceStatus}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  {(Object.keys(statusConfig) as InvoiceStatus[]).map(s=><option key={s} value={s}>{statusConfig[s].label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowCreate(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">Create Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
