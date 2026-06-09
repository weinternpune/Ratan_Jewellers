import { create } from 'zustand'

export type AdminRole = 'customer'|'sales_staff'|'inventory_manager'|'store_manager'|'admin'|'super_admin'

export interface StaffAccount {
  id: string; name: string; email: string; phone: string
  role: AdminRole; avatar: string; status: 'active'|'inactive'
}

interface AuthStore {
  currentUser: StaffAccount|null
  viewAsRole: AdminRole|null
  isLoggedIn: boolean
  managedStaff: StaffAccount[]
  _hydrated: boolean

  login: (identifier:string, password:string) => Promise<{success:boolean;error?:string}>
  logout: () => Promise<void>
  validateSession: () => Promise<boolean>
  setViewAsRole: (role:AdminRole|null) => void
  getEffectiveRole: () => AdminRole
  createStaff: (data:{name:string;email:string;phone:string;password:string;role:AdminRole}) => Promise<{success:boolean;error?:string;staff?:StaffAccount}>
  updateStaffStatus: (id:string, status:'active'|'inactive') => void
  deleteStaff: (id:string) => void
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('ratan_access_token') : null)
const clearTokens = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('ratan_access_token')
  localStorage.removeItem('ratan_refresh_token')
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  currentUser: null,
  viewAsRole: null,
  isLoggedIn: false,
  managedStaff: [],
  _hydrated: false,

  // ── Validate token with backend — called on every page load ──────────────
  validateSession: async () => {
    const token = getToken()
    if (!token) { set({ currentUser:null, isLoggedIn:false, _hydrated:true }); return false }
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      if (!res.ok) { clearTokens(); set({ currentUser:null, isLoggedIn:false, _hydrated:true }); return false }
      const data = await res.json()
      if (!data.success || !data.data?.user) { clearTokens(); set({ currentUser:null, isLoggedIn:false, _hydrated:true }); return false }
      const u = data.data.user
      const roleMap: Record<string,AdminRole> = {
        SUPER_ADMIN:'super_admin',ADMIN:'admin',STORE_MANAGER:'store_manager',
        INVENTORY_MANAGER:'inventory_manager',SALES_STAFF:'sales_staff',CUSTOMER:'customer',
      }
      const staff: StaffAccount = {
        id:u._id||u.id, name:u.name, email:u.email, phone:u.phone||'',
        role:roleMap[u.role]||'customer',
        avatar:u.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2),
        status:'active',
      }
      if (staff.role === 'customer') { clearTokens(); set({ currentUser:null, isLoggedIn:false, _hydrated:true }); return false }
      set({ currentUser:staff, isLoggedIn:true, _hydrated:true })
      return true
    } catch {
      clearTokens(); set({ currentUser:null, isLoggedIn:false, _hydrated:true }); return false
    }
  },

  // ── Login — backend only, no fallback ────────────────────────────────────
  login: async (identifier, password) => {
    try {
      const res = await fetch(`${API}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier:identifier.trim(), password:password.trim() }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || !data.success) return { success:false, error: data.message||'Invalid credentials' }

      const u = data.data.user
      localStorage.setItem('ratan_access_token', data.data.accessToken)
      localStorage.setItem('ratan_refresh_token', data.data.refreshToken)
      set({ currentUser:u, isLoggedIn:true, viewAsRole:null, _hydrated:true })
      return { success:true }
    } catch {
      return { success:false, error:'Cannot connect to server. Make sure the backend is running.' }
    }
  },

  // ── Logout — clear backend session + local tokens ────────────────────────
  logout: async () => {
    try {
      const token = getToken()
      await fetch(`${API}/auth/logout`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token||''}` },
        body: JSON.stringify({ refreshToken: localStorage.getItem('ratan_refresh_token') }),
        credentials:'include',
      })
    } catch {}
    clearTokens()
    set({ currentUser:null, isLoggedIn:false, viewAsRole:null })
  },

  setViewAsRole: (role) => {
    if (get().currentUser?.role !== 'super_admin') return
    set({ viewAsRole:role })
  },

  getEffectiveRole: () => {
    const { currentUser, viewAsRole } = get()
    if (!currentUser) return 'customer'
    if (currentUser.role === 'super_admin' && viewAsRole) return viewAsRole
    return currentUser.role
  },

  createStaff: async (data) => {
    if (get().currentUser?.role !== 'super_admin') return { success:false, error:'Only Super Admin can create staff accounts' }
    try {
      const token = getToken()
      const res = await fetch(`${API}/auth/register`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token||''}` },
        body: JSON.stringify({ name:data.name, email:data.email, phone:data.phone, password:data.password, role:data.role.toUpperCase().replace(/-/g,'_') }),
        credentials:'include',
      })
      const result = await res.json()
      if (!result.success) return { success:false, error: result.message||'Failed to create account' }
      const u = result.data.user
      const roleMap: Record<string,AdminRole> = { SUPER_ADMIN:'super_admin',ADMIN:'admin',STORE_MANAGER:'store_manager',INVENTORY_MANAGER:'inventory_manager',SALES_STAFF:'sales_staff' }
      const staff: StaffAccount = { id:u._id||u.id, name:u.name, email:u.email, phone:data.phone||'', role:roleMap[u.role]||data.role, avatar:u.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2), status:'active' }
      set(s => ({ managedStaff:[staff,...s.managedStaff] }))
      return { success:true, staff }
    } catch { return { success:false, error:'Server error' } }
  },

  updateStaffStatus: (id, status) => set(s => ({ managedStaff:s.managedStaff.map(st => st.id===id?{...st,status}:st) })),
  deleteStaff: (id) => set(s => ({ managedStaff:s.managedStaff.filter(st => st.id!==id) })),
}))
