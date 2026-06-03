# ADR 0003: Define RAG Cost Lab Documentation

- Date: 2026-06-03
- Status: Accepted

## Context

ADR 0001 defines Cost Console as a playground for token and RAG cost modeling.
ADR 0002 documents the first view model around Pricing Catalog and a unified Chat
Cost Playground, while leaving Embeddings, Vector Query, and RAG Scenarios as
future placeholders.

The product must still explicitly cover four core requirements:

- estimate chat token cost for OpenAI APIs and other models;
- calculate input tokens, output tokens, and context tokens that travel in each
  call;
- calculate tokens consumed when creating embeddings for initial vector database
  ingestion;
- calculate tokens consumed when embedding each vector database query, because
  embeddings are used both during initial load and during retrieval-time queries.

The user proposed an interactive React Flow-style diagram to simulate a RAG
database and assign different "weights" to parts of the process. The technical
decision is to document that idea as a pipeline explanation with real retrieval
parameters, not arbitrary database weights.

## Decision Drivers

- Keep this phase strictly documentation-only.
- Make embedding ingestion and vector query token consumption explicit.
- Avoid misleading RAG simulations that imply arbitrary weights inside a vector
  database.
- Support an educational diagram while preserving backend-owned calculation
  logic for future implementation.
- Require benchmark and source metadata for pricing, storage, retrieval, and
  real-life assumptions.

## Decision

Cost Console will document one unified `RAG Cost Lab` surface in
`docs/product/views.md`.

The documented RAG Cost Lab covers:

- ingestion setup;
- vector index assumptions;
- query workload;
- retrieval configuration;
- an explanatory and editable pipeline diagram concept;
- benchmark and source notes;
- cost summaries for one-time ingestion, per-query embedding, retrieved-context
  LLM input, final output, daily/monthly/yearly query cost, and optional vector
  storage cost.

The planned RAG flow is:

1. source documents;
2. chunking;
3. embedding ingestion;
4. vector index or storage;
5. query embedding;
6. vector or hybrid search;
7. retrieved chunks;
8. LLM context;
9. generated output.

The React Flow-style diagram is documentation only. This ADR does not add React
Flow, runtime dependencies, routes, components, APIs, database schemas,
TypeScript types, calculation helpers, tests, or persistence.

"Weights" in this context means actual retrieval and scoring parameters such as
`top-k`, score threshold, chunk sizing, overlap, cleanup ratio, and hybrid
semantic/text weighting. It does not mean arbitrary weights assigned to a RAG
database.

Benchmarks and source-backed assumptions must include source URL, source date,
provider/tool, dataset or scenario context, measured metric, assumptions, and
source type: official, third-party, or internal/manual.

## Consequences

### Positive

- The documentation now covers chat tokens, embedding ingestion tokens, vector
  query embedding tokens, retrieved context, and final LLM generation cost.
- Future implementers get a more accurate RAG process model.
- The diagram concept can teach the flow without committing to a dependency.
- Benchmarks and pricing facts remain traceable instead of being blended into
  opaque assumptions.

### Negative

- The unified RAG Cost Lab may become dense and may need to split into separate
  views after user testing.
- Exact benchmark datasets, values, and provider-specific storage pricing remain
  future implementation choices.
- Future implementation still needs API, persistence, calculation, and UI design
  decisions.

## Related Decisions

- ADR 0001 defines the Cost Console product boundary.
- ADR 0002 defines the initial view model documentation.
- `docs/product/views.md` contains the RAG Cost Lab view contract.

## References

- [OpenAI Retrieval docs](https://developers.openai.com/api/docs/guides/retrieval)
- [OpenAI Prompt Caching docs](https://developers.openai.com/api/docs/guides/prompt-caching)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
