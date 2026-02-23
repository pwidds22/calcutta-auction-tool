import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const email =
      session.customer_email || session.customer_details?.email

    if (!email) {
      console.error('No email found in Stripe session:', session.id)
      return NextResponse.json(
        { error: 'No email in session' },
        { status: 400 }
      )
    }

    console.log('Processing payment for:', email)

    const supabase = createAdminClient()

    // Primary lookup: match by email
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, has_paid')
      .eq('email', email.toLowerCase())
      .single()

    if (fetchError || !profile) {
      // Fallback: find most recent unpaid user created in the last hour
      console.log('No profile found by email, checking recent signups...')
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('id, email, has_paid, created_at')
        .eq('has_paid', false)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(1)

      if (recentProfiles && recentProfiles.length > 0) {
        const recentProfile = recentProfiles[0]
        console.log('Found recent unpaid user:', recentProfile.email)

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            has_paid: true,
            payment_date: new Date().toISOString(),
          })
          .eq('id', recentProfile.id)

        if (updateError) {
          console.error('Failed to update profile:', updateError)
          return NextResponse.json(
            { error: 'Update failed' },
            { status: 500 }
          )
        }
      } else {
        console.error('No matching user found for payment:', email)
      }
    } else {
      if (profile.has_paid) {
        console.log('User already marked as paid:', profile.email)
        return NextResponse.json({ received: true })
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          has_paid: true,
          payment_date: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Failed to update profile:', updateError)
        return NextResponse.json(
          { error: 'Update failed' },
          { status: 500 }
        )
      }

      console.log('Successfully marked user as paid:', profile.email)
    }
  }

  return NextResponse.json({ received: true })
}
