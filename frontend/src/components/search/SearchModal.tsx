
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ArrowRight, Clock, TrendingUp, ChevronRight, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTS, Product } from '@/lib/products'

import {
  Gem,
  Sparkles,
  Link,
  Heart,
  Circle,
  Diamond
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEBOUNCE_DELAY = 300
const MAX_RESULTS = 6
const MAX_RECENT = 5
const RECENT_KEY = 'rj_recent_searches'

const quickSearches = [
  {
    label: 'Gold Necklaces',
    link: '/products?category=necklaces&metal=gold',
    icon: Gem,
  },
 {
  label: 'Diamond Rings',
  link: '/products?category=rings&metal=diamond',
  icon: Diamond,
},
  {
    label: 'Silver Earrings',
    link: '/products?category=earrings&metal=silver',
    icon: Sparkles,
  },
  {
    label: 'Gold Chains',
    link: '/products?category=chains&metal=gold',
    icon: Link,
  },
  {
    label: 'Mangalsutras',
    link: '/products?category=mangalsutras',
    icon: Heart,
  },
  {
    label: 'Bracelets',
    link: '/products?category=bracelets',
    icon: Circle,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${escapeRegex(query.trim())})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#C9A84C]/20 text-[#8B6914] font-semibold rounded-sm px-0.5">{part}</mark>
      : part
  )
}

function getCategory(p: Product): string {
  if (typeof p.category === 'string') return p.category
  return p.category?.name ?? ''
}

function searchProducts(query: string): Product[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()
  const words = q.split(/\s+/)

  return PRODUCTS
    .map(p => {
      const fields = [
        p.name.toLowerCase(),
        getCategory(p).toLowerCase(),
        p.metal.toLowerCase(),
        p.purity.toLowerCase(),
        p.sku.toLowerCase(),
      ]
      const combined = fields.join(' ')

      let score = 0
      if (combined.includes(q)) score += 100
      const allMatch = words.every(w => combined.includes(w))
      if (allMatch) score += 50
      words.forEach(w => { if (combined.includes(w)) score += 10 })
      if (p.name.toLowerCase().startsWith(q)) score += 30

      return { product: p, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(x => x.product)
}

function suggestCategories(query: string): string[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const cats = [...new Set(PRODUCTS.map(p => getCategory(p)))]
  return cats.filter(c => c.toLowerCase().includes(q)).slice(0, 3)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductResultRow({
  product,
  query,
  onClick,
}: {
  product: Product
  query: string
  onClick: () => void
}) {
  const cat = getCategory(product)
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FDF8EE] transition-colors group text-left"
    >
      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
        <img
          src={product.image ?? product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {highlight(product.name, query)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {highlight(cat, query)} · {product.metal} · {product.purity}
        </p>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-semibold text-[#C9A84C]">
          ₹{product.currentPrice.toLocaleString('en-IN')}
        </p>
        <div className="flex items-center justify-end gap-0.5 mt-0.5">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-xs text-gray-400">{product.avgRating}</span>
        </div>
      </div>

      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#C9A84C] flex-shrink-0 transition-colors" />
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SearchModal() {
  const [query, setQuery]               = useState('')
  const [debouncedQuery, setDebounced]  = useState('')
  const [results, setResults]           = useState<Product[]>([])
  const [categories, setCategories]     = useState<string[]>([])
  const [recentSearches, setRecent]     = useState<string[]>([])
  const [isSearching, setIsSearching]   = useState(false)

  const { isSearchOpen, toggleSearch }  = useUIStore()
  const router  = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      if (stored) setRecent(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 120)
    }
    if (!isSearchOpen) {
      setQuery('')
      setDebounced('')
      setResults([])
      setCategories([])
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) toggleSearch()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isSearchOpen, toggleSearch])

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    setIsSearching(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      setDebounced(value)

      const trimmed = value.trim()
      if (trimmed.length < 1) {
        setResults([])
        setCategories([])
        setIsSearching(false)
        return
      }

      setResults(searchProducts(trimmed))
      setCategories(suggestCategories(trimmed))
      setIsSearching(false)
    }, DEBOUNCE_DELAY)
  }, [])

  const saveRecent = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecent(prev => {
      const next = [trimmed, ...prev.filter(r => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT)
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const goToSearch = (term: string) => {
    if (!term.trim()) return
    saveRecent(term)
    router.push(`/products?search=${encodeURIComponent(term.trim())}`)
    toggleSearch()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToSearch(query)
  }

  const handleProductClick = (product: Product) => {
    saveRecent(query)
    router.push(`/products/${product.slug}`)
    toggleSearch()
  }

  const handleCategoryClick = (cat: string) => {
    saveRecent(query)
    router.push(`/products?category=${encodeURIComponent(cat.toLowerCase())}`)
    toggleSearch()
  }

  const clearRecent = () => {
    setRecent([])
    try { localStorage.removeItem(RECENT_KEY) } catch {}
  }

  const showResults   = debouncedQuery.trim().length > 0
  const showEmpty     = showResults && results.length === 0 && !isSearching
  const showSuggested = !showResults

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={toggleSearch}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-[101] bg-white shadow-2xl"
          >
            <div className="max-w-3xl mx-auto">

              <div className="px-4 py-4 md:px-8 md:py-5 border-b border-gray-100">
                <form onSubmit={handleSubmit} className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search size={20} className="text-gray-400" />
                    )}
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => handleChange(e.target.value)}
                    placeholder="Search jewellery, categories, materials…"
                    autoComplete="off"
                    className="w-full pl-12 pr-20 py-3.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:border-[#C9A84C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all placeholder:text-gray-400"
                  />

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                      <button
                        type="button"
                        onClick={() => { setQuery(''); setDebounced(''); setResults([]); setCategories([]) }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        aria-label="Clear"
                      >
                        <X size={16} />
                      </button>
                    )}
                  
                  </div>
                </form>
              </div>

              <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
                <AnimatePresence mode="wait">
                  {showResults && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {categories.length > 0 && (
                        <div className="px-4 md:px-6 pt-3 pb-2 flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => handleCategoryClick(cat)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF8EE] border border-[#C9A84C]/30 text-[#8B6914] text-xs font-medium rounded-full hover:bg-[#C9A84C]/20 transition-colors"
                            >
                              <Search size={11} />
                              {query} in {cat}
                            </button>
                          ))}
                        </div>
                      )}

                      {results.length > 0 && (
                        <div className="pb-2">
                          <p className="px-4 md:px-6 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                            Products
                          </p>
                          {results.map(product => (
                            <ProductResultRow
                              key={product.id}
                              product={product}
                              query={debouncedQuery}
                              onClick={() => handleProductClick(product)}
                            />
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => goToSearch(query)}
                        className="w-full flex items-center justify-between px-4 md:px-6 py-3 border-t border-gray-100 text-sm font-medium text-[#C9A84C] hover:bg-[#FDF8EE] transition-colors group"
                      >
                        <span>
                          View all results for &ldquo;<span className="font-semibold">{query}</span>&rdquo;
                        </span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>

                      {showEmpty && (
                        <div className="px-4 md:px-6 py-8 text-center">
                          <p className="text-gray-400 text-sm">
                            No results for &ldquo;<span className="font-medium text-gray-600">{debouncedQuery}</span>&rdquo;
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Try different keywords or browse categories below</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {showSuggested && (
                    <motion.div
                      key="suggested"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="px-4 md:px-6 py-4 space-y-5"
                    >
                      {recentSearches.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                              <Clock size={11} /> Recent
                            </p>
                            <button
                              onClick={clearRecent}
                              className="text-[10px] text-gray-400 hover:text-[#C9A84C] transition-colors"
                            >
                              Clear all
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.map(term => (
                              <button
                                key={term}
                                onClick={() => { setQuery(term); handleChange(term) }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-full hover:border-[#C9A84C] hover:text-[#8B6914] hover:bg-[#FDF8EE] transition-colors"
                              >
                                <Clock size={10} className="text-gray-400" />
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                          <TrendingUp size={11} /> Popular Searches
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                       {quickSearches.map(item => {
  const Icon = item.icon

  return (
    <button
      key={item.label}
      onClick={() => {
        router.push(item.link)
        toggleSearch()
      }}
      className="flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-[#FDF8EE] border border-gray-100 hover:border-[#C9A84C]/40 rounded-xl transition-all group text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-medium text-gray-700 group-hover:text-[#8B6914]">
          {item.label}
        </span>
      </div>

      <ArrowRight
        size={12}
        className="text-gray-300 group-hover:text-[#C9A84C] group-hover:translate-x-0.5 transition-all"
      />
    </button>
  )
})}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80">
                <p className="text-[11px] text-gray-400 text-center">
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-600 shadow-sm">ESC</kbd>
                  {' '}to close &nbsp;·&nbsp;{' '}
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-600 shadow-sm">↵</kbd>
                  {' '}to see all results
                </p>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}