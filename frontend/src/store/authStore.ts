import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdminRole = 'customer' | 'sales_staff' | 'inventory_manager' | 'store_manager' | 'admin' | 'super_admin'

export interface StaffAccount {
  id: string
  name: string
  email: string
  phone: string
  role: AdminRole
  avatar: string
  status: 'active' | 'inactive'
  // NOTE: password is NEVER stored client-side
}

interface AuthStore {
  currentUser: StaffAccount | null
  viewAsRole: AdminRole | null
  isLoggedIn: boolean
  // Staff created by super admin (stored client-side for display only)
  managedStaff: StaffAccount[]

  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setViewAsRole: (role: AdminRole | null) => void
  getEffectiveRole: () => AdminRole
  createStaff: (data: {
    name: string; email: string; phone: string
    password: string; role: AdminRole
  }) => Promise<{ success: boolean; error?: string; staff?: StaffAccount }>
  updateStaffStatus: (id: string, status: 'active' | 'inactive') => void
  deleteStaff: (id: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      viewAsRole: null,
      isLoggedIn: false,
      managedStaff: [],

      // ── Login via secure server API ────────────────────────────────────
      login: async (identifier, password) => {
        try {
          const res = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
            credentials: 'include',
          })
          const data = await res.json()

          if (!data.success) {
            return { success: false, error: data.error || 'Invalid credentials' }
          }

          // Store user info (no password)
          set({
            currentUser: {
              id:     data.user.id,
              name:   data.user.name,
              email:  data.user.email,
              phone:  data.user.phone,
              role:   data.user.role,
              avatar: data.user.avatar,
              status: data.user.status,
            },
            isLoggedIn: true,
            viewAsRole: null,
          })

          return { success: true }
        } catch {
          return { success: false, error: 'Could not reach server. Check your connection.' }
        }
      },

      // ── Logout — clears cookie via server ─────────────────────────────
      logout: async () => {
        try {
          await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' })
        } catch {}
        set({ currentUser: null, isLoggedIn: false, viewAsRole: null })
      },

      // ── View As (Super Admin only) ─────────────────────────────────────
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

      // ── Create Staff (Super Admin only via server API) ─────────────────
      createStaff: async (data) => {
        const currentUser = get().currentUser
        if (currentUser?.role !== 'super_admin') {
          return { success: false, error: 'Only Super Admin can create staff accounts' }
        }
        try {
          const res = await fetch('/api/admin/create-staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include',
          })
          const result = await res.json()
          if (!result.success) return { success: false, error: result.error }

          // Save to managedStaff (client display only — no password stored)
          const { password: _pwd, ...safeStaff } = result.staff
          set(s => ({ managedStaff: [safeStaff, ...s.managedStaff] }))
          return { success: true, staff: safeStaff }
        } catch {
          return { success: false, error: 'Server error. Try again.' }
        }
      },

      updateStaffStatus: (id, status) => {
        set(s => ({
          managedStaff: s.managedStaff.map(st => st.id === id ? { ...st, status } : st)
        }))
      },

      deleteStaff: (id) => {
        set(s => ({ managedStaff: s.managedStaff.filter(st => st.id !== id) }))
      },
    }),
    {
      name: 'ratan-auth-store',
      partialize: (s) => ({
        currentUser:  s.currentUser,
        viewAsRole:   s.viewAsRole,
        isLoggedIn:   s.isLoggedIn,
        managedStaff: s.managedStaff,
        // NOTE: never persist raw passwords
      }),
    }
  )
)
