'use client'

import { useWishlistStore, type WishlistItem } from '@/store'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store'

export default function Wishlist() {
  const { items, removeItem, toggleItem } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()

  const handleRemove = (productId: string) => {
    removeItem(productId)
  }

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: `cart-${item.productId}`,
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      image: item.image,
      purity: item.purity,
      weight: 0,
      price: item.currentPrice,
      quantity: 1,
    })
  }

  const handleToggleWishlist = (item: WishlistItem) => {
    toggleItem(item)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">My Wishlist</h1>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-6">Your wishlist is empty</p>
            <Link
              href="/products"
              className="inline-block rounded-lg bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item: WishlistItem) => (
            <div
              key={item.productId}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-lg transition-shadow"
            >
              {/* Image Container */}
              <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100 aspect-square">
                <Image
                  src={item.image || '/images/placeholder.png'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <button
                  onClick={() => handleToggleWishlist(item)}
                  className="absolute top-2 right-2 rounded-full bg-white p-2 shadow-md hover:bg-gray-100 transition"
                  title="Remove from wishlist"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {item.metal}
                  </span>
                  <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    {item.purity}
                  </span>
                </div>
                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-lg font-bold text-amber-600">₹{item.currentPrice.toLocaleString()}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </button>
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50 transition"
                  title="Delete from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
