'use client'
import { useState,useEffect } from 'react'
import { Search, Plus, Phone, Mail, Star, Users, MessageCircle, Eye, Edit2, Trash2, X, Gift, Tag, IndianRupee } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

const tierConfig: Record<CustomerTier,{label:string;color:string}> = {
  bronze:{label:'Bronze',color:'bg-orange-100 text-orange-700'},
  silver:{label:'Silver',color:'bg-gray-100 text-gray-600'},
  gold:{label:'Gold',color:'bg-amber-100 text-amber-700'},
  platinum:{label:'Platinum',color:'bg-purple-100 text-purple-700'},
}

const emptyCustomer: Omit<Customer,'id'> = { name:'', phone:'', email:'', city:'', totalSpend:0, orders:0, tier:'bronze', lastVisit: new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), birthday:'', tags:[], notes:'' }

export default function CRMPage() {
 const [customers, setCustomers] = useState<any[]>([])
const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<CustomerTier|'all'>('all')
  const [selected, setSelected] = useState<Customer|null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Customer|null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null)
  const [form, setForm] = useState(emptyCustomer)
  const [newTag, setNewTag] = useState('')
  const [activeTab, setActiveTab] = useState<'customers'|'followup'|'campaigns'>('customers')

  useEffect(() => {
  const loadCustomers = async () => {
    try {
      const data = await api.get<any[]>('/customers')

      const mapped = data.map((c: any) => ({
        id: c.id,
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        city: '',
        totalSpend: c.totalSpend || 0,
        orders: 0,
        tier:
          c.totalSpend > 1000000
            ? 'platinum'
            : c.totalSpend > 500000
            ? 'gold'
            : c.totalSpend > 100000
            ? 'silver'
            : 'bronze',
        lastVisit: new Date(c.createdAt).toLocaleDateString('en-IN'),
        birthday: '',
        tags: [],
        notes: '',
      }))

      setCustomers(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  loadCustomers()
}, [])
  const filtered = customers.filter(c =>
    (tierFilter==='all'||c.tier===tierFilter) &&
    (c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search)||c.email.toLowerCase().includes(search.toLowerCase()))
  )

  // const openAdd = () => { setForm(emptyCustomer); setEditTarget(null); setShowAdd(true) }
  // const openEdit = (c: Customer) => { setForm({name:c.name,phone:c.phone,email:c.email,city:c.city,totalSpend:c.totalSpend,orders:c.orders,tier:c.tier,lastVisit:c.lastVisit,birthday:c.birthday,tags:[...c.tags],notes:c.notes||''}); setEditTarget(c); setShowAdd(true) }

  // const handleSubmit = () => {
  //   if (!form.name.trim()) { toast.error('Customer name required'); return }
  //   if (editTarget) updateCustomer(editTarget.id, form)
  //   else addCustomer(form)
  //   setShowAdd(false)
  // }

  const handleWhatsApp = (phone: string, name: string) => {
    const msg = encodeURIComponent(`Hi ${name}, this is Ratan Jewellers. How can we assist you today?`)
    window.open(`https://wa.me/${phone.replace(/\D/g,'')}?text=${msg}`, '_blank')
  }

  const upcoming = customers.filter(c => {
    if (!c.birthday) return false
    const parts = c.birthday.split(' ')
    if (parts.length < 2) return false
    const months: Record<string,number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11}
    const now = new Date()
    const bday = new Date(now.getFullYear(), months[parts[1]]||0, parseInt(parts[0]))
    if (bday < now) bday.setFullYear(now.getFullYear()+1)
    const diff = (bday.getTime()-now.getTime())/(1000*60*60*24)
    return diff>=0 && diff<=30
  })

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">CRM</h1><p className="text-sm text-gray-500 mt-0.5">Customer relationships, loyalty & follow-ups</p></div>
       <button
  disabled
  className="flex items-center gap-2 bg-gray-300 text-gray-500 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
>
  <Plus size={15}/>
  Customer Registration Only
</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Users size={14} className="text-blue-500"/><span className="text-xs text-gray-500">Total</span></div><div className="text-2xl font-bold text-gray-900">{customers.length}</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Star size={14} className="text-purple-500"/><span className="text-xs text-gray-500">Platinum/Gold</span></div><div className="text-2xl font-bold text-purple-600">{customers.filter(c=>c.tier==='platinum'||c.tier==='gold').length}</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><Gift size={14} className="text-pink-500"/><span className="text-xs text-gray-500">Birthdays (30d)</span></div><div className="text-2xl font-bold text-pink-600">{upcoming.length}</div></div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><div className="flex items-center gap-2 mb-2"><IndianRupee size={14} className="text-green-500"/><span className="text-xs text-gray-500">Avg CLV</span></div><div className="text-lg font-bold text-green-600">₹{customers.length>0?((customers.reduce((a,c)=>a+c.totalSpend,0)/customers.length)/100000).toFixed(1):0}L</div></div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['customers','followup','campaigns'] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab===t?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>{t==='followup'?'Follow-ups':t}</button>
        ))}
      </div>

      {activeTab==='customers' && (<>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5"><Search size={14} className="text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers..." className="flex-1 text-sm outline-none placeholder-gray-400 text-gray-700"/></div>
          <div className="flex gap-2 flex-wrap">
            {(['all','platinum','gold','silver','bronze'] as const).map(t=>(
              <button key={t} onClick={()=>setTierFilter(t)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors ${tierFilter===t?'bg-[#0D0700] text-[#C9A84C]':'bg-white border border-gray-200 text-gray-600'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c=>(
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{c.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div><div className="font-semibold text-gray-900 text-sm">{c.name}</div><div className="text-xs text-gray-400">{c.city}</div></div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tierConfig[c.tier].color}`}>{tierConfig[c.tier].label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2.5"><div className="text-[10px] text-gray-400 mb-0.5">Total Spend</div><div className="text-sm font-bold text-gray-900">₹{(c.totalSpend/100000).toFixed(1)}L</div></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><div className="text-[10px] text-gray-400 mb-0.5">Orders</div><div className="text-sm font-bold text-gray-900">{c.orders}</div></div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">{c.tags.map(tag=><span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{tag}</span>)}</div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="text-[10px] text-gray-400">Last: {c.lastVisit}</div>
                <div className="flex gap-1">
                  <button onClick={()=>handleWhatsApp(c.phone,c.name)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="WhatsApp"><MessageCircle size={12}/></button>
                  <a href={`mailto:${c.email}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Email"><Mail size={12}/></a>
                  <a href={`tel:${c.phone}`} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Call"><Phone size={12}/></a>
                  <button onClick={()=>setSelected(c)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="View"><Eye size={12}/></button>
                  <button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Edit"><Edit2 size={12}/></button>
                  <button onClick={()=>setConfirmDelete(c.id)} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors" title="Delete"><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>)}

      {activeTab==='followup' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50"><h3 className="font-semibold text-gray-800 text-sm">Birthday Follow-ups (Next 30 Days)</h3></div>
          <div className="divide-y divide-gray-50">
            {upcoming.length>0 ? upcoming.map(c=>(
              <div key={c.id} className="flex items-center px-5 py-4 hover:bg-gray-50/50 gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{c.name.split(' ').map(n=>n[0]).join('')}</div>
                <div className="flex-1"><div className="font-medium text-gray-900 text-sm">{c.name}</div><div className="text-xs text-gray-400">{c.phone}</div></div>
                <div className="text-center"><div className="text-xs font-semibold text-pink-600">🎂 {c.birthday}</div><div className={`text-[10px] px-2 py-0.5 rounded-full ${tierConfig[c.tier].color}`}>{tierConfig[c.tier].label}</div></div>
                <div className="flex gap-2">
                  <button onClick={()=>handleWhatsApp(c.phone,c.name)} className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100"><MessageCircle size={11}/>WhatsApp</button>
                  <a href={`mailto:${c.email}?subject=Birthday Wishes from Ratan Jewellers&body=Dear ${c.name}, wishing you a wonderful birthday...`} className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-100"><Mail size={11}/>Email</a>
                </div>
              </div>
            )) : <div className="px-5 py-12 text-center text-gray-400 text-sm">No upcoming birthdays in next 30 days</div>}
          </div>
        </div>
      )}

      {activeTab==='campaigns' && (
        <div className="space-y-4">
          {[{name:'Platinum Member Exclusive',target:'Platinum',status:'active',reach:customers.filter(c=>c.tier==='platinum').length,channel:'WhatsApp + Email'},{name:'Birthday Week Offer — June',target:'All Tiers',status:'scheduled',reach:upcoming.length,channel:'WhatsApp'},{name:'Festive Season Pre-Launch',target:'Gold + Platinum',status:'draft',reach:customers.filter(c=>c.tier==='gold'||c.tier==='platinum').length,channel:'SMS + Email'}].map(campaign=>(
            <div key={campaign.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1"><div className="font-semibold text-gray-900">{campaign.name}</div><div className="text-xs text-gray-400 mt-1">Target: {campaign.target} · {campaign.channel} · {campaign.reach} recipients</div></div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${campaign.status==='active'?'bg-green-50 text-green-600':campaign.status==='scheduled'?'bg-blue-50 text-blue-600':'bg-gray-100 text-gray-500'}`}>{campaign.status}</span>
                <button onClick={()=>toast.success(`Campaign "${campaign.name}" launched`)} className="text-xs bg-[#0D0700] text-[#C9A84C] px-3 py-1.5 rounded-lg font-medium hover:bg-[#1a0e00]">Launch</button>
              </div>
            </div>
          ))}
          <button onClick={()=>toast('Campaign builder coming soon')} className="flex items-center gap-2 text-sm text-[#C9A84C] font-medium hover:underline"><Plus size={14}/>Create Campaign</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editTarget?'Edit Customer':'Add Customer'}</h2>
              <button onClick={()=>setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[{l:'Full Name *',k:'name',ph:'Customer name'},{l:'Phone',k:'phone',ph:'+91 XXXXX XXXXX'},{l:'Email',k:'email',ph:'email@example.com'},{l:'City',k:'city',ph:'City name'},{l:'Birthday (e.g. 15 Aug)',k:'birthday',ph:'15 Aug'}].map(f=>(
                <div key={f.k}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.l}</label><input value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder={f.ph}/></div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tier</label><select value={form.tier} onChange={e=>setForm(p=>({...p,tier:e.target.value as CustomerTier}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">{(Object.keys(tierConfig) as CustomerTier[]).map(t=><option key={t} value={t}>{tierConfig[t].label}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Total Spend (₹)</label><input type="number" value={form.totalSpend||''} onChange={e=>setForm(p=>({...p,totalSpend:Number(e.target.value)}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder="0"/></div>
              </div>
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Notes</label><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] resize-none h-16" placeholder="Customer notes..."/></div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowAdd(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]">{editTarget?'Save Changes':'Add Customer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex"><div className="absolute inset-0 bg-black/40" onClick={()=>setSelected(null)}/>
          <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">Customer Profile</h2>
              <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">{selected.name.split(' ').map(n=>n[0]).join('')}</div>
                <div className="font-bold text-gray-900 text-lg">{selected.name}</div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${tierConfig[selected.tier].color}`}>{tierConfig[selected.tier].label} Member</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{l:'Total Spend',v:`₹${(selected.totalSpend/100000).toFixed(1)}L`},{l:'Orders',v:selected.orders},{l:'City',v:selected.city},{l:'Birthday',v:selected.birthday||'—'},{l:'Last Visit',v:selected.lastVisit},{l:'Avg Order',v:selected.orders>0?`₹${((selected.totalSpend/selected.orders)/1000).toFixed(0)}K`:'—'}].map(d=>(
                  <div key={d.l} className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-400 mb-1">{d.l}</div><div className="text-sm font-semibold text-gray-900">{d.v}</div></div>
                ))}
              </div>
              {/* Tags */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2 mb-2">{selected.tags.map(tag=>(
                  <span key={tag} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {tag}<button onClick={()=>removeCustomerTag(selected.id,tag)} className="hover:text-red-500"><X size={10}/></button>
                  </span>
                ))}</div>
                <div className="flex gap-2">
                  <input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="Add tag..." className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#C9A84C]" onKeyDown={e=>{if(e.key==='Enter'&&newTag.trim()){addCustomerTag(selected.id,newTag.trim());setNewTag('')}}}/>
                  <button onClick={()=>{if(newTag.trim()){addCustomerTag(selected.id,newTag.trim());setNewTag('')}}} className="bg-[#0D0700] text-[#C9A84C] px-3 py-1.5 rounded-lg text-xs font-semibold">Add</button>
                </div>
              </div>
              {selected.notes && <div className="bg-gray-50 rounded-xl p-3"><div className="text-xs text-gray-400 mb-1">Notes</div><div className="text-sm text-gray-700">{selected.notes}</div></div>}
              <div className="flex gap-2">
                <button onClick={()=>handleWhatsApp(selected.phone,selected.name)} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-green-600"><MessageCircle size={14}/>WhatsApp</button>
                <button onClick={()=>{openEdit(selected);setSelected(null)}} className="flex-1 flex items-center justify-center gap-2 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00]"><Edit2 size={14}/>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Delete Customer?</h2>
            <p className="text-sm text-gray-500">This will permanently delete <strong>{customers.find(c=>c.id===confirmDelete)?.name}</strong>.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{deleteCustomer(confirmDelete!);setConfirmDelete(null);setSelected(null)}} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
