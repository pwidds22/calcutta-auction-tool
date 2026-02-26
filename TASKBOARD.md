# Calcutta Edge — Task Board

> Last updated: 2026-02-26
> Status key: `TODO` | `IN_PROGRESS` | `DONE` | `BLOCKED` | `CUT`

---

## Stream 1: Tournament Lifecycle (THE critical gap)
*Without this, the product is an auction tool with no "during the tournament" or "after the tournament" experience.*

### T1.1 — Tournament Results DB Schema
- **Status**: TODO
- **Priority**: P0
- **Description**: New `tournament_results` table tracking per-team outcomes per round. Commissioner enters who won/lost each round as games happen IRL.
- **Schema**:
  ```sql
  tournament_results: id, session_id (FK auction_sessions), team_id (text),
    round_key (text), result (enum: 'won', 'lost', 'pending'),
    entered_by (uuid FK profiles), entered_at (timestamptz)
  ```
- **Acceptance**: Migration applied, RLS policies in place (commissioner can write, participants can read)

### T1.2 — Commissioner Results Entry UI
- **Status**: TODO
- **Priority**: P0
- **Depends on**: T1.1
- **Description**: After auction completes, commissioner sees a "Enter Results" interface. Round-by-round, they mark which teams won/lost. Auto-eliminate losers. Show bracket/matchup view for March Madness.
- **Acceptance**: Commissioner can mark results round by round. Changes persist to DB. Broadcast to all participants in real-time.

### T1.3 — Live Leaderboard
- **Status**: TODO
- **Priority**: P0
- **Depends on**: T1.1, T1.2
- **Description**: During the tournament, all participants see a live leaderboard. Shows: each participant's teams (active/eliminated), earnings so far (from completed rounds), projected remaining value, net P&L (earnings - auction spend). Updates in real-time as commissioner enters results.
- **Acceptance**: Leaderboard updates when results are entered. Color-coded teams (green=active, red=eliminated). Sortable by earnings, P&L, teams remaining.

### T1.4 — Actual Payout Calculation Engine
- **Status**: TODO
- **Priority**: P0
- **Depends on**: T1.1
- **Description**: Given tournament results + payout rules + actual pot (sum of bids), calculate what each team owner actually earned per round. This is the "actuals" version of the settlement calculator (which currently only does projections).
- **Acceptance**: Pure function with unit tests. Handles partial tournaments (mid-event). Handles prop bets when results are entered.

### T1.5 — Settlement Matrix (Splitwise-style)
- **Status**: TODO
- **Priority**: P0
- **Depends on**: T1.4
- **Description**: At tournament end, compute net position per participant (total earned - total spent at auction). Then minimize transactions using greedy debt simplification. Output: "Alice pays Bob $50", "Charlie pays Bob $30", etc. Include Venmo/Zelle deep links.
- **Acceptance**: Net P&L per participant. Minimized transaction list. Copy-to-clipboard. Export to image/PDF.

### T1.6 — Payment Tracking
- **Status**: TODO
- **Priority**: P1
- **Depends on**: T1.5
- **Description**: Commissioner can mark individual transactions as "paid" or "pending". Visual tracker showing settlement progress.
- **Acceptance**: Toggle paid/pending per transaction. Progress indicator (e.g., "5 of 7 settled").

---

## Stream 2: Multi-Tournament Platform Feel
*Users should see this is a platform for ALL Calcuttas, not just March Madness.*

### T2.1 — Events/Tournaments Page
- **Status**: TODO
- **Priority**: P0
- **Description**: New `/events` page showing all available and upcoming tournaments. March Madness 2026 = "Active Now". Masters 2026, Kentucky Derby, NFL Playoffs 2026 = "Coming Soon" with dates. Each card links to the strategy tool (if active) or a "Notify Me" signup.
- **Acceptance**: Grid of event cards. Active events have "Start Strategy" or "Host Auction" CTAs. Coming soon events have dates and "Notify Me".

### T2.2 — Tournament Configs: Masters, Kentucky Derby, NFL Playoffs
- **Status**: TODO
- **Priority**: P1
- **Depends on**: T2.1
- **Description**: Create placeholder TournamentConfig files for The Masters (April 2026), Kentucky Derby (May 2026), and NFL Playoffs (Jan 2027). Fields, payout structures, devigging strategies. Don't need real odds yet — just the config structure so the "Coming Soon" cards are backed by real data.
- **Acceptance**: 3 new config files in `v2/lib/tournaments/configs/`. Registered in registry. Show on events page.

### T2.3 — Tournament Selector in Strategy Tool
- **Status**: TODO
- **Priority**: P1
- **Depends on**: T2.2
- **Description**: When user goes to `/auction`, show a tournament selector if multiple active tournaments exist. Currently hardcoded to `getActiveTournament()`. Should show a dropdown or card selector.
- **Acceptance**: Users can switch between active tournaments. State/save is per-tournament.

### T2.4 — Landing Page Multi-Sport Messaging
- **Status**: TODO
- **Priority**: P1
- **Description**: Update landing page to show upcoming events calendar. Add "Works for any Calcutta" section with sport icons (basketball, golf, football, horse racing, TV). Show that this is a year-round platform.
- **Acceptance**: Landing page communicates multi-sport. Upcoming events visible. Not just "March Madness".

### T2.5 — Session Tournament Selection
- **Status**: TODO
- **Priority**: P1
- **Description**: When commissioner creates a live auction session, they select which tournament/event. Currently defaults to active tournament. Should show all available tournaments.
- **Acceptance**: Create session form has tournament selector. Session stores tournament_id.

---

## Stream 3: Content & SEO
*Drive organic traffic and educate users.*

### T3.1 — MDX Blog Setup
- **Status**: TODO
- **Priority**: P1
- **Description**: Set up next-mdx-remote or @next/mdx for blog posts. Route: `/blog` (list) and `/blog/[slug]` (post). Dark theme consistent with rest of site.
- **Acceptance**: Can write .mdx files in `v2/content/` and they render at `/blog/slug`.

### T3.2 — Launch Blog Posts (3 minimum)
- **Status**: TODO
- **Priority**: P1
- **Depends on**: T3.1
- **Description**: Write 3 cornerstone posts:
  1. "What is a Calcutta Auction? The Complete Guide" (SEO pillar)
  2. "March Madness 2026 Calcutta Strategy: Team Values & Fair Bids" (seasonal traffic)
  3. "How to Host Your First Calcutta Auction Online" (product-led)
- **Acceptance**: 3 posts published, properly formatted, with internal links to product pages.

### T3.3 — SEO Foundations
- **Status**: TODO
- **Priority**: P1
- **Description**: Structured data (JSON-LD), dynamic OG images, XML sitemap, robots.txt updates, canonical URLs. Target keywords: "calcutta auction", "march madness calcutta", "how to run a calcutta".
- **Acceptance**: Lighthouse SEO score 90+. OG images render on social shares. Sitemap accessible.

---

## Stream 4: Infrastructure & Deploy
*Get current code live and configure production services.*

### T4.1 — Deploy Latest to Vercel
- **Status**: TODO
- **Priority**: P0
- **Description**: Push all current code to main. Verify build succeeds on Vercel. Check that live site reflects all recent changes (settlement calc, completion screen, legal disclaimers, etc.)
- **Acceptance**: calcuttaedge.com shows latest code. No build errors.

### T4.2 — Set NEXT_PUBLIC_SITE_URL in Vercel
- **Status**: TODO
- **Priority**: P0
- **Description**: Set `NEXT_PUBLIC_SITE_URL=https://calcuttaedge.com` in Vercel environment variables. Required for password reset emails to link correctly.
- **Acceptance**: Forgot password emails link to correct domain.

### T4.3 — Configure Stripe Payment Link Redirect
- **Status**: TODO
- **Priority**: P1
- **Description**: After payment, user should land on `/auction` (or `/events` once that exists). Currently they go nowhere useful. Configure in Stripe dashboard.
- **Acceptance**: After successful payment, user lands on the app (not a blank page or Stripe receipt).

### T4.4 — Production E2E: Register → Pay → Strategy Tool
- **Status**: TODO
- **Priority**: P0
- **Depends on**: T4.1
- **Description**: Full end-to-end test on production: create account, pay with Stripe test card (or live), access strategy tool, save data, log out, log back in, data persists.
- **Acceptance**: Complete happy path works on calcuttaedge.com.

### T4.5 — Production E2E: Live Auction Full Flow
- **Status**: TODO
- **Priority**: P0
- **Depends on**: T4.1
- **Description**: Test on production: create session, join from another tab/browser, bid, sell teams, skip, undo, pause, resume, complete auction. Verify real-time works through Vercel.
- **Acceptance**: Two-tab live auction works on production. All bidding actions work. Timer works.

### T4.6 — Production E2E: Forgot Password
- **Status**: TODO
- **Priority**: P1
- **Depends on**: T4.2
- **Description**: Test forgot password flow on production. Verify email arrives, link works, password updates.
- **Acceptance**: Full reset flow works end-to-end on calcuttaedge.com.

---

## Stream 5: Polish & UX
*Make it feel professional and production-ready.*

### T5.1 — Mobile Responsiveness Audit
- **Status**: TODO
- **Priority**: P1
- **Description**: Test all pages on mobile viewport (375px). Fix: auction table needs horizontal scroll, landing page sections need to stack properly, live auction controls need to be usable on phone.
- **Acceptance**: All pages usable on iPhone 14 viewport. No horizontal overflow. Touch targets appropriately sized.

### T5.2 — Loading States & Error Handling
- **Status**: TODO
- **Priority**: P1
- **Description**: Add proper loading skeletons for: auction page load, session creation, joining session, leaderboard. Add error boundaries and user-friendly error messages.
- **Acceptance**: No blank screens during data loading. Errors show actionable messages.

### T5.3 — PWA Setup
- **Status**: TODO
- **Priority**: P2
- **Description**: Add PWA manifest, service worker, app icons. Users can "Add to Home Screen" on mobile for app-like experience.
- **Acceptance**: Passes PWA installability criteria. Can be added to home screen on iOS and Android.

### T5.4 — Notification/Email System (basic)
- **Status**: TODO
- **Priority**: P2
- **Description**: Transactional emails for: welcome after signup, payment confirmation, auction invite (when commissioner shares link), results update. Use Supabase Auth emails + a simple email service (Resend or Supabase's built-in).
- **Acceptance**: Key lifecycle emails send automatically.

---

## Stream 6: Launch
*Get users and revenue.*

### T6.1 — Update March Madness Odds (Selection Sunday 3/15)
- **Status**: TODO
- **Priority**: P0 (time-gated: 3/15)
- **Description**: After Selection Sunday bracket reveal, update `v2/lib/tournaments/configs/march-madness-2026.ts` with actual 64-team bracket, seeds, and current odds from The Odds API or manual entry.
- **Acceptance**: All 64 teams correct. Odds reflect post-Selection Sunday lines. Regions/groups match actual bracket.

### T6.2 — Email Existing Customers
- **Status**: TODO
- **Priority**: P1
- **Description**: Email the 15 existing customers about the platform upgrade. New features, new pricing ($29.99), live hosting is free. Migration path for any saved data.
- **Acceptance**: Email sent with clear value prop and CTA.

### T6.3 — Social/Marketing Prep
- **Status**: TODO
- **Priority**: P2
- **Description**: Create shareable launch assets. Twitter/X thread about the platform. Reddit posts in r/CollegeBasketball, r/sportsbook (helpful content, not spam). Landing page OG image for social sharing.
- **Acceptance**: At least 1 social post ready. OG image renders correctly on Twitter/Facebook.

---

## Execution Order (dependency chain)

```
T4.1 (deploy) ──→ T4.2 (site URL) ──→ T4.6 (forgot pw test)
     │
     ├──→ T4.4 (E2E strategy)
     └──→ T4.5 (E2E live auction)

T1.1 (results schema) ──→ T1.2 (results UI) ──→ T1.3 (leaderboard)
          │
          └──→ T1.4 (payout engine) ──→ T1.5 (settlement) ──→ T1.6 (payment tracking)

T2.1 (events page) ──→ T2.2 (tournament configs)
                              │
                              ├──→ T2.3 (tournament selector)
                              └──→ T2.5 (session tournament select)

T2.4 (landing multi-sport) — independent

T3.1 (blog setup) ──→ T3.2 (blog posts)
T3.3 (SEO) — independent

T5.x — all independent, can be done anytime

T6.1 — time-gated to 3/15
T6.2, T6.3 — after everything else ships
```

## Priority Legend
- **P0**: Must ship before March Madness 2026 (first game 3/17)
- **P1**: Should ship before March Madness, platform feels incomplete without it
- **P2**: Nice to have, can ship after launch
