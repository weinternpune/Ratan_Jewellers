'use client'
import { useState, useEffect } from 'react'
import { Search, Plus, Download, Eye, Receipt, CheckCircle2, Clock, AlertCircle, X, Send, Printer, MessageCircle, Trash2, Edit } from 'lucide-react'
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
  customer:'', phone:'', hallmarkId:'',
  category:'', metal:'', purity:'', netWeight:'', price:0, goldRate:14525, makingCharges:0,
  amount:0, gst:0, total:0, amountPaid:0, balanceDue:0, // Partial payment fields
  status:'paid' as InvoiceStatus, 
  date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), due:'—' 
}

type FormMode = 'create' | 'edit'

export default function BillingPage() {
  const { invoices, orders, addInvoice, updateInvoiceStatus, sendInvoiceEmail, exportInvoicePDF, clearAllBillingData, deleteInvoice, fetchInvoices, fetchOrders, fetchCustomers, loading } = useAdminStore()
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
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string|null>(null)
  const [deletingInvoice, setDeletingInvoice] = useState(false)
  const [form, setForm] = useState(emptyInv)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [editingInvoiceId, setEditingInvoiceId] = useState<string|null>(null)
  const [additionalPayment, setAdditionalPayment] = useState(0)

  // Fetch data when component mounts
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
      inv.phone?.toLowerCase().includes(search.toLowerCase())
    
    return statusMatch && searchMatch
  })

  // Debug logging
  console.log('Search term:', search)
  console.log('Total invoices:', invoices.length)
  console.log('Filtered invoices:', filtered.length)
  console.log('Status filter:', statusFilter)

  const totals = {
    paid: invoices.reduce((a,i)=>a+(i.amountPaid || 0),0), // Total amount paid across all invoices
    paidCount: invoices.filter(i=>i.status==='paid').length, // Count of fully paid invoices
    pending: invoices.filter(i=>i.status==='pending').reduce((a,i)=>a+(i.balanceDue !== undefined ? i.balanceDue : i.total),0),
    pendingCount: invoices.filter(i=>i.status==='pending').length,
    overdue: invoices.filter(i=>i.status==='overdue').reduce((a,i)=>a+i.total,0),
    overdueCount: invoices.filter(i=>i.status==='overdue').length,
    totalGST: invoices.reduce((a,i)=>a+i.gst,0),
    totalAmountPaid: invoices.reduce((a,i)=>a+(i.amountPaid || 0),0),
    totalRevenue: invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.total,0),
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

  const calculateAmount = () => {
    if (form.netWeight && form.goldRate) {
      const weight = parseFloat(form.netWeight) || 0
      const rate = form.goldRate || 0
      const makingCharges = form.makingCharges || 0
      
      // Calculate: (Weight × Gold Rate) + (Making Charges on base amount) + Additional Price
      const baseAmount = weight * rate // Weight × Gold Rate
      const makingAmount = (baseAmount * makingCharges) / 100 // Making charges % on base amount
      const additionalPrice = parseFloat(String(form.price || 0)) || 0 // Additional price
      const subtotal = baseAmount + makingAmount + additionalPrice // Total before GST
      const totalAmount = Math.round(subtotal) // Round to nearest rupee
      
      // Debug logging
      console.log('=== Invoice Calculation ===')
      console.log('Weight:', weight, 'g')
      console.log('Gold Rate:', rate, '₹/g')
      console.log('Base Amount (Weight × Rate):', baseAmount.toFixed(2))
      console.log('Making Charges %:', makingCharges)
      console.log('Making Amount:', makingAmount.toFixed(2))
      console.log('Additional Price:', additionalPrice)
      console.log('Subtotal (before rounding):', subtotal.toFixed(2))
      console.log('Amount (after rounding):', totalAmount)
      
      const gst = Math.round(totalAmount * 0.03) // 3% GST (CGST 1.5% + SGST 1.5%)
      const grandTotal = totalAmount + gst
      
      console.log('GST (3%):', gst)
      console.log('Grand Total:', grandTotal)
      console.log('========================')
      
      setForm(p=>({...p, amount: totalAmount, gst, total: grandTotal}))
    } else if (form.amount > 0) {
      const gst = Math.round(form.amount * 0.03)
      setForm(p=>({...p, gst, total: form.amount + gst}))
    }
  }

  // Auto-calculate when relevant fields change
  const handleFieldChange = (field: string, value: string | number) => {
    setForm(p => {
      const updatedForm = {...p, [field]: value}
      
      // Auto-update purity and gold rate when metal is selected
      if (field === 'metal') {
        const metalValue = value as string
        const metalToPurity: Record<string, string> = {
          '24K Gold': '24KT',
          '22K Gold': '22KT',
          '20K Gold': '20KT',
          '18K Gold': '18KT',
          '14K Gold': '14KT',
          'Silver': 'Silver',
          'Platinum': 'Platinum'
        }
        
        const purityRates: Record<string, number> = {
          '24KT': 14525, // 24K Gold - ₹14,525/g
          '22KT': 13314, // 22K Gold - ₹13,314/g
          '20KT': 12104, // 20K Gold (estimated)
          '18KT': 10893, // 18K Gold - ₹10,893/g
          '14KT': 8349,  // 14K Gold - ₹8,349/g
          'Silver': 89,  // Silver (estimated)
          'Platinum': 3500 // Platinum (estimated)
        }
        
        if (metalToPurity[metalValue]) {
          const purity = metalToPurity[metalValue]
          updatedForm.purity = purity
          updatedForm.goldRate = purityRates[purity] || 14525
          console.log(`Auto-set purity to ${purity} and gold rate to ₹${updatedForm.goldRate}/g for metal ${metalValue}`)
        }
      }
      
      // Auto-update gold rate when purity is selected
      if (field === 'purity') {
        const purityRates: Record<string, number> = {
          '24KT': 14525, // 24K Gold - ₹14,525/g
          '22KT': 13314, // 22K Gold - ₹13,314/g
          '20KT': 12104, // 20K Gold (estimated)
          '18KT': 10893, // 18K Gold - ₹10,893/g
          '14KT': 8349,  // 14K Gold - ₹8,349/g
          'Silver': 89,  // Silver (estimated)
          'Platinum': 3500 // Platinum (estimated)
        }
        
        const purityValue = value as string
        if (purityRates[purityValue]) {
          updatedForm.goldRate = purityRates[purityValue]
          console.log(`Auto-updated gold rate for ${purityValue}: ₹${purityRates[purityValue]}/g`)
        }
      }
      
      // Immediately recalculate if weight or rate fields change
      if (['netWeight', 'goldRate', 'makingCharges', 'price', 'purity', 'metal'].includes(field)) {
        // Calculate inline with updated form
        const weight = parseFloat(String(updatedForm.netWeight)) || 0
        const rate = updatedForm.goldRate || 0
        
        if (weight && rate) {
          const makingCharges = updatedForm.makingCharges || 0
          const baseAmount = weight * rate
          const makingAmount = (baseAmount * makingCharges) / 100
          const additionalPrice = parseFloat(String(updatedForm.price || 0)) || 0
          const subtotal = baseAmount + makingAmount + additionalPrice
          const totalAmount = Math.round(subtotal)
          const gst = Math.round(totalAmount * 0.03)
          const grandTotal = totalAmount + gst
          
          console.log('=== Invoice Calculation (Real-time) ===')
          console.log('Metal:', updatedForm.metal)
          console.log('Purity:', updatedForm.purity)
          console.log('Weight:', weight, 'g')
          console.log('Gold Rate:', rate, '₹/g')
          console.log('Base Amount:', baseAmount.toFixed(2))
          console.log('Making Charges %:', makingCharges)
          console.log('Making Amount:', makingAmount.toFixed(2))
          console.log('Additional Price:', additionalPrice)
          console.log('Subtotal:', subtotal.toFixed(2))
          console.log('Amount (rounded):', totalAmount)
          console.log('GST (3%):', gst)
          console.log('Grand Total:', grandTotal)
          console.log('====================================')
          
          return {...updatedForm, amount: totalAmount, gst, total: grandTotal}
        }
      }
      
      return updatedForm
    })
  }
  
  // Auto-recalculate whenever relevant fields change
  useEffect(() => {
    if (form.netWeight && form.goldRate && formMode === 'create') {
      calculateAmount()
    }
  }, [form.netWeight, form.goldRate, form.makingCharges, form.price])

  const handleClearData = async () => {
    await clearAllBillingData()
    setShowClearConfirm(false)
  }

  const handleDeleteInvoice = async () => {
    if (deleteInvoiceId && !deletingInvoice) {
      try {
        console.log('Frontend: Attempting to delete invoice:', deleteInvoiceId)
        setDeletingInvoice(true)
        
        await deleteInvoice(deleteInvoiceId)
        
        console.log('Frontend: Invoice deleted successfully:', deleteInvoiceId)
        toast.success(`Invoice ${deleteInvoiceId} deleted successfully`)
        setDeleteInvoiceId(null)
      } catch (error: any) {
        console.error('Frontend: Delete invoice error:', error)
        console.error('Frontend: Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        const errorMessage = error.message || 'Failed to delete invoice'
        toast.error(`Delete failed: ${errorMessage}`)
      } finally {
        setDeletingInvoice(false)
      }
    }
  }

  const handleOpenEdit = (invoice: Invoice) => {
    setFormMode('edit')
    setEditingInvoiceId(invoice.id)
    setForm({
      customer: invoice.customer,
      phone: invoice.phone || '',
      hallmarkId: invoice.hallmarkId || '',
      category: invoice.category || '',
      metal: invoice.metal || '',
      purity: invoice.purity || '',
      netWeight: invoice.netWeight || '',
      price: invoice.price || 0,
      goldRate: invoice.goldRate || 6520,
      makingCharges: invoice.makingCharges || 0,
      amount: invoice.amount,
      gst: invoice.gst,
      total: invoice.total,
      amountPaid: invoice.amountPaid || 0,
      balanceDue: invoice.balanceDue || 0,
      status: invoice.status,
      date: invoice.date,
      due: invoice.due
    })
    setAdditionalPayment(0)
    setShowCreate(true)
  }

  const handleOpenCreate = () => {
    setFormMode('create')
    setEditingInvoiceId(null)
    setForm(emptyInv)
    setAdditionalPayment(0)
    setShowCreate(true)
  }

  const handleSubmit = async () => {
    if (!form.customer.trim()) { toast.error('Customer name required'); return }
    if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return }
    
    if (formMode === 'edit' && editingInvoiceId) {
      // Edit mode: Add additional payment
      if (additionalPayment <= 0) {
        toast.error('Please enter a payment amount greater than 0')
        return
      }
      
      if (additionalPayment > (form.balanceDue || 0)) {
        toast.error('Payment amount cannot exceed balance due')
        return
      }
      
      const newAmountPaid = (form.amountPaid || 0) + additionalPayment
      const newBalanceDue = form.total - newAmountPaid
      const autoStatus = newBalanceDue <= 0 ? 'paid' : 'pending'
      
      const updateData = {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: autoStatus
      }
      
      try {
        await useAdminStore.getState().updateInvoice(editingInvoiceId, updateData)
        toast.success(`Payment of ₹${additionalPayment.toLocaleString('en-IN')} added! Balance: ₹${newBalanceDue.toLocaleString('en-IN')}`)
        setShowCreate(false)
        setForm(emptyInv)
        setAdditionalPayment(0)
        setEditingInvoiceId(null)
        // Refresh invoices from backend to get updated data
        await fetchInvoices()
      } catch (error) {
        console.error('Error updating invoice:', error)
        toast.error('Failed to update invoice')
      }
    } else {
      // Create mode
      // Auto-calculate balance if not set
      const balanceDue = form.balanceDue !== undefined ? form.balanceDue : form.total - (form.amountPaid || 0)
      
      // Auto-set status based on payment
      const autoStatus = balanceDue <= 0 ? 'paid' : 'pending'
      
      // Create invoice with payment tracking
      const invoiceData = {
        ...form,
        balanceDue,
        status: autoStatus,
        paymentHistory: form.amountPaid && form.amountPaid > 0 ? [
          {
            amount: form.amountPaid,
            date: new Date().toISOString(),
            mode: 'Cash', // Default payment mode
            notes: 'Initial payment'
          }
        ] : []
      }
      
      await addInvoice(invoiceData)
      toast.success(`Invoice created! Status: ${autoStatus === 'paid' ? 'Fully Paid' : 'Pending Payment'}`)
      setShowCreate(false)
      setForm(emptyInv)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Billing & Invoices</h1><p className="text-sm text-gray-500 mt-0.5">GST invoices, billing history & payment tracking</p></div>
        <div className="flex gap-2 flex-wrap">
          {canCreate && <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Plus size={15}/>Create Invoice</button>}
          {canFull && invoices.length > 0 && <button onClick={()=>setShowClearConfirm(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700" title="Clear all billing data globally"><X size={15}/>Clear Data</button>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-green-500"/>
            <span className="text-xs text-gray-500">Total Paid</span>
          </div>
          <div className="text-lg font-bold text-green-600">₹{(totals.paid/100000).toFixed(1)}L</div>
          <div className="text-xs text-gray-400">{totals.paidCount} fully paid</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-amber-500"/>
            <span className="text-xs text-gray-500">Pending Balance</span>
          </div>
          <div className="text-lg font-bold text-amber-600">₹{(totals.pending/100000).toFixed(1)}L</div>
          <div className="text-xs text-gray-400">{totals.pendingCount} invoices</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-red-500"/>
            <span className="text-xs text-gray-500">Overdue</span>
          </div>
          <div className="text-lg font-bold text-red-600">₹{(totals.overdue/1000).toFixed(0)}K</div>
          <div className="text-xs text-gray-400">{totals.overdueCount} invoices</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={14} className="text-blue-500"/>
            <span className="text-xs text-gray-500">GST Collected</span>
          </div>
          <div className="text-lg font-bold text-blue-600">₹{(totals.totalGST/1000).toFixed(1)}K</div>
          <div className="text-xs text-gray-400">Total GST (3%)</div>
        </div>
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
              <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Invoice #','Order','Customer','Phone','Hallmark ID','Category','Metal','Purity','Net Weight','Price','Gold Rate','Making Charges','Amount','GST (3%)','Total','Paid','Balance','Date','Due','Status','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
              {filtered.map(inv=>{
                const cfg=statusConfig[inv.status]
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[#C9A84C]">{inv.id}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{inv.order||'—'}</td>
                    <td className="px-5 py-4"><div className="font-medium text-gray-900">{inv.customer}</div></td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.phone||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap font-mono">{inv.hallmarkId||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.category||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.metal||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.purity||'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.netWeight?`${inv.netWeight}g`:'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.price?`₹${inv.price.toLocaleString('en-IN')}`:'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.goldRate?`₹${inv.goldRate.toLocaleString('en-IN')}/g`:'—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inv.makingCharges?`${inv.makingCharges}%`:'—'}</td>
                    <td className="px-5 py-4 text-gray-700 whitespace-nowrap">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">₹{inv.gst.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">₹{inv.total.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-green-600 text-xs whitespace-nowrap font-semibold">
                      {inv.amountPaid && inv.amountPaid > 0 ? `₹${inv.amountPaid.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {inv.balanceDue && inv.balanceDue > 0 ? (
                        <span className="text-red-600 text-xs font-semibold">₹{inv.balanceDue.toLocaleString('en-IN')}</span>
                      ) : inv.balanceDue === 0 ? (
                        <span className="text-green-600 text-xs font-semibold">✓ Paid</span>
                      ) : (
                        <span className="text-red-600 text-xs font-semibold">₹{inv.total.toLocaleString('en-IN')}</span>
                      )}
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
                      {canFull && <button onClick={()=>handleOpenEdit(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600" title="Edit / Add Payment"><Edit size={13}/></button>}
                      {canShare && <button onClick={()=>sendInvoiceEmail(inv.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600" title="Send Email"><Send size={13}/></button>}
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Invoice Preview</h2>
              <button onClick={()=>setPreviewInvoice(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div><div className="text-lg font-bold text-[#0D0700]">RATAN JEWELLERS</div><div className="text-xs text-gray-500">123 Gold Market, Bhubaneswar, Odisha</div><div className="text-xs text-gray-500">GSTIN: 21AAAAA0000A1Z5</div></div>
                <div className="text-right"><div className="text-[#C9A84C] font-mono font-bold text-base">{previewInvoice.id}</div><div className="text-xs text-gray-500">{previewInvoice.date}</div>{previewInvoice.due && previewInvoice.due !== '—' ? <div className="text-xs text-gray-400">Due: {previewInvoice.due}</div> : null}<span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[previewInvoice.status].color}`}>{statusConfig[previewInvoice.status].label}</span></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Bill To</div>
                <div className="font-semibold text-gray-900">{previewInvoice.customer}</div>
                {previewInvoice.phone ? <div className="text-xs text-gray-500">Phone: {previewInvoice.phone}</div> : null}
                {previewInvoice.hallmarkId ? <div className="text-xs text-gray-500 font-mono mt-1">Hallmark ID: {previewInvoice.hallmarkId}</div> : null}
              </div>
              <table className="w-full text-sm mb-6">
                <thead className="border-b border-gray-200"><tr className="text-xs text-gray-500"><th className="text-left pb-2">Description</th><th className="text-right pb-2">Amount</th></tr></thead>
                <tbody>
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-700">Jewellery Purchase{previewInvoice.order?` (${previewInvoice.order})`:''}</td><td className="py-3 text-right text-gray-900">₹{previewInvoice.amount.toLocaleString('en-IN')}</td></tr>
                  {previewInvoice.category ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Category: {previewInvoice.category}</td><td></td></tr> : null}
                  {previewInvoice.metal ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Metal: {previewInvoice.metal}</td><td></td></tr> : null}
                  {previewInvoice.purity ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Purity: {previewInvoice.purity}</td><td></td></tr> : null}
                  {previewInvoice.netWeight ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Net Weight: {previewInvoice.netWeight}g</td><td></td></tr> : null}
                  {previewInvoice.goldRate ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Gold Rate: ₹{previewInvoice.goldRate}/g</td><td></td></tr> : null}
                  {(previewInvoice.makingCharges && previewInvoice.makingCharges > 0) ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Making Charges: {previewInvoice.makingCharges}%</td><td></td></tr> : null}
                  {(previewInvoice.price && previewInvoice.price > 0) ? <tr className="border-b border-gray-50"><td className="py-1 text-xs text-gray-500">Additional Charges</td><td className="py-1 text-right text-xs text-gray-500">₹{previewInvoice.price.toLocaleString('en-IN')}</td></tr> : null}
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-500 text-xs">CGST @ 1.5%</td><td className="py-3 text-right text-gray-600 text-xs">₹{(previewInvoice.gst/2).toLocaleString('en-IN')}</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-3 text-gray-500 text-xs">SGST @ 1.5%</td><td className="py-3 text-right text-gray-600 text-xs">₹{(previewInvoice.gst/2).toLocaleString('en-IN')}</td></tr>
                </tbody>
                <tfoot><tr><td className="pt-3 font-bold text-gray-900">Total</td><td className="pt-3 text-right font-bold text-gray-900 text-base">₹{previewInvoice.total.toLocaleString('en-IN')}</td></tr></tfoot>
              </table>
              
              {/* Payment Summary Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-3">Payment Summary</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-base font-bold text-gray-900">₹{previewInvoice.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700">Amount Paid:</span>
                    <span className="text-base font-bold text-green-600">₹{(previewInvoice.amountPaid || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Balance Due:</span>
                    <span className={`text-lg font-bold ${(previewInvoice.balanceDue || previewInvoice.total) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {(previewInvoice.balanceDue || previewInvoice.total) > 0 
                        ? `₹${(previewInvoice.balanceDue || previewInvoice.total).toLocaleString('en-IN')}`
                        : 'Fully Paid ✓'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History Section */}
              {previewInvoice.paymentHistory && previewInvoice.paymentHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-3">Payment History</div>
                  <div className="space-y-2">
                    {previewInvoice.paymentHistory.map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-200">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString('en-IN')}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {payment.mode && ` • ${payment.mode}`}
                          </div>
                          {payment.notes && <div className="text-xs text-gray-400 mt-1">{payment.notes}</div>}
                        </div>
                        <div className="text-green-600">
                          <CheckCircle2 size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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

      {/* Create/Edit Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{formMode === 'edit' ? 'Edit Invoice & Add Payment' : 'Create Invoice'}</h2>
              <button onClick={()=>setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-6">
              
              {formMode === 'edit' && (
                <>
                  {/* Invoice Summary for Edit Mode */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Invoice Summary</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Customer</div>
                        <div className="font-semibold text-gray-900">{form.customer}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-semibold text-gray-900">{form.phone || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Amount</div>
                        <div className="font-bold text-lg text-gray-900">₹{form.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Already Paid</div>
                        <div className="font-bold text-lg text-green-600">₹{(form.amountPaid || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Current Balance</div>
                        <div className="font-bold text-2xl text-red-600">₹{(form.balanceDue || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Add Payment Section */}
                  <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600"/>
                      Add New Payment
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Payment Amount (₹)</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={additionalPayment || ''} 
                            onChange={e => setAdditionalPayment(parseFloat(e.target.value) || 0)}
                            className="flex-1 border-2 border-green-300 rounded-xl px-4 py-3 text-lg font-semibold outline-none focus:border-green-500" 
                            placeholder="Enter payment amount"
                            min="0"
                            max={form.balanceDue}
                            step="0.01"
                          />
                          <button
                            onClick={() => setAdditionalPayment(form.balanceDue || 0)}
                            className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 whitespace-nowrap"
                            title="Pay full balance"
                          >
                            Pay Full
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 mt-1.5">
                          Maximum: ₹{(form.balanceDue || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          <span className="ml-2 text-gray-500">• You can enter paise (e.g., 750202.90)</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Balance:</span>
                          <span className="font-semibold text-red-600">₹{(form.balanceDue || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Payment Adding:</span>
                          <span className="font-semibold text-green-600">₹{additionalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between text-base font-bold">
                          <span className={(form.balanceDue - additionalPayment) > 0 ? 'text-red-600' : 'text-green-600'}>
                            New Balance:
                          </span>
                          <span className={(form.balanceDue - additionalPayment) > 0 ? 'text-red-600' : 'text-green-600'}>
                            ₹{Math.max(0, (form.balanceDue || 0) - additionalPayment).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          </span>
                        </div>
                        {(form.balanceDue - additionalPayment) <= 0 && additionalPayment > 0 && (
                          <div className="bg-green-100 border border-green-300 rounded-lg p-2 mt-2">
                            <div className="text-xs text-green-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={14}/>
                              Invoice will be marked as FULLY PAID
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {formMode === 'create' && (
                <>
              {/* Customer Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Customer Name *</label>
                  <input value={form.customer} onChange={e=>setForm(p=>({...p,customer:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="Customer name"/>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Phone Number</label>
                  <input value={form.phone||''} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="+91 98765 43210"/>
                </div>
              </div>

              {/* Hallmark ID Section */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Hallmark ID (Optional)</label>
                <input 
                  value={form.hallmarkId||''} 
                  onChange={e=>setForm(p=>({...p,hallmarkId:e.target.value}))} 
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" 
                  placeholder="Enter hallmark unique ID (e.g., HUID123456)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  BIS Hallmark Unique Identification Number for gold jewellery certification
                </p>
              </div>

              {/* Product Details Section */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                    <select value={form.category||''} onChange={e=>handleFieldChange('category', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer bg-white">
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
                    <select value={form.metal||''} onChange={e=>handleFieldChange('metal', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer bg-white">
                      <option value="">Select Metal</option>
                      <option value="24K Gold">24K Gold</option>
                      <option value="22K Gold">22K Gold</option>
                      <option value="20K Gold">20K Gold</option>
                      <option value="18K Gold">18K Gold</option>
                      <option value="14K Gold">14K Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Purity</label>
                    <select value={form.purity||''} onChange={e=>handleFieldChange('purity', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer bg-white">
                      <option value="">Select Purity</option>
                      <option value="24KT">24KT</option>
                      <option value="22KT">22KT</option>
                      <option value="20KT">20KT</option>
                      <option value="18KT">18KT</option>
                      <option value="14KT">14KT</option>
                      <option value="Silver">Silver</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Net Weight (grams)</label>
                    <input value={form.netWeight||''} onChange={e=>handleFieldChange('netWeight', e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="10.5"/>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Gold Rate (₹/gram)</label>
                    <input value={form.goldRate||''} onChange={e=>handleFieldChange('goldRate', Number(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="6520"/>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Making Charges (%)</label>
                    <input value={form.makingCharges||''} onChange={e=>handleFieldChange('makingCharges', Number(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="10"/>
                  </div>
                </div>
              </div>
              </>
              )}
              
              {formMode === 'create' && (
                <>
              {/* Pricing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Additional Price (₹)</label>
                  <input value={form.price||''} onChange={e=>handleFieldChange('price', Number(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="Stone/work charges"/>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount (₹) *</label>
                  <input 
                    value={form.amount||''} 
                    onChange={e=>handleAmountChange(Number(e.target.value)||0)} 
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none ${form.netWeight && form.goldRate ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-[#C9A84C]'}`}
                    placeholder="Auto-calculated or manual" 
                    readOnly={form.netWeight && form.goldRate ? true : false}
                    disabled={form.netWeight && form.goldRate ? true : false}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {form.netWeight && form.goldRate ? 
                      '✓ Auto-calculated from weight & gold rate' : 
                      'Enter amount manually or fill weight & gold rate'
                    }
                  </div>
                </div>
              </div>

              {/* GST Section */}
              <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-3">GST Breakdown</div>
                
                {/* Calculation breakdown if auto-calculated */}
                {form.netWeight && form.goldRate && (
                  <div className="bg-white rounded-lg p-3 mb-3 text-xs space-y-1">
                    <div className="font-semibold text-gray-700 mb-2">Calculation:</div>
                    <div className="flex justify-between">
                      <span>Weight × Gold Rate:</span>
                      <span>₹{((parseFloat(form.netWeight) || 0) * (form.goldRate || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                    </div>
                    {form.makingCharges > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>+ Making Charges ({form.makingCharges}%):</span>
                        <span>₹{(((parseFloat(form.netWeight) || 0) * (form.goldRate || 0) * (form.makingCharges || 0)) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                      </div>
                    )}
                    {form.price > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>+ Additional Charges:</span>
                        <span>₹{(form.price || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 mt-2 flex justify-between font-semibold">
                      <span>Subtotal (before GST):</span>
                      <span>₹{form.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CGST (1.5%)</span>
                    <span className="font-semibold">₹{(form.gst/2).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">SGST (1.5%)</span>
                    <span className="font-semibold">₹{(form.gst/2).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold border-l border-amber-200 pl-4">
                    <span>Total GST (3%)</span>
                    <span>₹{form.gst.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="border-t border-amber-200 pt-3">
                  <div className="flex justify-between items-center font-bold text-base">
                    <span>Grand Total</span>
                    <span className="text-lg">₹{form.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount Paid Now (₹)</label>
                    <input 
                      type="number" 
                      value={form.amountPaid || ''} 
                      onChange={e => {
                        const paid = parseFloat(e.target.value) || 0
                        const balance = form.total - paid
                        setForm(p => ({...p, amountPaid: paid, balanceDue: balance}))
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" 
                      placeholder="Enter amount paid (e.g., 750202.90)"
                      min="0"
                      max={form.total}
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can enter paise (decimal values)</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Balance Due (₹)</label>
                    <input 
                      value={form.balanceDue?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') || form.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                      readOnly
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-gray-100 text-gray-700 font-semibold" 
                    />
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">₹{form.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-green-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">₹{(form.amountPaid || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                    <span className={(form.balanceDue || form.total) > 0 ? 'text-red-600' : 'text-green-600'}>
                      {(form.balanceDue || form.total) > 0 ? 'Balance Due:' : 'Fully Paid'}
                    </span>
                    <span className={(form.balanceDue || form.total) > 0 ? 'text-red-600' : 'text-green-600'}>
                      ₹{((form.balanceDue !== undefined ? form.balanceDue : form.total) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </span>
                  </div>
                </div>
              </div>
              </>
              )}
              
              {formMode === 'create' && (
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as InvoiceStatus}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  {(Object.keys(statusConfig) as InvoiceStatus[]).map(s=><option key={s} value={s}>{statusConfig[s].label}</option>)}
                </select>
              </div>
              )}
            </div>
            
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowCreate(false)} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-3 text-sm font-semibold hover:bg-[#1a0e00]">
                {formMode === 'edit' ? 'Update Payment' : 'Create Invoice'}
              </button>
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
