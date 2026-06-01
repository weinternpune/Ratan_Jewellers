'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { api } from '@/lib/api'
interface Props { title: string; filter: 'newest' | 'trending' | 'featured' }
const mockProducts = Array.from({ length: 8 }, (_, i) => ({ id: `mock-${i}`, name: ['Royal Kundan Necklace Set','Diamond Solitaire Ring','Temple Gold Bangles','Jhumka Earrings','Polki Choker Set','Engagement Diamond Ring','Gold Chain 22K','Mangalsutra Pendant'][i] || 'Gold Jewellery', slug: `product-${i}`, sku: `RJ${String(i+1).padStart(5,'0')}`, images: [], metal: i%2===0?'Gold':'Gold & Diamond', purity: ['22K','18K','24K'][i%3], netWeight: 5+i*2.3, currentPrice: 25000+i*15000, goldRate: 6500, makingCharges: 2000, stoneCharges: i%2===0?0:5000, avgRating: 4+(i%2)*0.5, reviewCount: 12+i*5, inStock: i!==3, isFeatured: i<2, isTrending: i%3===0, category: { name: ['Necklaces','Rings','Bangles','Earrings','Necklaces','Rings','Chains','Mangalsutras'][i] } }))
export default function FeaturedProducts({ title, filter }: Props) {
  const { data, isLoading } = useQuery({ queryKey: ['products', filter], queryFn: () => api.get<any>(`/products?${filter==='trending'?'trending=true':filter==='featured'?'featured=true':'sortBy=createdAt'}&limit=8`), retry: false })
  const products = (data as any)?.products || mockProducts
  return (
    <section className="py-16 sm:py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div><p className="font-mono-code text-xs tracking-[0.25em] text-gold uppercase mb-2">{filter==='trending'?'Most Loved':'Just In'}</p><h2 className="font-display text-4xl sm:text-5xl text-charcoal">{title}</h2></div>
          <Link href="/products" className="hidden sm:flex items-center gap-2 text-sm text-warm-grey hover:text-gold transition-colors group">View All<ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" /></Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{Array.from({length:8}).map((_,i)=><div key={i} className="rounded-xl overflow-hidden"><div className="skeleton aspect-square"/><div className="p-4 space-y-2"><div className="skeleton h-4 w-3/4"/><div className="skeleton h-3 w-1/2"/></div></div>)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">{products.map((product: any, i: number) => <motion.div key={product.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.5 }}><ProductCard product={product} /></motion.div>)}</div>
        )}
        <div className="mt-8 text-center sm:hidden"><Link href="/products" className="btn-dark px-8 py-3 rounded text-sm inline-flex items-center gap-2">View All {title}<ArrowRight size={14} /></Link></div>
      </div>
    </section>
  )
}
