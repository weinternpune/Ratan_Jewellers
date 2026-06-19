'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

function VerifyEmailInner() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''
  const { setAuth } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef<(HTMLInputElement|null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputs.current[i+1]?.focus()
  }
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i-1]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Enter the complete 6-digit code'); return }
    setLoading(true)
    try {
      const res = (await api.post<any>('/auth/verify-otp', { email, otp: code })) as any
      const { user, accessToken, refreshToken } = res.data
      setAuth(user, accessToken, refreshToken)
      toast.success('Email verified! Welcome to Ratan Jewellers.')
      router.push('/')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid or expired OTP')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await api.post<any>('/auth/send-otp', { email })
      toast.success(res?.data?.message || 'New OTP sent to your email', { duration: 6000 })
      setCooldown(60)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP')
    } finally { setResending(false) }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-4 font-serif">
      <div className="w-full max-w-md bg-white border border-[#E0D5B8] p-8 sm:p-10">
        <Link href="/login" className="flex items-center gap-1 text-xs text-[#9D7A2E] mb-6 hover:text-[#71531A] font-sans"><ArrowLeft size={13}/>Back to login</Link>
        <div className="text-[10px] tracking-[0.3em] text-[#C9A84C] font-sans mb-2">VERIFY YOUR EMAIL</div>
        <h1 className="text-2xl sm:text-3xl font-light text-[#1a0004] mb-2">Enter verification code</h1>
        <p className="text-sm text-gray-500 font-sans mb-7">We sent a 6-digit code to <strong className="text-gray-700">{email}</strong></p>

        <div className="flex gap-2 sm:gap-3 justify-center mb-6">
          {otp.map((d, i) => (
            <input key={i} ref={el => { inputs.current[i]=el }} value={d} onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)}
              maxLength={1} inputMode="numeric" autoFocus={i===0}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-sans font-bold border-2 border-[#E0D5B8] focus:border-[#C9A84C] outline-none rounded-lg"/>
          ))}
        </div>

        <button onClick={handleVerify} disabled={loading} className="w-full bg-[#1a0004] text-[#FAF7F0] p-3.5 text-xs tracking-[0.15em] font-sans hover:bg-[#2D0A0F] transition-colors disabled:opacity-50 mb-4">
          {loading ? 'VERIFYING…' : 'VERIFY EMAIL'}
        </button>

        <div className="text-center">
          <button onClick={handleResend} disabled={resending || cooldown>0} className="text-xs font-sans text-[#9D7A2E] hover:text-[#71531A] disabled:opacity-40 disabled:cursor-not-allowed underline underline-offset-2">
            {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending…' : 'Resend verification code'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return <Suspense fallback={null}><VerifyEmailInner/></Suspense>
}
