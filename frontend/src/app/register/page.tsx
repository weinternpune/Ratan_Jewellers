'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Gem, Lock, Mail, ArrowLeft, ShieldCheck, User, Phone } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone || undefined,
        password: form.password,
      }

      // ── Backend only — no local fallback. Auth is 100% backend. ─────────
      await api.post('/auth/register', payload)
      await api.post('/auth/send-otp', { email: payload.email })

      toast.success('Account created! Check your email for the verification code.')
      router.push(`/verify-email?email=${encodeURIComponent(payload.email)}`)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C2C2C] flex items-center justify-center relative overflow-hidden font-sans">
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

      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#C9A84C]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#340008]/15 to-transparent blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-5xl mx-4 my-8 grid lg:grid-cols-2 bg-white border border-[#E8D5A3] shadow-[0_24px_70px_rgba(13,7,0,0.08)] overflow-hidden">

        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-[#340008] to-[#1E0004] text-white border-r border-[#E8D5A3]/30 overflow-hidden">
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
              Join <span className="gold-shimmer">Ratan Privé</span>,<br />Our Patron Club.
            </h2>
            <p className="mt-6 text-white/80 text-sm leading-relaxed max-w-sm">
              Create an account to track your orders, book customized design consultations, receive priority support, and earn loyalty points on every purchase.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-xs text-[#E8D5A3]">
            <ShieldCheck size={16} className="text-[#C9A84C]" />
            <span>BIS Hallmarked Purity Guarantee</span>
          </div>
        </div>

        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="lg:hidden flex justify-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#FAF6EE] border border-[#E8D5A3] flex items-center justify-center">
                <Gem size={18} className="text-[#340008]" />
              </div>
              <span className="font-display text-base font-bold tracking-widest text-[#340008]">RATAN JEWELLERS</span>
            </Link>
          </div>

          <div className="text-center lg:text-left mb-6">
            <h1 className="font-display text-3xl font-semibold text-[#340008]">Create Account</h1>
            <p className="text-[#71531A]/60 text-xs mt-1 tracking-wider uppercase font-semibold">Join our legacy of trust</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#71531A] uppercase tracking-widest mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#FAF6EE]/50 border border-[#E0C883] text-[#2C2C2C] placeholder-[#8a7c70] rounded-none pl-11 pr-4 py-2.5 text-sm focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300"
                  placeholder="Your Name" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#71531A] uppercase tracking-widest mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#FAF6EE]/50 border border-[#E0C883] text-[#2C2C2C] placeholder-[#8a7c70] rounded-none pl-11 pr-4 py-2.5 text-sm focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300"
                    placeholder="you@example.com" required autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#71531A] uppercase tracking-widest mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#FAF6EE]/50 border border-[#E0C883] text-[#2C2C2C] placeholder-[#8a7c70] rounded-none pl-11 pr-4 py-2.5 text-sm focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300"
                    placeholder="+91..." required />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#71531A] uppercase tracking-widest mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#FAF6EE]/50 border border-[#E0C883] text-[#2C2C2C] placeholder-[#8a7c70] rounded-none pl-11 pr-11 py-2.5 text-sm focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300"
                  placeholder="••••••••" required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C] hover:text-[#340008] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#71531A] uppercase tracking-widest mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A84C]" />
                <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full bg-[#FAF6EE]/50 border border-[#E0C883] text-[#2C2C2C] placeholder-[#8a7c70] rounded-none pl-11 pr-4 py-2.5 text-sm focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/15 outline-none transition-all duration-300"
                  placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3 mt-4 text-xs font-semibold uppercase tracking-widest text-white hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(201,168,76,0.15)]">
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#2C2C2C]/70">
              Already have an account?{' '}
              <Link href="/login" className="text-[#9D7A2E] hover:text-[#340008] font-bold transition-colors underline underline-offset-4">Sign In</Link>
            </p>
            <Link href="/" className="inline-flex items-center gap-2 mt-6 text-[10px] uppercase font-bold tracking-widest text-[#9D7A2E] hover:text-[#340008] transition-colors group">
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
