# Cost Console

Cost Console is a fullstack analytical playground for modeling the cost of AI
chat, embedding ingestion, vector queries, and end-to-end RAG architectures. It
is the product implementation of the portfolio's cost-intelligence capability:
make token and RAG costs visible before other services are built or integrated.

The upstream portfolio source of truth is
`E:\Repositorios\platform-ai-architecture`, especially
`docs/projects/cost-console.md` and platform ADR 0007. This repository keeps the
local implementation contract and product-specific ADRs.

## Product Definition

Cost Console is not a static calculator, an admin dashboard first, or an
inference gateway. The first product phase must be useful by itself while using
project-scoped authentication from `Identity-Service`. It must not depend on
`ai-gateway` or `knowledge-rag` to demonstrate value.

The core product must make these costs explicit:

- chat cost split by input tokens, output tokens, and carried context;
- embedding ingestion cost for initial document or chunk loads;
- recurring vector query cost, including query embeddings, retrieved context,
  and the final generative model call;
- complete RAG scenario cost across ingestion, retrieval, generation, and
  recurring usage.

## Architecture Target

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- Styling: Tailwind CSS v4, shadcn UI conventions, and semantic CSS tokens in
  `app/globals.css`.
- Backend: internal application API that owns calculation logic for scenarios,
  catalogs, and results.
- Persistence: PostgreSQL is the database contract, with Prisma accepted as the
  future ORM, schema owner, and migration workflow.
- Components: shared UI primitives live under `components/ui`; reusable
  application logic should stay outside route files when it grows beyond simple
  composition.
- Server-first default: `app/layout.tsx` and route components should stay Server
  Components unless state, browser APIs, or event handlers require a client
  island.
- React Scan: loaded only in development from `app/layout.tsx`.
- Authentication: project-scoped, cookie-based login delegated to
  `Identity-Service` using the `cost-console` project slug, enforced by
  Next.js 16 `proxy.ts` plus server-side route/layout guards.

The UI must not duplicate economic calculation logic that belongs to the
backend. Calculation inputs, pricing catalogs, snapshots, scenarios, and
calculation results should flow through the internal backend contract.

Authenticated access rules:

- unauthenticated visitors are redirected to login;
- authenticated `user` members can use the playground but cannot persist
  scenarios or pricing snapshots;
- authenticated `admin` members can open pricing snapshot administration
  surfaces.

## Expected Product Surfaces

### Chat Cost Playground

Estimate request and session cost with provider/model selection, message editing,
input/output/context token breakdowns, per-call and per-session cost, model
comparison, scenario save/duplicate behavior, and an explanation of how carried
history changes cost over turns.

### Embeddings Ingestion Calculator

Estimate the cost of vectorizing an initial document load with document volume,
chunk size, overlap, cleanup assumptions, embedding model selection, derived
chunk/token/request counts, total cost, unit cost, saved presets, and model
comparison.

### Vector Query Cost Playground

Estimate recurring RAG query cost with query size, query frequency, `top-k`,
average retrieved chunk size, query embedding cost, retrieved context tokens,
final response cost, per-query/daily/monthly projections, and comparison between
dense and cheaper retrieval strategies.

### End-to-End RAG Scenario Builder

Compare complete RAG architecture scenarios across ingestion volume, chunking,
embedding model, query pattern, final generative model, initial cost, per-query
cost, expected monthly cost, and dominant cost drivers.

### Pricing Catalog

Administer pricing used by the calculation engine with provider/model/capability
tables, snapshots or versions, validity state, record editing, historical
recalculation support, and traceability for which prices fed each simulation.

## Planned Views

The first documented view model is defined in
[docs/product/views.md](./docs/product/views.md). It is a product contract only:
no routes, components, APIs, schemas, TypeScript types, calculation helpers, or
database tables have been implemented from it yet.

The planned first surfaces are:

- an authenticated application shell that redirects unauthenticated visitors to
  login before opening the usable cost playground;
- a Pricing Catalog for provider, model, token-price, cache-price, and source
  traceability, eventually exposed through admin-only pricing snapshot
  workflows;
- one unified Chat Cost Playground for interaction volume, token buckets, prompt
  caching, educational helpers, saved scenarios, and day/month/year summaries;
- a planned RAG Cost Lab for embedding ingestion, vector query cost, retrieval
  configuration, benchmark/source notes, and end-to-end RAG summaries.
- a planned Text-to-SQL Cost Lab for raw SQL generation, semantic-layer-assisted
  generation, validation/retry cost, optional warehouse execution cost, and
  source-backed accuracy comparison.

## Database Architecture

The planned data architecture is defined in
[docs/data/database.md](./docs/data/database.md). It is an architecture contract
only: no Docker Compose service, Prisma dependency, `schema.prisma`, migrations,
database connection code, API routes, calculation helpers, or database tables
have been implemented yet.

The accepted direction is PostgreSQL plus Prisma, with local development planned
around a Docker Compose `postgres` service. Pricing and benchmark sources will
start from a curated source set documented in
[docs/data/source-seed-catalog.md](./docs/data/source-seed-catalog.md) and ADR 0006. Remaining product and data decisions are tracked in
[docs/discovery/open-questions.md](./docs/discovery/open-questions.md) so they
do not get buried in implementation notes.

## Persistence Contract

The minimum persistent domains are:

- `pricing_catalog`;
- `pricing_snapshot`;
- `chat_cost_scenario`;
- `rag_cost_scenario`;
- `text_to_sql_scenario`;
- `benchmark_result`;
- `calculation_result`;
- `calculation_line_item`;
- `project_scope` for future auth integration.

Calculation results may be regenerated, but scenarios, pricing snapshots,
presets, rules, and traceability records must be persisted.

Cost Console must not store master identity, canonical assets, or the canonical
RAG corpus. Future integrations may consume or enrich its outputs, but they do
not define the first-phase product boundary.

## Authentication Contract

Cost Console now requires login for all product routes. Authentication is
delegated to `Identity-Service`, which owns the session cookie, project-scoped
membership, and roles for the `cost-console` project.

Current local integration contract:

- `POST /projects/cost-console/auth/login`
- `POST /projects/cost-console/auth/logout`
- `GET /projects/cost-console/auth/session`
- `GET /projects/cost-console/me`

The frontend relays auth through same-origin BFF route handlers under
`app/api/auth/*`, forwards `Set-Cookie` back to the browser, and treats
Identity-Service as the authority for `user` versus `admin` access.

## Current Implementation State

- `app/layout.tsx` defines metadata, fonts, root HTML/body structure,
  `NextIntlClientProvider`, `next-themes`, the toaster, and the development
  React Scan script.
- `proxy.ts` validates the Identity-Service session cookie before private
  product routes render and fails closed when Identity-Service is unavailable.
- `app/login/*` implements the server-rendered auth surface: email check,
  password login, registration, and auth-only layout with language/theme controls.
- `app/(private)/layout.tsx` hosts the authenticated console shell;
  `app/(private)/page.tsx` is the protected playground entrypoint.
- `app/(private)/settings/account/page.tsx` shows the current project profile.
- `app/api/auth/*` relays Identity-Service email-check, login, register, and
  logout through same-origin responses.
- `app/(private)/pricing-snapshots/*` scaffolds admin-only pricing snapshot
  surfaces; `app/api/pricing-snapshots/*` keeps the backend guards.
- `components/theme/*`, `components/i18n/*`, and `messages/*` provide the theme
  and language selectors aligned with `other-gpt`.
- `tests/unit/login-page.test.tsx`, `tests/unit/console-home-page.test.tsx`, and
  `tests/e2e/auth-gate.spec.ts` cover the auth shell baseline.
- No PostgreSQL, Prisma, internal API, scenario schema, or calculation engine has
  been implemented yet.

## Documentation References

- UI/UX standard: [DESIGN.md](./DESIGN.md)
- Planned view specification: [docs/product/views.md](./docs/product/views.md)
- Database architecture: [docs/data/database.md](./docs/data/database.md)
- Curated source seed catalog:
  [docs/data/source-seed-catalog.md](./docs/data/source-seed-catalog.md)
- Open questions: [docs/discovery/open-questions.md](./docs/discovery/open-questions.md)
- Agent operating guide: [AGENTS.md](./AGENTS.md)
- Local ADRs: [docs/adr/README.md](./docs/adr/README.md)
- Project architecture guardrails: `.agents/skills/project-architecture/SKILL.md`
- Minimum verification skill: `.agents/skills/project-min-evaluation/SKILL.md`
- Decision documentation sync: `.agents/skills/decision-doc-sync/SKILL.md`
- Next.js 16 guidance: `.agents/skills/next-best-practices/SKILL.md`

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `env.example` to `.env.local`, then set `IDENTITY_URL` to the running
`Identity-Service` base URL before using the login flow.

Use `cmd /c npm ...` on Windows shells where PowerShell blocks `npm.ps1`.

## Scripts

```bash
npm run build
npm run start
npm run lint
npm run lint:fix
npm run typecheck
npm run format:check
npm run test
npm run test:e2e
npm run doctor
npm run check
```

`npm run check` is the full local gate: lint, typecheck, format check, Vitest,
and React Doctor CI policy.

## Quality Gates

Required before reporting implementation complete:

```bash
cmd /c npm run lint
cmd /c npm run typecheck
cmd /c npm run format:check
cmd /c npm run test
cmd /c npm run doctor
cmd /c npm run check
```

Notes:

- Do not use `next lint`; Next.js 16 removed it. Use the ESLint CLI through
  `npm run lint`.
- React Doctor warnings are blocking because `doctor` and `doctor:ci` run with
  `--fail-on warning`.
- `pre-commit` runs `lint-staged` and React Doctor on staged changes.
- `pre-push` runs `npm run check`.
- CI runs `npm run check` on push and pull request.
- Playwright CI remains additional E2E protection.

## Agent Workflow

Agents should read [AGENTS.md](./AGENTS.md) first, then use the relevant local
skills:

- `project-architecture` for UI, layout, component architecture, and dashboard or
  playground behavior changes.
- `next-best-practices` for Next.js 16 APIs, file conventions, RSC boundaries,
  data patterns, and metadata.
- `project-min-evaluation` before claiming work is complete.
- `decision-doc-sync` when a change creates or changes a structural decision.
- `architecture-decision-records` when creating, updating, superseding, or
  reviewing local ADRs.

Claude Code loads `CLAUDE.md`, which points to `AGENTS.md`, and uses
`.claude/skills` as a bridge to `.agents/skills`.
