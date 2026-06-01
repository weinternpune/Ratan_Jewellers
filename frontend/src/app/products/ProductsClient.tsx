'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import type { Product } from '@/components/products/ProductCard'
import { api } from '@/lib/api'

interface ProductsResponse {
  products: Product[]
}

const mockProducts = Array.from({ length: 24 }, (_, i) => ({ id: `p-${i}`, name: ['Antique Polki Necklace','Solitaire Diamond Ring','Temple Gold Bangles Set','Kundan Jhumka Earrings','22K Gold Chain','Emerald Pendant','Ruby Mangalsutra','Diamond Tennis Bracelet','Lakshmi Coin Pendant','Chand Bali Earrings','Meenakari Choker','Pave Diamond Band','South Indian Bridal Set','Cocktail Statement Ring','Gold Kada Bangle','Floral Diamond Earrings','Temple Necklace Set','Men Gold Chain','Pearl Drop Earrings','Ruby Finger Ring','Three Layer Necklace','Princess Cut Ring','Ghungroo Bangle','Bridal Maang Tikka'][i]||'Jewellery', slug: `product-${i}`, sku: `RJ${String(i+1).padStart(5,'0')}`, images: [], metal: ['Gold','Gold & Diamond','Gold & Emerald','Gold & Ruby'][i%4], purity: ['22K','18K','24K','14K'][i%4], netWeight: 4+(i*1.7)%20, currentPrice: 15000+(i*8700)%180000, goldRate: 6500, makingCharges: 1500+(i*200)%5000, stoneCharges: i%3===0?0:3000+(i*1200)%20000, avgRating: 3.8+(i%12)*0.1, reviewCount: 5+(i*7)%80, inStock: i%7!==0, isFeatured: i<3, isTrending: i%4===0, category: { name: ['Necklaces','Rings','Bangles','Earrings','Chains','Pendants','Bracelets','Mangalsutras'][i%8] } }))
const METALS = ['Gold','Gold & Diamond','Silver','Platinum']
const PURITIES = ['24K','22K','18K','14K']
export default function ProductsClient() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedMetal, setSelectedMetal] = useState<string[]>([])
  const [selectedPurity, setSelectedPurity] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('createdAt')
  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => set(arr.includes(val)?arr.filter(x=>x!==val):[...arr,val])
  const activeFilters = [...selectedMetal,...selectedPurity].length
  const { data, isLoading } = useQuery({ queryKey: ['products', selectedMetal, selectedPurity, sortBy], queryFn: () => api.get<ProductsResponse>('/products', { metal: selectedMetal.join(',')||undefined, purity: selectedPurity.join(',')||undefined, sortBy }), retry: false })
  const products = data?.products || mockProducts
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-gold/10 py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6"><p className="font-mono-code text-xs text-gold tracking-wider uppercase mb-2">Explore</p><h1 className="font-display text-4xl sm:text-5xl text-charcoal">All Collections</h1><p className="text-warm-grey text-sm mt-2">{products.length} exquisite pieces</p></div></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${filtersOpen||activeFilters>0?'border-gold bg-gold/5 text-gold':'border-gold/20 text-warm-grey hover:border-gold hover:text-gold'}`}><SlidersHorizontal size={15} />Filters{activeFilters>0&&<span className="bg-gold text-obsidian text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>}</button>
          <div className="flex items-center gap-2"><span className="text-xs text-warm-grey hidden sm:block">Sort by:</span><select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="border border-gold/20 rounded-lg px-3 py-2 text-sm text-charcoal outline-none focus:border-gold bg-white"><option value="createdAt">Newest First</option><option value="currentPrice">Price: Low to High</option><option value="-currentPrice">Price: High to Low</option><option value="avgRating">Top Rated</option></select></div>
        </div>
        <div className="flex gap-6">
          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ opacity:0, width:0 }} animate={{ opacity:1, width:240 }} exit={{ opacity:0, width:0 }} transition={{ duration:0.25 }} className="flex-shrink-0 overflow-hidden">
                <div className="w-60 bg-white rounded-xl border border-gold/10 shadow-luxury p-5 space-y-6">
                  <div className="flex items-center justify-between"><h3 className="font-display text-base text-charcoal">Filters</h3>{activeFilters>0&&<button onClick={() => {setSelectedMetal([]);setSelectedPurity([])}} className="text-xs text-gold hover:text-gold-dark transition-colors">Clear all</button>}</div>
                  <div><h4 className="text-xs font-medium text-charcoal uppercase tracking-wider mb-3">Metal</h4><div className="space-y-2">{METALS.map(m=><label key={m} className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" checked={selectedMetal.includes(m)} onChange={() => toggle(selectedMetal,m,setSelectedMetal)} className="w-4 h-4 accent-[#C9A84C]" /><span className="text-sm text-warm-grey group-hover:text-charcoal transition-colors">{m}</span></label>)}</div></div>
                  <div className="gold-line" />
                  <div><h4 className="text-xs font-medium text-charcoal uppercase tracking-wider mb-3">Purity</h4><div className="flex flex-wrap gap-2">{PURITIES.map(p=><button key={p} onClick={() => toggle(selectedPurity,p,setSelectedPurity)} className={`px-3 py-1.5 rounded text-xs font-mono-code transition-all ${selectedPurity.includes(p)?'bg-gold text-obsidian':'border border-gold/20 text-warm-grey hover:border-gold hover:text-gold'}`}>{p}</button>)}</div></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">{Array.from({length:12}).map((_,i)=><div key={i}><div className="skeleton aspect-square rounded-xl"/><div className="p-4 space-y-2"><div className="skeleton h-4 w-3/4"/><div className="skeleton h-3 w-1/2"/></div></div>)}</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">{products.map((product, i) => <motion.div key={product.id} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04, duration:0.4 }}><ProductCard product={product} /></motion.div>)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
