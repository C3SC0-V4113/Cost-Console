# ADR 0008: Resolve Money Decimal, Supabase Provider, And Prisma 7 Runtime

- Date: 2026-06-14
- Status: Accepted

## Context

ADR 0005 chose PostgreSQL and Prisma but explicitly left several decisions open
"until resolved in implementation planning or a later ADR": money representation,
the production database provider, and whether to use Prisma enums or constrained
strings. The first runtime persistence phase now begins, so these must be settled.

Two additional facts shape the implementation:

- Prisma installed as major version **7**, which moves connection URLs out of the
  schema into `prisma.config.ts` and requires a driver adapter on the client
  (`@prisma/adapter-pg`) instead of a bundled query engine.
- `Identity-Service` already runs its own PostgreSQL on port `5432` on the local
  development machine, so Cost Console cannot reuse that host port.

## Decision

**Money and counts.** Money and rate fields use Prisma `Decimal`
(`@db.Decimal(18,8)`); percentages use `Decimal(5,2)` (or `5,4` for ratio-style
weights); token counts and other counted quantities use `Int`. This keeps the
high-precision-decimal requirement from `docs/data/database.md` and rules out
floating-point money. SQLite/Cloudflare D1 was rejected because it lacks a native
DECIMAL type.

**Hosting.** The production provider is **Supabase** (managed PostgreSQL, with
pgvector available for future RAG work). Local development uses a Docker Compose
`postgres:18-alpine` service. Its host port is **5433** (not 5432, which
Identity-Service occupies), and its volume mounts at `/var/lib/postgresql` to
match the PostgreSQL 18+ version-specific data directory layout.

**Connection split.** `DATABASE_URL` is the runtime/pooled connection used by the
app and Prisma Client; `DIRECT_URL` is the direct connection used by Prisma
Migrate. On Supabase these differ (pooled vs direct); locally they match.

**Prisma 7 runtime.** Connection URLs live in `prisma.config.ts`
(`datasource.url` reads `DIRECT_URL`); the schema `datasource` declares only the
provider. The runtime `PrismaClient` is constructed with a `@prisma/adapter-pg`
driver adapter over `DATABASE_URL`. The generated client outputs to
`lib/generated/prisma` and is gitignored, lint-ignored, and prettier-ignored as
generated code.

**Enums.** Cost Console uses Prisma enums for bounded, stable domains: snapshot
status, freshness state, source type, model capability, validity state, scenario
kind, scenario status, benchmark kind, line-item category, and semantic-layer
mode. This resolves the open enum-versus-string question in favor of enums for
database-level integrity.

## Consequences

### Positive

- Money traceability and recalculation rest on exact decimal arithmetic.
- The local schema and migrations align with the accepted PostgreSQL/Prisma
  direction and a concrete deployable provider.
- The driver-adapter runtime fits Supabase serverless connection pooling.
- Generated client noise is excluded from quality gates.

### Negative

- The product now depends on Prisma 7's `prisma.config.ts` + adapter model, which
  differs from older Prisma setups developers may know.
- Adding an enum value requires a migration rather than a free-form string write.
- A future Prisma major upgrade must re-verify the config/adapter contract.

## Related Decisions

- ADR 0005 defines PostgreSQL and Prisma and left these items open.
- ADR 0006 defines the curated pricing and benchmark source policy used by the seed.
- ADR 0007 defines Identity-Service login and admin-managed pricing snapshots.
- `docs/data/database.md` is the schema contract this implementation transcribes.
