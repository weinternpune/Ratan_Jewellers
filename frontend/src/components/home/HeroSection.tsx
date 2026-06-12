"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowRight, Phone } from 'lucide-react'

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Array of hero images - Replace with your actual images
  const heroImages = [
    '/hero-couple.jpg',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop', // Indian wedding jewelry
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1920&h=1080&fit=crop', // Gold jewelry
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&h=1080&fit=crop', // Diamond jewelry
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&h=1080&fit=crop', // Traditional jewelry
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1920&h=1080&fit=crop', // Bridal jewelry
  ]

  const totalSlides = heroImages.length

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 3000) // Auto-scroll every 3 seconds
    return () => clearInterval(timer)
  }, [totalSlides])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  const goToSlide = (index: number) => setCurrentSlide(index)

  return (
    <section className="relative h-[550px] sm:h-[650px] md:h-[calc(100vh-160px)] w-full overflow-hidden">
      {/* Mobile & Tablet Background Image - Shows both people properly */}
      <div className="block md:hidden absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt={`Couple in traditional attire - Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Overlay for better text readability on mobile/tablet */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/65" />
      </div>

      {/* Desktop Background Image - Original positioning */}
      <div className="hidden md:block absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          />
        ))}
        {/* Overlay for better text readability on desktop */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full w-full px-4 md:px-8 lg:px-16 z-20">
        <div className="h-full flex items-end md:items-center pb-20 md:pb-0">
          <div className="max-w-2xl">
            {/* Title - Consistent styling across all responsive sections */}
            <h1 className="font-serif text-[28px] sm:text-[32px] md:text-[40px] lg:text-[46px] xl:text-[50px] font-normal text-white md:text-[#1a1a1a] leading-[1.25] mb-2 md:mb-4 drop-shadow-lg md:drop-shadow-sm">
              Crafting Moments,<br />
              Cherishing Generations
            </h1>

            {/* Description */}
            <p className="text-[11px] md:text-[13px] lg:text-[14px] text-white md:text-[#333] leading-relaxed mb-3 md:mb-6 max-w-md drop-shadow-lg md:drop-shadow-sm">
              Discover the finest collection of gold, diamond & silver jewellery
              <br className="hidden md:inline" /> that celebrates your special moments.
            </p>

            {/* CTA Button */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 bg-[#3D2817] text-white font-medium text-[11px] md:text-[12px] tracking-wide hover:bg-[#2D1810] transition-all duration-300 shadow-lg"
            >
              SHOP COLLECTION
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden only on very small mobile */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-9 md:w-10 h-9 md:h-10 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/50 transition-all"
        aria-label="Previous slide"
      >
        <ChevronRight size={16} className="md:w-[18px] md:h-[18px] rotate-180" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-[100px] md:right-[120px] lg:right-[160px] top-1/2 -translate-y-1/2 z-30 w-9 md:w-10 h-9 md:h-10 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white hover:bg-black/50 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-6 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Floating Action Buttons - Positioned to avoid text overlap */}
      <div className="absolute right-2 sm:right-3 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-40 bg-[#8B6F47]/85 backdrop-blur-sm rounded-2xl shadow-xl py-3 md:py-4 px-2.5 md:px-3.5">
        <div className="flex flex-col gap-3 md:gap-4">
          {/* WhatsApp */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-white hover:scale-105 transition-transform"
            aria-label="WhatsApp"
          >
            <div className="w-8 md:w-9 h-8 md:h-9 rounded-full border-[1.5px] border-white/90 flex items-center justify-center mb-1">
              <svg className="w-4 md:w-5 h-4 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <span className="text-[9px] md:text-[10px] font-medium text-white leading-tight">WhatsApp</span>
          </a>

          {/* Call */}
          <a
            href="tel:+919876543210"
            className="flex flex-col items-center justify-center text-white hover:scale-105 transition-transform"
            aria-label="Call us"
          >
            <div className="w-8 md:w-9 h-8 md:h-9 rounded-full border-[1.5px] border-white/90 flex items-center justify-center mb-1">
              <Phone size={16} className="md:w-[18px] md:h-[18px]" />
            </div>
            <span className="text-[9px] md:text-[10px] font-medium text-white leading-tight">Call Now</span>
          </a>

          {/* Book Visit */}
          <button
            className="flex flex-col items-center justify-center text-white hover:scale-105 transition-transform"
            aria-label="Book Visit"
          >
            <div className="w-8 md:w-9 h-8 md:h-9 rounded-full border-[1.5px] border-white/90 flex items-center justify-center mb-1">
              <svg className="w-4 md:w-[18px] h-4 md:h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span className="text-[9px] md:text-[10px] font-medium text-white leading-tight">Book Visit</span>
          </button>
        </div>
      </div>
    </section>
  )
}
