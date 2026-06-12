'use client'
import { useState } from 'react'
import { Search, Plus, Eye, Edit2, Trash2, ShoppingCart, Clock, CheckCircle2, XCircle, RefreshCw, Truck, X, IndianRupee, Receipt } from 'lucide-react'
import { useAdminStore, Order, OrderStatus } from '@/store/adminStore'
import toast from 'react-hot-toast'

const statusConfig: Record<OrderStatus,{label:string;color:string;icon:any}> = {
  placed:{label:'Placed',color:'bg-blue-50 text-blue-600',icon:ShoppingCart},
  confirmed:{label:'Confirmed',color:'bg-indigo-50 text-indigo-600',icon:CheckCircle2},
  processing:{label:'Processing',color:'bg-amber-50 text-amber-600',icon:Clock},
  shipped:{label:'Shipped',color:'bg-purple-50 text-purple-600',icon:Truck},
  delivered:{label:'Delivered',color:'bg-green-50 text-green-600',icon:CheckCircle2},
  cancelled:{label:'Cancelled',color:'bg-red-50 text-red-600',icon:XCircle},
  returned:{label:'Returned',color:'bg-orange-50 text-orange-600',icon:RefreshCw},
}

const payments = ['UPI','Card','Net Banking','Cash','EMI']
const emptyOrder = { customer:'',email:'',phone:'',items:[{name:'',qty:1,price:0}],total:0,status:'placed' as OrderStatus,payment:'UPI',address:'',notes:'' }

export default function OrdersPage() {
  const { orders, addOrder, updateOrderStatus, updateOrder, deleteOrder, generateInvoiceForOrder } = useAdminStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus|'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order|null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null)
  const [form, setForm] = useState(emptyOrder)

  const filtered = orders.filter(o =>
    (statusFilter==='all'||o.status===statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase())||o.customer.toLowerCase().includes(search.toLowerCase()))
  )

  const calcTotal = (items: typeof form.items) => items.reduce((a,i)=>a+i.qty*i.price,0)

  const handleAddItem = () => setForm(p=>({...p,items:[...p.items,{name:'',qty:1,price:0}]}))
  const handleItemChange = (idx:number, field:string, val:any) => {
    const items = form.items.map((it,i)=>i===idx?{...it,[field]:field==='qty'||field==='price'?Number(val):val}:it)
    setForm(p=>({...p,items,total:calcTotal(items)}))
  }
  const removeItem = (idx:number) => { const items=form.items.filter((_,i)=>i!==idx); setForm(p=>({...p,items,total:calcTotal(items)})) }

  const handleSubmit = () => {
    if (!form.customer.trim()) { toast.error('Customer name required'); return }
    if (form.items.some(i=>!i.name.trim())) { toast.error('Fill all item names'); return }
    addOrder({...form,total:calcTotal(form.items)})
    setShowAdd(false)
    setForm(emptyOrder)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Orders</h1><p className="text-sm text-gray-500 mt-0.5">Track and manage all customer orders</p></div>
        <div className="flex gap-2">
          <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Plus size={15}/>New Order</button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={()=>setStatusFilter('all')} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${statusFilter==='all'?'bg-[#0D0700] text-[#C9A84C]':'bg-white border border-gray-200 text-gray-600'}`}>All {orders.length}</button>
        {(Object.keys(statusConfig) as OrderStatus[]).map(s=>(
          <button key={s} onClick={()=>setStatusFilter(s)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${statusFilter===s?'bg-[#0D0700] text-[#C9A84C]':'bg-white border border-gray-200 text-gray-600'}`}>{statusConfig[s].label} {orders.filter(o=>o.status===s).length}</button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 max-w-sm">
        <Search size={14} className="text-gray-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="flex-1 text-sm outline-none placeholder-gray-400 text-gray-700"/>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Order ID','Customer','Items','Total','Payment','Date','Status','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order=>{
                const cfg=statusConfig[order.status]; const Icon=cfg.icon
                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-[#C9A84C]">{order.id}</td>
                    <td className="px-5 py-4"><div className="font-medium text-gray-900">{order.customer}</div><div className="text-xs text-gray-400">{order.email}</div></td>
                    <td className="px-5 py-4 text-gray-600">{order.items.length} item{order.items.length>1?'s':''}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">₹{order.total.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">{order.payment}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{order.date}</td>
                    <td className="px-5 py-4"><span className={`flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-full ${cfg.color}`}><Icon size={11}/>{cfg.label}</span></td>
                    <td className="px-5 py-4"><div className="flex gap-1">
                      <button onClick={()=>setSelectedOrder(order)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800" title="View & Edit"><Eye size={13}/></button>
                      <button onClick={()=>generateInvoiceForOrder(order.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-amber-600" title="Generate Invoice"><Receipt size={13}/></button>
                      <button onClick={()=>setConfirmDelete(order.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600" title="Delete"><Trash2 size={13}/></button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">Showing {filtered.length} of {orders.length} orders</div>
      </div>

      {/* Order Detail/Edit Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/40" onClick={()=>setSelectedOrder(null)}/>
          <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div><h2 className="font-bold text-gray-900">Order {selectedOrder.id}</h2><p className="text-xs text-gray-400">{selectedOrder.date}</p></div>
              <button onClick={()=>setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</div>
                <div className="font-semibold text-gray-900">{selectedOrder.customer}</div>
                <div className="text-sm text-gray-500">{selectedOrder.email}</div>
                <div className="text-sm text-gray-500">{selectedOrder.phone}</div>
                {selectedOrder.address && <div className="text-xs text-gray-400 mt-1">{selectedOrder.address}</div>}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item,i)=>(
                    <div key={i} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">{item.name} × {item.qty}</span>
                      <span className="text-sm font-semibold text-gray-900">₹{(item.price*item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-3 py-2 font-bold text-gray-900 border-t border-gray-200">
                    <span>Total</span><span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(statusConfig) as OrderStatus[]).map(s=>(
                    <button key={s} onClick={()=>updateOrderStatus(selectedOrder.id,s)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${selectedOrder.status===s?'bg-[#0D0700] text-[#C9A84C] border-transparent':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{generateInvoiceForOrder(selectedOrder.id);setSelectedOrder(null)}} className="flex-1 flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-amber-100">
                  <Receipt size={14}/>Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">New Order</h2>
              <button onClick={()=>setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Customer Name *</label><input value={form.customer} onChange={e=>setForm(p=>({...p,customer:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="Full name"/></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Phone</label><input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="+91 XXXXX"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email</label><input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="customer@email.com"/></div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Address</label><input value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="Delivery address"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Payment</label>
                  <select value={form.payment} onChange={e=>setForm(p=>({...p,payment:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{payments.map(p=><option key={p}>{p}</option>)}</select>
                </div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                  <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as OrderStatus}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{(Object.keys(statusConfig) as OrderStatus[]).map(s=><option key={s} value={s}>{statusConfig[s].label}</option>)}</select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-xs font-semibold text-gray-600">Order Items *</label><button onClick={handleAddItem} className="text-xs text-[#C9A84C] font-semibold hover:underline">+ Add Item</button></div>
                <div className="space-y-2">
                  {form.items.map((item,idx)=>(
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input value={item.name} onChange={e=>handleItemChange(idx,'name',e.target.value)} className="col-span-5 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-[#C9A84C]" placeholder="Item name"/>
                      <input type="number" value={item.qty||''} onChange={e=>handleItemChange(idx,'qty',e.target.value)} className="col-span-2 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-[#C9A84C] text-center" placeholder="Qty"/>
                      <input type="number" value={item.price||''} onChange={e=>handleItemChange(idx,'price',e.target.value)} className="col-span-4 border border-gray-200 rounded-lg px-2 py-2 text-xs outline-none focus:border-[#C9A84C]" placeholder="Price ₹"/>
                      <button onClick={()=>removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-600"><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right text-sm font-bold text-gray-900">Total: ₹{calcTotal(form.items).toLocaleString('en-IN')}</div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Notes</label><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] resize-none h-16" placeholder="Optional notes..."/></div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowAdd(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">Create Order</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Delete Order?</h2>
            <p className="text-sm text-gray-500">This will permanently delete order <strong>{confirmDelete}</strong>.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{deleteOrder(confirmDelete!);setConfirmDelete(null)}} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
