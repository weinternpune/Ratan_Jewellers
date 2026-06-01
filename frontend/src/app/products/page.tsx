import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import ProductsClient from './ProductsClient'
export const metadata = { title: 'All Collections' }
export default function ProductsPage() {
  return (
    <main>
      <Navbar />
      <CartDrawer />
      <ProductsClient />
      <Footer />
    </main>
  )
}
