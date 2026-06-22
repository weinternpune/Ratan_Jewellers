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
  accessToken: string | null
  managedStaff: StaffAccount[]
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setViewAsRole: (role: AdminRole | null) => void
  getEffectiveRole: () => AdminRole
  createStaff: (data: { name: string; email: string; phone?: string; password: string; role: AdminRole }) => Promise<{ success: boolean; error?: string; staff?: StaffAccount; wasConverted?: boolean; message?: string }>
  updateStaffStatus: (id: string, status: 'active' | 'inactive') => void
  deleteStaff: (id: string) => Promise<{ success: boolean; error?: string }>
  initializeAuth: () => void
  resetStaffPassword: (id: string) => Promise<{ success: boolean; error?: string; tempPassword?: string; email?: string; name?: string }>
}

const API = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      currentUser: null, viewAsRole: null,
      isLoggedIn: false, accessToken: null, managedStaff: [],

      // ── Login — calls Express backend via the shared apiClient ────────
      login: async (identifier, password) => {
        try {
          console.log('🔐 Starting login process...', { identifier, apiUrl: API() })
          
          const res = await fetch(`${API()}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier.trim(), password: password.trim() }),
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
            avatar: user.avatar || user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
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

      // ── Initialize Auth on App Load ───────────────────────────────────
      initializeAuth: async () => {
        if (typeof window === 'undefined') return
        
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        
        console.log('🔄 Initializing auth...', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken })
        
        if (!accessToken || !refreshToken) {
          console.log('❌ No tokens found')
          set({ isLoggedIn: false, currentUser: null, accessToken: null })
          return
        }
        
        // Check if we already have user in state
        const currentState = get()
        if (currentState.currentUser) {
          console.log('✅ User already in state, restoring session')
          set({ isLoggedIn: true, accessToken })
          return
        }
        
        // Try to restore from localStorage backup
        try {
          const authStore = localStorage.getItem('ratan-auth-store')
          if (authStore) {
            const parsed = JSON.parse(authStore)
            if (parsed?.state?.currentUser) {
              console.log('✅ Restored user from localStorage backup')
              set({ 
                currentUser: parsed.state.currentUser,
                isLoggedIn: true, 
                accessToken 
              })
              return
            }
          }
        } catch (e) {
          console.error('Failed to parse auth store:', e)
        }
        
        // Last resort: fetch user from API
        try {
          console.log('📡 Fetching user from API...')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const user = data.data || data.user || data
            
            console.log('✅ Fetched user from API:', user)
            
            // Convert to admin user format
            const roleMap: Record<string, any> = {
              'SUPER_ADMIN': 'super_admin',
              'ADMIN': 'admin',
              'STORE_MANAGER': 'store_manager',
              'INVENTORY_MANAGER': 'inventory_manager',
              'SALES_STAFF': 'sales_staff'
            }
            
            const adminUser = {
              id: user.id || user._id,
              name: user.name,
              email: user.email,
              phone: user.phone || '',
              role: roleMap[user.role?.toUpperCase()] || 'admin',
              avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
              status: 'active' as const
            }
            
            set({ 
              currentUser: adminUser,
              isLoggedIn: true, 
              accessToken 
            })
            
            console.log('✅ Auth initialized successfully')
          } else {
            console.log('❌ Failed to fetch user, status:', response.status)
            set({ isLoggedIn: false, currentUser: null, accessToken: null })
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        } catch (error) {
          console.error('❌ Error fetching user:', error)
          set({ isLoggedIn: false, currentUser: null, accessToken: null })
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
    accessToken: null,
  })
},

      setViewAsRole: (role) => { if (get().currentUser?.role === 'super_admin') set({ viewAsRole: role }) },
      getEffectiveRole: () => { const { currentUser, viewAsRole } = get(); if (!currentUser) return 'customer'; if (currentUser.role === 'super_admin' && viewAsRole) return viewAsRole; return currentUser.role },

      // ── Create Staff — calls Express backend via the shared apiClient ──
      // ── Create Staff — calls the dedicated admin-only endpoint ─────────
      createStaff: async (data) => {
        if (get().currentUser?.role !== 'super_admin') return { success: false, error: 'Only Super Admin can create staff accounts' }
        try {
          const result = await api.post<{ id: string; name: string; email: string; phone?: string; role: string; isActive: boolean }>(
            '/admin/users',
            { ...data, role: data.role.toUpperCase() }
          )
          const staff: StaffAccount = { id:result.data.id, name:result.data.name, email:result.data.email, role:data.role, status:'active' }
          set(s => ({ managedStaff: [staff, ...s.managedStaff] }))
          const wasConverted = (result.message || '').toLowerCase().includes('converted')
          return { success: true, staff, wasConverted, message: result.message }
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
      resetStaffPassword: async (id) => {
        try {
          const result = await api.post<{ id: string; name: string; email: string; tempPassword: string }>(
            `/admin/users/${id}/reset-password`
          )
          return { success: true, tempPassword: result.data.tempPassword, email: result.data.email, name: result.data.name }
        } catch (err: any) {
          return {
            success: false,
            error: err?.response?.data?.message || 'Failed to reset password',
          }
        }
      },
    }),
    { 
      name: 'ratan-auth-store', 
      partialize: (s) => ({ 
        currentUser: s.currentUser, 
        viewAsRole: s.viewAsRole, 
        isLoggedIn: s.isLoggedIn, 
        accessToken: s.accessToken,
        managedStaff: s.managedStaff 
      }) 
    }
  )
)