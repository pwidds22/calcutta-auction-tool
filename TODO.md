# TODO - March Madness 2026 Sprint

## Phase 1: Foundation (Days 1-3) ✅
- [x] Init Next.js project (TypeScript, Tailwind, shadcn/ui) — `v2/`
- [x] Create Supabase project + database schema (profiles, auction_data tables)
- [x] Set up RLS policies (users access own data only)
- [x] Implement auth (register, login, logout) with `@supabase/ssr`
- [x] Add Next.js middleware for route protection (auth + has_paid check)
- [x] Stripe payment flow (checkout via Payment Link + webhook handler)
- [x] Verify auth flow end-to-end locally
- [x] Deploy to Vercel (connect repo, configure env vars) — `calcutta-genius.vercel.app`
- [x] Configure Stripe webhook for production URL — live mode, `checkout.session.completed`

## Phase 2: Core Product (Days 4-8)
- [ ] Port calculation logic to TypeScript:
  - [ ] `lib/calculations/odds.ts` — American odds to implied probability, devigging
  - [ ] `lib/calculations/values.ts` — Team values, fair values, suggested bids
  - [ ] `lib/calculations/profits.ts` — Round-by-round profit projections
  - [ ] `lib/calculations/pot.ts` — Pot size inference from purchases
- [ ] Write unit tests for calculation functions
- [ ] Build auction tool UI:
  - [ ] Team table (sort, filter, search)
  - [ ] Payout rules editor (must sum to 100%)
  - [ ] Pot size input (estimated + projected)
  - [ ] Summary stats (my teams, opponents, available)
  - [ ] Auction results tracker
  - [ ] Profit projection columns (green/red)
- [ ] Wire up Supabase CRUD (save/load teams, payout rules, pot size)
- [x] Stripe payment flow (checkout session + webhook + gate) — done in Phase 1
- [ ] Update 2026 March Madness team data (64 teams + current odds)

## Phase 3: Polish & Launch (Days 9-14)
- [ ] Landing page (value prop, pricing, CTA)
- [ ] Pricing: Free tier (basic calculator) + Premium ($29.99)
- [ ] Blog migration (MDX)
- [ ] SEO basics (meta tags, OG, sitemap, target keywords)
- [ ] Finalize brand name and domain (researching alternatives to calcuttagenius.com)
- [ ] Purchase new domain if rebranding, add to Vercel, configure DNS
- [ ] DNS cutover: new domain -> Vercel (or calcuttagenius.com if keeping)
- [ ] Test Stripe webhook with `stripe listen --forward-to`
- [ ] Email existing 15 customers about upgrade
- [ ] End-to-end testing (register -> pay -> use tool -> save)
- [ ] Keep Render deployment as fallback briefly

## Phase 4: Post-March Madness (April-August 2026)
- [ ] Live auction hosting (Supabase Realtime: Broadcast + Presence)
- [ ] Golf Calcuttas (Masters, PGA Championship, US Open, The Open)
- [ ] NFL Playoff Calcuttas
- [ ] 2026 FIFA World Cup Calcutta
- [ ] Commissioner premium features (payment collection, branding, history)
- [ ] Content marketing (5-10 SEO blog posts, YouTube tutorials)
- [ ] Apply for FanDuel affiliate program
- [ ] Form LLC

## Known Bugs to Fix During Rebuild
- [ ] `calculateImpliedProbabilities()` in old app appears incomplete — ensure proper devigging in new code
- [ ] Old app has unused MVC files (js/controllers, models, views) — don't port these, start fresh
- [ ] Duplicate webhook handler in legacy server.js (lines ~48 and ~272)
