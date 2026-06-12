'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

type Step = 'identifier' | 'otp' | 'newpassword' | 'done'

const BRAND_COLOR = '#C9A84C'
const DARK = '#1a0004'

export default function ForgotPasswordPage() {
  const [step, setStep]               = useState<Step>('identifier')
  const [identifier, setIdentifier]   = useState('')
  const [otp, setOtp]                 = useState(['', '', '', '', '', ''])
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [countdown, setCountdown]     = useState(0)
  const [animating, setAnimating]     = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const router  = useRouter()

  const goTo = (s: Step) => {
    setAnimating(true)
    setTimeout(() => { setStep(s); setAnimating(false) }, 200)
  }

  const startCountdown = () => {
    setCountdown(59)
    const t = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 }), 1000)
  }

  const isPhone = /^\+?\d/.test(identifier.trim())
  const type    = isPhone ? 'phone' : 'email'

  const handleSendOTP = async () => {
    if (!identifier.trim()) { toast.error('Enter your mobile number or email'); return }
    setLoading(true)
    try {
      await api.post('/auth/otp/send', { identifier: identifier.trim(), type, purpose: 'reset_password' })
      goTo('otp')
      startCountdown()
      toast.success(`OTP sent to ${isPhone ? 'your mobile' : 'your email'}!`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleOTPChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOTPKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  const handleVerifyOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Enter the full 6-digit OTP'); return }
    setLoading(true)
    try {
      await api.post('/auth/otp/verify', { identifier: identifier.trim(), code, purpose: 'reset_password', type })
      goTo('newpassword')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async () => {
    if (password.length < 8)     { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { identifier: identifier.trim(), code: otp.join(''), newPassword: password })
      goTo('done')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed. Please try again.')
    } finally { setLoading(false) }
  }

  const otpComplete = otp.every(d => d !== '')

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF7F0', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-14 overflow-hidden" style={{ background: DARK }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="fp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="#C9A84C"/>
              <path d="M0 30h60M30 0v60" stroke="#C9A84C" strokeWidth="0.3"/>
              <path d="M15 15l30 30M45 15L15 45" stroke="#C9A84C" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fp)"/>
        </svg>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}/>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 border flex items-center justify-center" style={{ borderColor: '#C9A84C40' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#E8D5A3', fontSize: '11px', letterSpacing: '0.3em', fontFamily: 'sans-serif', fontWeight: 700 }}>RATAN JEWELLERS</div>
            <div style={{ color: '#C9A84C60', fontSize: '9px', letterSpacing: '0.2em', fontFamily: 'sans-serif' }}>EST. 1985</div>
          </div>
        </div>

        {/* Centre */}
        <div className="relative z-10">
          <div style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'sans-serif', marginBottom: '20px' }}>ACCOUNT RECOVERY</div>
          <h2 style={{ color: '#FAF7F0', fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.1, fontWeight: 300 }}>
            Back in a<br />
            <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>moment</em>.
          </h2>
          <div style={{ width: '40px', height: '1px', background: '#C9A84C', margin: '28px 0' }}/>
          <p style={{ color: '#E8D5A380', fontSize: '14px', lineHeight: 1.8, maxWidth: '280px', fontFamily: 'sans-serif', fontWeight: 300 }}>
            We'll send a one-time code to your registered mobile or email to verify your identity.
          </p>

          {/* Step indicators */}
          <div className="mt-10 space-y-3">
            {[
              ['01', 'Enter mobile or email', step === 'identifier'],
              ['02', 'Verify with OTP',        step === 'otp'],
              ['03', 'Set new password',        step === 'newpassword'],
            ].map(([num, label, active]) => (
              <div key={String(num)} className="flex items-center gap-3">
                <div style={{ width: '24px', height: '24px', border: `1px solid ${active ? '#C9A84C' : '#C9A84C30'}`, color: active ? '#C9A84C' : '#C9A84C40', fontSize: '9px', fontFamily: 'sans-serif', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>{String(num)}</div>
                <span style={{ color: active ? '#E8D5A3' : '#E8D5A340', fontSize: '12px', fontFamily: 'sans-serif', letterSpacing: '0.1em', transition: 'all 0.3s' }}>{String(label)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10" style={{ color: '#C9A84C40', fontSize: '11px', fontFamily: 'sans-serif', letterSpacing: '0.1em' }}>
          BIS HALLMARKED · SINCE 1985 · TRUSTED BY 50,000+
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 text-center">
          <div style={{ fontSize: '11px', letterSpacing: '0.35em', fontFamily: 'sans-serif', fontWeight: 700, color: DARK }}>RATAN JEWELLERS</div>
          <div style={{ width: '30px', height: '1px', background: BRAND_COLOR, margin: '8px auto 0' }}/>
        </div>

        <div className={`w-full max-w-sm transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>

          {/* ── STEP 1: IDENTIFIER ── */}
          {step === 'identifier' && (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.35em', fontFamily: 'sans-serif', color: BRAND_COLOR, marginBottom: '8px' }}>STEP 1 OF 3</div>
              <h2 style={{ fontSize: '32px', fontWeight: 300, color: DARK, lineHeight: 1.2, marginBottom: '8px' }}>
                Reset your<br /><em style={{ fontStyle: 'italic' }}>password</em>
              </h2>
              <p style={{ fontSize: '13px', fontFamily: 'sans-serif', color: '#888', marginBottom: '32px', lineHeight: 1.6 }}>
                Enter the mobile number or email linked to your account.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', fontFamily: 'sans-serif', letterSpacing: '0.2em', color: '#9D7A2E', display: 'block', marginBottom: '8px' }}>MOBILE NUMBER OR EMAIL</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                  placeholder="+91 98765 43210 or email"
                  autoFocus
                  style={{ width: '100%', border: '1px solid #E0D5B8', background: 'white', outline: 'none', padding: '14px 16px', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", color: DARK, boxSizing: 'border-box' }}
                />
              </div>

              <button onClick={handleSendOTP} disabled={loading} className="w-full flex items-center justify-between transition-all hover:opacity-90 disabled:opacity-50" style={{ background: DARK, padding: '14px 20px', color: '#FAF7F0', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: '12px', fontFamily: 'sans-serif', letterSpacing: '0.15em' }}>{loading ? 'SENDING OTP…' : 'SEND OTP'}</span>
                <ArrowRight size={14} color="#C9A84C"/>
              </button>

              <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', fontFamily: 'sans-serif', color: '#999' }}>
                Remembered it?{' '}
                <Link href="/login" style={{ color: '#9D7A2E', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <div>
              <button onClick={() => goTo('identifier')} className="flex items-center gap-1 mb-8 hover:opacity-70 transition-opacity" style={{ fontSize: '11px', fontFamily: 'sans-serif', color: '#9D7A2E', letterSpacing: '0.15em', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft size={12}/> BACK
              </button>
              <div style={{ fontSize: '11px', letterSpacing: '0.35em', fontFamily: 'sans-serif', color: BRAND_COLOR, marginBottom: '8px' }}>STEP 2 OF 3</div>
              <h2 style={{ fontSize: '32px', fontWeight: 300, color: DARK, lineHeight: 1.2, marginBottom: '8px' }}>
                Verify your<br /><em style={{ fontStyle: 'italic' }}>identity</em>
              </h2>
              <p style={{ fontSize: '13px', fontFamily: 'sans-serif', color: '#888', marginBottom: '32px' }}>
                Code sent to <strong style={{ color: DARK }}>{identifier}</strong>
              </p>

              {/* 6-box OTP */}
              <div className="flex gap-2 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOTPChange(i, e.target.value)}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      flex: 1, height: '56px', textAlign: 'center',
                      fontSize: '22px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600,
                      border: `1px solid ${digit ? '#C9A84C' : '#E0D5B8'}`,
                      background: digit ? '#FFFBF0' : 'white',
                      outline: 'none', color: DARK, transition: 'all 0.15s'
                    }}
                  />
                ))}
              </div>

              <button onClick={handleVerifyOTP} disabled={!otpComplete || loading} className="w-full flex items-center justify-between transition-all hover:opacity-90 disabled:opacity-40" style={{ background: DARK, padding: '14px 20px', color: '#FAF7F0', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontFamily: 'sans-serif', letterSpacing: '0.15em' }}>{loading ? 'VERIFYING…' : 'VERIFY OTP'}</span>
                <ArrowRight size={14} color="#C9A84C"/>
              </button>

              <div style={{ textAlign: 'center', fontSize: '12px', fontFamily: 'sans-serif' }}>
                {countdown > 0 ? (
                  <span style={{ color: '#999' }}>Resend in <strong style={{ color: DARK }}>{countdown}s</strong></span>
                ) : (
                  <button onClick={() => { setOtp(['','','','','','']); handleSendOTP() }} style={{ color: '#9D7A2E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', fontSize: '12px' }}>
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: NEW PASSWORD ── */}
          {step === 'newpassword' && (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.35em', fontFamily: 'sans-serif', color: BRAND_COLOR, marginBottom: '8px' }}>STEP 3 OF 3</div>
              <h2 style={{ fontSize: '32px', fontWeight: 300, color: DARK, lineHeight: 1.2, marginBottom: '8px' }}>
                New<br /><em style={{ fontStyle: 'italic' }}>password</em>
              </h2>
              <p style={{ fontSize: '13px', fontFamily: 'sans-serif', color: '#888', marginBottom: '32px' }}>
                Must be at least 8 characters.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '10px', fontFamily: 'sans-serif', letterSpacing: '0.2em', color: '#9D7A2E', display: 'block', marginBottom: '8px' }}>NEW PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoFocus
                    style={{ width: '100%', border: '1px solid #E0D5B8', background: 'white', outline: 'none', padding: '14px 44px 14px 16px', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", color: DARK, boxSizing: 'border-box' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9D7A2E' }}>
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map(n => (
                      <div key={n} style={{ flex: 1, height: '2px', background: password.length >= n * 2 + 4 ? (n <= 2 ? '#e85d4a' : n === 3 ? '#C9A84C' : '#4CAF50') : '#E0D5B8', transition: 'all 0.3s' }}/>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', fontFamily: 'sans-serif', letterSpacing: '0.2em', color: '#9D7A2E', display: 'block', marginBottom: '8px' }}>CONFIRM PASSWORD</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                  placeholder="Repeat password"
                  style={{ width: '100%', border: `1px solid ${confirmPassword && confirmPassword !== password ? '#e85d4a' : '#E0D5B8'}`, background: 'white', outline: 'none', padding: '14px 16px', fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", color: DARK, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize: '11px', fontFamily: 'sans-serif', color: '#e85d4a', marginTop: '4px' }}>Passwords do not match</p>
                )}
              </div>

              <button onClick={handleResetPassword} disabled={loading || !password || password !== confirmPassword} className="w-full flex items-center justify-between transition-all hover:opacity-90 disabled:opacity-40" style={{ background: DARK, padding: '14px 20px', color: '#FAF7F0', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: '12px', fontFamily: 'sans-serif', letterSpacing: '0.15em' }}>{loading ? 'RESETTING…' : 'RESET PASSWORD'}</span>
                <ArrowRight size={14} color="#C9A84C"/>
              </button>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="text-center py-8">
              <div style={{ width: '64px', height: '64px', border: `1px solid ${BRAND_COLOR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize: '11px', letterSpacing: '0.35em', fontFamily: 'sans-serif', color: BRAND_COLOR, marginBottom: '12px' }}>SUCCESS</div>
              <h2 style={{ fontSize: '32px', fontWeight: 300, color: DARK, marginBottom: '12px', lineHeight: 1.2 }}>
                Password<br /><em style={{ fontStyle: 'italic' }}>updated</em>.
              </h2>
              <p style={{ fontSize: '13px', fontFamily: 'sans-serif', color: '#888', marginBottom: '28px' }}>
                Sign in with your new password.
              </p>
              <Link href="/login" className="inline-flex items-center gap-3 transition-all hover:opacity-90" style={{ background: DARK, padding: '14px 28px', color: '#FAF7F0', textDecoration: 'none', fontSize: '12px', fontFamily: 'sans-serif', letterSpacing: '0.15em' }}>
                SIGN IN NOW <ArrowRight size={14} color="#C9A84C"/>
              </Link>
            </div>
          )}
        </div>

        {step === 'identifier' && (
          <p style={{ position: 'absolute', bottom: '32px', fontSize: '11px', fontFamily: 'sans-serif', color: '#AAA' }}>
            <Link href="/" style={{ color: '#9D7A2E', textDecoration: 'none' }}>← Return to store</Link>
          </p>
        )}
      </div>
    </div>
  )
}
