---
name: start-session
description: Load project context and understand where we left off
---

# Start Session

## Pre-computed Context
Current git status:
!git status --short

Recent commits:
!git log --oneline -5

Current branch:
!git branch --show-current

## Instructions
1. Read `CLAUDE.md` for project conventions, architecture, and anti-patterns
2. Read the "Session Notes" section at the bottom of `CLAUDE.md` for current state
3. Check `TODO.md` and `FUTURE_IMPROVEMENTS.md` for pending work
4. Summarize: current state, what was last worked on, suggested next task

## Check for Feedback
If the user mentions feedback or bugs:
- Update `CLAUDE.md` anti-patterns if a recurring mistake was caught
- Fix any issues identified before starting new work

## Project Quick Reference
- **Dev server**: `npm run dev` (port 5000)
- **Production**: Vercel at calcuttaedge.com (legacy still on Render)
- **Stack**: Express + MongoDB + Stripe + JWT auth
- **Critical**: Webhook route must be before `express.json()` in server.js
