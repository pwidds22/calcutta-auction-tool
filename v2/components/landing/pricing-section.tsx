import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight } from 'lucide-react'

const FEATURES = [
  'Devigged odds from real sportsbook lines',
  'Fair value for all 64 teams',
  'Suggested bid prices',
  'Round-by-round profit projections',
  'Projected pot size inference',
  'Auto-save to your account',
]

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, one-time pricing
          </h2>
          <p className="mt-4 text-base text-white/50">
            Pay once. Use it for the entire tournament. No subscriptions. No upsells.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <div className="relative">
            {/* Subtle glow behind card */}
            <div className="absolute -inset-3 rounded-2xl bg-emerald-500/[0.05] blur-2xl" />

            <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-white/[0.03] p-8 shadow-2xl shadow-emerald-500/[0.03]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Full Access</h3>
                <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                  March Madness 2026
                </span>
              </div>
              <p className="mt-1 text-sm text-white/40">
                Everything you need to dominate your Calcutta auction.
              </p>

              <div className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-white font-mono">$29.99</span>
                <p className="mt-1 text-sm text-white/40">One-time payment</p>
              </div>

              <ul className="mt-6 space-y-3">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" asChild className="mt-8 w-full gap-2">
                <Link href="/register">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <p className="mt-4 text-center text-xs text-white/30">
                Pool Genius charges $39&ndash;98 for less.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
