# Open Questions

This document tracks unresolved product and data decisions for Cost Console. The
questions below do not block the current documentation-only architecture
contract, but they must be resolved before implementation commits to runtime
schemas, migrations, APIs, or operational behavior.

## Database Hosting

- Which production PostgreSQL provider will be used first?
- Will production use a managed PostgreSQL service, a platform-provided database,
  or self-hosted infrastructure?
- Will preview environments each receive isolated databases?
- What backup, point-in-time recovery, and retention policy is required?
- Will the app need read replicas or connection pooling in the first deployed
  phase?
- What is the local reset and seed workflow once Docker Compose and Prisma are
  implemented?

## Prisma And Schema Implementation

Resolved by ADR 0006:

- Money and rates should use high-precision decimal fields. Tokens, requests,
  documents, chunks, and similar counted quantities remain integers.

Still open:

- Should Prisma enums be used for scenario kind, line-item category, source type,
  and status, or should constrained strings be preferred for easier future
  extension?
- Should scenario subtype tables remain separate, or should some calculator
  inputs be consolidated into JSON columns?
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

- Should the first implementation build the Pricing Catalog and pricing snapshots
  before the Chat Cost Playground?
- Should PostgreSQL, Prisma, and migrations land before any calculator UI is
  replaced?
- Should the Chat Cost Playground be implemented before RAG Cost Lab and
  Text-to-SQL Cost Lab?
- Which view needs saved scenarios first?
- Should benchmark management be a standalone admin-like view or remain embedded
  in calculator flows until the catalog matures?
- Should Docker Compose and local seed data be introduced in the same change as
  the initial Prisma schema?
