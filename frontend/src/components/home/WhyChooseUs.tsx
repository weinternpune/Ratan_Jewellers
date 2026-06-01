'use client'

import { motion } from 'framer-motion'
import {
  BadgeCheck,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Truck,
  Undo2,
} from 'lucide-react'

const trustPoints = [
  {
    icon: ShieldCheck,
    title: '100% Hallmarked Jewellery',
  },
  {
    icon: BadgeCheck,
    title: 'BIS Certified Diamonds',
  },
  {
    icon: RotateCcw,
    title: 'Lifetime Exchange & Buyback',
  },
  {
    icon: Truck,
    title: 'Free & Insured Shipping',
  },
  {
    icon: Undo2,
    title: 'Easy Returns',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[#2b0008] py-7 sm:py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.1),transparent_42%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex w-full items-center justify-center gap-3 text-center">
          <span className="h-px w-8 bg-[var(--gold)]/70 sm:w-12" />
          <h2 className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-white sm:text-xl md:text-2xl">
            WHY CHOOSE RATAN JEWELLERS?
          </h2>
          <span className="h-px w-8 bg-[var(--gold)]/70 sm:w-12" />
        </div>

        <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-5 sm:gap-x-6 md:gap-x-8 md:gap-y-6 lg:gap-x-4 lg:gap-y-5">
          {trustPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.035, duration: 0.3 }}
              className="group flex items-center justify-start gap-3 text-left sm:justify-center sm:text-center lg:justify-start lg:text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[var(--gold)] transition-all duration-300 group-hover:border-[var(--gold)] group-hover:bg-[var(--gold)]/20">
                <point.icon size={19} strokeWidth={1.7} />
              </div>
              <h3 className="max-w-[160px] text-[12px] font-semibold leading-snug text-[#FFF6DE] sm:text-[13px] lg:max-w-[130px]">
                {point.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
