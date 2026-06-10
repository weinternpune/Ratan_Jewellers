'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ArrowRight, Clock, TrendingUp, ChevronRight, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, Sparkles, Heart, Circle } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  _id: string
  name: string
  slug: string
  sku: string
  images: string[]
  metal: string
  purity: string
  currentPrice: number
  avgRating: number
  category: string | { name: string }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEBOUNCE_DELAY = 350
const MAX_RESULTS    = 6
const MAX_RECENT     = 5
const RECENT_KEY     = 'rj_recent_searches'
const API_URL        = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const quickSearches = [
  { label: 'Gold Necklaces',  link: '/products?category=necklaces&metal=gold',    icon: Gem },
  { label: 'Silver Earrings', link: '/products?category=earrings&metal=silver',   icon: Sparkles },
  { label: 'Mangalsutras',    link: '/products?category=mangalsutras',             icon: Heart },
  { label: 'Bracelets',       link: '/products?category=bracelets',                icon: Circle },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${escapeRegex(query.trim())})`, 'gi')
  return text.split(regex).map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#C9A84C]/20 text-[#8B6914] font-semibold rounded-sm px-0.5">{part}</mark>
      : part
  )
}

function getCategory(p: Product): string {
  if (typeof p.category === 'string') return p.category
  return p.category?.name ?? ''
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductResultRow({ product, query, onClick }: { product: Product; query: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FDF8EE] transition-colors group text-left">
      <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}/>
          : <div className="w-full h-full flex items-center justify-center"><Gem size={14} className="text-gray-300"/></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{highlight(product.name, query)}</p>
        <p className="text-xs text-gray-400 mt-0.5">{highlight(getCategory(product), query)} · {product.metal} · {product.purity}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-semibold text-[#C9A84C]">₹{product.currentPrice?.toLocaleString('en-IN')}</p>
        <div className="flex items-center justify-end gap-0.5 mt-0.5">
          <Star size={10} className="fill-amber-400 text-amber-400"/>
          <span className="text-xs text-gray-400">{product.avgRating?.toFixed(1)}</span>
        </div>
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#C9A84C] flex-shrink-0 transition-colors"/>
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SearchModal() {
  const [query, setQuery]             = useState('')
  const [debouncedQuery, setDebounced]= useState('')
  const [results, setResults]         = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecent]   = useState<string[]>([])

  const { isSearchOpen, toggleSearch } = useUIStore()
  const router    = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef  = useRef<AbortController | null>(null)

  // Load recent searches
  useEffect(() => {
    try { const s = localStorage.getItem(RECENT_KEY); if (s) setRecent(JSON.parse(s)) } catch {}
  }, [])

  // Focus / reset on open/close
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => inputRef.current?.focus(), 120)
    else { setQuery(''); setDebounced(''); setResults([]) }
  }, [isSearchOpen])

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && isSearchOpen) toggleSearch() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [isSearchOpen, toggleSearch])

  // Fetch from backend when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return }
    setIsSearching(true)
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    fetch(`${API_URL}/products?search=${encodeURIComponent(debouncedQuery)}&limit=${MAX_RESULTS}`, { signal: abortRef.current.signal })
      .then(r => r.json())
      .then(data => { setResults(data?.data?.products ?? data?.data ?? []); setIsSearching(false) })
      .catch(err => { if (err.name !== 'AbortError') setIsSearching(false) })
  }, [debouncedQuery])

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebounced(value), DEBOUNCE_DELAY)
  }, [])

  const saveRecent = (term: string) => {
    const t = term.trim(); if (!t) return
    setRecent(prev => {
      const next = [t, ...prev.filter(r => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT)
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

  const handleProductClick = (product: Product) => {
    saveRecent(query)
    router.push(`/products/${product.slug}`)
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
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
            onClick={toggleSearch} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"/>

          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
            transition={{ duration:0.25, ease:[0.22,1,0.36,1] }}
            className="fixed top-0 left-0 right-0 z-[101] bg-white shadow-2xl">
            <div className="max-w-3xl mx-auto">

              {/* Search input */}
              <div className="px-4 py-4 md:px-8 md:py-5 border-b border-gray-100">
                <form onSubmit={e => { e.preventDefault(); goToSearch(query) }} className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isSearching
                      ? <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"/>
                      : <Search size={20} className="text-gray-400"/>
                    }
                  </div>
                  <input ref={inputRef} type="text" value={query} onChange={e => handleChange(e.target.value)}
                    placeholder="Search jewellery, categories, materials…" autoComplete="off"
                    className="w-full pl-12 pr-12 py-3.5 text-base bg-gray-50 border border-gray-200 rounded-xl focus:border-[#C9A84C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all placeholder:text-gray-400"/>
                  {query && (
                    <button type="button" onClick={() => { setQuery(''); setDebounced(''); setResults([]) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                      <X size={16}/>
                    </button>
                  )}
                </form>
              </div>

              <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
                <AnimatePresence mode="wait">

                  {/* Results */}
                  {showResults && (
                    <motion.div key="results" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
                      {results.length > 0 && (
                        <div className="pb-2">
                          <p className="px-4 md:px-6 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Products</p>
                          {results.map(p => <ProductResultRow key={p._id} product={p} query={debouncedQuery} onClick={() => handleProductClick(p)}/>)}
                        </div>
                      )}
                      <button onClick={() => goToSearch(query)}
                        className="w-full flex items-center justify-between px-4 md:px-6 py-3 border-t border-gray-100 text-sm font-medium text-[#C9A84C] hover:bg-[#FDF8EE] transition-colors group">
                        <span>View all results for &ldquo;<span className="font-semibold">{query}</span>&rdquo;</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                      </button>
                      {showEmpty && (
                        <div className="px-4 md:px-6 py-8 text-center">
                          <p className="text-gray-400 text-sm">No results for &ldquo;<span className="font-medium text-gray-600">{debouncedQuery}</span>&rdquo;</p>
                          <p className="text-xs text-gray-400 mt-1">Try different keywords or browse categories below</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Suggested */}
                  {showSuggested && (
                    <motion.div key="suggested" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}
                      className="px-4 md:px-6 py-4 space-y-5">

                      {recentSearches.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5"><Clock size={11}/> Recent</p>
                            <button onClick={clearRecent} className="text-[10px] text-gray-400 hover:text-[#C9A84C] transition-colors">Clear all</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {recentSearches.map(term => (
                              <button key={term} onClick={() => { setQuery(term); handleChange(term) }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-full hover:border-[#C9A84C] hover:text-[#8B6914] hover:bg-[#FDF8EE] transition-colors">
                                <Clock size={10} className="text-gray-400"/> {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5"><TrendingUp size={11}/> Popular Searches</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {quickSearches.map(item => {
                            const Icon = item.icon
                            return (
                              <button key={item.label} onClick={() => { router.push(item.link); toggleSearch() }}
                                className="flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-[#FDF8EE] border border-gray-100 hover:border-[#C9A84C]/40 rounded-xl transition-all group text-left">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-amber-600"/>
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-[#8B6914]">{item.label}</span>
                                </div>
                                <ArrowRight size={12} className="text-gray-300 group-hover:text-[#C9A84C] transition-all"/>
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
                  Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-600 shadow-sm">ESC</kbd> to close &nbsp;·&nbsp; <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-600 shadow-sm">↵</kbd> to see all results
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
