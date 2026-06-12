
import { Suspense } from 'react'
import ProductsClient from './ProductsClient'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export const metadata = {
  title: 'All Jewellery | Ratan Jewellers',
  description: 'Browse our curated collection of gold, silver, and diamond jewellery.',
}

function ProductsPageSkeleton() {
  return (
    <section className="py-8 lg:py-12 bg-[#f8f6f3]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
              <div className="w-full aspect-square bg-gray-200" />
              <div className="px-4 pt-3 pb-4 space-y-2.5">
                <div className="h-3.5 rounded-full bg-gray-200 w-4/5" />
                <div className="h-3 rounded-full bg-gray-200 w-1/2" />
                <div className="flex justify-between items-center">
                  <div className="h-4 rounded-full bg-gray-200 w-1/3" />
                  <div className="h-3 rounded-full bg-gray-200 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ProductsPage() {
  return (
 <>
  <Navbar />
  <CartDrawer />

  <main className="min-h-screen pt-16 md:pt-20 xl:pt-[124px]">
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsClient />
    </Suspense>
  </main>

  <Footer />
</>
  )
}