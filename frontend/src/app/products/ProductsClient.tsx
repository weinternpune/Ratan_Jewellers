'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { api } from '@/lib/api'

const IMAGES = [
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1318/1779442888_0ac1f452c046c8b762b9.webp',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/163/1779964423_381a85a123b25b6c31f9.jpg',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1861/1773828632_55ca5de31b3813b0bd63.png',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/262/1633616341_88273e27e4efdf6614fd.jpg',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/764/1780054045_2efbce9def7e01b07340.webp',
  'https://tiimg.tistatic.com/fp/1/006/590/fine-finished-brass-pooja-thali-023.jpg',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1164/1662631757_9cbff375c83181ab33e4.png',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/923/1779455699_aabe91f5b170208f7270.webp',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1704/1780137941_828a35a21f49303c9344.webp',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1404/1780053072_2e61ea8ef659a5e4db1f.webp',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1757/1771847373_3c37a3448b16a50f89c1.jpg',
  'https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1983/1768634238_4b1b4642e14350311882.jpg',
]

const mockProducts = Array.from({ length: 24 }, (_, i) => ({
  id: `p-${i}`,
  name: [
    'Antique Polki Necklace','Solitaire Diamond Ring','Temple Gold Bangles Set',
    'Kundan Jhumka Earrings','22K Gold Chain','Emerald Pendant',
    'Ruby Mangalsutra','Diamond Tennis Bracelet','Lakshmi Coin Pendant',
    'Chand Bali Earrings','Meenakari Choker','Pave Diamond Band',
    'South Indian Bridal Set','Cocktail Statement Ring','Gold Kada Bangle',
    'Floral Diamond Earrings','Temple Necklace Set','Men Gold Chain',
    'Pearl Drop Earrings','Ruby Finger Ring','Three Layer Necklace',
    'Princess Cut Ring','Ghungroo Bangle','Bridal Maang Tikka',
  ][i] || 'Jewellery',
  slug: `product-${i}`,
  sku: `RJ${String(i + 1).padStart(5, '0')}`,
  images: [IMAGES[i % 12]],
  metal: ['Gold', 'Gold & Diamond', 'Gold & Emerald', 'Gold & Ruby'][i % 4],
  purity: ['22K', '18K', '24K', '14K'][i % 4],
  netWeight: 4 + (i * 1.7) % 20,
  currentPrice: 15000 + (i * 8700) % 180000,
  goldRate: 6500,
  makingCharges: 1500 + (i * 200) % 5000,
  stoneCharges: i % 3 === 0 ? 0 : 3000 + (i * 1200) % 20000,
  avgRating: 3.8 + (i % 12) * 0.1,
  reviewCount: 5 + (i * 7) % 80,
  inStock: i % 7 !== 0,
  isFeatured: i < 3,
  isTrending: i % 4 === 0,
  category: {
    name: ['Necklaces','Rings','Bangles','Earrings','Chains','Pendants','Bracelets','Mangalsutras'][i % 8],
  },
}))

const METALS = ['Gold', 'Gold & Diamond', 'Silver', 'Platinum']
const PURITIES = ['24K', '22K', '18K', '14K']

export default function ProductsClient() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedMetal, setSelectedMetal] = useState<string[]>([])
  const [selectedPurity, setSelectedPurity] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('createdAt')

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const activeFilters = [...selectedMetal, ...selectedPurity].length

  const { data, isLoading } = useQuery({
    queryKey: ['products', selectedMetal, selectedPurity, sortBy],
    queryFn: () =>
      api.get<any>('/products', {
        metal: selectedMetal.join(',') || undefined,
        purity: selectedPurity.join(',') || undefined,
        sortBy,
      }),
    retry: false,
  })

  const products = (data as any)?.products?.length
    ? (data as any).products
    : mockProducts

  // ── Filter panel content (shared between sidebar & bottom sheet) ────────
  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base text-charcoal">Filters</h3>
        {activeFilters > 0 && (
          <button
            onClick={() => { setSelectedMetal([]); setSelectedPurity([]) }}
            className="text-xs text-gold hover:text-gold-dark transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Metal */}
      <div>
        <h4 className="text-xs font-medium text-charcoal uppercase tracking-wider mb-3">Metal</h4>
        <div className="space-y-2">
          {METALS.map(m => (
            <label key={m} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedMetal.includes(m)}
                onChange={() => toggle(selectedMetal, m, setSelectedMetal)}
                className="w-4 h-4 accent-[#C9A84C]"
              />
              <span className="text-sm text-warm-grey group-hover:text-charcoal transition-colors">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="gold-line" />

      {/* Purity */}
      <div>
        <h4 className="text-xs font-medium text-charcoal uppercase tracking-wider mb-3">Purity</h4>
        <div className="flex flex-wrap gap-2">
          {PURITIES.map(p => (
            <button
              key={p}
              onClick={() => toggle(selectedPurity, p, setSelectedPurity)}
              className={`px-3 py-1.5 rounded text-xs font-mono-code transition-all ${
                selectedPurity.includes(p)
                  ? 'bg-gold text-obsidian'
                  : 'border border-gold/20 text-warm-grey hover:border-gold hover:text-gold'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gold/10 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="font-mono-code text-xs text-gold tracking-wider uppercase mb-1 sm:mb-2">Explore</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-charcoal">All Collections</h1>
          <p className="text-warm-grey text-sm mt-1 sm:mt-2">{products.length} exquisite pieces</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* ── Filter + Sort bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border text-sm transition-all ${
              filtersOpen || activeFilters > 0
                ? 'border-gold bg-gold/5 text-gold'
                : 'border-gold/20 text-warm-grey hover:border-gold hover:text-gold'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilters > 0 && (
              <span className="bg-gold text-obsidian text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-grey hidden sm:block">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-gold/20 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-charcoal outline-none focus:border-gold bg-white"
            >
              <option value="createdAt">Newest First</option>
              <option value="currentPrice">Price: Low to High</option>
              <option value="-currentPrice">Price: High to Low</option>
              <option value="avgRating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ── Desktop layout: sidebar + grid ───────────────────────────── */}
        <div className="flex gap-5 sm:gap-6">

          {/* Sidebar — hidden on mobile, shown md+ */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 220 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25 }}
                className="hidden md:block flex-shrink-0 overflow-hidden"
              >
                <div className="w-[220px] bg-white rounded-xl border border-gold/10 shadow-luxury p-5">
                  <FilterContent />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                    <div className="skeleton aspect-square" />
                    <div className="p-3 space-y-2">
                      <div className="skeleton h-3 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {products.map((product: any, i: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter bottom sheet (md and below only) ────────────── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />

            {/* Bottom sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl px-5 pt-4 pb-8 max-h-[80vh] overflow-y-auto"
            >
              {/* Handle bar */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

              {/* Close button */}
              <button
                onClick={() => setFiltersOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={15} />
              </button>

              <FilterContent />

              {/* Apply button */}
              <button
                onClick={() => setFiltersOpen(false)}
                className="mt-6 w-full bg-gold text-white py-3 rounded-xl text-sm font-semibold tracking-wide hover:bg-gold/90 transition-colors"
              >
                Apply Filters {activeFilters > 0 && `(${activeFilters})`}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}