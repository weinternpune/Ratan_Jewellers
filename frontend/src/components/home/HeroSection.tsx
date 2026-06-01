"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#f8f4ec] overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A84C]/10 rounded-full blur-3xl" />

      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 min-h-screen flex items-center">

        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

          {/* LEFT CONTENT */}
          <div className="z-10">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[1px] bg-[#C9A84C]" />
              <span className="uppercase tracking-[0.35em] text-sm text-[#9D7A2E] font-medium">
                New Collection 2025
              </span>
            </div>

            <h1 className="text-[4rem] md:text-[5rem] leading-[0.95] font-serif text-[#1a1a1a] font-semibold">
              Where <br />
              Tradition <br />
              Meets Elegance
            </h1>

            <p className="mt-8 text-lg leading-8 text-[#5f5f5f] max-w-xl">
              Handcrafted gold jewellery with BIS hallmark certification.
              Pure craftsmanship blended with timeless luxury.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-5 mt-10">

              <Link
                href="/collections"
                className="px-8 py-4 bg-[#C9A84C] text-white rounded-full font-medium hover:bg-[#9D7A2E] transition-all duration-300 shadow-lg"
              >
                Explore Collection
              </Link>

              <Link
                href="/lookbook"
                className="px-8 py-4 border border-[#C9A84C] text-[#9D7A2E] rounded-full font-medium hover:bg-[#C9A84C]/10 transition-all duration-300"
              >
                View Lookbook
              </Link>

            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16">

              <div>
                <h3 className="text-3xl font-bold text-[#1a1a1a]">40+</h3>
                <p className="text-[#777] mt-1">Years of Trust</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#1a1a1a]">50K+</h3>
                <p className="text-[#777] mt-1">Happy Families</p>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-[#1a1a1a]">BIS</h3>
                <p className="text-[#777] mt-1">Certified Gold</p>
              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex justify-center items-center">

            {/* Outer Ring */}
            <div className="absolute w-[420px] h-[420px] border border-[#C9A84C]/20 rounded-full animate-pulse" />

            {/* Inner Ring */}
            <div className="absolute w-[320px] h-[320px] border border-[#C9A84C]/30 rounded-full" />

            {/* Center Logo */}
            <div className="w-[220px] h-[220px] rounded-full bg-white shadow-2xl flex items-center justify-center border border-[#eee]">
              <span className="text-6xl font-serif text-[#222]">
                रतन
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}