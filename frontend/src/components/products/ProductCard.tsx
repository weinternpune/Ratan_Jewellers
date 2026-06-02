'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  images: string[]
  metal: string
  purity: string
  netWeight: number
  currentPrice: number
  goldRate: number
  makingCharges: number
  stoneCharges: number
  avgRating: number
  reviewCount: number
  inStock: boolean
  isFeatured?: boolean
  isTrending?: boolean
  category?: { name: string }
}

export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const addItem = useCartStore(s => s.addItem)
  const toggleCart = useCartStore(s => s.toggleCart)

  // ── All handlers unchanged ──────────────────────────────────────────────
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.images[0] || '/placeholder-jewel.jpg',
      purity: product.purity,
      weight: product.netWeight,
      price: product.currentPrice,
      quantity: 1,
    })
    toast.success(`${product.name} added to cart`)
    toggleCart()
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const filledStars = Math.round(product.avgRating)

  return (
    <div className="group relative flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow duration-300">

      {/* ── Image area ───────────────────────────────────────────────────── */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-[#1a1a1a]">

        {product.images.length > 0 ? (
          <Image
            src={product.images[imgIdx] || '/placeholder-jewel.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,16.6vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
            <span className="text-4xl text-[#C8A45D]/30">✦</span>
          </div>
        )}

        {/* Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isTrending && (
            <span className="bg-[#1a1a1a] text-[#C8A45D] text-[9px] tracking-widest px-1.5 py-0.5 rounded font-medium uppercase">
              Trending
            </span>
          )}
          {!product.inStock && (
            <span className="bg-red-900/80 text-red-200 text-[9px] tracking-widest px-1.5 py-0.5 rounded font-medium uppercase">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist heart — top right, always visible */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart
            size={13}
            fill={isWishlisted ? '#e53e3e' : 'none'}
            stroke={isWishlisted ? '#e53e3e' : '#555'}
            strokeWidth={1.8}
          />
        </button>

        {/* Multi-image dots */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {product.images.slice(0, 4).map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setImgIdx(i)}
                onClick={e => { e.preventDefault(); setImgIdx(i) }}
                className={`h-1 rounded-full transition-all duration-200 ${
                  i === imgIdx ? 'w-3 bg-[#C8A45D]' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </Link>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-3 pt-3 pb-3">

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-1 hover:text-[#C8A45D] transition-colors mb-0.5">
            {product.name}
          </h3>
        </Link>

        {/* Purity */}
        <p className="text-[11px] text-gray-400 mb-2 tracking-wide">
          {product.purity} {product.metal}
        </p>

        {/* Price + Rating row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-bold text-gray-900 tracking-tight">
            ₹{product.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>

          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star size={11} fill="#C8A45D" stroke="#C8A45D" strokeWidth={1} />
              <span className="text-[11px] text-gray-500 font-medium">
                {product.avgRating.toFixed(1)}
              </span>
              <span className="text-[11px] text-gray-400">
                ({product.reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-2" />

        {/* Weight + Add to cart */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {product.netWeight.toFixed(3)} gm
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold tracking-wide transition-all duration-200 ${
              product.inStock
                ? 'bg-[#C8A45D] text-white hover:bg-[#b8944d] active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={11} />
            <span>{product.inStock ? 'Add' : 'Sold Out'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}