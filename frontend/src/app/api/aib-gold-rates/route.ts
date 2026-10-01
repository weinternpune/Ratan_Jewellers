import { NextResponse } from 'next/server'

/**
 * Always run on the server at request time.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SOURCE_URL =
  'https://allindiabullion.com/gold-rate/maharashtra/nagpur'

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

/**
 * Keep the last successful response only as a fallback
 * when AIB temporarily fails.
 *
 * IMPORTANT:
 * This cache is NEVER used for successful requests.
 * Every successful request fetches fresh data from AIB.
 */
let lastSuccessfulData: AibData | null = null

function parseNumber(value: string): number {
  return Number(value.replace(/[₹,\s]/g, ''))
}

/**
 * Extract one product from the AIB text.
 *
 * Example:
 *
 * RETAIL 995
 * per 10 g
 * ₹1,49,759 ▼ 12
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
    `${escapedLabel}[\\s\\S]{0,150}?₹\\s*([\\d,]+)\\s*([▲▼])?\\s*([\\d,]*)`,
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

/**
 * Convert HTML into readable text.
 *
 * No cheerio dependency required.
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

/**
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

/**
 * Parse the exact AIB Nagpur page.
 */
function parseNagpurPage(
  html: string,
): AibData {
  const text = htmlToText(html)

  /**
   * AIB displays:
   *
   * Live Update • 13:53:13 IST
   */
  const liveTimeMatch = text.match(
    /Live Update\s*[•·]\s*(\d{1,2}:\d{2}:\d{2})\s*IST/i,
  )

  const liveTime =
    liveTimeMatch?.[1] ?? null

  /**
   * Reference rates.
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

  /**
   * Separate Gold and Silver sections.
   */
  const silverIndex = text
    .toUpperCase()
    .indexOf('SILVER PRODUCTS')

  const goldText =
    silverIndex > -1
      ? text.slice(0, silverIndex)
      : text

  const silverText =
    silverIndex > -1
      ? text.slice(silverIndex)
      : ''

  /**
   * GOLD PRODUCTS
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

  /**
   * SILVER PRODUCTS
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

  /**
   * Validate required products.
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

    /**
     * This is the time when our server successfully
     * fetched and parsed AIB.
     */
    fetchedAt:
      new Date().toISOString(),

    /**
     * This comes directly from AIB.
     */
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

/**
 * API response helper.
 *
 * IMPORTANT:
 * No browser/CDN caching.
 */
function respond(
  data: AibData,
  stale: boolean,
) {
  return NextResponse.json(
    {
      success: true,
      stale,

      /**
       * Actual successful fetch time.
       */
      fetchedAt: data.fetchedAt,

      source: SOURCE_URL,

      data,
    },
    {
      headers: {
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  )
}

/**
 * GET /api/aib-gold-rates
 *
 * Every successful request:
 *
 * Browser
 *   ↓
 * API
 *   ↓
 * Fresh AIB request
 *   ↓
 * Parse
 *   ↓
 * Return latest rate
 */
export async function GET() {
  try {
    console.log(
      '[aib-gold-rates] Fetching fresh data from AIB...',
    )

    /**
     * IMPORTANT:
     *
     * No application cache.
     * No Next.js Data Cache.
     * No browser cache.
     *
     * Every request goes to AIB.
     */
    // Cache-bust the external AIB request so an upstream/CDN
    // cannot keep returning an older HTML snapshot.
    const freshSourceUrl = `${SOURCE_URL}?_=${Date.now()}`

    const response = await fetch(
      freshSourceUrl,
      {
        method: 'GET',

        cache: 'no-store',

        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',

          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',

          'Accept-Language':
            'en-IN,en;q=0.9',

          Referer:
            'https://allindiabullion.com/',
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

    /**
     * Parse fresh AIB values.
     */
    const data =
      parseNagpurPage(html)

    /**
     * Save ONLY as fallback.
     *
     * This data will not be returned on a
     * successful request.
     */
    lastSuccessfulData = data

    console.log(
      '[aib-gold-rates] Fresh AIB data:',
      {
        liveTime: data.liveTime,
        fetchedAt: data.fetchedAt,
        gold24k:
          data.reference.gold24kPer10g,
        gold22k:
          data.reference.gold22kPer10g,
        silver:
          data.reference.silverPerKg,
      },
    )

    return respond(
      data,
      false,
    )
  } catch (err) {
    console.error(
      '[aib-gold-rates] fetch/parse failed:',
      err,
    )

    /**
     * If AIB temporarily fails,
     * return the last successful data.
     */
    if (lastSuccessfulData) {
      console.warn(
        '[aib-gold-rates] Returning last successful AIB data as fallback.',
      )

      return respond(
        lastSuccessfulData,
        true,
      )
    }

    /**
     * No previous successful data exists.
     */
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
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    )
  }
}