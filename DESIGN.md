# Cost Console Design Standard

This document is the UI/UX source of truth for Cost Console. If implementation details conflict with this file, prefer this standard and update the implementation or document the decision.

## Design Principles

- Operational clarity first: users should understand spend, usage, variance, and risk without reading explanatory copy.
- Dense but calm: optimize for scanning, comparison, and repeated work rather than a marketing-style landing page.
- Strong hierarchy: primary cost signals, anomalies, and required actions outrank decorative content.
- Immediate feedback: loading, empty, error, stale, and partial-data states must be explicit.
- Consistency: equivalent controls, states, charts, and tables use the same interaction and visual patterns.

## Visual System

- Use semantic tokens from `app/globals.css` (`background`, `foreground`, `card`, `muted`, `primary`, `destructive`, `border`, `ring`, chart tokens).
- Avoid hardcoded colors for business states unless adding a deliberate semantic token.
- Use shadcn/Tailwind conventions and keep component radius restrained; cards should stay at 8px radius or less unless a primitive already defines otherwise.
- Avoid one-note palettes. Cost Console should not become mostly purple, beige, dark blue/slate, or brown/orange.
- Reserve heading scale for page or panel structure; dashboard cards and controls need compact, scannable typography.

## Layout Patterns

- Build the actual console as the first screen; do not add a marketing landing page.
- Prefer a persistent application shell with clear navigation, page title, filters, and action area once the product surface exists.
- Keep information bands and dashboards full-width within a constrained content area; avoid page sections styled as floating cards.
- Use cards only for repeated metrics, panels, modals, and genuinely framed tools.
- Do not nest cards inside cards.
- Tables, charts, filters, and metric groups should have stable dimensions so hover, loading, and dynamic text do not shift layout.

## Cost-Domain UI Rules

- Make the primary cost period, comparison period, variance, and currency visible wherever a cost metric is shown.
- Distinguish actuals, forecasts, budgets, and commitments with labels, not color alone.
- Show units for all numeric values: currency, percentage, count, time range, or rate.
- Make anomalies and threshold breaches actionable: show what changed, over what period, and the next available action.
- Empty states should state what data is missing and what connects or creates it.
- Error states should remain local to the failed panel or workflow unless the whole page cannot function.

## Components and Controls

- Use icons in icon-only buttons and add accessible labels.
- Use segmented controls for modes, toggles/checkboxes for binary settings, inputs or sliders for numeric values, and menus for option sets.
- Prefer `lucide-react` icons when an icon is available.
- Keep buttons stable in width where labels can change.
- Do not use visible text to explain how to use standard controls; labels and state should make the interaction clear.

## Data Display

- Tables are the default for detailed cost records, vendor/service breakdowns, and audit-like views.
- Charts should answer one comparison question at a time; avoid decorative charts.
- Every chart must have readable axes or labels, a time range, and a clear empty/error/loading state.
- Use color plus text, icon, or pattern to communicate severity for accessibility.
- Avoid truncating critical values such as currency, dates, and account/project names without tooltip or expanded view.

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
- Keep dashboard surfaces compact and scannable.
- Keep server-first boundaries and client islands minimal.
- Make cost states measurable, labeled, and actionable.

Don't:

- Add a landing-page hero for the app shell.
- Add decorative blobs, gradient orbs, or ornamental chart-like visuals.
- Hide business state behind color-only badges.
- Put complex state logic directly inside repeated JSX markup when a component or helper would clarify it.
