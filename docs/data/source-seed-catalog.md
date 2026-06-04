# Curated Source Seed Catalog

This document defines the first source set to use when the future Prisma schema
and seed workflow are implemented. It is documentation-only and does not create
runtime seed data.

## Seed Policy

- Use curated snapshots, not live runtime leaderboard queries.
- Prefer official pricing pages for costs.
- Store `source_date` when the source declares a date; otherwise use the
  snapshot date.
- Store `retrieved_at` for every imported source row.
- Keep benchmark values separate from pricing facts.
- Mark user-entered values as `internal_manual` and require notes.
- Refresh official pricing monthly and before releases that change seeded
  pricing data.
- Refresh benchmark presets quarterly or when a benchmark methodology, dataset,
  or leaderboard changes materially.

## Pricing Sources

| Domain                        | Source                                                                                                | Source type        | Initial use                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------- |
| Chat pricing                  | [OpenAI API Pricing](https://openai.com/api/pricing/)                                                 | `official_pricing` | OpenAI chat model input, cached input, output, batch, and tool pricing rows.      |
| Chat pricing                  | [OpenAI Detailed Pricing](https://developers.openai.com/api/docs/pricing)                             | `official_pricing` | Detailed per-model pricing, file search, web search, and container pricing.       |
| Embeddings                    | [OpenAI text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small) | `official_pricing` | OpenAI starter embedding price row and embedding model metadata.                  |
| Embeddings                    | [OpenAI Embeddings FAQ](https://help.openai.com/en/articles/6824809-embeddings-faq)                   | `official_docs`    | Embedding behavior notes, token counting guidance, and vector DB guidance.        |
| Chat pricing                  | [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)                        | `official_pricing` | Anthropic input, output, cache write, cache read, batch, and residency modifiers. |
| Chat and embeddings pricing   | [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)                                   | `official_pricing` | Gemini chat, context caching, grounding, and embedding rows.                      |
| Chat pricing                  | [Mistral Pricing](https://mistral.ai/pricing/)                                                        | `official_pricing` | Mistral input/output pricing rows.                                                |
| Chat and retrieval pricing    | [Cohere Pricing](https://cohere.com/pricing)                                                          | `official_pricing` | Cohere generation, embed, rerank, and Model Vault pricing notes where public.     |
| Pricing semantics             | [Cohere Pricing Docs](https://docs.cohere.com/docs/how-does-cohere-pricing-work)                      | `official_docs`    | Cohere token, embed, and rerank billing semantics.                                |
| Vector storage and query cost | [Pinecone Pricing](https://www.pinecone.io/pricing/)                                                  | `official_pricing` | Optional vector DB storage, read-unit, write-unit, and assistant pricing.         |
| Vector cost semantics         | [Pinecone Cost Docs](https://docs.pinecone.io/guides/manage-cost/understanding-cost)                  | `official_docs`    | Read/write/storage cost model notes.                                              |
| Vector storage cost           | [Qdrant Pricing](https://qdrant.tech/pricing/)                                                        | `official_pricing` | Optional Qdrant Cloud free and paid tier metadata.                                |
| Vector cost semantics         | [Qdrant Billing Docs](https://qdrant.tech/documentation/cloud-pricing-payments/)                      | `official_docs`    | CPU, memory, and disk pricing model notes.                                        |
| Vector storage cost           | [Weaviate Pricing](https://weaviate.io/pricing.html)                                                  | `official_pricing` | Optional Weaviate Cloud pricing plan metadata.                                    |
| PostgreSQL vector baseline    | [Supabase Pricing Docs](https://supabase.com/docs/pricing)                                            | `official_pricing` | Optional pgvector-on-Postgres baseline plan and database storage metadata.        |

## Benchmark Sources

| Domain                      | Source                                                                           | Source type             | Initial use                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| Chat model comparison       | [Arena/LMArena](https://arena.ai/?leaderboard=)                                  | `third_party_benchmark` | Human preference snapshot for chat model comparison notes.                                    |
| Chat price/performance      | [Artificial Analysis Models](https://artificialanalysis.ai/models)               | `third_party_benchmark` | Intelligence, latency, speed, and blended price comparison snapshots.                         |
| Chat benchmark methodology  | [Chatbot Arena paper](https://arxiv.org/abs/2403.04132)                          | `third_party_benchmark` | Methodology notes for human-preference rankings.                                              |
| Embedding and retrieval     | [MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard)               | `third_party_benchmark` | Embedding leaderboard preset snapshots.                                                       |
| Embedding and retrieval     | [MTEB Repository](https://github.com/embeddings-benchmark/mteb)                  | `third_party_benchmark` | Benchmark task, citation, and metric metadata.                                                |
| Retrieval                   | [BEIR Repository](https://github.com/beir-cellar/beir)                           | `third_party_benchmark` | Retrieval benchmark metadata and metric definitions such as NDCG, MAP, recall, and precision. |
| Retrieval                   | [BEIR Paper](https://arxiv.org/abs/2104.08663)                                   | `third_party_benchmark` | Academic source for BEIR benchmark context.                                                   |
| Text-to-SQL                 | [BIRD Benchmark](https://bird-bench.github.io/)                                  | `third_party_benchmark` | Execution accuracy and large database-grounded Text-to-SQL preset snapshots.                  |
| Text-to-SQL                 | [BIRD Paper](https://arxiv.org/abs/2305.03111)                                   | `third_party_benchmark` | Dataset and methodology metadata for BIRD.                                                    |
| Semantic layer Text-to-SQL  | [dbt LLM Semantic Layer Benchmark](https://dbt-labs.github.io/dbt-llm-sl-bench/) | `vendor_benchmark`      | Semantic-layer versus raw SQL comparison context.                                             |
| Semantic layer Text-to-SQL  | [dbt Compare](https://dbt-labs.github.io/dbt-llm-sl-bench/compare/)              | `vendor_benchmark`      | Accuracy, cost, latency, and tradeoff snapshots without additional modeling.                  |
| Semantic layer Text-to-SQL  | [dbt Repeated Runs](https://dbt-labs.github.io/dbt-llm-sl-bench/repeated-runs/)  | `vendor_benchmark`      | Variance and consistency snapshots.                                                           |
| Semantic layer Text-to-SQL  | [dbt Historical](https://dbt-labs.github.io/dbt-llm-sl-bench/historical/)        | `vendor_benchmark`      | Historical comparison and modeling impact notes.                                              |
| Text-to-SQL legacy baseline | [Spider](https://yale-lily.github.io/spider)                                     | `third_party_benchmark` | Legacy cross-domain Text-to-SQL benchmark context.                                            |

## Minimum Seed Record Shape

Pricing source rows should be mappable to:

- `source_reference`: source type, title, URL, source date, retrieved-at date,
  provider, tool or dataset, assumptions, and notes;
- `pricing_snapshot`: snapshot name, currency, captured-at date, validity, and
  freshness;
- `pricing_catalog`: provider, model, capability, context window, price unit,
  decimal price fields, validity state, and source reference.

Benchmark source rows should be mappable to:

- `source_reference`: source type, title, URL, source date, retrieved-at date,
  provider or tool, dataset, metric name, metric definition, assumptions, and
  notes;
- `benchmark_result`: benchmark kind, provider, model, dataset or scenario,
  metric type, metric value, metric unit, official flag, and source reference.

## Starter Presets

- Chat: OpenAI, Anthropic, Google Gemini, Mistral, and Cohere model rows from
  official pricing snapshots, plus Arena and Artificial Analysis benchmark
  context.
- RAG: OpenAI and Gemini embedding prices, optional Cohere retrieval model
  pricing, optional vector-store infrastructure pricing, and MTEB/BEIR benchmark
  presets.
- Text-to-SQL: OpenAI, Anthropic, Google, Mistral, and Cohere chat pricing rows,
  BIRD execution accuracy presets, dbt semantic-layer benchmark presets, and
  Spider context for legacy comparison.
