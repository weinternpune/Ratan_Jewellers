import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdminRole = 'customer' | 'sales_staff' | 'inventory_manager' | 'store_manager' | 'admin' | 'super_admin'

export interface StaffAccount {
  id: string; name: string; email: string; phone?: string
  role: AdminRole; avatar?: string; status: 'active' | 'inactive'
}

interface AuthStore {
  currentUser: StaffAccount | null
  accessToken: string | null
  viewAsRole: AdminRole | null
  isLoggedIn: boolean
  managedStaff: StaffAccount[]
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setViewAsRole: (role: AdminRole | null) => void
  getEffectiveRole: () => AdminRole
  createStaff: (data: { name: string; email: string; phone?: string; password: string; role: AdminRole }) => Promise<{ success: boolean; error?: string; staff?: StaffAccount }>
  updateStaffStatus: (id: string, status: 'active' | 'inactive') => void
  deleteStaff: (id: string) => void
}

const API = () => (typeof window !== 'undefined' && (window as any).__NEXT_PUBLIC_API_URL__) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null, accessToken: null, viewAsRole: null,
      isLoggedIn: false, managedStaff: [],

      // ── Login — calls Express backend ─────────────────────────────────
      login: async (identifier, password) => {
        try {
          const res  = await fetch(`${API()}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
          })
          const data = await res.json()
          if (!data.success) return { success: false, error: data.message || 'Invalid credentials' }

          const { user, accessToken, refreshToken } = data.data
          if (typeof window !== 'undefined') {
            localStorage.setItem('adminAccessToken', accessToken)
            localStorage.setItem('adminRefreshToken', refreshToken)
          }
          set({ currentUser: { id:user.id, name:user.name, email:user.email, phone:user.phone, role:user.role.toLowerCase() as AdminRole, avatar:user.avatar, status:'active' }, accessToken, isLoggedIn:true, viewAsRole:null })
          return { success: true }
        } catch {
          return { success: false, error: 'Could not reach server. Check your connection.' }
        }
      },

      // ── Logout ────────────────────────────────────────────────────────
      logout: async () => {
        try {
          const rt = localStorage.getItem('adminRefreshToken')
          if (rt) await fetch(`${API()}/auth/logout`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${get().accessToken}` }, body: JSON.stringify({ refreshToken:rt }) })
        } catch {}
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminRefreshToken')
        set({ currentUser:null, accessToken:null, isLoggedIn:false, viewAsRole:null })
      },

      setViewAsRole: (role) => { if (get().currentUser?.role === 'super_admin') set({ viewAsRole: role }) },
      getEffectiveRole: () => { const { currentUser, viewAsRole } = get(); if (!currentUser) return 'customer'; if (currentUser.role === 'super_admin' && viewAsRole) return viewAsRole; return currentUser.role },

      // ── Create Staff — calls Express backend ──────────────────────────
      createStaff: async (data) => {
        if (get().currentUser?.role !== 'super_admin') return { success: false, error: 'Only Super Admin can create staff accounts' }
        try {
          const res    = await fetch(`${API()}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json', Authorization:`Bearer ${get().accessToken}` },
            body: JSON.stringify({ ...data, role: data.role.toUpperCase() }),
          })
          const result = await res.json()
          if (!result.success) return { success: false, error: result.message }
          const staff: StaffAccount = { id:result.data.user.id, name:result.data.user.name, email:result.data.user.email, role:data.role, status:'active' }
          set(s => ({ managedStaff: [staff, ...s.managedStaff] }))
          return { success: true, staff }
        } catch { return { success: false, error: 'Server error. Try again.' } }
      },

      updateStaffStatus: (id, status) => set(s => ({ managedStaff: s.managedStaff.map(st => st.id === id ? { ...st, status } : st) })),
      deleteStaff: (id) => set(s => ({ managedStaff: s.managedStaff.filter(st => st.id !== id) })),
    }),
    { name: 'ratan-auth-store', partialize: (s) => ({ currentUser:s.currentUser, viewAsRole:s.viewAsRole, isLoggedIn:s.isLoggedIn, managedStaff:s.managedStaff }) }
  )
)
