# Open Questions

This document tracks unresolved product and data decisions for Cost Console. The
questions below do not block the current documentation-only architecture
contract, but they must be resolved before implementation commits to runtime
schemas, migrations, APIs, or operational behavior.

## Database Hosting

Resolved by ADR 0008:

- The first production PostgreSQL provider is Supabase (managed service).
- Local development uses a Docker Compose `postgres:18-alpine` service on host
  port 5433 (5432 is taken by Identity-Service), with the volume mounted at
  `/var/lib/postgresql` for the PostgreSQL 18 layout.
- Runtime uses connection pooling via `DATABASE_URL`; migrations use `DIRECT_URL`.
- The local reset workflow is `npm run db:reset`; seed is `npm run db:seed`.

Still open:

- Will preview environments each receive isolated databases?
- What backup, point-in-time recovery, and retention policy is required?
- Will the app need read replicas in the first deployed phase?

## Prisma And Schema Implementation

Resolved by ADR 0006:

- Money and rates should use high-precision decimal fields. Tokens, requests,
  documents, chunks, and similar counted quantities remain integers.

Resolved by ADR 0008:

- Prisma enums are used for bounded, stable domains (snapshot status, freshness,
  source type, capability, validity, scenario kind, scenario status, benchmark
  kind, line-item category, semantic-layer mode).
- Money/rates use `Decimal(18,8)`, percentages `Decimal(5,2)`/`(5,4)`, counts
  `Int`.
- Scenario subtype tables remain separate (one subtype row per scenario kind).

Still open:

- Which PostgreSQL indexes are required for scenario comparison, catalog lookup,
  source search, and calculation-result history?
- Which advanced PostgreSQL features, if any, require custom SQL migrations?
- Should migration comments reference ADR numbers directly when custom SQL is
  used?

## Pricing Sources

Resolved by ADR 0006:

- The first pricing catalog seed will use a curated core set: OpenAI,
  Anthropic, Google Gemini, Mistral, Cohere, and optional source-backed vector
  infrastructure sources such as Pinecone, Qdrant, Weaviate, and Supabase.
- Official pricing sources refresh monthly and before releases that depend on
  changed seeded pricing.
- `retrieved_at` is required for every pricing record. `source_date` is required
  when the source declares one; otherwise the snapshot date is used.
- Pricing snapshots start global to the local app.

Still open:

- Who owns manual pricing entries and source verification?
- How should pricing changes be marked stale, superseded, or active in the UI
  and future admin workflow?

## Benchmark Sources

Resolved by ADR 0006:

- Benchmark values are curated presets, not live runtime leaderboard queries.
- Accepted first Text-to-SQL sources are BIRD, dbt LLM Semantic Layer Benchmark,
  and Spider as a legacy cross-domain reference.
- Accepted first RAG/retrieval sources are MTEB and BEIR.
- Accepted first chat comparison sources are Arena/LMArena and Artificial
  Analysis.
- Source types are `official_pricing`, `official_docs`,
  `third_party_benchmark`, `vendor_benchmark`, and `internal_manual`.
- Benchmark presets require source URL, source date or snapshot date,
  retrieved-at date, provider/tool, dataset or scenario context, metric name,
  metric definition, assumptions, notes, and source type.

Still open:

- How should domain mismatch warnings be worded when a benchmark does not match
  the user's dataset, schema, language, or workload?

## Auth And Project Isolation

- Resolved by ADR 0007:
  - Cost Console uses mandatory login through `Identity-Service`.
  - The project slug is `cost-console`.
  - Authenticated `user` members can use the playground but cannot persist
    scenarios or pricing snapshots.
  - Authenticated `admin` members can access pricing snapshot administration
    surfaces.
- Is `project_scope` enough for the first persisted local version, or should the
  schema reserve organization, workspace, and user ownership fields immediately?
- If user-level scenario persistence is introduced later, should saved scenarios
  be private by default?
- Can future integrations read calculation results without editing scenarios?
- Which records should be shareable templates versus project-owned private data?

## Scenario Versioning

- Should editing a saved scenario mutate the scenario row or create a new
  scenario version?
- Should calculation results store a full input snapshot in addition to relational
  links and hashes?
- How should duplicated scenarios preserve source references and pricing snapshot
  links?
- Should archived scenarios remain recalculable, or only readable?
- How long should calculation history be retained?

## Future Implementation Order

Resolved (vertical-slice implementation plan):

- PostgreSQL, Prisma, and the initial migration land first, before any calculator
  UI is built.
- The Chat Cost Playground is implemented first (vertical slice), before the
  Pricing Catalog, RAG Cost Lab, and Text-to-SQL Cost Lab.
- Docker Compose and the local seed are introduced alongside the initial Prisma
  schema (schema first, then the cited seed).

Still open:

- Which view needs saved scenarios first?
- Should benchmark management be a standalone admin-like view or remain embedded
  in calculator flows until the catalog matures?
