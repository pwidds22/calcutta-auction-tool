import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loadAuctionData } from '@/actions/auction'
import { AuctionTool } from '@/components/auction/auction-tool'
import { DEFAULT_PAYOUT_RULES } from '@/lib/calculations/types'

export default async function AuctionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Load saved auction data (null if first visit)
  const auctionData = await loadAuctionData()

  return (
    <div className="container mx-auto max-w-[1400px] px-4 py-6">
      <AuctionTool
        initialTeams={auctionData?.teams ?? []}
        initialPayoutRules={auctionData?.payoutRules ?? DEFAULT_PAYOUT_RULES}
        initialPotSize={auctionData?.estimatedPotSize ?? 10000}
        userEmail={user.email!}
      />
    </div>
  )
}
