import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _stripe
}

export const PAYMENT_LINK_URL = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL!
