<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Agent Quality Gates

These checks are mandatory for any agent making code or configuration changes in this repository.

### Required Local Validation

1. Run `cmd /c npm run lint`.
2. Run `cmd /c npm run typecheck`.
3. Run `cmd /c npm run format:check`.
4. Run `cmd /c npm run test`.
5. Run `cmd /c npm run doctor`.
6. Run `cmd /c npm run check` as the final gate.

Use `cmd /c npm ...` on Windows because PowerShell may block the `npm.ps1` wrapper.

### Next.js Linting Rule

- Do not use `next lint`.
- Use ESLint CLI only (`npm run lint` / `npm run lint:fix`) because this project is on Next.js 16.

### Scope and Exceptions

- If only documentation changed, run at least `cmd /c npm run format:check`.
- If dependencies or tooling config changed, run `cmd /c npm install` before validation.
- `npm run check` includes React Doctor CI policy; React Doctor warnings are blocking.
- If any required command cannot run, report the exact command, exact error, and what remains unverified.

### Hooks and CI Enforcement

- `pre-commit` runs `npx lint-staged` and `npm run doctor:staged`.
- `pre-push` runs `npm run check`.
- CI (`.github/workflows/quality.yml`) runs `npm run check` on push and pull request.
- Playwright CI remains separate E2E protection.
- Claude runs a close-task hook for `project-min-evaluation`; other agents must invoke it manually before claiming completion.

## Project References

- Product definition, architecture target, current app shape, and scripts: `README.md`
- UI/UX standard and visual rules: `DESIGN.md`
- Local Architecture Decision Records: `docs/adr/`
- Upstream portfolio documentation: `E:\Repositorios\platform-ai-architecture`
- Upstream Cost Console project sheet: `E:\Repositorios\platform-ai-architecture\docs\projects\cost-console.md`
- Upstream portfolio ADR for this project: `E:\Repositorios\platform-ai-architecture\docs\adr\0007-define-cost-console-as-token-and-rag-cost-playground.md`
- Project architecture guardrails: `.agents/skills/project-architecture/SKILL.md`
- Minimum completion verification: `.agents/skills/project-min-evaluation/SKILL.md`
- Decision documentation sync: `.agents/skills/decision-doc-sync/SKILL.md`
- Next.js 16 guidance: `.agents/skills/next-best-practices/SKILL.md`

## Source-of-Truth Hierarchy

For local Cost Console implementation work, resolve conflicts in this order:

1. `DESIGN.md` for UI/UX rules.
2. `README.md` for local product architecture and implementation contracts.
3. `docs/adr/` for accepted local architectural decisions.
4. `AGENTS.md` for operating workflow.
5. `E:\Repositorios\platform-ai-architecture` for upstream portfolio context.

The upstream portfolio repo remains the source for portfolio-wide context. This repository owns the local product contract and implementation decisions.

Before changing structural product scope, read the local `README.md`, `DESIGN.md`, local ADRs, and the relevant upstream portfolio docs. Do not convert Cost Console into an inference gateway, static calculator, generic admin dashboard, identity service, canonical asset store, or canonical RAG corpus unless a new ADR supersedes the current decision.

## Product Boundary

Cost Console is a fullstack analytical playground for chat, embedding ingestion, vector query, and end-to-end RAG cost modeling.

The first phase must be useful without `auth-service`, `ai-gateway`, or `knowledge-rag`. Future integrations may consume Cost Console calculations or add multi-user/private exposure, but the local calculation engine, pricing traceability, saved scenarios, and PostgreSQL-backed persistence remain the center of this project.

The UI must not duplicate economic calculation logic that belongs to the backend. Internal APIs should own scenarios, pricing catalogs, snapshots, and calculation results when those features are implemented.

## Claude Code Compatibility

This repo follows the generic agent standard (`AGENTS.md` + `.agents/skills/`) while staying compatible with Claude Code.

- `CLAUDE.md` is a pointer (`@AGENTS.md`). Claude Code auto-loads `CLAUDE.md` and imports this file.
- `.claude/skills` is a symlink or junction to `.agents/skills`, which is the single source of truth.
- Edit skills only under `.agents/skills/`; new skills are exposed to Claude through the bridge.
- Windows fallback if symlinks are not available:
  `cmd /c mklink /J .claude\skills .agents\skills`

## Skill Invocation Checklist

Reference hierarchy for conflicts:

1. `DESIGN.md` for UI/UX rules.
2. `README.md` for architecture and current app contracts.
3. `docs/adr/` for accepted local structural decisions.
4. `AGENTS.md` for operating workflow.

### Trigger Map

- `project-architecture`
  - Trigger on UI, component architecture, layout, dashboard state, data display patterns, or theming changes.
- `next-best-practices`
  - Trigger on Next.js 16 conventions: RSC boundaries, App Router files, route handlers, async APIs, metadata, data fetching, images, fonts, scripts, and runtime choices.
- `systematic-debugging`
  - Trigger on bugs, failing checks, unexpected behavior, or build/test/lint/typecheck/doctor failures before proposing fixes.
- `vercel-composition-patterns`
  - Trigger on compound components, composable APIs, provider patterns, or refactors that reduce prop complexity.
- `vercel-react-best-practices`
  - Trigger on React/Next performance concerns: re-renders, bundle size, server/client boundaries, and rendering patterns.
- `typescript-advanced-types`
  - Trigger on custom hooks, reducers/actions, discriminated unions, context values/providers, and reusable generic utilities.
- `shadcn`
  - Trigger on UI component work using shadcn patterns, styling rules, registries, or CLI-driven component updates.
- `decision-doc-sync`
  - Trigger when there are structural decisions in architecture, contracts, UX standards, or project conventions.
- `architecture-decision-records`
  - Trigger when creating, updating, superseding, or reviewing ADRs for significant technical decisions.
- `verification-before-completion`
  - Trigger before claiming work is complete, fixed, or passing.
- `project-min-evaluation`
  - Trigger at implementation close before declaring completion; it is the source of truth for exact project commands.

### Recommended Invocation Order

- New dashboard or playground feature:
  - `project-architecture` -> `next-best-practices` -> `shadcn` -> `vercel-react-best-practices` -> `project-min-evaluation`
- Component or state refactor:
  - `project-architecture` -> `typescript-advanced-types` -> `vercel-composition-patterns` -> `project-min-evaluation`
- Debugging or failing validation:
  - `systematic-debugging` -> relevant domain skill -> `verification-before-completion` -> `project-min-evaluation`
- Structural decision:
  - relevant domain flow -> `decision-doc-sync`; use `architecture-decision-records` if an ADR is needed.

## Local ADR Usage

- Local ADRs live under `docs/adr/`.
- Use `NNNN-short-title.md` file names with four-digit numbering.
- Keep accepted ADRs stable; if a decision changes, create a new ADR that supersedes the old one instead of rewriting history.
- Reference upstream portfolio ADRs when local decisions adopt or refine portfolio-wide decisions.
- Use local ADRs for product boundary, persistence, backend/API ownership, integration timing, quality policy, and other decisions future maintainers need to understand.

## Documentation Sync Guardrail

- Keep `CLAUDE.md` as a pointer to `AGENTS.md`; do not duplicate policy blocks.
- Do not copy UI rules from `DESIGN.md` into `AGENTS.md`; link instead.
- Do not copy architecture contracts from `README.md` into `AGENTS.md`; link instead.
- Do not copy the upstream portfolio repo wholesale into local docs; summarize what is needed and reference the upstream files.
- When structural conventions change, update docs and ADRs through `decision-doc-sync`.
