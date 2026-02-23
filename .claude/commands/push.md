---
name: push
description: Commit all changes and push to git
---

# Push Changes

## Pre-computed Context
Current status:
!git status --short

Current branch:
!git branch --show-current

Recent commits (for message style):
!git log --oneline -3

## Instructions
1. Review the changes above
2. Stage relevant files (prefer specific files over `git add -A`)
3. Write a descriptive commit message following the style of recent commits
4. Push to origin with `-u` flag if needed

## Safety Checks
- NEVER commit `.env` files
- NEVER force push to main
- Verify no secrets are in staged files
