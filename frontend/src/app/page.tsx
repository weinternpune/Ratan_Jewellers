import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import CartDrawer from '@/components/cart/CartDrawer'
import FeaturedCategories from '@/components/home/FeaturedCategories'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import LiveGoldRate from '@/components/home/LiveGoldRate'
import Testimonials from '@/components/home/Testimonials'
import AboutUs from '@/components/home/AboutUs'
import WhyChooseUs from '@/components/home/WhyChooseUs'


export default function HomePage() {
  return (
    <main>
      <Navbar />
      <CartDrawer />
      <HeroSection />
      <LiveGoldRate />
      <FeaturedCategories />
      <FeaturedProducts title="New Arrivals" filter="newest" />
      <AboutUs />
      <WhyChooseUs />
      <FeaturedProducts title="Trending Now" filter="trending" />
      <Testimonials />
      <Footer />
    </main>
  )
}
