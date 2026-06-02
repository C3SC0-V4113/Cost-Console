---
name: project-architecture
description: Cost Console architecture and design guardrails. Use when changing UI, component architecture, dashboard layout, state flow, data display, theming, or Next.js server/client boundaries in this repository.
---

# Project Architecture Guardrails

Use this skill when a change touches UI, component architecture, dashboard behavior, layout, theming, or data display.

## Required Rules

1. Keep the app server-first:
   - Server Components by default.
   - Use `"use client"` only for state, events, effects, browser APIs, or client-only libraries.
2. Follow Next.js 16 rules:
   - Read the relevant guide in `node_modules/next/dist/docs/` before changing framework APIs.
   - Use `.agents/skills/next-best-practices/SKILL.md` for RSC boundaries, file conventions, async APIs, metadata, route handlers, and runtime choices.
3. Keep dashboard UI operational:
   - Build the real console surface, not a marketing landing page.
   - Use dense, scannable layouts for cost, usage, variance, filters, and actions.
   - Keep data states explicit: loading, empty, error, stale, and partial data.
4. Preserve the design source of truth:
   - `DESIGN.md` controls UI/UX decisions.
   - Use semantic tokens from `app/globals.css`.
   - Avoid hardcoded business-state colors unless adding a semantic token.
5. Keep shadcn primitives reusable:
   - Put shared primitives in `components/ui`.
   - Avoid one-off variants inside route files when the pattern will repeat.
6. Keep tests close to risk:
   - Unit or component tests for business logic and reusable components.
   - Playwright for real user flows and async Server Component behavior that Vitest cannot model well.

## Pre-Close Checklist

- Did the change increase client-side surface unnecessarily?
- Does it respect `DESIGN.md`?
- Are cost values labeled with units, period, and context?
- Are loading, empty, and error states local and actionable?
- Are reusable patterns extracted before they become duplicated?
- Did you run `.agents/skills/project-min-evaluation/SKILL.md` before claiming completion?

## References

- Architecture summary: `README.md`
- Design standard: `DESIGN.md`
- Next.js rules: `.agents/skills/next-best-practices/SKILL.md`
- Minimum evaluation: `.agents/skills/project-min-evaluation/SKILL.md`
- Decision sync: `.agents/skills/decision-doc-sync/SKILL.md`
