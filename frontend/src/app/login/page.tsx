'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface LoginResponse {
  user: { id: string; email: string; name: string; role: string }
  accessToken: string
  refreshToken: string
}

const DARK = '#1a0004'
const ADMIN_ROLES = ['ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF','INVENTORY_MANAGER']

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const redirect = (role: string) => {
    if (ADMIN_ROLES.includes(role.toUpperCase())) {
      router.push('/admin/dashboard')
    } else {
      // Customer should go to their account page
      router.push('/account')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please enter your email and password'); return }
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email: email.trim().toLowerCase(), password })
      const { user, accessToken, refreshToken } = res.data
      
      console.log('👤 User logged in:', { role: user.role, name: user.name, email: user.email })
      
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        
        // Only store admin tokens if user is admin
        if (ADMIN_ROLES.includes(user.role.toUpperCase())) {
          localStorage.setItem('adminAccessToken', accessToken)
          localStorage.setItem('adminRefreshToken', refreshToken)
          console.log('💾 Admin tokens stored in localStorage')
        } else {
          console.log('💾 Customer tokens stored in localStorage')
        }
      }
      
      setAuth(user, accessToken, refreshToken)

      if (ADMIN_ROLES.includes(user.role.toUpperCase())) {
        const { useAuthStore: useAdminAuth } = await import('@/store/authStore')
        const roleMap: Record<string,any> = { 
          SUPER_ADMIN:'super_admin',
          ADMIN:'admin',
          STORE_MANAGER:'store_manager',
          INVENTORY_MANAGER:'inventory_manager',
          SALES_STAFF:'sales_staff' 
        }
        const adminUser = {
          id: user.id, 
          name: user.name, 
          email: user.email, 
          phone: '', 
          role: roleMap[user.role.toUpperCase()] || 'admin', 
          avatar: user.name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2), 
          status: 'active' as const
        }
        
        console.log('🔐 Setting admin auth store:', adminUser)
        
        useAdminAuth.setState({
          currentUser: adminUser,
          isLoggedIn: true, 
          accessToken,
          viewAsRole: null,
        })
        
        console.log('✅ Admin auth store updated')
      }

      toast.success(`Welcome back, ${user.name}!`)
      
      // Route based on user role
      if (ADMIN_ROLES.includes(user.role.toUpperCase())) {
        console.log('🔄 Admin user - redirecting to admin dashboard with reload')
        window.location.href = '/admin/dashboard'
      } else {
        console.log('🔄 Customer user - redirecting to account page')
        router.push('/account')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleGoogleLogin = () => {
    window.location.href = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api','') + '/api/auth/google'
  }

  return (
    <div className="min-h-screen flex bg-[#FAF7F0] font-serif">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-gradient-to-b from-[#3D0F16] via-[#2D0A0F] to-[#1E0509] flex-col justify-between p-8 xl:p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="lg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="#C9A84C"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#lg)"/>
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="Ratan Jewellers" style={{ height: "80px", width: "auto", objectFit: "contain", maxWidth: "220px" }} />
        </div>
        <div className="relative z-10">
          <div className="text-[#C9A84C] text-[11px] tracking-[0.4em] font-sans mb-5">YOUR ACCOUNT</div>
          <h2 className="text-[#FAF7F0] text-4xl xl:text-5xl leading-tight font-light mb-7">Crafted for<br/>those who<br/><em className="text-[#D4AF50] italic">cherish</em>.</h2>
          <div className="w-10 h-px bg-[#C9A84C] mb-7"/>
          <p className="text-[#F0E0B0]/65 text-sm leading-relaxed max-w-[280px] font-sans font-light">Track your orders, manage custom jewellery requests, and access exclusive member offers.</p>
        </div>
        <div className="relative z-10 text-[#C9A84C]/35 text-[10px] font-sans tracking-[0.15em]">BIS HALLMARKED · SINCE 1985 · TRUSTED BY 50,000+</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative min-h-screen">
        <div className="lg:hidden mb-8 text-center">
          <div className="text-[11px] tracking-[0.35em] font-sans font-bold text-[#1a0004]">RATAN JEWELLERS</div>
          <div className="w-8 h-px bg-[#C9A84C] mx-auto mt-2"/>
        </div>

        <div className="w-full max-w-md">
          <div className="text-[11px] tracking-[0.35em] font-sans text-[#C9A84C] mb-2">SIGN IN</div>
          <h1 className="text-3xl sm:text-4xl font-light text-[#1a0004] leading-tight mb-8">Welcome<br/><em className="italic text-[#9D7A2E]">back</em>.</h1>

          {/* Google */}
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 border border-[#E0D5B8] bg-white p-3 text-sm font-sans text-gray-700 hover:bg-gray-50 transition-colors mb-5">
            <svg width="17" height="17" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.8 39.6 16.4 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4-4.3 5.2l6.2 5.2C40.9 35 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#E0D5B8]"/>
            <span className="text-[10px] font-sans text-[#BBA87A] tracking-[0.15em]">OR</span>
            <div className="flex-1 h-px bg-[#E0D5B8]"/>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-sans tracking-[0.2em] text-[#9D7A2E] block mb-2">EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"
                className="w-full border border-[#E0D5B8] bg-white outline-none p-3.5 text-base font-serif text-[#1a0004] focus:border-[#C9A84C] transition-colors"/>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-sans tracking-[0.2em] text-[#9D7A2E]">PASSWORD</label>
                <Link href="/forgot-password" className="text-[10px] font-sans text-[#9D7A2E] underline underline-offset-2 hover:text-[#71531A] transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
                  className="w-full border border-[#E0D5B8] bg-white outline-none p-3.5 pr-12 text-base font-serif text-[#1a0004] focus:border-[#C9A84C] transition-colors"/>
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9D7A2E] hover:text-[#71531A]">
                  {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-[#1a0004] p-3.5 text-[#FAF7F0] cursor-pointer disabled:opacity-50 hover:bg-[#2D0A0F] transition-colors">
              <span className="text-xs font-sans tracking-[0.15em]">{loading?'SIGNING IN…':'SIGN IN'}</span>
            </button>
          </form>

          <p className="text-center text-xs font-sans text-gray-500 mt-7">
            New here? <Link href="/register" className="text-[#9D7A2E] font-semibold underline underline-offset-2">Create an account</Link>
          </p>
          <p className="text-center mt-3">
            <Link href="/" className="text-[11px] font-sans text-[#9D7A2E] no-underline hover:text-[#71531A] transition-colors">← Return to store</Link>
          </p>
        </div>
      </div>
    </div>
  )
}