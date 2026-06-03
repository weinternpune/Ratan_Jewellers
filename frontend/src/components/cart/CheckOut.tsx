'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store'
import { ShieldCheck, ChevronDown, ChevronUp, Lock } from 'lucide-react'


const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', desc: 'Pay using any UPI app' },
  { id: 'card', label: 'Credit or Debit Card', desc: 'Visa, Mastercard, RuPay & more' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major banks supported' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
]

export default function CheckOut() {
  const [mounted, setMounted] = useState(false)
  const { items, totalPrice, clearCart } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const total = mounted ? totalPrice() : 0
  const gst = total * 0.03
  const delivery = total > 5000 ? 0 : 199
  const grandTotal = total + gst + delivery

  const [address, setAddress] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [showAddress, setShowAddress] = useState(true)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const handlePlaceOrder = () => {
    if (!address.name || !address.phone || !address.line1 || !address.pincode) {
      alert('Please fill in all required address fields.')
      return
    }
    setOrderPlaced(true)
    clearCart()
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg border border-gray-200 p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-1">Thank you for shopping with Ratan Jewellers.</p>
          <p className="text-gray-500 text-sm mb-6">Your order will be delivered in 5–7 business days.</p>
          <p className="text-lg font-bold text-amber-700 mb-6">
            ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} paid
          </p>
          <Link
            href="/products"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-6 py-3 rounded transition"
          >
            Continue Shopping
          </Link>
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
    <span className="text-base font-semibold tracking-widest uppercase text-white/90">
      Secure Checkout
    </span>
  </div>
</header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-4">

          {/* Delivery Address */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAddress(p => !p)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Step 1</p>
                <h2 className="text-base font-semibold text-gray-900">Delivery Address</h2>
                {!showAddress && address.name && (
                  <p className="text-sm text-gray-500 mt-0.5">{address.name}, {address.city} — {address.pincode}</p>
                )}
              </div>
              {showAddress ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {showAddress && (
              <div className="px-5 pb-5 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={address.name}
                      onChange={e => setAddress(p => ({ ...p, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      value={address.line1}
                      onChange={e => setAddress(p => ({ ...p, line1: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="House/Flat no., Street, Area"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={address.line2}
                      onChange={e => setAddress(p => ({ ...p, line2: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Landmark (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={e => setAddress(p => ({ ...p, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
                    <select
                      value={address.state}
                      onChange={e => setAddress(p => ({ ...p, state: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                    >
                      <option value="">Select State</option>
                      {['Odisha','Maharashtra','Delhi','Karnataka','Tamil Nadu','Gujarat','Rajasthan','West Bengal','Uttar Pradesh','Telangana'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddress(false)}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2 rounded transition"
                >
                  Use this address
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Step 2</p>
              <h2 className="text-base font-semibold text-gray-900">Payment Method</h2>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Coupon */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Apply Coupon / Gift Card</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="Enter code"
                  />
                  <button
                    type="button"
                    onClick={() => coupon && setCouponApplied(true)}
                    className="border border-gray-400 text-gray-700 text-sm px-4 py-2 rounded hover:bg-gray-50 transition"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-green-600 mt-1">✓ Coupon applied successfully!</p>
                )}
              </div>

              <p className="text-sm font-semibold text-gray-800 mb-2">Another payment method</p>

              {PAYMENT_METHODS.map(method => (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${
                    paymentMethod === method.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="mt-0.5 accent-amber-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{method.label}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                    {method.id === 'upi' && paymentMethod === 'upi' && (
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="mt-2 border border-gray-300 rounded px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:border-amber-500"
                        placeholder="yourname@upi"
                      />
                    )}
                    {method.id === 'card' && paymentMethod === 'card' && (
                      <div className="flex gap-2 mt-2">
                        {['VISA','MC','AMEX','RuPay'].map(b => (
                          <span key={b} className="border border-gray-200 rounded px-2 py-0.5 text-[10px] font-bold text-gray-600 bg-white">{b}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Step 3</p>
              <h2 className="text-base font-semibold text-gray-900">Review Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  Your cart is empty.{' '}
                  <Link href="/products" className="text-amber-600 hover:underline">Shop now</Link>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4 px-5 py-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.purity} · {item.weight}g · Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-amber-700 mt-1">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-4">
            <div className="px-5 py-4 border-b border-gray-100">
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold text-sm py-3 rounded transition"
              >
                Use this payment method
              </button>
            </div>

            <div className="px-5 py-4 space-y-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items ({items.length}):</span>
                <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery:</span>
                <span className={delivery === 0 ? 'text-green-600 font-medium' : ''}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (3%):</span>
                <span>₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon discount:</span>
                  <span>− ₹500</span>
                </div>
              )}
              {delivery === 0 && (
                <p className="text-xs text-green-600 font-medium">✓ FREE Delivery</p>
              )}
            </div>

            <div className="px-5 py-4">
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Order Total:</span>
                <span>₹{(grandTotal - (couponApplied ? 500 : 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Inclusive of all taxes</p>

              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm py-3 rounded transition flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                Place Order
              </button>

              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <ShieldCheck size={14} className="text-green-500 flex-shrink-0" />
                <span>Safe & Secure payments. Easy returns. 100% authentic products.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}