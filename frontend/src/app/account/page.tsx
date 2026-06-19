
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Package, Award, Share2, LogOut, Loader2, ChevronRight, Clock, CheckCircle2, Truck, XCircle, RefreshCw } from 'lucide-react'

interface UserProfile {
  id: string; name: string; email?: string; phone?: string; role: string; createdAt?: string
  customer?: { referralCode: string }
}
interface OrderItem { name: string; image?: string; price: number; quantity: number }
interface Order {
  _id: string; orderNumber: string; items: OrderItem[]
  grandTotal: number; status: string; paymentMethod: string; createdAt: string
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:    { label:'Pending',    color:'#92400e', bg:'#fef3c7', border:'#fde68a', icon:<Clock size={10}/> },
  CONFIRMED:  { label:'Confirmed',  color:'#1e40af', bg:'#dbeafe', border:'#93c5fd', icon:<CheckCircle2 size={10}/> },
  PROCESSING: { label:'Processing', color:'#5b21b6', bg:'#ede9fe', border:'#c4b5fd', icon:<RefreshCw size={10}/> },
  SHIPPED:    { label:'Shipped',    color:'#0369a1', bg:'#e0f2fe', border:'#7dd3fc', icon:<Truck size={10}/> },
  DELIVERED:  { label:'Delivered',  color:'#065f46', bg:'#d1fae5', border:'#6ee7b7', icon:<CheckCircle2 size={10}/> },
  CANCELLED:  { label:'Cancelled',  color:'#991b1b', bg:'#fee2e2', border:'#fca5a5', icon:<XCircle size={10}/> },
}

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth, hasHydrated } = useAuthStore()
  const [profile, setProfile]           = useState<UserProfile | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading]           = useState(true)
  const [signingOut, setSigningOut]     = useState(false)

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage before doing anything
    if (!hasHydrated) return

    // Redirect admin to admin dashboard
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN' || user.role === 'admin') {
        router.replace('/admin/dashboard')
        return
      }
    }

    // Fallback: check admin localStorage token
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('adminAccessToken') ||
                         localStorage.getItem('adminToken') ||
                         localStorage.getItem('admin_token')
      if (adminToken) {
        router.replace('/admin/dashboard')
        return
      }
    }

    // Not logged in → send to login
    if (!isAuthenticated) {
      toast.error('Please sign in first.')
      router.push('/login')
      return
    }

    // Logged in as customer → load profile and orders
    Promise.all([
      api.get<UserProfile>('/auth/me'),
      api.get<{ data: Order[] }>('/orders/my-orders?page=1&limit=3').catch(() => ({ data: [] as Order[] })),
    ]).then(([p, o]) => {
      if (p.role === 'ADMIN' || p.role === 'admin') {
        router.replace('/admin/dashboard')
        return
      }
      setProfile(p)
      setRecentOrders((o as any).data ?? [])
    }).catch((err) => {
      if (err?.response?.status === 401) { clearAuth(); router.push('/login') }
    }).finally(() => setLoading(false))

  }, [isAuthenticated, user, hasHydrated])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      const rt = localStorage.getItem('refreshToken')
      if (rt) await api.post('/auth/logout', { refreshToken: rt })
    } catch {}
    clearAuth()
    toast.success('Signed out.')
    router.push('/')
  }

  // Show spinner while Zustand is rehydrating — prevents instant logout on refresh
  if (!hasHydrated) return (
    <main className="min-h-screen bg-[#FAF6EE] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#C9A84C]" size={36}/>
    </main>
  )

  if (!isAuthenticated) return null

  const cfg = (s: string) => STATUS[s] ?? STATUS.CONFIRMED

  return (
    <main className="min-h-screen bg-[#FAF6EE] pt-16 md:pt-20 xl:pt-[124px]">
      <Navbar /><CartDrawer />

      {/* Header */}
      <section className="relative bg-[#181310] text-white py-16 border-b border-[#C9A84C]/25">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A84C_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10 pointer-events-none"/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D5A3] block mb-2">Patron Concierge</span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold">My Account</h1>
          </div>
          <button onClick={handleSignOut} disabled={signingOut} className="self-start md:self-auto inline-flex items-center gap-2 border border-[#C9A84C]/60 bg-white/5 hover:bg-[#340008] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E8D5A3] transition-all disabled:opacity-50">
            {signingOut ? <Loader2 className="animate-spin" size={14}/> : <LogOut size={14}/>} Sign Out
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#C9A84C]" size={36}/>
            <p className="text-sm text-[#71531A]">Loading your profile…</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* Profile card */}
            <div className="border border-[#E8D5A3] bg-white p-6 sm:p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9D7A2E] via-[#C9A84C] to-[#9D7A2E]"/>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#FAF6EE] border border-[#E8D5A3] flex items-center justify-center text-[#C9A84C]">
                  <User size={28}/>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#340008]">{profile?.name ?? user?.name}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-[#FAF6EE] text-[#9D7A2E] border border-[#E8D5A3] px-2 py-0.5 mt-1 inline-block">
                    {profile?.role ?? 'CUSTOMER'}
                  </span>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-100 text-sm">
                <div className="flex items-start gap-3">
                  <Mail size={15} className="text-[#C9A84C] mt-0.5 shrink-0"/>
                  <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p><p className="font-medium text-gray-800 break-all">{profile?.email ?? '—'}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={15} className="text-[#C9A84C] mt-0.5 shrink-0"/>
                  <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone</p><p className="font-medium text-gray-800">{profile?.phone ?? '—'}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Award size={15} className="text-[#C9A84C] mt-0.5 shrink-0"/>
                  <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Member Since</p>
                    <p className="font-medium text-gray-800">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' }) : '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Referral */}
              <div className="border border-[#E8D5A3] bg-[#FFFBF4] p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#340008] flex items-center gap-2"><Award className="text-[#C9A84C]" size={22}/> Ratan Privé Rewards</h3>
                  <p className="mt-2 text-sm text-[#71531A] max-w-md">Share your referral code and earn reward points when friends make their first purchase.</p>
                </div>
                <div className="p-4 bg-white border border-[#E8D5A3] text-center shrink-0">
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Referral Code</span>
                  <span className="font-mono text-lg font-bold text-[#340008] block px-3 py-1 bg-[#FAF6EE] border border-dashed border-[#C9A84C]/50 mb-2">
                    {profile?.customer?.referralCode ?? 'RATANPRO'}
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText(profile?.customer?.referralCode ?? ''); toast.success('Copied!') }} className="flex items-center justify-center gap-1.5 text-xs text-[#9D7A2E] font-semibold mx-auto hover:text-[#340008]">
                    <Share2 size={11}/> Copy
                  </button>
                </div>
              </div>

              {/* Orders */}
              <div className="border border-[#E8D5A3] bg-white p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                  <h3 className="font-display text-2xl font-semibold text-[#340008] flex items-center gap-2"><Package className="text-[#C9A84C]" size={22}/> Order History</h3>
                  <Link href="/account/orders" className="inline-flex items-center gap-1 text-xs text-[#C9A84C] font-semibold hover:text-[#340008] transition-colors uppercase tracking-wider">
                    View All <ChevronRight size={13}/>
                  </Link>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <Package size={20} className="text-[#C9A84C] mx-auto mb-3"/>
                    <p className="text-sm text-gray-500 mb-3">No orders yet.</p>
                    <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-[#9D7A2E] hover:text-[#340008]">Browse Products →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map(order => {
                      const s = cfg(order.status)
                      return (
                        <Link key={order._id} href={`/account/orders/${order._id}`} className="block border border-gray-100 hover:border-[#E8D5A3] p-4 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {order.items[0]?.image
                                ? <div className="w-12 h-12 bg-[#FAF6EE] border border-[#E8D5A3]/50 overflow-hidden shrink-0"><img src={order.items[0].image} alt={order.items[0].name} className="w-full h-full object-cover"/></div>
                                : <div className="w-12 h-12 bg-[#FAF6EE] border border-[#E8D5A3]/50 flex items-center justify-center shrink-0"><Package size={18} className="text-[#C9A84C]"/></div>
                              }
                              <div>
                                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">#{order.orderNumber}</span>
                                <span className="font-semibold text-sm text-[#340008] block mt-0.5">{order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</span>
                                <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-sm text-gray-800">₹{order.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              <span style={{ color:s.color, background:s.bg, border:`1px solid ${s.border}` }} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">{s.icon} {s.label}</span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </section>
      <Footer/>
    </main>
  )
}


