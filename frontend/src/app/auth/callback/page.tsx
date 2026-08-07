'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')

      if (!accessToken) {
        toast.error('Google login failed')
        router.replace('/login')
        return
      }

      try {
        localStorage.setItem('accessToken', accessToken)

        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }

        const response = await api.get<any>('/auth/me')

        const user = response.data?.user || response.data?.data?.user

        if (!user) {
          throw new Error('User information not found')
        }

        setAuth(
          user,
          accessToken,
          refreshToken ||
            localStorage.getItem('refreshToken') ||
            ''
        )

        toast.success('Google login successful')

        router.replace('/')
      } catch (error: any) {
        console.error('Google callback error:', error)

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        toast.error(
          error?.response?.data?.message ||
            'Google login failed'
        )

        router.replace('/login')
      }
    }

    handleCallback()
  }, [searchParams, router, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />

        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Please wait while we complete Google login.
        </p>
      </div>
    </div>
  )
}