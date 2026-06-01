'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Gem, Lock, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); try { const res = await api.post<any>('/auth/login', form); setAuth(res.data.user, res.data.accessToken, res.data.refreshToken); toast.success(`Welcome back, ${res.data.user.name}!`); router.push(['ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF','INVENTORY_MANAGER'].includes(res.data.user.role) ? '/admin/dashboard' : '/') } catch (err: any) { toast.error(err?.response?.data?.message || 'Login failed') } finally { setLoading(false) } }
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"><svg width="100%" height="100%"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C9A84C" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-luxury-lg overflow-hidden">
          <div className="bg-obsidian p-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center"><Gem size={20} className="text-obsidian" /></div><div className="text-left"><div className="font-display text-xl text-gold-light">Ratan Jewellers</div><div className="font-mono-code text-[9px] text-gold/50 tracking-[0.2em] uppercase">Since 1985</div></div></Link>
            <h1 className="font-display text-2xl text-white">Welcome Back</h1>
            <p className="text-gold-light/40 text-sm mt-1">Sign in to your account</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-xs font-medium text-warm-grey uppercase tracking-wider mb-1.5 block">Email Address</label><div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-grey/50" /><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="luxury-input pl-9" placeholder="you@example.com" required autoComplete="email" /></div></div>
              <div><label className="text-xs font-medium text-warm-grey uppercase tracking-wider mb-1.5 block">Password</label><div className="relative"><Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-grey/50" /><input type={showPassword?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="luxury-input pl-9 pr-10" placeholder="Your password" required autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-grey/50 hover:text-warm-grey transition-colors">{showPassword?<EyeOff size={15}/>:<Eye size={15}/>}</button></div></div>
              <div className="flex justify-end"><Link href="/forgot-password" className="text-xs text-gold hover:text-gold-dark transition-colors">Forgot password?</Link></div>
              <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 rounded text-sm font-medium mt-2">{loading?'Signing in...':'Sign In'}</button>
            </form>
            <div className="mt-6 text-center"><p className="text-sm text-warm-grey">Don't have an account? <Link href="/register" className="text-gold hover:text-gold-dark transition-colors font-medium">Create one</Link></p></div>
            <Link href="/" className="mt-4 flex justify-center text-xs text-warm-grey hover:text-gold transition-colors">← Back to store</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
