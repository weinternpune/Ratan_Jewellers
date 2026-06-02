'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useWishlistStore, useCartStore } from '@/store'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  image?: string
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
  createdAt?: string
  category: string | { name: string }
}

const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Antique Polki Necklace',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1318/1779442888_0ac1f452c046c8b762b9.webp',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1318/1779442888_0ac1f452c046c8b762b9.webp'],
    metal: 'Gold', category: 'Necklaces', purity: '22K', currentPrice: 25000,
    slug: 'antique-polki-necklace', sku: 'RJ00001', netWeight: 12,
    goldRate: 6500, makingCharges: 2500, stoneCharges: 4000,
    avgRating: 4.5, reviewCount: 12, inStock: true, isFeatured: true, isTrending: false,
  },
  {
    id: 'p-2',
    name: 'Solitaire Diamond Ring',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/163/1779964423_381a85a123b25b6c31f9.jpg',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/163/1779964423_381a85a123b25b6c31f9.jpg'],
    metal: 'Diamond', category: 'Rings', purity: '18K', currentPrice: 45000,
    slug: 'solitaire-diamond-ring', sku: 'RJ00002', netWeight: 8,
    goldRate: 6500, makingCharges: 3000, stoneCharges: 12000,
    avgRating: 4.8, reviewCount: 20, inStock: true, isFeatured: true, isTrending: true,
  },
  {
    id: 'p-3',
    name: 'Temple Gold Bangles Set',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1861/1773828632_55ca5de31b3813b0bd63.png',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1861/1773828632_55ca5de31b3813b0bd63.png'],
    metal: 'Gold', category: 'Bangles', purity: '22K', currentPrice: 62000,
    slug: 'temple-gold-bangles', sku: 'RJ00003', netWeight: 18,
    goldRate: 6500, makingCharges: 5000, stoneCharges: 3000,
    avgRating: 4.6, reviewCount: 18, inStock: true, isFeatured: false, isTrending: true,
  },
  {
    id: 'p-4',
    name: 'Kundan Jhumka Earrings',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/262/1633616341_88273e27e4efdf6614fd.jpg',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/262/1633616341_88273e27e4efdf6614fd.jpg'],
    metal: 'Gold', category: 'Earrings', purity: '22K', currentPrice: 18000,
    slug: 'kundan-jhumka-earrings', sku: 'RJ00004', netWeight: 6,
    goldRate: 6500, makingCharges: 1800, stoneCharges: 2000,
    avgRating: 4.4, reviewCount: 10, inStock: true, isFeatured: false, isTrending: false,
  },
  {
    id: 'p-5',
    name: '22K Gold Chain',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/764/1780054045_2efbce9def7e01b07340.webp',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/764/1780054045_2efbce9def7e01b07340.webp'],
    metal: 'Gold', category: 'Chains', purity: '22K', currentPrice: 35000,
    slug: '22k-gold-chain', sku: 'RJ00005', netWeight: 10,
    goldRate: 6500, makingCharges: 2200, stoneCharges: 0,
    avgRating: 4.3, reviewCount: 14, inStock: true, isFeatured: false, isTrending: true,
  },
  {
    id: 'p-6',
    name: 'Silver Pendant',
    image: 'https://tiimg.tistatic.com/fp/1/006/590/fine-finished-brass-pooja-thali-023.jpg',
    images: ['https://tiimg.tistatic.com/fp/1/006/590/fine-finished-brass-pooja-thali-023.jpg'],
    metal: 'Silver', category: 'Pendants', purity: '24K', currentPrice: 12000,
    slug: 'silver-pendant', sku: 'RJ00006', netWeight: 5,
    goldRate: 6500, makingCharges: 1000, stoneCharges: 0,
    avgRating: 4.1, reviewCount: 8, inStock: true, isFeatured: false, isTrending: false,
  },
  {
    id: 'p-7',
    name: 'Ruby Mangalsutra',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1164/1662631757_9cbff375c83181ab33e4.png',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1164/1662631757_9cbff375c83181ab33e4.png'],
    metal: 'Gold', category: 'Mangalsutras', purity: '22K', currentPrice: 42000,
    slug: 'ruby-mangalsutra', sku: 'RJ00007', netWeight: 11,
    goldRate: 6500, makingCharges: 3000, stoneCharges: 5000,
    avgRating: 4.7, reviewCount: 22, inStock: true, isFeatured: true, isTrending: true,
  },
  {
    id: 'p-8',
    name: 'Diamond Tennis Bracelet',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/923/1779455699_aabe91f5b170208f7270.webp',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/923/1779455699_aabe91f5b170208f7270.webp'],
    metal: 'Diamond', category: 'Bracelets', purity: '18K', currentPrice: 78000,
    slug: 'diamond-tennis-bracelet', sku: 'RJ00008', netWeight: 9,
    goldRate: 6500, makingCharges: 4000, stoneCharges: 20000,
    avgRating: 4.9, reviewCount: 35, inStock: false, isFeatured: true, isTrending: true,
  },
  {
    id: 'p-9',
    name: 'Open Cuff Gold Bracelet',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1704/1780137941_828a35a21f49303c9344.webp',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1704/1780137941_828a35a21f49303c9344.webp'],
    metal: 'Gold', category: 'Bracelets', purity: '22K', currentPrice: 39000,
    slug: 'open-cuff-gold-bracelet', sku: 'RJ00009', netWeight: 9,
    goldRate: 6500, makingCharges: 2600, stoneCharges: 0,
    avgRating: 4.2, reviewCount: 11, inStock: true, isFeatured: false, isTrending: false,
  },
  {
    id: 'p-10',
    name: 'Mangalsutra Pendant Chain',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1404/1780053072_2e61ea8ef659a5e4db1f.webp',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1404/1780053072_2e61ea8ef659a5e4db1f.webp'],
    metal: 'Gold', category: 'Chains', purity: '22K', currentPrice: 31000,
    slug: 'mangalsutra-pendant-chain', sku: 'RJ00010', netWeight: 8,
    goldRate: 6500, makingCharges: 2400, stoneCharges: 3000,
    avgRating: 4.4, reviewCount: 15, inStock: true, isFeatured: false, isTrending: true,
  },
  {
    id: 'p-11',
    name: 'Minimal Diamond Ring',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1757/1771847373_3c37a3448b16a50f89c1.jpg',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1757/1771847373_3c37a3448b16a50f89c1.jpg'],
    metal: 'Diamond', category: 'Rings', purity: '18K', currentPrice: 28000,
    slug: 'minimal-diamond-ring', sku: 'RJ00011', netWeight: 5,
    goldRate: 6500, makingCharges: 2000, stoneCharges: 9000,
    avgRating: 4.5, reviewCount: 16, inStock: true, isFeatured: false, isTrending: true,
  },
  {
    id: 'p-12',
    name: 'American Diamond Necklace Set',
    image: 'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1983/1768634238_4b1b4642e14350311882.jpg',
    images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1983/1768634238_4b1b4642e14350311882.jpg'],
    metal: 'Diamond', category: 'Necklaces', purity: '18K', currentPrice: 54000,
    slug: 'american-diamond-necklace-set', sku: 'RJ00012', netWeight: 14,
    goldRate: 6500, makingCharges: 4500, stoneCharges: 15000,
    avgRating: 4.8, reviewCount: 28, inStock: true, isFeatured: true, isTrending: true,
  },
]

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

  const handleWishlist = () => {
    const isWishlisted = items.some(i => i.productId === product.id)
    toggleItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.image || (product.images && product.images[0]) || '',
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

  const categoryName =
    typeof product.category === 'string' ? product.category : product.category?.name || ''

  const subtitle = `${product.purity} ${product.metal}${
    product.stoneCharges > 0 ? ` & ${categoryName}` : ''
  }`

  const formattedPrice = `₹${product.currentPrice.toLocaleString('en-IN')}`
  const weight = `${product.netWeight}.000 gm`

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
      {/* Image wrapper — square aspect */}
      <div className="relative w-full aspect-square overflow-hidden bg-[#f5f0eb]">
        <img
          src={product.image || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x400/f5f0eb/c9a96e?text=Jewellery'
          }}
        />

        {/* Badges top-left */}
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

        {/* Wishlist button top-right */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all duration-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"}
            stroke={wishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-2">
        {/* Name */}
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-1">
          {product.name}
        </h3>

        {/* Subtitle: purity + metal */}
        <p className="text-[12px] text-gray-400 leading-none">{subtitle}</p>

        {/* Price + Rating */}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[16px] font-bold text-gray-900">{formattedPrice}</span>
          <span className="flex items-center gap-1 text-[12px] text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="font-medium text-gray-700">{product.avgRating.toFixed(1)}</span>
            <span className="text-gray-400">({product.reviewCount})</span>
          </span>
        </div>

        {/* Weight + Add / Sold Out button */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[12px] text-gray-400">{weight}</span>

          {product.inStock ? (
            <button
              type="button"
              onClick={() => addToCart({
                id: `cart-${product.id}`,
                productId: product.id,
                name: product.name,
                sku: product.sku,
                image: product.image || (product.images && product.images[0]) || '',
                purity: product.purity,
                weight: product.netWeight,
                price: product.currentPrice,
                quantity: 1,
              })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f5ede0] hover:bg-[#edd9bf] text-[#8b5e2f] text-[12px] font-semibold transition-colors duration-200"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-[12px] font-semibold cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
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
  const searchParams = useSearchParams()

  const showToast = useCallback((message: string, type: 'add' | 'remove') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const normalizeFilterValue = (value: string, options: string[]) => {
    const normalized = value?.toLowerCase().trim()
    return options.find(option => option.toLowerCase() === normalized) ?? ''
  }

  useEffect(() => {
    const categoryParam = searchParams?.get('category') ?? ''
    const metalParam = searchParams?.get('metal') ?? ''
    const purityParam = searchParams?.get('purity') ?? ''

    const metalFilter =
      normalizeFilterValue(categoryParam, METALS) ||
      normalizeFilterValue(metalParam, METALS)
    const categoryFilter = normalizeFilterValue(categoryParam, CATEGORIES)
    const purityFilter = normalizeFilterValue(purityParam, PURITIES)

    // eslint-disable-next-line
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
    ...selectedMetal,
    ...selectedPurity,
    ...selectedCategory,
    ...(priceRange.label !== 'All' ? ['price'] : []),
  ].length

  const { data, isLoading } = useQuery({
    queryKey: ['products', selectedMetal, selectedPurity, selectedCategory, sortBy],
    queryFn: () =>
      api.get<{ products: Product[] }>('/products', {
        metal: selectedMetal.join(',') || undefined,
        purity: selectedPurity.join(',') || undefined,
        category: selectedCategory.join(',') || undefined,
        sortBy,
      }),
    retry: false,
  })

  const apiProducts = data?.products || []
  const products = apiProducts.length ? apiProducts : PRODUCTS

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product: Product) => {
      const productCategory =
        typeof product.category === 'string' ? product.category : product.category?.name || ''
      const metalMatch = selectedMetal.length === 0 || selectedMetal.includes(product.metal)
      const categoryMatch = selectedCategory.length === 0 || selectedCategory.includes(productCategory)
      const purityMatch = selectedPurity.length === 0 || selectedPurity.includes(product.purity)
      const priceMatch =
        priceRange.label === 'All' ||
        (product.currentPrice >= priceRange.min && product.currentPrice <= priceRange.max)
      return metalMatch && categoryMatch && purityMatch && priceMatch
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.currentPrice - b.currentPrice
      if (sortBy === 'priceDesc') return b.currentPrice - a.currentPrice
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
  }, [products, selectedMetal, selectedCategory, selectedPurity, priceRange, sortBy])

  // ─── Filter Panel ────────────────────────────────────────────────────────────
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

      {/* Metal */}
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

      {/* Category */}
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

      {/* Purity */}
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.18em] text-gray-400 mb-3 uppercase font-semibold">Purity</p>
        <div className="flex flex-wrap gap-2">
          {PURITIES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => toggle(selectedPurity, p, setSelectedPurity)}
              className={`px-3.5 py-1.5 rounded-full border text-sm font-medium transition ${
                selectedPurity.includes(p)
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.18em] text-gray-400 mb-3 uppercase font-semibold">Price Range</p>
        <div className="space-y-2">
          {PRICE_RANGES.map(range => (
            <button
              key={range.label}
              type="button"
              onClick={() => setPriceRange(range)}
              className={`w-full rounded-2xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                priceRange.label === range.label
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-amber-200'
              }`}
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

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="py-8 lg:py-12 bg-[#f8f6f3]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <main className="space-y-6">

          {/* Top bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-amber-300 hover:bg-amber-50 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="10" y1="18" x2="14" y2="18" />
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
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <ProductCard product={product} onWishlistToggle={showToast} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 sm:col-span-3 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
                No products match selected filters.
              </div>
            )}
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

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
              toast.type === 'add' ? 'bg-amber-500' : 'bg-gray-700'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={toast.type === 'add' ? 'white' : 'none'}
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {toast.message}
          </div>
        ))}
      </div>
    </section>
  )
}