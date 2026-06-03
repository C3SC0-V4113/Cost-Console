# ADR 0001: Define Cost Console as Token and RAG Cost Playground

- Date: 2026-06-03
- Status: Accepted

## Context

The upstream portfolio documentation defines Cost Console as the project for the
cost-intelligence capability in `E:\Repositorios\platform-ai-architecture`.
Platform ADR 0007 closes the portfolio-level decision: Cost Console should model
chat, embedding ingestion, vector query, and end-to-end RAG costs, and should not
start as a generic cost dashboard or static calculator.

The local repository currently contains a small Next.js starter application with
strict quality gates but no real product surface, backend API, database schema,
or calculation engine. The local docs need to make the target product boundary
clear before implementation starts.

## Decision Drivers

- Align local implementation with the upstream portfolio decision.
- Keep Cost Console focused on token and RAG cost modeling.
- Avoid building a static UI that duplicates calculation logic in the browser.
- Preserve traceability for pricing, scenarios, snapshots, and calculation
  results.
- Keep the first phase demonstrable without waiting for `auth-service`,
  `ai-gateway`, or `knowledge-rag`.

## Decision

Cost Console is a fullstack analytical playground for AI cost modeling.

The first implementation phase must cover these product areas:

- chat cost split by input tokens, output tokens, and carried context;
- embedding ingestion cost for initial document or chunk loads;
- recurring vector query cost, including query embeddings, retrieved context,
  and final generative response cost;
- end-to-end RAG scenario comparison across ingestion, retrieval, generation,
  and expected recurring usage;
- pricing catalog management with snapshots or versions that can explain past
  calculations.

Cost Console must include backend-owned calculation logic. The UI may collect
inputs, display assumptions, and render results, but it must not become the owner
of economic calculation rules that should live behind an internal application
API.

Cost Console must use PostgreSQL-backed persistence when product data is
implemented. The minimum persistent domains are pricing catalogs, pricing
snapshots, chat cost scenarios, embedding ingestion scenarios, vector query
scenarios, RAG architecture scenarios, calculation results, and project scope for
future auth integration.

Cost Console does not store master identity, canonical assets, or the canonical
RAG corpus. It must not become an inference gateway or provider-routing
control-plane.

## Consequences

### Positive

- The repository has a clear local product boundary before feature work starts.
- The first useful version can be demonstrated without external service
  dependencies.
- Backend-owned calculation logic and PostgreSQL persistence reduce the risk of a
  throwaway calculator.
- Pricing snapshots and saved scenarios create traceability for historical and
  comparative results.

### Negative

- The first real feature work will require backend/API and persistence design,
  not only UI composition.
- PostgreSQL and future Prisma adoption add operational setup earlier than a
  static calculator would.
- The playground framing requires discipline to keep comparisons focused on
  token, embedding, and RAG cost rather than unrelated admin dashboard features.

## Implementation Notes

- Expected views are Chat Cost Playground, Embeddings Ingestion Calculator,
  Vector Query Cost Playground, End-to-End RAG Scenario Builder, and Pricing
  Catalog.
- Calculation results may be regenerated, but scenarios, pricing snapshots,
  presets, rules, and traceability records must persist.
- Future `auth-service` integration may add private or multi-user exposure, but
  it is not required for the calculation engine.
- Future `ai-gateway`, `openclaw-ops`, or `other-gpt` integrations may consume
  Cost Console outputs, but they do not own this project's core product boundary.

## Related Decisions

- Upstream platform ADR 0007:
  `E:\Repositorios\platform-ai-architecture\docs\adr\0007-define-cost-console-as-token-and-rag-cost-playground.md`
- Upstream Cost Console project sheet:
  `E:\Repositorios\platform-ai-architecture\docs\projects\cost-console.md`
