/**
 * Fetches + parses live gold/silver rates from All India Bullion.
 * - Main page  → Retail cities + headline rates
 * - City pages → Real RTGS (Before GST / With GST) data
 */

export interface AibCityRate {
  city: string
  // Retail
  gold24kPer10g: number
  goldChange: number | null
  silverPerKg: number
  silverChange: number | null
  // RTGS
  goldRtgsBeforeGst?: number
  goldRtgsWithGst?: number
  goldRtgsChange?: number | null
  goldRtgsWithGstChange?: number | null
  silverRtgsBeforeGst?: number
  silverRtgsWithGst?: number
  silverRtgsChange?: number | null
  silverRtgsWithGstChange?: number | null
}

export interface AibRates {
  gold24kPer10g: number
  gold22kPer10g: number
  gold18kPer10g: number
  silverPerKg: number
  updatedAt: string | null
  cities: AibCityRate[]
  rtgsCities: AibCityRate[]
}

const toNumber = (s: string) => Number(String(s).replace(/,/g, ''))

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8377;|&#x20b9;|&rupee;/gi, '₹')
    .replace(/&#9660;|&#x25bc;/gi, '▼')
    .replace(/&#9650;|&#x25b2;/gi, '▲')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstNumber(text: string, patterns: RegExp[]): number | null {
  for (const re of patterns) {
    const m = text.match(re)
    if (m) {
      const n = toNumber(m[1])
      if (Number.isFinite(n) && n > 0) return n
    }
  }
  return null
}

const signed = (arrow: string | undefined, value: string | undefined): number | null => {
  if (!arrow || !value) return null
  const n = toNumber(value)
  if (!Number.isFinite(n)) return null
  return arrow === '▼' ? -n : n
}

// ── Major cities we scrape for RTGS data ───────────────────────────────
const MAJOR_CITIES = [
  { name: 'Mumbai', path: '/gold-rate/maharashtra/mumbai' },
  { name: 'Delhi', path: '/gold-rate/delhi/delhi' },
  { name: 'Ahmedabad', path: '/gold-rate/gujarat/ahmedabad' },
  { name: 'Bengaluru', path: '/gold-rate/karnataka/bengaluru' },
  { name: 'Chennai', path: '/gold-rate/tamil-nadu/chennai' },
  { name: 'Hyderabad', path: '/gold-rate/telangana/hyderabad' },
  { name: 'Jaipur', path: '/gold-rate/rajasthan/jaipur' },
  { name: 'Kolkata', path: '/gold-rate/west-bengal/kolkata' },
]

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

/** Extract RTGS numbers from a single city page */
function parseCityRtgs(html: string, cityName: string): AibCityRate | null {
  const text = htmlToText(html)

  // GOLD RTGS 999 – Before GST + With GST
  const goldBefore = firstNumber(text, [
    /RTGS\s*999[^₹]{0,40}₹\s*([\d,]+)[^₹]{0,30}WITH\s*GST/i,
    /GOLD\s*RTGS\s*999[^₹]{0,60}BEFORE\s*GST[^₹]{0,20}₹\s*([\d,]+)/i,
    /RTGS\s*999\s*GOLD[^₹]{0,40}₹\s*([\d,]+)/i,
  ])

  const goldWith = firstNumber(text, [
    /WITH\s*GST[^₹]{0,30}₹\s*([\d,]+)[^₹]{0,40}SILVER/i,
    /999\s*WITH\s*GST[^₹]{0,30}₹\s*([\d,]+)/i,
    /RTGS\s*999[^₹]{0,80}WITH\s*GST[^₹]{0,20}₹\s*([\d,]+)/i,
  ])

  // SILVER RTGS 999
  const silverBefore = firstNumber(text, [
    /SILVER\s*RTGS\s*999[^₹]{0,60}BEFORE\s*GST[^₹]{0,20}₹\s*([\d,]+)/i,
    /RTGS\s*999\s*SILVER[^₹]{0,40}₹\s*([\d,]+)/i,
    /SILVER[^₹]{0,40}RTGS[^₹]{0,40}₹\s*([\d,]+)/i,
  ])

  const silverWith = firstNumber(text, [
    /SILVER\s*RTGS\s*999[^₹]{0,120}WITH\s*GST[^₹]{0,20}₹\s*([\d,]+)/i,
    /SILVER[^₹]{0,60}WITH\s*GST[^₹]{0,20}₹\s*([\d,]+)/i,
  ])

  // Changes (optional)
  const goldChangeMatch = text.match(
    /RTGS\s*999[^▲▼]{0,80}([▲▼])\s*([\d,]+)/i,
  )
  const silverChangeMatch = text.match(
    /SILVER\s*RTGS\s*999[^▲▼]{0,80}([▲▼])\s*([\d,]+)/i,
  )

  if (!goldBefore && !goldWith && !silverBefore && !silverWith) {
    return null
  }

  return {
    city: cityName,
    gold24kPer10g: 0,
    goldChange: null,
    silverPerKg: 0,
    silverChange: null,
    goldRtgsBeforeGst: goldBefore ?? undefined,
    goldRtgsWithGst: goldWith ?? undefined,
    goldRtgsChange: goldChangeMatch ? signed(goldChangeMatch[1], goldChangeMatch[2]) : null,
    goldRtgsWithGstChange: null,
    silverRtgsBeforeGst: silverBefore ?? undefined,
    silverRtgsWithGst: silverWith ?? undefined,
    silverRtgsChange: silverChangeMatch ? signed(silverChangeMatch[1], silverChangeMatch[2]) : null,
    silverRtgsWithGstChange: null,
  }
}

export function parseAibHtml(html: string): Omit<AibRates, 'rtgsCities'> & { rtgsCities?: AibCityRate[] } {
  const text = htmlToText(html)

  const gold24 = firstNumber(text, [
    /24K\s*Gold\s*₹\s*([\d,]+)\s*per\s*10\s*g/i,
    /24K\s*999\s*99\.9%[^₹]{0,80}₹\s*([\d,]+)/i,
  ])
  if (!gold24 || gold24 < 1000) {
    throw new Error('Could not read the 24K gold rate from All India Bullion')
  }

  const gold22 =
    firstNumber(text, [
      /22K\s*Gold\s*₹\s*([\d,]+)\s*per\s*10\s*g/i,
      /22K\s*916\s*91\.6%[^₹]{0,80}₹\s*([\d,]+)/i,
    ]) ?? Math.round(gold24 * 0.916)

  const gold18 =
    firstNumber(text, [/18K\s*750\s*75%[^₹]{0,80}₹\s*([\d,]+)/i]) ??
    Math.round(gold24 * 0.75)

  const silver = firstNumber(text, [
    /Silver\s*₹\s*([\d,]+)\s*per\s*kg/i,
    /Silver\s*\(999\)\s*is\s*₹\s*([\d,]+)\s*per\s*kilogram/i,
  ])
  if (!silver || silver < 1000) {
    throw new Error('Could not read the silver rate from All India Bullion')
  }

  const updatedMatch = text.match(
    /Last updated\s+(\d{1,2}\s+[A-Za-z]+\s+\d{4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*IST)/i,
  )

  // Retail city cards from main page
  const retailRe =
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+Gold\s+Retail\s+999\s+per\s+10\s+g\s+₹\s*([\d,]+)\s*(?:([▲▼])\s*([\d,]+))?\s*Silver\s+Retail\s+999\s+per\s+kg\s+₹\s*([\d,]+)\s*(?:([▲▼])\s*([\d,]+))?/gi

  const cities: AibCityRate[] = []
  const seen = new Set<string>()

  for (const m of text.matchAll(retailRe)) {
    const city = m[1].trim()
    if (seen.has(city)) continue
    seen.add(city)
    cities.push({
      city,
      gold24kPer10g: toNumber(m[2]),
      goldChange: signed(m[3], m[4]),
      silverPerKg: toNumber(m[5]),
      silverChange: signed(m[6], m[7]),
    })
  }

  return {
    gold24kPer10g: gold24,
    gold22kPer10g: gold22,
    gold18kPer10g: gold18,
    silverPerKg: silver,
    updatedAt: updatedMatch ? updatedMatch[1].replace(/\s+/g, ' ').trim() : null,
    cities,
  }
}

export async function fetchAibRates(url: string): Promise<AibRates> {
  // 1. Main page → Retail + headline
  const mainHtml = await fetchHtml(url)
  const base = parseAibHtml(mainHtml)

  // 2. Parallel fetch of major city pages → real RTGS data
  const baseUrl = 'https://allindiabullion.com'
  const rtgsResults = await Promise.allSettled(
    MAJOR_CITIES.map(async (c) => {
      const html = await fetchHtml(baseUrl + c.path)
      return parseCityRtgs(html, c.name)
    }),
  )

  const rtgsCities: AibCityRate[] = []
  for (const result of rtgsResults) {
    if (result.status === 'fulfilled' && result.value) {
      rtgsCities.push(result.value)
    }
  }

  return {
    ...base,
    rtgsCities,
  }
}