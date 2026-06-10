'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

type Mode = 'intro' | 'otp_phone' | 'otp_code' | 'password'

interface LoginResponse {
  user: { id: string; email: string; name: string; role: string }
  accessToken: string
  refreshToken: string
}

const GOLD = '#C9A84C'
const DARK = '#1a0004'
const ADMIN_ROLES = ['ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF','INVENTORY_MANAGER']

export default function LoginPage() {
  const [mode, setMode]           = useState<Mode>('intro')
  const [phone, setPhone]         = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [otp, setOtp]             = useState(['','','','','',''])
  const [loading, setLoading]     = useState(false)
  const [otpSent, setOtpSent]     = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [animating, setAnimating] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const { setAuth } = useAuthStore()
  const router = useRouter()

  // Redirect admin if already logged in
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ratan-auth-store')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.state?.isLoggedIn && parsed?.state?.currentUser) {
          router.replace('/admin/dashboard')
        }
      }
    } catch {}
  }, [])

  const goTo = (m: Mode) => { setAnimating(true); setTimeout(() => { setMode(m); setAnimating(false) }, 150) }

  const startCountdown = () => {
    setCountdown(59)
    const t = setInterval(() => setCountdown(p => { if (p <= 1) { clearInterval(t); return 0 } return p - 1 }), 1000)
  }

  const redirect = (role: string) => {
    if (ADMIN_ROLES.includes(role.toUpperCase())) {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  }

  // ── Password login — calls Express backend ──────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please enter your email and password'); return }
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email: email.trim(), password })
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)

      // Also set admin store if admin role
      if (ADMIN_ROLES.includes(res.data.user.role.toUpperCase())) {
        const { useAuthStore: useAdminAuth } = await import('@/store/authStore')
        useAdminAuth.setState({
          currentUser: { id: res.data.user.id, name: res.data.user.name, email: res.data.user.email, role: res.data.user.role.toLowerCase() as any, status: 'active' },
          accessToken: res.data.accessToken,
          isLoggedIn: true,
          viewAsRole: null,
        })
      }

      toast.success(`Welcome back, ${res.data.user.name}!`)
      redirect(res.data.user.role)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  // ── OTP send ────────────────────────────────────────────────────────────────
  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\s/g, '')
    if (!cleaned || cleaned.length < 10) { toast.error('Enter a valid mobile number'); return }
    setLoading(true)
    try {
      await api.post('/auth/otp/send', { identifier: cleaned, type: 'phone', purpose: 'login' })
      setOtpSent(true)
      startCountdown()
      toast.success('OTP sent!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not send OTP')
    } finally { setLoading(false) }
  }

  // ── OTP verify ──────────────────────────────────────────────────────────────
  const handleOTPLogin = async () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Enter the full 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/otp/verify', {
        identifier: phone.replace(/\s/g, ''), code, purpose: 'login', type: 'phone'
      })
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      redirect(res.data.user.role)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid OTP')
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

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','') || 'http://localhost:5000'}/api/auth/google`, { redirect: 'manual' })
      if (res.status === 503 || res.status === 0) { toast.error('Google sign-in is not set up yet. Please use Mobile OTP.'); return }
    } catch {}
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`
  }

  const otpComplete = otp.every(d => d !== '')

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#FAF7F0', fontFamily:"'Cormorant Garamond',Georgia,serif" }}>

      {/* Left panel */}
      <div style={{ width:'44%', flexShrink:0, background:'linear-gradient(160deg,#3D0F16 0%,#2D0A0F 60%,#1E0509 100%)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'56px', position:'relative', overflow:'hidden' }} className="hidden lg:flex">
        <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.07 }} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="lg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="#C9A84C"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#lg)"/>
        </svg>
        <div style={{ position:'absolute',top:'-60px',right:'-60px',width:'300px',height:'300px',borderRadius:'50%',background:'radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 70%)',pointerEvents:'none' }}/>
        <div style={{ position:'relative',zIndex:10,display:'flex',alignItems:'center',gap:'12px' }}>
          <div style={{ width:'36px',height:'36px',border:'1px solid rgba(201,168,76,0.4)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ color:'#F0E0B0',fontSize:'11px',letterSpacing:'0.3em',fontFamily:'sans-serif',fontWeight:700 }}>RATAN JEWELLERS</div>
            <div style={{ color:'rgba(201,168,76,0.5)',fontSize:'9px',letterSpacing:'0.2em',fontFamily:'sans-serif' }}>EST. 1985</div>
          </div>
        </div>
        <div style={{ position:'relative',zIndex:10 }}>
          <div style={{ color:'#C9A84C',fontSize:'11px',letterSpacing:'0.4em',fontFamily:'sans-serif',marginBottom:'20px' }}>YOUR ACCOUNT</div>
          <h2 style={{ color:'#FAF7F0',fontSize:'clamp(36px,3.5vw,52px)',lineHeight:1.1,fontWeight:300 }}>
            Crafted for<br/>those who<br/><em style={{ color:'#D4AF50',fontStyle:'italic' }}>cherish</em>.
          </h2>
          <div style={{ width:'40px',height:'1px',background:'#C9A84C',margin:'28px 0' }}/>
          <p style={{ color:'rgba(240,224,176,0.65)',fontSize:'14px',lineHeight:1.85,maxWidth:'280px',fontFamily:'sans-serif',fontWeight:300 }}>
            Track your orders, manage custom jewellery requests, and access exclusive member offers.
          </p>
        </div>
        <div style={{ position:'relative',zIndex:10,color:'rgba(201,168,76,0.35)',fontSize:'10px',fontFamily:'sans-serif',letterSpacing:'0.15em' }}>
          BIS HALLMARKED · SINCE 1985 · TRUSTED BY 50,000+
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1,minWidth:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',position:'relative',minHeight:'100vh',boxSizing:'border-box',overflowX:'hidden' }}>
        <div className="lg:hidden" style={{ marginBottom:'32px',textAlign:'center' }}>
          <div style={{ fontSize:'11px',letterSpacing:'0.35em',fontFamily:'sans-serif',fontWeight:700,color:DARK }}>RATAN JEWELLERS</div>
          <div style={{ width:'30px',height:'1px',background:GOLD,margin:'8px auto 0' }}/>
        </div>

        <div style={{ width:'100%',maxWidth:'400px',boxSizing:'border-box',opacity:animating?0:1,transform:animating?'translateY(8px)':'translateY(0)',transition:'opacity 0.15s,transform 0.15s' }}>

          {/* ── INTRO ── */}
          {mode === 'intro' && (
            <div>
              <div style={{ fontSize:'11px',letterSpacing:'0.35em',fontFamily:'sans-serif',color:GOLD,marginBottom:'8px' }}>SIGN IN</div>
              <h1 style={{ fontSize:'clamp(28px,5vw,40px)',fontWeight:300,color:DARK,lineHeight:1.15,marginBottom:'32px' }}>Welcome<br/><em style={{ fontStyle:'italic',color:'#9D7A2E' }}>back</em>.</h1>

              {/* Google */}
              <button onClick={handleGoogleLogin} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',border:'1px solid #E0D5B8',background:'white',padding:'13px 20px',fontSize:'13px',fontFamily:'sans-serif',color:'#333',cursor:'pointer',marginBottom:'12px',boxSizing:'border-box' }}>
                <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.8 39.6 16.4 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4-4.3 5.2l6.2 5.2C40.9 35 44 30 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
                Continue with Google
              </button>

              <div style={{ display:'flex',alignItems:'center',gap:'12px',margin:'20px 0' }}>
                <div style={{ flex:1,height:'1px',background:'#E0D5B8' }}/><span style={{ fontSize:'10px',fontFamily:'sans-serif',color:'#BBA87A',letterSpacing:'0.15em' }}>OR</span><div style={{ flex:1,height:'1px',background:'#E0D5B8' }}/>
              </div>

              {/* Mobile OTP */}
              <button onClick={() => goTo('otp_phone')} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:DARK,padding:'14px 20px',color:'#FAF7F0',border:'none',cursor:'pointer',marginBottom:'10px',boxSizing:'border-box' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012.88 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <span style={{ fontSize:'13px',fontFamily:'sans-serif' }}>Sign in with Mobile OTP</span>
                </div>
                <ArrowRight size={14} color="#C9A84C"/>
              </button>

              {/* Password */}
              <button onClick={() => goTo('password')} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',border:'1px solid #E0D5B8',background:'white',padding:'13px 20px',color:'#555',cursor:'pointer',boxSizing:'border-box' }}>
                <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9D7A2E" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  <span style={{ fontSize:'13px',fontFamily:'sans-serif' }}>Sign in with Email &amp; Password</span>
                </div>
                <ArrowRight size={14} color="#C9A84C"/>
              </button>

              <p style={{ textAlign:'center',fontSize:'12px',fontFamily:'sans-serif',color:'#999',marginTop:'28px' }}>
                New here? <Link href="/register" style={{ color:'#9D7A2E',fontWeight:600,textDecoration:'underline',textUnderlineOffset:'3px' }}>Create an account</Link>
              </p>
            </div>
          )}

          {/* ── OTP PHONE ── */}
          {mode === 'otp_phone' && (
            <div>
              <button onClick={() => goTo('intro')} style={{ fontSize:'11px',fontFamily:'sans-serif',color:'#9D7A2E',letterSpacing:'0.15em',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',marginBottom:'32px',padding:0 }}>
                <ArrowLeft size={12}/> BACK
              </button>
              <div style={{ fontSize:'11px',letterSpacing:'0.35em',fontFamily:'sans-serif',color:GOLD,marginBottom:'8px' }}>OTP LOGIN</div>
              <h2 style={{ fontSize:'32px',fontWeight:300,color:DARK,lineHeight:1.2,marginBottom:'32px' }}>Your mobile<br/><em style={{ fontStyle:'italic' }}>number</em></h2>

              <label style={{ fontSize:'10px',fontFamily:'sans-serif',letterSpacing:'0.2em',color:'#9D7A2E',display:'block',marginBottom:'8px' }}>MOBILE NUMBER</label>
              <div style={{ display:'flex',border:'1px solid #E0D5B8',background:'white',marginBottom:'20px' }}>
                <div style={{ width:'52px',display:'flex',alignItems:'center',justifyContent:'center',borderRight:'1px solid #E0D5B8',fontSize:'13px',fontFamily:'sans-serif',color:'#555',background:'#FAF7F0',flexShrink:0 }}>+91</div>
                <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/[^\d\s]/g,'').slice(0,12))} onKeyDown={e=>e.key==='Enter'&&handleSendOTP()} placeholder="98765 43210" autoFocus
                  style={{ flex:1,minWidth:0,border:'none',outline:'none',padding:'14px 12px',fontSize:'20px',fontFamily:"'Cormorant Garamond',serif",background:'transparent',color:DARK }}/>
              </div>
              <button onClick={handleSendOTP} disabled={loading} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:DARK,padding:'14px 20px',color:'#FAF7F0',border:'none',cursor:'pointer',opacity:loading?0.5:1,boxSizing:'border-box' }}>
                <span style={{ fontSize:'12px',fontFamily:'sans-serif',letterSpacing:'0.15em' }}>{loading?'SENDING OTP…':'SEND OTP'}</span>
                <ArrowRight size={14} color="#C9A84C"/>
              </button>

              {otpSent && (
                <div style={{ marginTop:'24px' }}>
                  <div style={{ background:'#FAF7F0',border:'1px solid #E8D5A3',padding:'12px 16px',fontSize:'12px',fontFamily:'sans-serif',color:'#71531A',marginBottom:'16px' }}>
                    OTP sent to <strong>+91 {phone}</strong>
                  </div>
                  <label style={{ fontSize:'10px',fontFamily:'sans-serif',letterSpacing:'0.2em',color:'#9D7A2E',display:'block',marginBottom:'8px' }}>ENTER 6-DIGIT OTP</label>
                  <div style={{ display:'flex',gap:'8px',marginBottom:'16px' }}>
                    {otp.map((digit,i) => (
                      <input key={i} ref={el=>{otpRefs.current[i]=el}} type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e=>handleOTPChange(i,e.target.value)} onKeyDown={e=>handleOTPKeyDown(i,e)} autoFocus={i===0}
                        style={{ flex:1,height:'56px',textAlign:'center',fontSize:'22px',fontFamily:"'Cormorant Garamond',serif",fontWeight:600,border:`1.5px solid ${digit?GOLD:'#E0D5B8'}`,background:digit?'#FFFBF0':'white',outline:'none',color:DARK,transition:'all 0.15s',minWidth:0 }}/>
                    ))}
                  </div>
                  <button onClick={handleOTPLogin} disabled={!otpComplete||loading} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:DARK,padding:'14px 20px',color:'#FAF7F0',border:'none',cursor:'pointer',opacity:(!otpComplete||loading)?0.4:1,marginBottom:'12px',boxSizing:'border-box' }}>
                    <span style={{ fontSize:'12px',fontFamily:'sans-serif',letterSpacing:'0.15em' }}>{loading?'VERIFYING…':'VERIFY & SIGN IN'}</span>
                    <ArrowRight size={14} color="#C9A84C"/>
                  </button>
                  <div style={{ textAlign:'center',fontSize:'12px',fontFamily:'sans-serif' }}>
                    {countdown>0
                      ? <span style={{ color:'#999' }}>Resend in <strong style={{ color:DARK }}>{countdown}s</strong></span>
                      : <button onClick={()=>{setOtp(['','','','','','']);handleSendOTP()}} style={{ color:'#9D7A2E',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',fontSize:'12px' }}>Resend OTP</button>
                    }
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PASSWORD ── */}
          {mode === 'password' && (
            <div>
              <button onClick={() => goTo('intro')} style={{ fontSize:'11px',fontFamily:'sans-serif',color:'#9D7A2E',letterSpacing:'0.15em',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px',marginBottom:'32px',padding:0 }}>
                <ArrowLeft size={12}/> BACK
              </button>
              <div style={{ fontSize:'11px',letterSpacing:'0.35em',fontFamily:'sans-serif',color:GOLD,marginBottom:'8px' }}>EMAIL LOGIN</div>
              <h2 style={{ fontSize:'32px',fontWeight:300,color:DARK,lineHeight:1.2,marginBottom:'32px' }}>Sign in with<br/><em style={{ fontStyle:'italic' }}>email</em></h2>

              <form onSubmit={handlePasswordLogin} style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
                <div>
                  <label style={{ fontSize:'10px',fontFamily:'sans-serif',letterSpacing:'0.2em',color:'#9D7A2E',display:'block',marginBottom:'8px' }}>EMAIL ADDRESS</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoFocus
                    style={{ width:'100%',border:'1px solid #E0D5B8',background:'white',outline:'none',padding:'14px 16px',fontSize:'16px',fontFamily:"'Cormorant Garamond',serif",color:DARK,boxSizing:'border-box' }}/>
                </div>
                <div>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'8px' }}>
                    <label style={{ fontSize:'10px',fontFamily:'sans-serif',letterSpacing:'0.2em',color:'#9D7A2E' }}>PASSWORD</label>
                    <Link href="/forgot-password" style={{ fontSize:'10px',fontFamily:'sans-serif',color:'#9D7A2E',textDecoration:'underline',textUnderlineOffset:'3px' }}>Forgot?</Link>
                  </div>
                  <div style={{ position:'relative' }}>
                    <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                      style={{ width:'100%',border:'1px solid #E0D5B8',background:'white',outline:'none',padding:'14px 44px 14px 16px',fontSize:'16px',fontFamily:"'Cormorant Garamond',serif",color:DARK,boxSizing:'border-box' }}/>
                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9D7A2E' }}>
                      {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:DARK,padding:'14px 20px',color:'#FAF7F0',border:'none',cursor:'pointer',opacity:loading?0.5:1,boxSizing:'border-box' }}>
                  <span style={{ fontSize:'12px',fontFamily:'sans-serif',letterSpacing:'0.15em' }}>{loading?'SIGNING IN…':'SIGN IN'}</span>
                  <ArrowRight size={14} color="#C9A84C"/>
                </button>
              </form>
            </div>
          )}

        </div>

        {mode === 'intro' && (
          <p style={{ position:'absolute',bottom:'28px',fontSize:'11px',fontFamily:'sans-serif',color:'#AAA' }}>
            <Link href="/" style={{ color:'#9D7A2E',textDecoration:'none' }}>← Return to store</Link>
          </p>
        )}
      </div>
    </div>
  )
}
