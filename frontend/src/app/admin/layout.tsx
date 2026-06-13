'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Package, ShoppingCart, Receipt,
  Boxes, UserCircle, BarChart3, Settings, ScrollText,
  ChevronLeft, ChevronRight, Crown, Bell, Search,
  LogOut, Menu, X, ChevronDown, Home, Gem
} from 'lucide-react'
import { useAuthStore, AdminRole } from '@/store/authStore'
import { useCustomJewelleryStore } from '@/store/customJewelleryStore'
import { useAdminStore } from '@/store/adminStore'

interface Permission {
  website: 'full' | 'view' | 'none'
  ecommerce: 'full' | 'view' | 'none'
  billing: 'full' | 'create' | 'own_only' | 'none'
  inventory: 'full' | 'view' | 'none'
  crm: 'full' | 'view' | 'own' | 'none'
  analytics: 'full' | 'sales_only' | 'inv_only' | 'none'
  admin: 'full_settings' | 'full' | 'limited' | 'none'
}

const RBAC: Record<AdminRole, Permission> = {
  customer: { website: 'full', ecommerce: 'full', billing: 'own_only', inventory: 'none', crm: 'own', analytics: 'none', admin: 'none' },
  sales_staff: { website: 'full', ecommerce: 'view', billing: 'create', inventory: 'view', crm: 'view', analytics: 'sales_only', admin: 'none' },
  inventory_manager: { website: 'full', ecommerce: 'none', billing: 'none', inventory: 'full', crm: 'view', analytics: 'inv_only', admin: 'none' },
  store_manager: { website: 'full', ecommerce: 'full', billing: 'full', inventory: 'full', crm: 'full', analytics: 'full', admin: 'limited' },
  admin: { website: 'full', ecommerce: 'full', billing: 'full', inventory: 'full', crm: 'full', analytics: 'full', admin: 'full' },
  super_admin: { website: 'full', ecommerce: 'full', billing: 'full', inventory: 'full', crm: 'full', analytics: 'full', admin: 'full_settings' },
}

// Nav items per role
const allNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'website' as const, roles: ['admin', 'super_admin', 'store_manager'] },
  { href: '/admin/my-dashboard', label: 'My Dashboard', icon: Home, module: 'website' as const, roles: ['customer', 'sales_staff', 'inventory_manager'] },
  { href: '/admin/users', label: 'Users & Roles', icon: Users, module: 'admin' as const, roles: ['admin', 'super_admin'] },
  { href: '/admin/products', label: 'Products', icon: Package, module: 'ecommerce' as const, roles: ['sales_staff', 'store_manager', 'admin', 'super_admin'] },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, module: 'ecommerce' as const, roles: ['sales_staff', 'store_manager', 'admin', 'super_admin'] },
  { href: '/admin/billing', label: 'Billing', icon: Receipt, module: 'billing' as const, roles: ['sales_staff', 'store_manager', 'admin', 'super_admin'] },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes, module: 'inventory' as const, roles: ['inventory_manager', 'store_manager', 'admin', 'super_admin'] },
  { href: '/admin/crm', label: 'CRM', icon: UserCircle, module: 'crm' as const, roles: ['sales_staff', 'store_manager', 'admin', 'super_admin'] },
  { href: '/admin/custom-jewellery', label: 'Custom Orders', icon: Gem, module: 'crm' as const, roles: ['store_manager', 'admin', 'super_admin'] },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, module: 'analytics' as const, roles: ['store_manager', 'admin', 'super_admin'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, module: 'admin' as const, roles: ['super_admin'] },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText, module: 'admin' as const, roles: ['admin', 'super_admin'] },
]

const roleColors: Record<AdminRole, string> = {
  customer: 'bg-blue-100 text-blue-700',
  sales_staff: 'bg-green-100 text-green-700',
  inventory_manager: 'bg-orange-100 text-orange-700',
  store_manager: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
  super_admin: 'bg-amber-100 text-amber-700',
}
const roleLabels: Record<AdminRole, string> = {
  customer: 'Customer', sales_staff: 'Sales Staff', inventory_manager: 'Inv. Manager',
  store_manager: 'Store Manager', admin: 'Admin', super_admin: 'Super Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, isLoggedIn, logout, viewAsRole, setViewAsRole, getEffectiveRole } = useAuthStore()
  const { setCurrentRole } = useAdminStore()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [roleDropOpen, setRoleDropOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Wait for Zustand persist to rehydrate before checking auth
  useEffect(() => { setHydrated(true) }, [])

  // ── Must be before any early returns (Rules of Hooks) ─────────────────
  const { requests: cjRequests } = useCustomJewelleryStore()
  const unreadCJ = cjRequests.filter(r => !r.readByManager && r.status === 'new').length

  const effectiveRole = getEffectiveRole()
  const perms = RBAC[effectiveRole]

  // Sync effective role into admin store for RBAC checks
  useEffect(() => { setCurrentRole(effectiveRole) }, [effectiveRole])

  // Auth guard — wait for hydration before redirecting
  useEffect(() => {
    if (!hydrated) return
    if (pathname === '/admin/login') return
    if (!isLoggedIn || !currentUser) {
      router.replace('/admin/login')
      return
    }
    // Clear any stale website customer session when admin is active
    try {
      const webKey = 'ratan-auth'
      const raw = localStorage.getItem(webKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state?.isAuthenticated) {
          parsed.state.isAuthenticated = false
          parsed.state.user = null
          localStorage.setItem(webKey, JSON.stringify(parsed))
        }
      }
    } catch { }
  }, [hydrated, isLoggedIn, currentUser, pathname])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Redirect based on role after login
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return
    if (pathname === '/admin' || pathname === '/admin/') {
      if (['customer', 'sales_staff', 'inventory_manager'].includes(currentUser.role)) {
        router.replace('/admin/my-dashboard')
      } else {
        router.replace('/admin/dashboard')
      }
    }
  }, [isLoggedIn, currentUser, pathname])

  if (pathname === '/admin/login') return <>{children}</>
  // Show spinner while store is rehydrating from localStorage
  if (!hydrated || (!isLoggedIn && !currentUser)) return (
    <div className="flex items-center justify-center h-screen bg-[#0D0700]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-white/40">Loading admin panel...</p>
      </div>
    </div>
  )

  // Filter nav based on effective role
  const navItems = allNavItems.filter(item => item.roles.includes(effectiveRole))

  const handleLogout = async () => {
    await logout()
    // Also clear website auth store so no stale session shown
    try {
      const { useAuthStore: webAuth } = await import('@/store')
      webAuth.getState().clearAuth()
    } catch { }
    router.replace('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
<div
  className={`
    flex items-center gap-3
    px-4 py-4
    sm:px-5
    border-b border-[#C9A84C]/20
    ${collapsed ? 'justify-center' : ''}
  `}
>        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 flex items-center justify-center">
          <Crown size={18} className="text-[#C9A84C]" />
        </div>
        {!collapsed && <div>
          <div className="text-[#C9A84C] font-bold text-sm sm:text-base tarcking-wide leading-none">RATAN</div><div className="text-white/40 text-[9px] tracking-widest leading-none mt-0.5">ADMIN PANEL</div></div>}
      </div>

      {/* Super Admin — role switcher */}
      {!collapsed && currentUser.role === 'super_admin' && (
        <div className="px-3 py-3 border-b border-white/5">
          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1.5 px-1">View As Role</div>
          <div className="relative">
            <button onClick={() => setRoleDropOpen(!roleDropOpen)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[effectiveRole]}`}>{roleLabels[effectiveRole]}</span>
              <ChevronDown size={12} className={`text-white/40 transition-transform ${roleDropOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleDropOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a0e00] border border-white/10 rounded-lg overflow-hidden z-50 shadow-xl">
                <button onClick={() => { setViewAsRole(null); setRoleDropOpen(false) }} className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2 ${!viewAsRole ? 'bg-white/10' : ''}`}>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColors['super_admin']}`}>Super Admin (default)</span>
                </button>
                {(Object.keys(RBAC) as AdminRole[]).filter(r => r !== 'super_admin').map(role => (
                  <button key={role} onClick={() => { setViewAsRole(role); setRoleDropOpen(false) }} className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2 ${viewAsRole === role ? 'bg-white/10' : ''}`}>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColors[role]}`}>{roleLabels[role]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show current role badge for non super_admin */}
      {!collapsed && currentUser.role !== 'super_admin' && (
        <div className="px-3 py-3 border-b border-white/5">
          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1.5 px-1">Your Role</div>
          <div className="px-3 py-2 rounded-lg bg-white/5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[currentUser.role]}`}>{roleLabels[currentUser.role]}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">        {navItems.map(({ href, label, icon: Icon, module }) => {
        const accessible = perms[module] !== 'none'
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <div key={href} className="relative group">
            {accessible ? (
              <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${active ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/25' : 'text-white/60 hover:text-white hover:bg-white/5'} ${collapsed ? 'justify-center' : ''}`}>
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && <span className="font-medium">{label}</span>}
                {!collapsed && href === '/admin/custom-jewellery' && unreadCJ > 0 && <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCJ}</span>}
                {active && !collapsed && href !== '/admin/custom-jewellery' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />}
              </Link>
            ) : (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm opacity-25 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
                <Icon size={17} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </div>
            )}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[#1a0e00] border border-white/10 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">{label}</div>
            )}
          </div>
        )
      })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}>
          <Home size={15} />
          {!collapsed && <span>Back to Site</span>}
        </Link>
        <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}>
          <LogOut size={15} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#F5F0E8] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-[#0D0700] border-r border-[#C9A84C]/10 transition-all duration-300 relative ${collapsed ? 'w-16' : 'w-64 xl:w-72'
          }`}
      >        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)} className="absolute top-20 -right-3 z-10 w-5 h-8 bg-[#0D0700] border border-[#C9A84C]/20 rounded-r flex items-center justify-center text-white/40 hover:text-[#C9A84C] transition-colors">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
  <div className="lg:hidden fixed inset-0 z-50 flex">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={() => setMobileOpen(false)}
    />

    {/* Sidebar */}
    <aside
      className="
        relative
        w-[85vw]
        sm:w-[320px]
        md:w-[340px]
        max-w-[340px]
        bg-[#0D0700]
        flex
        flex-col
        h-full
        shadow-2xl
        animate-slideIn
      "
    >
      <button
        onClick={() => setMobileOpen(false)}
        className="
          absolute
          top-4
          right-4
          p-2
          rounded-full
          hover:bg-white/10
          text-white/50
          hover:text-white
        "
      >
        <X size={20} />
      </button>

      <SidebarContent />
    </aside>
  </div>
)}
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 shadow-sm">          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800"><Menu size={20} /></button>
          <div className="flex-1 hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 max-w-sm">            <Search size={14} className="text-gray-400" />
            <input className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1" placeholder="Search..." />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-800">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#C9A84C] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold text-xs">{currentUser.avatar}</div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-gray-800">{currentUser.name}</div>
                <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${roleColors[effectiveRole]}`}>{roleLabels[effectiveRole]}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>      </div>
    </div>
  )
}
