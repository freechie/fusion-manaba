# Testing plan

Last updated: 2026-08-27

## Current status

| Layer | Runner | Coverage | Status |
| --- | --- | --- | --- |
| Cart domain | Node test runner through `tsx` | Parsing, normalization, request limits, and cookie policy | 11 passing |
| React client | Vitest and React Testing Library | `CartProvider` state and `AddToCartButton` behavior | 5 passing |
| Routes and browser | Playwright | Cart API, Postgres, cookies, catalog behavior, and security headers | 9 passing |

Run each layer independently:

```bash
npm test
npm run test:react
npm run test:e2e
```

Use `npm run test:react:watch` while changing client components.

## Testing boundaries

- Keep pure policy, parsing, normalization, and serialization tests in the fast
  Node test suite under `src/lib`.
- Use Vitest for client components, context state, mocked network responses, and
  user-visible transitions that do not need a live Next.js server.
- Use Playwright API tests for route handlers, cookies, seeded Postgres data, and
  real HTTP behavior.
- Use Playwright browser tests for rendered App Router pages, persistence across
  reloads, CSP, and security headers.
- Do not render async Server Components such as `src/app/page.tsx` or
  `src/app/products/[slug]/page.tsx` in Vitest.
- Do not repeat route validation, cookie, database, or security-header assertions
  in mocked React tests.

## Stage 1 complete: React test foundation

- [x] Add Vitest, jsdom, React Testing Library, jest-dom, and user-event.
- [x] Add separate `test:react` and `test:react:watch` scripts without changing
      the existing Node test command.
- [x] Configure Vitest to collect only `src/**/*.test.tsx` files.
- [x] Test initial cart loading, add/update/remove requests, response state, and
      invalid initial responses in `CartProvider`.
- [x] Test pending, successful, reset, and failed states in `AddToCartButton`.
- [x] Run the React suite in CI.

## Stage 2 next: request ordering and failure recovery

### Objective

Protect the client cart from stale responses and failed mutations before adding
more cart controls. Multiple product cards can issue requests independently, so
response ordering matters more than presentation-only component coverage.

### Tasks and acceptance criteria

1. Protect mutations from a late initial cart response.
   - Add a React test that delays the initial `GET /api/cart` response, completes
     an add mutation first, then resolves the initial request.
   - The final cart must retain the successful mutation result.

2. Serialize overlapping mutations in invocation order.
   - Add a test that starts two mutations before the first response resolves.
   - The second request must not start until the first request settles.
   - The final cart must contain the second mutation result and must not silently
     roll back to an older response.

3. Preserve known-good state when mutations fail.
   - Cover non-success and malformed responses for add, update, and remove.
   - Each rejected operation must preserve the previous cart, return loading to
     idle, and reject so the calling component can show failure.
   - A rejected mutation must not prevent the next queued mutation from running.

4. Cover the first useful cart consumer.
   - Add a `Navbar` test that verifies the count after initial loading and after a
     successful mutation.
   - Test the user-visible count, not classes or internal React state.

### Definition of done

- The four behaviors above have focused React tests.
- Any race exposed by the tests is fixed in `CartProvider`, not hidden with test
  timing changes.
- `npm run lint`, `npm run typecheck`, `npm test`, and `npm run test:react` pass.
- If application code changes, the production build and all nine Playwright tests
  also pass against the isolated test database.
- CI runs every implemented test layer.

### Non-goals

- Do not add snapshot tests for `ProductCard` or styling assertions for `Navbar`.
- Do not mock Prisma, Next route handlers, cookies, CSP, or security headers in
  Vitest.
- Do not add tests for checkout, authentication, or a cart page before those
  features exist.

## Later stage: cart controls

When the application gains a cart page or drawer, add React tests for quantity
editing, item removal, empty-cart rendering, and recoverable mutation errors.
Add Playwright coverage for one complete catalog-to-cart flow without duplicating
every component-level state transition.
