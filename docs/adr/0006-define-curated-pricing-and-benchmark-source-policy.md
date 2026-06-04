# ADR 0006: Define Curated Pricing And Benchmark Source Policy

- Date: 2026-06-03
- Status: Accepted

## Context

Cost Console needs source-backed pricing and benchmark data before the future
Prisma schema and seed workflow are implemented. The current product contract
already requires pricing traceability, source references, benchmark context, and
separate cost lines for chat, RAG, and Text-to-SQL. The unresolved decision was
how broad the first catalog should be and whether benchmark values should be
live leaderboard data, manual entries, or curated snapshots.

Pricing and benchmark values change frequently. Live leaderboards also change
their rankings, model names, and methodology over time. Cost Console needs
repeatable scenario comparisons, so users must be able to see which source
snapshot was used for each calculation.

## Decision Drivers

- Keep first implementation useful without building a broad data ingestion
  pipeline.
- Prefer official pricing sources over third-party pricing aggregators.
- Keep benchmark values selectable only when their metric, dataset, source date,
  assumptions, and domain context are visible.
- Preserve scenario recalculation by linking pricing and benchmark presets to
  explicit source snapshots.
- Avoid presenting live benchmark rankings as stable model quality facts.

## Decision

Cost Console will use a curated core source set for its first pricing and
benchmark seed data.

Pricing rows must come from official provider pages or internal/manual entries
that carry enough source metadata to explain the value. The first curated set is
OpenAI, Anthropic, Google Gemini, Mistral, Cohere, and source-backed optional
vector-store providers such as Pinecone, Qdrant, Weaviate, and Supabase.

Benchmark rows must be stored as curated presets, not queried live at runtime.
The first curated benchmark categories are:

- chat model comparison using Arena/LMArena and Artificial Analysis snapshots;
- RAG and retrieval assumptions using MTEB and BEIR;
- Text-to-SQL and semantic-layer accuracy using BIRD, dbt LLM Semantic Layer
  Benchmark, and Spider as a legacy cross-domain reference.

Every source-backed pricing or benchmark entry must store:

- source URL;
- source date when declared by the source, otherwise the snapshot date;
- retrieved-at date;
- source type;
- provider, tool, model, or dataset context;
- metric name and definition for benchmarks;
- assumptions and notes.

The future schema will store money and rates as high-precision decimal values.
Token counts, request counts, document counts, chunk counts, and similar
quantities remain integers.

## Consequences

### Positive

- First seed data can be implemented without scraping or live leaderboard
  integration.
- Scenario comparisons remain reproducible because they point to a pricing or
  benchmark snapshot.
- Official pricing facts stay separate from third-party benchmarks and manual
  assumptions.
- The app can warn users when a benchmark does not match their domain, language,
  schema complexity, or workload.

### Negative

- Curated values can become stale unless refresh work is scheduled.
- The first catalog will not cover every model provider or vector database.
- Manual snapshotting requires explicit review before releases that depend on
  pricing or benchmark values.

## Related Decisions

- ADR 0001 defines the Cost Console product boundary.
- ADR 0003 defines the RAG Cost Lab documentation.
- ADR 0004 defines the Text-to-SQL Cost Lab documentation.
- ADR 0005 defines the PostgreSQL and Prisma data architecture.

## References

- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [OpenAI Detailed Pricing](https://developers.openai.com/api/docs/pricing)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Mistral Pricing](https://mistral.ai/pricing/)
- [Cohere Pricing](https://cohere.com/pricing)
- [Arena/LMArena](https://arena.ai/?leaderboard=)
- [Artificial Analysis Models](https://artificialanalysis.ai/models)
- [MTEB](https://github.com/embeddings-benchmark/mteb)
- [BEIR](https://github.com/beir-cellar/beir)
- [BIRD](https://bird-bench.github.io/)
- [dbt LLM Semantic Layer Benchmark](https://dbt-labs.github.io/dbt-llm-sl-bench/)
- [Spider](https://yale-lily.github.io/spider)
