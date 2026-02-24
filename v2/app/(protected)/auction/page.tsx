import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loadAuctionData } from '@/actions/auction'
import { AuctionTool } from '@/components/auction/auction-tool'
import { getActiveTournament } from '@/lib/tournaments/registry'

export default async function AuctionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get the active tournament
  const { config, teams: baseTeams } = getActiveTournament()

  // Load saved auction data (null if first visit)
  const auctionData = await loadAuctionData(config.id)

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6">
      <AuctionTool
        initialTeams={auctionData?.teams ?? []}
        initialPayoutRules={auctionData?.payoutRules ?? config.defaultPayoutRules}
        initialPotSize={auctionData?.estimatedPotSize ?? config.defaultPotSize}
        userEmail={user.email!}
        config={config}
        baseTeams={baseTeams}
      />
    </div>
  )
}
