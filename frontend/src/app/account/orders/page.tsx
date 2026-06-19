'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { Package, ArrowLeft, Loader2, ChevronRight, Clock, CheckCircle2, Truck, XCircle, RefreshCw } from 'lucide-react'

interface OrderItem { productId: string; name: string; image: string; purity: string; price: number; quantity: number }
interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  grandTotal: number
  status: string
  paymentMethod: string
  address: { name: string; city: string; state: string }
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:    { label: 'Pending',    color: '#92400e', bg: '#fef3c7', border: '#fde68a', icon: <Clock size={11}/> },
  CONFIRMED:  { label: 'Confirmed',  color: '#1e40af', bg: '#dbeafe', border: '#93c5fd', icon: <CheckCircle2 size={11}/> },
  PROCESSING: { label: 'Processing', color: '#5b21b6', bg: '#ede9fe', border: '#c4b5fd', icon: <RefreshCw size={11}/> },
  SHIPPED:    { label: 'Shipped',    color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc', icon: <Truck size={11}/> },
  DELIVERED:  { label: 'Delivered',  color: '#065f46', bg: '#d1fae5', border: '#6ee7b7', icon: <CheckCircle2 size={11}/> },
  CANCELLED:  { label: 'Cancelled',  color: '#991b1b', bg: '#fee2e2', border: '#fca5a5', icon: <XCircle size={11}/> },
  REFUNDED:   { label: 'Refunded',   color: '#374151', bg: '#f3f4f6', border: '#d1d5db', icon: <RefreshCw size={11}/> },
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetchOrders(1)
  }, [isAuthenticated])

  const fetchOrders = async (p: number) => {
    setLoading(true)
    try {
      const res = await api.get<{ data: Order[]; pagination: { pages: number; page: number } }>(`/orders/my-orders?page=${p}&limit=8`)
      setOrders(res.data)
      setTotalPages(res.pagination.pages)
      setPage(res.pagination.page)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const statusCfg = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

  return (
    <main className="min-h-screen bg-[#FAF6EE] pt-16 md:pt-20 xl:pt-[124px]">
      <Navbar /><CartDrawer />

      {/* Header */}
      <section className="bg-[#181310] text-white py-14 border-b border-[#C9A84C]/25 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A84C_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <Link href="/account" className="inline-flex items-center gap-2 text-[#E8D5A3]/60 hover:text-[#E8D5A3] text-xs uppercase tracking-widest font-semibold mb-4 transition-colors">
            <ArrowLeft size={12} /> Back to Account
          </Link>
          <h1 className="font-display text-4xl font-semibold">Order History</h1>
          <p className="text-[#E8D5A3]/60 text-sm mt-1">All your purchases with Ratan Jewellers</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="animate-spin text-[#C9A84C]" size={36} />
            <p className="text-sm text-[#71531A]">Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 border border-[#E8D5A3] flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-[#C9A84C]" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-[#340008] mb-2">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-6">Your order history will appear here once you make a purchase.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-[#340008] text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-[#1a0004] transition-colors">
              Start Shopping <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cfg = statusCfg(order.status)
              return (
                <div key={order._id} className="bg-white border border-[#E8D5A3] hover:border-[#C9A84C]/50 transition-all duration-200 group">
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Order Number</p>
                        <p className="font-mono font-bold text-[#340008] text-sm">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Date</p>
                        <p className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Payment</p>
                        <p className="text-sm font-medium text-gray-700 capitalize">{order.paymentMethod?.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                        {cfg.icon} {cfg.label}
                      </span>
                      <Link href={`/account/orders/${order._id}`} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#9D7A2E] hover:text-[#340008] transition-colors">
                        Details <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4">
                    <div className="flex flex-wrap gap-3 mb-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.image && (
                            <div className="w-10 h-10 bg-[#FAF6EE] border border-[#E8D5A3]/50 overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-800 max-w-[140px] truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400">Qty: {item.quantity} · ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center justify-center w-10 h-10 bg-[#FAF6EE] border border-[#E8D5A3] text-[10px] font-bold text-[#9D7A2E]">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <p className="text-xs text-gray-400">{order.address.city}, {order.address.state}</p>
                      <p className="font-bold text-[#340008]">₹{order.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchOrders(p)} className={`w-9 h-9 text-xs font-bold border transition-colors ${p === page ? 'bg-[#340008] text-white border-[#340008]' : 'bg-white text-[#340008] border-[#E8D5A3] hover:border-[#C9A84C]'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </main>
  )
}