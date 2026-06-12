'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { apiClient } from '@/lib/api'

interface Props { title: string; filter: 'newest' | 'trending' | 'featured' }

const mockProducts = Array.from({ length: 6 }, (_, i) => ({
  id: `mock-${i}`,
  name: ['Gold Traditional Necklace','Diamond Stud Earrings','Gold Ring For Women','Gold Bangles','Mangalsutra Pendant','Silver Pooja Thali'][i],
  slug: `product-${i}`, sku: `RJ${String(i+1).padStart(5,'0')}`,
  images: ['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1318/1779442888_0ac1f452c046c8b762b9.webp','https://d25g9z9s77rn4i.cloudfront.net/uploads/product/163/1779964423_381a85a123b25b6c31f9.jpg','https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1861/1773828632_55ca5de31b3813b0bd63.png','https://d25g9z9s77rn4i.cloudfront.net/uploads/product/262/1633616341_88273e27e4efdf6614fd.jpg','https://d25g9z9s77rn4i.cloudfront.net/uploads/product/764/1780054045_2efbce9def7e01b07340.webp','https://tiimg.tistatic.com/fp/1/006/590/fine-finished-brass-pooja-thali-023.jpg'].slice(i, i+1),
  metal: ['Gold','Gold','Gold','Gold','Gold','Silver'][i],
  purity: ['22KT','18KT','22KT','22KT','22KT','92.5'][i],
  netWeight: [15.25,3.25,4.1,20.5,6.2,250.0][i],
  currentPrice: [145000,48500,32500,102000,35800,18500][i],
  goldRate: 6500, makingCharges: 2000, stoneCharges: i%2===0?0:5000,
  avgRating: [4.8,4.9,4.7,4.8,4.9,4.7][i],
  reviewCount: [124,98,75,87,64,43][i],
  inStock: true, isFeatured: i<2, isTrending: i%3===0,
  category: { name: ['Necklaces','Earrings','Rings','Bangles','Mangalsutras','Pooja'][i] },
}))

export default function FeaturedProducts({ title, filter }: Props) {
  const { data } = useQuery({
    queryKey: ['products', filter],
    queryFn: async () => {
  const res = await apiClient.get(
    `/products?${
      filter === 'trending'
        ? 'trending=true'
        : filter === 'featured'
        ? 'featured=true'
        : 'featured=true'
    }&limit=6`
  )

  return res.data
},
    retry: false,
  })
  const apiProducts = (data as any)?.products ?? []
  const displayProducts = apiProducts.length > 0 ? apiProducts : mockProducts
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
