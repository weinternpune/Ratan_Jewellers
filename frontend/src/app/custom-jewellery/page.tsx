'use client'

import React, { useState } from 'react'
//import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Sparkles, MessageSquare, Phone, Mail, Check, ArrowRight, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

const categories = [
  {
    id: 1,
    name: 'Engagement Rings',
    image: '/categories/engagement-rings.jpg.png',
    description: 'Create the perfect symbol of your love',
    items: '50+ Designs',
  },
  {
    id: 2,
    name: 'Wedding Bands',
    image: '/categories/weding -band.jpg.png',
    description: 'Unique bands for your special day',
    items: '40+ Designs',
  },
  {
    id: 3,
    name: 'Necklaces',
    image: '/gallery/necklace-1.jpg.png',
    description: 'Personalized statement pieces',
    items: '60+ Designs',
  },
  {
    id: 4,
    name: 'Earrings',
    image: '/gallery/earring-1.jpg.png',
    description: 'Custom designs for every occasion',
    items: '45+ Designs',
  },
  {
    id: 5,
    name: 'Bracelets',
    image: '/categories/bracelts.jpg.png',
    description: 'Elegant custom bracelets',
    items: '35+ Designs',
  },
  {
    id: 6,
    name: 'Pendants',
    image: '/categories/pendants.jpg.png',
    description: 'Meaningful custom pendants',
    items: '30+ Designs',
  },
]

const galleryImages = [
  { id: 1, image: '/gallery/ring-1.jpg.png', title: 'Custom Diamond Ring', category: 'Ring' },
  { id: 2, image: '/gallery/necklace-1.jpg.png', title: 'Gold Necklace Set', category: 'Necklace' },
  { id: 3, image: '/gallery/earring-1.jpg.png', title: 'Pearl Earrings', category: 'Earrings' },
  { id: 4, image: '/gallery/bracelet-1.jpg.jpg', title: 'Emerald Bracelet', category: 'Bracelet' },
  { id: 5, image: '/categories/pendants.jpg.png', title: 'Ruby Pendant', category: 'Pendant' },
  { id: 6, image: '/categories/weding -band.jpg.png', title: 'Wedding Band Set', category: 'Ring' },
  { id: 7, image: '/gallery/ring-2.jpg.png', title: 'Sapphire Ring', category: 'Ring' },
  { id: 8, image: '/gallery/necklace-2.jpg.png', title: 'Gold Chain', category: 'Necklace' },
]

const processSteps = [
  {
    step: '01',
    title: 'Consultation',
    description: 'Share your vision with our expert designers. We discuss your preferences, budget, and design ideas.',
    icon: MessageSquare,
    details: 'Book a free consultation with our design experts either in-store or virtually. We will understand your vision, style preferences, and budget to create the perfect custom piece.',
  },
  {
    step: '02',
    title: 'Design Creation',
    description: 'Our artisans create detailed sketches and 3D renderings of your custom piece for your review.',
    icon: Pencil,
    details: 'Our master designers create detailed sketches and photorealistic 3D renderings. You will see exactly how your custom jewellery will look before we begin crafting.',
  },
  {
    step: '03',
    title: 'Approval & Refinement',
    description: 'Review the design and request any changes. We refine until you are completely satisfied.',
    icon: Check,
    details: 'Review the designs at your own pace. Request modifications and refinements until every detail is perfect. Your satisfaction is our priority.',
  },
  {
    step: '04',
    title: 'Crafting',
    description: 'Our master craftsmen bring your design to life with precision and care using the finest materials.',
    icon: Sparkles,
    details: 'Watch your dream come to life as our experienced craftsmen meticulously create your custom piece using traditional techniques and the finest materials.',
  },
]

export default function CustomJewelleryPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
  })
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.category || !formData.message) {
      toast.error('Please fill in all fields')
      return
    }

    const loadingToast = toast.loading('Submitting your request...')

    try {
      // Use Next.js API route (no CORS issues)
      const response = await fetch('/api/custom-jewellery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.dismiss(loadingToast)
        toast.success('Request submitted! We will contact you within 24 hours.')
        setFormData({ name: '', email: '', phone: '', category: '', message: '' })
      } else {
        toast.dismiss(loadingToast)
        toast.error(data.error || 'Failed to submit request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.dismiss(loadingToast)
      toast.error('Failed to submit request. Please try again or contact us directly.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const filteredGallery = selectedFilter === 'All' 
    ? galleryImages 
    : galleryImages.filter(item => item.category === selectedFilter)

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Background Design Elements - Lower z-index */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C9A84C]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-obsidian via-obsidian-2 to-[#2D1810] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(201,168,76,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(201,168,76,0.08),transparent_50%)]" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="text-gold" size={16} />
              <span className="text-xs font-medium text-gold-light tracking-wide uppercase">Bespoke Craftsmanship</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gold mb-4 md:mb-6 leading-tight">
              Custom Jewellery
              <br />
              <span className="text-gold-light text-3xl md:text-4xl lg:text-5xl">Made Just for You</span>
            </h1>
            <p className="text-lg md:text-xl text-gold-light/80 mb-6 md:mb-8 leading-relaxed">
              Transform your dreams into reality. Create a unique piece that tells your story, 
              crafted by master artisans with decades of expertise.
            </p>
            <a
              href="#consultation"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gold text-obsidian font-semibold hover:bg-gold-light transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Your Journey
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-cream via-white to-cream relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.03),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From concept to creation, our streamlined process ensures your custom jewellery 
              is crafted to perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((item, index) => (
              <div key={index} className="relative h-full">
                <button
                  onClick={() => setSelectedStep(selectedStep === index ? null : index)}
                  className={`w-full h-full bg-white p-6 md:p-8 rounded-lg border-2 transition-all duration-300 text-left ${
                    selectedStep === index
                      ? 'border-gold shadow-2xl scale-105 bg-gradient-to-br from-gold/5 to-transparent'
                      : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gold/50 hover:scale-102'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                      selectedStep === index ? 'bg-gold scale-110' : 'bg-gold/10'
                    }`}>
                      <item.icon className={selectedStep === index ? 'text-white' : 'text-gold'} size={24} />
                    </div>
                    <div className={`text-7xl font-serif absolute top-0 right-0 transition-all duration-300 ${
                      selectedStep === index ? 'text-gold/30' : 'text-gold/10'
                    }`}>
                      {item.step}
                    </div>
                    <h3 className="font-serif text-xl text-obsidian mb-3 relative z-10">{item.title}</h3>
                    <p className={`text-gray-600 text-sm leading-relaxed min-h-[60px] ${
                      selectedStep === index ? 'font-medium' : ''
                    }`}>
                      {selectedStep === index ? item.details : item.description}
                    </p>
                    
                    {selectedStep === index && (
                      <div className="mt-4 pt-4 border-t border-gold/20">
                        <span className="text-xs text-gold font-medium uppercase tracking-wide">
                          Click to collapse
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-gold/50 to-gold/20 z-20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20 bg-white relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-4">
              Choose Your Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our custom jewellery categories and find the perfect piece to customize
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-square relative bg-gray-200">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl mb-2">{category.name}</h3>
                  <p className="text-sm text-white/80 mb-2">{category.description}</p>
                  <p className="text-xs text-gold-light">{category.items}</p>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="text-white" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-cream to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,168,76,0.05),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-4">
              Our Custom Creations
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Browse our portfolio of custom jewellery pieces crafted for our valued customers
            </p>

            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {['All', 'Ring', 'Necklace', 'Earrings', 'Bracelet', 'Pendant'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedFilter === filter
                      ? 'bg-gold text-white'
                      : 'bg-white text-gray-700 hover:bg-gold/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-200"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-xs text-gold-light mb-1">{item.category}</p>
                    <h4 className="font-serif text-lg">{item.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Form */}
      <section id="consultation" className="py-16 md:py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-obsidian mb-4">
              Start Your Custom Design
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fill out the form below and our design team will contact you within 24 hours 
              to discuss your custom jewellery project.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-cream to-white p-6 md:p-8 rounded-2xl shadow-2xl border border-gold/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="luxury-input"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="luxury-input"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="luxury-input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="luxury-input"
                >
                  <option value="">Select a category</option>
                  <option value="ring">Engagement Ring</option>
                  <option value="wedding">Wedding Band</option>
                  <option value="necklace">Necklace</option>
                  <option value="earring">Earrings</option>
                  <option value="bracelet">Bracelet</option>
                  <option value="pendant">Pendant</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Design Details *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="luxury-input resize-none"
                placeholder="Describe your custom jewellery idea, preferred materials, budget, and any specific requirements..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-obsidian to-obsidian-2 text-gold font-semibold hover:from-obsidian-2 hover:to-obsidian-3 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
            >
              Submit Consultation Request
              <ArrowRight size={20} />
            </button>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gold" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gold" />
                <span>custom@ratanjewellers.com</span>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
