'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Package, Search, MapPin, CheckCircle, Truck, Clock, Home } from 'lucide-react'

// Mock order data - In production, this would come from your backend
const mockOrders: { [key: string]: any } = {
  'ORD123456': {
    orderNumber: 'ORD123456',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-22',
    status: 'in_transit',
    currentLocation: 'Delhi Distribution Center',
    items: [
      { name: 'Gold Necklace with Diamond Pendant', quantity: 1, price: 125000 },
      { name: 'Gold Earrings', quantity: 1, price: 45000 }
    ],
    total: 170000,
    trackingHistory: [
      { status: 'Order Placed', date: '2024-01-15 10:30 AM', location: 'Online', completed: true },
      { status: 'Payment Confirmed', date: '2024-01-15 10:35 AM', location: 'Online', completed: true },
      { status: 'Processing', date: '2024-01-16 09:00 AM', location: 'New Delhi Showroom', completed: true },
      { status: 'Quality Check', date: '2024-01-17 02:00 PM', location: 'New Delhi Showroom', completed: true },
      { status: 'Shipped', date: '2024-01-18 11:00 AM', location: 'Delhi Hub', completed: true },
      { status: 'In Transit', date: '2024-01-19 08:30 AM', location: 'Delhi Distribution Center', completed: true },
      { status: 'Out for Delivery', date: '', location: '', completed: false },
      { status: 'Delivered', date: '', location: '', completed: false }
    ],
    shippingAddress: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      address: '123, Green Park, New Delhi - 110016'
    }
  },
  'ORD789012': {
    orderNumber: 'ORD789012',
    orderDate: '2024-01-20',
    estimatedDelivery: '2024-01-27',
    status: 'processing',
    currentLocation: 'South Delhi Showroom',
    items: [
      { name: 'Diamond Ring', quantity: 1, price: 85000 }
    ],
    total: 85000,
    trackingHistory: [
      { status: 'Order Placed', date: '2024-01-20 03:45 PM', location: 'Online', completed: true },
      { status: 'Payment Confirmed', date: '2024-01-20 03:50 PM', location: 'Online', completed: true },
      { status: 'Processing', date: '2024-01-21 10:00 AM', location: 'South Delhi Showroom', completed: true },
      { status: 'Quality Check', date: '', location: '', completed: false },
      { status: 'Shipped', date: '', location: '', completed: false },
      { status: 'In Transit', date: '', location: '', completed: false },
      { status: 'Out for Delivery', date: '', location: '', completed: false },
      { status: 'Delivered', date: '', location: '', completed: false }
    ],
    shippingAddress: {
      name: 'Priya Sharma',
      phone: '+91 87654 32109',
      address: '456, Saket, New Delhi - 110017'
    }
  }
}

const statusIcons: { [key: string]: any } = {
  'Order Placed': Package,
  'Payment Confirmed': CheckCircle,
  'Processing': Clock,
  'Quality Check': CheckCircle,
  'Shipped': Truck,
  'In Transit': Truck,
  'Out for Delivery': Truck,
  'Delivered': Home
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [orderData, setOrderData] = useState<any>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const order = mockOrders[orderNumber.toUpperCase()]
      
      if (order) {
        setOrderData(order)
        setError('')
      } else {
        setError('Order not found. Please check your order number and try again.')
        setOrderData(null)
      }
      setIsLoading(false)
    }, 800)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600 bg-blue-50'
      case 'in_transit':
        return 'text-purple-600 bg-purple-50'
      case 'out_for_delivery':
        return 'text-orange-600 bg-orange-50'
      case 'delivered':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Processing'
      case 'in_transit':
        return 'In Transit'
      case 'out_for_delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      default:
        return 'Unknown'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
     <section className="relative min-h-[340px] lg:min-h-[380px] xl:min-h-[420px] pt-24 lg:pt-28 bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#2D1810] overflow-hidden">
  {/* Background Glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.12),transparent_70%)]" />

  <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-center">
    <div className="text-center py-14 lg:py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-[#C9A84C]/10 rounded-full mb-6">
        <Package className="w-8 h-8 lg:w-10 lg:h-10 text-[#C9A84C]" />
      </div>

      <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl leading-tight text-[#C9A84C] mb-6">
        Track Your Order
      </h1>

      <p className="text-lg lg:text-xl leading-relaxed text-[#E8D5A3] max-w-3xl mx-auto">
        Enter your order number to track your jewellery delivery in
        real-time.
      </p>
    </div>
  </div>
</section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Track Order Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number *
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., ORD123456"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#C9A84C] focus:outline-none transition-colors"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  You can find this in your order confirmation email
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#C9A84C] focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1C1917] text-[#C9A84C] font-semibold hover:bg-[#292524] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search size={20} />
                {isLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>

            {/* Demo Orders Help */}
            <div className="mt-6 p-4 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Demo Order Numbers:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code className="bg-white px-2 py-1 rounded">ORD123456</code> - In Transit</li>
                <li>• <code className="bg-white px-2 py-1 rounded">ORD789012</code> - Processing</li>
              </ul>
            </div>
          </div>

          {/* Order Details */}
          {orderData && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-2xl text-gray-900 mb-1">
                      Order {orderData.orderNumber}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(orderData.orderDate).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(orderData.status)}`}>
                      {getStatusText(orderData.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Current Location</h4>
                      <p className="text-gray-600">{orderData.currentLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock size={20} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Estimated Delivery</h4>
                      <p className="text-gray-600">
                        {new Date(orderData.estimatedDelivery).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
                  <div className="text-gray-600">
                    <p className="font-medium">{orderData.shippingAddress.name}</p>
                    <p>{orderData.shippingAddress.address}</p>
                    <p className="mt-1">{orderData.shippingAddress.phone}</p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="font-serif text-xl text-gray-900 mb-6">Tracking History</h3>
                
                <div className="space-y-6">
                  {orderData.trackingHistory.map((item: any, index: number) => {
                    const Icon = statusIcons[item.status] || Package
                    const isLast = index === orderData.trackingHistory.length - 1
                    
                    return (
                      <div key={index} className="relative flex items-start gap-4">
                        {/* Timeline Line */}
                        {!isLast && (
                          <div className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                            item.completed ? 'bg-[#C9A84C]' : 'bg-gray-200'
                          }`} style={{ height: 'calc(100% + 24px)' }} />
                        )}
                        
                        {/* Icon */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.completed 
                            ? 'bg-[#C9A84C] text-white' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon size={20} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <h4 className={`font-medium mb-1 ${
                            item.completed ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {item.status}
                          </h4>
                          {item.completed && (
                            <>
                              <p className="text-sm text-gray-600">{item.date}</p>
                              <p className="text-sm text-gray-500">{item.location}</p>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="font-serif text-xl text-gray-900 mb-6">Order Items</h3>
                
                <div className="space-y-4 mb-6">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg text-gray-900">Total Amount</span>
                    <span className="font-serif text-2xl text-[#C9A84C]">
                      ₹{orderData.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-[#C9A84C]/5 rounded-lg p-6 border border-[#C9A84C]/20">
                <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about your order, please contact our customer support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+911123456789"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1917] text-[#C9A84C] font-medium hover:bg-[#292524] transition-colors"
                  >
                    <Package size={18} />
                    Call Support
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-[#1C1917] text-[#1C1917] font-medium hover:bg-[#1C1917] hover:text-[#C9A84C] transition-colors"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
