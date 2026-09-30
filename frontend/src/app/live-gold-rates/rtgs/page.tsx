import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import LiveRatesBoard from '@/components/gold/LiveRatesBoard'

export const metadata: Metadata = {
  title: 'Live Gold Rates – RTGS | AIB Reference',
  description:
    "Today's live RTGS gold rates and silver rates in India, sourced from All India Bullion.",
}

export default function LiveGoldRatesRtgsPage() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen bg-[#fdf8f0] pt-16 text-[#2d241f] md:pt-20">
        <section className="bg-[#340008]">
          <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#d6a84f]" />
              <span className="font-mono-code text-[10px] font-medium uppercase tracking-[0.25em] text-[#d6a84f]/70">
                Powered by All India Bullion
              </span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#d6a84f]" />
            </div>
            <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl md:text-6xl">
              Live <span className="gold-shimmer">RTGS Rates</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/70">
              Today&apos;s RTGS gold and silver rates across India, updated through the trading day.
            </p>
          </div>
        </section>

        <LiveRatesBoard type="rtgs" />
      </main>
      <Footer />
    </>
  )
}