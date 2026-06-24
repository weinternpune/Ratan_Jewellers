import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import {
  Truck,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Globe,
  Zap,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shipping & Delivery',
  description:
    'Learn about Ratan Jewellers shipping policies, delivery timelines, packaging, and tracking. We offer free insured shipping across India.',
}

const shippingOptions = [
  {
    icon: Zap,
    title: 'Express Delivery',
    subtitle: '1–3 Business Days',
    description:
      'Priority handling and expedited courier for select cities across India. Perfect for gifts and special occasions.',
    badge: 'FASTEST',
    badgeColor: 'bg-[#d6a84f] text-[#340008]',
  },
  {
    icon: Truck,
    title: 'Standard Delivery',
    subtitle: '4–7 Business Days',
    description:
      'Reliable door-step delivery via our trusted courier partners. Available pan-India with full tracking support.',
    badge: 'FREE',
    badgeColor: 'bg-[#340008] text-[#d6a84f] border border-[#d6a84f]/50',
  },
  {
    icon: Globe,
    title: 'International Shipping',
    subtitle: '10–15 Business Days',
    description:
      'We ship to select international destinations. Customs duties and taxes are borne by the recipient as per local laws.',
    badge: 'GLOBAL',
    badgeColor: 'bg-white/10 text-white border border-white/20',
  },
]

const packagingFeatures = [
  {
    icon: Package,
    title: 'Luxury Gift Packaging',
    desc: 'Every order is beautifully wrapped in our signature gold-embossed Ratan Jewellers box.',
  },
  {
    icon: ShieldCheck,
    title: 'Fully Insured Transit',
    desc: 'All shipments are insured for their full invoice value, protecting you against loss or damage.',
  },
  {
    icon: RefreshCw,
    title: 'Tamper-Proof Sealing',
    desc: 'Orders are sealed with security tape and documented with photos before dispatch.',
  },
  {
    icon: CheckCircle,
    title: 'BIS Hallmark Certificates',
    desc: 'Relevant hallmark certificates and invoices are shipped alongside your jewellery.',
  },
]

const faqs = [
  {
    q: 'Is shipping free on all orders?',
    a: 'Yes, standard shipping is completely free on all orders across India. Express delivery charges may apply and will be displayed at checkout.',
  },
  {
    q: 'How can I track my order?',
    a: "Once your order is dispatched, you will receive an email and SMS with a tracking number. You can use this on our Track Order page or directly on the courier partner's website.",
  },
  {
    q: 'Can I change my delivery address after placing an order?',
    a: 'Address changes are possible within 2 hours of order placement. Please contact our customer care team immediately via phone or WhatsApp for assistance.',
  },
  {
    q: 'What happens if I am not available to receive the delivery?',
    a: 'Our courier partner will make up to 3 delivery attempts. After that, the parcel is held at the nearest hub for 5 days before being returned to us. Contact us to reschedule.',
  },
  {
    q: 'Do you ship to rural or remote areas?',
    a: 'We ship to most PIN codes across India. Enter your PIN code at checkout to confirm serviceability. If your area is not serviceable, we will inform you before processing.',
  },
  {
    q: 'Is my jewellery insured during transit?',
    a: 'Absolutely. Every shipment is fully insured for its invoice value. In the rare event of loss or damage in transit, we will replace or refund your order at no cost to you.',
  },
]

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="bg-[#fdf8f0] text-[#2d241f]">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-[#340008]">
        {/* Decorative background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #d6a84f 0, #d6a84f 1px, transparent 0, transparent 50%)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Gold gradient orbs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#d6a84f]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#d6a84f]/8 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d6a84f]/40 bg-[#d6a84f]/10 shadow-[0_0_40px_rgba(214,168,79,0.2)]">
              <Truck size={36} className="text-[#d6a84f]" strokeWidth={1.5} />
            </div>

            {/* Gold ornament line */}
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#d6a84f]" />
              <span className="font-mono-code text-[10px] font-medium uppercase tracking-[0.25em] text-[#d6a84f]/70">
                Customer Care
              </span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#d6a84f]" />
            </div>

            <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
              Shipping &amp;{' '}
              <span className="gold-shimmer">Delivery</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Every piece of Ratan Jewellers is dispatched with the utmost care,
              fully insured and elegantly packaged—because your treasure deserves
              a journey as precious as its destination.
            </p>

            {/* Quick trust chips */}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {[
                { icon: Truck, label: 'Free Shipping Pan-India' },
                { icon: ShieldCheck, label: 'Fully Insured' },
                { icon: Clock, label: 'Real-Time Tracking' },
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
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#fdf8f0]" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* ─── SHIPPING OPTIONS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
            Delivery Options
          </p>
          <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
            Choose Your Delivery
          </h2>
          <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shippingOptions.map(({ icon: Icon, title, subtitle, description, badge, badgeColor }) => (
            <div
              key={title}
              className="luxury-card group relative flex flex-col rounded-xl p-8"
            >
              {/* Badge */}
              <span className={`absolute right-5 top-5 rounded-full px-3 py-1 text-[9px] font-bold tracking-widest ${badgeColor}`}>
                {badge}
              </span>

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#C9A84C]/25 bg-[#C9A84C]/8 transition-colors group-hover:border-[#C9A84C]/50 group-hover:bg-[#C9A84C]/15">
                <Icon size={26} className="text-[#C9A84C]" strokeWidth={1.5} />
              </div>

              <h3 className="font-display text-xl font-semibold text-[#340008]">{title}</h3>
              <p className="mt-1 text-sm font-semibold text-[#C9A84C]">{subtitle}</p>
              <p className="mt-3 text-sm leading-6 text-[#6b5b4e]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="bg-[#340008] py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#d6a84f]/70">
              How It Works
            </p>
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Your Order&apos;s Journey
            </h2>
            <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#d6a84f] to-transparent" />
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line – visible on md+ */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#d6a84f]/20 md:block" />

            <div className="space-y-10 md:space-y-0">
              {[
                {
                  step: '01',
                  title: 'Order Confirmed',
                  desc: 'You receive an email & SMS confirmation with your order ID within minutes of placing the order.',
                  side: 'left',
                },
                {
                  step: '02',
                  title: 'Quality Check & Packaging',
                  desc: 'Our quality team inspects each piece. It is hallmark-verified, photographed, and luxuriously packaged.',
                  side: 'right',
                },
                {
                  step: '03',
                  title: 'Dispatched & Insured',
                  desc: 'Your parcel is handed to our courier partner fully insured. You receive a tracking number instantly.',
                  side: 'left',
                },
                {
                  step: '04',
                  title: 'Out for Delivery',
                  desc: 'The courier partner attempts delivery at your doorstep. You may track in real time via the provided link.',
                  side: 'right',
                },
                {
                  step: '05',
                  title: 'Delivered & Enjoyed',
                  desc: 'Receive your treasure! Please inspect in front of the delivery executive and report any concerns immediately.',
                  side: 'left',
                },
              ].map(({ step, title, desc, side }, idx) => (
                <div
                  key={step}
                  className={`relative flex items-start gap-6 md:grid md:grid-cols-2 md:gap-12 md:items-center ${
                    idx % 2 !== 0 ? 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1' : ''
                  }`}
                >
                  {/* Content */}
                  <div
                    className={`flex-1 rounded-xl border border-[#d6a84f]/20 bg-white/5 p-6 backdrop-blur-sm ${
                      side === 'right' ? 'md:text-left' : 'md:text-right'
                    }`}
                  >
                    <span className="font-display text-5xl font-semibold text-[#d6a84f]/20">
                      {step}
                    </span>
                    <h3 className="mt-1 font-display text-xl font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{desc}</p>
                  </div>

                  {/* Centre dot – only on md */}
                  <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
                    <div className="h-5 w-5 rotate-45 border-2 border-[#d6a84f] bg-[#340008]" />
                  </div>

                  {/* Spacer column for grid alignment */}
                  <div className="hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PACKAGING ─── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
            Packaging & Safety
          </p>
          <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
            Protected Every Step
          </h2>
          <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packagingFeatures.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="luxury-card group flex flex-col items-center rounded-xl p-8 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/8 transition-all group-hover:border-[#C9A84C]/50 group-hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]">
                <Icon size={28} className="text-[#C9A84C]" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#340008]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b5b4e]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DELIVERY ZONES ─── */}
      <section className="bg-[#f3ede3] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
              Coverage
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
              Delivery Timelines
            </h2>
            <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#C9A84C]/20 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-[#C9A84C]/20 bg-[#340008]">
                    <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Zone</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Locations</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Standard</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Express</th>
                    <th className="px-6 py-4 text-left font-semibold tracking-wide text-[#d6a84f]">Charges</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { zone: 'Metro Cities', locations: 'Mumbai, Delhi, Bengaluru, Chennai, Kolkata, Hyderabad', std: '2–4 Days', exp: '1–2 Days', charge: 'Free / ₹199' },
                    { zone: 'Tier 1 Cities', locations: 'Pune, Ahmedabad, Jaipur, Bhubaneswar, Lucknow, Chandigarh', std: '3–5 Days', exp: '2–3 Days', charge: 'Free / ₹249' },
                    { zone: 'Tier 2 Cities', locations: 'Cuttack, Rourkela, Berhampur & other cities', std: '4–6 Days', exp: '3–4 Days', charge: 'Free / ₹299' },
                    { zone: 'Remote Areas', locations: 'Villages, hilly regions, island territories', std: '6–10 Days', exp: 'N/A', charge: 'Free' },
                    { zone: 'International', locations: 'USA, UK, UAE, Singapore, Australia', std: '10–15 Days', exp: '7–10 Days', charge: 'Calculated at checkout' },
                  ].map((row, i) => (
                    <tr
                      key={row.zone}
                      className={`border-b border-[#C9A84C]/10 transition-colors hover:bg-[#C9A84C]/5 ${
                        i % 2 === 0 ? 'bg-white' : 'bg-[#fdf8f0]'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#340008]">{row.zone}</td>
                      <td className="px-6 py-4 text-[#6b5b4e]">{row.locations}</td>
                      <td className="px-6 py-4 text-[#2d241f]">{row.std}</td>
                      <td className="px-6 py-4 text-[#2d241f]">{row.exp}</td>
                      <td className="px-6 py-4 font-medium text-[#C9A84C]">{row.charge}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-[#6b5b4e]">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-[#C9A84C]" />
            Timelines are indicative and may vary during peak festive seasons (Diwali, Dhanteras, Akshaya Tritiya) or due to unforeseen logistics delays.
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
            <div
              key={q}
              className="luxury-card rounded-xl p-6"
            >
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

      {/* ─── CONTACT CTA ─── */}
      <section className="bg-[#340008] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <div>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                Need Help With Your Order?
              </h2>
              <p className="mt-2 text-white/70">
                Our customer care team is available Mon–Sat, 10 AM – 7 PM IST.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="tel:+917507510948"
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

      {/* ─── TRACK ORDER BANNER ─── */}
      <section className="border-b border-[#C9A84C]/20 bg-[#fdf8f0] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10">
                <MapPin size={22} className="text-[#C9A84C]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-semibold text-[#340008]">Track Your Order</p>
                <p className="text-sm text-[#6b5b4e]">Use your order ID to get real-time delivery updates.</p>
              </div>
            </div>
            <a
              href="/track-order"
              className="btn-gold inline-flex items-center gap-2 rounded-sm px-8 py-3 text-sm font-semibold text-white"
            >
              <Package size={16} />
              Track Now
            </a>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </>
  )
}
