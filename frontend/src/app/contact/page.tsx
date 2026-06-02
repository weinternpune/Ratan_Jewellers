import Image from 'next/image'
import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  Gem,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export const metadata = { title: 'Contact Us' }

const contactMethods = [
  {
    label: 'Call Our Store',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
    icon: Phone,
  },
  {
    label: 'WhatsApp Concierge',
    value: '+91 98765 43210',
    href: 'https://wa.me/919876543210',
    icon: MessageCircle,
  },
  {
    label: 'Email Enquiries',
    value: 'care@ratanjewellers.com',
    href: 'mailto:care@ratanjewellers.com',
    icon: Mail,
  },
]

const services = [
  'Bridal jewellery consultation',
  'Custom jewellery design',
  'Gold, diamond, and silver enquiries',
  'Repair, polishing, and resizing',
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FAF6EE] text-[#2C2C2C]">
      <Navbar />
      <CartDrawer />

      <section className="relative min-h-[560px] overflow-hidden bg-[#181310] text-white">
        <Image
          src="/images/craftsmanship.jpg"
          alt="Ratan Jewellers handcrafted jewellery"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#181310]/95 via-[#181310]/78 to-[#340008]/42" />
        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 border border-[#C9A84C]/45 bg-[#181310]/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E8D5A3]">
              <Gem size={15} />
              Ratan Jewellers Concierge
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Contact Us
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/82 sm:text-lg">
              Speak with our jewellery specialists for bridal selections, custom
              designs, gold rate guidance, and after-care for your treasured
              pieces.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="tel:+919876543210"
                className="btn-gold inline-flex items-center gap-2 px-6 py-3 text-sm uppercase"
              >
                <Phone size={17} />
                Call Now
              </Link>
              <Link
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#C9A84C]/60 bg-white/8 px-6 py-3 text-sm font-semibold uppercase tracking-[0.05em] text-[#E8D5A3] transition hover:bg-[#C9A84C] hover:text-[#181310]"
              >
                <MessageCircle size={17} />
                WhatsApp
              </Link>
            </div>
          </div>

          <div className="overflow-hidden border border-[#D6A84F]/70 bg-[#FFF9EF] text-[#2C2C2C] shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
            <div className="bg-[#340008] px-6 py-6 text-white sm:px-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E8D5A3]">
                Personal Assistance
              </p>
              <h2 className="font-display text-3xl font-semibold">
                Book A Jewellery Consultation
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/78">
                Share your occasion, preferred style, and budget. Our team will
                guide you toward the right piece.
              </p>
            </div>

            <form className="grid gap-4 p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#71531A]">
                    Name
                  </span>
                  <input
                    type="text"
                    name="name"
                    className="w-full border border-[#E0C883] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none transition placeholder:text-[#8a7c70] focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/30"
                    placeholder="Your full name"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#71531A]">
                    Phone
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full border border-[#E0C883] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none transition placeholder:text-[#8a7c70] focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/30"
                    placeholder="+91"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#71531A]">
                  Interest
                </span>
                <select
                  name="interest"
                  className="w-full border border-[#E0C883] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none transition focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/30"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select enquiry type
                  </option>
                  <option>Bridal jewellery</option>
                  <option>Engagement ring</option>
                  <option>Gold jewellery</option>
                  <option>Diamond jewellery</option>
                  <option>Silver jewellery</option>
                  <option>Necklace set</option>
                  <option>Bangles and bracelets</option>
                  <option>Daily wear jewellery</option>
                  <option>Gifting collection</option>
                  <option>Custom design</option>
                  <option>Gold exchange or buyback</option>
                  <option>Repair or resizing</option>
                </select>
              </label>

              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#71531A]">
                  Consultation Type
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {['Store Visit', 'Phone Call', 'WhatsApp'].map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 border border-[#E0C883] bg-white px-3 py-3 text-sm font-medium text-[#340008]"
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value={type}
                        className="accent-[#C9A84C]"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#71531A]">
                  Message
                </span>
                <textarea
                  name="message"
                  rows={4}
                  className="w-full resize-none border border-[#E0C883] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none transition placeholder:text-[#8a7c70] focus:border-[#9D7A2E] focus:ring-2 focus:ring-[#C9A84C]/30"
                  placeholder="Tell us about the occasion, budget, preferred metal, or design idea."
                />
              </label>

              <button
                type="submit"
                className="btn-gold mt-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase shadow-[0_10px_24px_rgba(201,168,76,0.28)]"
              >
                <Send size={17} />
                Send Enquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {contactMethods.map(({ label, value, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="luxury-card group flex items-start gap-4 p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#340008] text-[#C9A84C] transition group-hover:bg-[#C9A84C] group-hover:text-[#340008]">
                <Icon size={21} />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#71531A]">
                  {label}
                </span>
                <span className="mt-2 block text-base font-semibold text-[#2C2C2C]">
                  {value}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#C9A84C]">
              Visit Our Showroom
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-[#340008] sm:text-5xl">
              Guidance For Every Precious Choice
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-[#6f6257]">
              Our consultants help with purity, certification, styling,
              customization, and care so every purchase feels considered.
            </p>

            <div className="mt-8 grid gap-4">
              <InfoRow icon={MapPin} title="Showroom" text="Main Road, Bhubaneswar, Odisha 751001" />
              <InfoRow icon={Clock} title="Timings" text="Monday to Sunday, 10:00 AM - 8:30 PM" />
              <InfoRow icon={CalendarDays} title="Appointments" text="Priority slots available for bridal and custom design consultations" />
              <InfoRow icon={ShieldCheck} title="Assurance" text="BIS hallmarked gold and certified diamond guidance" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="border border-[#E8D5A3] bg-[#FAF6EE] p-6">
              <Sparkles className="text-[#C9A84C]" size={28} />
              <h3 className="mt-5 font-display text-2xl font-semibold text-[#340008]">
                Jewellery Services
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5f554d]">
                {services.map((service) => (
                  <li key={service} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#C9A84C]" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-[340px] overflow-hidden bg-[#340008]">
              <Image
                src="/images/craft1.jpg"
                alt="Jewellery detail"
                fill
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#340008]/82 to-transparent" />
              <div className="absolute bottom-0 p-6 text-white">
                <p className="font-display text-3xl font-semibold">
                  Designed with care, finished with trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

function InfoRow({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof MapPin
  title: string
  text: string
}) {
  return (
    <div className="flex gap-4 border-l-2 border-[#C9A84C] bg-[#FAF6EE] px-5 py-4">
      <Icon className="mt-1 shrink-0 text-[#C9A84C]" size={21} />
      <div>
        <h3 className="font-semibold text-[#340008]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#6f6257]">{text}</p>
      </div>
    </div>
  )
}
