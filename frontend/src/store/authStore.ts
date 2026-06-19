import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, writeTokens, clearTokens, readRefreshToken } from '@/lib/api'

export type AdminRole = 'customer' | 'sales_staff' | 'inventory_manager' | 'store_manager' | 'admin' | 'super_admin'

export interface StaffAccount {
  id: string; name: string; email: string; phone?: string
  role: AdminRole; avatar?: string; status: 'active' | 'inactive'
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
  createStaff: (data: { name: string; email: string; phone?: string; password: string; role: AdminRole }) => Promise<{ success: boolean; error?: string; staff?: StaffAccount }>
  updateStaffStatus: (id: string, status: 'active' | 'inactive') => void
  deleteStaff: (id: string) => Promise<{ success: boolean; error?: string }>
}

const API = () => 'http://localhost:5000/api'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null, viewAsRole: null,
      isLoggedIn: false, managedStaff: [],

      // ── Login — calls Express backend via the shared apiClient ────────
      login: async (identifier, password) => {
        try {
          console.log('🔐 Starting login process...', { identifier, apiUrl: API() })
          
          const res = await fetch(`${API()}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
          })
          
          console.log('📡 API Response status:', res.status)
          const data = await res.json()
          console.log('📊 API Response data:', data)
          
          if (!data.success) {
            console.log('❌ Login failed:', data.message)
            return { success: false, error: data.message || 'Invalid credentials' }
          }

          const { user, accessToken, refreshToken } = data.data
          console.log('✅ Login successful, storing tokens...', { 
            userId: user.id, 
            userRole: user.role,
            tokenLength: accessToken?.length 
          })
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('adminAccessToken', accessToken)
            localStorage.setItem('adminRefreshToken', refreshToken)
            console.log('💾 Tokens stored in localStorage')
          }
          
          const userAccount = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role.toLowerCase() as AdminRole,
            avatar: user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            status: 'active' as const
          }
          
          set({ 
            currentUser: userAccount, 
            accessToken, 
            isLoggedIn: true, 
            viewAsRole: null 
          })
          
          console.log('🎉 Login process completed successfully!')
          return { success: true }
        } catch (error) {
          console.error('💥 Login error:', error)
          return { success: false, error: 'Could not reach server. Check your connection.' }
        }
      },

      // ── Logout ────────────────────────────────────────────────────────
     logout: async () => {
  try {
    const rt = readRefreshToken()

    if (rt) {
      await api.post('/auth/logout', {
        refreshToken: rt,
      })
    }
  } catch {}

  clearTokens()

  set({
    currentUser: null,
    isLoggedIn: false,
    viewAsRole: null,
  })
},

      setViewAsRole: (role) => { if (get().currentUser?.role === 'super_admin') set({ viewAsRole: role }) },
      getEffectiveRole: () => { const { currentUser, viewAsRole } = get(); if (!currentUser) return 'customer'; if (currentUser.role === 'super_admin' && viewAsRole) return viewAsRole; return currentUser.role },

      // ── Create Staff — calls Express backend via the shared apiClient ──
      createStaff: async (data) => {
        if (get().currentUser?.role !== 'super_admin') return { success: false, error: 'Only Super Admin can create staff accounts' }
        try {
          const result = await api.post<{ user: any }>('/auth/register', { ...data, role: data.role.toUpperCase() })
          const staff: StaffAccount = { id:result.data.user.id, name:result.data.user.name, email:result.data.user.email, role:data.role, status:'active' }
          set(s => ({ managedStaff: [staff, ...s.managedStaff] }))
          return { success: true, staff }
        } catch (err: any) {
          return { success: false, error: err?.response?.data?.message || 'Server error. Try again.' }
        }
      },

      updateStaffStatus: (id, status) => set(s => ({ managedStaff: s.managedStaff.map(st => st.id === id ? { ...st, status } : st) })),
      deleteStaff: async (id) => {
  try {
    await api.delete(`/admin/users/${id}`)

    set((state) => ({
      managedStaff: state.managedStaff.filter((staff) => staff.id !== id),
    }))

    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.response?.data?.message ||
        'Failed to delete staff account',
    }
  }
},
    }),
    { name: 'ratan-auth-store', partialize: (s) => ({ currentUser:s.currentUser, viewAsRole:s.viewAsRole, isLoggedIn:s.isLoggedIn, managedStaff:s.managedStaff }) }
  )
)