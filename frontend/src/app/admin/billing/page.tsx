'use client'
import { useState, useEffect } from 'react'
import { Search, Plus, Download, Eye, Receipt, CheckCircle2, Clock, AlertCircle, X, Send, Printer, MessageCircle, Trash2, ShieldCheck, User, Gem, Wallet, Mail } from 'lucide-react'
import { useAdminStore, Invoice, InvoiceStatus } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const statusConfig: Record<InvoiceStatus,{label:string;color:string}> = {
  paid:{label:'Paid',color:'bg-green-50 text-green-600'},
  pending:{label:'Pending',color:'bg-amber-50 text-amber-600'},
  overdue:{label:'Overdue',color:'bg-red-50 text-red-600'},
  draft:{label:'Draft',color:'bg-gray-100 text-gray-500'},
}

const emptyInv = { 
  customer:'', phone:'', email:'',
  category:'', metal:'', purity:'', hallmarkId:'', netWeight:'', price:0, goldRate:6520, makingCharges:0, discount:0,
  amount:0, gst:0, cgst:0, sgst:0, total:0, amountPaid:0, balanceDue:0, status:'paid' as InvoiceStatus, 
  date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), due:'—' 
}

export default function BillingPage() {
  const { invoices, orders, addInvoice, updateInvoiceStatus, sendInvoiceEmail, exportInvoicePDF, clearAllBillingData, deleteInvoice, fetchInvoices, fetchOrders, fetchCustomers, loading } = useAdminStore()
  const { getEffectiveRole } = useAuthStore()
  const role = getEffectiveRole()
  const canCreate = ['sales_staff','store_manager','admin','super_admin'].includes(role)
  const canFull   = ['store_manager','admin','super_admin'].includes(role)
  const canShare  = ['sales_staff','store_manager','admin','super_admin'].includes(role)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus|'all'>('all')
  const [previewInvoice, setPreviewInvoice] = useState<Invoice|null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string|null>(null)
  const [deletingInvoice, setDeletingInvoice] = useState(false)
  const [emailTarget, setEmailTarget] = useState<Invoice|null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [form, setForm] = useState(emptyInv)

  useEffect(() => {
    fetchInvoices()
    fetchOrders()
    fetchCustomers()
  }, [])

  const filtered = invoices.filter(inv => {
    const statusMatch = statusFilter==='all' || inv.status===statusFilter
    const searchMatch = search === '' || 
      inv.id?.toLowerCase().includes(search.toLowerCase()) || 
      inv.customer?.toLowerCase().includes(search.toLowerCase()) ||
      inv.phone?.toLowerCase().includes(search.toLowerCase()) ||
      inv.hallmarkId?.toLowerCase().includes(search.toLowerCase())
    return statusMatch && searchMatch
  })

  const totals = {
    paid: invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.total,0),
    pending: invoices.filter(i=>i.status==='pending').reduce((a,i)=>a+i.total,0),
    overdue: invoices.filter(i=>i.status==='overdue').reduce((a,i)=>a+i.total,0),
    totalGST: invoices.reduce((a,i)=>a+i.gst,0),
  }

  // Renders an off-screen, print-styled copy of the invoice, rasterizes it
  // with html2canvas, and wraps that image in a real single-page PDF —
  // so what downloads is an actual invoice.pdf, not just a picture.
  const buildInvoiceImage = async (inv: Invoice): Promise<Blob> => {
    // Recompute here explicitly rather than trusting inv.amount/inv.gst/
    // inv.total blindly — making charges are folded into the subtotal
    // BEFORE GST, matching the same fix applied to the create-invoice form.
    const netWeight = parseFloat(inv.netWeight || '0') || 0
    const goldRate = inv.goldRate || 0
    const makingChargesPct = inv.makingCharges || 0
    const lineBase = Math.round(netWeight * goldRate)
    const makingAmt = Math.round((lineBase * makingChargesPct) / 100)
    const additional = inv.price || 0
    const subtotal = (netWeight && goldRate) ? (lineBase + makingAmt + additional) : (inv.amount || 0)
    const gst = Math.round(subtotal * 0.03)
    const cgst = Math.round(gst / 2)
    const sgst = gst - cgst
    const discount = inv.discount || 0
    const total = Math.max(subtotal + gst - discount, 0)

    const paid = inv.amountPaid || 0
    const balance = inv.balanceDue ?? Math.max(total - paid, 0)

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '-99999px'
    container.style.left = '-99999px'
    container.style.width = '520px'
    container.style.boxSizing = 'border-box'
    container.style.background = '#ffffff'
    container.style.padding = '28px'
    container.style.fontFamily = 'Arial, Helvetica, sans-serif'
    container.style.color = '#111827'
    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div>
          <div style="font-size:18px;font-weight:800;color:#0D0700;">RATAN JEWELLERS</div>
          <div style="font-size:11px;color:#6b7280;">Shop No 1: Tidke Complex, Arjuni</div>
          <div style="font-size:11px;color:#6b7280;">Shop No 2: Main Bus Stop, Paraswada</div>
          <div style="font-size:11px;color:#6b7280;">GSTIN: 27AESPU9905N1ZA</div>
          <div style="font-size:11px;color:#6b7280;">BIS License No: HM/C-7490069821</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:15px;font-weight:800;color:#C9A84C;font-family:monospace;">${inv.id}</div>
          <div style="font-size:11px;color:#6b7280;">${inv.date}</div>
          <div style="font-size:11px;font-weight:700;color:#059669;text-transform:uppercase;">${inv.status}</div>
        </div>
      </div>
      <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;padding:12px;margin-bottom:16px;">
        <div style="font-size:10px;font-weight:700;color:#93c5fd;text-transform:uppercase;margin-bottom:4px;">Bill To</div>
        <div style="font-size:14px;font-weight:700;">${inv.customer}</div>
        ${inv.phone ? `<div style="font-size:11px;color:#6b7280;">Phone: ${inv.phone}</div>` : ''}
      </div>
      ${inv.hallmarkId ? `<div style="background:#eef2ff;border:1px solid #e0e7ff;border-radius:10px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#4338ca;font-weight:700;">BIS Hallmark: ${inv.hallmarkId}</div>` : ''}
      <div style="font-size:10px;color:#555;line-height:1.5;margin-bottom:12px;"><strong>NOTE:</strong><br>916 EXCHANGE 100% 916 RETURNS 916<br>750 EXCHANGE 100% 750 RETURNS 750<br>833 EXCHANGE 100% 833 RETURNS 833</div>
      <table style="width:100%;font-size:11px;border-collapse:collapse;margin-bottom:16px;">
        <tr style="background:#fefce8;">
          <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;">Particulars</th>
          <th style="border:1px solid #e5e7eb;padding:6px;">Purity</th>
          <th style="border:1px solid #e5e7eb;padding:6px;">Net Wt</th>
          <th style="border:1px solid #e5e7eb;padding:6px;">Rate/gm</th>
          <th style="border:1px solid #e5e7eb;padding:6px;">Making</th>
          <th style="border:1px solid #e5e7eb;padding:6px;">Taxable Amt</th>
        </tr>
        <tr>
          <td style="border:1px solid #e5e7eb;padding:6px;">${inv.category || 'Jewellery Item'}${inv.metal ? ` (${inv.metal})` : ''}</td>
          <td style="border:1px solid #e5e7eb;padding:6px;text-align:center;">${inv.purity || '—'}</td>
          <td style="border:1px solid #e5e7eb;padding:6px;text-align:right;">${netWeight || '—'}g</td>
          <td style="border:1px solid #e5e7eb;padding:6px;text-align:right;">${goldRate ? `₹${goldRate.toLocaleString('en-IN')}` : '—'}</td>
          <td style="border:1px solid #e5e7eb;padding:6px;text-align:right;">${makingChargesPct ? `${makingChargesPct}%` : '—'}</td>
          <td style="border:1px solid #e5e7eb;padding:6px;text-align:right;font-weight:700;">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
      </table>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:16px;">
        <tr style="border-top:1px solid #f3f4f6;"><td style="padding-top:8px;font-size:11px;color:#6b7280;">CGST @ 1.5%</td><td style="padding-top:8px;text-align:right;font-size:11px;color:#6b7280;">₹${cgst.toLocaleString('en-IN')}</td></tr>
        <tr><td style="font-size:11px;color:#6b7280;">SGST @ 1.5%</td><td style="text-align:right;font-size:11px;color:#6b7280;">₹${sgst.toLocaleString('en-IN')}</td></tr>
        ${discount > 0 ? `<tr><td style="font-size:11px;color:#dc2626;">Discount</td><td style="text-align:right;font-size:11px;color:#dc2626;">−₹${discount.toLocaleString('en-IN')}</td></tr>` : ''}
        <tr style="border-top:1px solid #e5e7eb;"><td style="padding-top:8px;font-weight:800;font-size:15px;">Grand Total</td><td style="padding-top:8px;text-align:right;font-weight:800;font-size:15px;">₹${total.toLocaleString('en-IN')}</td></tr>
      </table>
      <div style="display:flex;gap:10px;">
        <div style="flex:1;background:#ecfdf5;border:1px solid #d1fae5;border-radius:10px;padding:10px 12px;">
          <div style="font-size:10px;font-weight:700;color:#10b981;text-transform:uppercase;">Paid</div>
          <div style="font-size:14px;font-weight:800;color:#047857;">₹${paid.toLocaleString('en-IN')}</div>
        </div>
        <div style="flex:1;background:${balance>0?'#fef2f2':'#ecfdf5'};border:1px solid ${balance>0?'#fee2e2':'#d1fae5'};border-radius:10px;padding:10px 12px;">
          <div style="font-size:10px;font-weight:700;color:${balance>0?'#ef4444':'#10b981'};text-transform:uppercase;">Balance Due</div>
          <div style="font-size:14px;font-weight:800;color:${balance>0?'#b91c1c':'#047857'};">${balance>0?`₹${balance.toLocaleString('en-IN')}`:'Fully Paid'}</div>
        </div>
      </div>
    `
    document.body.appendChild(container)
    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const canvas = await html2canvas(container, { scale: 1.5, backgroundColor: '#ffffff' })
      const { jsPDF } = await import('jspdf')
      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait'
      const pdf = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)
      return pdf.output('blob')
    } finally {
      document.body.removeChild(container)
    }
  }

  const isMobileDevice = () =>
    typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const shareInvoiceWhatsApp = async (inv: Invoice) => {
    const digitsOnly = (inv.phone || '').replace(/\D/g, '')
    if (!digitsOnly) {
      toast.error('Add a phone number to this invoice before sharing on WhatsApp')
      return
    }
    const phone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly
    const caption = `Invoice ${inv.id} from Ratan Jewellers — Total ₹${inv.total.toLocaleString('en-IN')}`

    toast.loading('Preparing invoice PDF...', { id: 'wa-share' })
    try {
      const blob = await buildInvoiceImage(inv)

      if (isMobileDevice()) {
        const file = new File([blob], `invoice-${inv.id}.pdf`, { type: 'application/pdf' })
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
          try {
            toast.dismiss('wa-share')
            await navigator.share({ files: [file], title: `Invoice ${inv.id}`, text: caption })
            toast.success('Invoice PDF shared')
            return
          } catch (shareErr: any) {
            if (shareErr?.name === 'AbortError') return
          }
        }
      }

      toast.loading('Preparing invoice PDF...', { id: 'wa-share' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${inv.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(caption + '\n\n(Invoice PDF downloaded — attach it to this chat)')}`, '_blank')
      toast.success('Invoice PDF downloaded — attach it in the WhatsApp chat that just opened', { id: 'wa-share', duration: 6000 })
    } catch (error: any) {
      console.error('WhatsApp share error:', error)
      toast.error(`Could not prepare the invoice PDF: ${error?.message || 'unknown error'}`, { id: 'wa-share', duration: 6000 })
    }
  }

  const openEmailModal = (inv: Invoice) => {
    setEmailTarget(inv)
    setEmailInput(inv.email || '')
  }

  const handleSendEmail = async () => {
    const email = emailInput.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address', { id: 'send-email' })
      return
    }
    if (!emailTarget || sendingEmail) return
    setSendingEmail(true)
    toast.loading('Sending invoice...', { id: 'send-email' })
    try {
      await sendInvoiceEmail(emailTarget.id, email)
      toast.success(`Invoice ${emailTarget.id} emailed to ${email}`, { id: 'send-email' })
      setEmailTarget(null)
      setEmailInput('')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send email — check your email service configuration', { id: 'send-email' })
    } finally {
      setSendingEmail(false)
    }
  }

  // Splits GST into CGST/SGST as whole rupees that always add back up to the total GST
  const splitGST = (gst: number) => {
    const cgst = Math.round(gst / 2)
    const sgst = gst - cgst
    return { cgst, sgst }
  }

  // Recomputes amount/gst/cgst/sgst/total/balanceDue from whatever form data
  // is passed in. Called synchronously from inside setForm's updater
  // function (using the guaranteed-latest previous state), NOT via
  // setTimeout — the old version scheduled calculateAmount() via
  // setTimeout, which closed over a stale `form` snapshot from before
  // React had applied the just-typed field. That's why the last field you
  // edited (often Making Charges) never made it into the stored subtotal,
  // even though the inline "Making Charges" preview line looked correct
  // (it reads live state directly, unlike the stored subtotal).
  const computeDerived = (data: typeof emptyInv) => {
    if (data.netWeight && data.goldRate) {
      const weight = parseFloat(data.netWeight) || 0
      const rate = data.goldRate || 0
      const makingCharges = data.makingCharges || 0
      const price = data.price || 0

      const baseAmount = Math.round(weight * rate)
      const makingAmount = Math.round((baseAmount * makingCharges) / 100)
      const additionalCharges = Math.round(price)
      const subtotal = baseAmount + makingAmount + additionalCharges

      const gst = Math.round(subtotal * 0.03)
      const { cgst, sgst } = splitGST(gst)
      const discount = Math.round(data.discount || 0)
      const total = Math.max(subtotal + gst - discount, 0)
      const amountPaid = data.amountPaid || 0
      const balanceDue = Math.max(total - amountPaid, 0)
      return { ...data, amount: subtotal, gst, cgst, sgst, discount, total, balanceDue }
    } else if (data.amount > 0) {
      const amount = Math.round(data.amount)
      const gst = Math.round(amount * 0.03)
      const { cgst, sgst } = splitGST(gst)
      const discount = Math.round(data.discount || 0)
      const total = Math.max(amount + gst - discount, 0)
      const amountPaid = data.amountPaid || 0
      const balanceDue = Math.max(total - amountPaid, 0)
      return { ...data, amount, gst, cgst, sgst, discount, total, balanceDue }
    }
    return data
  }

  const handleAmountChange = (val: number) => {
    setForm(prev => computeDerived({ ...prev, amount: val }))
  }

  const handleFieldChange = (field: string, value: string | number) => {
    setForm(prev => computeDerived({ ...prev, [field]: value }))
  }

  const handlePaidAmountChange = (val: number) => {
    const amountPaid = Math.max(Math.round(val), 0)
    setForm(prev => ({ ...prev, amountPaid, balanceDue: Math.max((prev.total || 0) - amountPaid, 0) }))
  }

  const handleClearData = async () => {
    await clearAllBillingData()
    setShowClearConfirm(false)
  }

  const handleDeleteInvoice = async () => {
    if (deleteInvoiceId && !deletingInvoice) {
      try {
        setDeletingInvoice(true)
        await deleteInvoice(deleteInvoiceId)
        toast.success(`Invoice ${deleteInvoiceId} deleted successfully`)
        setDeleteInvoiceId(null)
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete invoice'
        toast.error(`Delete failed: ${errorMessage}`)
      } finally {
        setDeletingInvoice(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (!form.customer.trim()) { toast.error('Customer name required'); return }
    if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return }
    await addInvoice(form)
    setShowCreate(false)
    setForm(emptyInv)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Billing & Invoices</h1><p className="text-sm text-gray-500 mt-0.5">GST invoices, billing history & payment tracking</p></div>
        <div className="flex gap-2 flex-wrap">
          {canCreate && <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Plus size={15}/>Create Invoice</button>}
          {canFull && invoices.length > 0 && <button onClick={()=>setShowClearConfirm(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700" title="Clear all billing data globally"><X size={15}/>Clear Data</button>}
        </div>
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
        {loading.invoices ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A84C]"></div>
            <span className="ml-3 text-gray-600">Loading invoices...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Invoice #','Order','Customer','Phone','Category','Metal','Purity','Hallmark','Net Weight','Price','Gold Rate','Making Charges','Amount','GST (3%)','Total','Paid','Balance','Date','Due','Status','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
              {filtered.map(inv=>{
                const cfg=statusConfig[inv.status]
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[#C9A84C]">{inv.id}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{inv.order||'—'}</td>
                    <td className="px-5 py-4"><div className="font-medium text-gray-900">{inv.customer}</div></td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.phone||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.category||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.metal||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.purity||'—'}</td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap">{inv.hallmarkId ? <span className="inline-flex items-center gap-1 text-indigo-600 font-medium"><ShieldCheck size={12}/>{inv.hallmarkId}</span> : <span className="text-gray-400">—</span>}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.netWeight?`${inv.netWeight}g`:'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.price?`₹${inv.price.toLocaleString('en-IN')}`:'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.goldRate?`₹${inv.goldRate.toLocaleString('en-IN')}/g`:'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.makingCharges?`${inv.makingCharges}%`:'—'}</td>
                    <td className="px-5 py-4 text-gray-700 whitespace-nowrap">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">₹{inv.gst.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">₹{inv.total.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-xs text-emerald-600 font-medium whitespace-nowrap">₹{(inv.amountPaid||0).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      {(() => {
                        const balance = inv.balanceDue ?? Math.max(inv.total - (inv.amountPaid||0), 0)
                        return balance > 0
                          ? <span className="text-red-600 font-semibold">₹{balance.toLocaleString('en-IN')}</span>
                          : <span className="text-green-600 font-semibold">Paid</span>
                      })()}
                    </td>
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
                      {canShare && <button onClick={()=>openEmailModal(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600" title="Send Email"><Send size={13}/></button>}
                      {canShare && <button onClick={()=>shareInvoiceWhatsApp(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-600" title="Share via WhatsApp"><MessageCircle size={13}/></button>}
                      {canFull && <button onClick={()=>exportInvoicePDF(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800" title="Download PDF"><Download size={13}/></button>}
                      {canFull && <button onClick={()=>exportInvoicePDF(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800" title="Print"><Printer size={13}/></button>}
                      {canFull && <button onClick={()=>setDeleteInvoiceId(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600" title="Delete Invoice"><Trash2 size={13}/></button>}
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">Showing {filtered.length} of {invoices.length} invoices</div>
      </div>

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Invoice Preview</h2>
              <button onClick={()=>setPreviewInvoice(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                <div className="min-w-0 break-words"><div className="text-lg font-bold text-[#0D0700]">RATAN JEWELLERS</div><div className="text-xs text-gray-500">Shop No 1: Tidke Complex, Arjuni</div><div className="text-xs text-gray-500">Shop No 2: Main Bus Stop, Paraswada</div><div className="text-xs text-gray-500">GSTIN: 27AESPU9905N1ZA</div><div className="text-xs text-gray-500">BIS License No: HM/C-7490069821</div></div>
                <div className="min-w-0 break-words sm:text-right"><div className="text-[#C9A84C] font-mono font-bold text-base">{previewInvoice.id}</div><div className="text-xs text-gray-500">{previewInvoice.date}</div>{previewInvoice.due && previewInvoice.due !== '—' ? <div className="text-xs text-gray-400">Due: {previewInvoice.due}</div> : null}<span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[previewInvoice.status].color}`}>{statusConfig[previewInvoice.status].label}</span></div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                <div className="text-xs font-semibold text-blue-400 uppercase mb-2">Bill To</div>
                <div className="font-semibold text-gray-900">{previewInvoice.customer}</div>
                {previewInvoice.phone ? <div className="text-xs text-gray-500">Phone: {previewInvoice.phone}</div> : null}
              </div>
              {previewInvoice.hallmarkId ? (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 mb-6">
                  <ShieldCheck size={15} className="text-indigo-500"/>
                  <span className="text-xs text-indigo-500 font-semibold uppercase">BIS Hallmark</span>
                  <span className="text-sm font-mono font-bold text-indigo-700 ml-auto">{previewInvoice.hallmarkId}</span>
                </div>
              ) : null}
              <div className="text-[10px] text-gray-500 leading-relaxed mb-4 bg-gray-50 rounded-lg px-3 py-2">
                <strong>NOTE:</strong><br/>916 EXCHANGE 100% 916 RETURNS 916<br/>750 EXCHANGE 100% 750 RETURNS 750<br/>833 EXCHANGE 100% 833 RETURNS 833
              </div>
              {/* Tabulated line-item breakdown, same style as a traditional jeweller tax invoice */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs border border-gray-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="border border-gray-200 px-2 py-1.5 text-left">Particulars</th>
                      <th className="border border-gray-200 px-2 py-1.5">Purity</th>
                      <th className="border border-gray-200 px-2 py-1.5">Net Wt</th>
                      <th className="border border-gray-200 px-2 py-1.5">Rate/gm</th>
                      <th className="border border-gray-200 px-2 py-1.5">Making</th>
                      <th className="border border-gray-200 px-2 py-1.5">Taxable Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 px-2 py-1.5">{previewInvoice.category || 'Jewellery Item'}{previewInvoice.metal ? ` (${previewInvoice.metal})` : ''}</td>
                      <td className="border border-gray-200 px-2 py-1.5 text-center">{previewInvoice.purity || '—'}</td>
                      <td className="border border-gray-200 px-2 py-1.5 text-right">{previewInvoice.netWeight ? `${previewInvoice.netWeight}g` : '—'}</td>
                      <td className="border border-gray-200 px-2 py-1.5 text-right">{previewInvoice.goldRate ? `₹${previewInvoice.goldRate.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="border border-gray-200 px-2 py-1.5 text-right">{previewInvoice.makingCharges ? `${previewInvoice.makingCharges}%` : '—'}</td>
                      <td className="border border-gray-200 px-2 py-1.5 text-right font-semibold">₹{previewInvoice.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <table className="w-full text-sm mb-6">
                <tbody>
                  {(previewInvoice.price && previewInvoice.price > 0) ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Additional Charges</td><td className="py-1 text-right text-xs text-gray-500">₹{previewInvoice.price.toLocaleString('en-IN')}</td></tr> : null}
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-500 text-xs">CGST @ 1.5%</td><td className="py-3 text-right text-gray-600 text-xs">₹{(previewInvoice.cgst ?? Math.round(previewInvoice.gst/2)).toLocaleString('en-IN')}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-500 text-xs">SGST @ 1.5%</td><td className="py-3 text-right text-gray-600 text-xs">₹{(previewInvoice.sgst ?? (previewInvoice.gst - Math.round(previewInvoice.gst/2))).toLocaleString('en-IN')}</td></tr>
                  {(previewInvoice.discount && previewInvoice.discount > 0) ? <tr className="border-b border-gray-50"><td className="py-3 text-red-600 text-xs font-medium">Discount</td><td className="py-3 text-right text-red-600 text-xs font-medium">−₹{previewInvoice.discount.toLocaleString('en-IN')}</td></tr> : null}
                </tbody>
                <tfoot><tr><td className="pt-3 font-bold text-gray-900">Grand Total</td><td className="pt-3 text-right font-bold text-gray-900 text-base">₹{previewInvoice.total.toLocaleString('en-IN')}</td></tr></tfoot>
              </table>
              {(() => {
                const paid = previewInvoice.amountPaid || 0
                const balance = previewInvoice.balanceDue ?? Math.max(previewInvoice.total - paid, 0)
                return (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <div className="text-xs text-emerald-500 font-semibold uppercase mb-1">Paid Amount</div>
                      <div className="text-base font-bold text-emerald-700">₹{paid.toLocaleString('en-IN')}</div>
                    </div>
                    <div className={`rounded-xl px-4 py-3 border ${balance > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                      <div className={`text-xs font-semibold uppercase mb-1 ${balance > 0 ? 'text-red-500' : 'text-green-600'}`}>Balance Due</div>
                      <div className={`text-base font-bold ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>{balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : 'Fully Paid'}</div>
                    </div>
                  </div>
                )
              })()}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {canShare && <button onClick={()=>openEmailModal(previewInvoice)} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs text-gray-600 hover:bg-gray-50"><Send size={13}/>Send Email</button>}
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
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white bg-gradient-to-r from-[#0D0700] to-[#241300]">
              <h2 className="font-bold text-[#C9A84C] flex items-center gap-2"><Receipt size={18}/>Create Invoice</h2>
              <button onClick={()=>setShowCreate(false)} className="text-[#C9A84C]/70 hover:text-[#C9A84C]"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-6">
              
              <div className="border border-blue-100 bg-blue-50/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-1.5"><User size={14}/>Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Customer Name *</label>
                    <input value={form.customer} onChange={e=>setForm(p=>({...p,customer:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white" placeholder="Customer name"/>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Phone Number</label>
                    <input value={form.phone||''} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white" placeholder="+91 75075 10948"/>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
                    <input type="email" value={form.email||''} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white" placeholder="customer@email.com"/>
                  </div>
                </div>
              </div>

              <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/60">
                <h3 className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-1.5"><Gem size={14}/>Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                    <select value={form.category||''} onChange={e=>handleFieldChange('category', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white">
                      <option value="">Select Category</option>
                      <option value="Necklaces">Necklaces</option>
                      <option value="Rings">Rings</option>
                      <option value="Bangles">Bangles</option>
                      <option value="Earrings">Earrings</option>
                      <option value="Chains">Chains</option>
                      <option value="Mangalsutras">Mangalsutras</option>
                      <option value="Anklets">Anklets</option>
                      <option value="Bracelets">Bracelets</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Metal</label>
                    <select value={form.metal||''} onChange={e=>handleFieldChange('metal', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white">
                      <option value="">Select Metal</option>
                      <option value=" Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Purity</label>
                    <select value={form.purity||''} onChange={e=>handleFieldChange('purity', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 cursor-pointer bg-white">
                      <option value="">Select Purity</option>
                      <option value="24KT(999/995)">24KT(999/995)</option>
                      <option value="23KT(958)">23KT(958)</option>
                      <option value="22KT(916)">22KT(916)</option>
                      <option value="21KT(875)">21KT(875)</option>
                      <option value="18KT(750)">18KT(750)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block flex items-center gap-1"><ShieldCheck size={12} className="text-indigo-500"/>Hallmark Number (BIS)</label>
                    <input value={form.hallmarkId||''} onChange={e=>handleFieldChange('hallmarkId', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-white font-mono" placeholder="e.g. HUID-A1B2C3D4"/>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Net Weight (grams)</label>
                    <input value={form.netWeight||''} onChange={e=>handleFieldChange('netWeight', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-white" placeholder="10.5"/>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Gold Rate (₹/gram)</label>
                    <input value={form.goldRate||''} onChange={e=>handleFieldChange('goldRate', Number(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-white" placeholder="6520"/>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Making Charges (%)</label>
                    <input value={form.makingCharges||''} onChange={e=>handleFieldChange('makingCharges', Number(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 bg-white" placeholder="10"/>
                  </div>
                </div>
              </div>
              
              <div className="border border-emerald-100 bg-emerald-50/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-1.5"><Wallet size={14}/>Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Additional Price (₹)</label>
                    <input value={form.price||''} onChange={e=>handleFieldChange('price', Number(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white" placeholder="Stone/work charges"/>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Discount (₹)</label>
                    <input value={form.discount||''} onChange={e=>handleFieldChange('discount', Number(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 bg-white" placeholder="Deducted from grand total"/>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (₹) *</label>
                    <input value={form.amount||''} onChange={e=>handleAmountChange(Number(e.target.value)||0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-emerald-400 bg-gray-50" placeholder="Auto-calculated or manual" readOnly={form.netWeight && form.goldRate ? true : false}/>
                    <div className="text-xs text-gray-500 mt-1">
                      {form.netWeight && form.goldRate ? 
                        'Auto-calculated from weight & gold rate' : 
                        'Enter amount manually or fill weight & gold rate'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 space-y-3 border border-amber-100">
                <div className="text-xs font-semibold text-amber-700 uppercase mb-3">GST Breakdown</div>
                
                {form.netWeight && form.goldRate && (
                  <div className="bg-white rounded-lg p-3 mb-3 text-xs space-y-1">
                    <div className="font-semibold text-gray-700 mb-2">Calculation:</div>
                    <div className="flex justify-between">
                      <span>Weight × Gold Rate:</span>
                      <span>₹{((parseFloat(form.netWeight) || 0) * (form.goldRate || 0)).toLocaleString('en-IN')}</span>
                    </div>
                    {form.makingCharges > 0 && (
                      <div className="flex justify-between">
                        <span>Making Charges ({form.makingCharges}%):</span>
                        <span>₹{(((parseFloat(form.netWeight) || 0) * (form.goldRate || 0) * (form.makingCharges || 0)) / 100).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {form.price > 0 && (
                      <div className="flex justify-between">
                        <span>Additional Charges:</span>
                        <span>₹{(form.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 mt-2 flex justify-between font-semibold">
                      <span>Subtotal:</span>
                      <span>₹{form.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CGST (1.5%)</span>
                    <span className="font-semibold">₹{(form.cgst||0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SGST (1.5%)</span>
                    <span className="font-semibold">₹{(form.sgst||0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold border-l border-amber-200 pl-4">
                    <span>Total GST (3%)</span>
                    <span>₹{form.gst.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {form.discount > 0 && (
                  <div className="flex justify-between items-center text-sm text-red-600 font-medium border-t border-amber-200 pt-2">
                    <span>Discount</span>
                    <span>−₹{form.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-amber-200 pt-3">
                  <div className="flex justify-between items-center font-bold text-base">
                    <span>Grand Total</span>
                    <span className="text-lg text-amber-700">₹{form.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-teal-100 bg-teal-50/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-teal-700 mb-3 flex items-center gap-1.5"><Wallet size={14}/>Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Paid Amount (₹)</label>
                    <input value={form.amountPaid||''} onChange={e=>handlePaidAmountChange(Number(e.target.value)||0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-400 bg-white" placeholder="Amount received now"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Remaining Amount (₹)</label>
                    <div className={`w-full border rounded-xl px-3 py-2.5 text-sm font-bold ${form.balanceDue>0?'border-red-200 bg-red-50 text-red-600':'border-green-200 bg-green-50 text-green-600'}`}>
                      ₹{(form.balanceDue||0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                {form.total>0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {form.balanceDue>0
                      ? `₹${(form.balanceDue||0).toLocaleString('en-IN')} still due out of ₹${form.total.toLocaleString('en-IN')}`
                      : 'Fully paid — no balance remaining'}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as InvoiceStatus}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  {(Object.keys(statusConfig) as InvoiceStatus[]).map(s=><option key={s} value={s}>{statusConfig[s].label}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowCreate(false)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-3 text-sm font-semibold hover:bg-[#1a0e00]">Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      {deleteInvoiceId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Trash2 size={20} className="text-red-500"/>
                Delete Invoice
              </h2>
              <button onClick={()=>setDeleteInvoiceId(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete invoice <strong className="text-red-600">{deleteInvoiceId}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">
                    <strong>This action cannot be undone!</strong> The invoice will be permanently removed from the system.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={()=>setDeleteInvoiceId(null)} 
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteInvoice} 
                  disabled={deletingInvoice}
                  className="flex-1 bg-red-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deletingInvoice ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete Invoice'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {emailTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Mail size={20} className="text-blue-500"/>
                Send Invoice via Email
              </h2>
              <button onClick={()=>{setEmailTarget(null); setEmailInput('')}} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Sending invoice <strong className="text-[#C9A84C]">{emailTarget.id}</strong> for <strong>{emailTarget.customer}</strong>. Confirm or edit the email address below.
              </p>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email Address</label>
              <input
                type="email"
                autoFocus
                value={emailInput}
                onChange={e=>setEmailInput(e.target.value)}
                onKeyDown={e=>{ if (e.key==='Enter') handleSendEmail() }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 mb-6"
                placeholder="customer@email.com"
              />
              <div className="flex gap-3">
                <button
                  onClick={()=>{setEmailTarget(null); setEmailInput('')}}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <><Send size={14}/>Send Invoice</>
                  )}
                </button>
              </div>
              <a
                href={`mailto:${emailInput}?subject=${encodeURIComponent(`Invoice ${emailTarget.id} — Ratan Jewellers`)}&body=${encodeURIComponent(`Dear ${emailTarget.customer},\n\nYour invoice ${emailTarget.id} total is ₹${emailTarget.total.toLocaleString('en-IN')}.\n\nThank you for shopping with Ratan Jewellers.`)}`}
                className="block text-center text-xs text-gray-400 hover:text-blue-600 mt-4"
              >
                Not arriving? Open in your own email app instead
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500"/>
                Confirm Clear Data
              </h2>
              <button onClick={()=>setShowClearConfirm(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  <strong className="text-red-600">⚠️ Warning:</strong> This will permanently delete ALL billing data:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                  <li>All invoices ({invoices.length} items)</li>
                  <li>All orders ({orders.length} items)</li>
                  <li>All customers (customer data)</li>
                  <li>GST collection records</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">
                    <strong>This action cannot be undone!</strong> 
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  This change will be visible to <strong>ALL admin users</strong> (Super Admin, Admin, Store Manager, Sales Staff) immediately.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={()=>setShowClearConfirm(false)} 
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleClearData} 
                  className="flex-1 bg-red-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-700"
                >
                  Yes, Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}