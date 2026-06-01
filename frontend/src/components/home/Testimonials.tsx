'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
const testimonials = [
  { id: 1, name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: "Bought my wedding set from Ratan Jewellers and I couldn't be happier. The craftsmanship is exquisite and the gold quality is exceptional. Got BIS hallmark verified too!", product: 'Bridal Necklace Set' },
  { id: 2, name: 'Anita Patel', location: 'Surat', rating: 5, text: "The diamond ring I ordered for my engagement is absolutely stunning. WhatsApp delivery updates were so convenient. Customer service is top-notch.", product: 'Diamond Solitaire Ring' },
  { id: 3, name: 'Meera Krishnan', location: 'Chennai', rating: 5, text: "I've been buying from Ratan Jewellers for 15 years. Their exchange policy is fair, pricing is transparent, and quality never disappoints. Highly recommend!", product: 'Gold Bangles Set' },
  { id: 4, name: 'Sunita Agarwal', location: 'Jaipur', rating: 5, text: "Ordered earrings online and received them beautifully packaged. The weight and purity matched exactly as described. Will definitely shop again!", product: 'Temple Jhumka Earrings' },
]
export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  return (
    <section className="py-16 sm:py-20 bg-ivory">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12"><p className="font-mono-code text-xs tracking-[0.25em] text-gold uppercase mb-3">Customer Love</p><h2 className="font-display text-4xl sm:text-5xl text-charcoal mb-4">What They Say</h2><div className="gold-line w-24 mx-auto" /></div>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} transition={{ duration:0.4 }} className="luxury-card rounded-2xl p-8 sm:p-12 text-center">
              <Quote size={36} className="text-gold/20 mx-auto mb-6" />
              <div className="flex justify-center mb-4">{[...Array(testimonials[current].rating)].map((_,i) => <Star key={i} size={16} fill="#C9A84C" stroke="none" />)}</div>
              <p className="font-display text-xl sm:text-2xl text-charcoal leading-relaxed mb-8 italic">"{testimonials[current].text}"</p>
              <div><p className="font-display text-base font-medium text-charcoal">{testimonials[current].name}</p><p className="text-sm text-warm-grey mt-0.5">{testimonials[current].location}</p><p className="text-xs text-gold mt-1 font-mono-code">{testimonials[current].product}</p></div>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => setCurrent(c => (c-1+testimonials.length)%testimonials.length)} className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-warm-grey hover:border-gold hover:text-gold transition-all"><ChevronLeft size={16} /></button>
            <div className="flex gap-2">{testimonials.map((_,i) => <button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i===current?'w-6 h-2 bg-gold':'w-2 h-2 bg-gold/25'}`} />)}</div>
            <button onClick={() => setCurrent(c => (c+1)%testimonials.length)} className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-warm-grey hover:border-gold hover:text-gold transition-all"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
