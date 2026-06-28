# RAG Pipeline Diagram (Evolutionary Spec)

Status: Implemented in Phase 7 (2026-06-22).

This document specifies the optional, educational pipeline diagram for the RAG
Cost Lab. It is a **future** enhancement layered on top of the shipped cost
engine and form. It does not change the product boundary or the
backend-owned calculation contract (see `AGENTS.md`, ADR 0001, ADR 0003).

## Intent

Teach the RAG flow visually and let users see how their form inputs map onto
real pipeline stages. The diagram is an alternative _view_ of the same inputs the
form already drives — never a second source of truth for cost.

## Hard constraints

- **Documentation/education only.** The diagram never computes cost. All math
  stays in `lib/calc/rag-cost.ts` and the server action (`UI must not duplicate
calculation logic`).
- **"Weights" means real retrieval parameters**, not arbitrary database weights
  (ADR 0003): `top-k`, score threshold, chunk size, chunk overlap, cleanup
  retention, and hybrid semantic/text weighting.
- **React Flow remains a client-only view dependency.** It is lazy-loaded only
  after the Pipeline tab is selected and never participates in server rendering.

## Pipeline stages (nodes)

Mirrors the ADR 0003 flow, one node per stage:

1. source documents — `documentCount`, `avgDocumentTokens`
2. chunking — `chunkSize`, `chunkOverlap`, `cleanupRetentionPercentage`
3. embedding ingestion — ingestion embedding model, one-time cost
4. vector index / storage — optional, source-backed storage cost
5. query embedding — query embedding model, per-query cost
6. vector / hybrid search — `topK`, score threshold, hybrid weights
7. retrieved chunks — `avgRetrievedChunkTokens` × `topK`
8. LLM context — `systemPromptTokens` + question + retrieved context
9. generated output — `expectedOutputTokens`

Edges carry the token quantity flowing between stages (e.g. retrieved chunks →
LLM context shows `retrievedContextTokens`), pulled from the existing
`RagCostResult`, not recomputed.

## Implemented architecture

- Render with `next/dynamic` and `ssr: false` — React Flow needs the DOM and must
  not run during server rendering or bloat the server bundle.
- Scope the dynamic import to a tab/section inside the RAG route only, so the
  diagram bundle never loads for users who stay on the form.
- Drive every node label and edge value from the `RagCostResult` already returned
  by the server action and the shared `RagCalculatorInputs` state. The current
  diagram is read-only: one input model, two views, with no duplicated cost math.
- Keep node colors paired with text labels (accessibility; not color alone),
  consistent with `DESIGN.md` and the catalog freshness/validity treatment.

## Remaining future work

- Editable nodes that write back to the shared calculator state.
- Persistence of diagram layouts (depends on the deferred Saved Scenarios work,
  see `docs/product/saved-scenarios.md`).
- Benchmark overlays (MTEB/BEIR retrieval-quality metrics) — these are quality
  signals, not cost, and require cited seed data before surfacing.
