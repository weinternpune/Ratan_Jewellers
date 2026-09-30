import Link from 'next/link'

// Slim maroon strip on the home page. Opens the live-rates page in the SAME tab.
export default function LiveGoldRatesButton() {
  return (
    <div className="border-y border-yellow-500/20 bg-[#4A0404] py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6">
        <Link
          href="/live-gold-rates"
          className="inline-flex items-center gap-2.5 rounded-full border border-[#C9A84C]/60 bg-[#C9A84C] px-6 py-2 font-mono-code text-xs font-medium uppercase tracking-wider text-[#340008] transition hover:bg-[#E8D5A3]"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
          Live Gold Rates
        </Link>
      </div>
    </div>
  )
}