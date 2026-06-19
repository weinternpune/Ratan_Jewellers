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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null, viewAsRole: null,
      isLoggedIn: false, managedStaff: [],

      // ── Login — calls Express backend via the shared apiClient ────────
      login: async (identifier, password) => {
        try {
          const result = await api.post<{ user: any; accessToken: string; refreshToken: string }>(
            '/auth/admin/login',
            { identifier: identifier.trim(), password: password.trim() }
          )
          const { user, accessToken, refreshToken } = result.data
          // accessToken / refreshToken are the ONLY token keys in the app —
          // written here so the shared apiClient interceptor can read/refresh them.
          writeTokens(accessToken, refreshToken)
          set({ currentUser: { id:user.id, name:user.name, email:user.email, phone:user.phone, role:user.role.toLowerCase() as AdminRole, avatar:user.avatar, status:'active' }, isLoggedIn:true, viewAsRole:null })
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err?.response?.data?.message || 'Could not reach server. Check your connection.' }
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