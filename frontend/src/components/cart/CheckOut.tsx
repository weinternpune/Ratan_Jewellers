'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore, useAuthStore } from '@/store'
import { api } from '@/lib/api'
import { ShieldCheck, ChevronDown, ChevronUp, Lock, Loader2, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { id: 'upi',        label: 'UPI',                 desc: 'Pay using any UPI app' },
  { id: 'card',       label: 'Credit or Debit Card', desc: 'Visa, Mastercard, RuPay & more' },
  { id: 'netbanking', label: 'Net Banking',           desc: 'All major banks supported' },
  { id: 'cod',        label: 'Cash on Delivery',      desc: 'Pay when you receive' },
]

interface PlacedOrder {
  orderNumber: string
  grandTotal: number
  status: string
}

export default function CheckOut() {
  const [mounted, setMounted]               = useState(false)
  const { items, totalPrice, clearCart }    = useCartStore()
  const { isAuthenticated }                 = useAuthStore()
  const router                              = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const subtotal     = mounted ? totalPrice() : 0
  const gst          = Math.round(subtotal * 0.03)
  const deliveryCharge = subtotal > 5000 ? 0 : 199
  const grandTotal   = subtotal + gst + deliveryCharge

  const [address, setAddress]             = useState({ name:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'' })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [upiId, setUpiId]                 = useState('')
  const [coupon, setCoupon]               = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [showAddress, setShowAddress]     = useState(true)
  const [placing, setPlacing]             = useState(false)
  const [placedOrder, setPlacedOrder]     = useState<PlacedOrder | null>(null)

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to place an order'); router.push('/login'); return }
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill in all required address fields.'); return
    }
    if (!items.length) { toast.error('Your cart is empty'); return }

    setPlacing(true)
    try {
      const res = await api.post<PlacedOrder>('/orders', {
        items: items.map(i => ({
          productId: i.productId, name: i.name, sku: i.sku,
          image: i.image, purity: i.purity, weight: i.weight,
          price: i.price, quantity: i.quantity,
        })),
        address,
        paymentMethod,
        subtotal,
        gst,
        deliveryCharge,
        discount: 0,
        grandTotal,
        couponCode: couponApplied ? coupon : undefined,
      })
      clearCart()
      setPlacedOrder(res.data)
      toast.success(`Order ${res.data.orderNumber} placed successfully!`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order. Please try again.')
    } finally { setPlacing(false) }
  }

  // ── Order success screen ───────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] flex items-center justify-center px-4">
        <div className="bg-white border border-[#E8D5A3] p-10 max-w-md w-full text-center shadow-sm">
          {/* Success icon */}
          <div className="w-16 h-16 border border-[#C9A84C] flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={30} className="text-[#C9A84C]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A84C] mb-2">Order Confirmed</p>
          <h2 className="font-display text-3xl font-semibold text-[#340008] mb-1">Thank You!</h2>
          <p className="text-sm text-gray-500 mb-4">Your order has been placed successfully.</p>

          {/* Order number */}
          <div className="bg-[#FAF6EE] border border-[#E8D5A3] px-6 py-4 mb-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Order Number</p>
            <p className="font-mono text-xl font-bold text-[#340008]">{placedOrder.orderNumber}</p>
          </div>

          <p className="text-lg font-bold text-[#9D7A2E] mb-6">
            ₹{placedOrder.grandTotal?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} {paymentMethod === 'cod' ? '(Pay on Delivery)' : 'paid'}
          </p>

          <p className="text-xs text-gray-400 mb-6">
            Delivery expected in 5–7 business days. Track your order in your account.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/account" className="w-full flex items-center justify-center gap-2 bg-[#340008] text-white py-3 text-xs font-semibold uppercase tracking-widest hover:bg-[#1a0004] transition-colors">
              <Package size={14} /> View My Orders
            </Link>
            <Link href="/products" className="w-full flex items-center justify-center border border-[#E8D5A3] text-[#340008] py-3 text-xs font-semibold uppercase tracking-widest hover:bg-[#FAF6EE] transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Header */}
      <header className="bg-[#131921] px-6 py-4 flex items-center justify-center relative">
        <Link href="/" className="absolute left-6 text-white font-bold text-lg tracking-tight">
          Ratan <span className="text-amber-400">Jewellers</span>
        </Link>
        <div className="flex items-center gap-2 text-white">
          <Lock size={15} className="text-amber-400" />
          <span className="text-base font-semibold tracking-widest uppercase text-white/90">Secure Checkout</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">

          {/* Delivery Address */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button type="button" onClick={() => setShowAddress(p => !p)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Step 1</p>
                <p className="font-semibold text-gray-900">Delivery Address</p>
              </div>
              {showAddress ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {showAddress && (
              <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key:'name',    label:'Full Name *',    placeholder:'Recipient name',      col:1 },
                  { key:'phone',   label:'Phone Number *', placeholder:'+91 98765 43210',     col:1 },
                  { key:'line1',   label:'Address Line 1 *', placeholder:'House/Flat, Street', col:2 },
                  { key:'line2',   label:'Address Line 2',  placeholder:'Landmark (optional)', col:2 },
                  { key:'city',    label:'City *',          placeholder:'City',               col:1 },
                  { key:'state',   label:'State *',         placeholder:'State',              col:1 },
                  { key:'pincode', label:'Pincode *',       placeholder:'6-digit pincode',    col:1 },
                ].map(f => (
                  <div key={f.key} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                    <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                    <input
                      value={(address as any)[f.key]}
                      onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Step 2</p>
            <p className="font-semibold text-gray-900 mb-4">Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-all ${paymentMethod === m.id ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {paymentMethod === 'upi' && (
              <div className="mt-3">
                <label className="text-xs text-gray-500 block mb-1">UPI ID</label>
                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400" />
              </div>
            )}
          </div>

          {/* Coupon */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <p className="font-semibold text-gray-900 mb-3 text-sm">Coupon Code</p>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Enter coupon code" disabled={couponApplied} className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400 disabled:bg-gray-50" />
              <button onClick={() => { if (coupon.trim()) { setCouponApplied(true); toast.success('Coupon applied!') } }} disabled={couponApplied || !coupon.trim()} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded disabled:opacity-50 transition">
                {couponApplied ? 'Applied ✓' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Order Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {mounted && items.map(item => (
                <div key={item.productId} className="flex gap-3">
                  {item.image && (
                    <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.purity} · Qty: {item.quantity}</p>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-3 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (3%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
              </div>
              {couponApplied && <div className="flex justify-between text-green-600"><span>Coupon ({coupon})</span><span>-₹0</span></div>}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !mounted || items.length === 0}
              className="w-full mt-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded flex items-center justify-center gap-2 transition text-sm"
            >
              {placing ? <><Loader2 size={16} className="animate-spin" /> Placing Order…</> : `Place Order · ₹${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-gray-400">
              <Lock size={10} /><span>256-bit SSL Secured Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}