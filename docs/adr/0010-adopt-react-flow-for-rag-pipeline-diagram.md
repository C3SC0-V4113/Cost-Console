# ADR 0010: Adopt React Flow for the RAG Pipeline Diagram

- Date: 2026-06-22
- Status: Accepted

## Context

ADR 0003 documented a nine-stage educational RAG pipeline but intentionally
left its visualization deferred. The RAG Cost Lab now has a backend-owned cost
engine and shared calculator state, so the same calculated result can be
explained as a graph without introducing a second source of economic logic.

A graph library adds meaningful client JavaScript. The diagram therefore needs
a strict boundary: it must not participate in server rendering or load for
users who remain on the calculator view.

## Decision Drivers

- Explain how documents, tokens, chunks, embeddings, retrieval, and generation
  move through the complete RAG pipeline.
- Preserve `lib/calc/rag-cost.ts` and the RAG server action as the only owners of
  cost and token derivation.
- Keep the RAG route server-first outside the existing calculator client island.
- Avoid charging the React Flow bundle cost until the user opens the diagram.
- Keep values regional, translated, and accessible without relying on color.

## Decision

Adopt `@xyflow/react` v12+ for a read-only, nine-stage RAG pipeline diagram.

The diagram is a client component loaded through `next/dynamic` with
`ssr: false`. The dynamic component is rendered only after the Pipeline tab is
selected. Its graph model is built by the pure, React-free
`buildRagPipeline(inputs, result)` function and contains only raw values copied
from `RagCalculatorInputs` and `RagCostResult`; it performs no economic math.

Nodes use localized titles, metric labels, values, and textual status badges.
Edges carry quantities from the existing result. Missing source-backed vector
storage pricing and unconfigured score thresholds are stated explicitly rather
than replaced with invented values.

The diagram is read-only in this phase. Editable nodes that write back to shared
calculator state and benchmark overlays remain future work.

## Consequences

### Positive

- Users can inspect the same RAG scenario as a form or an educational graph.
- Calculation ownership remains behind the server action and pure cost engine.
- React Flow stays out of server rendering and the initial calculator path.
- The pure graph mapping has deterministic unit coverage without attempting to
  emulate a canvas in jsdom.

### Negative

- The RAG diagram adds a browser-only runtime dependency when opened.
- Fixed node positions optimize explanation over user-directed layout.
- Editable graph interactions and persisted layouts require later design work.

## Related Decisions

- ADR 0001 defines the Cost Console product and backend calculation boundary.
- ADR 0003 defines the RAG stages and real retrieval-parameter terminology.
- `docs/product/rag-pipeline-diagram.md` specifies the implemented view and
  remaining future work.
