# Testing plan

Last updated: 2026-08-29

## Current status

| Layer | Runner | Coverage | Status |
| --- | --- | --- | --- |
| Cart domain | Node test runner through `tsx` | Cookie parsing, form parsing, commands, limits, availability filtering, currency formatting, and cookie policy | 11 passing |
| React client | Vitest and React Testing Library | Add, update, remove, pending, success, and recoverable error states | 4 passing |
| Browser | Playwright | PostgreSQL catalog, cart page, cookie persistence, stale entries, and security headers | 6 passing |

Run each layer independently:

```bash
npm test
npm run test:react
npm run test:e2e
```

Use `npm run test:react:watch` while changing client components.

## Testing boundaries

- Keep cookie and FormData parsing plus pure cart commands under `src/lib/cart`.
- Use Vitest for client-side pending, success, error, and form-submission behavior.
- Use Playwright for Server Actions, cookies, seeded PostgreSQL data, Server
  Component rendering, CSP, and security headers.
- Do not mock Prisma, cookies, Server Actions, CSP, or security headers in browser
  tests.
- Do not render async Server Components in Vitest.

## Server-owned cart milestone

- [x] Replace the client provider and initial cart request with server-rendered
      state.
- [x] Store only versioned product identifiers and quantities in the cookie.
- [x] Recheck product availability and prices through Prisma.
- [x] Add typed Server Actions for increment, set quantity, and remove.
- [x] Add a cart page with empty, pending, error, update, and remove behavior.
- [x] Prove persistence across a full browser reload.
- [x] Ignore malformed, duplicate, and unavailable cookie entries.
- [x] Preserve the prior cookie when a mutation fails.

## Next testing work

- Add two available seed products before testing order across overlapping cart
  commands. One product cannot prove ordering across independent controls.
- Add database-backed order tests when checkout work introduces an order draft.
- Test cross-tab behavior only after cart identity moves from a browser cookie to
  the database. The current anonymous cookie deliberately uses last-write-wins.

## Release checks

Application changes must pass:

```bash
npm run lint
npm run typecheck
npm test
npm run test:react
npm run build -- --webpack
npm run test:e2e
```
