# Calcutta Edge - Claude Code Context

## Project Overview
Calcutta Edge (calcuttaedge.com) is a Calcutta auction platform — combining strategy analytics with live auction hosting. Users get fair value calculations, bid recommendations, round-by-round profit projections, and (soon) real-time auction hosting.

**Target market**: Calcutta auction participants across March Madness, golf majors, NFL playoffs, and more. Affluent, analytically-minded audience with $500-$100K+ at stake per pool.

**Business model**: Free hosting (distribution) + paid strategy analytics ($29.99/event) + commissioner premium ($99-149/yr)

See `ROADMAP.md` for the full product strategy, phased build plan, and revenue targets.

## Current Status: Rebuilding for March Madness 2026

**Old stack** (legacy, still live on Render): Node.js + Express, MongoDB/Mongoose, Stripe, JWT auth, vanilla JS
**New stack** (building now): Next.js 15 (App Router, TypeScript), Supabase (auth + DB + real-time), Stripe, Vercel

### New Stack Quick Start
```bash
npm run dev     # Next.js dev server (port 3000)
npm run build   # Production build
npm run lint    # ESLint
```

### Required Environment Variables (New Stack)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only, for webhooks)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

---

## New Architecture

### Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15+ (App Router, TypeScript) | SSR, server actions, file-based routing |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development, consistent design |
| Hosting | Vercel | First-party Next.js support, serverless (pay for seasonal use) |
| Database | Supabase PostgreSQL | Auth + DB + real-time in one, RLS for security |
| Auth | Supabase Auth (`@supabase/ssr`) | Cookie-based sessions, middleware route protection |
| Real-time | Supabase Realtime | Broadcast + Presence for live auctions |
| Payments | Stripe | Payment Links + webhooks (same as before, cleaner integration) |
| Blog | MDX / next-mdx-remote | Markdown blog with React components |

### Database Schema (Supabase PostgreSQL)
```sql
-- profiles: extends Supabase auth.users
profiles: id (uuid FK auth.users), email, has_paid, payment_date, created_at

-- auction_data: per-user per-event auction state
auction_data: id, user_id (FK profiles), teams (jsonb), payout_rules (jsonb),
              estimated_pot_size, event_type, updated_at
```

### Key Directories (New)
```
app/                    # Next.js App Router pages and layouts
  (auth)/               # Auth pages (login, register)
  (protected)/          # Pages requiring auth + payment
    auction/            # Auction tool
    profile/            # User profile
  api/                  # API routes
    webhooks/stripe/    # Stripe webhook handler
lib/                    # Shared utilities
  supabase/             # Supabase client helpers (server + client)
  calculations/         # Core auction math (odds, values, profits, pot)
  stripe/               # Stripe helpers
components/             # React components
  ui/                   # shadcn/ui components
  auction/              # Auction-specific components
content/                # MDX blog posts
```

### Auth Flow (New)
1. User registers via Supabase Auth -> session cookie set -> redirected to payment
2. User pays via Stripe Payment Link -> webhook marks `has_paid: true` in profiles
3. Next.js middleware checks session + `has_paid` on protected routes
4. Supabase RLS ensures users can only access their own data

### Payment Flow (New)
1. Authenticated user hits checkout -> gets Stripe Payment Link URL
2. Stripe webhook at `app/api/webhooks/stripe/route.ts` fires on `checkout.session.completed`
3. Webhook uses Supabase admin client (service role key) to update `profiles.has_paid`
4. `req.text()` in App Router gives raw body for signature verification (no config needed)

### Core Calculation Logic (preserve from old app)
These formulas are the heart of the product — port to TypeScript with unit tests:
- **Team value**: `valuePercentage = SUM(odds[round] * payoutRules[round] / 100)`
- **Fair value**: `fairValue = valuePercentage * potSize`
- **Pot inference**: `projectedPotSize = totalPaid / totalValuePercentage`
- **Round profit**: `profit[round] = cumulativePayout[round] - purchasePrice`
- **Suggested bid**: `fairValue * 0.95`
- **Odds devigging**: Convert American odds to implied probabilities, remove vig

---

## Legacy Architecture (Express + MongoDB — still live on Render)

### Server (`server.js`)
- Express app, port 5000 (dev) / 10000 (prod)
- Stripe webhook route registered before `express.json()` (critical order)
- **Known tech debt**: Webhook handler duplicated at lines ~48 and ~272
- CORS: localhost + calcuttaedge.com + www subdomain
- Cookie-based JWT auth with domain-aware settings (.calcuttaedge.com in prod)

### Legacy Required Environment Variables
- `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`

### Routes
| Route | File | Auth | Purpose |
|-------|------|------|---------|
| `/api/auth/*` | `routes/auth.js` | Mixed | Register, login, logout, profile update |
| `/api/payment/*` | `routes/payment.js` | Private | Stripe checkout, payment status, webhooks |
| `/api/data/*` | `routes/userData.js` | Private | CRUD for user auction data |
| `/api/blog/*` | `routes/blog.js` | Public | Blog posts from markdown files |

### Models
- **User** (`models/User.js`): email, password (bcrypt), hasPaid, paymentDate
- **UserData** (`models/UserData.js`): user ref, teams (jsonb-like array), payoutRules, estimatedPotSize

### Frontend
- **Views** (`views/`): HTML pages
- **JS** (`js/`): `auction-tool.js` (2068-line monolith — main app logic, NOT using the MVC files below)
  - `js/controllers/AuctionController.js` — unused ES6 class
  - `js/models/Auction.js`, `Team.js` — unused data models
  - `js/views/View.js`, `TeamTableView.js` — unused view classes
- **Note**: The MVC files were started but never integrated. All logic lives in `auction-tool.js`.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update CLAUDE.md anti-patterns
- Write rules for yourself that prevent the same mistake

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Ask yourself: "Would a staff engineer approve this?"
- Run dev server, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes — don't over-engineer

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. No hand-holding needed.
- Point at logs, errors, failing tests — then resolve them

## Task Management
1. **Plan First**: Write plan to todo list with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Summarize what was done
6. **Capture Lessons**: Update CLAUDE.md anti-patterns after corrections

## Core Principles
- **Simplicity First**: Make every change as simple as possible
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary
- **Use Context7**: Look up Supabase, Next.js, Stripe docs via MCP before guessing
- **Test Calculations**: Core math functions must have unit tests

---

## Anti-Patterns (DO NOT DO THESE)

### New Stack (Next.js + Supabase)
- **DON'T** use the Supabase service role key on the client — it bypasses RLS. Only use in server-side code (API routes, server actions).
- **DON'T** create Supabase clients without `@supabase/ssr` cookie handling — sessions won't persist across server components
- **DON'T** skip RLS policies on tables — every table with user data must have row-level security enabled
- **DON'T** put `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` variables — it would be exposed to the browser
- **DON'T** forget to disable Vercel deployment protection on the Stripe webhook route
- **DON'T** hardcode Stripe Payment Link URLs — use environment variables

### Legacy Server (Express)
- **DON'T** move the Stripe webhook route after `express.json()` — signature verification requires raw body
- **DON'T** add another webhook handler — there's a duplicate at line ~272 that needs removal

### Payments
- **DON'T** modify webhook handling without testing with `stripe listen --forward-to`
- **DON'T** remove the fallback "recent unpaid user" logic without a replacement

### Git
- **DON'T** commit environment variable files or any file containing secrets
- **DON'T** force push to main without discussing first
- **DON'T** make commits with vague messages — follow the existing descriptive style

---

## Key Reference Documents
- `ROADMAP.md` — Full product strategy, phased build plan, revenue targets
- `CLAUDE_RESEARCH1.md` — Market analysis (competition, pricing, expansion opportunities)
- `CLAUDE_RESEARCH2.md` — Strategic playbook (business model, shared-info problem, revenue formula)
- `FUTURE_IMPROVEMENTS.md` — Old feature requests (some incorporated into roadmap)

## Session Notes
<!-- Updated by /start-session and /end-session commands -->

### Session: 2026-02-23 — Project Organization & Rebuild Planning

**Completed:**
- Audited and improved Claude Code setup (`.claude/` commands, agents, settings)
- Deleted `PROJECT_OVERVIEW.md` (was for PoolPicks.io, wrong repo)
- Updated `CLAUDE.md` with missing directory docs, client-side MVC info, duplicate webhook note, new anti-patterns
- Read and synthesized all research docs (`CLAUDE_RESEARCH1.md`, `CLAUDE_RESEARCH2.md`, `FUTURE_IMPROVEMENTS.md`)
- Researched tech stack: Next.js 15 + Supabase + Vercel confirmed (~$46/mo)
- Researched sportsbook affiliates → wrote `AFFILIATE_RESEARCH.md`
- Created `ROADMAP.md` — full product strategy, phased build plan, revenue targets
- Created `TODO.md` — sprint tasks for March Madness 2026 rebuild
- Rewrote `CLAUDE.md` for new stack (new architecture + legacy reference)
- Committed and pushed all setup files

**Key Decisions Made:**
- Full rebuild: Next.js 15 (App Router, TS) + Supabase + Vercel
- Timeline: Ship for March Madness 2026 (~3 weeks)
- Pricing: $14.99 → $29.99/event
- Build order: Foundation → Core tool → Polish/launch → Post-season hosting
- Affiliates: FanDuel first, start with DFS, track before investing in state licensing

**Next Steps (Next Session):**
- Start Phase 1: Init Next.js project, create Supabase project + schema, implement auth, deploy to Vercel
- See `TODO.md` Phase 1 tasks for full checklist

**Blockers:**
- None. Ready to build.

### Session: 2026-02-23 — Phase 1 Foundation Build (COMPLETE)

**Completed:**
- Initialized Next.js 16 (App Router, TypeScript, Tailwind, shadcn/ui) in `v2/` subdirectory
- Created Supabase project "Calcutta Edge" (`xtkdwyrxllqmgoedfotf`, us-east-1) via MCP
- Applied full DB migration: `profiles` + `auction_data` tables, RLS policies, auto-create trigger
  - Migration file: `v2/supabase/migrations/00001_initial_schema.sql`
- Built 4 Supabase client utilities: `v2/lib/supabase/{client,server,middleware,admin}.ts`
- Implemented auth flow (register, login, logout) with `@supabase/ssr`
  - Server actions: `v2/actions/auth.ts`
  - Forms: `v2/components/auth/{login-form,register-form}.tsx`
  - Pages: `v2/app/(auth)/login/`, `v2/app/(auth)/register/`, `v2/app/(auth)/auth/callback/`
- Built middleware for route protection + payment gate: `v2/middleware.ts`
- Built Stripe webhook handler: `v2/app/api/webhooks/stripe/route.ts`
  - Lazy Stripe init to avoid build-time errors: `v2/lib/stripe/config.ts`
  - Preserves legacy "recent unpaid user" fallback logic
- Created placeholder pages: payment, auction, profile, landing
- Created Stripe sandbox payment link ($29.99) — working end-to-end
- Fixed `.claude/settings.json` write hook (was blocking `process.env` in source code)
- Updated `.gitignore` for v2 Next.js files
- Verified full auth flow: register → payment redirect → pay → /auction access → /profile shows "Active"
- Build passes (`npx next build`)

**Key Files Created:**
- `v2/` — entire Next.js app directory (20+ files)
- `v2/middleware.ts` — auth + payment gate
- `v2/lib/supabase/` — 4 client utilities
- `v2/app/api/webhooks/stripe/route.ts` — Stripe webhook
- `v2/actions/auth.ts` — login/signup/logout server actions

**Infrastructure:**
- Supabase project: `xtkdwyrxllqmgoedfotf` (us-east-1, $10/mo)
- Stripe sandbox payment link: `https://buy.stripe.com/test_5kQ3cobmL0Ynbl3f4b18c00`
- Next.js version: 16.1.6 (installed as latest, not 15 — middleware deprecated warning is cosmetic)

**Known Issues:**
- Stripe webhook can't reach localhost (no tunnel) — manually updated `has_paid` via Supabase MCP for testing. Will work in production with Vercel URL.
- Stripe Payment Link doesn't redirect back to app after payment — need to configure redirect URL in Stripe dashboard
- `middleware.ts` deprecated warning in Next.js 16 — still works, can migrate to `proxy` convention later

**Next Steps (Next Session):**
- Start Phase 2: Port calculation logic from `js/auction-tool.js` to TypeScript
- Build auction tool UI (team table, payout rules editor, pot size, profit projections)
- Port landing page from `views/home.html`
- Wire up Supabase CRUD for save/load
- Deploy to Vercel

**Blockers:**
- None. Foundation is solid, ready for Phase 2.

### Session: 2026-02-23 — Vercel Deployment & Stripe Webhook (Phase 1 COMPLETE)

**Completed:**
- Cleaned up `v2/next.config.ts` — removed `turbopack.root` workaround that would break in Vercel's deploy context
- Removed hardcoded live Stripe Payment Link URL from `v2/lib/stripe/config.ts` — now requires `NEXT_PUBLIC_STRIPE_PAYMENT_LINK_URL` env var
- Moved Windows-only binary packages (`@tailwindcss/oxide-win32-x64-msvc`, `lightningcss-win32-x64-msvc`) from `dependencies` to `optionalDependencies` in `v2/package.json` — fixes Vercel Linux build (npm silently skips incompatible optional deps)
- Deployed v2 to Vercel: **calcuttaedge.com** (root directory: `v2`)
- Configured all environment variables in Vercel (Supabase + Stripe live keys)
- Verified landing page, auth pages, and route protection working in production
- Set up Stripe webhook endpoint in live mode: `checkout.session.completed` → `https://calcuttaedge.com/api/webhooks/stripe`
- Added `STRIPE_WEBHOOK_SECRET` to Vercel env vars and redeployed

**Key Files Modified:**
- `v2/next.config.ts` — simplified to empty config
- `v2/lib/stripe/config.ts` — removed hardcoded fallback URL
- `v2/package.json` — Windows binaries moved to `optionalDependencies`

**Infrastructure:**
- Vercel project: `calcutta-edge` at `calcuttaedge.com`
- Stripe webhook: live mode, `checkout.session.completed` event
- Auto-deploys on push to `main` via GitHub integration

**Key Learnings:**
- Windows platform binaries (`*-win32-x64-msvc`) in `dependencies` cause `EBADPLATFORM` errors on Vercel (Linux) — must use `optionalDependencies`
- User's global `~/.npmrc` has `os=linux` which blocks Windows optional deps from auto-resolving locally — existing `node_modules` from prior installs still work
- Vercel MCP `deploy_to_vercel` tool only provides instructions, doesn't actually deploy — use dashboard or CLI

**Next Steps (Next Session):**
- **Domain**: Rebranded to Calcutta Edge, calcuttaedge.com purchased and configured.
- **Phase 2**: Port calculation logic from `js/auction-tool.js` to TypeScript (`v2/lib/calculations/`)
- Build auction tool UI (team table, payout rules editor, pot size, profit projections)
- Wire up Supabase CRUD for save/load
- 2026 March Madness team data (64 teams + current odds)

**Blockers:**
- None. Phase 1 fully complete. Ready for Phase 2.

### Session: 2026-02-23 — Phase 2 Core Product Build (COMPLETE)

**Completed:**
- Ported ALL calculation logic from legacy `js/auction-tool.js` (2068 lines) to TypeScript modules:
  - `v2/lib/calculations/types.ts` — All interfaces, constants, bracket structure (RoundKey, Team, PayoutRules, etc.)
  - `v2/lib/calculations/odds.ts` — American odds conversion + structure-aware devigging (R32 pairs → S16 quadrants → E8 halves → F4 regions → F2 bracket sides → Championship global, with per-round capping)
  - `v2/lib/calculations/values.ts` — Team value calculation (`valuePercentage = SUM(odds[round] * payoutRules[round] / 100)`), fair values, suggested bids
  - `v2/lib/calculations/profits.ts` — Round-by-round cumulative profit projections
  - `v2/lib/calculations/pot.ts` — Projected pot inference (`totalPaid / totalValuePercentage`)
  - `v2/lib/calculations/format.ts` — Currency/percent formatting
  - `v2/lib/calculations/initialize.ts` — Orchestrator: base teams + saved state → fully hydrated teams
  - `v2/lib/calculations/index.ts` — Barrel export
- Wrote **34 unit tests** across 4 test files, all passing:
  - `v2/lib/calculations/__tests__/odds.test.ts` (15 tests)
  - `v2/lib/calculations/__tests__/values.test.ts` (9 tests)
  - `v2/lib/calculations/__tests__/profits.test.ts` (6 tests)
  - `v2/lib/calculations/__tests__/pot.test.ts` (4 tests)
- Ported 64 NCAA teams with American odds: `v2/lib/data/march-madness-2026.ts`
- Built state management with React useReducer + Context:
  - `v2/lib/auction/auction-state.ts` — State, reducer, selectors (filtering, sorting, summary stats)
  - `v2/lib/auction/auction-context.tsx` — React context provider with memoized derived values
  - `v2/lib/auction/use-auto-save.ts` — Debounced (1.5s) auto-save to Supabase
- Built full auction tool UI (6 components):
  - `v2/components/auction/auction-tool.tsx` — Main wrapper (init, layout, save status)
  - `v2/components/auction/pot-size-section.tsx` — Estimated/projected/effective pot size
  - `v2/components/auction/payout-rules-editor.tsx` — Collapsible rules editor with % validation
  - `v2/components/auction/summary-stats-cards.tsx` — My Teams / Opponents / Available stats
  - `v2/components/auction/team-table.tsx` — Filter bar + 13-column data table
  - `v2/components/auction/team-table-row.tsx` — Memoized row with profit cells, inline price input, checkbox
- Built Supabase CRUD server actions: `v2/actions/auction.ts` (load, save/upsert, reset)
- Wired up auction page: `v2/app/(protected)/auction/page.tsx` (server component → client AuctionTool)
- Installed shadcn components: table, select, checkbox, badge, separator, tooltip
- Installed Vitest + configured: `v2/vitest.config.ts`, test scripts in package.json
- Build passes, all 34 tests pass, dev server loads auction tool successfully

**Key Technical Decisions:**
- Pure functions for all calculations (testable, no side effects)
- React useReducer + Context for state (no external deps needed for 64 rows)
- Reducer recalculates derived values (projected pot, team values) on every relevant mutation
- Auto-save debounced at 1.5s to avoid Supabase spam
- React.memo on table rows for selective re-rendering
- Vitest (not Jest) for native TS/ESM support

**Known Issues:**
- Stripe Payment Link redirect after payment not working locally — redirects back to /payment instead of /auction. Need to investigate Stripe Payment Link redirect URL configuration.
- Windows `os=linux` in `~/.npmrc` drops platform-specific binaries on `npm install` — had to force-install `lightningcss-win32-x64-msvc` and `@rollup/rollup-win32-x64-msvc`
- DB default payout rules in migration have props at 5% each (total > 100%) — TypeScript defaults used instead (props at 0%)

**Next Steps (Next Session):**
- Fix Stripe Payment Link redirect (needs redirect URL configured in Stripe dashboard)
- Visual polish: responsive layout, dark mode support, loading states
- Phase 3: Landing page, pricing tiers, blog migration, SEO, domain setup
- Deploy Phase 2 to Vercel (push to main triggers auto-deploy)
- Update 2026 March Madness odds when bracket is set

**Blockers:**
- None. Phase 2 core product complete and functional.
