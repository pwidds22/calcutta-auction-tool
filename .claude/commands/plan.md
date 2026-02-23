---
name: plan
argument-hint: [feature or task to plan]
description: Plan a feature before implementing (use Plan mode)
---

# Plan Feature: $ARGUMENTS

## Pre-computed Context
Project structure:
!ls -la

Routes:
!ls routes/

Models:
!ls models/

Views:
!ls views/

Frontend JS:
!ls js/

## Instructions
1. Switch to Plan mode (shift+tab twice) if not already
2. Read relevant existing code to understand patterns
3. Create a step-by-step implementation plan:
   - What files need to be created/modified
   - What model changes are needed (if any)
   - What routes need to be added/updated
   - What frontend changes are needed
   - What the user flow should look like
4. Get user approval before implementing
5. Once approved, implement the plan

## Key Patterns to Follow
- Routes go in `routes/` and are registered in `server.js`
- Models use Mongoose in `models/`
- HTML views go in `views/` with both `/page` and `/page.html` route variants
- Protected routes use `protect` middleware from `middleware/auth.js`
- Stripe webhook handling stays in `server.js` before `express.json()`
