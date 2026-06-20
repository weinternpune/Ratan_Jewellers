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
import { useAuthStore, AdminRole, StaffAccount } from '@/store/authStore'
import { useCustomJewelleryStore } from '@/store/customJewelleryStore'
import { useAdminStore } from '@/store/adminStore'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Permission {
  website:   'full' | 'view' | 'none'
  ecommerce: 'full' | 'view' | 'none'
  billing:   'full' | 'create' | 'own_only' | 'none'
  inventory: 'full' | 'view' | 'none'
  crm:       'full' | 'view' | 'own' | 'none'
  analytics: 'full' | 'sales_only' | 'inv_only' | 'none'
  admin:     'full_settings' | 'full' | 'limited' | 'none'
}

interface SidebarProps {
  currentUser:     StaffAccount
  effectiveRole:   AdminRole
  viewAsRole:      AdminRole | null
  pathname:        string
  collapsed:       boolean
  roleDropOpen:    boolean
  unreadCJ:        number
  navItems:        typeof allNavItems
  perms:           Permission
  onSetViewAsRole: (role: AdminRole | null) => void
  onToggleRoleDrop: () => void
  onLogout:        () => void
}

// ─── Static data ─────────────────────────────────────────────────────────────

const RBAC: Record<AdminRole, Permission> = {
  customer:          { website:'full', ecommerce:'full',  billing:'own_only', inventory:'none', crm:'own',  analytics:'none',      admin:'none'          },
  sales_staff:       { website:'full', ecommerce:'view',  billing:'create',   inventory:'view', crm:'view', analytics:'sales_only', admin:'none'          },
  inventory_manager: { website:'full', ecommerce:'none',  billing:'none',     inventory:'full', crm:'view', analytics:'inv_only',   admin:'none'          },
  store_manager:     { website:'full', ecommerce:'full',  billing:'full',     inventory:'full', crm:'full', analytics:'full',       admin:'limited'       },
  admin:             { website:'full', ecommerce:'full',  billing:'full',     inventory:'full', crm:'full', analytics:'full',       admin:'full'          },
  super_admin:       { website:'full', ecommerce:'full',  billing:'full',     inventory:'full', crm:'full', analytics:'full',       admin:'full_settings' },
}

const allNavItems = [
  { href:'/admin/dashboard',        label:'Dashboard',     icon:LayoutDashboard, module:'website'   as const, roles:['admin','super_admin','store_manager'] },
  { href:'/admin/my-dashboard',     label:'My Dashboard',  icon:Home,            module:'website'   as const, roles:['customer','sales_staff','inventory_manager'] },
  { href:'/admin/users',            label:'Users & Roles', icon:Users,           module:'admin'     as const, roles:['admin','super_admin'] },
  { href:'/admin/products',         label:'Products',      icon:Package,         module:'ecommerce' as const, roles:['sales_staff','store_manager','admin','super_admin'] },
  { href:'/admin/orders',           label:'Orders',        icon:ShoppingCart,    module:'ecommerce' as const, roles:['sales_staff','store_manager','admin','super_admin'] },
  { href:'/admin/billing',          label:'Billing',       icon:Receipt,         module:'billing'   as const, roles:['sales_staff','store_manager','admin','super_admin'] },
  { href:'/admin/inventory',        label:'Inventory',     icon:Boxes,           module:'inventory' as const, roles:['inventory_manager','store_manager','admin','super_admin'] },
  { href:'/admin/crm',              label:'CRM',           icon:UserCircle,      module:'crm'       as const, roles:['sales_staff','store_manager','admin','super_admin'] },
  { href:'/admin/custom-jewellery', label:'Custom Orders', icon:Gem,             module:'crm'       as const, roles:['store_manager','admin','super_admin'] },
  { href:'/admin/analytics',        label:'Analytics',     icon:BarChart3,       module:'analytics' as const, roles:['store_manager','admin','super_admin'] },
  { href:'/admin/settings',         label:'Settings',      icon:Settings,        module:'admin'     as const, roles:['super_admin'] },
  { href:'/admin/audit-logs',       label:'Audit Logs',    icon:ScrollText,      module:'admin'     as const, roles:['admin','super_admin'] },
]

const roleColors: Record<AdminRole, string> = {
  customer:          'bg-blue-100 text-blue-700',
  sales_staff:       'bg-green-100 text-green-700',
  inventory_manager: 'bg-orange-100 text-orange-700',
  store_manager:     'bg-purple-100 text-purple-700',
  admin:             'bg-red-100 text-red-700',
  super_admin:       'bg-amber-100 text-amber-700',
}

const roleLabels: Record<AdminRole, string> = {
  customer:          'Customer',
  sales_staff:       'Sales Staff',
  inventory_manager: 'Inv. Manager',
  store_manager:     'Store Manager',
  admin:             'Admin',
  super_admin:       'Super Admin',
}

// ─── SidebarContent ───────────────────────────────────────────────────────────
// Defined OUTSIDE AdminLayout so React sees a stable component type across
// renders. Defining it inside would cause React to treat it as a new type on
// every render → full remount → broken layout order.

function SidebarContent({
  currentUser,
  effectiveRole,
  viewAsRole,
  pathname,
  collapsed,
  roleDropOpen,
  unreadCJ,
  navItems,
  perms,
  onSetViewAsRole,
  onToggleRoleDrop,
  onLogout,
}: SidebarProps) {
  return (
<div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Logo row
          flex-shrink-0  → never compresses
          min-h-[64px]   → consistent height across both sidebar instances
          pr-12          → reserves 48px for the absolute X close button on mobile;
                           the desktop has no X button so pr-12 is harmless there too
                           (sidebar is wide enough that Crown+text never gets clipped) */}
      <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-3 border-b border-[#C9A84C]/20 ${collapsed ? 'justify-center' : 'pr-12'}`}>
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 flex items-center justify-center">
          <Crown size={18} className="text-[#C9A84C]" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-[#C9A84C] font-bold text-sm tracking-wider leading-none">RATAN</div>
            <div className="text-white/40 text-[9px] tracking-widest leading-none mt-0.5">ADMIN PANEL</div>
          </div>
        )}
      </div>

      {/* Role switcher — super_admin only */}
      {!collapsed && currentUser.role === 'super_admin' && (
        <div className="flex-shrink-0 px-3 py-2 border-b border-white/5">
          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1.5 px-1">View As Role</div>
          <div className="relative">
            <button
              onClick={onToggleRoleDrop}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[effectiveRole]}`}>
                {roleLabels[effectiveRole]}
              </span>
              <ChevronDown size={12} className={`text-white/40 transition-transform ${roleDropOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleDropOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a0e00] border border-white/10 rounded-lg z-50 shadow-xl max-h-[35vh] overflow-y-auto">
                <button
                  onClick={() => onSetViewAsRole(null)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2 ${!viewAsRole ? 'bg-white/10' : ''}`}
                >
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColors['super_admin']}`}>
                    Super Admin (default)
                  </span>
                </button>
                {(Object.keys(RBAC) as AdminRole[]).filter(r => r !== 'super_admin').map(role => (
                  <button
                    key={role}
                    onClick={() => onSetViewAsRole(role)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center gap-2 ${viewAsRole === role ? 'bg-white/10' : ''}`}
                  >
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleColors[role]}`}>
                      {roleLabels[role]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Role badge — non super_admin */}
      {!collapsed && currentUser.role !== 'super_admin' && (
        <div className="flex-shrink-0 px-3 py-2 border-b border-white/5">
          <div className="text-white/30 text-[9px] uppercase tracking-widest mb-1.5 px-1">Your Role</div>
          <div className="px-3 py-2 rounded-lg bg-white/5">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[currentUser.role]}`}>
              {roleLabels[currentUser.role]}
            </span>
          </div>
        </div>
      )}

      {/* Nav
          flex-1     → fills all remaining space between the header sections and the bottom CTA
          min-h-0    → CRITICAL: overrides Flexbox default min-height:auto.
                       Without this the nav refuses to shrink, causing bottom
                       buttons to be pushed off-screen on short mobile viewports.
          overflow-y-auto → scroll activates only because min-h-0 allows shrinking */}
     <nav className="flex-1 min-h-0 overflow-y-auto px-2 pt-2 pb-6 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, module }) => {
          const accessible = perms[module] !== 'none'
          const active     = pathname === href || pathname.startsWith(href + '/')
          return (
            <div key={href} className="relative group">
              {accessible ? (
                <Link
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                    ${active ? 'bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/25' : 'text-white/60 hover:text-white hover:bg-white/5'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon size={17} className="flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{label}</span>}
                  {!collapsed && href === '/admin/custom-jewellery' && unreadCJ > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCJ}
                    </span>
                  )}
                  {active && !collapsed && href !== '/admin/custom-jewellery' && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  )}
                </Link>
              ) : (
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm opacity-25 cursor-not-allowed ${collapsed ? 'justify-center' : ''}`}>
                  <Icon size={17} className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </div>
              )}
              {/* Collapsed tooltip */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[#1a0e00] border border-white/10 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {label}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom CTA
          flex-shrink-0 → always pinned at bottom, never pushed off-screen */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-white/5 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}
        >
          <Home size={15} />
          {!collapsed && <span>Back to Site</span>}
        </Link>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={15} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </div>
  )
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  const { currentUser, isLoggedIn, logout, viewAsRole, setViewAsRole, getEffectiveRole, initializeAuth } = useAuthStore()
  const { setCurrentRole } = useAdminStore()
  const { requests: cjRequests } = useCustomJewelleryStore()

  const [collapsed,    setCollapsed]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [roleDropOpen, setRoleDropOpen] = useState(false)
  const [hydrated,     setHydrated]     = useState(false)

  // Initialize auth on mount and listen to storage changes
  useEffect(() => { 
    setHydrated(true)
    
    // Call initializeAuth and wait for it
    const init = async () => {
      await initializeAuth()
    }
    init()
    
    // Listen for storage changes (when login happens in another component)
    const handleStorageChange = () => {
      console.log('📦 Storage changed, reinitializing auth')
      init()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const unreadCJ      = cjRequests.filter(r => !r.readByManager && r.status === 'new').length
  const effectiveRole = getEffectiveRole()
  const perms         = RBAC[effectiveRole]

  // Sync effective role with admin store
  useEffect(() => { 
    if (currentUser) {
      setCurrentRole(effectiveRole) 
    }
  }, [effectiveRole, currentUser])

  // Auth guard — only redirects if no valid session exists
  useEffect(() => {
    if (!hydrated) return
    
    // Check tokens in localStorage
    const hasAccessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken')
    const hasRefreshToken = typeof window !== 'undefined' && localStorage.getItem('refreshToken')
    
    console.log('🔍 Auth Guard Check:', { 
      hydrated, 
      isLoggedIn, 
      hasCurrentUser: !!currentUser,
      hasAccessToken: !!hasAccessToken,
      hasRefreshToken: !!hasRefreshToken,
      pathname 
    })
    
    // If we have tokens, we're good - don't redirect
    if (hasAccessToken && hasRefreshToken) {
      console.log('✅ Valid tokens found - allowing access')
      return
    }
    
    // Only redirect if NO tokens at all
    if (!hasAccessToken && !hasRefreshToken && !isLoggedIn) {
      console.log('❌ No authentication found - redirecting to login')
      router.replace('/login')
    }
  }, [hydrated, pathname])

  // Close mobile sidebar whenever route changes
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Role-based redirect from /admin root
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return
    if (pathname === '/admin' || pathname === '/admin/') {
      router.replace(
        ['customer', 'sales_staff', 'inventory_manager'].includes(currentUser.role)
          ? '/admin/my-dashboard'
          : '/admin/dashboard'
      )
    }
  }, [isLoggedIn, currentUser, pathname])

  // Loading spinner while Zustand rehydrates from localStorage
  if (!hydrated || !isLoggedIn || !currentUser) return (
    <div className="flex items-center justify-center h-screen bg-[#0D0700]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-white/40">Loading admin panel...</p>
      </div>
    </div>
  )

  // Re-bind to a fresh const so TypeScript carries the non-null narrowing
  // from the guard above through the rest of the component (JSX included).
  const user = currentUser

  const navItems = allNavItems.filter(item => item.roles.includes(effectiveRole))

  // Show loading while checking authentication
  if (!currentUser && hydrated) {
    const hasTokens = typeof window !== 'undefined' && 
                      localStorage.getItem('accessToken') && 
                      localStorage.getItem('refreshToken')
    
    if (!hasTokens) {
      // Will redirect via auth guard useEffect
      return (
        <div className="flex items-center justify-center h-screen bg-[#0D0700]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-white/40">Redirecting to login...</p>
          </div>
        </div>
      )
    }
    
    // Has tokens but currentUser not loaded
    console.log('⚠️ Has tokens but no currentUser, waiting for API fetch...')
    
    return (
      <div className="flex items-center justify-center h-screen bg-[#0D0700]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/40">Loading your session...</p>
          <p className="text-xs text-white/30 mt-2">Fetching user data from server...</p>
          <button 
            onClick={() => {
              console.log('🔄 Manual redirect to login')
              localStorage.clear()
              window.location.href = '/login'
            }}
            className="mt-4 text-[10px] text-[#C9A84C] hover:underline"
          >
            Having trouble? Click here to login again
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    try {
      const { useAuthStore: webAuth } = await import('@/store')
      webAuth.getState().clearAuth()
    } catch {}
    router.replace('/')
  }

  const handleSetViewAsRole = (role: AdminRole | null) => {
    setViewAsRole(role)
    setRoleDropOpen(false)
  }

  // All props for SidebarContent — shared between desktop and mobile instances
  const sidebarProps: SidebarProps = {
    currentUser: user,
    effectiveRole,
    viewAsRole,
    pathname,
    collapsed,
    roleDropOpen,
    unreadCJ,
    navItems,
    perms,
    onSetViewAsRole:  handleSetViewAsRole,
    onToggleRoleDrop: () => setRoleDropOpen(o => !o),
    onLogout:         handleLogout,
  }

  return (
    <div className="flex h-screen bg-[#F5F0E8] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Desktop sidebar ───────────────────────────────────────────────────
          hidden on mobile (lg:flex), collapses to icon-only rail (w-16) */}
      <aside className={`
        hidden lg:flex flex-col flex-shrink-0
        bg-[#0D0700] border-r border-[#C9A84C]/10
        transition-all duration-300 relative
        ${collapsed ? 'w-16' : 'w-60'}
      `}>
        <SidebarContent {...sidebarProps} />
        {/* Collapse toggle tab */}
        <button
          onClick={() => setCollapsed(o => !o)}
          className="absolute top-20 -right-3 z-10 w-5 h-8 bg-[#0D0700] border border-[#C9A84C]/20 rounded-r flex items-center justify-center text-white/40 hover:text-[#C9A84C] transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Mobile overlay sidebar ────────────────────────────────────────────
          Uses h-screen (not h-full) on the aside — h-full inside a fixed
          container is browser-inconsistent; h-screen is always the viewport.
          w-[85vw] max-w-[280px] — fits 320px phones without overflowing. */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop — tap to close */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />

         <aside className="relative z-10 flex flex-col bg-[#0D0700] shadow-2xl h-screen w-[85vw] max-w-[280px]">
            {/* X button sits inside the aside, top-right.
                Logo row has pr-12 so it never overlaps the Crown/brand text. */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 z-50 p-2 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>

            {/* Force collapsed=false on mobile — mobile sidebar never icon-only */}
            <SidebarContent {...sidebarProps} collapsed={false} />
          </aside>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 shadow-sm">
          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800">
            <Menu size={20} />
          </button>

          {/* Search bar — tablet+ */}
          <div className="flex-1 hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
              placeholder="Search..."
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-800">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#C9A84C] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold text-xs">
               {user.avatar}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-gray-800">{user.name}</div>
                <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${roleColors[effectiveRole]}`}>
                  {roleLabels[effectiveRole]}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

    </div>
  )
}