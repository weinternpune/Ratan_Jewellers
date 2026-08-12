import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import puppeteer from 'puppeteer';

// ── Persistence ──────────────────────────────────────────────────────────
const CACHE_DIR = path.join(process.cwd(), 'data');
const CACHE_FILE = path.join(CACHE_DIR, 'goldRateCache.json');

interface GoldRateCache {
  baseRate: number;        // 24K rate as fetched from V Gold, Nagpur
  premiumPerGram: number;  // Optional manual nudge on top of the fetched rate — defaults to 0
  source: 'nagpur-vgold' | 'stale'; // 'stale' = V Gold unreachable this attempt, showing last known rate
  rates: {
    '24K': number;
    '22K': number;
    '18K': number;
    '14K': number;
  };
  lastUpdated: string;
  lastFetchDate: string; // YYYY-MM-DD (IST)
}

const DEFAULT_CACHE: GoldRateCache = {
  baseRate: 14525,
  premiumPerGram: 0,
  source: 'stale',
  rates: {
    '24K': 14525,
    '22K': Math.round(14525 * 0.916),
    '18K': Math.round(14525 * 0.750),
    '14K': Math.round(14525 * 0.585),
  },
  lastUpdated: new Date().toISOString(),
  lastFetchDate: '',
};

function loadCache(): GoldRateCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      return { ...DEFAULT_CACHE, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to read gold rate cache file, using defaults:', err);
  }
  return { ...DEFAULT_CACHE };
}

function saveCache(cache: GoldRateCache) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error('Failed to write gold rate cache file:', err);
  }
}

let cachedGoldRate: GoldRateCache = loadCache();

function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

function computeRatesFromEffective24K(effective24K: number) {
  return {
    '24K': effective24K,
    '22K': Math.round(effective24K * 0.916),
    '18K': Math.round(effective24K * 0.750),
    '14K': Math.round(effective24K * 0.585),
  };
}

// ── Source 1: Real Nagpur rate, scraped from V Gold (Sarafa Bazaar, Nagpur) ──
// Their live rates table is rendered by JavaScript after the page loads, so
// a plain HTTP fetch of the HTML won't contain the numbers — this needs a
// real headless browser to render the page first, then read the text.
async function fetchNagpurRateFromVGold(): Promise<number | null> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    );
    await page.goto('https://www.vgoldspot.com/LiveRates.html', {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    // The rate ticker populates via JS after load — give it a moment, and
    // wait for the specific table to actually contain the text we need
    // rather than a fixed sleep, so this is resilient to slow network.
    await page.waitForFunction(
      () => (globalThis as any).document.body.innerText.includes('GOLD 999'),
      { timeout: 15000 }
    );

    const pageText: string = await page.evaluate(() => (globalThis as any).document.body.innerText);

    // Find where "GOLD 999 (100 gm)" appears — tolerant of extra/odd
    // whitespace (including non-breaking spaces some sites use).
    const labelMatch = pageText.match(/GOLD\s*999\s*\(\s*100\s*gm\s*\)/i);
    if (!labelMatch || labelMatch.index === undefined) {
      console.log('⚠️ V Gold: "GOLD 999 (100 gm)" label not found at all in rendered text');
      return null;
    }

    // Look at a window of text right after the label. The H:/L: range line
    // can appear before or after the actual sell price depending on how
    // their page orders DOM nodes vs. visual layout, so rather than assume
    // adjacency, strip the H:/L: segment out first, then take the first
    // remaining plausible price number.
    let window = pageText.slice(labelMatch.index, labelMatch.index + 250);
    console.log('🔍 V Gold: raw text window after label:', JSON.stringify(window.slice(0, 150)));

    window = window.replace(/H\s*[:=]\s*[\d,]+\s*\/?\s*L\s*[:=]\s*[\d,]+/gi, '');

    // Every number-looking token in that cleaned window, in order.
    // No conversion here — the raw number V Gold shows for
    // "GOLD 999 (100 gm)" is used exactly as-is, matching their site
    // number-for-number rather than deriving a per-gram figure.
    const numberTokens = window.match(/[\d,]{4,7}/g) || [];
    let rawRate: number | null = null;
    for (const token of numberTokens) {
      const val = parseFloat(token.replace(/,/g, ''));
      // Sanity range: V Gold's displayed figure for this row is
      // realistically somewhere between ₹50,000 and ₹500,000.
      if (val >= 50000 && val <= 500000) {
        rawRate = val;
        break;
      }
    }

    if (!rawRate) {
      console.log('⚠️ V Gold: found the label but no plausible price number near it. Cleaned window:', JSON.stringify(window.slice(0, 150)));
      return null;
    }

    console.log('✅ Nagpur rate fetched from V Gold (Sarafa Bazaar), raw 100gm figure:', rawRate);
    return rawRate;
  } catch (err) {
    console.log('V Gold (Nagpur) scrape failed:', (err as Error).message);
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// Nagpur V Gold is the sole source now — no national/international
// fallback. If the scrape fails, we simply keep the last known Nagpur
// rate rather than substituting unrelated national/international pricing.
async function performDailyRefresh(): Promise<GoldRateCache> {
  const now = new Date();

  const nagpurRate = await fetchNagpurRateFromVGold();
  if (nagpurRate !== null) {
    const effective24K = nagpurRate + cachedGoldRate.premiumPerGram;
    cachedGoldRate = {
      baseRate: nagpurRate,
      premiumPerGram: cachedGoldRate.premiumPerGram,
      source: 'nagpur-vgold',
      rates: computeRatesFromEffective24K(effective24K),
      lastUpdated: now.toISOString(),
      lastFetchDate: todayIST(),
    };
  } else {
    console.log('⚠️ V Gold unreachable this attempt — keeping last known Nagpur rate');
    cachedGoldRate = { ...cachedGoldRate, source: 'stale', lastFetchDate: todayIST() };
  }

  saveCache(cachedGoldRate);
  return cachedGoldRate;
}

// ── Daily cron schedule ────────────────────────────────────────────────────
cron.schedule(
  '15 9 * * *',
  () => {
    console.log('⏰ Running scheduled daily gold rate refresh...');
    performDailyRefresh().catch((err) => console.error('Daily gold rate refresh failed:', err));
  },
  { timezone: 'Asia/Kolkata' }
);

if (cachedGoldRate.lastFetchDate !== todayIST()) {
  performDailyRefresh().catch((err) => console.error('Startup gold rate refresh failed:', err));
}

// ── Route handlers ────────────────────────────────────────────────────────

function locationLabel(source: GoldRateCache['source']) {
  return source === 'nagpur-vgold'
    ? 'Nagpur, Maharashtra (V Gold, Sarafa Bazaar)'
    : 'Nagpur, Maharashtra (last known rate — V Gold temporarily unreachable)';
}

export const getLiveGoldRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Rolling 30-second cache instead of once-per-day: as long as the
    // frontend polls at least every 30s, this stays continuously live.
    // Launching Puppeteer on every single request would be wasteful if
    // multiple requests land within the same second, so this still
    // short-circuits to the cached value within that 30s window.
    const ageMs = Date.now() - new Date(cachedGoldRate.lastUpdated).getTime();
    if (ageMs < 30000) {
      return res.json({
        success: true,
        data: {
          rate: cachedGoldRate.rates['24K'],
          lastUpdated: cachedGoldRate.lastUpdated,
          cached: true,
          location: locationLabel(cachedGoldRate.source)
        }
      });
    }

    const fresh = await performDailyRefresh();
    return res.json({
      success: true,
      data: {
        rate: fresh.rates['24K'],
        lastUpdated: fresh.lastUpdated,
        cached: false,
        location: locationLabel(fresh.source)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const refreshGoldRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fresh = await performDailyRefresh();
    return res.json({
      success: true,
      message: fresh.source === 'nagpur-vgold'
        ? 'Gold rates refreshed from Nagpur (V Gold, Sarafa Bazaar)'
        : 'V Gold temporarily unreachable — showing last known Nagpur rate',
      data: {
        rates: fresh.rates,
        baseRate: fresh.baseRate,
        premiumPerGram: fresh.premiumPerGram,
        source: fresh.source,
        location: locationLabel(fresh.source),
        lastUpdated: fresh.lastUpdated
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateGoldRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rate } = req.body;
    if (!rate || rate <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid gold rate' });
    }

    const effective24K = Math.round(rate);
    cachedGoldRate = {
      ...cachedGoldRate,
      rates: computeRatesFromEffective24K(effective24K),
      lastUpdated: new Date().toISOString(),
      lastFetchDate: todayIST(),
    };
    saveCache(cachedGoldRate);

    return res.json({
      success: true,
      message: 'Gold rates updated successfully',
      data: {
        rates: cachedGoldRate.rates,
        location: locationLabel(cachedGoldRate.source),
        lastUpdated: cachedGoldRate.lastUpdated
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateGoldRatePremium = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { premiumPerGram } = req.body;
    if (premiumPerGram === undefined || premiumPerGram === null || Number.isNaN(Number(premiumPerGram))) {
      return res.status(400).json({ success: false, message: 'Invalid premium value' });
    }

    const newPremium = Math.round(Number(premiumPerGram));
    const effective24K = cachedGoldRate.baseRate + newPremium;

    cachedGoldRate = {
      ...cachedGoldRate,
      premiumPerGram: newPremium,
      rates: computeRatesFromEffective24K(effective24K),
      lastUpdated: new Date().toISOString(),
    };
    saveCache(cachedGoldRate);

    return res.json({
      success: true,
      message: 'Premium updated successfully',
      data: {
        rates: cachedGoldRate.rates,
        baseRate: cachedGoldRate.baseRate,
        premiumPerGram: cachedGoldRate.premiumPerGram,
        source: cachedGoldRate.source,
        location: locationLabel(cachedGoldRate.source),
        lastUpdated: cachedGoldRate.lastUpdated
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Same rolling 30-second window as getLiveGoldRate — this is the
    // endpoint the frontend ticker/admin page actually polls, so this is
    // where the real auto-refresh needs to happen.
    const ageMs = Date.now() - new Date(cachedGoldRate.lastUpdated).getTime();
    if (ageMs >= 30000) {
      await performDailyRefresh();
    }

    return res.json({
      success: true,
      data: {
        rates: cachedGoldRate.rates,
        baseRate: cachedGoldRate.baseRate,
        premiumPerGram: cachedGoldRate.premiumPerGram,
        source: cachedGoldRate.source,
        location: locationLabel(cachedGoldRate.source),
        lastUpdated: cachedGoldRate.lastUpdated
      }
    });
  } catch (err) {
    next(err);
  }
};