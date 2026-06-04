# ADR 0005: Define PostgreSQL And Prisma Data Architecture

## Status

Accepted

## Context

Cost Console needs persisted pricing snapshots, source references, saved
scenarios, benchmark assumptions, and immutable calculation results. The project
has already been defined as a fullstack analytical playground rather than a
static calculator, so the data layer must support traceability and recalculation
instead of only storing transient UI state.

The first implementation phase must remain useful without `auth-service`,
`ai-gateway`, or `knowledge-rag`, but it still needs a local persistence contract
that can later support project isolation and integration.

## Decision

Cost Console will use PostgreSQL as its persistence engine.

Cost Console will use Prisma as the future ORM, schema owner, migration workflow,
and normal type-safe data access layer. Prisma migrations will own relational
schema changes, and Prisma Client will be the expected application access layer
when runtime implementation begins.

Local development will be documented around a future Docker Compose `postgres`
service using `postgres:18-alpine` as the local default image, database
`cost_console`, user `cost_console`, env var `DATABASE_URL`, and persistent
volume `cost_console_pgdata`.

This ADR is documentation-only. It does not authorize adding `docker-compose.yml`,
Prisma dependencies, `schema.prisma`, migrations, database connection code, API
routes, seed scripts, runtime tables, or calculation helpers.

Custom SQL is allowed only for advanced PostgreSQL features that Prisma cannot
express cleanly. Any custom SQL must live inside versioned migrations and must be
documented with a short explanation or ADR reference.

## Consequences

- Future implementation work has a clear persistence direction before runtime
  files are created.
- Saved scenarios, pricing snapshots, benchmark references, and calculation
  results can be designed as durable, traceable records.
- The UI contract remains aligned with the rule that economic calculation logic
  belongs to backend-owned APIs and persisted result records, not duplicated UI
  math.
- Prisma schema design must preserve source and benchmark traceability as
  first-class data instead of hiding it in unstructured notes.
- Money representation, production database provider, scenario versioning, and
  exact schema normalization remain open until resolved in implementation
  planning or a later ADR.

## Related Documents

- [Database architecture](../data/database.md)
- [Open questions](../discovery/open-questions.md)
- [ADR 0001](./0001-define-cost-console-as-token-and-rag-cost-playground.md)
