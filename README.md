# Cost Console

Cost Console is a fullstack analytical playground for modeling the cost of AI
chat, embedding ingestion, vector queries, and end-to-end RAG architectures. It
is the product implementation of the portfolio's cost-intelligence capability:
make token and RAG costs visible before other services are built or integrated.

The upstream portfolio source of truth is
`E:\Repositorios\platform-ai-architecture`, especially
`docs/projects/cost-console.md` and platform ADR 0007. This repository keeps the
local implementation contract and product-specific ADRs.

## Product Definition

Cost Console is not a static calculator, an admin dashboard first, or an
inference gateway. The first product phase must be useful by itself and must not
depend on `auth-service`, `ai-gateway`, or `knowledge-rag` to demonstrate value.

The core product must make these costs explicit:

- chat cost split by input tokens, output tokens, and carried context;
- embedding ingestion cost for initial document or chunk loads;
- recurring vector query cost, including query embeddings, retrieved context,
  and the final generative model call;
- complete RAG scenario cost across ingestion, retrieval, generation, and
  recurring usage.

## Architecture Target

- Framework: Next.js 16 App Router with React 19 and TypeScript.
- Styling: Tailwind CSS v4, shadcn UI conventions, and semantic CSS tokens in
  `app/globals.css`.
- Backend: internal application API that owns calculation logic for scenarios,
  catalogs, and results.
- Persistence: PostgreSQL from the start, with Prisma expected for future data
  access.
- Components: shared UI primitives live under `components/ui`; reusable
  application logic should stay outside route files when it grows beyond simple
  composition.
- Server-first default: `app/layout.tsx` and route components should stay Server
  Components unless state, browser APIs, or event handlers require a client
  island.
- React Scan: loaded only in development from `app/layout.tsx`.

The UI must not duplicate economic calculation logic that belongs to the
backend. Calculation inputs, pricing catalogs, snapshots, scenarios, and
calculation results should flow through the internal backend contract.

## Expected Product Surfaces

### Chat Cost Playground

Estimate request and session cost with provider/model selection, message editing,
input/output/context token breakdowns, per-call and per-session cost, model
comparison, scenario save/duplicate behavior, and an explanation of how carried
history changes cost over turns.

### Embeddings Ingestion Calculator

Estimate the cost of vectorizing an initial document load with document volume,
chunk size, overlap, cleanup assumptions, embedding model selection, derived
chunk/token/request counts, total cost, unit cost, saved presets, and model
comparison.

### Vector Query Cost Playground

Estimate recurring RAG query cost with query size, query frequency, `top-k`,
average retrieved chunk size, query embedding cost, retrieved context tokens,
final response cost, per-query/daily/monthly projections, and comparison between
dense and cheaper retrieval strategies.

### End-to-End RAG Scenario Builder

Compare complete RAG architecture scenarios across ingestion volume, chunking,
embedding model, query pattern, final generative model, initial cost, per-query
cost, expected monthly cost, and dominant cost drivers.

### Pricing Catalog

Administer pricing used by the calculation engine with provider/model/capability
tables, snapshots or versions, validity state, record editing, historical
recalculation support, and traceability for which prices fed each simulation.

## Persistence Contract

The minimum persistent domains are:

- `pricing_catalog`;
- `pricing_snapshot`;
- `chat_cost_scenario`;
- `embedding_ingestion_scenario`;
- `vector_query_scenario`;
- `rag_architecture_scenario`;
- `calculation_result`;
- `recommendation_rule` if recommendation or scoring rules are added later;
- `project_scope` for future auth integration.

Calculation results may be regenerated, but scenarios, pricing snapshots,
presets, rules, and traceability records must be persisted.

Cost Console must not store master identity, canonical assets, or the canonical
RAG corpus. Future integrations may consume or enrich its outputs, but they do
not define the first-phase product boundary.

## Current Implementation State

- `app/layout.tsx` defines metadata, fonts, root HTML/body structure, and the
  development React Scan script.
- `app/page.tsx` is still a starter page and should be replaced by the first real
  Cost Console playground surface.
- `components/ui/button.tsx` contains the current shadcn-style button primitive.
- `tests/unit/home-page.smoke.test.tsx` is the current smoke test for the starter
  page.
- `tests/e2e/example.spec.ts` is still a Playwright starter test and should be
  replaced with app-specific E2E coverage when the first real workflow lands.
- No PostgreSQL, Prisma, internal API, scenario schema, or calculation engine has
  been implemented yet.

## Documentation References

- UI/UX standard: [DESIGN.md](./DESIGN.md)
- Agent operating guide: [AGENTS.md](./AGENTS.md)
- Local ADRs: [docs/adr/README.md](./docs/adr/README.md)
- Project architecture guardrails: `.agents/skills/project-architecture/SKILL.md`
- Minimum verification skill: `.agents/skills/project-min-evaluation/SKILL.md`
- Decision documentation sync: `.agents/skills/decision-doc-sync/SKILL.md`
- Next.js 16 guidance: `.agents/skills/next-best-practices/SKILL.md`

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Use `cmd /c npm ...` on Windows shells where PowerShell blocks `npm.ps1`.

## Scripts

```bash
npm run build
npm run start
npm run lint
npm run lint:fix
npm run typecheck
npm run format:check
npm run test
npm run test:e2e
npm run doctor
npm run check
```

`npm run check` is the full local gate: lint, typecheck, format check, Vitest,
and React Doctor CI policy.

## Quality Gates

Required before reporting implementation complete:

```bash
cmd /c npm run lint
cmd /c npm run typecheck
cmd /c npm run format:check
cmd /c npm run test
cmd /c npm run doctor
cmd /c npm run check
```

Notes:

- Do not use `next lint`; Next.js 16 removed it. Use the ESLint CLI through
  `npm run lint`.
- React Doctor warnings are blocking because `doctor` and `doctor:ci` run with
  `--fail-on warning`.
- `pre-commit` runs `lint-staged` and React Doctor on staged changes.
- `pre-push` runs `npm run check`.
- CI runs `npm run check` on push and pull request.
- Playwright CI remains additional E2E protection.

## Agent Workflow

Agents should read [AGENTS.md](./AGENTS.md) first, then use the relevant local
skills:

- `project-architecture` for UI, layout, component architecture, and dashboard or
  playground behavior changes.
- `next-best-practices` for Next.js 16 APIs, file conventions, RSC boundaries,
  data patterns, and metadata.
- `project-min-evaluation` before claiming work is complete.
- `decision-doc-sync` when a change creates or changes a structural decision.
- `architecture-decision-records` when creating, updating, superseding, or
  reviewing local ADRs.

Claude Code loads `CLAUDE.md`, which points to `AGENTS.md`, and uses
`.claude/skills` as a bridge to `.agents/skills`.
