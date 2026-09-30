import { NextResponse } from 'next/server'
import { fetchAibRates, type AibRates } from '@/lib/aibRates'

// Always run on the server at request time (never pre-rendered at build).
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SOURCE_URL = 'https://allindiabullion.com/gold-rate-today'
const CACHE_MS = 60 * 1000 // hit All India Bullion at most once a minute

let cache: { at: number; data: AibRates } | null = null

function respond(data: AibRates, stale: boolean) {
  return NextResponse.json(
    { success: true, stale, fetchedAt: new Date(cache?.at ?? Date.now()).toISOString(), source: SOURCE_URL, data },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) return respond(cache.data, false)

  try {
    const data = await fetchAibRates(SOURCE_URL)
    cache = { at: Date.now(), data }
    return respond(data, false)
  } catch (err) {
    console.error('[aib-gold-rates] fetch/parse failed:', err)
    // Serve the last good rates (flagged stale) rather than an empty page.
    if (cache) return respond(cache.data, true)
    return NextResponse.json(
      { success: false, error: 'Live rates are temporarily unavailable.', source: SOURCE_URL },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
