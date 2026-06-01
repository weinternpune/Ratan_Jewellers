'use client'
import { useState } from 'react'
import { Mail, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!email) return; setLoading(true); await new Promise(r => setTimeout(r, 800)); toast.success("Subscribed! You'll receive our latest offers."); setEmail(''); setLoading(false) }
  return (
    <section className="py-16 bg-gradient-to-br from-obsidian-2 to-obsidian-3 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 gold-line" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-gold/5 pointer-events-none" />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <Sparkles size={28} className="text-gold mx-auto mb-4" />
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">Stay in the Loop</h2>
        <p className="text-gold-light/50 text-sm sm:text-base mb-8">Subscribe for exclusive offers, new arrivals, and jewellery care tips. Get 5% off your first order!</p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/40" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="w-full pl-9 pr-4 py-3.5 bg-white/5 border border-gold/20 rounded text-white text-sm placeholder:text-white/30 outline-none focus:border-gold/50 transition-colors" required /></div>
          <button type="submit" disabled={loading} className="btn-gold px-6 py-3.5 rounded text-sm font-medium whitespace-nowrap flex-shrink-0">{loading ? 'Joining...' : 'Subscribe'}</button>
        </form>
        <p className="mt-4 text-xs text-gold/30">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}
