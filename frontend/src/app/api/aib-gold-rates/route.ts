import { NextResponse } from 'next/server'

/*
 * Always run on the server at request time.
 * Nothing is pre-rendered at build time.
 */
export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

const SOURCE_URL =
  'https://allindiabullion.com/gold-rate/maharashtra/nagpur'

const CACHE_MS = 60 * 1000

type Direction = 'up' | 'down' | null

interface ProductRate {
  label: string
  value: number
  change: number | null
  direction: Direction
  unit: string
}

interface AibData {
  city: string
  state: string

  fetchedAt: string
  liveTime: string | null

  reference: {
    gold24kPer10g: number | null
    gold22kPer10g: number | null
    silverPerKg: number | null
  }

  products: {
    gold: {
      retail995: ProductRate | null
      rtgs995: ProductRate | null
      gst995: ProductRate | null

      retail999: ProductRate | null
      rtgs999: ProductRate | null
      gst999: ProductRate | null
    }

    silver: {
      retail999: ProductRate | null
      rtgs999: ProductRate | null
      gst999: ProductRate | null
    }
  }
}

/*
 * Keep the last successful response in memory.
 * This preserves your existing stale-data behaviour.
 */
let cache: {
  at: number
  data: AibData
} | null = null

function parseNumber(value: string): number {
  return Number(
    value.replace(/[₹,\s]/g, ''),
  )
}

/*
 * Extract one product from the text.
 *
 * Example:
 *
 * RETAIL 995
 * per 10 g
 * ₹1,49,759▼ 12
 */
function extractProduct(
  text: string,
  label: string,
  unit: string,
): ProductRate | null {
  const escapedLabel = label.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )

  const regex = new RegExp(
    `${escapedLabel}[\\s\\S]{0,100}?₹\\s*([\\d,]+)\\s*([▲▼])?\\s*([\\d,]*)`,
    'i',
  )

  const match = text.match(regex)

  if (!match) {
    return null
  }

  const value = parseNumber(match[1])

  const direction: Direction =
    match[2] === '▲'
      ? 'up'
      : match[2] === '▼'
        ? 'down'
        : null

  const change =
    match[3] && match[3].trim()
      ? parseNumber(match[3])
      : null

  return {
    label,
    value,
    change,
    direction,
    unit,
  }
}

/*
 * Same product names exist in Gold and Silver.
 *
 * Therefore Silver must be extracted from the part of
 * the page after "Silver Products".
 */
function extractSilverProduct(
  silverText: string,
  label: string,
): ProductRate | null {
  return extractProduct(
    silverText,
    label,
    'per kg',
  )
}

function extractGoldProduct(
  text: string,
  label: string,
): ProductRate | null {
  return extractProduct(
    text,
    label,
    'per 10 g',
  )
}

/*
 * Convert HTML into readable text.
 *
 * We intentionally don't depend on cheerio or another
 * package, so no additional dependency is required.
 */
function htmlToText(html: string): string {
  return html
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      ' ',
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      ' ',
    )
    .replace(
      /<noscript[\s\S]*?<\/noscript>/gi,
      ' ',
    )
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/*
 * Extract the first occurrence of a number after a label.
 */
function extractReferenceRate(
  text: string,
  pattern: RegExp,
): number | null {
  const match = text.match(pattern)

  if (!match) {
    return null
  }

  return parseNumber(match[1])
}

/*
 * Parse the exact Nagpur AIB page.
 */
function parseNagpurPage(
  html: string,
): AibData {
  const text = htmlToText(html)

  /*
   * AIB currently displays:
   *
   * Live Update • 13:53:13 IST
   */
  const liveTimeMatch = text.match(
    /Live Update\s*[•·]\s*(\d{1,2}:\d{2}:\d{2})\s*IST/i,
  )

  const liveTime =
    liveTimeMatch?.[1] ?? null

  /*
   * Reference rates shown near the top of the page.
   */
  const gold24kPer10g =
    extractReferenceRate(
      text,
      /24K Gold\s*₹\s*([\d,]+)\s*per\s*10g/i,
    )

  const gold22kPer10g =
    extractReferenceRate(
      text,
      /22K Gold\s*₹\s*([\d,]+)\s*per\s*10g/i,
    )

  const silverPerKg =
    extractReferenceRate(
      text,
      /Silver\s*₹\s*([\d,]+)\s*per\s*kg/i,
    )

  /*
   * Gold section starts before Silver Products.
   */
  const silverIndex = text
    .toUpperCase()
    .indexOf('SILVER PRODUCTS')

  const goldText =
    silverIndex > -1
      ? text.slice(0, silverIndex)
      : text

  /*
   * Silver section starts at Silver Products.
   */
  const silverText =
    silverIndex > -1
      ? text.slice(silverIndex)
      : ''

  /*
   * GOLD
   */
  const retail995 =
    extractGoldProduct(
      goldText,
      'RETAIL 995',
    )

  const rtgs995 =
    extractGoldProduct(
      goldText,
      'RTGS 995',
    )

  const gst995 =
    extractGoldProduct(
      goldText,
      '995 WITH GST',
    )

  const retail999 =
    extractGoldProduct(
      goldText,
      'RETAIL 999',
    )

  const rtgs999 =
    extractGoldProduct(
      goldText,
      'RTGS 999',
    )

  const gst999 =
    extractGoldProduct(
      goldText,
      '999 WITH GST',
    )

  /*
   * SILVER
   */
  const silverRetail999 =
    extractSilverProduct(
      silverText,
      'RETAIL 999',
    )

  const silverRtgs999 =
    extractSilverProduct(
      silverText,
      'RTGS 999',
    )

  const silverGst999 =
    extractSilverProduct(
      silverText,
      '999 WITH GST',
    )

  /*
   * Validate that the main live products were found.
   *
   * If AIB changes its HTML structure later, we don't
   * silently show incorrect/empty data.
   */
  const requiredProducts = [
    retail995,
    rtgs995,
    gst995,
    retail999,
    rtgs999,
    gst999,
    silverRetail999,
    silverRtgs999,
    silverGst999,
  ]

  const missingProducts =
    requiredProducts.filter(
      (item) => item === null,
    )

  if (missingProducts.length > 0) {
    throw new Error(
      `Unable to parse AIB Nagpur live products. Missing ${missingProducts.length} products.`,
    )
  }

  return {
    city: 'Nagpur',
    state: 'Maharashtra',

    fetchedAt:
      new Date().toISOString(),

    liveTime,

    reference: {
      gold24kPer10g,
      gold22kPer10g,
      silverPerKg,
    },

    products: {
      gold: {
        retail995,
        rtgs995,
        gst995,

        retail999,
        rtgs999,
        gst999,
      },

      silver: {
        retail999: silverRetail999,
        rtgs999: silverRtgs999,
        gst999: silverGst999,
      },
    },
  }
}

/*
 * API response.
 */
function respond(
  data: AibData,
  stale: boolean,
) {
  return NextResponse.json(
    {
      success: true,
      stale,

      fetchedAt:
        new Date(
          cache?.at ?? Date.now(),
        ).toISOString(),

      source: SOURCE_URL,

      data,
    },
    {
      headers: {
        'Cache-Control':
          'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  )
}

export async function GET() {
  /*
   * Use cached data for one minute.
   */
  if (
    cache &&
    Date.now() - cache.at < CACHE_MS
  ) {
    return respond(
      cache.data,
      false,
    )
  }

  try {
    /*
     * Fetch the ORIGINAL AIB Nagpur page.
     */
    const response = await fetch(
      SOURCE_URL,
      {
        method: 'GET',

        cache: 'no-store',

        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',

          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',

          'Accept-Language':
            'en-IN,en;q=0.9',
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `AIB returned HTTP ${response.status}`,
      )
    }

    const html =
      await response.text()

    if (!html) {
      throw new Error(
        'AIB returned an empty response.',
      )
    }

    /*
     * Parse ORIGINAL AIB values.
     */
    const data =
      parseNagpurPage(html)

    /*
     * Save last successful result.
     */
    cache = {
      at: Date.now(),
      data,
    }

    return respond(
      data,
      false,
    )
  } catch (err) {
    console.error(
      '[aib-gold-rates] fetch/parse failed:',
      err,
    )

    /*
     * If AIB temporarily fails, show the
     * last successful data instead of blank cards.
     */
    if (cache) {
      return respond(
        cache.data,
        true,
      )
    }

    return NextResponse.json(
      {
        success: false,

        error:
          'Live rates are temporarily unavailable.',

        source: SOURCE_URL,
      },
      {
        status: 502,

        headers: {
          'Cache-Control':
            'no-store',
        },
      },
    )
  }
}