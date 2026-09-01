# Fusion Manaba Ecommerce Platform

> **Status:** Work in progress. This is a portfolio project demonstrating
> full-stack ecommerce engineering practices, with the goal of becoming a live
> production store.

Fusion Manaba is a server-rendered ecommerce application built with Next.js,
TypeScript, PostgreSQL, and Prisma. The current product slice covers catalog
browsing, product details, and a server-owned cart with quantity controls and
cookie persistence.

## Current Capabilities

- Server-rendered product catalog and product-detail routes
- PostgreSQL product and category data modeled through Prisma
- Cart page supporting add, update, remove, totals, and persistence behavior
- Server-side validation for form input, item quantity, cart size, stale cookie
  entries, and unavailable products
- HTTP-only, same-site cart cookies with secure production defaults
- Content Security Policy and browser security headers
- Unit, React, and browser tests for cart rules and user flows

## Architecture

- **Web application:** Next.js App Router, React, and TypeScript
- **Data layer:** PostgreSQL with Prisma ORM and migrations
- **Domain models:** `Category` and `Product`
- **Cart mutations:** Server Actions under `src/app/actions/cart.ts`
- **Cart state:** a versioned server-side cookie containing product identifiers
  and quantities only
- **Cart reads:** Server Components resolve current product data through Prisma
  and calculate decimal totals on each request
- **Quality:** Node test runner for cart-domain units and Playwright for
  Postgres-backed browser behavior

## Local Setup

Requirements:

- Node.js 24.15.0 or newer
- PostgreSQL 16 or another compatible PostgreSQL instance

Create the environment file and install dependencies:

```bash
cp .env.example .env
npm ci
```

Set `DATABASE_URL` in `.env`, then generate Prisma output, apply the migration,
and seed the catalog:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

Run static checks and unit tests:

```bash
npm run lint
npm run typecheck
npm test
npm run test:react
```

The repository currently contains 11 domain unit tests, 4 React component
tests, and 6 Playwright browser tests. The Postgres-backed suite runs against a
production build:

```bash
npm run db:generate
npm run db:migrate:deploy
npm run db:seed:test
npm run build
npm run test:e2e
```

The Playwright coverage includes cart controls, cookie persistence, unavailable
products, stale cookie entries, CSP/security headers, and browser console checks.

## Security Notes

`CART_COOKIE_SECURE=false` is reserved for local or CI HTTP E2E servers.
Production deployments default the cart cookie to `Secure`, and Vercel keeps it
secure regardless of that local override. See `SECURITY.md` for vulnerability
reporting and the current security policy.

## Current Limitations

- Checkout and payment processing are not implemented.
- Authentication, customer accounts, inventory reservation, and order management
  are not implemented.
- Anonymous cart writes in multiple browser tabs use last-write-wins cookie
  behavior.
- The application has not been load-tested or benchmarked for production traffic.
- There are no live customer, transaction, conversion, or revenue metrics.

## Planned Improvements

- Add a database-backed order draft when checkout work begins.
- Add stronger database integration coverage and operational observability.
- Measure page and API performance before optimizing identified bottlenecks.
- Add analytics and experimentation hooks only after defining measurable product
  questions.

## License

No license has been published for this work-in-progress repository.
