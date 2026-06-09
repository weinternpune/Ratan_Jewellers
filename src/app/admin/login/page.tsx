'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Eye, EyeOff, LogIn, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) { setError('Please enter your email and password'); return }
    setLoading(true); setError('')
    const result = await login(identifier, password)
    setLoading(false)
    if (result.success) {
      toast.success('Welcome back!')
      const role = useAuthStore.getState().currentUser?.role || ''
      if (['customer','sales_staff','inventory_manager'].includes(role)) {
        router.replace('/admin/my-dashboard')
      } else {
        router.replace('/admin/dashboard')
      }
    } else {
      setError(result.error || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0700] flex items-center justify-center p-4" style={{fontFamily:"'Inter', sans-serif"}}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto">
            <Crown size={26} className="text-[#C9A84C]"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Ratan Jewellers</h1>
            <p className="text-white/40 text-sm mt-1">Staff Portal — Authorized Access Only</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs text-white/30 mb-2">
            <Shield size={12}/><span>Credentials verified by backend server</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Email or Phone</label>
            <input value={identifier} onChange={e=>{setIdentifier(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoComplete="username"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#C9A84C]/60 placeholder-white/20 transition-colors"
              placeholder="your@email.com"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPass?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&handleLogin()} autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm outline-none focus:border-[#C9A84C]/60 placeholder-white/20 transition-colors"
                placeholder="Enter your password"/>
              <button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
              </button>
            </div>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-[#C9A84C] text-[#0D0700] py-3 rounded-xl font-bold text-sm hover:bg-[#d4b565] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            {loading?<span className="w-4 h-4 border-2 border-[#0D0700]/30 border-t-[#0D0700] rounded-full animate-spin"/>:<><LogIn size={16}/>Sign In</>}
          </button>
        </div>
        <p className="text-center text-xs text-white/20">Authorised Ratan Jewellers staff only.<br/>Backend server must be running to login.</p>
      </div>
    </div>
  )
}
