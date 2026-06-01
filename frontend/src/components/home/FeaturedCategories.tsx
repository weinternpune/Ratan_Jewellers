'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
const categories = [
  { name: 'Necklaces', slug: 'necklaces', icon: '📿', count: '200+ designs' },
  { name: 'Rings', slug: 'rings', icon: '💍', count: '150+ designs' },
  { name: 'Bangles', slug: 'bangles', icon: '✨', count: '180+ designs' },
  { name: 'Earrings', slug: 'earrings', icon: '💎', count: '220+ designs' },
  { name: 'Chains', slug: 'chains', icon: '⛓️', count: '90+ designs' },
  { name: 'Mangalsutras', slug: 'mangalsutras', icon: '🌸', count: '60+ designs' },
]
export default function FeaturedCategories() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="font-mono-code text-xs tracking-[0.25em] text-gold uppercase mb-3">Browse By</p>
          <h2 className="font-display text-4xl sm:text-5xl text-charcoal mb-4">Our Collections</h2>
          <div className="gold-line w-24 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
              <Link href={`/products?category=${cat.slug}`} className="group block text-center p-5 rounded-2xl border border-gold/15 hover:border-gold/40 hover:bg-gold/5 transition-all duration-300 hover:shadow-gold">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-champagne to-ivory flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <h3 className="font-display text-sm font-medium text-charcoal group-hover:text-gold transition-colors mb-1">{cat.name}</h3>
                <p className="text-[10px] text-warm-grey/70">{cat.count}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
