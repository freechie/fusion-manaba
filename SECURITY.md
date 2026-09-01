# Security Verification

CI blocks high and critical `npm audit` findings after linting, typechecking,
unit tests, a production build, and Postgres-backed Playwright coverage.
Moderate transitive advisories from current Next.js, PostCSS, or Prisma
tooling are reviewed during dependency maintenance when upstream releases
change. Do not use `npm audit fix --force` to downgrade or cross major
framework boundaries to suppress those findings without a compatibility review.

## Runtime And Test Environment

`DATABASE_URL` is required by the Prisma client, migrations, seeds, and the
database-backed route and browser tests. `.env.example` shows the local shape;
deployments should inject their real database URL through environment settings.

Cart cookies default to `Secure` under `NODE_ENV=production` and always remain
`Secure` on Vercel. A production-mode Playwright server running over local or CI
HTTP must set `CART_COOKIE_SECURE=false` so browser cookie persistence can be
tested. Leave that override unset in deployment environments.

## Local Verification Flow

Run the database steps against a disposable Postgres database before the
production-mode browser suite:

```bash
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run db:seed:test
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --audit-level=high
```
