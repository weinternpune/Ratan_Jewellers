'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Phone, Mail, Clock, Navigation, Search } from 'lucide-react'

const stores = [
  {
    id: 1,
    name: 'Ratan Jewellers - Arjuni',
    address: 'Arjuni, Maharashtra 441911',
    phone: '+91 75075 10948',
    email: 'arjuni@ratanjewellers.com',
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 7:00 PM',
    lat: 21.1933,
    lng: 79.3467,
    image: '/stores/store-1.jpg',
    featured: true,
  },
  {
    id: 2,
    name: 'Ratan Jewellers - Paraswada',
    address: 'Th, At+Post, Paraswada, Tiroda, Maharashtra 441911',
    phone: '+91 75075 10948',
    email: 'paraswada@ratanjewellers.com',
    hours: 'Mon-Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 7:00 PM',
    lat: 21.2200,
    lng: 79.3500,
    image: '/stores/store-2.jpg',
    featured: false,
  },
]

export default function StoreLocatorPage() {
  const [selectedStore, setSelectedStore] = useState(stores[0])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[340px] lg:min-h-[380px] xl:min-h-[420px] pt-24 lg:pt-28 bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#2D1810] overflow-hidden">
  {/* Background Glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.12),transparent_70%)]" />

  <div className="relative max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-center">
    <div className="text-center py-14 lg:py-16">
      <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl leading-tight text-[#C9A84C] mb-6">
        Visit Our Showrooms
      </h1>

      <p className="text-lg lg:text-xl leading-relaxed text-[#E8D5A3] max-w-3xl mx-auto">
        Experience the finest collection of jewellery at our exclusive
        showrooms across the country.
      </p>
    </div>
  </div>
</section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city or location..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#C9A84C] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Store List */}
            <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
              {filteredStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`w-full text-left p-6 rounded-lg border-2 transition-all duration-300 ${
                    selectedStore.id === store.id
                      ? 'border-[#C9A84C] bg-[#C9A84C]/5 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {store.featured && (
                    <span className="inline-block px-3 py-1 bg-[#C9A84C] text-white text-xs font-medium rounded-full mb-3">
                      Main Showroom
                    </span>
                  )}
                  <h3 className="font-serif text-xl text-gray-900 mb-2">{store.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-[#C9A84C] mt-0.5 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-[#C9A84C] flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredStores.length === 0 && (
                <div className="text-center py-12">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No stores found matching your search</p>
                </div>
              )}
            </div>

            {/* Store Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-lg">
                {/* Map Placeholder */}
                <div className="relative h-[400px] bg-gray-100">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.${selectedStore.id}!2d${selectedStore.lng}!3d${selectedStore.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sin!4v1234567890`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                  <button
                    onClick={() => openInMaps(selectedStore.lat, selectedStore.lng)}
                    className="absolute top-4 right-4 px-4 py-2 bg-white shadow-lg rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Navigation size={16} className="text-[#C9A84C]" />
                    <span className="text-sm font-medium">Get Directions</span>
                  </button>
                </div>

                {/* Store Information */}
                <div className="p-6 md:p-8">
                  <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-6">
                    {selectedStore.name}
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin size={20} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Address</h4>
                        <p className="text-gray-600">{selectedStore.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone size={20} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Phone</h4>
                        <a href={`tel:${selectedStore.phone}`} className="text-gray-600 hover:text-[#C9A84C] transition-colors">
                          {selectedStore.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail size={20} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                        <a href={`mailto:${selectedStore.email}`} className="text-gray-600 hover:text-[#C9A84C] transition-colors">
                          {selectedStore.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#C9A84C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock size={20} className="text-[#C9A84C]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Store Hours</h4>
                        <p className="text-gray-600">{selectedStore.hours}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => openInMaps(selectedStore.lat, selectedStore.lng)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1C1917] text-[#C9A84C] font-semibold hover:bg-[#292524] transition-colors"
                    >
                      <Navigation size={20} />
                      Get Directions
                    </button>
                    <a
                      href={`tel:${selectedStore.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#1C1917] text-[#1C1917] font-semibold hover:bg-[#1C1917] hover:text-[#C9A84C] transition-colors"
                    >
                      <Phone size={20} />
                      Call Store
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
