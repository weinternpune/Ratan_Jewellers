'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
const categories = [
  { name: 'Necklaces', slug: 'necklaces', image: '/images/categories/necklace1.jpeg', count: '200+ designs' },
  { name: 'Rings', slug: 'rings', image: '/images/categories/ring1.jpeg', count: '150+ designs' },
  { name: 'Bangles', slug: 'bangles', image: '/images/categories/bangle1.jpeg', count: '180+ designs' },
  { name: 'Earrings', slug: 'earrings', image: '/images/categories/earrings1.jpeg', count: '220+ designs' },
  { name: 'Chains', slug: 'chains', image: '/images/categories/chain1.jpeg', count: '90+ designs' },
  { name: 'Mangalsutras', slug: 'mangalsutras', image: '/images/categories/mangalsutra1.jpeg', count: '60+ designs' },
]
export default function FeaturedCategories() {
  return (
    <section className="py-8 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          {/* <p className="font-mono-code text-[12px] tracking-[0.3em] text-gold uppercase mb-1.5">
            Browse By
          </p> */}

        <p className="font-mono-code text-[11px] sm:text-[12px] tracking-[0.12em] sm:tracking-[0.3em] text-gold uppercase mb-1">
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
                className="group block text-center rounded-2xl border border-gold/15 bg-white px-3 pt-3 pb-4 transition-all duration-300 hover:border-[#C9A24A] hover:bg-gradient-to-b hover:from-white hover:to-[#FFF9ED] hover:shadow-[0_18px_50px_rgba(201,162,74,0.15)] hover:-translate-y-1"
              >
                <div className="relative w-full h-[120px] mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-champagne to-ivory transition-transform duration-300 group-hover:scale-[1.02]">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-display text-base font-semibold text-charcoal group-hover:text-[#C9A24A] transition-colors mb-1">
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
