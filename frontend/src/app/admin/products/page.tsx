'use client'
import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Package, Star, X, Grid, List, TrendingUp, AlertCircle } from 'lucide-react'
import { useAdminStore, Product } from '@/store/adminStore'
import { useProductCatalog } from '@/store/productCatalog'
import Link from 'next/link'
import toast from 'react-hot-toast'

const categories = ['Necklaces','Rings','Bangles','Earrings','Chains','Mangalsutras','Anklets','Pendants']
const metals = ['24K Gold','22K Gold','20K Gold','18K Gold','14K Gold','Silver','Platinum']
const empty: Omit<Product,'id'|'rating'|'sales'> = { name:'',category:'Necklaces',metal:'22K Gold',weight:'',price:0,stock:0,status:'active',description:'' }

export default function ProductsPage() {
  const { products: adminProducts, addProduct, updateProduct, deleteProduct } = useAdminStore()
  const { products: catalogProducts, deleteProduct: deleteCatalogProduct, toggleFeatured, toggleTrending, toggleStock } = useProductCatalog()
  // Merge admin + catalog products, catalog ones shown with a badge
  const products = [
    ...catalogProducts.map(p => ({
      id: p.id, name: p.name, category: p.category.name, metal: p.metal,
      weight: `${p.netWeight}g`, price: p.currentPrice, stock: p.inStock ? 99 : 0,
      status: (p.inStock ? 'active' : 'out_of_stock') as any,
      rating: p.avgRating, sales: p.reviewCount, description: p.description,
      _catalog: true, _images: p.images, _sku: p.sku,
    })),
    ...adminProducts,
  ]
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'table'|'grid'>('table')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Product|null>(null)
  const [viewTarget, setViewTarget] = useState<Product|null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null)
  const [form, setForm] = useState(empty)

  const filtered = products.filter(p =>
    (category==='All'||p.category===category) &&
    (p.name.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd = () => { setForm(empty); setEditTarget(null); setShowModal(true) }
  const openEdit = (p: Product) => { setForm({name:p.name,category:p.category,metal:p.metal,weight:p.weight,price:p.price,stock:p.stock,status:p.status,description:p.description||''}); setEditTarget(p); setShowModal(true) }
  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    if (form.price<=0) { toast.error('Price must be greater than 0'); return }
    if (editTarget) updateProduct(editTarget.id, form)
    else addProduct(form)
    setShowModal(false)
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Products</h1><p className="text-sm text-gray-500 mt-0.5">Manage jewellery catalogue</p></div>
        <Link href="/admin/products/add" className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00] transition-colors"><Plus size={15}/>Add Product</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Package size={14} className="text-amber-500"/><span className="text-xs text-gray-500">Total Products</span></div><div className="text-2xl font-bold text-gray-900">{products.length}</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><AlertCircle size={14} className="text-red-500"/><span className="text-xs text-gray-500">Out of Stock</span></div><div className="text-2xl font-bold text-red-600">{products.filter(p=>p.stock===0).length}</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-green-500"/><span className="text-xs text-gray-500">Catalogue Value</span></div><div className="text-lg font-bold text-gray-900">₹{(products.reduce((a,p)=>a+p.price*Math.max(p.stock,1),0)/100000).toFixed(1)}L</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Star size={14} className="text-amber-500"/><span className="text-xs text-gray-500">Avg Rating</span></div><div className="text-2xl font-bold text-gray-900">{products.filter(p=>p.rating>0).length>0?(products.filter(p=>p.rating>0).reduce((a,p)=>a+p.rating,0)/products.filter(p=>p.rating>0).length).toFixed(1):'—'}</div></div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5"><Search size={14} className="text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"/></div>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button onClick={()=>setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode==='table'?'bg-white shadow-sm':'text-gray-500'}`}><List size={14}/></button>
            <button onClick={()=>setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode==='grid'?'bg-white shadow-sm':'text-gray-500'}`}><Grid size={14}/></button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All',...categories].map(c=>(
            <button key={c} onClick={()=>setCategory(c)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${category===c?'bg-[#0D0700] text-[#C9A84C]':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{c}</button>
          ))}
        </div>
      </div>

      {viewMode==='table' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100"><tr>{['SKU','Product','Category','Metal','Weight','Price','Stock','Rating','Status','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p=>(
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{p.id}</td>
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0"><Package size={13} className="text-amber-500"/></div><span className="font-medium text-gray-900 whitespace-nowrap">{p.name}</span>{(p as any)._catalog && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold ml-1">LIVE</span>}</div></td>
                    <td className="px-5 py-4"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{p.category}</span></td>
                    <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{p.metal}</td>
                    <td className="px-5 py-4 text-xs text-gray-600">{p.weight}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4"><span className={`text-xs font-semibold ${p.stock===0?'text-red-600':p.stock<5?'text-amber-600':'text-green-600'}`}>{p.stock===0?'Out':`${p.stock} pcs`}</span></td>
                    <td className="px-5 py-4"><div className="flex items-center gap-1 text-xs"><Star size={11} className="text-amber-400 fill-amber-400"/><span className="font-medium text-gray-700">{p.rating||'—'}</span></div></td>
                    <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-1 rounded-full ${p.status==='active'?'bg-green-50 text-green-600':'bg-red-50 text-red-500'}`}>{p.status==='active'?'Active':'Out of Stock'}</span></td>
                    <td className="px-5 py-4"><div className="flex gap-1">
                      <button onClick={()=>setViewTarget(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Eye size={13}/></button>
                      <button onClick={()=>openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800"><Edit2 size={13}/></button>
                      <button onClick={()=>setConfirmDelete(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"><Trash2 size={13}/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">Showing {filtered.length} of {products.length} products</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p=>(
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="h-36 bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center relative">
                <Package size={40} className="text-amber-200"/>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>openEdit(p)} className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-gray-800"><Edit2 size={12}/></button>
                  <button onClick={()=>setConfirmDelete(p.id)} className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-500 hover:text-red-600"><Trash2 size={12}/></button>
                </div>
                <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status==='active'?'bg-green-100 text-green-600':'bg-red-100 text-red-600'}`}>{p.status==='active'?'Active':'OOS'}</div>
              </div>
              <div className="p-4">
                <div className="text-[10px] text-gray-400 font-mono mb-1">{p.id}</div>
                <div className="text-sm font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">{p.name}</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.category}</span>
                  <div className="flex items-center gap-1 text-xs"><Star size={10} className="text-amber-400 fill-amber-400"/><span className="text-gray-600">{p.rating||'—'}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">₹{(p.price/1000).toFixed(0)}K</span>
                  <span className={`text-xs font-semibold ${p.stock===0?'text-red-500':p.stock<5?'text-amber-600':'text-green-600'}`}>{p.stock===0?'Out of Stock':`${p.stock} in stock`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editTarget?'Edit Product':'Add New Product'}</h2>
              <button onClick={()=>setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="e.g. Kundan Bridal Necklace Set"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{categories.map(c=><option key={c}>{c}</option>)}</select>
                </div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Metal</label>
                  <select value={form.metal} onChange={e=>setForm(p=>({...p,metal:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{metals.map(m=><option key={m}>{m}</option>)}</select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Price (₹) *</label><input type="number" value={form.price||''} onChange={e=>setForm(p=>({...p,price:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="285000"/></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Weight</label><input value={form.weight} onChange={e=>setForm(p=>({...p,weight:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="45.2g"/></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Stock Qty</label><input type="number" value={form.stock||''} onChange={e=>setForm(p=>({...p,stock:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="5"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Status</label>
                <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value as any}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  <option value="active">Active</option><option value="out_of_stock">Out of Stock</option><option value="draft">Draft</option>
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] resize-none h-20" placeholder="Product description..."/></div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">{editTarget?'Save Changes':'Add Product'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Product Details</h2>
              <button onClick={()=>setViewTarget(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="h-32 bg-amber-50 rounded-xl flex items-center justify-center"><Package size={48} className="text-amber-200"/></div>
              <div className="font-bold text-gray-900 text-lg">{viewTarget.name}</div>
              <div className="grid grid-cols-2 gap-2">
                {[{l:'SKU',v:viewTarget.id},{l:'Category',v:viewTarget.category},{l:'Metal',v:viewTarget.metal},{l:'Weight',v:viewTarget.weight},{l:'Price',v:`₹${viewTarget.price.toLocaleString('en-IN')}`},{l:'Stock',v:`${viewTarget.stock} pcs`},{l:'Rating',v:viewTarget.rating||'—'},{l:'Sales',v:viewTarget.sales}].map(d=>(
                  <div key={d.l} className="bg-gray-50 rounded-lg p-3"><div className="text-[10px] text-gray-400">{d.l}</div><div className="text-sm font-semibold text-gray-900">{d.v}</div></div>
                ))}
              </div>
              {viewTarget.description && <div className="bg-gray-50 rounded-lg p-3"><div className="text-[10px] text-gray-400 mb-1">Description</div><div className="text-sm text-gray-700">{viewTarget.description}</div></div>}
              <button onClick={()=>{openEdit(viewTarget);setViewTarget(null)}} className="w-full bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">Edit Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Delete Product?</h2>
            <p className="text-sm text-gray-500">This will permanently delete <strong>{products.find(p=>p.id===confirmDelete)?.name}</strong>.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{ const p=products.find(p=>p.id===confirmDelete); if((p as any)?._catalog) deleteCatalogProduct(confirmDelete!); else deleteProduct(confirmDelete!); setConfirmDelete(null) }} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
