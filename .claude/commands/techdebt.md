---
description: Find and report technical debt, duplicated code, and cleanup opportunities
---

# Technical Debt Audit

Use subagents to thoroughly scan the codebase for technical debt. Run this periodically or before major features.

## What to Find

### 1. Duplicated Code
Search for:
- The Stripe webhook handler is duplicated (server.js lines ~48 and ~272) - this is a known issue
- Similar route patterns that could be extracted
- Repeated error handling that could be middleware

### 2. Security Issues
- Any hardcoded secrets or fallback values
- Missing input validation on routes
- Cookie settings that differ between routes
- CORS configuration gaps

### 3. Anti-Pattern Violations
Check against CLAUDE.md anti-patterns:
- Route registration order issues
- Cookie domain handling inconsistencies
- Missing route variants (both `/path` and `/path.html`)
- Hardcoded URLs or values

### 4. Cleanup Opportunities
- Unused imports or variables
- Dead code / commented out code
- TODOs that should be addressed
- Excessive console.log statements (OK for dev, consider removing for prod)

### 5. Known Issues
- Duplicate webhook handler in server.js
- `sendTokenResponse` in auth.js sets `httpOnly: false` - potential security concern
- Blog route references `../blog.html` instead of views directory

## Output Format

Create a markdown report with:

```markdown
# Tech Debt Report - [Date]

## Critical (Fix Now)
- [ ] Issue description - `file:line`

## High Priority (Fix Soon)
- [ ] Issue description - `file:line`

## Medium Priority (Fix When Convenient)
- [ ] Issue description - `file:line`

## Low Priority (Nice to Have)
- [ ] Issue description - `file:line`

## Patterns to Add to Anti-Patterns
- Pattern description (seen in X places)
```

## Instructions

Use multiple subagents in parallel to scan different parts of the codebase:
1. One for server.js + middleware/
2. One for routes/
3. One for models/ + views/
4. One for js/ (frontend)

Report findings but DO NOT fix anything automatically - just report for human review.
