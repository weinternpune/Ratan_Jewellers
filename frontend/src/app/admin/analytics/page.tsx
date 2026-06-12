'use client'

import React, { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  ShoppingCart,
  Users,
  Activity,
  Star
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import toast from 'react-hot-toast'

const periods = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Year']

function MiniBar({ data, color, height = 'h-16' }: { data: number[]; color: string; height?: string }) {
  const max = Math.max(...data)
  return (
    <div className={`flex items-end gap-0.5 ${height}`}>
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t ${color} opacity-90`}
          style={{ height: `${max > 0 ? (v / max) * 100 : 0}%`, minHeight: 2 }}
        />
      ))}
    </div>
  )
}

function KpiCard({
  label,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  accent,
  sub
}: {
  label: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className={accent} />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              changeType === 'up'
                ? 'bg-green-50 text-green-600'
                : changeType === 'down'
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-50 text-gray-500'
            }`}
          >
            {changeType === 'up' ? (
              <ArrowUpRight size={11} />
            ) : changeType === 'down' ? (
              <ArrowDownRight size={11} />
            ) : null}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { customers } = useAdminStore()
  const [period, setPeriod] = useState('Last 30 Days')
  const [tab, setTab] = useState<'sales' | 'products' | 'customers' | 'channels' | 'geography'>('sales')

  const customerCount = customers.length

  // Period configurations mapping to different chart ranges & static structures
  const periodConfig: Record<string, { label: string; range: string[]; data: number[]; text: string }> = {
    'Today': {
      label: 'Hourly Revenue',
      range: ['9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
      data: Array(5).fill(0),
      text: 'Today'
    },
    'Last 7 Days': {
      label: 'Daily Revenue',
      range: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: Array(7).fill(0),
      text: 'Last 7 days'
    },
    'Last 30 Days': {
      label: 'Daily Revenue',
      range: ['1 Jun', '10 Jun', '20 Jun', '30 Jun'],
      data: Array(30).fill(0),
      text: 'Last 30 days'
    },
    'This Quarter': {
      label: 'Monthly Revenue',
      range: ['Month 1', 'Month 2', 'Month 3'],
      data: Array(3).fill(0),
      text: 'This Quarter'
    },
    'This Year': {
      label: 'Monthly Revenue',
      range: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
      data: Array(12).fill(0),
      text: 'This Year'
    }
  }

  const activePeriod = periodConfig[period] || periodConfig['Last 30 Days']

  // Handle CSV data export
  const handleExport = () => {
    const csvRows = [
      ['Report Period', period],
      ['Generated At', new Date().toLocaleString()],
      [],
      ['Metric', 'Value', 'Status'],
      ['Revenue', '₹0.00', 'Delivered orders'],
      ['Orders', '0', 'Completed'],
      ['New Customers', customerCount.toString(), 'Active profiles'],
      ['Avg Order', '₹0.00', 'Calculated average'],
      ['Return Rate', '0%', 'Refunds/returns']
    ]

    const csvContent = csvRows
      .map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `ratan_analytics_${period.toLowerCase().replace(/ /g, '_')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported data for ${period}!`)
  }

  // Dynamic bar data matching the customerCount
  const customerAcquisitionData = customerCount > 0
    ? [...Array(19).fill(0), customerCount]
    : Array(20).fill(0)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business intelligence & performance metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector buttons */}
          <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1">
            {periods.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Revenue"
          value="₹0.00"
          change="0% vs prev"
          changeType="neutral"
          icon={IndianRupee}
          color="bg-amber-50"
          accent="text-amber-600"
          sub="Delivered orders"
        />
        <KpiCard
          label="Orders"
          value="0"
          change="0% vs prev"
          changeType="neutral"
          icon={ShoppingCart}
          color="bg-blue-50"
          accent="text-blue-600"
          sub="Total checkouts"
        />
        <KpiCard
          label="New Customers"
          value={customerCount.toString()}
          change={customerCount > 0 ? `+${customerCount * 10}%` : '0%'}
          changeType={customerCount > 0 ? 'up' : 'neutral'}
          icon={Users}
          color="bg-purple-50"
          accent="text-purple-600"
          sub="Registered accounts"
        />
        <KpiCard
          label="Avg Order"
          value="₹0.00"
          change="0% vs prev"
          changeType="neutral"
          icon={BarChart3}
          color="bg-teal-50"
          accent="text-teal-600"
          sub="Average basket value"
        />
        <KpiCard
          label="Return Rate"
          value="0%"
          change="0% vs prev"
          changeType="neutral"
          icon={RefreshCw}
          color="bg-red-50"
          accent="text-red-500"
          sub="Refunds / Exchanges"
        />
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {(['sales', 'products', 'customers', 'channels', 'geography'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {tab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">{activePeriod.label}</h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full capitalize">
                {activePeriod.text}
              </span>
            </div>
            <MiniBar data={activePeriod.data} color="bg-amber-400" height="h-24" />
            <div className="flex justify-between text-[9px] text-gray-400 mt-2">
              {activePeriod.range.map((label, idx) => (
                <span key={idx}>{label}</span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Revenue by Weekday</h3>
            <div className="flex flex-col gap-2">
              {[
                { day: 'Monday', val: 0, color: 'bg-blue-400' },
                { day: 'Tuesday', val: 0, color: 'bg-blue-500' },
                { day: 'Wednesday', val: 0, color: 'bg-blue-400' },
                { day: 'Thursday', val: 0, color: 'bg-blue-600' },
                { day: 'Friday', val: 0, color: 'bg-blue-700' },
                { day: 'Saturday', val: 0, color: 'bg-amber-500' },
                { day: 'Sunday', val: 0, color: 'bg-blue-500' }
              ].map(d => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">{d.day}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.val}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">{d.val}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Top Selling Products</h3>
              {[
                { name: 'Gold Necklace Sets', revenue: 0, units: 0, pct: 0 },
                { name: 'Diamond Rings', revenue: 0, units: 0, pct: 0 },
                { name: 'Gold Bangles', revenue: 0, units: 0, pct: 0 },
                { name: 'Mangalsutras', revenue: 0, units: 0, pct: 0 },
                { name: 'Gold Earrings', revenue: 0, units: 0, pct: 0 }
              ].map(p => (
                <div key={p.name} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{p.name}</span>
                    <span className="text-gray-500">
                      {p.units} units · ₹{p.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Revenue by Category</h3>
              {[
                { cat: 'Necklaces', pct: 0, color: 'bg-amber-400' },
                { cat: 'Rings', pct: 0, color: 'bg-blue-400' },
                { cat: 'Bangles', pct: 0, color: 'bg-green-400' },
                { cat: 'Earrings', pct: 0, color: 'bg-purple-400' },
                { cat: 'Others', pct: 0, color: 'bg-gray-300' }
              ].map(c => (
                <div key={c.cat} className="flex items-center gap-3 mb-3">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${c.color}`} />
                  <span className="text-xs text-gray-600 flex-1">{c.cat}</span>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Customer Acquisition</h3>
            <MiniBar data={customerAcquisitionData} color="bg-purple-400" height="h-20" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-purple-50 rounded-xl p-3">
                <div className="text-lg font-bold text-purple-700">{customerCount}</div>
                <div className="text-xs text-gray-500">New this month</div>
              </div>
              <div className="bg-violet-50 rounded-xl p-3">
                <div className="text-lg font-bold text-violet-700">0%</div>
                <div className="text-xs text-gray-500">Return rate</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Loyalty Tier Distribution</h3>
            {[
              { tier: 'Platinum', count: 0, color: 'bg-purple-500' },
              { tier: 'Gold', count: 0, color: 'bg-amber-400' },
              { tier: 'Silver', count: 0, color: 'bg-gray-400' },
              { tier: 'Bronze', count: 0, color: 'bg-orange-300' }
            ].map(t => (
              <div key={t.tier} className="flex items-center gap-3 mb-3">
                <span className={`w-3 h-3 rounded-full ${t.color} flex-shrink-0`} />
                <span className="text-xs text-gray-600 flex-1">{t.tier}</span>
                <span className="text-xs text-gray-500">{t.count}</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full`} style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Sales by Channel</h3>
            {[
              { channel: 'In-Store', revenue: 0, pct: 0, color: 'bg-amber-400' },
              { channel: 'Website', revenue: 0, pct: 0, color: 'bg-blue-400' },
              { channel: 'WhatsApp', revenue: 0, pct: 0, color: 'bg-green-400' },
              { channel: 'Phone', revenue: 0, pct: 0, color: 'bg-purple-400' }
            ].map(c => (
              <div key={c.channel} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{c.channel}</span>
                  <span className="text-gray-500">
                    ₹{c.revenue.toFixed(2)} ({c.pct}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Payment Methods</h3>
            {[
              { method: 'UPI', pct: 0, color: 'bg-blue-400' },
              { method: 'Cash', pct: 0, color: 'bg-green-400' },
              { method: 'Card', pct: 0, color: 'bg-purple-400' },
              { method: 'Net Banking', pct: 0, color: 'bg-amber-400' },
              { method: 'EMI', pct: 0, color: 'bg-red-400' }
            ].map(m => (
              <div key={m.method} className="flex items-center gap-3 mb-3">
                <span className={`w-3 h-3 rounded-full ${m.color} flex-shrink-0`} />
                <span className="text-xs text-gray-600 flex-1">{m.method}</span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-8 text-right">{m.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'geography' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 text-sm mb-4">Revenue by City</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { city: 'Bhubaneswar', revenue: 0, orders: 0, pct: 0 },
              { city: 'Cuttack', revenue: 0, orders: 0, pct: 0 },
              { city: 'Puri', revenue: 0, orders: 0, pct: 0 },
              { city: 'Sambalpur', revenue: 0, orders: 0, pct: 0 },
              { city: 'Rourkela', revenue: 0, orders: 0, pct: 0 },
              { city: 'Others', revenue: 0, orders: 0, pct: 0 }
            ].map(c => (
              <div key={c.city} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{c.city}</span>
                    <span className="text-gray-500">₹{c.revenue.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
