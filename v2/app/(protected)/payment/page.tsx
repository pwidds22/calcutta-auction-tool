import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PAYMENT_LINK_URL } from '@/lib/stripe/config'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unlock Calcutta Genius</CardTitle>
          <CardDescription>
            Get fair value calculations, bid recommendations, and round-by-round
            profit projections for March Madness 2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-4xl font-bold">$29.99</p>
            <p className="text-sm text-muted-foreground">One-time payment</p>
          </div>
          <ul className="space-y-2 text-sm">
            <li>Devigged odds from top sportsbooks</li>
            <li>Fair value for every team</li>
            <li>Suggested bid prices</li>
            <li>Round-by-round profit projections</li>
            <li>Projected pot size inference</li>
          </ul>
          <Button asChild className="w-full" size="lg">
            <Link href={PAYMENT_LINK_URL}>Continue to Payment</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
