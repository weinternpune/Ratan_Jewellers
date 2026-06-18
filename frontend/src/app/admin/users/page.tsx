'use client'
import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Shield, X, UserCheck, UserX } from 'lucide-react'
import { useAuthStore, AdminRole, StaffAccount } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

const roleColors: Record<AdminRole, string> = {
  customer: 'bg-blue-100 text-blue-700 border-blue-200',
  sales_staff: 'bg-green-100 text-green-700 border-green-200',
  inventory_manager: 'bg-orange-100 text-orange-700 border-orange-200',
  store_manager: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-red-100 text-red-700 border-red-200',
  super_admin: 'bg-amber-100 text-amber-700 border-amber-200',
}
const roleLabels: Record<AdminRole, string> = {
  customer: 'Customer', sales_staff: 'Sales Staff',
  inventory_manager: 'Inv. Manager', store_manager: 'Store Manager',
  admin: 'Admin', super_admin: 'Super Admin',
}
const RBAC_TABLE = {
  customer:          { Website:'Full','E-Commerce':'Full',Billing:'Own Only',Inventory:'None',CRM:'Own',Analytics:'None',Admin:'None' },
  sales_staff:       { Website:'Full','E-Commerce':'View',Billing:'Create',Inventory:'View',CRM:'View',Analytics:'Sales Only',Admin:'None' },
  inventory_manager: { Website:'Full','E-Commerce':'None',Billing:'None',Inventory:'Full',CRM:'View',Analytics:'Inv Only',Admin:'None' },
  store_manager:     { Website:'Full','E-Commerce':'Full',Billing:'Full',Inventory:'Full',CRM:'Full',Analytics:'Full',Admin:'Limited' },
  admin:             { Website:'Full','E-Commerce':'Full',Billing:'Full',Inventory:'Full',CRM:'Full',Analytics:'Full',Admin:'Full' },
  super_admin:       { Website:'Full','E-Commerce':'Full',Billing:'Full',Inventory:'Full',CRM:'Full',Analytics:'Full',Admin:'Full + Settings' },
}
const permColor = (v: string) => v==='None'?'bg-gray-100 text-gray-400':(v==='Full'||v==='Full + Settings')?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'
const avatarColors = ['bg-amber-400','bg-blue-400','bg-green-400','bg-purple-400','bg-red-400','bg-teal-400']
const STAFF_ROLES: AdminRole[] = ['admin','store_manager','inventory_manager','sales_staff']

export default function UsersPage() {
  const { currentUser, managedStaff, createStaff, updateStaffStatus, deleteStaff, getEffectiveRole } = useAuthStore()
  const { customers } = useAdminStore()
  const role = getEffectiveRole()
  const isSuperAdmin = currentUser?.role === 'super_admin'

  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<AdminRole|'all'>('all')
  const [activeTab, setActiveTab] = useState<'staff'|'customers'|'rbac'>('staff')
  const [showModal, setShowModal] = useState(false)
  const [viewTarget, setViewTarget] = useState<StaffAccount|null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirmPassword:'', role:'sales_staff' as AdminRole })
  const [formError, setFormError] = useState('')
  const [dbUsers, setDbUsers] = useState<StaffAccount[]>([])

  const modules = ['Website','E-Commerce','Billing','Inventory','CRM','Analytics','Admin']

const fetchUsers = async () => {
  try {
    const users = await api.get<any[]>('/admin/users')

    setDbUsers(
      users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase(),
        status: u.isActive ? 'active' : 'inactive',
      }))
    )
  } catch (error) {
    console.error('Failed to load users', error)
  }
}
useEffect(() => {
  fetchUsers()
}, [])

  // Combine env-configured staff (shown as locked) + super admin created staff
 
  const allStaff = dbUsers
  const filteredStaff = allStaff.filter(u =>
    (filterRole==='all'||u.role===filterRole) &&
    (u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()))
  )
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())||c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    setFormError('')
    if (!form.name||!form.email||!form.password) { setFormError('Name, email and password are required'); return }
    if (form.password !== form.confirmPassword) { setFormError('Passwords do not match'); return }
    if (form.password.length < 8) { setFormError('Password must be at least 8 characters'); return }
    setCreating(true)
    const result = await createStaff({ name:form.name, email:form.email, phone:form.phone, password:form.password, role:form.role })
    setCreating(false)
    if (result.success) {
  await fetchUsers()

  toast.success(`${roleLabels[form.role]} "${form.name}" created`)

  setShowModal(false)

  setForm({
    name:'',
    email:'',
    phone:'',
    password:'',
    confirmPassword:'',
    role:'sales_staff'
  })
} else {
      setFormError(result.error || 'Failed to create account')
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-sm text-gray-500 mt-0.5">Staff accounts, customers & permissions</p></div>
        {isSuperAdmin && (
          <button onClick={()=>setShowModal(true)} className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]">
            <Plus size={15}/>Create Staff Account
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['staff','customers','rbac'] as const).map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab===t?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
            {t==='rbac'?'RBAC Matrix':t==='staff'?`Staff (${allStaff.length})`:`Customers (${customers.length})`}
          </button>
        ))}
      </div>

      {activeTab==='staff' && (<>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 min-w-[200px]">
            <Search size={14} className="text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..." className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"/>
          </div>
          <select value={filterRole} onChange={e=>setFilterRole(e.target.value as any)} className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer">
            <option value="all">All Roles</option>
            {(Object.keys(roleLabels) as AdminRole[]).map(r=><option key={r} value={r}>{roleLabels[r]}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name','Role','Status','Source','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStaff.map((u,idx)=>(
                  <tr key={u.id} className="hover:bg-gray-50/60 group">
                    <td className="px-5 py-4"><div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarColors[idx%avatarColors.length]} flex items-center justify-center text-white text-xs font-bold`}>{u.avatar||u.name.slice(0,2).toUpperCase()}</div>
                      <div><div className="text-sm font-semibold text-gray-900">{u.name}</div><div className="text-xs text-gray-400">{u.email}</div></div>
                    </div></td>
                    <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColors[u.role]}`}>{roleLabels[u.role]}</span></td>
                    <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-1 rounded-full ${u.status==='active'?'bg-green-50 text-green-600':'bg-gray-100 text-gray-500'}`}>{u.status}</span></td>
                    <td className="px-5 py-4"><span className="text-xs text-gray-400">{u.id==='SA001'?'ENV config':'Super Admin'}</span></td>
                    <td className="px-5 py-4">
                      {isSuperAdmin && u.id!=='SA001' && (
                        <div className="flex gap-1">
                          <button onClick={()=>updateStaffStatus(u.id,u.status==='active'?'inactive':'active')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800" title={u.status==='active'?'Deactivate':'Activate'}>
                            {u.status==='active'?<UserX size={14}/>:<UserCheck size={14}/>}
                          </button>
                          <button onClick={()=>setConfirmDelete(u.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isSuperAdmin && <div className="px-5 py-3 border-t border-gray-50 text-xs text-amber-600 flex items-center gap-2"><Shield size={12}/>Only Super Admin can create or manage staff accounts</div>}
        </div>
      </>)}

      {activeTab==='customers' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Customer','Email','City','Tier','Joined','Orders'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map((c,idx)=>(
                  <tr key={c.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4"><div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColors[idx%avatarColors.length]} flex items-center justify-center text-white text-xs font-bold`}>{c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                      <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    </div></td>
                    <td className="px-5 py-4 text-xs text-gray-500">{c.email}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">{c.city||'—'}</td>
                    <td className="px-5 py-4"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.tier==='platinum'?'bg-purple-100 text-purple-700':c.tier==='gold'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>{c.tier}</span></td>
                    <td className="px-5 py-4 text-xs text-gray-500">{c.lastVisit}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-700">{c.orders}</td>
                  </tr>
                ))}
                {filteredCustomers.length===0&&<tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No customers yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='rbac' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50"><h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Shield size={15} className="text-[#C9A84C]"/>Role-Based Access Control Matrix</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0D0700]"><tr><th className="text-left px-5 py-4 text-xs font-semibold text-[#C9A84C] uppercase tracking-wider">Role</th>{modules.map(m=><th key={m} className="text-center px-4 py-4 text-xs font-semibold text-white/70 uppercase tracking-wider whitespace-nowrap">{m}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(Object.keys(RBAC_TABLE) as AdminRole[]).map((r,idx)=>(
                  <tr key={r} className={`hover:bg-amber-50/30 ${idx%2===0?'bg-white':'bg-gray-50/40'}`}>
                    <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border ${roleColors[r]}`}>{roleLabels[r]}</span></td>
                    {modules.map(m=>{ const val=(RBAC_TABLE[r] as any)[m]; return <td key={m} className="px-4 py-4 text-center"><span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${permColor(val)} whitespace-nowrap`}>{val}</span></td> })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Modal — Super Admin only */}
      {showModal && isSuperAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Create Staff Account</h2>
              <button onClick={()=>setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                <Shield size={12}/>Only you (Super Admin) can create staff accounts
              </div>
              {[{l:'Full Name *',k:'name',ph:'Staff member name'},{l:'Email *',k:'email',ph:'staff@ratanjewellers.com'},{l:'Phone',k:'phone',ph:'+91 XXXXX XXXXX'}].map(f=>(
                <div key={f.k}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.l}</label>
                  <input value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder={f.ph}/>
                </div>
              ))}
              <div><label className="text-xs font-semibold text-gray-600 mb-1.5 block">Role</label>
                <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value as AdminRole}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C] cursor-pointer">
                  {STAFF_ROLES.map(r=><option key={r} value={r}>{roleLabels[r]}</option>)}
                </select>
              </div>
              {[{l:'Password * (min 8 chars)',k:'password',ph:'Strong password'},{l:'Confirm Password *',k:'confirmPassword',ph:'Repeat password'}].map(f=>(
                <div key={f.k}><label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.l}</label>
                  <input type="password" value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A84C]" placeholder={f.ph}/>
                </div>
              ))}
              {formError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">{formError}</div>}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00] disabled:opacity-60">
                {creating?'Creating...':'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Delete Staff Account?</h2>
            <p className="text-sm text-gray-500">This will permanently remove this staff account.</p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirmDelete(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{deleteStaff(confirmDelete!);setConfirmDelete(null);toast.success('Staff account deleted')}} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
