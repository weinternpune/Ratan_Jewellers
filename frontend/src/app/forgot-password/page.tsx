'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

type Step = 'email' | 'otp' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement|null)[]>([])

  // ── Step 1: Check account exists, then send OTP ──────────────────────
  const handleEmailSubmit = async () => {
    if (!email.trim()) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      const checkRes = (await api.post<any>('/auth/check-account', { email: email.trim().toLowerCase() })) as any
      if (!checkRes.exists) {
        toast.error('No account found with this email. Please register first.')
        setLoading(false)
        return
      }
      const sendRes = (await api.post<any>('/auth/forgot-password/send-otp', { email: email.trim().toLowerCase() })) as any
      toast.success(sendRes?.data?.message || 'Reset code sent to your email', { duration: 6000 })
      setStep('otp')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputs.current[i+1]?.focus()
  }
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i-1]?.focus()
  }

  // ── Step 2: Verify OTP locally then move to reset ─────────────────────
  const handleOtpSubmit = () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Enter the complete 6-digit code'); return }
    setStep('reset')
  }

  // ── Step 3: Reset password with OTP + new password ────────────────────
  const handleResetSubmit = async () => {
    if (newPass.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/reset', { email: email.trim().toLowerCase(), otp: otp.join(''), newPassword: newPass })
      toast.success('Password reset successfully!')
      setStep('done')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password. OTP may be invalid or expired.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center p-4 font-serif">
      <div className="w-full max-w-md bg-white border border-[#E0D5B8] p-8 sm:p-10">
        <Link href="/login" className="flex items-center gap-1 text-xs text-[#9D7A2E] mb-6 hover:text-[#71531A] font-sans"><ArrowLeft size={13}/>Back to login</Link>

        {step === 'email' && (<>
          <div className="text-[10px] tracking-[0.3em] text-[#C9A84C] font-sans mb-2">RESET PASSWORD</div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#1a0004] mb-2">Forgot your password?</h1>
          <p className="text-sm text-gray-500 font-sans mb-7">Enter the email linked to your registered account.</p>
          <label className="text-[10px] font-sans tracking-[0.2em] text-[#9D7A2E] block mb-2">EMAIL ADDRESS</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmailSubmit()} placeholder="you@example.com"
            className="w-full border border-[#E0D5B8] bg-white outline-none p-3.5 text-base font-serif text-[#1a0004] focus:border-[#C9A84C] mb-5"/>
          <button onClick={handleEmailSubmit} disabled={loading} className="w-full bg-[#1a0004] text-[#FAF7F0] p-3.5 text-xs tracking-[0.15em] font-sans hover:bg-[#2D0A0F] disabled:opacity-50">
            {loading ? 'CHECKING…' : 'SEND RESET CODE'}
          </button>
          <p className="text-center text-xs font-sans text-gray-500 mt-6">Don't have an account? <Link href="/register" className="text-[#9D7A2E] font-semibold underline">Register first</Link></p>
        </>)}

        {step === 'otp' && (<>
          <div className="text-[10px] tracking-[0.3em] text-[#C9A84C] font-sans mb-2">VERIFY CODE</div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#1a0004] mb-2">Enter reset code</h1>
          <p className="text-sm text-gray-500 font-sans mb-7">Sent to <strong className="text-gray-700">{email}</strong></p>
          <div className="flex gap-2 sm:gap-3 justify-center mb-6">
            {otp.map((d,i) => (
              <input key={i} ref={el=>{inputs.current[i]=el}} value={d} onChange={e=>handleOtpChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)} maxLength={1} inputMode="numeric" autoFocus={i===0}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-sans font-bold border-2 border-[#E0D5B8] focus:border-[#C9A84C] outline-none rounded-lg"/>
            ))}
          </div>
          <button onClick={handleOtpSubmit} className="w-full bg-[#1a0004] text-[#FAF7F0] p-3.5 text-xs tracking-[0.15em] font-sans hover:bg-[#2D0A0F]">CONTINUE</button>
        </>)}

        {step === 'reset' && (<>
          <div className="text-[10px] tracking-[0.3em] text-[#C9A84C] font-sans mb-2">NEW PASSWORD</div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#1a0004] mb-7">Set a new password</h1>
          <label className="text-[10px] font-sans tracking-[0.2em] text-[#9D7A2E] block mb-2">NEW PASSWORD</label>
          <div className="relative mb-4">
            <input type={showPass?'text':'password'} value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Min 6 characters"
              className="w-full border border-[#E0D5B8] bg-white outline-none p-3.5 pr-12 text-base font-serif text-[#1a0004] focus:border-[#C9A84C]"/>
            <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9D7A2E]">{showPass?<EyeOff size={15}/>:<Eye size={15}/>}</button>
          </div>
          <label className="text-[10px] font-sans tracking-[0.2em] text-[#9D7A2E] block mb-2">CONFIRM PASSWORD</label>
          <input type={showPass?'text':'password'} value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} placeholder="Re-enter password"
            className="w-full border border-[#E0D5B8] bg-white outline-none p-3.5 text-base font-serif text-[#1a0004] focus:border-[#C9A84C] mb-6"/>
          <button onClick={handleResetSubmit} disabled={loading} className="w-full bg-[#1a0004] text-[#FAF7F0] p-3.5 text-xs tracking-[0.15em] font-sans hover:bg-[#2D0A0F] disabled:opacity-50">
            {loading ? 'RESETTING…' : 'RESET PASSWORD'}
          </button>
        </>)}

        {step === 'done' && (<>
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h1 className="text-2xl font-light text-[#1a0004] mb-2">Password reset!</h1>
            <p className="text-sm text-gray-500 font-sans mb-7">You can now sign in with your new password.</p>
            <button onClick={()=>router.push('/login')} className="w-full bg-[#1a0004] text-[#FAF7F0] p-3.5 text-xs tracking-[0.15em] font-sans hover:bg-[#2D0A0F]">GO TO SIGN IN</button>
          </div>
        </>)}
      </div>
    </div>
  )
}
