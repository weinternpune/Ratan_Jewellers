'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useWishlistStore, useCartStore } from '@/store'
import { useSearchParams } from 'next/navigation'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PRODUCTS } from '@/assets/products'



// ─── Product type (from backend) ─────────────────────────────────────────────
interface Product {
  id: string; _id?: string; name: string; slug: string; sku: string
  image?: string; images: string[]; metal: string; purity: string
  netWeight: number; currentPrice: number; goldRate?: number
  makingCharges?: number; stoneCharges: number; avgRating: number
  reviewCount: number; inStock: boolean; isFeatured?: boolean
  isTrending?: boolean; category: string | { name: string }; createdAt?: string
}



const normalizeFilterValue = (param: string | null | undefined, list: string[]): string => {
  if (!param) return ''
  const m = list.find((i: string) => i.toLowerCase() === param.toLowerCase())
  return m || ''
}
const METALS = ['Gold', 'Diamond', 'Silver']
const PURITIES = ['24K', '22K', '18K', '14K']
const CATEGORIES = [
  'Necklaces', 'Rings', 'Bangles', 'Earrings',
  'Chains', 'Pendants', 'Bracelets', 'Mangalsutras',
]
const PRICE_RANGES = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under ₹25K', min: 0, max: 25000 },
  { label: '₹25K - ₹50K', min: 25000, max: 50000 },
  { label: '₹50K - ₹75K', min: 50000, max: 75000 },
  { label: '₹75K+', min: 75000, max: Number.MAX_SAFE_INTEGER },
]

// ─── Inline ProductCard ────────────────────────────────────────────────────────
function ProductCard({ product, onWishlistToggle }: {
  product: Product
  onWishlistToggle: (message: string, type: 'add' | 'remove') => void
}) {
  const { items, toggleItem } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()

  const wishlisted = items.some(i => i.productId === product.id)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isWishlisted = items.some(i => i.productId === product.id)
    toggleItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.image || product.images?.[0] || '',
      metal: product.metal,
      purity: product.purity,
      category: typeof product.category === 'string' ? product.category : product.category?.name || '',
      currentPrice: product.currentPrice,
      addedAt: new Date().toISOString(),
    })
    onWishlistToggle(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      isWishlisted ? 'remove' : 'add'
    )
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: `cart-${product.id}`,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.image || product.images?.[0] || '',
      purity: product.purity,
      weight: product.netWeight,
      price: product.currentPrice,
      quantity: 1,
    })
  }

  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || ''
  const subtitle = `${product.purity} ${product.metal}${product.stoneCharges > 0 ? ` · ${categoryName}` : ''}`

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#f5f0eb]">
        <img
          src={product.image || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f5f0eb/c9a96e?text=Jewellery'
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isTrending && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-gray-800 text-white">
              Trending
            </span>
          )}
          {!product.inStock && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-600 text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-200"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill={wishlisted ? '#ef4444' : 'none'}
            stroke={wishlisted ? '#ef4444' : 'currentColor'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-gray-500"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-[12px] text-gray-400 leading-none">{subtitle}</p>

        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[16px] font-bold text-gray-900">
            ₹{product.currentPrice.toLocaleString('en-IN')}
          </span>
          <span className="flex items-center gap-1 text-[12px] text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="font-medium text-gray-700">{product.avgRating.toFixed(1)}</span>
            <span className="text-gray-400">({product.reviewCount})</span>
          </span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-[12px] text-gray-400">{product.netWeight}.000 gm</span>
          {product.inStock ? (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f5ede0] hover:bg-[#edd9bf] text-[#8b5e2f] text-[12px] font-semibold transition-colors duration-200"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add
            </button>
          ) : (
            <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-[12px] font-semibold cursor-not-allowed">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="w-full aspect-square bg-gray-200" />
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        <div className="h-3.5 rounded-full bg-gray-200 w-4/5" />
        <div className="h-3 rounded-full bg-gray-200 w-1/2" />
        <div className="flex justify-between items-center">
          <div className="h-4 rounded-full bg-gray-200 w-1/3" />
          <div className="h-3 rounded-full bg-gray-200 w-1/4" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 rounded-full bg-gray-200 w-1/4" />
          <div className="h-8 rounded-lg bg-gray-200 w-16" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductsClient() {
  const [selectedMetal, setSelectedMetal] = useState<string[]>([])
  const [selectedPurity, setSelectedPurity] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0])
  const [sortBy, setSortBy] = useState('createdAt')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'add' | 'remove' }[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()

  const showToast = useCallback(
  (message: string, type: 'add' | 'remove') => {
    const id = Date.now()

    setToasts(prev => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  },
  []
)
  useEffect(() => {
    const searchParam   = searchParams.get('search')
    const categoryParam = searchParams.get('category')
    const metalParam    = searchParams.get('metal')
    const purityParam   = searchParams.get('purity')
    if (searchParam) setSearchQuery(searchParam)
    else if (categoryParam) setSearchQuery(categoryParam)

    const metalFilter = normalizeFilterValue(categoryParam, METALS) || normalizeFilterValue(metalParam, METALS)
    const categoryFilter = normalizeFilterValue(categoryParam, CATEGORIES)
    const purityFilter = normalizeFilterValue(purityParam, PURITIES)

    setSelectedMetal(prev => {
      const normalizedPrev = prev.join(',').toLowerCase()
      return metalFilter && normalizedPrev !== metalFilter ? [metalFilter] : prev
    })
    setSelectedCategory(prev => {
      const normalizedPrev = prev.join(',').toLowerCase()
      return categoryFilter && normalizedPrev !== categoryFilter ? [categoryFilter] : prev
    })
    setSelectedPurity(prev => {
      const normalizedPrev = prev.join(',').toLowerCase()
      return purityFilter && normalizedPrev !== purityFilter ? [purityFilter] : prev
    })
  }, [searchParams])

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const activeFilters = [
    ...selectedMetal, ...selectedPurity, ...selectedCategory,
    ...(priceRange.label !== 'All' ? ['price'] : []),
  ].length

const isLoading = false

const products: Product[] = PRODUCTS

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const filtered = products.filter((product: Product) => {
      const productCategory =
        typeof product.category === 'string' ? product.category : product.category?.name || ''

      // Search query: match name, category, metal, purity, sku, description
      const searchMatch = !q || [
        product.name,
        productCategory,
        product.metal,
        product.purity,
        product.sku,
        (product as any).description || '',
        (product as any).keywords || '',
      ].some(field => field?.toLowerCase().includes(q))

      // Filters — if search query set, relax metal/category filters to let search drive
      const metalMatch = q
        ? true
        : selectedMetal.length === 0 || selectedMetal.some(m =>
            product.metal?.toLowerCase().includes(m.toLowerCase())
          )
      const categoryMatch = q
        ? true
        : selectedCategory.length === 0 || selectedCategory.some(c =>
            productCategory.toLowerCase().includes(c.toLowerCase())
          )
      const purityMatch = selectedPurity.length === 0 || selectedPurity.some(p =>
        product.purity?.toLowerCase().includes(p.toLowerCase())
      )
      const priceMatch =
        priceRange.label === 'All' ||
        (product.currentPrice >= priceRange.min && product.currentPrice <= priceRange.max)

      return searchMatch && metalMatch && categoryMatch && purityMatch && priceMatch
    })
    return [...filtered].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.currentPrice - b.currentPrice
      if (sortBy === 'priceDesc') return b.currentPrice - a.currentPrice
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
  }, [products, selectedMetal, selectedCategory, selectedPurity, priceRange, sortBy])

  const FilterPanel = (
    <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400">Refine</p>
          <h4 className="text-lg font-semibold tracking-tight text-gray-900">Filter products</h4>
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(false)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      <div className="mb-5">
        <p className="text-[10px] tracking-[0.18em] text-gray-400 mb-3 uppercase font-semibold">Metal</p>
        <div className="space-y-2.5">
          {METALS.map(m => (
            <label key={m} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMetal.includes(m)}
                onChange={() => toggle(selectedMetal, m, setSelectedMetal)}
                className="w-4 h-4 rounded border-gray-300 accent-amber-600"
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[10px] tracking-[0.18em] text-gray-400 mb-3 uppercase font-semibold">Category</p>
        <div className="space-y-2.5">
          {CATEGORIES.map(c => (
            <label key={c} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategory.includes(c)}
                onChange={() => toggle(selectedCategory, c, setSelectedCategory)}
                className="w-4 h-4 rounded border-gray-300 accent-amber-600"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[10px] tracking-[0.18em] text-gray-400 mb-3 uppercase font-semibold">Purity</p>
        <div className="flex flex-wrap gap-2">
          {PURITIES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => toggle(selectedPurity, p, setSelectedPurity)}
              className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition ${selectedPurity.includes(p) ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[10px] tracking-[0.18em] text-gray-400 mb-3 uppercase font-semibold">Price Range</p>
        <div className="space-y-2">
          {PRICE_RANGES.map(range => (
            <button
              key={range.label}
              type="button"
              onClick={() => setPriceRange(range)}
              className={`w-full rounded-2xl border px-4 py-2.5 text-left text-sm font-medium transition ${priceRange.label === range.label ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200'}`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => {
            setSelectedMetal([])
            setSelectedCategory([])
            setSelectedPurity([])
            setPriceRange(PRICE_RANGES[0])
          }}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          Clear all
        </button>
        <span className="text-sm text-gray-400">{activeFilters} active</span>
      </div>
    </div>
  )

  return (
    <section className="py-8 lg:py-12 bg-[#f8f6f3]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <main className="space-y-6">


          {/* Search bar — shows active query */}
          {searchQuery && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span className="text-sm text-amber-800">Results for <strong>"{searchQuery}"</strong></span>
              <button onClick={() => setSearchQuery('')} className="ml-auto text-amber-600 hover:text-amber-900 text-xs font-semibold">Clear search</button>
            </div>
          )}

          {/* Top bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-amber-300 hover:bg-amber-50 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                Filters
                {activeFilters > 0 && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {activeFilters}
                  </span>
                )}
              </button>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filteredProducts.length}</span> curated jewellery pieces
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 shadow-sm w-fit">
              <span className="text-gray-400">Sort by</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
              >
                <option value="createdAt">Newest First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredProducts.length > 0
                ? filteredProducts.map((product: Product, index: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.3 }}
                  >
                    <ProductCard product={product} onWishlistToggle={showToast} />
                  </motion.div>
                ))
                : (
                  <div className="col-span-2 sm:col-span-3 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
                    <div className="text-4xl mb-3">💎</div>
                    <div className="font-semibold text-gray-700 mb-1">{searchQuery ? `No products found for "${searchQuery}"` : 'No products match selected filters.'}</div>
                    <div className="text-sm text-gray-400">{searchQuery ? 'Try a different search term or browse all products' : 'Try clearing some filters'}</div>
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="mt-3 text-sm text-amber-600 hover:underline font-medium">Clear search</button>}
                  </div>
                )
            }
          </div>

          {/* Mobile Filter Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-8">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.22 }}
                className="w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5"
              >
                <div className="max-h-[calc(100vh-80px)] overflow-y-auto">
                  {FilterPanel}
                </div>
              </motion.div>
            </div>
          )}
        </main>
      </div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${toast.type === 'add' ? 'bg-amber-500' : 'bg-gray-700'}`}
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24"
              fill={toast.type === 'add' ? 'white' : 'none'}
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  )
}