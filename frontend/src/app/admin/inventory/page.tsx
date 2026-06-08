'use client'
import { useState } from 'react'
import { Search, Plus, AlertCircle, Edit2, Trash2, X, BarChart3, Boxes } from 'lucide-react'
import { useAdminStore, InventoryItem } from '@/store/adminStore'
import toast from 'react-hot-toast'

const categories = ['Necklaces','Rings','Bangles','Earrings','Chains','Mangalsutras','Anklets','Pendants','Silver']
const metals = ['24K Gold','22K Gold','20K Gold','18K Gold','14K Gold','Silver','Platinum']
const locations = ['Display A','Display B','Display C','Display D','Safe A','Safe B','Vault']

const getStockStatus = (stock:number,min:number) => {
  if(stock===0) return {label:'Out of Stock',color:'bg-red-100 text-red-700',barColor:'bg-red-400'}
  if(stock<min) return {label:'Low Stock',color:'bg-amber-100 text-amber-700',barColor:'bg-amber-400'}
  return {label:'In Stock',color:'bg-green-100 text-green-700',barColor:'bg-green-400'}
}

const emptyItem: Omit<InventoryItem,'id'|'lastUpdated'> = { name:'', category:'Necklaces', metal:'22K Gold', stock:0, minStock:5, maxStock:50, value:0, location:'Display A', trend:'stable' }

export default function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAdminStore()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem|null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null)
  const [form, setForm] = useState(emptyItem)
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({})

  const filtered = inventory.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = inventory.reduce((a,i)=>a+i.value,0)
  const lowStock = inventory.filter(i=>i.stock<i.minStock&&i.stock>0).length
  const outOfStock = inventory.filter(i=>i.stock===0).length

  const openEdit = (item: InventoryItem) => {
    setEditItem(item)
    setEditForm({ stock:item.stock, minStock:item.minStock, maxStock:item.maxStock, location:item.location, value:item.value })
  }

  const handleAdd = () => {
    if (!form.name.trim()) { toast.error('Item name required'); return }
    addInventoryItem(form)
    setShowAdd(false)
    setForm(emptyItem)
  }

  const handleUpdate = () => {
    if (!editItem) return
    updateInventoryItem(editItem.id, editForm)
    setEditItem(null)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Inventory Management</h1><p className="text-sm text-gray-500 mt-0.5">Track stock levels, values & reorder alerts</p></div>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"><Plus size={15}/>Add Stock</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Boxes size={14} className="text-blue-500"/><span className="text-xs text-gray-500">Total SKUs</span></div><div className="text-2xl font-bold text-gray-900">{inventory.length}</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><BarChart3 size={14} className="text-green-500"/><span className="text-xs text-gray-500">Total Value</span></div><div className="text-lg font-bold text-gray-900">₹{(totalValue/10000000).toFixed(2)}Cr</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><AlertCircle size={14} className="text-amber-500"/><span className="text-xs text-gray-500">Low Stock</span></div><div className="text-2xl font-bold text-amber-600">{lowStock}</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><AlertCircle size={14} className="text-red-500"/><span className="text-xs text-gray-500">Out of Stock</span></div><div className="text-2xl font-bold text-red-600">{outOfStock}</div></div>
      </div>

      {lowStock>0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0"/>
          <div><div className="text-sm font-semibold text-amber-800">Low Stock Alert</div>
            <div className="text-xs text-amber-700 mt-0.5">{inventory.filter(i=>i.stock<i.minStock&&i.stock>0).map(i=>i.name).join(', ')} are below minimum stock levels.</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 max-w-sm">
        <Search size={14} className="text-gray-400"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search inventory..." className="flex-1 text-sm outline-none placeholder-gray-400 text-gray-700"/>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>{['SKU','Product','Category','Metal','Stock Level','Min/Max','Value','Location','Status','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item=>{
                const status=getStockStatus(item.stock,item.minStock)
                const pct=Math.min((item.stock/item.maxStock)*100,100)
                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">{item.id}</td>
                    <td className="px-5 py-4"><div className="font-medium text-gray-900 whitespace-nowrap">{item.name}</div><div className="text-[10px] text-gray-400">Updated {item.lastUpdated}</div></td>
                    <td className="px-5 py-4 text-xs"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item.category}</span></td>
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{item.metal}</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-2 min-w-[100px]"><div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${status.barColor} rounded-full`} style={{width:`${pct}%`}}/></div><span className="text-xs font-semibold text-gray-700 w-8 text-right">{item.stock}</span></div></td>
                    <td className="px-5 py-4 text-xs text-gray-500">{item.minStock} / {item.maxStock}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">₹{(item.value/100000).toFixed(1)}L</td>
                    <td className="px-5 py-4 text-xs text-gray-500">{item.location}</td>
                    <td className="px-5 py-4"><span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.color}`}>{status.label}</span></td>
                    <td className="px-5 py-4"><div className="flex gap-1">
                      <button onClick={()=>openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Edit2 size={13}/></button>
                      <button onClick={()=>setConfirmDelete(item.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"><Trash2 size={13}/></button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Add Inventory Item</h2>
              <button onClick={()=>setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Item Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="e.g. Gold Necklace Sets"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Metal</label><select value={form.metal} onChange={e=>setForm(p=>({...p,metal:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{metals.map(m=><option key={m}>{m}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Stock</label><input type="number" value={form.stock||''} onChange={e=>setForm(p=>({...p,stock:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] text-center" placeholder="0"/></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Min Stock</label><input type="number" value={form.minStock||''} onChange={e=>setForm(p=>({...p,minStock:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] text-center" placeholder="5"/></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Max Stock</label><input type="number" value={form.maxStock||''} onChange={e=>setForm(p=>({...p,maxStock:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] text-center" placeholder="50"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Total Value (₹)</label><input type="number" value={form.value||''} onChange={e=>setForm(p=>({...p,value:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="e.g. 1840000"/></div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Location</label><select value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{locations.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowAdd(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">Add Item</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Update Stock — {editItem.name}</h2>
              <button onClick={()=>setEditItem(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[{l:'Current Stock',k:'stock'},{l:'Min Stock',k:'minStock'},{l:'Max Stock',k:'maxStock'}].map(f=>(
                  <div key={f.k}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.l}</label><input type="number" value={(editForm as any)[f.k]||''} onChange={e=>setEditForm(p=>({...p,[f.k]:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] text-center font-semibold"/></div>
                ))}
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Total Value (₹)</label><input type="number" value={editForm.value||''} onChange={e=>setEditForm(p=>({...p,value:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]"/></div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Location</label><select value={editForm.location||editItem.location} onChange={e=>setEditForm(p=>({...p,location:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{locations.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setEditItem(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleUpdate} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Remove Item?</h2>
            <p className="text-sm text-gray-500">This will permanently remove <strong>{inventory.find(i=>i.id===confirmDelete)?.name}</strong> from inventory.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{deleteInventoryItem(confirmDelete!);setConfirmDelete(null)}} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
