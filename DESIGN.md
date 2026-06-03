# Cost Console Design Standard

This document is the UI/UX source of truth for Cost Console. If implementation
details conflict with this file, prefer this standard and update the
implementation or document the decision in a local ADR.

## Design Principles

- Cost explainability first: users should see where spend comes from, not only a
  final total.
- Dense but calm: optimize for scanning, comparison, and repeated calculation
  work rather than a marketing-style landing page.
- Playground clarity: every calculator should expose assumptions, inputs,
  derived values, and output cost in a traceable flow.
- Strong hierarchy: primary cost drivers, scenario deltas, pricing freshness, and
  required actions outrank decorative content.
- Immediate feedback: loading, empty, error, stale, and partial-data states must
  be explicit and local to the affected panel or workflow.
- Consistency: equivalent controls, states, charts, tables, and scenario
  summaries use the same interaction and visual patterns.

## Visual System

- Use semantic tokens from `app/globals.css` (`background`, `foreground`, `card`,
  `muted`, `primary`, `destructive`, `border`, `ring`, chart tokens).
- Avoid hardcoded colors for business states unless adding a deliberate semantic
  token.
- Use shadcn/Tailwind conventions and keep component radius restrained; cards
  should stay at 8px radius or less unless a primitive already defines
  otherwise.
- Avoid one-note palettes. Cost Console should not become mostly purple, beige,
  dark blue/slate, or brown/orange.
- Reserve heading scale for page or panel structure; calculator panels, tables,
  and controls need compact, scannable typography.

## Layout Patterns

- Build the actual cost playground as the first screen; do not add a marketing
  landing page.
- Prefer a persistent application shell with clear navigation, page title,
  filters, scenario actions, and pricing/catalog status once the product surface
  exists.
- Keep information bands, calculators, comparisons, and tables full-width within
  a constrained content area; avoid page sections styled as floating cards.
- Use cards only for repeated metrics, panels, modals, and genuinely framed
  tools.
- Do not nest cards inside cards.
- Tables, charts, filters, calculators, token counters, and metric groups should
  have stable dimensions so hover, loading, and dynamic text do not shift layout.

## Cost-Domain UI Rules

- Split chat cost into input tokens, output tokens, and carried context tokens.
- Split RAG query cost into query embedding cost, retrieved context tokens, and
  final generative response cost.
- Keep embedding ingestion cost separate from recurring vector query cost.
- Show units for all numeric values: currency, percentage, token count, document
  count, chunk count, request count, time range, or rate.
- Make provider, model, capability, pricing snapshot, currency, and validity
  state visible wherever pricing drives a result.
- Distinguish actuals, estimates, forecasts, saved scenarios, and historical
  recalculations with labels, not color alone.
- Make dominant cost drivers actionable: show what changed, over what period or
  scenario, and the next available action.
- Empty states should state what data is missing: pricing, scenario inputs,
  saved snapshots, or persisted results.
- Error states should remain local to the failed panel or workflow unless the
  whole page cannot function.

## Playground Surfaces

- Chat Cost Playground should make message roles, history, current prompt,
  additional context, token counts, and per-turn/session cost visible together.
- Embeddings Ingestion Calculator should show document volume, chunking,
  overlap, cleanup assumptions, derived chunks, tokens to vectorize, requests,
  total cost, and unit cost.
- Vector Query Cost Playground should show query frequency, `top-k`, average
  chunk size, retrieval context, embedding cost, generation cost, and
  daily/monthly projections.
- End-to-End RAG Scenario Builder should compare complete architectures and show
  initial cost, recurring cost, expected monthly cost, and dominant cost drivers.
- Pricing Catalog should feel like an operational table: versioned pricing,
  validity, editable records, snapshots, and traceability are more important than
  decorative charts.

## Scenario And Traceability Rules

- Scenario comparison views must clearly label the baseline, variant, pricing
  snapshot, model choices, and changed assumptions.
- Saved scenarios need stable names, timestamps, and visible dirty/saved state.
- Historical recalculation must distinguish "using original pricing snapshot"
  from "using current pricing".
- Calculation results can be regenerated, but UI should preserve the trace from
  scenario inputs to pricing snapshot to result.
- Avoid mixing storage cost, retrieval cost, ingestion cost, and final generation
  cost into a single unlabeled bucket.

## Components And Controls

- Use icons in icon-only buttons and add accessible labels.
- Use info icons for technical labels that need concise definitions, especially
  prompt caching, cache hit rate, cached input, cache write, system prompt
  tokens, context tokens, token estimates, pricing snapshots, and source dates.
- Use helper subtitles when an info icon would hide critical context, such as
  whether a token estimate is approximate or whether a pricing row is manually
  entered from a source.
- Use segmented controls for modes, toggles/checkboxes for binary settings,
  inputs or sliders for numeric values, and menus for option sets.
- Prefer `lucide-react` icons when an icon is available.
- Keep buttons stable in width where labels can change.
- Do not use visible text to explain how to use standard controls; labels and
  state should make the interaction clear.

## Educational Helpers

- Prompt caching helper text should explain that cacheable prompt prefixes or
  repeated context may be priced differently by some providers when reused.
- Cache hit rate helper text should define it as the percentage of eligible
  prompt/context tokens expected to be billed as cached reads instead of regular
  input.
- Token estimate helper text should state that characters-per-token and page
  estimates are rough guidance, not exact billing math.
- A4-page estimates should be framed as approximate ranges and should not replace
  direct token counts when a tokenizer or exact usage is available.
- Educational copy must stay compact and close to the field or section it
  explains; do not add long instructional panels.

## Cost Summaries

- Cost summaries should show per-interaction, daily, monthly, and yearly totals
  when the scenario includes interaction volume.
- Summary line items should separate input, output, cached input, cache
  read/write where applicable, system prompt contribution, and carried
  context/history contribution.
- Day/month/year summaries must show the assumptions that produce them,
  including interactions per day, days per month, pricing snapshot, currency, and
  prompt cache hit percentage.
- If a provider lacks a cache-specific price, the summary should label cache
  pricing as unavailable or treated as regular input rather than silently
  applying a discount.

## Pricing Source Traceability

- Pricing rows should expose source URL, source date, effective date, snapshot,
  validity state, and notes when available.
- Manual entries are acceptable only when they still carry enough source metadata
  to explain where the price came from.
- Stale, missing, or manually entered pricing should be labeled with text, not
  only color.
- System prompt cost should be calculated from system prompt token buckets and
  the selected input/cache pricing; it should not be treated as a standalone
  catalog price by default.

## RAG And Vector Search Diagrams

- RAG diagrams should explain the pipeline as documents, chunking, embedding
  ingestion, vector index/storage, query embedding, retrieval/ranking, retrieved
  context, LLM generation, and response.
- Diagram labels must show what travels between nodes: tokens, chunks, vectors,
  retrieved context, and generated output.
- Editable diagram parameters should map to real retrieval assumptions such as
  chunk size, overlap, cleanup ratio, embedding model, query volume, `top-k`,
  score threshold, hybrid semantic/text weights, retrieved chunk size, and final
  model.
- Do not describe arbitrary "DB weights" unless they map to a documented
  retrieval or ranking parameter.
- If a future React Flow-style diagram is used, it should mirror form inputs and
  explain the process; backend calculation logic remains the source of math.

## RAG Benchmark And Source Labels

- Benchmark and pricing source labels should distinguish official pricing,
  official docs, third-party benchmarks, and internal/manual assumptions.
- Each benchmark/source entry should show source URL, source date,
  provider/tool, dataset or scenario context, measured metric, assumptions, and
  source type.
- Real-life benchmark values must not be mixed silently with official pricing.
- RAG infrastructure or vector-store storage cost should be optional and
  source-backed; unknown storage pricing should not block token and embedding
  cost estimates.
- Cost labels must keep embedding ingestion cost, query embedding cost,
  retrieved-context LLM input cost, final LLM output cost, and vector storage
  cost visibly separate.

## Text-to-SQL Accuracy And Semantic Layer Rules

- Text-to-SQL views should compare raw Text-to-SQL, Text-to-SQL with a semantic
  layer, and Text-to-SQL with a semantic layer plus validation or retry loops.
- Accuracy must be labeled as benchmark- and scenario-dependent, never as a
  universal model property.
- Accuracy labels should show metric type, benchmark preset, source date,
  provider/model, dataset or scenario context, and whether values are official,
  third-party, or manual.
- Semantic-layer helper text should explain whether the layer constrains SQL
  generation, provides business metadata, or generates governed metric queries
  itself.
- Text-to-SQL cost summaries should separate question/input tokens,
  schema/context tokens, semantic-layer context tokens, SQL output tokens,
  validation/retry tokens, cached input when applicable, and optional warehouse
  execution cost.
- Warehouse or database execution cost is optional and must be source-backed. If
  unknown, label it as unavailable instead of inventing a value.
- The UI should make the tradeoff visible: semantic layers may add context/token
  cost while improving accuracy, reducing silent wrong answers, or failing
  loudly when a question is not answerable.

## Data Display

- Tables are the default for pricing catalogs, saved scenarios, provider/model
  breakdowns, and audit-like views.
- Charts should answer one comparison question at a time; avoid decorative
  charts.
- Every chart must have readable axes or labels, a time range or scenario scope,
  and a clear empty/error/loading state.
- Use color plus text, icon, or pattern to communicate severity for
  accessibility.
- Avoid truncating critical values such as currency, dates, provider/model names,
  snapshot names, and project/account names without tooltip or expanded view.

## Accessibility

- All interactive elements need visible focus states.
- Keyboard navigation must work for primary workflows.
- Color contrast must hold in light and dark themes.
- Icon-only controls require `aria-label`.
- Dynamic cost changes should not rely on color alone.

## Motion

- Use subtle transitions for hover, focus, disclosure, and loading states.
- Avoid complex motion unless it clarifies a cost workflow.
- Respect reduced-motion preferences when adding non-trivial animation.

## Do / Don't

Do:

- Use semantic tokens and existing variants.
- Keep playground surfaces compact and scannable.
- Keep server-first boundaries and client islands minimal.
- Make token, RAG, pricing, and scenario states measurable, labeled, and
  actionable.

Don't:

- Add a landing-page hero for the app shell.
- Add decorative blobs, gradient orbs, or ornamental chart-like visuals.
- Hide business state behind color-only badges.
- Collapse distinct cost stages into one unexplained number.
- Put complex state logic directly inside repeated JSX markup when a component or
  helper would clarify it.
