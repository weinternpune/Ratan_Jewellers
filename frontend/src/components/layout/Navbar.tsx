

"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronDown, Shield, Repeat, MapPin, Package as PackageIcon } from 'lucide-react'
import { useCartStore, useAuthStore, useUIStore, useWishlistStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore as useAdminAuthStore } from '@/store/authStore'

const categories = [
  { label: 'Necklaces', href: '/products?category=necklaces' },
  { label: 'Rings', href: '/products?category=rings' },
  { label: 'Bangles', href: '/products?category=bangles' },
  { label: 'Earrings', href: '/products?category=earrings' },
  { label: 'Chains', href: '/products?category=chains' },
  { label: 'Pendants', href: '/products?category=pendants' },
  { label: 'Bracelets', href: '/products?category=bracelets' },
  { label: 'Mangalsutras', href: '/products?category=mangalsutras' },
]

export default function Navbar() {
  const { isLoggedIn: isAdminLoggedIn } = useAdminAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const totalItemsCount = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0))
  const wishlistCount = useWishlistStore(s => s.totalItems())
  const toggleCart = useCartStore(s => s.toggleCart)
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu, toggleSearch } = useUIStore()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ── Key fix: if adminAccessToken exists, clear customer session immediately ──
  // useEffect(() => {
  //   if (typeof window === 'undefined') return
  //   const adminToken = localStorage.getItem('adminAccessToken') ||
  //                      localStorage.getItem('adminToken') ||
  //                      localStorage.getItem('admin_token')
  //   if (adminToken && isAuthenticated) {
  //     clearAuth()
  //   }
  // }, [isAuthenticated])




  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setCollectionsOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

// const handleProfileClick = (e: React.MouseEvent) => {
//     e.preventDefault()
//     if (typeof window === 'undefined') return

//     const adminToken = localStorage.getItem('adminAccessToken') ||
//                        localStorage.getItem('adminToken') ||
//                        localStorage.getItem('admin_token')

//     if (adminToken) {
//       // Admin on front site → just send to login, not account
//       router.push('/login')
//       return
//     }

//     if (isAuthenticated) {
//       router.push('/account')
//     } else {
//       router.push('/login')
//     }
//   }

const handleProfileClick = (e: React.MouseEvent) => {
  e.preventDefault()
  
  if (isAdminLoggedIn) {
    router.push('/admin/dashboard')
    return
  } 
  if (isAuthenticated) {
    router.push('/account')
  } else {
    router.push('/login')
  }
}
  return (
    <>
      {/* Top Bar */}
      <div className={`hidden xl:block bg-white border-b border-gray-200 py-2.5 fixed top-0 left-0 right-0 z-[99] w-full max-w-full overflow-x-hidden transition-transform duration-300 ${scrolled ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="w-full max-w-full px-2 sm:px-4 md:px-6 lg:px-6 xl:px-8 2xl:px-12 flex justify-between items-center overflow-x-hidden">
          <div className="hidden lg:flex items-center gap-8 text-xs text-gray-700">
            <span className="flex items-center gap-2">
              <Shield size={14} className="text-gray-600" />
              <span>100% Hallmarked Jewellery</span>
            </span>
            <span className="flex items-center gap-2">
              <Repeat size={14} className="text-gray-600" />
              <span>Lifetime Exchange & Buyback</span>
            </span>
            <span className="flex items-center gap-2">
              <PackageIcon size={14} className="text-gray-600" />
              <span>Free Shipping Across India</span>
            </span>
          </div>
          <div className="flex items-center gap-4 lg:gap-6 text-xs text-gray-700 ml-auto">
            <Link href="/store-locator" className="hover:text-[#C9A84C] transition-colors flex items-center gap-1.5">
              <MapPin size={13} />
              <span className="hidden sm:inline">Store Locator</span>
            </Link>
            <Link href="/track-order" className="hover:text-[#C9A84C] transition-colors flex items-center gap-1.5">
              <PackageIcon size={13} />
              <span className="hidden sm:inline">Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`fixed left-0 right-0 z-[100] bg-white border-b border-gray-200 shadow-md w-full transition-all duration-300 ${scrolled ? 'top-0' : 'top-0 xl:top-[44px]'}`}>
        <div className="w-full max-w-full px-1.5 xs:px-2 sm:px-3 md:px-3 lg:px-4 xl:px-8 2xl:px-12">
          <div className="flex items-center justify-between h-16 md:h-20 w-full max-w-full gap-0.5 xs:gap-1 sm:gap-1 md:gap-1 lg:gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2 xl:gap-3 group flex-shrink-0 min-w-0">
              <div className="relative flex-shrink-0">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none" className="sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 xl:w-12 xl:h-12 drop-shadow-md">
                  <path d="M8 28L12 16L18 22L24 12L30 22L36 16L40 28H8Z" fill="#C9A84C" stroke="#9D7A2E" strokeWidth="1" />
                  <rect x="8" y="28" width="32" height="4" fill="#C9A84C" stroke="#9D7A2E" strokeWidth="1" />
                  <circle cx="12" cy="16" r="2" fill="#E8D5A3" />
                  <circle cx="24" cy="12" r="2" fill="#E8D5A3" />
                  <circle cx="36" cy="16" r="2" fill="#E8D5A3" />
                  <circle cx="24" cy="24" r="10" fill="white" stroke="#C9A84C" strokeWidth="1.5" />
                  <text x="24" y="29" textAnchor="middle" fill="#C9A84C" fontSize="14" fontWeight="bold" fontFamily="serif">R</text>
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="font-serif text-xs sm:text-sm md:text-sm lg:text-base xl:text-xl font-bold text-[#C9A84C] tracking-wide leading-none whitespace-nowrap truncate">
                  RATAN JEWELLERS
                </div>
                <div className="text-[7px] sm:text-[7px] md:text-[7px] lg:text-[8px] xl:text-[9px] text-gray-500 tracking-[0.1em] sm:tracking-[0.12em] md:tracking-[0.13em] lg:tracking-[0.15em] uppercase leading-none mt-1 hidden sm:block truncate">
                  Timeless Elegance. Trusted Since Generations.
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden min-[820px]:flex items-center gap-0 lg:gap-0 xl:gap-0.5 2xl:gap-1">
              <Link href="/" className={`px-0.5 lg:px-1.5 xl:px-3 2xl:px-4 py-2 text-[8.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-normal xl:tracking-wide transition-colors ${pathname === '/' ? 'text-[#C9A84C]' : 'text-gray-700 hover:text-[#C9A84C]'}`}>
                HOME
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCollectionsOpen(!collectionsOpen)}
                  className="flex items-center gap-0.5 px-0.5 lg:px-1.5 xl:px-3 2xl:px-4 py-2 text-[8.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-normal xl:tracking-wide text-gray-700 hover:text-[#C9A84C] transition-colors whitespace-nowrap"
                >
                  COLLECTIONS
                  <ChevronDown size={10} className={`lg:w-3 lg:h-3 xl:w-[13px] xl:h-[13px] 2xl:w-[14px] 2xl:h-[14px] transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50"
                    >
                      {categories.map(cat => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          onClick={() => setCollectionsOpen(false)}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#C9A84C]/5 hover:text-[#C9A84C] transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/products?category=gold" className="px-0.5 lg:px-1.5 xl:px-3 2xl:px-4 py-2 text-[8.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-normal xl:tracking-wide text-gray-700 hover:text-[#C9A84C] transition-colors">
                GOLD
              </Link>
              <Link href="/products?category=diamond" className="px-0.5 lg:px-1.5 xl:px-3 2xl:px-4 py-2 text-[8.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-normal xl:tracking-wide text-gray-700 hover:text-[#C9A84C] transition-colors">
                DIAMOND
              </Link>
              <Link href="/products?category=silver" className="px-0.5 lg:px-1.5 xl:px-3 2xl:px-4 py-2 text-[8.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-normal xl:tracking-wide text-gray-700 hover:text-[#C9A84C] transition-colors">
                SILVER
              </Link>
              <Link href="/custom-jewellery" className="px-0.5 lg:px-1 xl:px-2 2xl:px-4 py-2 text-[7.5px] lg:text-[9px] xl:text-[11px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-tight xl:tracking-normal 2xl:tracking-wide text-gray-700 hover:text-[#C9A84C] transition-colors whitespace-nowrap">
                CUSTOM
              </Link>
              <Link href="/about" className={`px-0.5 lg:px-1.5 xl:px-3 2xl:px-4 py-2 text-[8.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-normal xl:tracking-wide transition-colors whitespace-nowrap ${pathname === '/about' ? 'text-[#C9A84C]' : 'text-gray-700 hover:text-[#C9A84C]'}`}>
                ABOUT
              </Link>
              <Link href="/contact" className={`px-0.5 lg:px-1.5 xl:px-3 2xl:px-4 py-2 text-[8.5px] lg:text-[10px] xl:text-[12px] 2xl:text-[13px] font-bold tracking-tighter lg:tracking-normal xl:tracking-wide transition-colors ${pathname === '/contact' ? 'text-[#C9A84C]' : 'text-gray-700 hover:text-[#C9A84C]'}`}>
                CONTACT
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 xl:gap-1.5 2xl:gap-2 flex-shrink-0">
              <button
                onClick={toggleSearch}
                className="p-1 sm:p-1.5 xl:p-2 text-gray-700 hover:text-[#C9A84C] transition-colors"
                aria-label="Search"
              >
                <Search size={18} className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] xl:w-[19px] xl:h-[19px] 2xl:w-5 2xl:h-5" />
              </button>

              {/* ── Profile icon: now a button with smart routing ── */}
              <button
                onClick={handleProfileClick}
                className="p-1 sm:p-1.5 xl:p-2 text-gray-700 hover:text-[#C9A84C] transition-colors"
                aria-label="Account"
              >
                <User size={18} className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] xl:w-[19px] xl:h-[19px] 2xl:w-5 2xl:h-5" />
              </button>

              <Link href="/wishlist" className="p-1 sm:p-1.5 xl:p-2 text-gray-700 hover:text-[#C9A84C] transition-colors relative" aria-label="Wishlist">
                <Heart size={18} className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] xl:w-[19px] xl:h-[19px] 2xl:w-5 2xl:h-5" />
                {isMounted && wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#C9A84C] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button onClick={toggleCart} className="p-1 sm:p-1.5 xl:p-2 text-gray-700 hover:text-[#C9A84C] transition-colors relative" aria-label="Cart">
                <ShoppingBag size={18} className="w-[17px] h-[17px] sm:w-[18px] sm:h-[18px] xl:w-[19px] xl:h-[19px] 2xl:w-5 2xl:h-5" />
                {isMounted && totalItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#C9A84C] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItemsCount}
                  </span>
                )}
              </button>

              <button onClick={toggleMobileMenu} className="p-1 sm:p-1.5 xl:p-2 text-gray-700 min-[820px]:hidden" aria-label="Menu">
                {isMobileMenuOpen ? <X size={20} className="w-[19px] h-[19px] sm:w-5 sm:h-5" /> : <Menu size={20} className="w-[19px] h-[19px] sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="min-[820px]:hidden bg-white border-t border-gray-100"
            >
              <div className="px-6 py-4 space-y-2">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Gold', href: '/products?category=gold' },
                  { label: 'Diamond', href: '/products?category=diamond' },
                  { label: 'Silver', href: '/products?category=silver' },
                  { label: 'Custom Jewellery', href: '/custom-jewellery' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className={`block px-4 py-2.5 text-sm hover:bg-gray-50 rounded-lg transition-colors ${pathname === item.href ? 'text-[#C9A84C]' : 'text-gray-700 hover:text-[#C9A84C]'}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}


