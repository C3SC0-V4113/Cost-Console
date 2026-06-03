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
- Use segmented controls for modes, toggles/checkboxes for binary settings,
  inputs or sliders for numeric values, and menus for option sets.
- Prefer `lucide-react` icons when an icon is available.
- Keep buttons stable in width where labels can change.
- Do not use visible text to explain how to use standard controls; labels and
  state should make the interaction clear.

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
