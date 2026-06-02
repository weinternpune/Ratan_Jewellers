'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Crown, CircleDot, Sparkles, Gem, Link as LinkIcon, Flower2 } from 'lucide-react'
const categories = [
  { name: 'Necklaces', slug: 'necklaces', Icon: Crown, count: '200+ designs' },
  { name: 'Rings', slug: 'rings', Icon: CircleDot, count: '150+ designs' },
  { name: 'Bangles', slug: 'bangles', Icon: Sparkles, count: '180+ designs' },
  { name: 'Earrings', slug: 'earrings', Icon: Gem, count: '220+ designs' },
  { name: 'Chains', slug: 'chains', Icon: LinkIcon, count: '90+ designs' },
  { name: 'Mangalsutras', slug: 'mangalsutras', Icon: Flower2, count: '60+ designs' },
]
export default function FeaturedCategories() {
  return (
    <section className="py-8 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <p className="font-mono-code text-[12px] tracking-[0.3em] text-gold uppercase mb-1.5">
            Browse By
          </p>
          <div className="inline-flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-gold/70" />
            <span className="text-[0.85rem] text-gold">◇</span>
            <h2 className="font-display text-3xl font-semibold uppercase tracking-[0.08em] text-charcoal">
              Our Collections
            </h2>
            <span className="text-[0.85rem] text-gold">◇</span>
            <span className="h-px w-10 bg-gold/70" />
          </div>
          <div className="gold-line mx-auto mt-3 w-20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className="group block text-center rounded-[26px] border border-gold/15 bg-white px-3 py-3 transition-all duration-300 hover:border-[#C9A24A] hover:bg-gradient-to-b hover:from-white hover:to-[#FFF9ED] hover:shadow-[0_0_20px_rgba(201,162,74,0.25)] hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-champagne to-ivory flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                  <cat.Icon className="w-7 h-7 text-[#C9A24A] group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                </div>
                <h3 className="font-display text-sm font-semibold text-charcoal group-hover:text-[#C9A24A] transition-colors mb-0.5" >
                  {cat.name}
                </h3>
                <p className="text-[10px] text-warm-grey/70 leading-none">{cat.count}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
