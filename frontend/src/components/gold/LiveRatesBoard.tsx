'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import type { AibRates, AibCityRate } from '@/lib/aibRates'
import CityRateCard from './CityRateCard'

const SOURCE_URL = 'https://allindiabullion.com/gold-rate-today'
const REFRESH_MS = 60 * 1000

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

function Change({ value }: { value: number | null }) {
  if (value === null || value === 0) return <span className="text-gray-400">—</span>
  const up = value > 0
  return (
    <span className={`inline-flex items-center gap-1 ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : '-'}
      {Math.abs(value).toLocaleString('en-IN')}
    </span>
  )
}

function RateCard({
  label,
  sub,
  main,
  unit,
  perGram,
}: {
  label: string
  sub: string
  main: number
  unit: string
  perGram?: number
}) {
  return (
    <div className="rounded-2xl border border-[#d6a84f]/30 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl font-semibold text-[#340008]">{label}</h3>
        <span className="font-mono-code text-[10px] uppercase tracking-widest text-[#9D7A2E]">
          {sub}
        </span>
      </div>
      <div className="mt-4 font-mono-code text-3xl font-medium text-[#4A0404]">{inr(main)}</div>
      <div className="mt-1 text-xs text-gray-500">{unit}</div>
      {perGram !== undefined && (
        <div className="mt-3 border-t border-gray-100 pt-3 font-mono-code text-sm text-gray-700">
          {inr(perGram)} <span className="text-xs text-gray-400">per gram</span>
        </div>
      )}
    </div>
  )
}

interface LiveRatesBoardProps {
  type: 'retail' | 'rtgs'
}

export default function LiveRatesBoard({ type }: LiveRatesBoardProps) {
  const [rates, setRates] = useState<AibRates | null>(null)
  const [stale, setStale] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)

  const isRetail = type === 'retail'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/aib-gold-rates', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load rates')
      setRates(json.data)
      setStale(Boolean(json.stale))
      setFetchedAt(new Date(json.fetchedAt))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load rates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  const cityList: AibCityRate[] = isRetail
    ? rates?.cities ?? []
    : rates?.rtgsCities ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header + toggle + live status */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#8a7a6a]">
            City-wise · Live
          </p>
          <h2 className="font-display text-2xl font-semibold text-[#2d241f] sm:text-3xl">
            Live AIB Reference Rates
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[#6b5d4f]">
            {isRetail
              ? 'Retail gold and silver reference rates across major Indian cities'
              : 'RTGS gold and silver reference rates across major Indian cities'}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {/* Toggle – correct routes */}
          <div className="inline-flex rounded-full border border-[#d6a84f]/40 bg-white p-1 shadow-sm">
            <Link
              href="/live-gold-rates"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                isRetail
                  ? 'bg-[#340008] text-white'
                  : 'text-[#6b5d4f] hover:text-[#2d241f]'
              }`}
            >
              RETAIL
            </Link>
            <Link
              href="/live-gold-rates/rtgs"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                !isRetail
                  ? 'bg-[#340008] text-white'
                  : 'text-[#6b5d4f] hover:text-[#2d241f]'
              }`}
            >
              RTGS
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  stale || error ? 'bg-amber-400' : 'animate-pulse bg-emerald-500'
                }`}
              />
              <span className="font-mono-code text-xs uppercase tracking-wider text-[#4A0404]">
                {error && !rates ? 'Unavailable' : stale ? 'Last known' : 'Live'}
              </span>
            </div>
            {fetchedAt && (
              <span className="text-[11px] text-gray-400">
                {fetchedAt.toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}{' '}
                IST
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d6a84f]/50 bg-white px-3 py-1.5 text-xs font-medium text-[#4A0404] transition hover:bg-[#fdf8f0] disabled:opacity-60"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && !rates && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-sm text-amber-800">
            {error} Please try again in a moment, or view the rates directly on All India Bullion.
          </p>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#4A0404] px-5 py-2.5 text-sm font-medium text-[#E8D5A3]"
          >
            Open All India Bullion <ExternalLink size={14} />
          </a>
        </div>
      )}

      {/* Loading */}
      {loading && !rates && !error && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-[#f3ead8]" />
          ))}
        </div>
      )}

      {rates && (
        <>
          {/* Mumbai benchmark – only on Retail */}
          {isRetail && (
            <>
              <p className="mb-3 text-xs text-gray-500">
                Mumbai benchmark · 999 gold per 10 g, 999 silver per kg (before GST)
              </p>
              <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <RateCard
                  label="24K Gold"
                  sub="999"
                  main={rates.gold24kPer10g}
                  unit="per 10 grams"
                  perGram={rates.gold24kPer10g / 10}
                />
                <RateCard
                  label="22K Gold"
                  sub="916"
                  main={rates.gold22kPer10g}
                  unit="per 10 grams"
                  perGram={rates.gold22kPer10g / 10}
                />
                <RateCard
                  label="18K Gold"
                  sub="750"
                  main={rates.gold18kPer10g}
                  unit="per 10 grams"
                  perGram={rates.gold18kPer10g / 10}
                />
                <RateCard
                  label="Silver"
                  sub="999"
                  main={rates.silverPerKg}
                  unit="per kilogram"
                  perGram={rates.silverPerKg / 1000}
                />
              </div>
            </>
          )}

          {/* City cards */}
          {cityList.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cityList.map((c) => (
                <CityRateCard
                  key={c.city}
                  city={c.city}
                  type={type}
                  gold={c.gold24kPer10g}
                  silver={c.silverPerKg}
                  goldChange={c.goldChange}
                  silverChange={c.silverChange}
                  goldBeforeGst={c.goldRtgsBeforeGst}
                  goldWithGst={c.goldRtgsWithGst}
                  goldChangeBefore={c.goldRtgsChange}
                  goldChangeWith={c.goldRtgsWithGstChange}
                  silverBeforeGst={c.silverRtgsBeforeGst}
                  silverWithGst={c.silverRtgsWithGst}
                  silverChangeBefore={c.silverRtgsChange}
                  silverChangeWith={c.silverRtgsWithGstChange}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#d6a84f]/30 bg-white p-10 text-center text-sm text-gray-500">
              {isRetail
                ? 'City-wise retail rates are currently unavailable.'
                : 'City-wise RTGS rates are currently unavailable. The AIB page may still be loading or the RTGS layout has changed.'}
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-12 rounded-2xl bg-[#fdf8f0] p-5 text-xs leading-6 text-gray-600">
        <p>
          Rates are sourced live from{' '}
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#4A0404] underline"
          >
            All India Bullion
          </a>{' '}
          and refresh automatically every minute. They are reference rates for the metal only and
          are not an offer to buy or sell. Jewellery prices additionally include making charges and
          3% GST, so the price at Ratan Jewellers may differ.
        </p>
      </div>
    </div>
  )
}