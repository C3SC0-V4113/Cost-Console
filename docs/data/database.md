# Cost Console Database Architecture

## Status And Scope

This document defines the planned database architecture for Cost Console. It is a
documentation-only contract and does not create a Docker Compose file, Prisma
package, Prisma schema, migration, database connection, API route, seed script,
or runtime table.

PostgreSQL is the required persistence engine. Prisma is the accepted future ORM,
schema owner, migration workflow, and type-safe data access layer.

## Decisions

- Use PostgreSQL for local and deployed persistence.
- Use Prisma for the application data model, migrations, generated client, and
  normal relational access.
- Use Docker Compose for the future local PostgreSQL service.
- Keep pricing, source references, benchmark references, saved scenario inputs,
  and calculation results as first-class persisted records.
- Keep scenario inputs separate from immutable calculation results so a saved
  scenario can be recalculated against the same or a newer pricing snapshot.
- Use the curated pricing and benchmark source policy from ADR 0006 for the
  first source seed data.
- Store money and rates as high-precision decimal values; store tokens and other
  counted quantities as integers.

## Local PostgreSQL Contract

The future local development database should be a Docker Compose service named
`postgres`. No Compose file exists yet.

Planned local defaults:

- Image: `postgres:18-alpine`.
- Database: `cost_console`.
- User: `cost_console`.
- Connection env var: `DATABASE_URL`.
- Persistent volume: `cost_console_pgdata`.
- Service name: `postgres`.

`postgres:18-alpine` is the local documentation default because PostgreSQL 18 is
the current supported major release as of 2026-06-03. PostgreSQL supports each
major version for five years after initial release, so future implementation work
must confirm the current supported major before pinning runtime files.

The future Compose service should include a healthcheck that waits for the
database to accept connections before app commands depend on it. Reset behavior
should be explicit: local destructive resets may remove the local volume and
rerun migrations, but production-like environments must use migration deploy
flows instead of reset commands.

## Prisma Workflow Contract

Planned future dependencies:

- `prisma` as a development dependency.
- `@prisma/client` as a runtime dependency.

Planned future files:

- `prisma/schema.prisma`.
- `prisma/migrations/`.
- generated Prisma Client output controlled by Prisma defaults unless a future
  ADR changes it.

Planned commands:

- `prisma migrate dev` for local migration creation.
- `prisma migrate deploy` for deployed environments.
- `prisma generate` after schema changes.
- `prisma studio` for local inspection.

Prisma owns relational table definitions and versioned migrations. Custom SQL is
allowed only for advanced PostgreSQL behavior that Prisma cannot express cleanly,
such as specialized indexes, generated columns, extensions, triggers, or
database-level constraints. Any custom SQL must live inside versioned migrations
and include a short migration comment or ADR reference explaining why Prisma's
schema model was insufficient.

`prisma db push` is not the default workflow for this project because Cost
Console needs traceable migrations. It may only be used for isolated prototypes
that are not committed as the project schema history.

## Initial Table Model

The initial model should use relational columns for fields needed in filtering,
comparison, grouping, and scenario regeneration. JSON fields are allowed for
provider-specific metadata, flexible assumptions, and explanatory notes, but
URLs, source dates, pricing snapshots, benchmark context, scenario kind, and
calculation line items must remain queryable first-class data.

### `project_scope`

Represents the local project boundary and future tenant or workspace boundary.

Planned fields:

- `id`
- `name`
- `slug`
- `status`
- `created_at`
- `updated_at`

Relationships:

- Owns `scenario` records.
- May own pricing snapshots if future tenancy requires per-project catalogs.

## Source And Benchmark Policy

The first source import must use curated snapshots, not live runtime leaderboard
queries. Official pricing sources are preferred for cost rows. Third-party or
vendor benchmark sources may be used only when their metric, dataset or scenario
context, assumptions, source URL, source date, and retrieved-at date are stored.

The initial source matrix is documented in
[docs/data/source-seed-catalog.md](./source-seed-catalog.md). ADR 0006 is the
durable decision record for this policy.

### `source_reference`

Stores traceability for pricing facts, benchmark assumptions, manual values, and
source-backed infrastructure costs.

Planned fields:

- `id`
- `source_type` such as `official_pricing`, `official_docs`,
  `third_party_benchmark`, `vendor_benchmark`, or `internal_manual`
- `title`
- `url`
- `source_date`
- `retrieved_at`
- `provider`
- `tool_or_dataset`
- `metric_name`
- `metric_definition`
- `assumptions`
- `notes`
- `created_at`
- `updated_at`

Relationships:

- Referenced by `pricing_catalog`, `pricing_snapshot`, `benchmark_result`, and
  scenario records that depend on manual or source-backed assumptions.

### `pricing_snapshot`

Represents a versioned capture of pricing data used by scenarios and calculation
results.

Planned fields:

- `id`
- `name`
- `currency`
- `status` such as `draft`, `active`, `superseded`, or `archived`
- `captured_at`
- `valid_from`
- `valid_to`
- `freshness_state`
- `source_reference_id`
- `notes`
- `created_at`
- `updated_at`

Relationships:

- Has many `pricing_catalog` records.
- Referenced by `scenario` and `calculation_result`.

### `pricing_catalog`

Stores provider, model, capability, and unit pricing rows.

Planned fields:

- `id`
- `pricing_snapshot_id`
- `source_reference_id`
- `provider`
- `model`
- `capability` such as `chat`, `embedding`, `reranking`, or `image`
- `context_window_tokens`
- `currency`
- `price_unit` such as `per_1m_tokens`
- `input_price`
- `output_price`
- `cached_input_read_price`
- `cache_write_price`
- `embedding_price`
- `validity_state`
- `notes`
- `created_at`
- `updated_at`

Relationships:

- Belongs to a `pricing_snapshot`.
- May reference a `source_reference`.
- May be referenced by scenario subtype records through selected provider/model
  fields or future explicit foreign keys.

System prompt cost is not stored as a separate catalog price by default. It is a
calculation line derived from token buckets and the selected input or cached
input price.

### `scenario`

Stores shared saved-scenario metadata.

Planned fields:

- `id`
- `project_scope_id`
- `pricing_snapshot_id`
- `kind` such as `chat`, `rag`, or `text_to_sql`
- `name`
- `label`
- `status` such as `draft`, `saved`, `archived`, or `template`
- `description`
- `notes`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `project_scope`.
- Belongs to the pricing snapshot selected for scenario setup.
- Has one subtype row: `chat_cost_scenario`, `rag_cost_scenario`, or
  `text_to_sql_scenario`.
- Has many `calculation_result` records.

### `chat_cost_scenario`

Stores inputs for the unified Chat Cost Playground.

Planned fields:

- `id`
- `scenario_id`
- `provider`
- `model`
- `interactions_per_day`
- `days_per_month`
- `system_prompt_tokens`
- `user_input_tokens`
- `history_context_tokens`
- `cached_input_tokens`
- `output_tokens`
- `prompt_cache_hit_percentage`
- `assumptions`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `scenario`.

### `rag_cost_scenario`

Stores inputs for the RAG Cost Lab, including embedding ingestion, vector index,
query workload, retrieval, and generation assumptions.

Planned fields:

- `id`
- `scenario_id`
- `document_count`
- `average_document_tokens`
- `cleanup_ratio`
- `chunk_size_tokens`
- `chunk_overlap_tokens`
- `embedding_provider`
- `embedding_model`
- `expected_chunks`
- `total_embedding_tokens`
- `ingestion_batch_assumptions`
- `vector_store_provider`
- `vector_dimensions`
- `storage_unit`
- `storage_cost`
- `storage_source_reference_id`
- `queries_per_day`
- `days_per_month`
- `average_query_tokens`
- `query_embedding_model`
- `top_k`
- `average_retrieved_chunk_tokens`
- `score_threshold`
- `hybrid_semantic_weight`
- `hybrid_text_weight`
- `final_llm_provider`
- `final_llm_model`
- `system_prompt_tokens`
- `retrieved_context_tokens`
- `expected_output_tokens`
- `prompt_cache_hit_percentage`
- `assumptions`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `scenario`.
- May reference `source_reference` for vector storage pricing or benchmarked
  retrieval assumptions.

### `text_to_sql_scenario`

Stores inputs for the Text-to-SQL Cost Lab.

Planned fields:

- `id`
- `scenario_id`
- `provider`
- `model`
- `questions_per_day`
- `days_per_month`
- `question_tokens`
- `schema_context_tokens`
- `semantic_metadata_tokens`
- `sql_output_tokens`
- `validation_prompt_tokens`
- `average_retry_attempts`
- `prompt_cache_hit_percentage`
- `semantic_layer_mode` such as `none`, `headless`, or `native`
- `semantic_definitions_included`
- `semantic_layer_source_reference_id`
- `benchmark_preset`
- `accuracy_metric_type`
- `baseline_accuracy`
- `semantic_layer_accuracy`
- `accuracy_source_reference_id`
- `warehouse_provider`
- `warehouse_price_unit`
- `average_warehouse_execution_cost`
- `warehouse_source_reference_id`
- `assumptions`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `scenario`.
- References source records for semantic-layer assumptions, accuracy benchmarks,
  and optional warehouse execution cost.

### `benchmark_result`

Stores source-backed benchmark or accuracy records used by RAG and Text-to-SQL
scenarios.

Planned fields:

- `id`
- `source_reference_id`
- `benchmark_kind` such as `rag_retrieval`, `text_to_sql_accuracy`, or
  `semantic_layer_accuracy`
- `provider`
- `model`
- `dataset_or_scenario`
- `metric_type`
- `metric_value`
- `metric_unit`
- `is_official`
- `notes`
- `created_at`
- `updated_at`

Relationships:

- Belongs to `source_reference`.
- May be linked to scenarios through selected benchmark preset fields or future
  join tables.

### `calculation_result`

Stores immutable calculation runs generated from a scenario and pricing snapshot.

Planned fields:

- `id`
- `scenario_id`
- `pricing_snapshot_id`
- `result_version`
- `calculated_at`
- `currency`
- `cost_per_interaction`
- `daily_cost`
- `monthly_cost`
- `yearly_cost`
- `one_time_cost`
- `total_monthly_estimate`
- `total_yearly_estimate`
- `input_hash`
- `summary`
- `created_at`

Relationships:

- Belongs to `scenario`.
- Belongs to `pricing_snapshot`.
- Has many `calculation_line_item` records.

Calculation results should not be mutated after creation. If scenario inputs or
pricing change, create a new result.

### `calculation_line_item`

Stores per-result cost and usage breakdown rows.

Planned fields:

- `id`
- `calculation_result_id`
- `category` such as `input`, `output`, `cached_input`, `cache_write`,
  `embedding_ingestion`, `query_embedding`, `retrieved_context`,
  `warehouse_execution`, or `storage`
- `label`
- `unit`
- `quantity`
- `unit_price`
- `cost`
- `source_reference_id`
- `notes`
- `created_at`

Relationships:

- Belongs to `calculation_result`.
- May reference `source_reference` when a line item depends on a benchmark,
  manual assumption, or infrastructure price.

## Modeling Defaults

- Use relational columns for fields needed in filtering, comparison, joins,
  saved scenario lists, and audit views.
- Use JSON fields only for flexible assumptions, notes, labels, and
  provider-specific metadata.
- Store source and benchmark metadata as first-class records. Do not bury source
  URL, source date, metric definition, provider, or dataset context only inside
  free-text notes.
- Keep scenario inputs separate from calculation results.
- Keep calculation line items separate from summary totals so UI summaries can
  show how each cost was derived.
- Store percentages with clear units and validation rules.
- Store token counts as integers.
- Store all money and rates with high-precision decimal fields.
- Prefer explicit enum-like fields for scenario kind, status, source type,
  benchmark kind, and line-item category. The implementation can use Prisma
  enums or constrained strings after a schema design pass.

## Non-Goals

- No authentication or tenant enforcement is implemented by this document.
- No production database provider is selected.
- No runtime seed script is defined.
- No Prisma schema is generated from this document.
- No vector database, warehouse, or benchmark integration is implemented.

## References

- PostgreSQL versioning policy:
  https://www.postgresql.org/support/versioning/
- PostgreSQL latest releases:
  https://www.postgresql.org/
- Prisma Migrate:
  https://www.prisma.io/docs/orm/prisma-migrate
- Prisma Docker guide:
  https://www.prisma.io/docs/guides/deployment/docker
- Curated source seed catalog:
  [docs/data/source-seed-catalog.md](./source-seed-catalog.md)
- ADR 0006:
  [docs/adr/0006-define-curated-pricing-and-benchmark-source-policy.md](../adr/0006-define-curated-pricing-and-benchmark-source-policy.md)
