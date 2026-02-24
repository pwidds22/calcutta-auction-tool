import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

// Static mock data for the product preview — shows what the tool actually does
const MOCK_TEAMS = [
  { name: 'Duke', seed: 1, region: 'East', fairValue: '$1,580', suggestedBid: '$1,501', value: '15.80%', profit: '+$312', profitPositive: true },
  { name: 'Houston', seed: 1, region: 'Midwest', fairValue: '$1,420', suggestedBid: '$1,349', value: '14.20%', profit: '+$186', profitPositive: true },
  { name: 'Florida', seed: 1, region: 'South', fairValue: '$1,390', suggestedBid: '$1,321', value: '13.90%', profit: '-$48', profitPositive: false },
  { name: 'Auburn', seed: 1, region: 'West', fairValue: '$2,140', suggestedBid: '$2,033', value: '21.40%', profit: '+$560', profitPositive: true },
]

function ProductPreview() {
  return (
    <div className="relative">
      {/* Emerald glow effect behind card */}
      <div className="absolute -inset-6 rounded-3xl bg-emerald-500/[0.07] blur-3xl" />

      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-card shadow-2xl shadow-emerald-500/[0.05]">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <div className="ml-3 flex-1 rounded-md bg-white/[0.04] px-3 py-1">
            <span className="text-[10px] text-white/30 font-mono">calcuttaedge.com/auction</span>
          </div>
        </div>

        {/* Mini dashboard header */}
        <div className="border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">Effective Pot Size</p>
              <p className="text-lg font-bold text-white font-mono">$10,000</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">Teams Sold</p>
              <p className="text-lg font-bold text-white font-mono">12 / 64</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] font-medium uppercase tracking-wider text-white/40">
                <th className="px-3 py-2 text-left">Team</th>
                <th className="px-3 py-2 text-right">Value</th>
                <th className="hidden px-3 py-2 text-right sm:table-cell">Fair Value</th>
                <th className="px-3 py-2 text-right">Sug. Bid</th>
                <th className="px-3 py-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TEAMS.map((team) => (
                <tr key={team.name} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/[0.06] text-[10px] font-bold font-mono text-white/50">
                        {team.seed}
                      </span>
                      <div>
                        <span className="font-medium text-white">{team.name}</span>
                        <span className="ml-1.5 text-[10px] text-white/30">{team.region}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-white/40">{team.value}</td>
                  <td className="hidden px-3 py-2.5 text-right font-mono text-white/40 sm:table-cell">{team.fairValue}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-medium text-white">{team.suggestedBid}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`inline-flex items-center gap-0.5 font-mono font-medium ${team.profitPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {team.profitPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                      {team.profit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Radial gradient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-emerald-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              March Madness 2026
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Know What Every Team Is{' '}
              <span className="underline decoration-emerald-500/40 decoration-2 underline-offset-4">
                Actually Worth
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-white/50 sm:text-lg">
              Devigged sportsbook odds. Fair value calculations. Bid recommendations
              and round-by-round profit projections. The only Calcutta strategy tool
              built for people who play to win.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white/10 bg-transparent text-white hover:bg-white/[0.06] hover:text-white">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <p className="mt-4 text-xs text-white/30">
              $29.99 one-time &middot; No subscription
            </p>
          </div>

          {/* Right: Product preview */}
          <div className="lg:pl-4">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  )
}
