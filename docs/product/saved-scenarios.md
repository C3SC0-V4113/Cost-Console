# Saved Scenarios (Evolutionary Feature)

This document specifies a planned-but-deferred feature. It is not implemented in
the current phase. The Chat Cost view ships with a disabled "Saved scenarios"
scaffold (`components/chat/saved-scenarios.tsx`) that points here.

## Status

Deferred. Scenario persistence is intentionally blocked until ownership and
privacy rules are defined. ADR 0007 states that authenticated `user` members may
use the playground but may not persist scenarios; the persistence backend is also
pending.

## Intent

Let users save a configured cost scenario (model, token buckets, volume, prompt
caching, pricing snapshot) so it can be reopened, duplicated, compared against
current inputs, and recalculated against its original or a newer pricing snapshot.

The persistence contract already reserves the data model for this in
`docs/data/database.md`: `scenario` plus the `chat_cost_scenario` subtype, and
immutable `calculation_result` / `calculation_line_item` records.

## Open Decisions (must be resolved before implementation)

- Who may persist scenarios? ADR 0007 currently blocks `user`-level persistence.
- Are saved scenarios private by default, project-shared, or shareable templates?
- Does editing a saved scenario mutate it or create a new version?
- How are stale or missing pricing snapshots surfaced when reopening a scenario?

## Planned Scenario Fields (from views.md)

scenario name, provider, model, pricing snapshot, daily interactions, days per
month, prompt cache hit percentage, monthly cost, yearly cost, last updated.

## Planned Actions

save, duplicate, compare against current inputs, identify stale or missing pricing.

## Related

- `docs/product/views.md` — Saved Scenarios section.
- `docs/data/database.md` — `scenario`, `chat_cost_scenario`, `calculation_result`.
- `docs/adr/0007-adopt-identity-service-login-and-admin-managed-pricing-snapshots.md`.
