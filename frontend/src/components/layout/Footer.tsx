'use client'
import Link from 'next/link'
import { Gem, Share2, Globe, Video, Rss, MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
export default function Footer() {
  return (
    <footer className="bg-obsidian text-gold-light/70">
      <div className="gold-line" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center"><Gem size={18} className="text-obsidian" /></div>
              <div><div className="font-display text-xl font-semibold text-gold-light">Ratan</div><div className="font-mono-code text-[9px] tracking-[0.2em] text-gold/60 uppercase">Jewellers</div></div>
            </div>
            <p className="text-sm leading-relaxed mb-6">Crafting timeless jewellery since 1985. Every piece tells a story of artistry, purity, and love.</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2"><MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" /><span>123 Jewellers Lane, Mumbai - 400001, Maharashtra</span></div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-gold flex-shrink-0" /><a href="tel:+919876543210" className="hover:text-gold transition-colors">+91 98765 43210</a></div>
              <div className="flex items-center gap-2"><Mail size={14} className="text-gold flex-shrink-0" /><a href="mailto:info@ratanjewellers.com" className="hover:text-gold transition-colors">info@ratanjewellers.com</a></div>
            </div>
            <div className="mt-4 text-xs text-gold/60 font-mono-code">GSTIN: 27AABFR1234C1Z5</div>
          </div>
          <div>
            <h4 className="font-display text-base text-gold-light mb-4">Collections</h4>
            <ul className="space-y-2 text-sm">{['Necklaces','Rings','Bangles','Earrings','Chains','Pendants','Bracelets','Mangalsutras'].map(item => <li key={item}><Link href={`/products?category=${item.toLowerCase()}`} className="hover:text-gold transition-colors animated-underline">{item}</Link></li>)}</ul>
          </div>
          <div>
            <h4 className="font-display text-base text-gold-light mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">{[{ label: 'Track Your Order', href: '/track-order' }, { label: 'Return & Exchange', href: '/returns' }, { label: 'Warranty Policy', href: '/warranty' }, { label: 'Size Guide', href: '/size-guide' }, { label: 'Store Locator', href: '/store-locator' }, { label: 'FAQs', href: '/faq' }].map(item => <li key={item.href}><Link href={item.href} className="hover:text-gold transition-colors animated-underline">{item.label}</Link></li>)}</ul>
          </div>
          <div>
            <h4 className="font-display text-base text-gold-light mb-4">Information</h4>
            <ul className="space-y-2 text-sm mb-6">{[{ label: 'About Us', href: '/about' }, { label: 'Blog', href: '/blog' }, { label: 'BIS Hallmark Info', href: '/hallmark' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }].map(item => <li key={item.href}><Link href={item.href} className="hover:text-gold transition-colors animated-underline">{item.label}</Link></li>)}</ul>
            <h4 className="font-display text-base text-gold-light mb-3">Follow Us</h4>
            <div className="flex gap-3">{[{ icon: Share2, href: '#', label: 'Instagram' }, { icon: Globe, href: '#', label: 'Facebook' }, { icon: Video, href: '#', label: 'YouTube' }, { icon: Rss, href: '#', label: 'Twitter' }].map(({ icon: Icon, href, label }) => <a key={label} href={href} aria-label={label} className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center hover:border-gold hover:text-gold hover:bg-gold/10 transition-all"><Icon size={15} /></a>)}</div>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 w-fit px-4 py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-sm hover:bg-[#25D366]/20 transition-all"><MessageCircle size={15} />Chat on WhatsApp</a>
          </div>
        </div>
        <div className="gold-line mt-10 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gold-light/40">
          <p>© {new Date().getFullYear()} Ratan Jewellers. All rights reserved.</p>
          <div className="flex items-center gap-4"><span>🔒 Secure SSL</span><span>✓ BIS Certified</span><span>📦 PAN India Delivery</span></div>
        </div>
      </div>
    </footer>
  )
}
