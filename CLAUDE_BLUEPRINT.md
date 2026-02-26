# CalcuttaEdge.com: the complete platform blueprint

CalcuttaEdge occupies a genuine whitespace in a **$10 billion** US office-pool market that remains overwhelmingly offline. No existing platform combines live real-time auctions, multi-sport support, entertainment events, and integrated analytics — the four pillars needed to build a universal Calcutta platform. The competitive landscape consists of a free hobby project (Auction Pro), a paid analytics-only tool for one sport (PoolGenius), a desktop-only golf program (TournaKit), and spreadsheets. Meanwhile, **60–100 million** Americans fill out March Madness brackets annually, **$3.1 billion** was legally wagered on the 2025 tournament alone, and reality TV prediction markets on Kalshi are generating $600K+ in volume on a single Survivor contract. The demand is proven — the infrastructure simply doesn't exist yet.

This report covers all ten research areas: payout structures, event types, data sources, auction formats, commissioner settings, post-auction lifecycle, competitive analysis, social features, legal compliance, and the universal data model with go-to-market strategy.

---

## 1. Payout structures that actually work

### March Madness: three standard configurations

Every March Madness Calcutta distributes a pot across six rounds where **32 teams** win in R64, **16** win in R32, **8** in S16, **4** in E8, **2** in F4, and **1** champion. The critical math: 63 total wins occur across the tournament. The three most common configurations differ in how aggressively they reward deep runs.

**Configuration A — "Balanced" (most common)**
This structure pays meaningfully at every round, keeping all owners engaged. Used in casual friend groups and mid-stakes pools.

| Round | Per-Win % | Teams Winning | Total Round % |
|---|---|---|---|
| R64 Win | 0.5% | 32 | 16% |
| R32 Win | 1.0% | 16 | 16% |
| Sweet 16 Win | 2.0% | 8 | 16% |
| Elite 8 Win | 4.0% | 4 | 16% |
| Final Four Win | 8.0% | 2 | 16% |
| Championship Win | 20.0% | 1 | 20% |
| **Total** | | | **100%** |

Champion's cumulative payout: 0.5 + 1.0 + 2.0 + 4.0 + 8.0 + 20.0 = **35.5%** of the pot. With an 85/15 round/prop split, the champion earns roughly **30.2%** of the total pot.

**Configuration B — "Top Heavy" (high-stakes pools)**
Rewards deep tournament runs dramatically. From PrintYourBrackets, this is the most documented single structure online.

| Round Reached | % of Pot | Teams | Per Team |
|---|---|---|---|
| Win 1 game only (exit R32) | 2% | 16 | 0.125% |
| Win 2 only (exit S16) | 3% | 8 | 0.375% |
| Win 3 only (exit E8) | 10% | 4 | 2.5% |
| Win 4 only (exit F4) | 15% | 2 | 7.5% |
| Win 5 (runner-up) | 25% | 1 | 25% |
| Win 6 (champion) | 45% | 1 | 45% |

This is a "final placement" model rather than cumulative-per-win. The champion earns **45%** outright. It concentrates value, making favorites expensive and creating high-risk, high-reward dynamics.

**Configuration C — "Prop-Weighted" (engagement-focused)**
Allocates **20%** to side pots, keeping owners of eliminated teams invested. Based on the CBS Sports and BTP (Bet The Process) models.

Main pot (80%): Standard escalating per-round percentages. Side pot (20%): Distributed across 6–10 prop bets. This configuration is ideal for larger groups where sustained engagement matters more than top-prize magnitude.

### Prop bets ranked by popularity

The standard pot split between round payouts and props is **85/15** for casual pools and **80/20** for engagement-focused pools. Individual props typically receive **1–3%** of the total pot each.

- **Tier 1 (found in nearly every Calcutta):** Biggest upset by seed differential, largest margin of victory, best Cinderella (lowest seed to advance farthest)
- **Tier 2 (common):** Biggest blowout loss, most combined conference wins, highest-seeded team to lose in R64
- **Tier 3 (creative):** First team eliminated by timestamp, lowest bid that wins a game, perfect Final Four bonus, most overtime games owned by one bidder

### Running payout example: $2,000 pot (Balanced config, 85/15 split)

Round payouts draw from **$1,700** (85%). Props draw from **$300** (15%).

| Round | Per Win | Champion Earns | Champion Cumulative |
|---|---|---|---|
| R64 Win | $8.50 (0.5% of $1,700) | $8.50 | **$8.50** |
| R32 Win | $17.00 | $17.00 | **$25.50** |
| S16 Win | $34.00 | $34.00 | **$59.50** |
| E8 Win | $68.00 | $68.00 | **$127.50** |
| F4 Win | $136.00 | $136.00 | **$263.50** |
| Championship | $340.00 | $340.00 | **$603.50** |

The champion earns **$603.50** from round payouts alone — roughly **30%** of the total pot. A 1-seed purchased at auction for $250 that wins the title yields a profit of $353.50 plus any prop winnings. Meanwhile, each R64-only winner earns just $8.50, keeping low-seed prices appropriately cheap.

### Other sport structures

**Golf Majors (stroke play, 90–156 players):** The traditional payout is 70/20/10 for 1st/2nd/3rd at club-level Calcuttas. Sophisticated pools pay the top 15–20 finishers on a sliding scale (1st: 24%, 2nd: 15%, 3rd: 10%, descending to ~0.5% for 20th place) plus bonus props for hole-in-one, lowest single round, and DFL (dead last among those making the cut). Dead-heat tiebreaker rules split combined positional payouts. The **buyback rule** is nearly universal in golf — a player can repurchase 50% of their own stake from the auction winner, splitting any payout.

**NFL Playoffs (14 teams, 4 rounds):** The BTP model documented by Unabated allocates 80% to round wins and 20% to props. Per-win payouts: Wild Card **3.5%**, Divisional **6.5%**, Conference Championship **10%**, Super Bowl **13%**. A wild-card team running the table earns its owner 33% of the pot. A #1 seed winning it all earns 29.5%.

**Horse Racing (single race, ~20 horses):** The original Calcutta format, formalized in Australian racing clubs, pays **60% to win, 20% to place, 10% to show, and 10% to the house/charity**. American versions typically use 50/30/20 or 60/25/15. Many add a "last place" payout to incentivize bidding on longshots.

**Reality TV (weekly elimination):** No established structure exists — this is greenfield for CalcuttaEdge. A recommended approach for an 18-contestant show like Survivor: 0% for early eliminations (pre-merge), 1% each for making the merge through 5th place, 5% for 3rd, 10% for runner-up, 35% for the winner, and 15% across props (first blindside, most immunity wins, fan favorite).

---

## 2. Events where the Calcutta format thrives

### Sports: the proven market

**March Madness** is the undisputed king of Calcuttas — **64 teams**, single elimination, perfect field size, maximum drama, and the largest office-pool market in American sports. The 68-team field (with play-in games) provides natural price differentiation via seeding. Calcutta pots range from $500 in friend groups to **$670,000+** at a documented Chicago auction. This is the launch event.

**Golf Majors** are the second pillar and the sport with the deepest Calcutta tradition outside horse racing. The Masters field of ~90 players requires bundling lower-ranked golfers into groups of 5–8, but the buyback mechanic (unique to golf), 4-day duration, and country-club demographic make this a premium market. Wall Street and finance professionals have run high-stakes Masters Calcuttas for decades.

**NFL Playoffs** offer a compact, high-intensity Calcutta — only 14 teams means a fast auction with high per-team stakes. Every game is appointment television. The small field works best for groups of 8–14 participants.

**The 2026 FIFA World Cup** presents a once-in-a-generation opportunity. Hosted in the US/Canada/Mexico with an expanded **48-team field**, it maps almost perfectly to the March Madness Calcutta format — similar field size, group stage plus knockout rounds, month-long duration. US engagement will be unprecedented.

**College Football Playoff** expanded to 12 teams in 2024, creating a new Calcutta-friendly format. **Horse racing** (Kentucky Derby's ~20 horses) is the historical birthplace of the Calcutta. **Tennis Grand Slams** (128-player draws), **NHL/NBA Playoffs** (16 teams), **NASCAR** (~40 drivers), and **Formula 1** (20 drivers) all have viable formats but smaller existing Calcutta cultures.

| Event | Field Size | Structure | Calcutta Market Maturity | Priority |
|---|---|---|---|---|
| March Madness | 64 teams | Single elim bracket | ★★★★★ Established | Launch |
| Golf Majors | 90–156 | Stroke play + cut | ★★★★★ Deep tradition | Phase 2 |
| NFL Playoffs | 14 teams | Single elim, 4 rounds | ★★★★ Growing | Phase 2 |
| FIFA World Cup 2026 | 48 teams | Groups + knockout | ★★★ Emerging | Phase 2 |
| College Football Playoff | 12 teams | Single elim | ★★ Nascent | Phase 2 |
| Kentucky Derby | ~20 horses | Single race | ★★★★★ Original format | Phase 2 |
| NHL/NBA Playoffs | 16 teams | Best-of-7 series | ★★ Niche | Phase 3 |
| Tennis Grand Slams | 128 players | Single elim | ★ Unexplored | Phase 3 |

### Entertainment and reality TV: the untapped market

This is CalcuttaEdge's unique differentiator. **No existing platform offers Calcutta-style auctions for reality TV.** Bracketology.tv covers 30+ shows with fantasy drafts and prediction pools, and Kalshi launched CFTC-regulated reality TV prediction markets in 2025, proving demand — but neither uses the Calcutta auction mechanic.

**Survivor** is the single best entertainment fit. Recent seasons field **18 contestants** (Survivor 50 has 24 returning all-stars), with weekly tribal council eliminations over 13 episodes. The r/survivor subreddit has approximately **800K–1M subscribers**. Kalshi's Survivor 49 winner contract generated **$600K+** in trading volume. BetOnline, Bovada, and MyBookie all post Survivor odds. Rob Has a Podcast runs massive fantasy leagues. This is a proven, engaged, prediction-hungry audience.

**Big Brother** (16 houseguests, 3 episodes/week over ~82 summer days) offers the longest sustained engagement of any reality show. Its r/bigbrother community reaches **500K–700K subscribers**, and 24/7 live feeds create an "insider knowledge" dynamic perfect for auction bidding. **RuPaul's Drag Race** (14–16 contestants) has the most active TV subreddit on all of Reddit by comment volume, with r/rupaulsdragrace estimated at **700K–900K subscribers**.

**The Amazing Race** (11–12 teams of two) has the most naturally Calcutta-friendly format — teams as auction units give you exactly 12 lots, the sweet spot for a quick, engaging auction. **The Traitors** (20–23 celebrity contestants) is Peacock's biggest unscripted show and growing rapidly. **Top Chef** (15–16 contestants) and **Dancing with the Stars** (12–15 pairs) both fit the format perfectly.

**The Bachelor/Bachelorette** starts with 25–30 contestants — slightly large but workable if the auction runs after Night 1 eliminations trim the field to ~20. The main risk: spoiler sites like Reality Steve can undermine uncertainty. **The Challenge** (MTV) varies too widely in cast size (20–34) but works in individual-format seasons.

### Esports: massive communities, perfect tournament structures

Esports represents an enormous, digitally native audience underserved by Calcutta products. **League of Legends Worlds** (20 teams, ~5-week tournament) has an r/leagueoflegends community of **8.1 million subscribers** — far larger than any sports subreddit. **Dota 2's The International** (16 teams, historically $15M–$40M crowdfunded prize pools) and **CS2 Majors** (16–24 teams, 2 events per year) have communities of **1.5–2M** and **2–3M** Reddit subscribers respectively. All three feature established esports betting markets.

### Other viable events

**Oscar Awards** offer a natural novelty Calcutta for Best Picture (8–10 nominees with genuine uncertainty). Gold Derby tracks Oscar prediction accuracy at scale. **The National Spelling Bee** has 243+ contestants (too many), but the televised finals (~10–12 spellers) could work as a novelty event. **Westminster Dog Show's** Best in Show finals (7 group winners) is a fun niche option.

---

## 3. Where the odds and scoring data comes from

### Sports data stack: $68–$138/month covers production needs

**The Odds API** ($49–$99/month) is the primary recommendation for odds data. It aggregates betting lines from **80+ bookmakers** including FanDuel, DraftKings, BetMGM, and Caesars into normalized JSON. Crucially, it provides **outright/futures markets** — the exact data needed to convert sportsbook odds into implied probabilities for Calcutta starting values. Coverage includes NFL, NBA, MLB, NHL, NCAAB, golf, tennis, soccer, and more. The $49/month Champion tier provides 90,000 API calls — sufficient for a platform in its first years.

**API-Sports** ($19–$39/month) fills the stats and live-scoring layer. It covers 950+ soccer leagues, all major US leagues, F1, and more with 15-second livescore updates and 15+ years of historical data. Its free tier allows 7,500 requests/day.

**ESPN's hidden API** (free, unofficial) provides schedules, rosters, and basic scores via reverse-engineered endpoints like `site.api.espn.com/apis/site/v2/sports/`. No authentication required, but no SLA and endpoints may break without notice. Useful as a supplemental source, not for production reliance.

**Sportradar** and **SportsDataIO** are enterprise-grade options at **$500–$1,000+/month per league** — overkill for launch but worth considering at scale. SportsDataIO's BAKER Predictive Engine could generate custom probability queries across event types.

### Reality TV and entertainment odds: Kalshi is the breakthrough

**Kalshi** is the critical data source for entertainment Calcuttas. As a CFTC-regulated prediction market, it offers real-time implied probabilities for Survivor, Big Brother, DWTS, Amazing Race, The Bachelor, and award shows. Prices in cents map directly to implied probabilities (a 76¢ "yes" contract = 76% implied probability). Its API is **free and public** — no API key required for market data. Base URL: `api.elections.kalshi.com/trade-api/v2`. A Python SDK (`kalshi_python`) exists.

**Offshore sportsbooks** — BetOnline, Bovada, MyBookie — post the most extensive entertainment betting lines. BetOnline offers Survivor winner odds, weekly elimination props, and novelty markets across dozens of shows. These odds are accessible via The Odds API's aggregation layer (BetOnline is included as a bookmaker source).

### When no odds exist at all

For niche events with no sportsbook or prediction market coverage, CalcuttaEdge needs four fallback approaches:

- **Equal-weight starting values**: Each competitor = 1/N implied probability. Simple and defensible.
- **Historical base rates**: For seeded events, use advancement probability by seed. PoolGenius already provides this for March Madness: `Team Value = Σ(P(advance to round R) × Payout%(round R))`.
- **Commissioner seeding**: The commissioner ranks competitors and assigns tiered starting values (favorites at 2× equal share, mid-tier at 1×, longshots at 0.5×).
- **Community poll**: Let pool members vote-rank competitors pre-auction, then convert aggregate rankings to implied probabilities using a logistic curve.

---

## 4. Auction formats from traditional to experimental

**Traditional Calcutta (open outcry)** is the most popular format and universally described as the most fun. Teams are auctioned sequentially (random or seed order), with open bidding in set increments ($5, $10, or free-form). "Going once, going twice, sold!" No spending cap — participants can bid as much as they want and own zero or twenty teams. All bid money becomes the prize pool. A 64-team auction takes roughly **2 hours** at ~2 minutes per team. This is the format CalcuttaEdge must nail first.

**Nomination/rotation draft** adds a strategic layer: each participant takes turns nominating which team goes up for auction, then all participants bid. The nominator can strategically nominate teams they don't want to drain opponents' budgets. This format is borrowed from fantasy sports auction drafts and works well for groups comfortable with deeper strategy.

**Salary cap auction** gives each participant an equal budget (typically $200 in fantasy sports, $100–$500 for Calcuttas). This creates a more level playing field but sacrifices the "wild west" feel of unlimited Calcuttas. The pot size is known in advance. Unspent money typically goes into the pot.

**Sealed/blind bid** has all participants submit simultaneous bids on every team. Highest bid wins. Can be first-price (pay what you bid) or Vickrey (pay the second-highest bid). This enables asynchronous, remote pools but sacrifices the social experience.

**Snake draft** isn't a true Calcutta (no bidding, no pricing mechanism) but should be supported for casual groups. Participants draft in serpentine order based on a randomized position draw.

**Hybrid formats** include golf's buyback rule (player buys back 50% of their own stake), consortium bidding (groups pool money and bid as one entity), and tiered auctions where favorites are auctioned individually while longshots are bundled.

---

## 5. Every setting a commissioner needs

Commissioner configuration is the backbone of a flexible Calcutta platform. The exhaustive list:

**Auction mechanics:** Format type (live/slow/silent), bidding order (random/seed/region/custom), nomination style (commissioner/rotating/random), timer per item, going-once countdown (3-2-1 or timer-based), minimum bid, bid increments, maximum bid cap (optional), budget limit per participant (optional for salary-cap mode), overbid penalties, proxy bid support for absent participants.

**Payout configuration:** Pre-built templates (Balanced/Top Heavy/Prop-Weighted) with full customization of per-round percentages, prop bet definitions and allocations, dead-heat/tiebreaker rules, consolation payouts for last-place finishers, house rake percentage (for charity/club events).

**Roster and bundling:** Maximum and minimum teams per participant, team bundling (e.g., group 13–16 seeds into four-team lots), region balance requirements, reserve prices (minimum bid floor).

**Entry and participation:** Fixed entry fee separate from auction spend, buy-in requirements, late-entry fee, maximum participant count, waitlist, invite-only vs. open enrollment, password protection.

**Post-auction rules:** Trading allowed/disallowed, trade deadline, trade approval (commissioner/vote/auto), partial ownership toggle, secondary market for ownership shares.

**Commissioner powers:** Manual score override, edit auction results (fix errors), add/remove participants, pause/resume auction, undo last auction item, force-mark payments, edit payout allocations before finalization, lock/unlock rosters, appoint co-commissioners, kick participants.

**Privacy and access:** Public (anyone can view), private (invite-only), semi-private (leaderboard visible but bids hidden), shareable join link.

---

## 6. What happens after the gavel falls

### The immediate post-auction experience

Within seconds of the last team selling, every participant should see a **confirmation dashboard** showing their complete portfolio: teams owned, purchase prices, total invested, and their share of the total pot. The rules lock at this moment with a timestamped audit trail — preventing the post-hoc disputes that plague informal Calcuttas.

Payment reminders go out automatically since CalcuttaEdge doesn't handle funds. The commissioner configures their Venmo/Zelle handles during pool setup. The platform sends **escalating reminders** — gentle on Day 1, nudging on Day 3, urgent on Day 7 — with one-tap deep links to payment apps and pre-filled amounts. A payment status tracker lets the commissioner mark who has paid, and an optional "lockout" feature hides the live leaderboard for unpaid participants.

### During the tournament: the live experience

The **live leaderboard** is the post-auction centerpiece. It tracks each participant's portfolio in real time: active competitors (green), eliminated (red/strikethrough), upcoming matchups (yellow). Running payout calculations update after every game, showing "Earnings so far" from completed rounds plus "Projected final payout" based on remaining advancement odds. The key metric: **Net P&L** (Current Earnings + Projected Earnings – Amount Spent at Auction).

**Auto-scoring via API** handles supported events (March Madness, NFL, golf) by pulling results from The Odds API or API-Sports. For unsupported events like reality TV, the commissioner enters results manually through a simple interface ("Survivor Episode 7 — Eliminated: [Player Name]"). A hybrid approach is recommended: auto-score when API data is available, with commissioner override for disputes.

### Final settlement: minimizing transactions

At tournament conclusion, the platform auto-generates a **net settlement matrix**. Each participant's total auction spend is subtracted from their total winnings to produce a net position. Then a **debt simplification algorithm** (similar to Splitwise's greedy approach) minimizes the number of actual transactions. For 8 participants where 3 are net winners and 5 are net losers, instead of 15+ possible pairwise payments, the algorithm produces **5–7 transactions**. Each line item includes the amount, the counterparty, and a tap-to-pay link to Venmo or Zelle. The settlement card exports to PDF or shareable image.

### Entertainment-specific: the season-long tracker

Reality TV Calcuttas require episode-by-episode lifecycle management. After each weekly episode, the commissioner (or auto-scoring when available) marks eliminations. The leaderboard updates showing "still alive" vs. "eliminated" contestants, running payout calculations, and prop-bet progress. For a 13-episode Survivor season, this means **13 weeks of sustained engagement** — far longer than the ~3 weeks of March Madness.

---

## 7. The competitive landscape has a gaping hole

### Dedicated Calcutta platforms are shockingly primitive

**Auction Pro** (auctionpro.co) is a free, solo-developer project that supports live online bidding — the closest thing to a real Calcutta auction platform. It covers March Madness and Masters but has no analytics, no mobile app, no automated scoring, and notably received a **cease-and-desist from the Washington State Gambling Commission** in 2025 for facilitating billiards Calcuttas. The developer's own disclaimer: "comes with no warranty."

**PoolGenius/TeamRankings** ($25–50/season) provides the best Calcutta analytics — simulation-driven team valuations, customizable scoring rules — but is an **analytics companion only, not an auction platform**. It covers NCAA March Madness exclusively. Users still need a separate tool to actually run the auction.

**Calcutta Time** (calcuttatime.com) is a newer Chicago-based platform supporting March Madness, Golf, and F1, with "silent and custom auctions coming soon." Clean branding but minimal public documentation and no reviews.

**TournaKit Pro** ($299 one-time) is comprehensive desktop software for charity golf tournament Calcuttas — full financial reporting, 386 report templates, handicap calculators. But it's desktop-only, golf-only, and represents antiquated technology.

**Calcutta League** (calcuttaleague.com) appears to run online auctions but has extremely low visibility and requires login to see any features.

The defining finding: **the most common "platform" for Calcutta auctions is still a Google Sheet.**

### Adjacent platforms validate demand without addressing it

**Splash Sports/RunYourPool** (2.2M+ users, eight-figure acquisition) handles bracket pools, pick'em, confidence pools, and squares — but offers zero auction functionality. Its commissioner-pays model and payment infrastructure provide a relevant business-model template.

**Sleeper** (5M+ monthly active users) is the gold standard for social fantasy sports, with auction draft support, in-app chat, and excellent mobile UX. But Sleeper's auction is a fantasy draft mechanic (fixed budgets, building season-long rosters), not a Calcutta (variable pot, tournament-outcome-based payouts). No entertainment coverage.

**Bracketology.tv** is the market leader for reality TV fantasy gaming — 30+ shows, mobile apps that hit top-25 entertainment charts — but uses draft and prediction formats, not auctions.

### The gap is definitive

| Capability | Auction Pro | PoolGenius | Calcutta Time | Sleeper | Bracketology | **CalcuttaEdge** |
|---|---|---|---|---|---|---|
| Live real-time auction | ✅ | ❌ | ✅ | Fantasy only | ❌ | **✅** |
| Multi-sport | Partial | ❌ | ✅ | ✅ | ❌ | **✅** |
| Entertainment events | ❌ | ❌ | ❌ | ❌ | ✅ | **✅** |
| Analytics/valuations | ❌ | ✅ | ❌ | Partial | ❌ | **✅** |
| Mobile app | ❌ | ❌ | ❌ | ✅ | ✅ | **✅** |
| Payment tracking | ❌ | ❌ | ❌ | ✅ | ❌ | **✅** |

No platform occupies the center of this matrix. CalcuttaEdge would be the first.

---

## 8. Social features that drive retention

### Sleeper proved interface quality beats feature quantity

Sleeper's dominance in fantasy sports is driven less by its social features per se and more by **interface quality**. As one analyst noted: "Whenever I hear someone recommending Sleeper, it's not for the social element — they're most impressed by the interface." The lesson for CalcuttaEdge: build a beautiful, fast, intuitive experience first, then layer in social features.

That said, the social features that matter most for Calcuttas are:

**In-pool chat and smack talk** replaces the need for external GroupMe or Discord groups. Sleeper's in-app chat supports text, GIFs, images, voice, and polls — and is cited as the #1 reason leagues consolidate onto the platform. For CalcuttaEdge, a lightweight chat thread per pool is the MVP requirement; rich media support can come later.

**Push notifications** with the right triggers are critical. High-engagement moments: "Your team just won! You earned $34." / "Duke lost — Mike's portfolio drops $200." / "You moved from 5th to 3rd on the leaderboard." / "Sweet 16 starts tomorrow, here's where you stand." Industry data shows **personalized push alerts increase 30-day retention by 40%**.

**Shareable content cards** — auto-generated leaderboard images, auction recap graphics, elimination alerts styled as meme-ready cards — drive organic acquisition. "RIP to Mark's bracket" as an Instagram-shareable card costs nothing to build and markets itself.

**Recurring leagues/groups** allow the same friend group to persist across events (March Madness 2027 → NFL Playoffs 2027 → Survivor 51). Historical standings, head-to-head records with friends, and commissioner reputation scores (rated 1–5 after each pool) create platform stickiness.

**Gamification badges** reinforce engagement: "Cinderella Hunter" (bought a 12+ seed that won 2+ games), "Value King" (best ROI), "Big Spender" (highest total auction spend), "Diversified" (owned teams from 4+ regions).

### Mobile is non-negotiable

**65–77% of all fantasy sports activity** occurs on mobile devices. In North America specifically, mobile accounted for **76.7%** of fantasy user activity in 2024. CalcuttaEdge should launch as a **Progressive Web App (PWA)** — single codebase, no app-store friction, instant updates, 30–40% lower development cost than native. Since Calcutta pools are invite-based (not discovery-dependent), app-store presence is less critical at launch. Push notifications are now supported on iOS 16.4+ via PWA. Migrate to React Native for cross-platform native when the user base justifies it.

---

## 9. Legal reality: a tool, not an operator

### The four-state safe harbor and the social gambling patchwork

Only **four states** explicitly authorize Calcutta pool wagering by statute: **Alaska** (since 1960), **Wyoming** (1982), **Montana** (1987), and **North Dakota** (1989). Montana has the most detailed framework, requiring a Form 26 permit with a $25 fee, at least 50% payout, and proceeds after prizes going to charitable causes.

Approximately **29 states** have social gambling exceptions that cover Calcuttas when the organizer takes no cut and participants compete on equal terms. Key requirements vary: Colorado demands a "bona fide social relationship," Florida caps individual wagers at $10, North Dakota limits bets to $25. States like California, Connecticut, New Jersey, New York, Ohio, Oregon, Texas, and Virginia fall into this social-gambling-exception category.

**Washington State is the most hostile jurisdiction** — Calcutta wagering is explicitly illegal under RCW 9.46.0269, and transmitting gambling information online is a **Class C felony**. The state's Gambling Commission issued a cease-and-desist to Auction Pro in 2025. **Utah** constitutionally bans all gambling with no exceptions. **Wisconsin's** attorney general has opined Calcuttas are illegal. Idaho, Tennessee, and Arizona are also hostile.

### The "tool not operator" defense is CalcuttaEdge's strongest shield

Since CalcuttaEdge does **not process payments, take a rake, set odds, or distribute winnings**, it has a fundamentally different legal posture than a gambling operator. The platform's strongest arguments:

- Analogous to a spreadsheet or whiteboard that tracks an auction
- No financial intermediation triggering UIGEA (which targets payment processors "knowingly accepting payments in connection with unlawful internet gambling")
- No "business of betting or wagering" triggering the Wire Act
- Commissioner model: individuals create and manage private pools; the platform is merely infrastructure

**However, this defense is not bulletproof.** Lexology's 2025 analysis warns that "even entities not directly operating games — such as platforms, vendors, or affiliates — may be subject to registration, licensing, or other requirements." Washington State prosecuted Auction Pro despite it being a free tool. "Aiding and abetting" statutes can be broad.

### How competitors handle it

**RunYourPool** (the closest operational model) uses this verbatim disclaimer: "All services provided by RunYourPool.com are for **ENTERTAINMENT/MARKETING PURPOSES ONLY** and may not be used in connection with any form of gambling or wagering." They do not geo-block, instead placing the legal burden entirely on users. Their paid contests exclude Washington and Nevada and require participants to be 21+.

**Yahoo Fantasy** uses an identical "entertainment purposes only" disclaimer and excludes 12 states from paid contests. **Sleeper** employs state-by-state geolocation enforcement and is registered with the CFTC as a futures commission merchant for its prediction features. All three platforms use binding arbitration with class-action waivers.

### Entertainment prediction is not legally safer than sports betting

Despite intuition, entertainment prediction carries **no meaningful legal advantage** over sports prediction under most state gambling statutes, which don't distinguish between wagering on sports vs. entertainment outcomes. The Wire Act's narrow reading applies only to "sporting events," which could theoretically exclude entertainment — but state laws are what matter for operational compliance. Kalshi's experience is cautionary: despite CFTC regulation, the platform faces **19 federal lawsuits**, cease-and-desist letters from 7+ states, and briefs from 34 state attorneys general asserting state regulatory authority.

### Required compliance measures

CalcuttaEdge needs: (1) an "entertainment purposes only" primary disclaimer explicitly stating the platform does not facilitate, process, or handle financial transactions; (2) a user-responsibility clause making participants solely responsible for legal compliance; (3) geo-blocking or strong warnings for Washington, Utah, Idaho, and other hostile states; (4) self-reported age verification (21+ for any pool involving money); (5) binding arbitration with class-action waiver; (6) responsible gambling resource links (1-800-522-4700). Incorporation in a favorable jurisdiction like Montana (explicit Calcutta framework) or Colorado (clear social gambling exception) is worth considering.

---

## 10. Building the universal platform

### A configuration-driven data model handles every event type

The core insight: all Calcutta auctions share the same flow — **Competitors** are **Auctioned** to **Owners**, who earn **Payouts** when **ScoringEvents** occur. What differs is the competition's structure. PostgreSQL with **JSONB columns** for sport-specific configuration provides relational integrity for financial data (bids, settlements) with NoSQL flexibility for event templates.

The essential entities: **Event** (top-level container with a template reference), **EventTemplate** (defines competition structure — single elimination, stroke play, weekly elimination, series playoff, single race, or custom), **Pool** (a specific auction instance with commissioner, payout rules, and settings), **Competitor** (team, player, horse, or contestant with optional bundle grouping), **Stage** (round or episode with its payout percentage), **Bid** (with amount, timestamp, and status), **Ownership** (linking user to competitor with purchase price and acquisition method), **ScoringEvent** (win, elimination, placement, or prop outcome), **PayoutRule** (trigger condition and payout value in JSONB), and **Settlement** (net position and transaction instructions).

The key architectural decision: **PayoutRule uses a configurable trigger-condition engine** stored as JSONB. For March Madness, a trigger might be `{"stage": 3, "result": "win"}` paying 2% of the pot. For Survivor, it might be `{"survival_week": 10, "result": "still_alive"}` paying 1%. For golf, `{"final_position": 1}` paying 24%. One codebase interprets all event types.

### Tech stack: Next.js, Node.js, PostgreSQL, Redis, Socket.io

**Frontend:** Next.js (React) for SSR, SEO, and mobile-responsive design. Tailwind CSS for rapid UI development. Socket.io client for real-time auction UI.

**Backend:** Node.js with Fastify for WebSocket-heavy workloads — natural fit for real-time auction bidding. Socket.io handles WebSocket connections with automatic fallback to long-polling.

**Database:** PostgreSQL (not MongoDB) — ACID compliance is non-negotiable for financial data. Row-level locking prevents bid race conditions. JSONB columns provide the schema flexibility needed for multi-event support. Redis handles caching of active auction state, session management, and pub/sub for real-time bid broadcasting.

**Infrastructure:** Vercel for frontend, Railway or Render for backend/WebSocket, Supabase or AWS RDS for managed PostgreSQL, Redis Cloud for managed Redis.

**Data feeds:** The Odds API ($49–$99/mo) for sports odds, Kalshi API (free) for entertainment, API-Sports ($19–$39/mo) for live scores. Total: **$68–$138/month**.

### Market sizing: a $10B offline market waiting to be digitized

The total addressable market for US office pools and social wagering is approximately **$10 billion** (Splash Sports estimate). The fantasy sports market alone is **$10.3 billion** in the US and growing at 13% CAGR. March Madness draws **60–100 million** bracket entries and **$3.1 billion** in legal wagers annually. Reality TV prediction markets are emerging with **$600K+** volume on individual Kalshi contracts.

The serviceable addressable market for Calcutta-style auctions specifically is estimated at **$500M–$1B** across sports and entertainment. The realistic year-one serviceable obtainable market: **$100K–$350K** in revenue from 2,000–5,000 commissioner accounts.

### Monetization: freemium with commissioner-pays

| Tier | Price | What It Includes |
|---|---|---|
| Free | $0 | 1 pool, up to 10 members, basic auction, manual scoring |
| Pro | $9.99/event or $29.99/season | Unlimited members, live scoring, custom payouts, multiple pools |
| Premium | $49.99/season or $99/year | All sports + entertainment, analytics, payment tracking, priority support |
| Enterprise | Custom | Country clubs, organizations, API access, white-label |

Transaction revenue (Phase 2+): **5–8% of prize pool** when the platform handles optional payment processing. Commissioner gets a 1–2% kickback as incentive. This mirrors Splash Sports' validated model.

### Roadmap from MVP to full platform

**Phase 1 — March Madness 2027 (Build Oct 2026, Launch Feb 2027):** User auth, pool creation, real-time auction room via WebSocket, March Madness 64-team template with customizable payouts, team bundling, live NCAA scoring integration, leaderboard, settlement calculator, mobile-responsive PWA. Minimum team: **4–5 people**. Cost: **$40K–$80K** lean, $100K–$150K with outsourced help. Success metric: 500+ pools, 5,000+ users.

**Phase 2 — Multi-sport expansion (Summer/Fall 2027):** Golf Majors, NFL Playoffs, College Football Playoff, Kentucky Derby templates. Optional Stripe payment processing. Proxy/silent auction modes. Push notifications. Native mobile app via React Native. Target: 15,000+ pools, 75,000+ users, $500K ARR.

**Phase 3 — Entertainment and reality TV (Q1 2028):** Survivor, Bachelor/ette, DWTS, The Traitors, awards shows. Custom event creator with community-shareable templates. Secondary market for ownership stakes. In-pool social features. Target: 50,000+ pools, 250K+ users, $2M ARR.

**Phase 4 — Full platform with network effects (2028–2029):** Fractional ownership, AI-powered valuations, commissioner marketplace, white-label API, international expansion (Champions League, IPL, rugby), integration marketplace. Target: 1M+ users, $10M+ ARR.

---

## Conclusion: why this works and what matters most

CalcuttaEdge sits at the intersection of three validated markets — fantasy sports ($10B+), office pools ($10B+), and entertainment prediction (emerging) — in a niche that has essentially zero modern technology serving it. The existing competitors are either single-sport, analytics-only, desktop-only, or free hobby projects. The most common Calcutta "platform" is still a spreadsheet.

Three factors make the timing right. First, the **2026 FIFA World Cup** in North America creates a once-in-a-generation engagement event with a 48-team field tailor-made for Calcutta format. Second, **Kalshi's launch of reality TV prediction markets** in 2025 proved that entertainment prediction demand exists at scale — and CalcuttaEdge can capture that demand in a fundamentally more social, more fun format (live auctions with friends vs. anonymous prediction contracts). Third, the **legal environment favors tools over operators**: by not processing payments, CalcuttaEdge sidesteps the regulatory burden that makes sports betting platforms spend millions on compliance.

The execution priorities are clear. Nail the real-time auction experience for March Madness 2027 — that's the entire MVP. If the live bidding feels fast, fair, and fun, everything else (analytics, settlement, social features, entertainment events) builds on that foundation. The settlement matrix alone — computing minimized "who owes whom" transactions and linking to Venmo — is a feature no competitor offers that solves the #1 commissioner headache. And the entertainment expansion into Survivor, Drag Race, and esports tournaments is the moat that no sports-only platform will replicate.