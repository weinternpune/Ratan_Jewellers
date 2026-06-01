'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import { useCartStore } from '@/store'
import toast from 'react-hot-toast'
export interface Product { id: string; name: string; slug: string; sku: string; images: string[]; metal: string; purity: string; netWeight: number; currentPrice: number; goldRate: number; makingCharges: number; stoneCharges: number; avgRating: number; reviewCount: number; inStock: boolean; isFeatured?: boolean; isTrending?: boolean; category?: { name: string } }
export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)
  const addItem = useCartStore(s => s.addItem)
  const toggleCart = useCartStore(s => s.toggleCart)
  const handleAddToCart = (e: React.MouseEvent) => { e.preventDefault(); addItem({ id: `${product.id}-${Date.now()}`, productId: product.id, name: product.name, sku: product.sku, image: product.images[0] || '/placeholder-jewel.jpg', purity: product.purity, weight: product.netWeight, price: product.currentPrice, quantity: 1 }); toast.success(`${product.name} added to cart`); toggleCart() }
  const handleWishlist = (e: React.MouseEvent) => { e.preventDefault(); setIsWishlisted(!isWishlisted); toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist') }
  return (
    <div className="product-card luxury-card rounded-xl overflow-hidden group relative">
      <div className="relative aspect-square overflow-hidden bg-ivory">
        <Link href={`/products/${product.slug}`}>
          <div className="product-card-img w-full h-full">
            {product.images.length > 0 ? <Image src={product.images[imgIdx] || '/placeholder-jewel.jpg'} alt={product.name} fill className="object-cover" sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" /> : <div className="w-full h-full bg-gradient-to-br from-champagne to-ivory flex items-center justify-center"><span className="font-display text-4xl text-gold/30">✦</span></div>}
          </div>
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isTrending && <span className="bg-obsidian text-gold text-[10px] font-mono-code px-2 py-0.5 rounded tracking-wider">TRENDING</span>}
          {product.isFeatured && <span className="bg-gold text-obsidian text-[10px] font-mono-code px-2 py-0.5 rounded tracking-wider">FEATURED</span>}
          {!product.inStock && <span className="bg-red-900/80 text-red-200 text-[10px] font-mono-code px-2 py-0.5 rounded">SOLD OUT</span>}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button onClick={handleWishlist} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gold hover:text-white transition-all"><Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-red-500' : 'text-charcoal'} /></button>
          <Link href={`/products/${product.slug}`} className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gold hover:text-white transition-all"><Eye size={14} className="text-charcoal" /></Link>
        </div>
        {product.images.length > 1 && <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">{product.images.slice(0,4).map((_,i) => <button key={i} onMouseEnter={() => setImgIdx(i)} onClick={(e) => { e.preventDefault(); setImgIdx(i) }} className={`w-1.5 h-1.5 rounded-full transition-all ${i===imgIdx?'bg-gold w-3':'bg-white/60'}`} />)}</div>}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5"><span className="text-xs text-warm-grey">{product.category?.name}</span><span className="purity-badge">{product.purity}</span></div>
        <Link href={`/products/${product.slug}`}><h3 className="font-display text-base font-medium text-charcoal hover:text-gold transition-colors line-clamp-2 leading-snug mb-1">{product.name}</h3></Link>
        <p className="text-xs text-warm-grey mb-2">{product.netWeight}g · {product.metal}</p>
        {product.reviewCount > 0 && <div className="flex items-center gap-1 mb-2.5"><div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s<=Math.round(product.avgRating)?'#C9A84C':'none'} stroke="#C9A84C" />)}</div><span className="text-[10px] text-warm-grey">({product.reviewCount})</span></div>}
        <div className="flex items-end justify-between gap-2 mt-3">
          <div><div className="font-display text-lg font-semibold text-charcoal">₹{product.currentPrice.toLocaleString('en-IN',{maximumFractionDigits:0})}</div><div className="text-[10px] text-warm-grey font-mono-code">Gold ₹{product.goldRate}/g</div></div>
          <button onClick={handleAddToCart} disabled={!product.inStock} className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all ${product.inStock?'btn-gold':'bg-gray-100 text-gray-400 cursor-not-allowed'}`}><ShoppingBag size={13} /><span className="hidden sm:inline">{product.inStock?'Add':'Sold Out'}</span></button>
        </div>
      </div>
    </div>
  )
}
