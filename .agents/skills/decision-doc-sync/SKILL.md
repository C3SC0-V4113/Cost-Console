---
name: decision-doc-sync
description: Keep Cost Console documentation synchronized when structural architecture, UI/UX, quality-gate, or cross-cutting project conventions change.
---

# Decision Documentation Sync

Use this skill when a change includes a structural decision.

## Trigger

Apply when changing:

- component or application architecture,
- UI/UX standards,
- global behavior contracts,
- quality gates, hooks, or CI policy,
- cross-cutting project conventions.

Do not use for minor fixes without structural impact.

## Sync Rule

If there was a structural decision, review and update the affected docs:

1. `README.md` for architecture, scripts, and implementation contracts.
2. `DESIGN.md` for visual and UX standards.
3. `AGENTS.md` for operational guidance and skill references.
4. `docs/adr/` if the decision needs durable context, decision, and consequence tracking.

## Pre-Close Checklist

- Was there a structural decision?
- Do `README.md` and `DESIGN.md` reflect it?
- Does `AGENTS.md` link to the right source instead of duplicating long policy?
- Is an ADR needed for future maintainers?
