---
name: verify
description: Run all checks before committing
---

# Verify Changes

## Pre-computed Context
Changed files:
!git diff --name-only HEAD

## Instructions
1. Check for syntax errors: `node --check server.js`
2. Check all route files for syntax: `for f in routes/*.js; do node --check "$f"; done`
3. Start the dev server: `npm run dev` (verify it starts without crashes)
4. Check server logs for any errors
5. Report: all checks passed or list what failed

## Verification Checklist
- [ ] Server starts without errors
- [ ] No syntax errors in modified files
- [ ] Route registration order is correct (webhook before express.json)
- [ ] No `.env` values hardcoded in source
- [ ] All new routes registered in server.js with both `/path` and `/path.html` variants
- [ ] Changed features work as expected
