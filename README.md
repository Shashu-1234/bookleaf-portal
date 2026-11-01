# BookLeaf Author Support & Communication Portal

Full-stack technical assignment for BookLeaf Publishing. The application contains an operations-focused admin workspace, an author portal, a provider-neutral AI layer, and a secure Supabase/PostgreSQL data model.

## Current implementation

- Admin overview, ticket queue, filtering, assignment, internal notes, AI review and editable response drafts
- Author dashboard, books, marketplace availability, royalties, support history and query submission flow
- Provider-neutral AI architecture: Gemini, Ollama, or typed manual fallback
- Supabase PostgreSQL schema with Row Level Security, Realtime and generated TypeScript types
- Assignment dataset seeded idempotently: 10 authors and 18 books
- Responsive Next.js 16 application deployed on Vercel
- Email/password authentication with verified server sessions and role-aware routing
- Database-backed author queries, replies, admin overrides, assignments, notes and responses
- Versioned REST API with bearer/cookie authentication, RBAC, Zod validation and consistent errors

All portal reads and operational mutations are backed by Supabase. The remaining mock-data files are isolated fixtures for deterministic UI-model tests and are not imported by production routes.

## Hosted demo accounts

The hosted project uses synthetic assignment-only identities:

| Workspace | Email | Password |
| --- | --- | --- |
| Support operations | `admin@bookleaf.example` | `BookLeaf!Admin2026` |
| Author (Rohit Kapoor) | `author@bookleaf.example` | `BookLeaf!Author2026` |

These credentials contain no real personal data and must be replaced before any production use.

## Technology

- Next.js 16, React 19 and TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL, Auth and Realtime
- Zod validation
- Vitest and ESLint
- Vercel deployment

## Local setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Configure these public Supabase values in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The publishable key is designed for browser use. Authorization is enforced by PostgreSQL Row Level Security. Never expose a Supabase secret or service-role key through a `NEXT_PUBLIC_` variable.

## Database workflow

```bash
# Regenerate deterministic seed SQL from the assignment JSON
npm run db:seed:generate

# Start/reset locally when Docker is available
npx supabase start
npx supabase db reset

# Run RLS tests and database linting
npx supabase test db
npm run db:validate
```

Schema changes are stored in `supabase/migrations/`; assignment data is stored in `supabase/seed.sql`. See [Database architecture](docs/database-architecture.md) and [AI architecture](docs/ai-architecture.md).

## Quality checks

```bash
npm run typecheck
npm test
npm run lint
npm run build
npm audit
```

## Routes

- `/admin` — operations overview
- `/login` — role-aware email/password sign-in
- `/admin/tickets` — support queue
- `/admin/tickets/[ticketId]` — ticket workspace
- `/author` — author overview
- `/author/books` — catalogue and distribution
- `/author/royalties` — earnings and payouts
- `/author/support` — author support centre
- `/author/support/new` — query submission

## REST API

The versioned API is rooted at `/api/v1`; its OpenAPI 3.1 document is served at [`/api/v1/openapi.json`](https://bookleaf-portal-wine.vercel.app/api/v1/openapi.json). See [API documentation](docs/api.md) for authentication, role permissions, endpoint contracts, pagination, response envelopes and curl examples.

Browser mutations use the REST API through the existing secure session cookie. Postman and other external clients can use a Supabase access token with `Authorization: Bearer <token>`. The API middleware validates trusted `app_metadata` roles, while PostgreSQL RLS independently enforces row ownership.

## Deployment

Production: <https://bookleaf-portal-wine.vercel.app>

AI is disabled by default (`AI_PROVIDER=manual`), so local development and database work cannot incur provider usage accidentally.
