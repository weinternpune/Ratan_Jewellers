'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import toast from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Phone, 
  Package, 
  Award, 
  Share2, 
  LogOut, 
  Loader2
} from 'lucide-react'

interface UserDetails {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt?: string
  customer?: {
    referralCode: string
    pointsBalance?: number
  }
}

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [profileData, setProfileData] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please sign in to view your account.')
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Fetch full details
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return
      try {
        const data = await api.get<UserDetails>('/auth/me')
        setProfileData(data)
      } catch (err: unknown) {
        console.error('Failed to fetch profile', err)
        // If profile fetch fails due to token expiry/auth error, we might log out
        const status = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : null
        if (status === 401) {
          clearAuth()
          router.push('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [isAuthenticated, clearAuth, router])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (err) {
      console.error('Backend logout failed, clearing local session anyway', err)
    } finally {
      clearAuth()
      toast.success('Logged out successfully.')
      router.push('/login')
    }
  }

  if (!isAuthenticated) {
    return null // Handled by useEffect redirect
  }

  return (
    <main className="min-h-screen bg-[#FAF6EE] text-[#2C2C2C]">
      <Navbar />
      <CartDrawer />

      {/* Header Banner */}
      <section className="relative bg-[#181310] text-white py-16 border-b border-[#C9A84C]/25">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A84C_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D5A3] block mb-2">Patron Concierge</span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              My Profile
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="self-start md:self-auto inline-flex items-center gap-2 border border-[#C9A84C]/60 bg-white/5 hover:bg-[#340008] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E8D5A3] transition-all duration-300 disabled:opacity-50"
          >
            {logoutLoading ? <Loader2 className="animate-spin" size={15} /> : <LogOut size={15} />}
            Sign Out
          </button>
        </div>
      </section>

      {/* Main Profile Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#C9A84C]" size={40} />
            <p className="text-sm font-medium text-[#71531A] tracking-wide">Loading your concierge profile...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Personal Info Card */}
            <div className="lg:col-span-1 border border-[#E8D5A3] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(13,7,0,0.04)] relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9D7A2E] via-[#C9A84C] to-[#9D7A2E]" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#FAF6EE] border border-[#E8D5A3] flex items-center justify-center text-[#C9A84C]">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#340008]">{profileData?.name || user?.name}</h3>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest bg-[#FAF6EE] text-[#9D7A2E] border border-[#E8D5A3] px-2 py-0.5 rounded-sm">
                    {profileData?.role || user?.role || 'Patron'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100 text-sm">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[#C9A84C] mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Email Address</span>
                    <span className="font-medium text-gray-800 break-all">{profileData?.email || user?.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-[#C9A84C] mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Phone Number</span>
                    <span className="font-medium text-gray-800">{profileData?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award size={16} className="text-[#C9A84C] mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Member Since</span>
                    <span className="font-medium text-gray-800">
                      {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Generations'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Columns: Orders & Membership */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Ratan Privé Membership Panel */}
              <div className="border border-[#E8D5A3] bg-[#FFFBF4] p-6 sm:p-8 shadow-[0_4px_24px_rgba(13,7,0,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#340008] flex items-center gap-2">
                    <Award className="text-[#C9A84C]" size={24} />
                    Ratan Privé Rewards
                  </h3>
                  <p className="mt-2 text-sm text-[#71531A] leading-relaxed max-w-md">
                    Invite family and friends to Ratan Jewellers. Share your exclusive code and earn reward points on their first BIS-hallmarked gold or certified diamond purchase.
                  </p>
                </div>

                <div className="w-full sm:w-auto p-4 bg-white border border-[#E8D5A3]/80 rounded text-center shrink-0">
                  <span className="text-[9px] text-gray-400 uppercase tracking-widest block mb-1">Referral Code</span>
                  <span className="font-mono text-lg font-bold text-[#340008] block px-3 py-1 bg-[#FAF6EE] border border-dashed border-[#C9A84C]/50 mb-2">
                    {profileData?.customer?.referralCode || 'RATANPRO'}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#9D7A2E] font-semibold hover:text-[#340008] transition-colors cursor-pointer" onClick={() => {
                    navigator.clipboard.writeText(profileData?.customer?.referralCode || 'RATANPRO')
                    toast.success('Referral code copied to clipboard!')
                  }}>
                    <Share2 size={13} />
                    <span>Copy Link</span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="border border-[#E8D5A3] bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(13,7,0,0.04)]">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <h3 className="font-display text-2xl font-semibold text-[#340008] flex items-center gap-2">
                    <Package className="text-[#C9A84C]" size={24} />
                    Order History
                  </h3>
                  <span className="text-xs text-[#C9A84C] font-semibold hover:underline cursor-pointer">View All</span>
                </div>

                {/* Mock Orders List to simulate real e-commerce functionality */}
                <div className="space-y-4">
                  <div className="border border-gray-100 hover:border-[#E8D5A3] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FAF6EE] border border-[#E8D5A3]/50 flex items-center justify-center text-[#C9A84C]">
                        <Package size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Order #RJ-98314</span>
                        <span className="font-semibold text-sm text-[#340008] block mt-0.5">22kt Gold Bridal Bangle Set</span>
                        <span className="text-xs text-gray-500 block">Ordered on May 15, 2026</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Total Value</span>
                        <span className="font-bold text-sm text-gray-800">₹1,85,400</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-100 hover:border-[#E8D5A3] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#FAF6EE] border border-[#E8D5A3]/50 flex items-center justify-center text-[#C9A84C]">
                        <Package size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Order #RJ-97205</span>
                        <span className="font-semibold text-sm text-[#340008] block mt-0.5">Solitaire Diamond Ring - 18kt White Gold</span>
                        <span className="text-xs text-gray-500 block">Ordered on April 02, 2026</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Total Value</span>
                        <span className="font-bold text-sm text-gray-800">₹3,25,000</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-sm">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
