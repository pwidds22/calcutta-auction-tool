---
name: end-session
description: Save progress and create handoff notes
---

# End Session

## Pre-computed Context
Current changes:
!git status --short

Current branch:
!git branch --show-current

## Instructions
1. Update the "Session Notes" section at the bottom of `CLAUDE.md` with:
   - What was completed (with file paths!)
   - What's in progress (with file paths!)
   - Next steps
   - Any blockers or notes for next session
2. Stage all relevant changes: prefer specific files over `git add -A`
3. Commit with descriptive message following existing commit style
4. Push to remote
5. Confirm session is saved
