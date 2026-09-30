'use client'

interface CityRateCardProps {
  city: string
  type: 'retail' | 'rtgs'
  gold?: number
  silver?: number
  goldChange?: number | null
  silverChange?: number | null
  goldBeforeGst?: number
  goldWithGst?: number
  goldChangeBefore?: number | null
  goldChangeWith?: number | null
  silverBeforeGst?: number
  silverWithGst?: number
  silverChangeBefore?: number | null
  silverChangeWith?: number | null
}

function ChangeBadge({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || value === 0) {
    return <span className="text-xs text-gray-400">—</span>
  }
  const up = value > 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-sm font-medium ${
        up ? 'text-emerald-600' : 'text-rose-600'
      }`}
    >
      {up ? '▲' : '▼'} {Math.abs(value).toLocaleString('en-IN')}
    </span>
  )
}

function PriceRow({
  label,
  price,
  change,
}: {
  label: string
  price: number
  change?: number | null
}) {
  return (
    <div className="rounded-xl border border-[#f0e6d6] bg-[#fdf8f0]/60 px-3 py-2.5">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[#8a7a6a]">
        {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="font-mono-code text-lg font-semibold tracking-tight text-[#4A0404]">
          ₹{Math.round(price).toLocaleString('en-IN')}
        </p>
        <ChangeBadge value={change} />
      </div>
    </div>
  )
}

export default function CityRateCard({
  city,
  type,
  gold,
  silver,
  goldChange,
  silverChange,
  goldBeforeGst,
  goldWithGst,
  goldChangeBefore,
  goldChangeWith,
  silverBeforeGst,
  silverWithGst,
  silverChangeBefore,
  silverChangeWith,
}: CityRateCardProps) {
  const isRetail = type === 'retail'

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#d6a84f]/30 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-[#f0e6d6] px-5 py-3.5">
        <h3 className="font-display text-base font-semibold text-[#2d241f] sm:text-lg">
          {city}
        </h3>
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {isRetail ? (
          <>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#8a7a6a]">
                <span>GOLD RETAIL 999</span>
                <span>per 10 g</span>
              </div>
              <div className="flex items-end justify-between gap-2 rounded-xl border border-[#f0e6d6] bg-[#fdf8f0]/60 px-3 py-2.5">
                <p className="font-mono-code text-xl font-semibold tracking-tight text-[#4A0404]">
                  ₹{Math.round(gold ?? 0).toLocaleString('en-IN')}
                </p>
                <ChangeBadge value={goldChange} />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#8a7a6a]">
                <span>SILVER RETAIL 999</span>
                <span>per kg</span>
              </div>
              <div className="flex items-end justify-between gap-2 rounded-xl border border-[#f0e6d6] bg-[#fdf8f0]/60 px-3 py-2.5">
                <p className="font-mono-code text-xl font-semibold tracking-tight text-[#4A0404]">
                  ₹{Math.round(silver ?? 0).toLocaleString('en-IN')}
                </p>
                <ChangeBadge value={silverChange} />
              </div>
            </div>

            <div className="mt-auto pt-1 text-center text-xs text-[#8a7a6a]">GST extra</div>
          </>
        ) : (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#8a7a6a]">
                <span>GOLD RTGS 999</span>
                <span>per 10 g</span>
              </div>
              <div className="space-y-2">
                <PriceRow
                  label="BEFORE GST"
                  price={goldBeforeGst ?? 0}
                  change={goldChangeBefore}
                />
                <PriceRow
                  label="WITH GST"
                  price={goldWithGst ?? 0}
                  change={goldChangeWith}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#8a7a6a]">
                <span>SILVER RTGS 999</span>
                <span>per kg</span>
              </div>
              <div className="space-y-2">
                <PriceRow
                  label="BEFORE GST"
                  price={silverBeforeGst ?? 0}
                  change={silverChangeBefore}
                />
                <PriceRow
                  label="WITH GST"
                  price={silverWithGst ?? 0}
                  change={silverChangeWith}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}