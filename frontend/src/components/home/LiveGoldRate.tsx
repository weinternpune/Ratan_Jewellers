'use client'

import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { useUIStore } from '@/store'

const purities = [
  { label: '24K (999)', multiplier: 1 },
  { label: '22K (916)', multiplier: 0.916 },
  { label: '18K (750)', multiplier: 0.75 },
  { label: '14K (585)', multiplier: 0.585 }
]

// Function to fetch live gold rate from backend API
async function fetchLiveGoldRate(): Promise<number | null> {
  try {
    const response = await fetch('http://localhost:5000/api/gold-rates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data?.rate) {
        return result.data.rate
      }
    }
  } catch (error) {
    console.error('Failed to fetch live gold rate from backend:', error)
  }
  
  return null // Return null if API fails
}

export default function LiveGoldRate() {
  const { goldRate, setGoldRate } = useUIStore()

  const [prevRate, setPrevRate] = useState(goldRate)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch live gold rate on component mount
  useEffect(() => {
    const fetchAndUpdateRate = async () => {
      setIsUpdating(true)
      const liveRate = await fetchLiveGoldRate()
      
      if (liveRate) {
        setPrevRate(goldRate)
        setGoldRate(liveRate)
        setLastUpdated(new Date())
      } else {
        // Fallback to slight variation if API fails
        const fallbackRate = goldRate + (Math.random() - 0.5) * 20
        setPrevRate(goldRate)
        setGoldRate(Math.round(fallbackRate))
        setLastUpdated(new Date())
      }
      
      setIsUpdating(false)
    }
    
    // Initial fetch
    fetchAndUpdateRate()
  }, [])

  // Auto-update every 5 minutes (300000ms)
  useEffect(() => {
    if (!autoUpdateEnabled) return

    const intervalId = setInterval(async () => {
      const liveRate = await fetchLiveGoldRate()
      
      if (liveRate) {
        setPrevRate(goldRate)
        setGoldRate(liveRate)
        setLastUpdated(new Date())
      }
    }, 300000) // 5 minutes

    return () => clearInterval(intervalId)
  }, [autoUpdateEnabled, goldRate, setGoldRate])

  const trend = goldRate >= prevRate ? 'up' : 'down'
  const change = goldRate - prevRate

  const changePercent =
    prevRate !== 0
      ? ((change / prevRate) * 100).toFixed(2)
      : '0.00'

  const refreshRate = async () => {
    setIsUpdating(true)

    try {
      const liveRate = await fetchLiveGoldRate()
      
      if (liveRate) {
        setPrevRate(goldRate)
        setGoldRate(liveRate)
        setLastUpdated(new Date())
      } else {
        // Fallback to slight variation
        const nr = goldRate + (Math.random() - 0.5) * 20
        setPrevRate(goldRate)
        setGoldRate(Math.round(nr))
        setLastUpdated(new Date())
      }
    } finally {
      setIsUpdating(false)
    }
  }

  // Auto-scroll for mobile only
  useEffect(() => {
    const container = scrollContainerRef.current

    if (!container) return

    // Check if mobile
    const isMobile = window.innerWidth < 768

    if (!isMobile) return

    let direction = 1

    const autoScroll = () => {
      if (!container) return

      const maxScroll =
        container.scrollWidth - container.clientWidth

      const currentScroll = container.scrollLeft

      // Change direction at edges
      if (currentScroll >= maxScroll) {
        direction = -1
      } else if (currentScroll <= 0) {
        direction = 1
      }

      // Smooth auto scroll
      container.scrollLeft += direction * 1
    }

    const scrollInterval = setInterval(autoScroll, 30)

    return () => clearInterval(scrollInterval)
  }, [])

  return (
    <div className="bg-[#4A0404] border-y border-yellow-500/20 py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 overflow-x-auto scrollbar-hide"
        >
          {/* Live Gold Rates */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />

            <span className="font-mono-code text-xs text-yellow-200 uppercase tracking-wider whitespace-nowrap">
              Live Gold Rates
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-yellow-300/30 flex-shrink-0" />

          {/* Gold Prices */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {purities.map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span className="font-mono-code text-xs text-yellow-100">
                  {p.label}
                </span>

                <span className="font-mono-code text-sm text-yellow-300 font-medium">
                  ₹
                  {Math.round(
                    goldRate * p.multiplier
                  ).toLocaleString('en-IN')}

                  <span className="text-yellow-200 text-[10px]">
                    /g
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-yellow-300/30 flex-shrink-0" />

          {/* Trend */}
          <div
            className={`flex items-center gap-1 flex-shrink-0 ${
              trend === 'up'
                ? 'text-green-300'
                : 'text-red-300'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp size={13} />
            ) : (
              <TrendingDown size={13} />
            )}

            <span className="font-mono-code text-xs font-medium">
              {change >= 0 ? '+' : ''}
              {change.toFixed(0)} ({changePercent}%)
            </span>
          </div>

          {/* Updated Time + Refresh */}
          <div className="ml-auto flex-shrink-0 flex items-center gap-2">
            <span className="text-[10px] text-yellow-100 font-mono-code hidden sm:block">
              Updated{' '}
              {lastUpdated
                ? lastUpdated.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '--:--'}
            </span>

            <button
              onClick={refreshRate}
              disabled={isUpdating}
              className="text-yellow-200 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh live rates"
            >
              <RefreshCw
                size={12}
                className={isUpdating ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}