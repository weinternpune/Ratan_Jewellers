'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Gem, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  // If admin already logged in, redirect them away from login page
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ratan-auth-store')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state?.isLoggedIn && parsed?.state?.currentUser) {
          const role = parsed.state.currentUser.role
          if (['customer','sales_staff','inventory_manager'].includes(role)) {
            router.replace('/admin/my-dashboard')
          } else {
            router.replace('/admin/dashboard')
          }
        }
      }
    } catch {}
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ── Step 1: Check if this is a staff/admin account via secure server API ──
      const adminRes = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: form.email, password: form.password }),
        credentials: 'include',
      })
      const adminData = await adminRes.json()

      if (adminData.success) {
        // Staff/Admin login — import admin auth store and set session
        const { useAuthStore: useAdminAuth } = await import('@/store/authStore')
        useAdminAuth.setState({
          currentUser: adminData.user,
          isLoggedIn: true,
          viewAsRole: null,
        })
        toast.success(`Welcome back, ${adminData.user.name}!`)
        const role: string = adminData.user.role
        if (['customer', 'sales_staff', 'inventory_manager'].includes(role)) {
          router.push('/admin/my-dashboard')
        } else {
          router.push('/admin/dashboard')
        }
        setLoading(false)
        return
      }

      // ── Step 2: Try real backend for website customers ──────────────────────
      try {
        const res = await api.post<LoginResponse>('/auth/login', form)
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
        toast.success(`Welcome back, ${res.data.user.name}!`)
        router.push('/')
        setLoading(false)
        return
      } catch {}

      // ── Step 3: Check locally registered customers ──────────────────────────
      const localUsers: any[] = (() => {
        try { return JSON.parse(localStorage.getItem('ratan-local-users') || '[]') } catch { return [] }
      })()
      const localUser = localUsers.find(
        (u: any) => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password
      )
      if (localUser) {
        setAuth(
          { id: localUser.id, email: localUser.email, name: localUser.name, role: 'customer' },
          'local-' + Date.now(),
          'local-r-' + Date.now()
        )
        toast.success(`Welcome back, ${localUser.name}!`)
        router.push('/')
        setLoading(false)
        return
      }

      // ── Nothing matched ─────────────────────────────────────────────────────
      toast.error('Invalid email or password')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C2C2C] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Golden Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Shimmering Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#C9A84C]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#340008]/15 to-transparent blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-5xl mx-4 my-8 grid lg:grid-cols-2 bg-white border border-[#E8D5A3] shadow-[0_24px_70px_rgba(13,7,0,0.08)] overflow-hidden">
        
        {/* Left Side: Brand Showcase (Hidden on Mobile/Tablet) */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-[#340008] to-[#1E0004] text-white border-r border-[#E8D5A3]/30 overflow-hidden">
          {/* Overlay Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#C9A84C_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-[#FAF6EE] border border-[#E8D5A3] flex items-center justify-center shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                <Gem size={20} className="text-[#340008]" />
              </div>
              <div>
                <span className="font-display text-lg font-bold tracking-widest text-[#E8D5A3] block">RATAN JEWELLERS</span>
                <span className="text-[8px] font-mono tracking-[0.2em] text-[#E8D5A3]/70 block uppercase">Since 1985</span>
              </div>
            </Link>
          </div>

          <div className="relative z-10 my-auto py-12">
            <h2 className="font-display text-5xl font-semibold leading-[1.1] text-white">
              Timeless <span className="gold-shimmer">Elegance</span>,<br />Bespoke Trust.
            </h2>
            <p className="mt-6 text-white/80 text-sm leading-relaxed max-w-sm">
              Step into a legacy of exceptional craftsmanship. Access your private profile to view collections, track orders, and request custom styling consultations.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-xs text-[#E8D5A3]">
            <ShieldCheck size={16} className="text-[#C9A84C]" />
            <span>BIS Hallmarked Purity Guarantee</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          {/* Mobile Brand Link (Visible on smaller screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#FAF6EE] border border-[#E8D5A3] flex items-center justify-center">
                <Gem size={18} className="text-[#340008]" />
              </div>
              <span className="font-display text-base font-bold tracking-widest text-[#340008]">RATAN JEWELLERS</span>
            </Link>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="font-display text-3xl font-semibold text-[#340008]">Welcome Back</h1>
            <p className="text-[#71531A]/60 text-xs mt-1 tracking-wider uppercase font-semibold">Sign in to your concierge portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-[#71531A] uppercase tracking-widest mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#FAF6EE]/50 border border-[#E0C883] text-[#2C2C2C] placeholder-[#8a7c70] rounded-none pl-11 pr-4 py-3 text-sm focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-[#71531A] uppercase tracking-widest block">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] text-[#9D7A2E] hover:text-[#340008] transition-colors tracking-wide uppercase font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#FAF6EE]/50 border border-[#E0C883] text-[#2C2C2C] placeholder-[#8a7c70] rounded-none pl-11 pr-11 py-3 text-sm focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-[#340008] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 mt-4 text-xs font-semibold uppercase tracking-widest text-white hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(201,168,76,0.15)]"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-[#2C2C2C]/70">
              New to Ratan Jewellers?{' '}
              <Link href="/register" className="text-[#9D7A2E] hover:text-[#340008] font-bold transition-colors underline underline-offset-4">
                Create an Account
              </Link>
            </p>
            
            <Link href="/" className="inline-flex items-center gap-2 mt-8 text-[10px] uppercase font-bold tracking-widest text-[#9D7A2E] hover:text-[#340008] transition-colors group">
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
              Return to Store
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}