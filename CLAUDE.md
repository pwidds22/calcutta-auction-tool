# Calcutta Genius - Claude Code Context

## Project Overview
Calcutta Genius (calcuttagenius.com) is a Calcutta auction platform — combining strategy analytics with live auction hosting. Users get fair value calculations, bid recommendations, round-by-round profit projections, and (soon) real-time auction hosting.

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
- CORS: localhost + calcuttagenius.com + www subdomain
- Cookie-based JWT auth with domain-aware settings (.calcuttagenius.com in prod)

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
_No active session_
