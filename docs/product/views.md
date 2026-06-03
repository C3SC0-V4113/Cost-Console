# Cost Console Planned Views

This document defines the intended first application views for Cost Console. It
is a product and view contract only. It does not implement routes, components,
APIs, schemas, TypeScript types, calculation helpers, tests, or database tables.

## View Principles

- The app should open into a usable cost playground, not a marketing landing
  page.
- The first implementation target is one unified Chat Cost Playground supported
  by a Pricing Catalog.
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

## Future Placeholder Views

These surfaces remain planned follow-ups and should not be treated as implemented
until separate runtime work starts:

- Embeddings Ingestion Calculator;
- Vector Query Cost Playground;
- End-to-End RAG Scenario Builder.

Their future implementations should follow the product boundary in `README.md`,
the UX rules in `DESIGN.md`, and the local ADRs in `docs/adr/`.
