'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { apiClient } from '@/lib/api'

interface Props { title: string }

const mock = [
  { id:'t0', name:"Men's Necklace", slug:'mens-necklace-22k', sku:'RJT00001', images:['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1164/1662631757_9cbff375c83181ab33e4.png'], metal:'Gold', purity:'22KT', netWeight:18.75, currentPrice:178500, goldRate:6500, makingCharges:2200, stoneCharges:0, avgRating:4.9, reviewCount:142, inStock:true, isTrending:true, category:{name:'Necklaces'} },
  { id:'t1', name:"Queen's Necklace", slug:'queens-necklace', sku:'RJT00002', images:['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/923/1779455699_aabe91f5b170208f7270.webp'], metal:'Gold', purity:'22KT', netWeight:24.3, currentPrice:231000, goldRate:6500, makingCharges:2800, stoneCharges:8000, avgRating:4.9, reviewCount:211, inStock:true, isTrending:true, category:{name:'Necklaces'} },
  { id:'t2', name:'Diamond Nose Ring', slug:'diamond-nose-ring', sku:'RJT00003', images:['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1704/1780137941_828a35a21f49303c9344.webp'], metal:'Gold', purity:'18KT', netWeight:0.85, currentPrice:12500, goldRate:6500, makingCharges:800, stoneCharges:3500, avgRating:4.8, reviewCount:89, inStock:true, isTrending:true, category:{name:'Nose Pins'} },
  { id:'t3', name:'EternalSpark Mangalsutra', slug:'eternalspark-gold-mangalsutra', sku:'RJT00004', images:['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1404/1780053072_2e61ea8ef659a5e4db1f.webp'], metal:'Gold', purity:'22KT', netWeight:7.4, currentPrice:67800, goldRate:6500, makingCharges:1500, stoneCharges:0, avgRating:4.9, reviewCount:176, inStock:true, isTrending:true, category:{name:'Mangalsutras'} },
  { id:'t4', name:'SlimShine Diamond Ring', slug:'slimshine-diamond-ring', sku:'RJT00005', images:['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1757/1771847373_3c37a3448b16a50f89c1.jpg'], metal:'Gold', purity:'18KT', netWeight:2.15, currentPrice:38500, goldRate:6500, makingCharges:1200, stoneCharges:6500, avgRating:4.8, reviewCount:94, inStock:true, isTrending:true, category:{name:'Rings'} },
  { id:'t5', name:'Vanya Petal Flow Necklace', slug:'vanya-petal-flow-diamond-necklace', sku:'RJT00006', images:['https://d25g9z9s77rn4i.cloudfront.net/uploads/product/1983/1768634238_4b1b4642e14350311882.jpg'], metal:'Gold', purity:'18KT', netWeight:11.6, currentPrice:124000, goldRate:6500, makingCharges:2500, stoneCharges:18000, avgRating:4.9, reviewCount:58, inStock:true, isTrending:true, category:{name:'Necklaces'} },
]

export default function TrendingProducts({ title }: Props) {
  const { data } = useQuery({
    queryKey: ['products', 'trending'],
   queryFn: async () => {
  const res = await apiClient.get('/products?trending=true&limit=6')
  return res.data
},
    retry: false,
  })
  const apiProducts = (data as any)?.products ?? []
  const displayProducts = apiProducts.length > 0 ? apiProducts : mock
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-center mb-10">
          <Link href="/products?trending=true" className="absolute right-0 hidden sm:flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#C8A45D] transition-colors group font-medium">
            View All Products <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform"/>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-8 h-px bg-[#C8A45D]"/><div className="w-1.5 h-1.5 rotate-45 border border-[#C8A45D]"/></div>
            <h2 className="text-[19px] sm:text-[26px] font-bold tracking-[0.18em] text-gray-900 uppercase" style={{ fontFamily: 'Georgia,"Times New Roman",serif' }}>{title}</h2>
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rotate-45 border border-[#C8A45D]"/><div className="w-8 h-px bg-[#C8A45D]"/></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayProducts.map((product: any, i: number) => (
            <motion.div key={`${product.id ?? product._id}-${i}`} className="flex flex-col w-full h-full"
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.5 }}>
              <ProductCard product={product}/>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link href="/products?trending=true" className="inline-flex items-center gap-2 border border-gray-900 text-gray-900 text-[13px] font-medium px-6 py-2.5 rounded hover:bg-gray-900 hover:text-white transition-all">
            View All {title} <ArrowRight size={13}/>
          </Link>
        </div>
      </div>
    </section>
  )
}
