'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, RefreshCw, Edit2, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { API_URL } from '@/lib/config'
import { apiClient } from '@/lib/api'

export default function GoldRatesPage() {
  const [rates, setRates] = useState({
    '24K': '14525',
    '22K': '13314',
    '18K': '10893',
    '14K': '8349'
  })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editRate, setEditRate] = useState('14525')

  // Fetch current rates
  const fetchRates = async () => {
    try {
      const response = await axios.get(`${API_URL}/gold-rates/all`)
      if (response.data.success) {
        setRates(response.data.data.rates)
        setLastUpdated(new Date(response.data.data.lastUpdated))
      }
    } catch (error) {
      console.error('Failed to fetch gold rates:', error)
    }
  }

  useEffect(() => {
    fetchRates()

    // Auto-refresh every 30 seconds — the backend itself only actually
    // re-scrapes V Gold if 30+ seconds have passed since its last fetch
    // (see getAllRates in goldRateController.ts), so polling here at the
    // same 30s cadence keeps the displayed rate continuously live without
    // hammering V Gold's site on every single request.
    const interval = setInterval(fetchRates, 30000)
    return () => clearInterval(interval)
  }, [])

  // Refresh from external APIs (manual button — forces an immediate scrape)
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await axios.post(`${API_URL}/gold-rates/refresh`)
      if (response.data.success) {
        toast.success('Gold rates refreshed from market!')
        await fetchRates()
      } else {
        toast.error(response.data.message || 'Failed to refresh rates')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to refresh rates')
    } finally {
      setRefreshing(false)
    }
  }

  // Manual update
  const handleManualUpdate = async () => {
    const rate = parseFloat(editRate)
    if (!rate || rate <= 0) {
      toast.error('Please enter a valid gold rate')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post(`/gold-rates/update`, { rate })

      if (response.data.success) {
        toast.success('Gold rates updated successfully!')
        setRates(response.data.data.rates)
        setLastUpdated(new Date(response.data.data.lastUpdated))
        setEditing(false)
      }
    } catch (error: any) {
      console.error('Manual update error:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to update rates')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gold Rates Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live from V Gold, Nagpur • Auto-refreshes every 30s • Last updated: {lastUpdated ? lastUpdated.toLocaleString('en-IN') : 'Loading...'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
          <button
            onClick={() => {
              setEditing(!editing)
              setEditRate(rates['24K'])
            }}
            className="flex items-center gap-2 bg-[#0D0700] text-[#C9A84C] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a0e00]"
          >
            <Edit2 size={14} />
            Manual Update
          </button>
        </div>
      </div>

      {/* Manual Update Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Update 24K Gold Rate</h2>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  24K Gold Rate (₹)
                </label>
                <input
                  type="number"
                  value={editRate}
                  onChange={(e) => setEditRate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold outline-none focus:border-[#C9A84C]"
                  placeholder="14525"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Other purities are calculated automatically:
                  <br />
                  22K = 24K × 0.916 | 18K = 24K × 0.750 | 14K = 24K × 0.585
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">
                  <strong>Note:</strong> A manual override will be replaced automatically the
                  next time the 30-second auto-refresh (or the daily cron) fetches a fresh
                  rate from V Gold.
                </p>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleManualUpdate}
                disabled={loading}
                className="flex-1 bg-[#0D0700] text-[#C9A84C] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a0e00] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Update Rates
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Rates Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(rates).map(([purity, rate]) => (
          <div
            key={purity}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">{purity} Gold</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">₹{parseInt(rate).toLocaleString('en-IN')}</div>
            <div className="text-xs text-amber-700 mt-1">V Gold quote</div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-gray-900">How Gold Rates Update</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-green-600">1</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-sm">Auto-Refresh (Every 30 seconds)</div>
              <div className="text-xs text-gray-600 mt-1">
                This page polls the backend every 30 seconds. The backend itself only
                re-scrapes V Gold's live page if 30+ seconds have passed since its last
                fetch, keeping the rate continuously current without hammering their site.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">2</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-sm">Refresh Now (Button)</div>
              <div className="text-xs text-gray-600 mt-1">
                Forces an immediate re-scrape of V Gold's live page, bypassing the 30-second window.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-amber-600">3</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-sm">Manual Update (Override)</div>
              <div className="text-xs text-gray-600 mt-1">
                Temporarily overrides the rate — gets replaced by the next auto-refresh.
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}