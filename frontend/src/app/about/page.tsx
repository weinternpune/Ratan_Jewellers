
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="bg-[#f8f4ed] text-[#2d241f]">
      <Navbar />
      {/* HERO */}
      <section className="relative h-[500px] md:h-[650px]">
        <Image
          src="/images/craftsmanship.jpg"
          alt="Craftsmanship"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
              A Century Of Craftsmanship
            </h1>
            <p className="max-w-xl text-gray-200 text-lg">
              Discover the passion behind every creation. Our artisans
              transform precious metals and gemstones into timeless treasures.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border bg-white p-8 text-center">
            <h3 className="text-2xl font-serif mb-4">Ethical Sourcing</h3>
            <p className="text-gray-600">Responsibly sourced diamonds and precious metals.</p>
          </div>
          <div className="border bg-white p-8 text-center">
            <h3 className="text-2xl font-serif mb-4">Master Artistry</h3>
            <p className="text-gray-600">Handcrafted excellence perfected over generations.</p>
          </div>
          <div className="border bg-white p-8 text-center">
            <h3 className="text-2xl font-serif mb-4">Customer Trust</h3>
            <p className="text-gray-600">Transparency and integrity in every purchase.</p>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-center text-4xl font-serif mb-20">
          Our Journey Through Time
        </h2>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[#b48a45] -translate-x-1/2" />

          <div className="space-y-24">

            {/* 1975 */}
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#b48a45] rotate-45 z-10" />
              <div className="md:text-right md:pr-16">
                <p className="text-[#b48a45] font-semibold">1975</p>
                <h3 className="text-3xl font-serif my-4">The Beginning</h3>
                <p className="text-gray-600">
                  Ratan Jewellers began with a dream of creating timeless jewellery.
                </p>
              </div>
              <div className="md:pl-16">
                <Image
                  src="/images/journey1.png"
                  alt="1975 – The Beginning"
                  width={600}
                  height={400}
                  className="rounded-lg w-full"
                />
              </div>
            </div>

            {/* 1995 */}
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#b48a45] rotate-45 z-10" />
              <div className="md:pr-16 order-2 md:order-1">
                <Image
                  src="/images/journey2.png"
                  alt="1995 – Growing Legacy"
                  width={600}
                  height={400}
                  className="rounded-lg w-full"
                />
              </div>
              <div className="md:pl-16 order-1 md:order-2">
                <p className="text-[#b48a45] font-semibold">1995</p>
                <h3 className="text-3xl font-serif my-4">Growing Legacy</h3>
                <p className="text-gray-600">
                  Expanding across Odisha with unmatched customer trust.
                </p>
              </div>
            </div>

            {/* 2025 */}
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#b48a45] rotate-45 z-10" />
              <div className="md:text-right md:pr-16">
                <p className="text-[#b48a45] font-semibold">2025</p>
                <h3 className="text-3xl font-serif my-4">Modern Luxury</h3>
                <p className="text-gray-600">
                  Combining traditional artistry with modern elegance.
                </p>
              </div>
              <div className="md:pl-16">
                <Image
                  src="/images/journey3.png"
                  alt="2025 – Modern Luxury"
                  width={600}
                  height={400}
                  className="rounded-lg w-full"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="bg-[#eee7db] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-4xl font-serif mb-16">The Visionaries</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <Image
                src="/images/founder.jpg"
                alt="Founder"
                width={500}
                height={600}
                className="w-full"
              />
              <h3 className="text-2xl font-serif mt-5">Founder</h3>
              <p className="text-gray-600">Visionary Leadership</p>
            </div>
            <div>
              <Image
                src="/images/director.png"
                alt="Director"
                width={500}
                height={600}
                className="w-full"
              />
              <h3 className="text-2xl font-serif mt-5">Managing Director</h3>
              <p className="text-gray-600">Driving Innovation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CRAFTSMANSHIP */}
      <section className="bg-[#181310] text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif mb-6">Unwavering Precision</h2>
              <p className="text-gray-300 mb-10">
                Every piece undergoes strict quality checks and meticulous craftsmanship.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[#b48a45] mb-2">Gold Purity</h4>
                  <p>22K &amp; 24K Hallmarked</p>
                </div>
                <div>
                  <h4 className="text-[#b48a45] mb-2">Diamonds</h4>
                  <p>Certified Stones</p>
                </div>
                <div>
                  <h4 className="text-[#b48a45] mb-2">Buyback</h4>
                  <p>Lifetime Exchange</p>
                </div>
                <div>
                  <h4 className="text-[#b48a45] mb-2">Craftsmanship</h4>
                  <p>Master Artisans</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Image src="/images/craft1.jpg" alt="" width={250} height={150} className="w-full" />
              <Image src="/images/craft2.jpg" alt="" width={250} height={150} className="w-full" />
              <Image src="/images/craft3.jpg" alt="" width={250} height={150} className="w-full" />
              <Image src="/images/journey3.png" alt="" width={250} height={150} className="w-full" />
            </div>
          </div>
        </div>
      </section>

      <Footer/>

    </main>
  );
}