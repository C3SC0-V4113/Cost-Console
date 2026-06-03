# ADR 0002: Define Initial View Model Documentation

- Date: 2026-06-03
- Status: Accepted

## Context

ADR 0001 defines Cost Console as a fullstack analytical playground for token and
RAG cost modeling. Before implementing routes, components, APIs, schemas, or a
calculation engine, the project needs a local view specification that describes
the first product surfaces and their information architecture.

The user proposed two near-term surfaces:

- a provider/model pricing table with input, output, cache, source, and other
  important pricing fields;
- a more complex calculator for daily interactions, days per month, prompt
  caching, explicit token buckets, explanatory helpers, and day/month/year cost
  summaries.

The phrase "prompt catching" is treated as "prompt caching" for this decision.

## Decision Drivers

- Keep this phase strictly documentation-only.
- Prioritize a small number of first surfaces instead of documenting every
  future calculator equally.
- Preserve pricing source traceability.
- Make prompt caching and token estimates understandable without large
  instructional panels.
- Keep calculation ownership in the future backend rather than the UI.

## Decision

The initial view model is documented in `docs/product/views.md`.

The first documented surfaces are:

- an application shell that opens into a usable cost playground;
- a Pricing Catalog for provider, model, token price, cache price, and source
  traceability;
- one unified Chat Cost Playground for interaction volume, token inputs, prompt
  caching, educational helpers, cost summaries, and saved scenarios.

The future Embeddings, Vector Query, and RAG Scenario views remain documented as
placeholder surfaces only.

This ADR is documentation-only. It does not authorize or implement runtime
changes, routes, components, APIs, database schemas, TypeScript types,
calculation helpers, tests, or persistence.

## Consequences

### Positive

- Future UI implementation has a clear view contract.
- The product can start with the two highest-signal surfaces: pricing and chat
  cost calculation.
- Prompt caching, source metadata, token estimates, and summary rollups are
  defined before implementation choices are made.
- Runtime scope remains untouched until a separate implementation plan exists.

### Negative

- The documented view model may need refinement when real provider pricing
  differences are added.
- Exact educational copy and token/page ranges remain implementation-time
  details.
- Future implementation still needs API, persistence, and calculation design.

## Related Decisions

- ADR 0001 defines the product boundary for Cost Console.
- `docs/product/views.md` contains the view specification created by this
  decision.
