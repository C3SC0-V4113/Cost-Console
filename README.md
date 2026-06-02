# Cost Console

Cost Console is a Next.js 16 application for building a cost-management console. The current app is intentionally small, but the repository is already wired with strict quality gates so future dashboard work starts from a protected baseline.

## Project References

- UI/UX standard: [DESIGN.md](./DESIGN.md)
- Agent operating guide: [AGENTS.md](./AGENTS.md)
- Project architecture guardrails: `.agents/skills/project-architecture/SKILL.md`
- Minimum verification skill: `.agents/skills/project-min-evaluation/SKILL.md`
- Next.js 16 guidance: `.agents/skills/next-best-practices/SKILL.md`

## Architecture

- Framework: Next.js 16 App Router with React 19.
- Styling: Tailwind CSS v4, shadcn UI conventions, semantic CSS tokens in `app/globals.css`.
- Components: shared UI primitives live under `components/ui`; reusable application logic should stay outside route files when it grows beyond simple composition.
- Server-first default: `app/layout.tsx` and route components should stay Server Components unless state, browser APIs, or event handlers require a client island.
- React Scan: loaded only in development from `app/layout.tsx`.

## Current App Shape

- `app/layout.tsx` defines metadata, fonts, root HTML/body structure, and the development React Scan script.
- `app/page.tsx` is still a starter page and should be replaced by the first real Cost Console dashboard surface.
- `components/ui/button.tsx` contains the current shadcn-style button primitive.
- `tests/unit/home-page.smoke.test.tsx` is the current smoke test for the starter page.
- `tests/e2e/example.spec.ts` is still a Playwright starter test and should be replaced with app-specific E2E coverage when the first real workflow lands.

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

`npm run check` is the full local gate: lint, typecheck, format check, Vitest, and React Doctor CI policy.

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

- Do not use `next lint`; Next.js 16 removed it. Use the ESLint CLI through `npm run lint`.
- React Doctor warnings are blocking because `doctor` and `doctor:ci` run with `--fail-on warning`.
- `pre-commit` runs `lint-staged` and React Doctor on staged changes.
- `pre-push` runs `npm run check`.
- CI runs `npm run check` on push and pull request.
- Playwright CI remains additional E2E protection.

## Agent Workflow

Agents should read [AGENTS.md](./AGENTS.md) first, then use the relevant local skills:

- `project-architecture` for UI, layout, component architecture, and dashboard behavior changes.
- `next-best-practices` for Next.js 16 APIs, file conventions, RSC boundaries, data patterns, and metadata.
- `project-min-evaluation` before claiming work is complete.
- `decision-doc-sync` when a change creates or changes a structural decision.

Claude Code loads `CLAUDE.md`, which points to `AGENTS.md`, and uses `.claude/skills` as a bridge to `.agents/skills`.
