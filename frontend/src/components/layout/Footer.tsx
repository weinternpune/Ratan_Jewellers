'use client'

import Link from 'next/link'
import {
  ArrowUp,
  BadgeCheck,
  Camera,
  CreditCard,
  Crown,
  Globe,
  MessageCircle,
  Play,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Collections', href: '/products' },
  { label: 'Gold', href: '/products?category=gold' },
  { label: 'Diamond', href: '/products?category=diamond' },
  { label: 'Silver', href: '/products?category=silver' },
  { label: 'Custom Jewellery', href: '/custom-jewellery' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

const customerCare = [
  { label: 'FAQs', href: '/faq' },
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Returns & Exchange', href: '/returns' },
  { label: 'Track Your Order', href: '/track-order' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

const information = [
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Store Locator', href: '/store-locator' },
  { label: 'Careers', href: '/careers' },
  { label: 'Sitemap', href: '/sitemap' },
]

const socialLinks = [
  { label: 'Facebook', href: '#', icon: Globe },
  { label: 'Instagram', href: '#', icon: Camera },
  { label: 'YouTube', href: '#', icon: Play },
  { label: 'WhatsApp', href: 'https://wa.me/919876543210', icon: MessageCircle },
]

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative bg-[#340008] text-white">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr_1.35fr]">
          <div>
            <Link href="/" className="flex items-center gap-4">
              <LogoMark />
              <span className="font-display text-[1.8rem] font-semibold leading-none tracking-normal text-[#d6a84f]">
                RATAN JEWELLERS
              </span>
            </Link>
            <p className="mt-5 max-w-[230px] text-sm font-medium leading-6 text-white/85">
              Timeless Elegance, Trusted Since Generations.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6a84f]/70 text-[#d6a84f] transition hover:bg-[#d6a84f] hover:text-[#340008]"
                >
                  <Icon size={17} strokeWidth={2.1} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links" links={quickLinks} />
          <FooterColumn title="Customer Care" links={customerCare} />
          <FooterColumn title="Information" links={information} />

          <div>
            <h3 className="text-sm font-bold uppercase tracking-normal text-white">Newsletter</h3>
            <p className="mt-4 max-w-[260px] text-sm leading-6 text-white/78">
              Stay updated with our latest collections and offers.
            </p>
            <form className="mt-5 flex max-w-[280px] overflow-hidden rounded-sm bg-white shadow-sm">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Enter your email"
                className="min-w-0 flex-1 px-4 py-3 text-sm text-[#340008] outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex w-12 items-center justify-center text-[#340008] transition hover:bg-[#f3e8d5]"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-4 text-xs text-white/80 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Ratan Jewellers. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
            <TrustItem icon={CreditCard} label="Secure Payments" />
            <TrustItem icon={ShieldCheck} label="100% Hallmarked" />
            <TrustItem icon={Truck} label="Free Shipping" />
          </div>
          <div className="flex items-center gap-4 font-bold tracking-wide text-white">
            <span>VISA</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-[#eb001b]" />
              <span className="-ml-2 h-3 w-3 rounded-full bg-[#f79e1b]" />
            </span>
            <span>RuPay</span>
            <span>UPI</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Back to top"
        onClick={scrollToTop}
        className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#d6a84f] text-[#340008] shadow-lg transition hover:-translate-y-1 hover:bg-[#e4bd6f]"
      >
        <ArrowUp size={20} strokeWidth={2.4} />
      </button>
    </footer>
  )
}

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-2 border-[#d6a84f] bg-[#340008] shadow-[0_0_22px_rgba(214,168,79,0.28)]"
    >
      <span className="absolute inset-1.5 rounded-full border border-[#d6a84f]/45" />
      <Crown
        size={19}
        strokeWidth={2}
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 fill-[#d6a84f]/20 text-[#d6a84f]"
      />
      <span className="font-display text-[2.35rem] font-semibold leading-none text-[#d6a84f]">
        R
      </span>
    </span>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string }>
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-normal text-white">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-white/78">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="transition hover:text-[#d6a84f]">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: typeof BadgeCheck
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Icon size={16} className="text-[#d6a84f]" />
      {label}
    </span>
  )
}
