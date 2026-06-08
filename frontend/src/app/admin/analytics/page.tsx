'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Download, Calendar, RefreshCw, ArrowUpRight } from 'lucide-react'

const periods = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Year']

function MiniBar({ data, color, height = 'h-16' }: { data: number[]; color: string; height?: string }) {
  const max = Math.max(...data)
  return (
    <div className={`flex items-end gap-0.5 ${height}`}>
      {data.map((v, i) => (
        <div key={i} className={`flex-1 rounded-t ${color} opacity-90`} style={{ height: `${(v / max) * 100}%`, minHeight: 2 }} />
      ))}
    </div>
  )
}

function KpiCard({ label, value, change, changeType, sub }: { label: string; value: string; change?: string; changeType?: 'up' | 'down'; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${changeType === 'up' ? 'text-green-600' : 'text-red-500'}`}>
          {changeType === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </div>
      )}
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('Last 30 Days')
  const [tab, setTab] = useState<'sales' | 'products' | 'customers' | 'channels' | 'geography'>('sales')

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Business intelligence & performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer">
            {periods.map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Revenue" value="₹84.2L" change="+12% vs prev" changeType="up" />
        <KpiCard label="Orders" value="1,847" change="+8%" changeType="up" />
        <KpiCard label="New Customers" value="284" change="+15%" changeType="up" />
        <KpiCard label="Avg Order" value="₹45.6K" change="+3%" changeType="up" />
        <KpiCard label="Return Rate" value="6.7%" change="+0.5%" changeType="down" />
      </div>

      {/* Analytics Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {(['sales', 'products', 'customers', 'channels', 'geography'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-sm">Daily Revenue</h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Last 30 days</span>
            </div>
            <MiniBar data={[45,62,38,71,55,82,68,91,73,88,65,79,94,87,72,83,96,78,85,102,88,75,91,84,97,89,76,93,105,84]} color="bg-amber-400" height="h-24" />
            <div className="flex justify-between text-[9px] text-gray-400 mt-2">
              <span>1 May</span><span>15 May</span><span>31 May</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Revenue by Weekday</h3>
            <div className="flex flex-col gap-2">
              {[
                { day: 'Monday', val: 68, color: 'bg-blue-400' },
                { day: 'Tuesday', val: 72, color: 'bg-blue-500' },
                { day: 'Wednesday', val: 64, color: 'bg-blue-400' },
                { day: 'Thursday', val: 85, color: 'bg-blue-600' },
                { day: 'Friday', val: 91, color: 'bg-blue-700' },
                { day: 'Saturday', val: 100, color: 'bg-amber-500' },
                { day: 'Sunday', val: 78, color: 'bg-blue-500' },
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
                { name: 'Gold Necklace Sets', revenue: 980000, units: 12, pct: 100 },
                { name: 'Diamond Rings', revenue: 768000, units: 6, pct: 78 },
                { name: 'Gold Bangles', revenue: 654000, units: 19, pct: 67 },
                { name: 'Mangalsutras', revenue: 420000, units: 23, pct: 43 },
                { name: 'Gold Earrings', revenue: 312000, units: 34, pct: 32 },
              ].map(p => (
                <div key={p.name} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{p.name}</span>
                    <span className="text-gray-500">{p.units} units · ₹{(p.revenue / 100000).toFixed(1)}L</span>
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
                { cat: 'Necklaces', pct: 38, color: 'bg-amber-400' },
                { cat: 'Rings', pct: 24, color: 'bg-blue-400' },
                { cat: 'Bangles', pct: 18, color: 'bg-green-400' },
                { cat: 'Earrings', pct: 10, color: 'bg-purple-400' },
                { cat: 'Others', pct: 10, color: 'bg-gray-300' },
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
            <MiniBar data={[28,35,22,41,38,52,45,59,48,62,55,67,58,71,64,76,69,83,75,88]} color="bg-purple-400" height="h-20" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-purple-50 rounded-xl p-3">
                <div className="text-lg font-bold text-purple-700">284</div>
                <div className="text-xs text-gray-500">New this month</div>
              </div>
              <div className="bg-violet-50 rounded-xl p-3">
                <div className="text-lg font-bold text-violet-700">68%</div>
                <div className="text-xs text-gray-500">Return rate</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Loyalty Tier Distribution</h3>
            {[
              { tier: 'Platinum', count: 124, color: 'bg-purple-500' },
              { tier: 'Gold', count: 842, color: 'bg-amber-400' },
              { tier: 'Silver', count: 2840, color: 'bg-gray-400' },
              { tier: 'Bronze', count: 9041, color: 'bg-orange-300' },
            ].map(t => (
              <div key={t.tier} className="flex items-center gap-3 mb-3">
                <span className={`w-3 h-3 rounded-full ${t.color} flex-shrink-0`} />
                <span className="text-xs text-gray-600 flex-1">{t.tier}</span>
                <span className="text-xs text-gray-500">{t.count.toLocaleString()}</span>
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full`} style={{ width: `${(t.count / 9041) * 100}%` }} />
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
              { channel: 'In-Store', revenue: 4820000, pct: 58, color: 'bg-amber-400' },
              { channel: 'Website', revenue: 2140000, pct: 26, color: 'bg-blue-400' },
              { channel: 'WhatsApp', revenue: 840000, pct: 10, color: 'bg-green-400' },
              { channel: 'Phone', revenue: 500000, pct: 6, color: 'bg-purple-400' },
            ].map(c => (
              <div key={c.channel} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{c.channel}</span>
                  <span className="text-gray-500">₹{(c.revenue / 100000).toFixed(1)}L ({c.pct}%)</span>
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
              { method: 'UPI', pct: 42, color: 'bg-blue-400' },
              { method: 'Cash', pct: 24, color: 'bg-green-400' },
              { method: 'Card', pct: 18, color: 'bg-purple-400' },
              { method: 'Net Banking', pct: 10, color: 'bg-amber-400' },
              { method: 'EMI', pct: 6, color: 'bg-red-400' },
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
              { city: 'Bhubaneswar', revenue: 4820000, orders: 842, pct: 100 },
              { city: 'Cuttack', revenue: 1240000, orders: 218, pct: 26 },
              { city: 'Puri', revenue: 680000, orders: 124, pct: 14 },
              { city: 'Sambalpur', revenue: 420000, orders: 84, pct: 9 },
              { city: 'Rourkela', revenue: 380000, orders: 72, pct: 8 },
              { city: 'Others', revenue: 660000, orders: 507, pct: 14 },
            ].map(c => (
              <div key={c.city} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{c.city}</span>
                    <span className="text-gray-500">₹{(c.revenue / 100000).toFixed(1)}L</span>
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
