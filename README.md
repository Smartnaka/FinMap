# Fintech Atlas Nigeria

An evidence-aware, database-oriented public reference for Nigerian fintech infrastructure. It intentionally starts with a small sourced dataset rather than speculative provider, API, licence, or relationship claims.

## Architecture

- **Next.js + TypeScript** public application, typed API routes, dynamic entity pages, sitemap and robots policy.
- **PostgreSQL** normalized schema in [`db/schema.sql`](db/schema.sql), including sources, publication status, relationships, APIs, regulations, flows, audit logs, and community-ready tables.
- **React Flow** interactive relationship map. Graph records are structured data, never graph markup embedded in pages.
- **Portable imports:** application files use relative module imports, so production builds do not rely on a custom bundler or TypeScript path-alias configuration.
- **Runtime data source:** server-side repository reads use the `pg` connection pool and `DATABASE_URL`; `src/lib/seed.ts` is development seed reference only, not a runtime data source.
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

`db:migrate` creates the required `pgcrypto` extension and schema. Run both commands against the Supabase database before deploying; the application does not read `src/lib/seed.ts` at runtime. Public database-backed pages are rendered dynamically so a production build does not need to query the database, but `DATABASE_URL` is required when serving requests.

## Quality and editorial policy

Every seeded factual entity has an official or government source and verification date. Records without source provenance must remain draft. The flow is explicitly educational, not a scheme specification or legal advice. The public repository only returns published entities and relationships whose two endpoints are published. Before production, implement session-based RBAC, durable rate limiting, CSRF protections for browser sessions, and the full admin CRUD UI.

## Commands

```bash
npm run dev
npm run build
npm test
```

The unit tests do not use a private database URL. They verify the repository's public-query protections (published-only filters, parameter binding, and the absence of runtime seed imports). Run the migration and seed commands against a non-production Supabase project to verify database connectivity and seeded content.
