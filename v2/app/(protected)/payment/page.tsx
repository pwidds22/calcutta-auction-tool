import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PAYMENT_LINK_URL } from '@/lib/stripe/config'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  'Devigged odds from real sportsbook lines',
  'Fair value for all 64 teams',
  'Suggested bid prices',
  'Round-by-round profit projections',
  'Projected pot size inference',
  'Auto-save to your account',
]

export default async function PaymentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_paid')
    .eq('id', user.id)
    .single()

  if (profile?.has_paid) redirect('/auction')

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Subtle glow behind card */}
        <div className="absolute -inset-3 rounded-2xl bg-emerald-500/[0.05] blur-2xl" />

        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-white/[0.03] p-8 shadow-2xl shadow-emerald-500/[0.03]">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-white">Unlock Calcutta Edge</h1>
            <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              March Madness 2026
            </span>
          </div>
          <p className="mt-1 text-sm text-white/40">
            Get fair value calculations, bid recommendations, and round-by-round
            profit projections.
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

          <Button asChild className="mt-8 w-full gap-2" size="lg">
            <Link href={PAYMENT_LINK_URL}>
              Continue to Payment
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
