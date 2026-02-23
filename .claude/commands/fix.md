---
argument-hint: [bug description, error message, or paste from logs]
description: Autonomous bug fixing - just describe the bug and let Claude fix it
---

# Autonomous Bug Fix Mode

You've been given a bug to fix. Work autonomously to:

1. **Understand the bug** - Parse the error message, stack trace, or description
2. **Locate the source** - Use search/grep to find relevant code
3. **Identify root cause** - Read the code and understand what's wrong
4. **Implement the fix** - Make minimal, targeted changes
5. **Verify the fix** - Start dev server and test if possible

## Rules

- **Don't ask questions** - Figure it out from context
- **Don't over-engineer** - Fix the bug, nothing more
- **Don't refactor** - Only change what's necessary for the fix
- **Do explain** - After fixing, briefly explain what was wrong and why

## Context

This is an Express + MongoDB app:
- Auth middleware: `middleware/auth.js` (JWT from cookies or Bearer header)
- Mongoose models: `models/User.js`, `models/UserData.js`
- Stripe payments: `routes/payment.js` + webhook in `server.js`
- Frontend JS: `js/` directory (vanilla JS, no build step)
- Check CLAUDE.md for patterns and anti-patterns

## Common Bug Categories

### Auth Issues
- Look in `middleware/auth.js` and `routes/auth.js`
- Check cookie settings (domain, secure, sameSite)
- Verify JWT_SECRET is available in env

### Payment Issues
- Check webhook route order in `server.js` (must be before express.json())
- Verify Stripe signature validation
- Check user lookup logic (email match + fallback to recent unpaid users)

### API Issues
- Check route registration order in `server.js`
- Verify `protect` middleware is applied on private routes
- Check MongoDB connection and model field names

### Frontend Issues
- Check `js/auth.js` for cookie/token handling
- Verify API endpoint URLs match server routes
- Check for missing error handling in fetch calls

## Bug Description
<bug>$ARGUMENTS</bug>

## After Fixing

1. Start the dev server: `npm run dev`
2. Summarize what was fixed and why
3. If this reveals a pattern that could cause other bugs, mention it
