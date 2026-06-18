'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function AdminRootPage() {
  const router = useRouter()
  const { isLoggedIn, currentUser, getEffectiveRole } = useAuthStore()

  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      router.replace('/login')
      return
    }
    const role = getEffectiveRole()
    if (['customer', 'sales_staff', 'inventory_manager'].includes(role)) {
      router.replace('/admin/my-dashboard')
    } else {
      router.replace('/admin/dashboard')
    }
  }, [isLoggedIn, currentUser])

  return (
    <div className="flex items-center justify-center h-screen bg-[#F5F0E8]">
      <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
