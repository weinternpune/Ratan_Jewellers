'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useWishlistStore, useCartStore } from '@/store'
import { api } from '@/lib/api'

interface Product {
  _id: string; id?: string; name: string; slug: string; sku: string
  images: string[]; metal: string; purity: string; netWeight: number
  currentPrice: number; stoneCharges: number; avgRating: number
  reviewCount: number; inStock: boolean; isTrending?: boolean
  description?: string; category: string | { name: string }
  makingCharges?: number; goldRate?: number
}


// ─── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const half = !filled && i < rating
          return (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24"
              fill={filled ? '#f59e0b' : half ? 'url(#half)' : 'none'}
              stroke="#f59e0b" strokeWidth="1.5">
              {half && (
                <defs>
                  <linearGradient id="half">
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )
        })}
      </div>
      <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      <span className="text-sm text-gray-400">({count} reviews)</span>
    </div>
  )
}

// ─── Price Breakdown Row ───────────────────────────────────────────────────────
function PriceRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 ${accent ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
      <span className="text-sm">{label}</span>
      <span className={`text-sm ${accent ? 'text-[#8b5e2f] text-base font-bold' : ''}`}>{value}</span>
    </div>
  )
}

// ─── Related Product Card (mini) ──────────────────────────────────────────────
function RelatedCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative w-full aspect-square bg-[#f5f0eb] overflow-hidden">
        <img
          src={product.image || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/f5f0eb/c9a96e?text=Jewellery' }}
        />
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[13px] font-semibold text-gray-800 line-clamp-1 group-hover:text-amber-700 transition-colors">{product.name}</p>
        <p className="text-[12px] text-amber-700 font-bold mt-0.5">₹{product.currentPrice.toLocaleString('en-IN')}</p>
      </div>
    </Link>
  )
}

// ─── Mobile Zoom Modal (Fullscreen pinch + pan + swipe) ───────────────────────
function MobileZoomModal({
  images,
  startIndex,
  onClose,
}: {
  images: string[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  // Pinch state
  const pinchRef = useRef<{
    initialDistance: number
    initialScale: number
    initialTranslate: { x: number; y: number }
    initialMidpoint: { x: number; y: number }
  } | null>(null)

  // Pan state
  const panRef = useRef<{ startX: number; startY: number; startTx: number; startTy: number } | null>(null)

  // Swipe state (when not zoomed)
  const swipeRef = useRef<{ startX: number; startY: number } | null>(null)

  // Double-tap state
  const lastTapRef = useRef<number>(0)

  // Reset zoom on image change
  useEffect(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [index])

  // Prevent body scroll when modal open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getMidpoint = (touches: React.TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      pinchRef.current = {
        initialDistance: getDistance(e.touches),
        initialScale: scale,
        initialTranslate: { ...translate },
        initialMidpoint: getMidpoint(e.touches),
      }
      panRef.current = null
      swipeRef.current = null
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        // Pan start
        panRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startTx: translate.x,
          startTy: translate.y,
        }
      } else {
        // Swipe start
        swipeRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
        }
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pinchRef.current && e.touches.length === 2) {
      const newDistance = getDistance(e.touches)
      const newScale = Math.max(1, Math.min(4, pinchRef.current.initialScale * (newDistance / pinchRef.current.initialDistance)))
      setScale(newScale)
    } else if (panRef.current && e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - panRef.current.startX
      const dy = e.touches[0].clientY - panRef.current.startY
      setTranslate({
        x: panRef.current.startTx + dx,
        y: panRef.current.startTy + dy,
      })
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Swipe to change image (only if not zoomed)
    if (swipeRef.current && scale === 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - swipeRef.current.startX
      const dy = e.changedTouches[0].clientY - swipeRef.current.startY
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0 && index < images.length - 1) setIndex(index + 1)
        else if (dx > 0 && index > 0) setIndex(index - 1)
      }
    }

    // Reset if scale dropped back
    if (scale <= 1) setTranslate({ x: 0, y: 0 })

    pinchRef.current = null
    panRef.current = null
    swipeRef.current = null
  }

  // Double tap to zoom in/out
  const handleClick = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      if (scale > 1) {
        setScale(1)
        setTranslate({ x: 0, y: 0 })
      } else {
        setScale(2.5)
      }
    }
    lastTapRef.current = now
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center touch-none select-none"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition"
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Image counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold">
        {index + 1} / {images.length}
      </div>

      {/* Image */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <img
          src={images[index]}
          alt=""
          draggable={false}
          className="max-w-full max-h-full object-contain pointer-events-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: pinchRef.current || panRef.current ? 'none' : 'transform 0.25s ease',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* Prev / Next arrows (tablet & up) */}
      {images.length > 1 && (
        <>
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(index - 1)}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white items-center justify-center active:scale-95 transition"
              aria-label="Previous"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              onClick={() => setIndex(index + 1)}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white items-center justify-center active:scale-95 transition"
              aria-label="Next"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[11px] font-medium">
        Pinch to zoom · Double-tap · Swipe
      </div>
    </motion.div>
  )
}

// ─── Zoom Image Component (Hover desktop / Tap mobile) ────────────────────────
function ZoomImage({
  src,
  alt,
  badges,
  wishlistButton,
  allImages,
  activeIndex,
}: {
  src: string
  alt: string
  badges?: React.ReactNode
  wishlistButton?: React.ReactNode
  allImages: string[]
  activeIndex: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState({ active: false, x: 0, y: 0 })
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)

  const LENS_SIZE = 140
  const ZOOM_FACTOR = 2.5

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleMouseEnter = () => {
    if (isTouchDevice) return
    setZoom(z => ({ ...z, active: true }))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setZoom({ active: true, x, y })
  }

  const handleMouseLeave = () => setZoom(z => ({ ...z, active: false }))

  const handleImageClick = () => {
    // Open fullscreen modal on touch devices
    if (isTouchDevice) setShowMobileModal(true)
  }

  const halfLens = LENS_SIZE / 2
  const lensCx = Math.max(halfLens, Math.min(zoom.x, size.w - halfLens))
  const lensCy = Math.max(halfLens, Math.min(zoom.y, size.h - halfLens))
  const lensLeft = lensCx - halfLens
  const lensTop = lensCy - halfLens

  const scale = size.w / LENS_SIZE
  const bgW = size.w * scale
  const bgH = size.h * scale
  const bgX = -(lensLeft * scale)
  const bgY = -(lensTop * scale)

  return (
    <>
      <div className="relative">
        <div
          ref={containerRef}
          onClick={handleImageClick}
          className={`relative w-full aspect-square rounded-3xl overflow-hidden bg-[#f0ebe4] shadow-lg ${
            !isTouchDevice ? 'cursor-crosshair' : 'cursor-zoom-in'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                'https://placehold.co/600x600/f5f0eb/c9a96e?text=Jewellery'
            }}
          />

          {/* Mobile tap-to-zoom hint icon */}
          {isTouchDevice && (
            <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center pointer-events-none z-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5e2f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          )}

          {/* Dim overlay on desktop zoom */}
          {zoom.active && !isTouchDevice && (
            <div className="absolute inset-0 bg-black/5 pointer-events-none transition-opacity duration-200" />
          )}

          {/* Lens indicator (desktop only) */}
          {zoom.active && !isTouchDevice && size.w > 0 && (
            <div
              className="absolute pointer-events-none rounded-xl border-2 border-white/95"
              style={{
                width: LENS_SIZE,
                height: LENS_SIZE,
                left: lensLeft,
                top: lensTop,
                background: 'rgba(255,255,255,0.18)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 6px 24px rgba(0,0,0,0.25)',
              }}
            />
          )}

          {badges}
          {wishlistButton}
        </div>

        {/* Floating zoom panel (desktop xl+ only) */}
        {zoom.active && !isTouchDevice && size.w > 0 && (
          <div
            className="hidden xl:block absolute top-0 z-30 rounded-3xl overflow-hidden border border-amber-200 shadow-2xl bg-white pointer-events-none"
            style={{
              left: 'calc(100% + 24px)',
              width: size.w,
              height: size.h,
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${bgW}px ${bgH}px`,
              backgroundPosition: `${bgX}px ${bgY}px`,
            }}
          >
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wider uppercase">
              {ZOOM_FACTOR.toFixed(1)}× Zoom
            </div>
          </div>
        )}
      </div>

      {/* Mobile fullscreen zoom modal */}
      <AnimatePresence>
        {showMobileModal && (
          <MobileZoomModal
            images={allImages}
            startIndex={activeIndex}
            onClose={() => setShowMobileModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const { items: wishlistItems, toggleItem } = useWishlistStore()
  const { addItem: addToCart, items: cartItems } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [toast, setToast] = useState<{ message: string; type: 'add' | 'remove' | 'cart' } | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)

  // Resolve product from PRODUCTS or API
  useEffect(() => {
    if (!slug) return
    const found = PRODUCTS.find(p => p.slug === slug)
    if (found) {
      setProduct(found)
      return
    }
    fetch(`/api/products/${slug}`)
      .then(r => r.json())
      .then(d => d?.product && setProduct(d.product))
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    setActiveImage(0)
    setAddedToCart(false)
  }, [slug])

  const showToast = (message: string, type: 'add' | 'remove' | 'cart') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f6f3] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded-full animate-pulse mx-auto" />
            <div className="h-3 w-32 bg-gray-200 rounded-full animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  const allImages = [product.image, ...product.images].filter(Boolean) as string[]
  const uniqueImages = [...new Set(allImages)]

  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || ''
  const isWishlisted = wishlistItems.some(i => i.productId === product._id || product.id)
  const isInCart = cartItems.some(i => i.productId === product._id || product.id)

  const handleWishlist = () => {
    toggleItem({
      id: product._id || product.id,
      productId: product._id || product.id,
      name: product.name,
      sku: product.sku,
      image: product.image || product.images?.[0] || '',
      metal: product.metal,
      purity: product.purity,
      category: categoryName,
      currentPrice: product.currentPrice,
      addedAt: new Date().toISOString(),
    })
    showToast(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      isWishlisted ? 'remove' : 'add'
    )
  }

  const handleAddToCart = () => {
    addToCart({
      id: `cart-${product._id || product.id}`,
      productId: product._id || product.id,
      name: product.name,
      sku: product.sku,
      image: product.image || product.images?.[0] || '',
      purity: product.purity,
      weight: product.netWeight,
      price: product.currentPrice,
      quantity: 1,
    })
    setAddedToCart(true)
    showToast('Added to cart!', 'cart')
  }

  const related = PRODUCTS
    .filter(p => {
      const pCat = typeof p.category === 'string' ? p.category : p.category?.name || ''
      return p.id !== product._id || product.id && pCat === categoryName
    })
    .slice(0, 4)

  const goldValue = product.goldRate * product.netWeight
  const totalMaking = product.makingCharges
  const gst = Math.round((goldValue + totalMaking + product.stoneCharges) * 0.03)

  // Badges for the zoom image
  const badges = (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      {product.isFeatured && (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-white shadow">
          Featured
        </span>
      )}
      {product.isTrending && (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase bg-gray-800 text-white shadow">
          Trending
        </span>
      )}
      {!product.inStock && (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase bg-red-600 text-white shadow">
          Sold Out
        </span>
      )}
    </div>
  )

  // Wishlist button for the zoom image
  const wishlistButton = (
    <button
      type="button"
      aria-label="Toggle wishlist"
      onClick={handleWishlist}
      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow hover:scale-110 transition-all duration-200"
    >
      <svg width="18" height="18" viewBox="0 0 24 24"
        fill={isWishlisted ? '#ef4444' : 'none'}
        stroke={isWishlisted ? '#ef4444' : '#666'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )

  return (
    <div className="min-h-screen bg-[#f8f6f3]">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <nav className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:text-amber-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-amber-700 transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${categoryName}`} className="hover:text-amber-700 transition-colors">{categoryName}</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ── LEFT: Image Gallery ──────────────────────────────────────── */}
          <div className="space-y-3">

            {/* ── Zoom hint label (desktop only) ── */}
            <p className="hidden xl:flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Hover image to zoom
            </p>

            {/* ── AnimatePresence wraps just the src change, ZoomImage is stable ── */}
           <AnimatePresence initial={false}>
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ZoomImage
                  src={uniqueImages[activeImage] || 'https://placehold.co/600x600/f5f0eb/c9a96e?text=Jewellery'}
                  alt={product.name}
                  badges={badges}
                  wishlistButton={wishlistButton}
                />
              </motion.div>
            </AnimatePresence>

            {/* Thumbnail strip */}
            {uniqueImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {uniqueImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImage === idx ? 'border-amber-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/f5f0eb/c9a96e?text=+' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Details ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Name & rating */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-600 mb-1">
                {categoryName} · {product.metal}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                {product.name}
              </h1>
              <div className="mt-2">
                <StarRating rating={product.avgRating} count={product.reviewCount} />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{product.currentPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-gray-400 mb-1">Inclusive of all taxes</span>
            </div>

            {/* Key specs pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <span className="iconify text-amber-600" data-icon="lucide:scale" data-width="14" />, label: `${product.netWeight}.000 gm` },
                { icon: <span className="iconify text-amber-600" data-icon="lucide:gem" data-width="14" />, label: product.purity },
                { icon: <span className="iconify text-amber-600" data-icon="lucide:coins" data-width="14" />, label: product.metal },
                { icon: <span className="iconify text-amber-600" data-icon="lucide:tag" data-width="14" />, label: product.sku },
              ].map(spec => (
                <span key={spec.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-[13px] text-gray-700 font-medium shadow-sm">
                  {spec.icon}{spec.label}
                </span>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 py-2.5">Price Breakdown</p>
              <PriceRow label={`Gold Value (₹${product.goldRate.toLocaleString('en-IN')}/gm × ${product.netWeight}gm)`} value={`₹${goldValue.toLocaleString('en-IN')}`} />
              <PriceRow label="Making Charges" value={`₹${totalMaking.toLocaleString('en-IN')}`} />
              {product.stoneCharges > 0 && (
                <PriceRow label="Stone Charges" value={`₹${product.stoneCharges.toLocaleString('en-IN')}`} />
              )}
              <PriceRow label="GST (3%)" value={`₹${gst.toLocaleString('en-IN')}`} />
              <PriceRow label="Total Price" value={`₹${product.currentPrice.toLocaleString('en-IN')}`} accent />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {product.inStock ? (
                <>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addedToCart || isInCart}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200 shadow-sm
                      ${(addedToCart || isInCart)
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-[#8b5e2f] hover:bg-[#7a5129] text-white active:scale-[0.98]'
                      }`}
                  >
                    {(addedToCart || isInCart) ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWishlist}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-[15px] border transition-all duration-200
                      ${isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"
                      fill={isWishlisted ? '#ef4444' : 'none'}
                      stroke={isWishlisted ? '#ef4444' : 'currentColor'}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gray-100 text-gray-400 font-semibold text-[15px] cursor-not-allowed">
                  Currently Unavailable
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <span className="iconify text-amber-600" data-icon="lucide:shield-check" data-width="22" />, title: 'Hallmark Certified', sub: 'BIS certified purity' },
                { icon: <span className="iconify text-amber-600" data-icon="lucide:truck" data-width="22" />, title: 'Free Delivery', sub: 'On all orders' },
                { icon: <span className="iconify text-amber-600" data-icon="lucide:rotate-ccw" data-width="22" />, title: '7-Day Return', sub: 'Hassle-free returns' },
              ].map(badge => (
                <div key={badge.title} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <span className="mb-1">{badge.icon}</span>
                  <p className="text-[11px] font-semibold text-gray-800">{badge.title}</p>
                  <p className="text-[10px] text-gray-400">{badge.sub}</p>
                </div>
              ))}
            </div>

            {/* Product details accordion */}
            <details className="group rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-semibold text-gray-800 text-sm">
                Product Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="transition-transform duration-200 group-open:rotate-180">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="px-5 pb-5 space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    ['SKU', product.sku],
                    ['Metal', product.metal],
                    ['Purity', product.purity],
                    ['Net Weight', `${product.netWeight}.000 gm`],
                    ['Category', categoryName],
                    ['Gold Rate', `₹${product.goldRate.toLocaleString('en-IN')}/gm`],
                    ['Making Charges', `₹${product.makingCharges.toLocaleString('en-IN')}`],
                    ['Stone Charges', product.stoneCharges > 0 ? `₹${product.stoneCharges.toLocaleString('en-IN')}` : 'None'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                      <p className="text-[13px] font-medium text-gray-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </details>

            {/* Back button */}
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-700 transition-colors w-fit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Products
            </button>
          </div>
        </div>

        {/* ── Related Products ────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-600">Similar Pieces</p>
                <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
              </div>
              <Link href={`/products?category=${categoryName}`}
                className="text-sm font-medium text-amber-700 hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((rel, i) => (
                <motion.div key={rel.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}>
                  <RelatedCard product={rel} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-white
              ${toast.type === 'add' ? 'bg-amber-500' : toast.type === 'cart' ? 'bg-[#8b5e2f]' : 'bg-gray-700'}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={toast.type === 'add' ? 'white' : 'none'}
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {toast.type === 'cart'
                ? <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>
                : <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              }
            </svg>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}