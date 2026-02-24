# Calcutta Edge Roadmap

## Vision
Transform Calcutta Edge from a $14.99 single-use March Madness calculator into the definitive Calcutta auction platform — combining strategy analytics with live auction hosting across multiple sports.

**No dominant platform exists.** Pool Genius treats Calcutta as an afterthought ($39-98 bundled). AuctionPro is free but primitive. Most groups still use Google Sheets. Calcutta Edge can own this niche.

---

## Business Model (from Research 2)

| Layer | What | Revenue |
|-------|------|---------|
| **Free Tier** | Basic payout calculator, rules explainer, limited values | Lead gen + SEO |
| **Strategy Tool** | Full EV tool, devigged odds, bid recommendations ($29-49/event or $79-99/yr) | Core revenue |
| **Free Hosting** | Live auction platform (commissioner creates, participants join) | Distribution flywheel |
| **Commissioner Premium** | Payment collection, custom branding, multi-year tracking ($99-149/yr) | Secondary revenue |
| **Affiliates** | Sportsbook referrals (FanDuel first, contextual placement) | Supplemental |

**Key insight**: Free hosting brings 10-25 users per pool into the ecosystem. Convert 3-5 to the strategy tool at $35 = $105-175 per pool. The commissioner is the distribution channel; the participant is the customer.

---

## Tech Stack (New)

| Layer | Technology | Replacing |
|-------|-----------|-----------|
| Frontend | **Next.js 15+ (App Router, TypeScript)** | Vanilla JS + HTML |
| Styling | **Tailwind CSS + shadcn/ui** | Custom CSS |
| Hosting | **Vercel** (~$20/mo Pro) | Render ($7/mo) |
| Database | **Supabase PostgreSQL** (~$25/mo Pro) | MongoDB Atlas |
| Auth | **Supabase Auth** | Custom JWT + bcrypt |
| Real-time | **Supabase Realtime** (Broadcast + Presence) | None (new) |
| Payments | **Stripe** (same, cleaner webhook integration) | Stripe |
| Blog | **MDX / next-mdx-remote** | marked + Express |

**Why this stack:**
- Supabase Auth eliminates ~200 lines of custom auth code
- Supabase Realtime enables live auction hosting (the killer feature)
- Vercel's serverless model = pay for what you use (perfect for seasonal traffic)
- Next.js App Router = server components, server actions, file-based routing
- WebSocket limitation on Vercel is irrelevant — Supabase handles real-time transport
- Monthly cost: ~$46/mo production

---

## Phase 0: Organization (This Session)
_Get the project ready for a focused rebuild._

- [x] Audit and improve Claude Code setup (CLAUDE.md, commands, agents)
- [x] Read and synthesize all research docs
- [x] Decide tech stack and build order
- [ ] Write this roadmap
- [ ] Update CLAUDE.md for the new direction
- [ ] Update TODO.md with sprint tasks
- [ ] Clean up old/misplaced docs

---

## Phase 1: Foundation (Days 1-3)
_New stack, auth, database, deployed._

### Tasks
- [ ] Initialize Next.js project (TypeScript, Tailwind, shadcn/ui)
- [ ] Create Supabase project, set up database schema:
  ```sql
  profiles: id (uuid, FK auth.users), email, has_paid, payment_date, created_at
  auction_data: id, user_id (FK profiles), teams (jsonb), payout_rules (jsonb), estimated_pot_size, event_type, updated_at
  ```
- [ ] Set up Row Level Security policies (users can only access own data)
- [ ] Implement Supabase Auth (register, login, logout, session middleware)
- [ ] Deploy to Vercel (connect repo, set env vars)
- [ ] Verify auth flow works end-to-end on Vercel

### Key Decisions
- Domain: `calcuttaedge.com` (purchased and configured)
- Use Supabase's `@supabase/ssr` for Next.js cookie-based auth
- `profiles` table auto-created on user signup via database trigger

---

## Phase 2: Core Product (Days 4-8)
_The auction strategy tool, rebuilt properly._

### Tasks
- [ ] Extract calculation logic into TypeScript modules:
  - `lib/calculations/odds.ts` — American odds to implied probability, devigging
  - `lib/calculations/values.ts` — Team values, fair values, suggested bids
  - `lib/calculations/profits.ts` — Round-by-round profit projections
  - `lib/calculations/pot.ts` — Pot size inference from purchases
- [ ] Write unit tests for all calculation functions
- [ ] Build auction tool UI (React components):
  - Team table with sorting, filtering, search
  - Payout rules editor (must sum to 100%)
  - Pot size input (estimated + projected)
  - Summary statistics (my teams, opponents, available)
  - Auction results tracker
  - Profit projection columns (color-coded green/red)
- [ ] Wire up Supabase CRUD (save/load teams, payout rules, pot size)
- [ ] Implement Stripe payment flow:
  - Checkout session → Payment Link
  - Webhook handler at `app/api/webhooks/stripe/route.ts`
  - Gate auction tool behind `has_paid` check
- [ ] 2025 March Madness team data (64 teams with current odds)

### Reusable Logic from Current App
- Team value calculation formula: `valuePercentage = SUM(odds[round] * payoutRules[round])`
- Projected pot inference: `projectedPotSize = totalPaid / totalValuePercentage`
- Round profit calculation: `profit[round] = cumulativePayout[round] - purchasePrice`
- Suggested bid: `fairValue * 0.95`
- Default payout rules (R64: 0.5%, R32: 1%, S16: 2.5%, E8: 4%, F4: 8%, Champ: 16%)

### Known Bug to Fix
- `calculateImpliedProbabilities()` function in current app appears incomplete/broken
- New implementation should properly devig American odds (remove sportsbook margin)

---

## Phase 3: Polish & Launch (Days 9-14)
_Ship it for March Madness 2026._

### Tasks
- [ ] Build landing page (value prop, pricing, CTA)
- [ ] Implement pricing tiers:
  - Free: Basic payout calculator + Calcutta explainer
  - Premium: Full strategy tool at **$29.99/event** (up from $14.99)
- [ ] Migrate blog content to MDX
- [ ] SEO basics:
  - Meta tags, Open Graph, structured data
  - Sitemap generation
  - Target keywords: "calcutta auction calculator", "march madness calcutta strategy"
- [x] DNS cutover: `calcuttaedge.com` → Vercel
- [ ] Stripe webhook testing with `stripe listen --forward-to`
- [ ] Email existing 15 customers about the upgrade + new pricing
- [ ] End-to-end testing (register → pay → use tool → save data)
- [ ] Keep old Render deployment alive briefly as fallback

---

## Phase 4: Post-March Madness (April-August 2026)
_Build the hosting platform and expand._

### Live Auction Hosting (the distribution flywheel)
- [ ] Auction rooms — commissioner creates, gets shareable link
- [ ] Real-time bidding via Supabase Realtime (Broadcast for bids, Presence for who's connected)
- [ ] Auction flow: sequential team presentation → open bidding → sold → next team
- [ ] Live pot size tracking (updates as teams are sold)
- [ ] Results page with all team assignments and prices
- [ ] Export auction results (CSV/PDF)

### Multi-Sport Expansion
- [ ] Golf Calcuttas (The Masters, PGA Championship, US Open, The Open)
  - Different field sizes (typically 30-70 players vs 64 teams)
  - Different payout structures (top 5/10/20 finishers)
- [ ] NFL Playoff Calcuttas (14 teams)
- [ ] 2026 FIFA World Cup Calcutta (48 teams — massive one-time opportunity)
- [ ] Event calendar supporting year-round engagement

### Commissioner Premium Features
- [ ] Payment collection/distribution via Stripe Connect
- [ ] Custom pool branding
- [ ] Multi-year member management and history
- [ ] Advanced payout structure editor
- [ ] Pool analytics dashboard

---

## Phase 5: Growth & Monetization (Fall 2026+)
_Scale what works._

### Content & SEO
- [ ] 5-10 pillar blog posts targeting Calcutta keywords
- [ ] Free payout calculator as lead magnet (no login required)
- [ ] YouTube tutorials ("How to Run Your First Calcutta Auction")
- [ ] Social presence (Twitter/X Calcutta strategy threads during events)

### Affiliate Revenue
- [ ] Apply to FanDuel Partners first (easier approval than DraftKings)
- [ ] Start with DFS promotion (avoids state licensing complexity)
- [ ] Contextual placement: "Use sportsbook odds to find undervalued teams" with affiliate link
- [ ] Track conversions for one season before investing in state licensing
- [ ] Note: Several states (AZ, CO, NJ, PA) require affiliate licensing for sportsbook promotion — research before scaling

### Pricing Optimization
- [ ] Test annual subscription ($79-99/yr) vs per-event ($29-49)
- [ ] Commissioner tier pricing ($99-149/yr)
- [ ] Evaluate free tier conversion rates

### Partnerships
- [ ] Bet The Process podcast — highest-ROI single marketing move
- [ ] Reddit engagement in r/sportsbook, r/CollegeBasketball, r/golf (helpful content, not spam)

---

## What We're NOT Building
- Bracket picks (massively saturated — ESPN has 24.4M users)
- Generic sports betting tools
- Anything that dilutes the Calcutta specialist positioning

---

## Revenue Targets (Conservative)

| Milestone | When | How |
|-----------|------|-----|
| $1,000 | March 2026 | 34 users × $29.99 (price increase alone) |
| $5,000 | March 2027 | 170 users × $29.99 (with content marketing) |
| $15,000/yr | 2027-2028 | 100 pools × $150 avg revenue per pool (hosting + analytics) |
| $50,000+/yr | 2028+ | Multi-sport + Commissioner tier + affiliates |

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| March Madness 2026 timeline is tight | Core tool is a rebuild of existing logic, not net-new invention |
| Supabase learning curve | Well-documented, Context7 + MCP server available |
| Price increase might lose existing users | Only 15 customers, and $29.99 is still far below Pool Genius ($39-98) |
| State gambling regulations | Position as analytics/calculator tool, not gambling platform. Form LLC before scaling. |
| Seasonal traffic (3 weeks/year for NCAA) | Multi-sport expansion creates year-round engagement |
