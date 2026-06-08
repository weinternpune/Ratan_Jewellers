'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore as useWebAuthStore } from '@/store'
import { useAuthStore as useAdminAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { useCustomJewelleryStore } from '@/store/customJewelleryStore'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import toast from 'react-hot-toast'
import { User, Mail, LogOut, ShoppingCart, Receipt, Crown, Gem } from 'lucide-react'
import { useRef } from 'react'
import Link from 'next/link'

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useWebAuthStore()
  const loggingOut = useRef(false)
  const { currentUser, isLoggedIn: isAdminLoggedIn, getEffectiveRole } = useAdminAuthStore()
  const { orders, invoices, customers } = useAdminStore()
  const { requests: cjRequests } = useCustomJewelleryStore()

  useEffect(() => {
    if (isAdminLoggedIn && currentUser) {
      const role = getEffectiveRole()
      const dest = ['customer','sales_staff','inventory_manager'].includes(role) ? '/admin/my-dashboard' : '/admin/dashboard'
      router.replace(dest)
      return
    }
    if (!isAuthenticated && !loggingOut.current) {
      toast.error('Please sign in to view your account.')
      router.push('/login')
    }
  }, [isAuthenticated, isAdminLoggedIn, currentUser])

  if (isAdminLoggedIn && currentUser) return <div className="flex items-center justify-center h-screen bg-[#FAF6EE]"><div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"/></div>
  if (!isAuthenticated || !user) return <div className="flex items-center justify-center h-screen bg-[#FAF6EE]"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/></div>

  const myOrders   = orders.filter(o => o.email === user.email)
  const myInvoices = invoices.filter(i => i.email === user.email)
  const myCJ       = cjRequests.filter(r => r.email === user.email)
  const meCRM      = customers.find(c => c.email === user.email)
  const initials   = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) || 'U'
  const tierColor  = meCRM?.tier === 'platinum' ? 'bg-purple-100 text-purple-700' : meCRM?.tier === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C2C2C]">
      <Navbar /><CartDrawer />
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 space-y-6">

        <div className="bg-gradient-to-r from-[#0D0700] to-[#2b1a00] rounded-2xl p-6 text-white flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/20 border-2 border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] font-bold text-2xl flex-shrink-0">{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold truncate">{user.name}</div>
            <div className="text-white/60 text-sm truncate">{user.email}</div>
            {meCRM && <span className={"mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full " + tierColor}>{meCRM.tier.toUpperCase()} Member</span>}
          </div>
          <button onClick={() => { clearAuth(); toast.success('Signed out'); router.push('/') }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0">
            <LogOut size={14}/>Sign Out
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {label:'My Orders',value:myOrders.length,icon:ShoppingCart,bg:'bg-blue-50',fg:'text-blue-600'},
            {label:'Invoices',value:myInvoices.length,icon:Receipt,bg:'bg-amber-50',fg:'text-amber-600'},
            {label:'Total Spent',value:meCRM?'₹'+(meCRM.totalSpend/100000).toFixed(1)+'L':'₹0',icon:Crown,bg:'bg-green-50',fg:'text-green-600'},
            {label:'Custom Requests',value:myCJ.length,icon:Gem,bg:'bg-purple-50',fg:'text-purple-600'},
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={"w-8 h-8 rounded-lg flex items-center justify-center mb-2 "+s.bg}><s.icon size={15} className={s.fg}/></div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50"><h3 className="font-semibold text-gray-800">My Orders</h3></div>
          {myOrders.length===0 ? <div className="px-5 py-10 text-center text-gray-400 text-sm">No orders yet. <Link href="/products" className="text-amber-600 hover:underline">Browse collections</Link></div>
          : <div className="divide-y divide-gray-50">{myOrders.map(o=>(
            <div key={o.id} className="flex items-center px-5 py-3 gap-4 hover:bg-gray-50/50">
              <span className="font-mono text-sm font-semibold text-[#C9A84C] w-20">{o.id}</span>
              <div className="flex-1 min-w-0"><div className="text-sm text-gray-700 truncate">{o.items.map(i=>i.name).join(', ')}</div><div className="text-xs text-gray-400">{o.date}</div></div>
              <div className="text-right flex-shrink-0">
                <div className="font-semibold text-gray-900 text-sm">₹{o.total.toLocaleString('en-IN')}</div>
                <span className={"text-xs px-2 py-0.5 rounded-full font-medium "+(o.status==='delivered'?'bg-green-50 text-green-600':'bg-amber-50 text-amber-600')}>{o.status}</span>
              </div>
            </div>
          ))}</div>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">My Custom Jewellery Requests</h3>
            <Link href="/custom-jewellery" className="text-xs text-amber-600 hover:underline">Submit New</Link>
          </div>
          {myCJ.length===0 ? <div className="px-5 py-10 text-center text-gray-400 text-sm">No requests yet. <Link href="/custom-jewellery" className="text-amber-600 hover:underline">Submit a custom design</Link></div>
          : <div className="divide-y divide-gray-50">{myCJ.map(r=>(
            <div key={r.id} className="px-5 py-4 hover:bg-gray-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-[#C9A84C]">{r.id}</span>
                <span className={"text-xs px-2 py-0.5 rounded-full font-semibold "+(r.status==='replied'?'bg-purple-50 text-purple-600':r.status==='completed'?'bg-green-50 text-green-600':'bg-blue-50 text-blue-600')}>{r.status}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{r.description}</p>
              <p className="text-xs text-gray-400 mt-1">{r.submittedAt}</p>
              {r.replies.length>0&&<div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-3"><div className="text-xs font-semibold text-amber-700 mb-1">Reply from {r.replies[r.replies.length-1].from}:</div><p className="text-xs text-gray-700">{r.replies[r.replies.length-1].message}</p></div>}
            </div>
          ))}</div>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-3">Account Details</h3>
          {[{icon:User,label:'Name',value:user.name},{icon:Mail,label:'Email',value:user.email}].map(d=>(
            <div key={d.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <d.icon size={15} className="text-gray-400"/>
              <span className="text-xs text-gray-500 w-16">{d.label}</span>
              <span className="text-sm text-gray-800 font-medium">{d.value}</span>
            </div>
          ))}
        </div>

      </div>
      <Footer/>
    </div>
  )
}
