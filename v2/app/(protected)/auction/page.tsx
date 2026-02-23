import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default async function AuctionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calcutta Auction Tool</h1>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Sign Out
          </Button>
        </form>
      </div>
      <p className="mt-4 text-muted-foreground">Logged in as {user.email}</p>
      <div className="mt-8 rounded-lg border p-8 text-center">
        <p className="text-lg text-muted-foreground">
          Auction tool coming soon (Phase 2)
        </p>
      </div>
    </div>
  )
}
