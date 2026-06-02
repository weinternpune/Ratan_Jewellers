import Image from "next/image";
import Link from "next/link";

import React from "react";
import {
  ShieldCheck,
  RefreshCcw,
  Gem,
  Wallet,
  ArrowRight,
} from "lucide-react";

const AboutRatanJewellers = () => {
  return (
    <section className="w-full bg-[#faf8f5] py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Image */}
          <div className="w-full">
            <img
              src="/images/ratan-couple.jpg"
              alt="Ratan Jewellers"
              className="w-full h-400px rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* Right Content */}
          <div>
            <p className="uppercase tracking-wider text-[#B0894F] font-semibold text-sm mb-3">
              About Ratan Jewellers
            </p>

            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-[#2E1F1A] leading-tight mb-6">
              A Legacy Of Trust,
              <br />
              Crafted With Purity
            </h2>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
              For over 25 years, Ratan Jewellers has been a symbol of trust,
              purity & timeless beauty. Each piece is crafted with precision,
              passion & promise.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <ShieldCheck className="w-9 h-9 text-[#C49A57] mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  100% Hallmarked Jewellery
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <RefreshCcw className="w-9 h-9 text-[#C49A57] mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Lifetime Exchange & Buyback
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Gem className="w-9 h-9 text-[#C49A57] mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Certified Diamonds
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Wallet className="w-9 h-9 text-[#C49A57] mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Secure Payments
                </p>
              </div>
            </div>

            {/* Button */}
            <Link
              href="/about"
              className="inline-flex items-center gap-3 bg-[#3D0B13] hover:bg-[#2b0710] text-white px-8 py-4 rounded-md font-medium transition-all duration-300"
            >
              KNOW MORE ABOUT US
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutRatanJewellers;