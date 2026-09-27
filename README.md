# Fintech Atlas Nigeria

An evidence-aware, database-oriented public reference for Nigerian fintech infrastructure. It intentionally starts with a small sourced dataset rather than speculative provider, API, licence, or relationship claims.

## Architecture

- **Next.js + TypeScript** public application, typed API routes, dynamic entity pages, sitemap and robots policy.
- **PostgreSQL** normalized schema in [`db/schema.sql`](db/schema.sql), including sources, publication status, relationships, APIs, regulations, flows, audit logs, and community-ready tables.
- **React Flow** interactive relationship map. Graph records are structured data, never graph markup embedded in pages.
- **Portable imports:** application files use relative module imports, so production builds do not rely on a custom bundler or TypeScript path-alias configuration.
- **Admin foundation:** a protected write endpoint validates input and requires `ADMIN_API_KEY`. It returns `501` until a persistent repository adapter is connected; this is deliberate so no admin form appears to save data when it does not.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

For PostgreSQL, enable the `pgcrypto` extension (required for UUID defaults), create a database, set `DATABASE_URL`, then run:

```bash
npm run db:migrate
npm run db:seed
```

## Quality and editorial policy

Every seeded factual entity has an official or government source and verification date. Records without source provenance must remain draft. The flow is explicitly educational, not a scheme specification or legal advice. Before production, connect `src/lib/repository.ts` to PostgreSQL, implement session-based RBAC, durable rate limiting, CSRF protections for browser sessions, and the full admin CRUD UI.

## Commands

```bash
npm run dev
npm run build
npm test
```
