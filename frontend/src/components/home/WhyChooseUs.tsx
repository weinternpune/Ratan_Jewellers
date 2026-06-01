'use client'
import { motion } from 'framer-motion'
import { Shield, Award, RefreshCw, Truck, Star, Headphones } from 'lucide-react'
const features = [
  { icon: Shield, title: 'BIS Hallmarked', desc: '100% certified purity. Every piece carries BIS hallmark for guaranteed authenticity.' },
  { icon: Award, title: '40+ Years Trust', desc: 'Serving families since 1985 with legacy craftsmanship passed through generations.' },
  { icon: RefreshCw, title: 'Easy Exchange', desc: 'Lifetime exchange policy. Upgrade your jewellery at current gold rates anytime.' },
  { icon: Truck, title: 'Insured Delivery', desc: 'Free insured shipping across India. Delivered in premium packaging, safely.' },
  { icon: Star, title: 'Master Craftsmen', desc: 'Each piece handcrafted by artisans with decades of experience in their craft.' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated customer support via WhatsApp, phone, and email. Always here for you.' },
]
export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-24 bg-obsidian relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"><svg width="100%" height="100%"><defs><pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1" fill="#C9A84C"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)" /></svg></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14"><p className="font-mono-code text-xs tracking-[0.25em] text-gold uppercase mb-3">The Ratan Promise</p><h2 className="font-display text-4xl sm:text-5xl text-white mb-4">Why Choose Us</h2><div className="gold-line w-24 mx-auto" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{features.map((feat, i) => <motion.div key={feat.title} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }} className="group p-6 rounded-2xl border border-gold/10 hover:border-gold/30 hover:bg-gold/5 transition-all duration-300"><div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors"><feat.icon size={22} className="text-gold" /></div><h3 className="font-display text-lg text-white mb-2">{feat.title}</h3><p className="text-sm text-gold-light/50 leading-relaxed">{feat.desc}</p></motion.div>)}</div>
      </div>
    </section>
  )
}
