'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'

const quickSearches = [
  { label: 'Gold Necklaces', link: '/products?category=necklaces&metal=gold' },
  { label: 'Diamond Rings', link: '/products?category=rings&metal=diamond' },
  { label: 'Silver Earrings', link: '/products?category=earrings&metal=silver' },
  { label: 'Gold Chains', link: '/products?category=chains&metal=gold' },
  { label: 'Mangalsutras', link: '/products?category=mangalsutras' },
  { label: 'Bracelets', link: '/products?category=bracelets' },
]

export default function SearchModal() {
  const [searchQuery, setSearchQuery] = useState('')
  const { isSearchOpen, toggleSearch } = useUIStore()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        toggleSearch()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isSearchOpen, toggleSearch])

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      toggleSearch()
      setSearchQuery('')
    }
  }

  // Handle quick search click
  const handleQuickSearch = (link: string) => {
    router.push(link)
    toggleSearch()
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSearch}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[101] bg-white shadow-2xl"
          >
            <div className="max-w-4xl mx-auto p-6 md:p-8">
              {/* Close Button */}
              <button
                onClick={toggleSearch}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close search"
              >
                <X size={24} />
              </button>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for jewellery, categories, or materials..."
                    className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-[#C9A84C] focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </form>

              {/* Quick Searches */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                  Popular Searches
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickSearches.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleQuickSearch(item.link)}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-[#C9A84C]/10 rounded-lg transition-colors group text-left"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#C9A84C]">
                        {item.label}
                      </span>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-[#C9A84C] group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Tips */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">ESC</kbd> to close or{' '}
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">Enter</kbd> to search
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
