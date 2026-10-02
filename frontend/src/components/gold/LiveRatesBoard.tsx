"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/* =========================================================
   SOURCE
========================================================= */

const SOURCE_URL = "https://allindiabullion.com/gold-rate/maharashtra/nagpur";

const API_URL = "/api/aib-gold-rates";

const REFRESH_MS = 10 * 1000;

/* =========================================================
   TYPES
========================================================= */

type Direction = "up" | "down" | null;

interface ProductRate {
  label: string;
  value: number;
  change: number | null;
  direction: Direction;
  unit: string;
}

interface GoldProducts {
  retail995: ProductRate | null;
  rtgs995: ProductRate | null;
  gst995: ProductRate | null;
  retail999: ProductRate | null;
  rtgs999: ProductRate | null;
  gst999: ProductRate | null;
}

interface SilverProducts {
  retail999: ProductRate | null;
  rtgs999: ProductRate | null;
  gst999: ProductRate | null;
}

interface AibData {
  city: string;
  state: string;
  fetchedAt: string;
  liveTime: string | null;

  reference: {
    gold24kPer10g: number | null;
    gold22kPer10g: number | null;
    silverPerKg: number | null;
  };

  products: {
    gold: GoldProducts;
    silver: SilverProducts;
  };
}

interface ApiResponse {
  success: boolean;
  stale: boolean;
  fetchedAt: string;
  source: string;
  data?: AibData;
  error?: string;
}

/* =========================================================
   FORMAT HELPERS
========================================================= */

const formatINR = (value: number | null | undefined) => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
};

/* =========================================================
   API FETCH
========================================================= */

/*
  IMPORTANT:

  The frontend does NOT directly fetch All India Bullion.

  Instead:

  LiveRatesBoard
        ↓
  /api/bullion-rates
        ↓
  All India Bullion

  This avoids browser CORS/proxy problems.
*/

async function fetchAibRates(): Promise<{
  data: AibData;
  stale: boolean;
}> {
  // Cache-bust every request so the browser/CDN cannot reuse
  // an older API response.
  const requestUrl = `${API_URL}?_=${Date.now()}`;

  const response = await fetch(requestUrl, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  let result: ApiResponse | null = null;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Invalid response from bullion API. HTTP ${response.status}`,
    );
  }

  if (!response.ok || !result || !result.success || !result.data) {
    throw new Error(
      result?.error || `Unable to load bullion rates. HTTP ${response.status}`,
    );
  }

  return {
    data: result.data,
    stale: Boolean(result.stale),
  };
}

/* =========================================================
   CHANGE INDICATOR
========================================================= */

function ChangeIndicator({
  value,
  direction,
}: {
  value: number | null;
  direction: Direction;
}) {
  if (value === null || direction === null) {
    return <span className="text-xs text-gray-500">—</span>;
  }

  const isUp = direction === "up";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isUp ? "text-blue-400" : "text-red-400"
      }`}
    >
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}

      {value.toLocaleString("en-IN")}
    </span>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product }: { product: ProductRate | null }) {
  if (!product) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#090909] p-5">
        <div className="text-sm font-medium text-gray-500">
          Data unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#090909] p-4 transition-colors hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold tracking-wide text-gray-200">
          {product.label}
        </h4>

        <span className="text-[11px] text-gray-500">{product.unit}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="rounded-md bg-[#151515] px-3 py-2">
          <span className="text-xl font-medium text-white">
            {formatINR(product.value)}
          </span>
        </div>

        <ChangeIndicator value={product.change} direction={product.direction} />
      </div>
    </div>
  );
}

/* =========================================================
   LOADING CARD
========================================================= */

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-[#090909] p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-white/10" />

        <div className="h-3 w-14 rounded bg-white/10" />
      </div>

      <div className="mt-5 h-10 w-32 rounded bg-white/10" />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LiveRatesBoard() {
  const [data, setData] = useState<AibData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [stale, setStale] = useState(false);

  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const hasDataRef = useRef(false);

  const [goldUnit, setGoldUnit] = useState<
    "1gram" | "10grams" | "tola" | "ounce"
  >("10grams");

  /* =======================================================
     LOAD RATES
  ======================================================= */

  const loadRates = useCallback(async () => {
    try {
      // Show the skeleton only on the initial load.
      // Keep current prices visible during 10-second refreshes.
      if (!hasDataRef.current) {
        setLoading(true);
      }

      const result = await fetchAibRates();

      /*
          Store the actual data returned
          by our API route.
        */
      setData(result.data);
      hasDataRef.current = true;

      /*
          API tells us whether this is
          fresh or stale cached data.
        */
      setStale(result.stale);

      setLastFetched(new Date(result.data.fetchedAt));

      setError(null);

      console.log("[LiveRatesBoard] Rates loaded successfully:", result.data);
    } catch (err) {
      console.warn(
        "[LiveRatesBoard] Unable to refresh rates:",
        err instanceof Error ? err.message : err,
      );

      /*
          Keep previous data if available.
        */
      setStale(true);

      setError(
        err instanceof Error ? err.message : "Unable to load live rates.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD + AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    loadRates();

    const interval = window.setInterval(() => {
      loadRates();
    }, REFRESH_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadRates]);

  /* =======================================================
     DATA SHORTCUTS
  ======================================================= */

  const gold = data?.products?.gold;

  const silver = data?.products?.silver;

  /* =======================================================
     GOLD PURITY HELPERS
  ======================================================= */

  const goldPurities = [
    { label: "24K", purity: 24 },
    { label: "23K", purity: 23 },
    { label: "22K", purity: 22 },
    { label: "20K", purity: 20 },
    { label: "18K", purity: 18 },
    { label: "14K", purity: 14 },
  ];

  const goldUnitOptions = [
    { key: "1gram" as const, label: "1 GRAM", grams: 1 },
    { key: "10grams" as const, label: "10 GRAMS", grams: 10 },
    { key: "tola" as const, label: "1 TOLA (11.66G)", grams: 11.6638 },
    { key: "ounce" as const, label: "1 OUNCE (31.1035G)", grams: 31.1035 },
  ];

  const selectedGoldUnit =
    goldUnitOptions.find((unit) => unit.key === goldUnit) ??
    goldUnitOptions[1];

  const getGoldPurityPrice = (purity: number) => {
    const gold24kPer10g = data?.reference?.gold24kPer10g;

    if (
      gold24kPer10g === null ||
      gold24kPer10g === undefined ||
      !Number.isFinite(gold24kPer10g)
    ) {
      return null;
    }

    const pure24kPriceForUnit =
      (gold24kPer10g / 10) * selectedGoldUnit.grams;

    return pure24kPriceForUnit * (purity / 24);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#d6a84f]">
            {data?.city || "Nagpur"} · {data?.state || "Maharashtra"}
          </p>

          <h2 className="font-display text-2xl font-semibold text-[#2d241f] sm:text-3xl">
            Live Nagpur Bullion Rates
          </h2>

          <p className="mt-1 text-sm text-[#6b5d4f]">
            Retail gold and silver reference prices
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {/* LIVE STATUS */}

          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                error || stale ? "bg-amber-400" : "animate-pulse bg-emerald-500"
              }`}
            />

            <span className="font-mono-code text-xs uppercase tracking-wider text-[#4A0404]">
              {error && !data ? "Unavailable" : stale ? "Last known" : "Live"}
            </span>

            {lastFetched && (
              <span className="text-xs text-gray-400">
                ·{" "}
                {lastFetched.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}{" "}
                IST
              </span>
            )}
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={loadRates}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-[#d6a84f]/50 bg-white px-4 py-2 text-xs font-medium text-[#4A0404] transition hover:bg-[#fdf8f0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !data && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-sm text-amber-800">
            Unable to load live bullion rates.
          </p>

          <p className="mt-2 text-xs text-amber-700">
            Please try refreshing the rates.
          </p>

          <button
            type="button"
            onClick={loadRates}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#4A0404] px-5 py-2.5 text-sm font-medium text-[#E8D5A3]"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && !data && (
        <>
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#050505]">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />

              <div className="mt-2 h-7 w-48 animate-pulse rounded bg-white/10" />
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#050505]">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="h-3 w-16 animate-pulse rounded bg-white/10" />

              <div className="mt-2 h-7 w-48 animate-pulse rounded bg-white/10" />
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* =================================================
          LIVE DATA
      ================================================= */}

      {data && (
        <>
          {/* =================================================
              GOLD PRODUCTS
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-[#d6a84f]/30 bg-[#050505]">
            <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d6a84f]">
                  Gold
                </p>

                <h3 className="mt-1 font-display text-2xl font-semibold text-[#e8d5a3]">
                  Gold Products
                </h3>
              </div>

              <span className="text-xs text-gray-500">
                Per 10 g · retail, RTGS and with GST
              </span>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <ProductCard product={gold?.retail995 ?? null} />

              <ProductCard product={gold?.rtgs995 ?? null} />

              <ProductCard product={gold?.gst995 ?? null} />

              <ProductCard product={gold?.retail999 ?? null} />

              <ProductCard product={gold?.rtgs999 ?? null} />

              <ProductCard product={gold?.gst999 ?? null} />
            </div>
          </section>

          {/* =================================================
              SILVER PRODUCTS
          ================================================= */}

          <section className="mt-5 overflow-hidden rounded-2xl border border-[#d6a84f]/30 bg-[#050505]">
            <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d6a84f]">
                  Silver
                </p>

                <h3 className="mt-1 font-display text-2xl font-semibold text-[#e8d5a3]">
                  Silver Products
                </h3>
              </div>

              <span className="text-xs text-gray-500">
                Per kg · retail, RTGS and with GST
              </span>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <ProductCard product={silver?.retail999 ?? null} />

              <ProductCard product={silver?.rtgs999 ?? null} />

              <ProductCard product={silver?.gst999 ?? null} />
            </div>
          </section>

          {/* =================================================
              GOLD PRICE BY PURITY
          ================================================= */}

          <section className="mt-5 overflow-hidden rounded-2xl border border-[#d6a84f]/30 bg-[#050505]">
            {/* HEADER */}
            <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d6a84f]">
                  By Purity
                </p>

                <h3 className="mt-1 font-display text-2xl font-semibold text-[#e8d5a3]">
                  Gold Price in Karat
                </h3>
              </div>

              <span className="text-xs text-gray-500">
                Derived from Gold 24K
              </span>
            </div>

            {/* UNIT SELECTOR */}
            <div className="flex flex-col gap-3 px-5 pt-5">
              <div className="flex w-fit flex-wrap overflow-hidden rounded-lg border border-white/20 bg-[#090909]">
                {goldUnitOptions.map((unit) => {
                  const active = goldUnit === unit.key;

                  return (
                    <button
                      key={unit.key}
                      type="button"
                      onClick={() => setGoldUnit(unit.key)}
                      className={`px-3 py-2 text-[10px] font-semibold transition ${
                        active
                          ? "bg-[#e8d5a3] text-[#050505]"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {unit.label}
                    </button>
                  );
                })}
              </div>

              <div className="text-right text-xs text-gray-500">
                {selectedGoldUnit.label} · karat prices
              </div>
            </div>

            {/* KARAT CARDS */}
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
              {goldPurities.map((item) => {
                const price = getGoldPurityPrice(item.purity);

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-[#090909] p-4 transition hover:border-[#d6a84f]/40"
                  >
                    <p className="text-sm font-semibold text-[#e8d5a3]">
                      {item.label}
                    </p>

                    <div className="mt-3 w-fit rounded-md bg-[#151515] px-3 py-2">
                      <span className="font-mono-code text-base font-medium text-white sm:text-lg">
                        {formatINR(price)}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-gray-500">
                      per {selectedGoldUnit.grams === 1
                        ? "gram"
                        : `${selectedGoldUnit.grams} g`}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* NOTE */}
            <div className="px-5 pb-5">
              <p className="text-[10px] leading-5 text-gray-500">
                AIB reference rate. Values are derived for display; final jewellery
                prices may vary based on making charges, wastage and applicable GST.
              </p>
            </div>
          </section>
        </>
      )}

      {/* =================================================
          SOURCE / DISCLAIMER
      ================================================= */}

      <div className="mt-8 rounded-2xl bg-[#fdf8f0] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs leading-6 text-gray-600">
              Rates are sourced from All India Bullion's Nagpur reference page
              and refreshed automatically every 10 seconds.
            </p>

            {lastFetched && (
              <p className="mt-1 text-[11px] text-gray-400">
                Last synced:{" "}
                {lastFetched.toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}{" "}
                IST
              </p>
            )}
          </div>

          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#4A0404]/20 px-4 py-2 text-xs font-medium text-[#4A0404] transition hover:bg-white"
          >
            All India Bullion
            <ExternalLink size={13} />
          </a>
        </div>

        <p className="mt-4 border-t border-[#d6a84f]/20 pt-4 text-[11px] leading-5 text-gray-500">
          These are reference metal rates. Final jewellery prices may differ
          because of making charges, wastage and applicable GST.
        </p>
      </div>
    </div>
  );
}
