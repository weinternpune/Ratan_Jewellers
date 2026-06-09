import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdminRole = 'customer' | 'sales_staff' | 'inventory_manager' | 'store_manager' | 'admin' | 'super_admin'

export interface StaffAccount {
  id: string; name: string; email: string; phone: string
  role: AdminRole; avatar: string; status: 'active' | 'inactive'
}

interface AuthStore {
  currentUser: StaffAccount | null
  viewAsRole: AdminRole | null
  isLoggedIn: boolean
  managedStaff: StaffAccount[]

  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setViewAsRole: (role: AdminRole | null) => void
  getEffectiveRole: () => AdminRole
  createStaff: (data: { name:string; email:string; phone:string; password:string; role:AdminRole }) => Promise<{ success:boolean; error?:string; staff?:StaffAccount }>
  updateStaffStatus: (id: string, status: 'active'|'inactive') => void
  deleteStaff: (id: string) => void
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      viewAsRole: null,
      isLoggedIn: false,
      managedStaff: [],

      login: async (identifier, password) => {
        try {
          const res = await fetch(`${API}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
            credentials: 'include',
          })
          const data = await res.json()
          if (!data.success) return { success: false, error: data.message || 'Invalid credentials' }

          const u = data.data.user
          set({ currentUser: u, isLoggedIn: true, viewAsRole: null })
          // Store tokens for API calls
          if (typeof window !== 'undefined') {
            localStorage.setItem('ratan_access_token', data.data.accessToken)
            localStorage.setItem('ratan_refresh_token', data.data.refreshToken)
          }
          return { success: true }
        } catch {
          return { success: false, error: 'Cannot connect to server. Make sure the backend is running.' }
        }
      },

      logout: async () => {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('ratan_refresh_token') : null
          await fetch(`${API}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ratan_access_token') || ''}` },
            body: JSON.stringify({ refreshToken: token }),
            credentials: 'include',
          })
        } catch {}
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ratan_access_token')
          localStorage.removeItem('ratan_refresh_token')
        }
        set({ currentUser: null, isLoggedIn: false, viewAsRole: null })
      },

      setViewAsRole: (role) => {
        if (get().currentUser?.role !== 'super_admin') return
        set({ viewAsRole: role })
      },

      getEffectiveRole: () => {
        const { currentUser, viewAsRole } = get()
        if (!currentUser) return 'customer'
        if (currentUser.role === 'super_admin' && viewAsRole) return viewAsRole
        return currentUser.role
      },

      createStaff: async (data) => {
        const currentUser = get().currentUser
        if (currentUser?.role !== 'super_admin') return { success: false, error: 'Only Super Admin can create staff accounts' }
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('ratan_access_token') : ''
          const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name:data.name, email:data.email, phone:data.phone, password:data.password, role:data.role.toUpperCase().replace(/-/g,'_') }),
            credentials: 'include',
          })
          const result = await res.json()
          if (!result.success) return { success: false, error: result.message || 'Failed to create account' }
          const u = result.data.user
          const roleMap: Record<string,AdminRole> = { 'SUPER_ADMIN':'super_admin','ADMIN':'admin','STORE_MANAGER':'store_manager','INVENTORY_MANAGER':'inventory_manager','SALES_STAFF':'sales_staff' }
          const staff: StaffAccount = { id:u.id, name:u.name, email:u.email, phone:data.phone||'', role:roleMap[u.role]||data.role, avatar:u.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2), status:'active' }
          set(s => ({ managedStaff: [staff, ...s.managedStaff] }))
          return { success: true, staff }
        } catch { return { success: false, error: 'Server error' } }
      },

      updateStaffStatus: (id, status) => set(s => ({ managedStaff: s.managedStaff.map(st => st.id===id?{...st,status}:st) })),
      deleteStaff: (id) => set(s => ({ managedStaff: s.managedStaff.filter(st => st.id!==id) })),
    }),
    {
      name: 'ratan-auth-store',
      partialize: (s) => ({ currentUser:s.currentUser, viewAsRole:s.viewAsRole, isLoggedIn:s.isLoggedIn, managedStaff:s.managedStaff }),
    }
  )
)
