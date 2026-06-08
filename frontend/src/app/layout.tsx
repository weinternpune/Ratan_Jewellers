import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import SearchModal from '@/components/search/SearchModal'

export const metadata: Metadata = {
  title: { default: 'Ratan Jewellers - Timeless Luxury Since 1985', template: '%s | Ratan Jewellers' },
  description: 'Discover exquisite handcrafted jewellery. Gold, diamond, and precious stone jewellery with BIS hallmark certification.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <SearchModal />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#1A0E00', color: '#E8D5A3', border: '1px solid rgba(201, 168, 76, 0.3)' },
              success: { iconTheme: { primary: '#C9A84C', secondary: '#1A0E00' } }
            }}
          />
        </Providers>
        <Script 
          src="https://code.iconify.design/3/3.1.1/iconify.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}