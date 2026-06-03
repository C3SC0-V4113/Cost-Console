# Cost Console Planned Views

This document defines the intended first application views for Cost Console. It
is a product and view contract only. It does not implement routes, components,
APIs, schemas, TypeScript types, calculation helpers, tests, or database tables.

## View Principles

- The app should open into a usable cost playground, not a marketing landing
  page.
- The first documented surfaces are a Chat Cost Playground, Pricing Catalog, RAG
  Cost Lab, and Text-to-SQL Cost Lab.
- Pricing and calculations must remain traceable through provider, model,
  source, snapshot, assumptions, and token buckets.
- Educational copy should be compact and local to labels, section titles, or
  helper subtitles.
- "Prompt catching" is treated as prompt caching for this product definition.

## App Shell

The planned application shell should provide persistent navigation and product
context without becoming a separate dashboard surface.

Planned navigation:

- `Chat Cost`;
- `Pricing Catalog`;
- `RAG Cost Lab`;
- `Text-to-SQL Cost Lab`;
- future `Embeddings`;
- future `Vector Query`;
- future `RAG Scenarios`.

The root product intent is to open into `Chat Cost`, the usable cost playground.
Future placeholder entries may exist in documentation and navigation plans, but
they should not imply implemented routes until runtime work begins.

The header should eventually expose:

- active pricing snapshot;
- active currency;
- pricing freshness or last updated date;
- scenario dirty/saved state when a scenario is being edited.

## Pricing Catalog

The Pricing Catalog defines provider and model pricing used by the calculation
engine. Manual entries are allowed, but source metadata is required for
traceability.

Planned table fields:

- provider;
- model;
- capability;
- context window;
- currency;
- price unit;
- input token price;
- output token price;
- cached input read price;
- cache write price;
- source URL;
- source date;
- snapshot;
- validity state.

Planned row detail content:

- source notes;
- effective date;
- pricing snapshot metadata;
- manual-entry notes when applicable;
- scenario usage, showing which saved scenarios reference the price.

System prompt cost is calculated from system prompt token buckets and the
selected input/cache pricing. It is not stored as a separate catalog price by
default.

## Unified Chat Cost Playground

The Chat Cost Playground is the first planned calculator surface. It should
combine model selection, token inputs, prompt caching assumptions, educational
helpers, saved scenarios, and cost summaries in one view.

Planned sections:

- model and pricing selection;
- interaction volume;
- token inputs;
- prompt caching;
- educational helpers;
- cost summary;
- saved scenarios.

Planned inputs:

- interactions per day;
- days per month;
- system prompt tokens;
- user input tokens;
- history or carried context tokens;
- cached token count;
- output tokens;
- prompt cache hit percentage.

Prompt caching should model cached input separately from uncached input and
output. If provider pricing distinguishes cache reads and cache writes, the
summary should show those line items separately. If a provider does not define
cache-specific pricing, the view should label that state explicitly.

## Educational Helpers

The view should use info icons or compact helper subtitles for labels and section
titles that need immediate context.

Required helper topics:

- prompt caching: repeated prompt prefixes or context may be reused and priced
  differently by some providers;
- cache hit rate: the percentage of eligible prompt/context tokens expected to be
  billed as cached reads instead of regular input;
- cached input: tokens expected to use cached-read pricing;
- cache write: provider-specific cost, if any, to establish cacheable content;
- system prompt tokens: recurring instructions that may contribute to input or
  cached input cost;
- context/history tokens: carried conversation or retrieved context that
  increases request cost;
- token estimate: rough guidance only, not exact billing math;
- A4-page estimate: approximate range only, and lower priority than exact token
  counts.

Token explanation content should stay short. The app may say that a token is
roughly a few characters in English-like text and that an A4 page can vary
widely by language, density, and formatting. Exact copy and ranges can be
refined later when implementation chooses tokenizer guidance.

## Cost Summary

The cost summary should show totals at these levels:

- per interaction;
- per day;
- per month;
- per year.

Required line-item breakdown:

- uncached input;
- output;
- cached input;
- cache read/write where applicable;
- system prompt contribution;
- carried context/history contribution.

The summary must show the assumptions behind the rollup:

- interactions per day;
- days per month;
- pricing snapshot;
- currency;
- provider and model;
- prompt cache hit percentage.

## Saved Scenarios

Saved scenario support is planned inside the Chat Cost Playground rather than as
a separate first-phase route.

Planned scenario fields:

- scenario name;
- provider;
- model;
- pricing snapshot;
- daily interactions;
- days per month;
- prompt cache hit percentage;
- monthly cost;
- yearly cost;
- last updated date.

Expected actions:

- save scenario;
- duplicate scenario;
- compare scenario against current inputs;
- identify stale or missing pricing.

## RAG Cost Lab

The RAG Cost Lab is the planned unified surface for embedding ingestion, vector
query cost, retrieval configuration, and end-to-end RAG scenario summaries. It is
still documentation-only and does not imply implemented routes, React Flow,
runtime dependencies, schemas, APIs, or calculation helpers.

This view should cover the required product points that go beyond chat:

- tokens consumed when embedding an initial document load into a vector store;
- tokens consumed when embedding each query used for vector DB lookup;
- retrieved context tokens sent back into the final LLM request;
- final LLM output tokens and end-to-end daily/monthly/yearly cost.

The documented RAG flow is:

1. source documents;
2. chunking;
3. embedding ingestion;
4. vector index or storage;
5. query embedding;
6. vector or hybrid search;
7. retrieved chunks;
8. LLM context;
9. generated output.

Planned sections:

- ingestion setup;
- vector index assumptions;
- query workload;
- retrieval configuration;
- interactive pipeline diagram;
- benchmark and source notes;
- cost summary.

### Ingestion Setup

Planned ingestion inputs:

- document count;
- average document tokens;
- cleanup ratio;
- chunk size;
- chunk overlap;
- embedding model;
- embedding price;
- expected chunks;
- total embedding tokens;
- ingestion batch assumptions.

The summary should separate one-time embedding ingestion cost from recurring
query cost. Ingestion should not be mixed with vector storage or retrieval cost
without a clear label.

### Vector Index Assumptions

Planned vector DB assumptions:

- vector store or provider;
- storage unit;
- storage cost if known;
- embedding dimensions if relevant;
- metadata/filtering note;
- source URL and source date for benchmark or pricing values.

RAG storage/retrieval infrastructure cost is optional and must be source-backed.
If storage pricing is unknown, the view should still calculate embedding and LLM
token costs without inventing storage prices.

### Query Workload And Retrieval Configuration

Planned query inputs:

- queries per day;
- days per month;
- average query tokens;
- query embedding model;
- `top-k`;
- average retrieved chunk tokens;
- score threshold;
- optional filters;
- hybrid-search semantic/text weights where applicable.

"Weights" in this view means real pipeline parameters such as `top-k`, score
threshold, chunk size, overlap, cleanup ratio, or hybrid semantic/text weighting.
It does not mean arbitrary weights assigned to a RAG database.

### Generation Inputs

Planned generation inputs:

- final LLM model;
- system prompt tokens;
- retrieved context tokens;
- expected output tokens;
- prompt caching assumptions if retrieved or static context can be reused.

The view should distinguish query embedding tokens from final LLM input tokens.
The query is embedded for retrieval; retrieved chunks then become part of the LLM
context when generating the answer.

### Cost Summary

Required RAG Cost Lab summary outputs:

- one-time ingestion cost;
- per-query embedding cost;
- per-query retrieved-context LLM input cost;
- per-query output cost;
- daily query cost;
- monthly query cost;
- yearly query cost;
- storage or vector-store cost if available;
- total monthly and yearly scenario estimate.

## Text-to-SQL Cost Lab

The Text-to-SQL Cost Lab is the planned surface for comparing raw Text-to-SQL
against Text-to-SQL with a semantic layer. It is documentation-only and does not
imply implemented routes, runtime dependencies, schemas, APIs, calculation
helpers, benchmark presets, or tests.

This view should model:

- LLM token cost for natural-language questions, schema context, semantic
  metadata, generated SQL, validation prompts, and repair attempts;
- semantic-layer overhead and expected accuracy impact;
- optional warehouse or database execution cost when source-backed;
- accuracy as a benchmark- or scenario-specific metric, not a universal model
  property.

Planned sections:

- model and pricing selection;
- schema and context setup;
- semantic-layer mode;
- workload volume;
- SQL generation and validation loop;
- benchmark and accuracy source;
- optional warehouse execution cost;
- cost and accuracy summary.

### Text-to-SQL Core Inputs

Planned core inputs:

- provider/model;
- pricing snapshot;
- questions per day;
- days per month;
- average natural-language question tokens;
- schema/context tokens;
- semantic metadata tokens;
- expected SQL output tokens;
- validation prompt tokens;
- average retries or repair attempts;
- prompt caching assumptions where applicable.

### Semantic-Layer Inputs

Planned semantic-layer inputs:

- semantic layer mode: none, headless semantic layer, or native/platform
  semantic layer;
- semantic definitions included: metrics, dimensions, joins/entities,
  descriptions, synonyms, and certified queries;
- semantic context token size;
- semantic-layer source URL and source date;
- whether the semantic layer constrains SQL generation or generates SQL/metrics
  queries itself.

The view should explain that a semantic layer may add context tokens while
improving correctness, reducing ambiguity, or making unanswerable questions fail
more explicitly.

### Accuracy Inputs

Planned accuracy inputs:

- benchmark preset: dbt semantic-layer benchmark, BIRD, Denodo-style
  semantic-layer benchmark, or custom/manual;
- metric type: execution accuracy, answer accuracy, exact match, or
  benchmark-defined score;
- baseline accuracy without semantic layer;
- expected accuracy with semantic layer;
- confidence/source notes;
- user override value with notes when the benchmark does not match the user's
  domain.

Accuracy can come from benchmark presets plus a documented user override.
Overrides must show notes and should be visually distinct from source-backed
benchmark values.

### Optional Warehouse Execution Cost

Planned warehouse cost inputs:

- warehouse/database provider;
- execution pricing unit if known;
- average query execution cost or benchmarked runtime cost;
- source URL and source date;
- unavailable state when no source-backed value exists.

Warehouse/database execution cost is optional. If unknown, the view should still
calculate LLM token cost and label execution cost as unavailable instead of
inventing a value.

### Text-to-SQL Outputs

The Text-to-SQL summary should show LLM cost per question, day, month, and year.

Required cost line items:

- question/input tokens;
- schema/context tokens;
- semantic-layer context tokens;
- SQL output tokens;
- validation/retry tokens;
- cached input if applicable;
- optional warehouse execution cost.

Required accuracy summary:

- baseline accuracy without semantic layer;
- semantic-layer accuracy;
- accuracy delta;
- benchmark/source used;
- warning when values are user-entered or domain-mismatched.

Required scenario comparison:

- raw Text-to-SQL;
- Text-to-SQL with semantic layer;
- Text-to-SQL with semantic layer plus validation/retry loop.

## Interactive Pipeline Diagram Concept

The pipeline diagram is documented as a future React Flow-style concept, not as
an installed dependency or implementation commitment.

Planned nodes:

- Source Documents;
- Chunking;
- Embedding Ingestion;
- Vector Index;
- Query Embedding;
- Retrieval/Ranking;
- Retrieved Context;
- LLM Generation;
- Response.

Editable node parameters should mirror the form inputs:

- chunk size;
- overlap;
- cleanup ratio;
- embedding model;
- query volume;
- `top-k`;
- score threshold;
- hybrid semantic/text weights;
- retrieved chunk size;
- final model.

Edge labels should show what travels between nodes:

- tokens;
- chunks;
- vectors;
- retrieved context;
- generated output.

The diagram should explain the process and make assumptions easier to inspect.
The future backend calculation engine remains the source of math.

## Benchmark And Source Policy

Pricing and benchmarks may use primary sources plus curated notes. The product
spec is grounded by these reference categories:

- official retrieval/vector-store documentation, such as
  [OpenAI Retrieval docs](https://developers.openai.com/api/docs/guides/retrieval);
- official prompt-caching documentation, such as
  [OpenAI Prompt Caching docs](https://developers.openai.com/api/docs/guides/prompt-caching);
- official pricing pages, such as
  [OpenAI API Pricing](https://openai.com/api/pricing/).
- Text-to-SQL semantic-layer benchmark sources, such as
  [dbt LLM Semantic Layer Benchmark](https://dbt-labs.github.io/dbt-llm-sl-bench/),
  [dbt benchmark compare](https://dbt-labs.github.io/dbt-llm-sl-bench/compare/),
  [dbt repeated runs](https://dbt-labs.github.io/dbt-llm-sl-bench/repeated-runs/),
  [dbt historical results](https://dbt-labs.github.io/dbt-llm-sl-bench/historical/),
  [BIRD benchmark](https://bird-bench.github.io/),
  [BIRD paper](https://arxiv.org/abs/2305.03111), and
  [Denodo semantic-layer Text-to-SQL article](https://www.datamanagementblog.com/improving-the-accuracy-of-llm-based-text-to-sql-generation-with-a-semantic-layer-in-the-denodo-platform/).

Every benchmark or source entry should document:

- source URL;
- source date;
- provider or tool;
- dataset or scenario context;
- measured metric;
- assumptions;
- whether it is official, third-party, or internal/manual.

Real-life benchmark values must not be mixed silently with official pricing. The
UI and docs should distinguish pricing facts from benchmark assumptions.
Text-to-SQL accuracy values must also show metric definition and dataset/context
so users can tell whether a benchmark matches their domain.

## Future Follow-Up Views

These surfaces remain planned follow-ups and should not be treated as implemented
until separate runtime work starts:

- Embeddings Ingestion Calculator;
- Vector Query Cost Playground;
- End-to-End RAG Scenario Builder.

They may later split out of RAG Cost Lab if the unified surface becomes too dense
for real users. Their future implementations should follow the product boundary
in `README.md`, the UX rules in `DESIGN.md`, and the local ADRs in `docs/adr/`.
