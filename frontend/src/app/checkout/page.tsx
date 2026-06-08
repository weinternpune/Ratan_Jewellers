'use client';

import CheckOut from '@/components/cart/CheckOut'
import { useAuthGuard } from '@/lib/useAuthGuard';

export default function CheckoutPage() {
  const { isAuthenticated, isLoading } = useAuthGuard();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <CheckOut />
}