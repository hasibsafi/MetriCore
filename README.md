# MetriCore

MetriCore is a multi-tenant SaaS dashboard that unifies website health, GA4 analytics, Search Console performance, and rule-based recommendations. It is designed for teams managing multiple sites and organizations with strict tenant isolation.

## Features

- Organization-based multi-tenancy with role-based access
- PageSpeed health scans with historical tracking
- GA4 analytics snapshots and trends
- GSC search performance snapshots and trends
- Recommendations generated from scan results

## Tech stack

- Next.js App Router + TypeScript + TailwindCSS
- NextAuth (Auth.js) for authentication
- PostgreSQL + Prisma
- Redis + BullMQ worker
- Docker Compose for local infra

## Repository structure

- `apps/web` — Next.js app, API routes, Prisma schema
- `apps/worker` — background worker that processes scans and snapshots
- `packages/shared` — shared Zod schemas and utilities
- `infra` — local Docker Compose services

## Getting started

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the example env file and update values as needed:

```bash
cp .env.example .env
```

Local dev typically uses:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/metricore
REDIS_URL=redis://localhost:6379
NEXTAUTH_URL=http://localhost:3000
```

### Start local infrastructure

```bash
docker compose -f infra/docker-compose.yml up -d postgres redis
```

### Run Prisma

```bash
npm run -w apps/web prisma:generate
npm run -w apps/web prisma:migrate
```

### Start the app and worker

```bash
npm run -w apps/web dev
npm run -w apps/worker dev
```

## Core workflows

### Health scans (PageSpeed)

Trigger a scan for a site:

```bash
curl -X POST http://localhost:3000/api/orgs/<orgId>/sites/<siteId>/scan/pagespeed
```

Check latest health bundle:

```bash
curl http://localhost:3000/api/orgs/<orgId>/sites/<siteId>/health/latest
```

### GA4 and GSC snapshots

Trigger snapshots from the UI or API:

```bash
curl -X POST http://localhost:3000/api/orgs/<orgId>/sites/<siteId>/snapshots/ga4
curl -X POST http://localhost:3000/api/orgs/<orgId>/sites/<siteId>/snapshots/gsc
```

## Environment variables

Minimum required for local development:

- `DATABASE_URL`
- `REDIS_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `AUTH_SECRET`
- `APP_URL`
- `ENCRYPTION_KEY`
- `PAGESPEED_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_INTEGRATION_CLIENT_ID`
- `GOOGLE_INTEGRATION_CLIENT_SECRET`
- `GOOGLE_OAUTH_STATE_SECRET`

## Architecture notes

The app follows a strict layering model:

- **Route handlers** validate input and enforce auth
- **Services** contain business logic
- **Repositories** are the only layer that touches Prisma

Worker jobs follow the same service → repository pattern and never import from `apps/web`.

## Deployment checklist

- Provision Postgres and Redis
- Set production environment variables
- Run Prisma migrations
- Deploy web and worker from the same commit
- Configure Google OAuth redirect URIs for production

## Troubleshooting

- `OAuthAccountNotLinked`: sign in with existing credentials, then link Google
- Missing data: ensure Google integrations are connected and snapshots are running
- Worker not processing: verify Redis URL and worker is running

## License

MIT
