import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  Package,
  AlertCircle,
  ArrowRight,
  Star,
  Repeat,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Returns & Exchange',
  description:
    'Ratan Jewellers offers a hassle-free returns and exchange policy. Learn about our 7-day return window, exchange process, eligibility conditions, and how to initiate a return.',
}

const returnSteps = [
  {
    step: '01',
    icon: MessageCircle,
    title: 'Raise a Request',
    desc: 'Contact our team within 7 days of delivery via phone, email, or WhatsApp. Provide your order ID and reason for return.',
  },
  {
    step: '02',
    icon: Package,
    title: 'Pack & Ship',
    desc: 'Securely repack the jewellery in its original box with all certificates and accessories. We will arrange a free pickup from your address.',
  },
  {
    step: '03',
    icon: BadgeCheck,
    title: 'Quality Inspection',
    desc: 'Our quality team inspects the returned piece within 2–3 business days to verify it meets the return conditions.',
  },
  {
    step: '04',
    icon: RefreshCw,
    title: 'Refund / Exchange',
    desc: 'Upon approval, your refund is processed within 5–7 business days, or your exchange piece is dispatched within 3–5 business days.',
  },
]

const eligibleItems = [
  'Jewellery received in damaged or defective condition',
  'Items significantly different from their website description',
  'Wrong item delivered against your order',
  'Manufacturing defects verified by our quality team',
  'Hallmark certificate missing or incorrect',
]

const nonEligibleItems = [
  'Custom-made or personalised jewellery (engraving, size alterations)',
  'Items returned after 7 days from delivery date',
  'Jewellery showing signs of wear, alteration, or resizing',
  'Items without original packaging, tags, or certificates',
  'Jewellery purchased during clearance or flash sales',
  'Items damaged due to mishandling by the customer',
]

const exchangeOptions = [
  {
    icon: Repeat,
    title: 'Size Exchange',
    desc: 'Rings and bangles can be exchanged for a different size. Applicable once per order within 15 days of delivery.',
    tag: 'POPULAR',
  },
  {
    icon: Star,
    title: 'Design Exchange',
    desc: 'Exchange your piece for a different design of equal or higher value (pay the difference). Subject to stock availability.',
    tag: 'FLEXIBLE',
  },
  {
    icon: RefreshCw,
    title: 'Upgrade Exchange',
    desc: 'Trade in your jewellery and upgrade to a higher-value piece. The current market gold rate will be applied to your item.',
    tag: 'LIFETIME',
  },
]

const faqs = [
  {
    q: 'What is the return window for Ratan Jewellers?',
    a: 'We offer a 7-day return window from the date of delivery for eligible items. Returns requested after 7 days will not be accepted.',
  },
  {
    q: 'How long does a refund take to process?',
    a: 'Once our quality team approves the return, refunds are processed within 5–7 business days to your original payment method (bank account, UPI, card, etc.).',
  },
  {
    q: 'Will I get a full refund including shipping?',
    a: 'Yes, for items returned due to defects or incorrect delivery, you will receive a full refund including any shipping charges paid. For change-of-mind returns, the refund is for the item value only.',
  },
  {
    q: 'Can I exchange a gifted item?',
    a: 'Yes! Gifted items can be exchanged within 15 days of delivery. The exchange recipient will need to present the original invoice or order ID.',
  },
  {
    q: 'Is return shipping free?',
    a: 'Yes, we arrange a free reverse pickup for all approved return requests across India. You do not need to ship it yourself.',
  },
  {
    q: 'What if my jewellery is damaged in transit during return?',
    a: 'All return shipments are insured end-to-end. If damage occurs during transit of an approved return, we will process your refund or exchange in full.',
  },
]

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="bg-[#fdf8f0] text-[#2d241f]">

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden bg-[#340008]">
          {/* Decorative diagonal grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #d6a84f 0, #d6a84f 1px, transparent 0, transparent 50%)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Glowing orbs */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#d6a84f]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#d6a84f]/8 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="flex flex-col items-center text-center">

              {/* Icon ring */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d6a84f]/40 bg-[#d6a84f]/10 shadow-[0_0_40px_rgba(214,168,79,0.2)]">
                <RefreshCw size={34} className="text-[#d6a84f]" strokeWidth={1.5} />
              </div>

              {/* Ornament label */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#d6a84f]" />
                <span className="font-mono-code text-[10px] font-medium uppercase tracking-[0.25em] text-[#d6a84f]/70">
                  Customer Care
                </span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#d6a84f]" />
              </div>

              <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
                Returns &amp;{' '}
                <span className="gold-shimmer">Exchange</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Your satisfaction is our highest priority. We make returns and
                exchanges effortless—because every piece of Ratan Jewellers
                should be a source of joy, not worry.
              </p>

              {/* Trust chips */}
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {[
                  { icon: Clock, label: '7-Day Return Window' },
                  { icon: ShieldCheck, label: 'Free Reverse Pickup' },
                  { icon: Repeat, label: 'Lifetime Exchange' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d6a84f]/30 bg-[#d6a84f]/10 px-4 py-2 text-xs font-medium text-[#d6a84f] backdrop-blur-sm"
                  >
                    <Icon size={13} strokeWidth={2} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom wave */}
          <div
            className="absolute bottom-0 left-0 right-0 h-10 bg-[#fdf8f0]"
            style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }}
          />
        </section>

        {/* ─── HOW TO RETURN ─── */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
              Step-by-Step
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
              How to Return an Item
            </h2>
            <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {returnSteps.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="luxury-card group relative flex flex-col rounded-xl p-8">
                {/* Step number watermark */}
                <span className="absolute right-5 top-4 font-display text-5xl font-semibold text-[#C9A84C]/10 select-none">
                  {step}
                </span>

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#C9A84C]/25 bg-[#C9A84C]/8 transition-colors group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/15">
                  <Icon size={26} className="text-[#C9A84C]" strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-xl font-semibold text-[#340008]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6b5b4e]">{desc}</p>

                {/* Arrow connector (hidden on last) */}
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:last:hidden lg:block z-10">
                  <ArrowRight size={20} className="text-[#C9A84C]/40" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── EXCHANGE OPTIONS ─── */}
        <section className="bg-[#340008] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#d6a84f]/70">
                Exchange Programme
              </p>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Flexible Exchange Options
              </h2>
              <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#d6a84f] to-transparent" />
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/65">
                Not happy with your piece? We offer multiple exchange options designed
                around your convenience.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {exchangeOptions.map(({ icon: Icon, title, desc, tag }) => (
                <div
                  key={title}
                  className="group relative flex flex-col rounded-xl border border-[#d6a84f]/20 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-[#d6a84f]/50 hover:bg-white/8"
                >
                  {/* Tag */}
                  <span className="absolute right-5 top-5 rounded-full border border-[#d6a84f]/40 px-3 py-1 text-[9px] font-bold tracking-widest text-[#d6a84f]">
                    {tag}
                  </span>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#d6a84f]/25 bg-[#d6a84f]/10 transition-colors group-hover:border-[#d6a84f]/50">
                    <Icon size={26} className="text-[#d6a84f]" strokeWidth={1.5} />
                  </div>

                  <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ELIGIBLE / NOT ELIGIBLE ─── */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
              Policy Details
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
              Return Eligibility
            </h2>
            <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Eligible */}
            <div className="luxury-card rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#C9A84C]/15 bg-[#C9A84C]/5 px-8 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[#340008]">
                  Eligible for Return
                </h3>
              </div>
              <ul className="space-y-0 px-8 py-6">
                {eligibleItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-b border-[#C9A84C]/10 py-3.5 last:border-0"
                  >
                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-sm leading-6 text-[#2d241f]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Eligible */}
            <div className="luxury-card rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 border-b border-[#C9A84C]/15 bg-red-50/50 px-8 py-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
                  <XCircle size={20} className="text-red-500" />
                </div>
                <h3 className="font-display text-xl font-semibold text-[#340008]">
                  Not Eligible for Return
                </h3>
              </div>
              <ul className="space-y-0 px-8 py-6">
                {nonEligibleItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-b border-[#C9A84C]/10 py-3.5 last:border-0"
                  >
                    <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                    <span className="text-sm leading-6 text-[#2d241f]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── REFUND TIMELINE ─── */}
        <section className="bg-[#f3ede3] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
                Refund Details
              </p>
              <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
                Refund Methods &amp; Timelines
              </h2>
              <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#C9A84C]/20 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-[#C9A84C]/20 bg-[#340008]">
                      <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Payment Method</th>
                      <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Refund To</th>
                      <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Timeline</th>
                      <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { method: 'UPI / Net Banking', to: 'Bank Account', timeline: '3–5 Business Days', note: 'Fastest refund method' },
                      { method: 'Credit / Debit Card', to: 'Original Card', timeline: '5–7 Business Days', note: 'Depends on bank processing' },
                      { method: 'Ratan Store Credit', to: 'Store Wallet', timeline: 'Instant', note: 'Use on any future purchase' },
                      { method: 'Cash on Delivery', to: 'Bank Transfer', timeline: '5–7 Business Days', note: 'Bank account details required' },
                      { method: 'EMI (Card/NBFC)', to: 'Original Source', timeline: '7–10 Business Days', note: 'Refund credited after EMI cancellation' },
                    ].map((row, i) => (
                      <tr
                        key={row.method}
                        className={`border-b border-[#C9A84C]/10 transition-colors hover:bg-[#C9A84C]/5 ${
                          i % 2 === 0 ? 'bg-white' : 'bg-[#fdf8f0]'
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-[#340008]">{row.method}</td>
                        <td className="px-6 py-4 text-[#2d241f]">{row.to}</td>
                        <td className="px-6 py-4 font-medium text-[#C9A84C]">{row.timeline}</td>
                        <td className="px-6 py-4 text-[#6b5b4e]">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs text-[#6b5b4e]">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-[#C9A84C]" />
              Timelines begin after the returned item passes our quality inspection. Refunds are not initiated until inspection is complete.
            </p>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
              Got Questions?
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
              Frequently Asked
            </h2>
            <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          </div>

          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="luxury-card rounded-xl p-6">
                <h3 className="flex items-start gap-3 font-semibold text-[#340008]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10">
                    <CheckCircle size={11} className="text-[#C9A84C]" />
                  </span>
                  {q}
                </h3>
                <p className="mt-3 pl-8 text-sm leading-6 text-[#6b5b4e]">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── IMPORTANT NOTICE ─── */}
        <section className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="flex gap-4 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-6">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#C9A84C]" />
            <div>
              <p className="font-semibold text-[#340008]">Important Notice</p>
              <p className="mt-1 text-sm leading-6 text-[#6b5b4e]">
                All returned items must be in their original, unworn condition with original packaging,
                price tags, authenticity certificates, and invoice. Items not meeting these conditions
                will be returned to the customer at their expense and no refund will be issued.
              </p>
            </div>
          </div>
        </section>

        {/* ─── CONTACT CTA ─── */}
        <section className="bg-[#340008] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
              <div>
                <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                  Need Help With a Return?
                </h2>
                <p className="mt-2 text-white/70">
                  Our customer care team is available Mon–Sat, 10 AM – 7 PM IST.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-2 rounded-sm border border-[#d6a84f] bg-transparent px-6 py-3 text-sm font-semibold text-[#d6a84f] transition hover:bg-[#d6a84f] hover:text-[#340008]"
                >
                  <Phone size={16} />
                  Call Us
                </a>
                <a
                  href="mailto:care@ratanjewellers.com"
                  className="btn-gold inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold text-white"
                >
                  <Mail size={16} />
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── INITIATE RETURN BANNER ─── */}
        <section className="border-b border-[#C9A84C]/20 bg-[#fdf8f0] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10">
                  <Package size={22} className="text-[#C9A84C]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-[#340008]">Ready to Return or Exchange?</p>
                  <p className="text-sm text-[#6b5b4e]">Initiate your request online or reach us directly — we will handle the rest.</p>
                </div>
              </div>
              <a
                href="/contact"
                className="btn-gold inline-flex items-center gap-2 rounded-sm px-8 py-3 text-sm font-semibold text-white"
              >
                <RefreshCw size={16} />
                Initiate Return
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
