'use client'
// import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { PRODUCTS } from "@/assets/products/allproducts";
import ProductCard from '@/components/products/ProductCard'
// import { apiClient } from '@/lib/api'

interface Props { title: string; filter: 'newest' | 'trending' | 'featured' }

export default function FeaturedProducts({ title, filter }: Props) {
const data = null
  const apiProducts = (data as any)?.products ?? []
 const displayProducts = PRODUCTS.slice(0, 6);
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-center mb-10">
          <Link href="/products" className="absolute right-0 hidden sm:flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#C8A45D] transition-colors group font-medium">
            View All Products <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-8 h-px bg-[#C8A45D]"/><div className="w-1.5 h-1.5 rotate-45 border border-[#C8A45D]"/></div>
            <h2 className="text-[20px] sm:text-[26px] font-bold tracking-[0.18em] text-gray-900 uppercase" style={{ fontFamily: 'Georgia,"Times New Roman",serif' }}>{title}</h2>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rotate-45 border border-[#C8A45D]"/><div className="w-8 h-px bg-[#C8A45D]"/></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayProducts.map((product: any, i: number) => (
            <motion.div key={`${product.id ?? product._id}-${i}`} className="flex flex-col w-full"
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.5 }}>
              <ProductCard product={product}/>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className="inline-flex items-center gap-2 border border-gray-900 text-gray-900 text-[13px] font-medium px-6 py-2.5 rounded hover:bg-gray-900 hover:text-white transition-all">
            View All {title} <ArrowRight size={13}/>
          </Link>
        </div>
      </div>
    </section>
  )
}