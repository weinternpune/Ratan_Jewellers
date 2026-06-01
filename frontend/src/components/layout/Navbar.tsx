'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Search, User, Heart, Menu, X, Phone, ChevronDown, Gem } from 'lucide-react'
import { useCartStore, useAuthStore, useUIStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [scrolled, setScrolled] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const pathname = usePathname()
  const totalItemsCount = useCartStore(s => s.items.reduce((a, i) => a + i.quantity, 0))
  const toggleCart = useCartStore(s => s.toggleCart)
  const { user, isAuthenticated } = useAuthStore()
  const { isMobileMenuOpen, toggleMobileMenu, toggleSearch, goldRate } = useUIStore()
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => { const h = () => setScrolled(window.scrollY > 20); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h) }, [])
  useEffect(() => { const h = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setCollectionsOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const isHome = pathname === '/'
  const isTransparent = isHome && !scrolled
  return (
    <>
      <div className="bg-obsidian text-gold-light/70 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Phone size={11} /><a href="tel:+919876543210" className="hover:text-gold transition-colors">+91 98765 43210</a></span>
            <span className="text-gold-light/40">|</span>
            <span>Free shipping on orders above ₹5,000</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-code text-gold">24K Gold: ₹{goldRate.toLocaleString('en-IN')}/g</span>
            <span className="text-gold-light/40">|</span>
            <Link href="/store-locator" className="animated-underline hover:text-gold transition-colors">Store Locator</Link>
            <Link href="/about" className="animated-underline hover:text-gold transition-colors">About Us</Link>
          </div>
        </div>
      </div>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent' : scrolled ? 'bg-white/98 backdrop-blur-md shadow-luxury border-b border-gold/10' : 'bg-white border-b border-gold/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-all">
                <Gem size={18} className="text-obsidian" />
              </div>
              <div>
                <div className={`font-display text-xl font-semibold leading-none transition-colors ${isTransparent ? 'text-gold-light' : 'text-obsidian'}`}>Ratan</div>
                <div className={`font-mono-code text-[9px] tracking-[0.2em] uppercase transition-colors ${isTransparent ? 'text-gold/70' : 'text-warm-grey'}`}>Jewellers</div>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {[{ label: 'Home', href: '/' }, { label: 'New Arrivals', href: '/products?sort=newest' }].map(item => (
                <Link key={item.href} href={item.href} className={`px-4 py-2 text-sm font-medium animated-underline transition-colors ${isTransparent ? 'text-gold-light/80 hover:text-gold-light' : pathname === item.href ? 'text-gold' : 'text-charcoal hover:text-gold'}`}>{item.label}</Link>
              ))}
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setCollectionsOpen(!collectionsOpen)} className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${isTransparent ? 'text-gold-light/80 hover:text-gold-light' : 'text-charcoal hover:text-gold'}`}>
                  Collections<ChevronDown size={14} className={`transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 mt-1 w-48 bg-white border border-gold/20 rounded-lg shadow-luxury-lg overflow-hidden">
                      {categories.map(cat => <Link key={cat.href} href={cat.href} onClick={() => setCollectionsOpen(false)} className="block px-4 py-2.5 text-sm text-charcoal hover:bg-gold/5 hover:text-gold transition-colors">{cat.label}</Link>)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {[{ label: 'Trending', href: '/products?filter=trending' }, { label: 'Blog', href: '/blog' }].map(item => (
                <Link key={item.href} href={item.href} className={`px-4 py-2 text-sm font-medium animated-underline transition-colors ${isTransparent ? 'text-gold-light/80 hover:text-gold-light' : 'text-charcoal hover:text-gold'}`}>{item.label}</Link>
              ))}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={toggleSearch} className={`p-2.5 rounded-full transition-all hover:bg-gold/10 ${isTransparent ? 'text-gold-light' : 'text-charcoal hover:text-gold'}`}><Search size={19} /></button>
              <Link href="/wishlist" className={`p-2.5 rounded-full transition-all hover:bg-gold/10 hidden sm:flex ${isTransparent ? 'text-gold-light' : 'text-charcoal hover:text-gold'}`}><Heart size={19} /></Link>
              <Link href={isAuthenticated ? '/account' : '/login'} className={`p-2.5 rounded-full transition-all hover:bg-gold/10 hidden sm:flex ${isTransparent ? 'text-gold-light' : 'text-charcoal hover:text-gold'}`}><User size={19} /></Link>
              <button onClick={toggleCart} className={`p-2.5 rounded-full transition-all hover:bg-gold/10 relative ${isTransparent ? 'text-gold-light' : 'text-charcoal hover:text-gold'}`}>
                <ShoppingBag size={19} />
                {totalItemsCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-obsidian text-[10px] font-bold rounded-full flex items-center justify-center">{totalItemsCount > 9 ? '9+' : totalItemsCount}</span>}
              </button>
              {isAuthenticated && user?.role !== 'CUSTOMER' && <Link href="/admin" className="hidden md:flex items-center gap-1.5 ml-2 px-3 py-1.5 btn-gold text-xs rounded font-medium">Dashboard</Link>}
              <button onClick={toggleMobileMenu} className={`p-2.5 rounded-full transition-all hover:bg-gold/10 lg:hidden ${isTransparent ? 'text-gold-light' : 'text-charcoal'}`}>{isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t border-gold/10 overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {[{ label: 'Home', href: '/' }, { label: 'New Arrivals', href: '/products?sort=newest' }, { label: 'Trending', href: '/products?filter=trending' }, { label: 'Blog', href: '/blog' }, { label: 'About Us', href: '/about' }, { label: 'Store Locator', href: '/store-locator' }, { label: 'Wishlist', href: '/wishlist' }, { label: 'My Account', href: isAuthenticated ? '/account' : '/login' }].map(item => (
                  <Link key={item.href} href={item.href} onClick={toggleMobileMenu} className="block px-4 py-2.5 text-sm text-charcoal hover:text-gold hover:bg-gold/5 rounded-lg transition-colors">{item.label}</Link>
                ))}
                <div className="pt-2 border-t border-gold/10"><div className="px-4 py-2 text-xs font-mono-code text-gold">24K Gold: ₹{goldRate.toLocaleString('en-IN')}/g</div></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
