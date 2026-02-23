---
argument-hint: [feature or task to spec out]
description: Interview user in-depth to create a detailed spec before coding
allowed-tools: AskUserQuestion, Write
---

# Spec Interview Mode

Follow the user instructions and interview me in detail using the AskUserQuestion tool about literally anything: technical implementation, UI & UX, concerns, tradeoffs, etc. but make sure the questions are not obvious. Be very in-depth and continue interviewing me continually until it's complete.

## Interview Topics to Cover
- **Core functionality:** What exactly should this do?
- **UI/UX:** How should it look? What interactions? What pages?
- **Data model:** What new Mongoose fields/models? How does it relate to existing User/UserData?
- **Edge cases:** What happens when X? What about Y?
- **Error handling:** What could go wrong? How should we handle it?
- **Auth/Payment:** Does this need auth? Payment gating? Both?
- **Stripe:** Any new payment flows or webhook events to handle?
- **Performance:** Any concerns about DB queries, API calls, etc.?
- **Existing patterns:** How does this fit with our current Express + Mongoose architecture?

## Project Context
This is an Express.js app for March Madness Calcutta auctions:
- MongoDB/Mongoose for data storage
- Stripe for payments (Payment Links + webhooks)
- JWT cookie auth with payment gating
- Vanilla JS frontend with HTML views
- Blog system with markdown
- Follow patterns in CLAUDE.md

## After Interview
Once the interview is complete, write the spec to a file:
`specs/[feature-name].md`

Include:
1. **Summary** - One paragraph overview
2. **Requirements** - Bulleted list of what it must do
3. **Data Model** - Mongoose schema changes
4. **Routes** - New/modified Express routes
5. **UI/Views** - Pages, HTML changes needed
6. **Edge Cases** - How to handle each
7. **Implementation Order** - Suggested sequence of steps

<instructions>$ARGUMENTS</instructions>
