import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import {
  HelpCircle,
  ShoppingBag,
  Truck,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  Gem,
  Phone,
  Mail,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'FAQs',
  description:
    'Find answers to frequently asked questions about Ratan Jewellers — ordering, payments, shipping, returns, jewellery care, and more.',
}

const categories = [
  { id: 'ordering', icon: ShoppingBag, label: 'Ordering' },
  { id: 'payments', icon: CreditCard, label: 'Payments' },
  { id: 'shipping', icon: Truck, label: 'Shipping' },
  { id: 'returns', icon: RefreshCw, label: 'Returns' },
  { id: 'jewellery', icon: Gem, label: 'Jewellery & Purity' },
  { id: 'trust', icon: ShieldCheck, label: 'Trust & Safety' },
]

const faqs: Record<string, { q: string; a: string }[]> = {
  ordering: [
    {
      q: 'How do I place an order on Ratan Jewellers?',
      a: 'Browse our collections, select the piece you love, choose your size or variant, and click "Add to Cart". Proceed to checkout, fill in your delivery details, select a payment method, and confirm your order. You will receive a confirmation email and SMS instantly.',
    },
    {
      q: 'Can I place an order over the phone?',
      a: 'Yes! Our customer care team is happy to assist you place an order over the phone or via WhatsApp. Call us at +91 98765 43210 (Mon–Sat, 10 AM – 7 PM IST).',
    },
    {
      q: 'Can I modify or cancel my order after placing it?',
      a: 'Orders can be modified or cancelled within 2 hours of placement. After that, the order enters processing and cannot be changed. Please contact us immediately via phone or WhatsApp if you need to make any changes.',
    },
    {
      q: 'Is it safe to order jewellery online?',
      a: 'Absolutely. Every order is securely packaged, fully insured during transit, and dispatched only to the verified delivery address. Our website uses SSL encryption to protect your data.',
    },
    {
      q: 'Do you accept custom jewellery orders?',
      a: "Yes, we specialise in custom-crafted jewellery. Visit our Custom Jewellery page or contact our team to discuss your design. Custom orders typically take 2–4 weeks and require a 50% advance payment.",
    },
  ],
  payments: [
    {
      q: 'What payment methods do you accept?',
      a: 'We accept UPI (GPay, PhonePe, Paytm), all major Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking, EMI (on cards and NBFC), and Cash on Delivery for orders up to ₹50,000.',
    },
    {
      q: 'Is EMI available on jewellery purchases?',
      a: 'Yes, No-Cost EMI is available on select Credit Cards and through NBFC partners (Bajaj Finserv, ZestMoney, etc.) for orders above ₹10,000. EMI options will be displayed at checkout.',
    },
    {
      q: 'Is my payment information secure?',
      a: 'Yes. All payments are processed via PCI-DSS compliant payment gateways (Razorpay / PayU). We never store your card details on our servers.',
    },
    {
      q: 'Why was my payment declined?',
      a: "Payment declines can happen due to incorrect card details, insufficient balance, bank blocks on e-commerce transactions, or OTP timeout. Please retry or use a different payment method. If the issue persists, contact your bank.",
    },
    {
      q: 'Can I pay in instalments without a credit card?',
      a: 'Yes, we offer NBFC-based EMI (e.g. Bajaj Finserv) that does not require a credit card. You can also enquire about our in-store instalment plans by contacting us.',
    },
  ],
  shipping: [
    {
      q: 'Is shipping free on all orders?',
      a: 'Standard shipping is completely free on all orders across India. Express delivery charges may apply for select cities and will be shown at checkout.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Metro cities: 2–4 business days. Tier 1 cities: 3–5 days. Tier 2 cities: 4–6 days. Remote areas: 6–10 days. International: 10–15 days. These are indicative and may vary during festive seasons.',
    },
    {
      q: 'How do I track my order?',
      a: 'Once dispatched, you will receive a tracking number via email and SMS. Use it on our Track Order page or directly on the courier partner website for real-time updates.',
    },
    {
      q: 'Do you ship internationally?',
      a: 'Yes, we ship to select countries including the USA, UK, UAE, Singapore, and Australia. International shipping charges and delivery times will be calculated at checkout.',
    },
    {
      q: 'What if I am not available to receive my order?',
      a: 'The courier will make up to 3 delivery attempts. After that, the parcel is held at the nearest hub for 5 days before being returned. Please contact us to reschedule delivery.',
    },
  ],
  returns: [
    {
      q: 'What is your return policy?',
      a: 'We offer a 7-day return window from the date of delivery for eligible items — including defective pieces, wrong items, or items significantly different from their description. Custom and personalised items are non-returnable.',
    },
    {
      q: 'How do I initiate a return or exchange?',
      a: 'Contact our customer care team within 7 days of delivery via phone, WhatsApp, or email with your order ID and reason. We will arrange a free reverse pickup from your address.',
    },
    {
      q: 'How long does a refund take?',
      a: 'After our quality team approves the return (2–3 business days), refunds are processed within 5–7 business days to your original payment method. Store credit is instant.',
    },
    {
      q: 'Can I exchange for a different design?',
      a: 'Yes. You can exchange for a different design of equal or higher value (pay the difference) subject to stock availability. Contact us within 15 days of delivery.',
    },
    {
      q: 'What is your lifetime exchange policy?',
      a: 'We offer a lifetime exchange on all gold and diamond jewellery purchased from Ratan Jewellers. Bring your piece to any of our stores, and we will apply the current gold market rate toward your new purchase.',
    },
  ],
  jewellery: [
    {
      q: 'What purity of gold do you sell?',
      a: 'We sell 18K, 22K, and 24K gold jewellery, all BIS hallmarked by a government-certified assay centre. The purity and hallmark details are mentioned on every product page and certificate.',
    },
    {
      q: 'Are your diamonds certified?',
      a: 'Yes. All diamonds above 0.25 carats come with a GIA or IGI certificate. Smaller diamonds are certified by our in-house gemologist. The certificate accompanies every purchase.',
    },
    {
      q: 'How should I care for my jewellery?',
      a: 'Store jewellery in separate soft pouches to avoid scratches. Avoid contact with perfumes, lotions, and chemicals. Remove jewellery before swimming or exercising. Clean gently with a soft cloth. Visit our store for professional cleaning.',
    },
    {
      q: 'Can I get my jewellery resized?',
      a: 'Yes, we offer resizing services for rings and bangles at our stores. Resizing is free within 15 days of purchase. After that, nominal charges may apply.',
    },
    {
      q: 'What is the making charge?',
      a: 'Making charges vary by design complexity and range from 8%–25% of the gold value. All charges are transparently listed on each product page with a breakup of gold value, making charge, and stone value.',
    },
  ],
  trust: [
    {
      q: 'Is Ratan Jewellers an authorised BIS hallmarking seller?',
      a: 'Yes. All our gold jewellery is BIS (Bureau of Indian Standards) hallmarked under the HUID (Hallmark Unique ID) system. You can verify the hallmark on the BIS Care app.',
    },
    {
      q: 'How do I know the jewellery is genuine?',
      a: 'Every piece comes with a BIS hallmark certificate, gemstone certificate (for diamond jewellery), and a Ratan Jewellers invoice with full purity and weight details. You can also visit our store for a free purity test.',
    },
    {
      q: 'Do you have a physical store?',
      a: 'Yes, we have stores across Odisha. Visit our Store Locator page for addresses, timings, and contact numbers of your nearest Ratan Jewellers showroom.',
    },
    {
      q: 'Is my personal data safe with Ratan Jewellers?',
      a: 'We take data privacy seriously. Your information is encrypted, stored securely, and never shared with third parties for marketing. Please read our Privacy Policy for full details.',
    },
    {
      q: 'Do you have a buyback policy?',
      a: 'Yes, we offer a buyback on all gold jewellery at the prevailing market rate minus applicable deductions. Visit any Ratan Jewellers store with your original invoice and certificate to initiate a buyback.',
    },
  ],
}

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="bg-[#fdf8f0] text-[#2d241f]">

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden bg-[#340008]">
          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #d6a84f 0, #d6a84f 1px, transparent 0, transparent 50%)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Gold orbs */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#d6a84f]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#d6a84f]/8 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="flex flex-col items-center text-center">

              {/* Icon ring */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d6a84f]/40 bg-[#d6a84f]/10 shadow-[0_0_40px_rgba(214,168,79,0.2)]">
                <HelpCircle size={34} className="text-[#d6a84f]" strokeWidth={1.5} />
              </div>

              {/* Ornament label */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#d6a84f]" />
                <span className="font-mono-code text-[10px] font-medium uppercase tracking-[0.25em] text-[#d6a84f]/70">
                  Help Centre
                </span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#d6a84f]" />
              </div>

              <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
                Frequently Asked{' '}
                <span className="gold-shimmer">Questions</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Everything you need to know about ordering, payments, delivery,
                returns, and the craftsmanship behind every Ratan Jewellers piece.
              </p>

              {/* Trust chips */}
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {[
                  { icon: ShoppingBag, label: 'Ordering & Payments' },
                  { icon: Truck, label: 'Shipping & Delivery' },
                  { icon: ShieldCheck, label: 'Trust & Safety' },
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

        {/* ─── CATEGORY TABS ─── */}
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <div className="mb-4 text-center">
            <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#C9A84C]">
              Browse by Topic
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#340008] sm:text-4xl">
              What Can We Help You With?
            </h2>
            <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          </div>

          {/* Category cards as anchor links */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(({ id, icon: Icon, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="luxury-card group flex flex-col items-center gap-3 rounded-xl p-5 text-center transition-all hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/8 transition-colors group-hover:border-[#C9A84C]/60 group-hover:bg-[#C9A84C]/20">
                  <Icon size={22} className="text-[#C9A84C]" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-[#340008]">{label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ─── FAQ SECTIONS ─── */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 space-y-20">
          {categories.map(({ id, icon: Icon, label }) => (
            <div key={id} id={id} className="scroll-mt-28">

              {/* Section heading */}
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10">
                  <Icon size={22} className="text-[#C9A84C]" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#340008]">{label}</h2>
                  <div className="mt-1 h-px w-16 bg-gradient-to-r from-[#C9A84C] to-transparent" />
                </div>
              </div>

              {/* FAQ Cards */}
              <div className="space-y-4">
                {faqs[id].map(({ q, a }) => (
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
            </div>
          ))}
        </section>

        {/* ─── STILL HAVE QUESTIONS ─── */}
        <section className="bg-[#340008] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-2 font-mono-code text-[10px] uppercase tracking-[0.25em] text-[#d6a84f]/70">
                Still Need Help?
              </p>
              <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                We Are Here for You
              </h2>
              <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#d6a84f] to-transparent" />
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/65">
                Did not find the answer you were looking for? Our customer care
                team is always happy to help you personally.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Phone,
                  title: 'Call Us',
                  desc: 'Mon–Sat, 10 AM – 7 PM IST',
                  action: 'tel:+919876543210',
                  cta: '+91 98765 43210',
                },
                {
                  icon: Mail,
                  title: 'Email Us',
                  desc: 'We respond within 24 hours',
                  action: 'mailto:care@ratanjewellers.com',
                  cta: 'care@ratanjewellers.com',
                },
                {
                  icon: HelpCircle,
                  title: 'Live Chat',
                  desc: 'Chat with us on WhatsApp',
                  action: 'https://wa.me/919876543210',
                  cta: 'Start Chat',
                },
              ].map(({ icon: Icon, title, desc, action, cta }) => (
                <a
                  key={title}
                  href={action}
                  target={action.startsWith('http') ? '_blank' : undefined}
                  rel={action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group flex flex-col rounded-xl border border-[#d6a84f]/20 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-[#d6a84f]/50 hover:bg-white/8"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#d6a84f]/25 bg-[#d6a84f]/10 transition-colors group-hover:border-[#d6a84f]/50">
                    <Icon size={26} className="text-[#d6a84f]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-white/55">{desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#d6a84f] transition-all group-hover:gap-2.5">
                    {cta}
                    <ChevronRight size={15} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ─── QUICK LINKS BANNER ─── */}
        <section className="border-b border-[#C9A84C]/20 bg-[#fdf8f0] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10">
                  <HelpCircle size={22} className="text-[#C9A84C]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-[#340008]">Looking for policy details?</p>
                  <p className="text-sm text-[#6b5b4e]">Read our dedicated Shipping & Returns pages for full policy information.</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
                <a
                  href="/shipping"
                  className="inline-flex items-center gap-2 rounded-sm border border-[#340008] px-5 py-2.5 text-sm font-semibold text-[#340008] transition hover:bg-[#340008] hover:text-white"
                >
                  <Truck size={15} />
                  Shipping Policy
                </a>
                <a
                  href="/returns"
                  className="btn-gold inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <RefreshCw size={15} />
                  Returns Policy
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
