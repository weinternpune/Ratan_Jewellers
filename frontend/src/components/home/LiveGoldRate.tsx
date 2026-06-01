'use client'
import { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { useUIStore } from '@/store'
const purities = [{ label: '24K (999)', multiplier: 1 }, { label: '22K (916)', multiplier: 0.916 }, { label: '18K (750)', multiplier: 0.75 }, { label: '14K (585)', multiplier: 0.585 }]
export default function LiveGoldRate() {
  const { goldRate, setGoldRate } = useUIStore()
  const [prevRate, setPrevRate] = useState(goldRate)
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const trend = goldRate >= prevRate ? 'up' : 'down'
  const change = goldRate - prevRate
  const changePercent = ((change / prevRate) * 100).toFixed(2)
  const refreshRate = async () => { setIsUpdating(true); try { const nr = goldRate + (Math.random() - 0.5) * 20; setPrevRate(goldRate); setGoldRate(Math.round(nr)); setLastUpdated(new Date()) } finally { setIsUpdating(false) } }
  return (
    <div className="bg-obsidian border-y border-gold/20 py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="flex-shrink-0 flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span className="font-mono-code text-xs text-gold/70 uppercase tracking-wider whitespace-nowrap">Live Gold Rates</span></div>
          <div className="w-px h-4 bg-gold/20 flex-shrink-0" />
          <div className="flex items-center gap-6 flex-shrink-0">{purities.map(p => <div key={p.label} className="flex items-center gap-2 whitespace-nowrap"><span className="font-mono-code text-xs text-gold/50">{p.label}</span><span className="font-mono-code text-sm text-gold font-medium">₹{Math.round(goldRate * p.multiplier).toLocaleString('en-IN')}<span className="text-gold/50 text-[10px]">/g</span></span></div>)}</div>
          <div className="w-px h-4 bg-gold/20 flex-shrink-0" />
          <div className={`flex items-center gap-1 flex-shrink-0 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}<span className="font-mono-code text-xs">{change >= 0 ? '+' : ''}{change.toFixed(0)} ({changePercent}%)</span></div>
          <div className="ml-auto flex-shrink-0 flex items-center gap-2"><span className="text-[10px] text-gold/30 font-mono-code hidden sm:block">Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span><button onClick={refreshRate} disabled={isUpdating} className="text-gold/40 hover:text-gold transition-colors"><RefreshCw size={12} className={isUpdating ? 'animate-spin' : ''} /></button></div>
        </div>
      </div>
    </div>
  )
}
