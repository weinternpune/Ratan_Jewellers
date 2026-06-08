import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Ratan Jewellers',
  description: 'Book a consultation or contact our jewellery specialists.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
