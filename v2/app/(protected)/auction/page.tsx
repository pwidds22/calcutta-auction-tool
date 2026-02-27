import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loadAuctionData } from '@/actions/auction'
import { AuctionTool } from '@/components/auction/auction-tool'
import { getActiveTournament, getTournament, listTournaments } from '@/lib/tournaments/registry'
import { normalizePayoutRules } from '@/lib/calculations/normalize'
import Link from 'next/link'

interface AuctionPageProps {
  searchParams: Promise<{ tournament?: string }>
}

export default async function AuctionPage({ searchParams }: AuctionPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check payment status
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_paid')
    .eq('id', user.id)
    .single()

  // Get the requested tournament, or fall back to active
  const tournamentId = params.tournament
  const tournamentEntry = tournamentId
    ? getTournament(tournamentId)
    : undefined

  const { config, teams: baseTeams } = tournamentEntry ?? getActiveTournament()

  // Get all tournaments for the selector
  const allTournaments = listTournaments()

  // Load saved auction data (null if first visit)
  const auctionData = await loadAuctionData(config.id)

  // Normalize payout rules: map legacy DB keys to current config keys
  const payoutRules = normalizePayoutRules(auctionData?.payoutRules, config)

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6">
      {/* Tournament selector */}
      {allTournaments.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {allTournaments.map((t) => {
            const isSelected = t.id === config.id
            return (
              <Link
                key={t.id}
                href={`/auction?tournament=${t.id}`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60'
                }`}
              >
                {t.name}
              </Link>
            )
          })}
        </div>
      )}

      <AuctionTool
        initialTeams={auctionData?.teams ?? []}
        initialPayoutRules={payoutRules}
        initialPotSize={auctionData?.estimatedPotSize ?? config.defaultPotSize}
        config={config}
        baseTeams={baseTeams}
        hasPaid={profile?.has_paid ?? false}
      />
    </div>
  )
}
