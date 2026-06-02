---
name: project-min-evaluation
description: Run the minimum local quality checks for Cost Console before marking implementation work complete. Use before final responses, after fixes, and when Claude reaches task close.
---

# Project Minimum Evaluation

Use this skill before declaring implementation tasks complete.

## Required Checks

Run these commands from the repository root:

```bash
cmd /c npm run lint
cmd /c npm run typecheck
cmd /c npm run format:check
cmd /c npm run test
cmd /c npm run doctor
cmd /c npm run check
```

Use `cmd /c npm ...` on Windows because PowerShell may block `npm.ps1`.

## Project Constraints

- Use ESLint CLI only (`npm run lint`, `npm run lint:fix`).
- Do not use `next lint`; Next.js 16 removed it.
- `npm run check` includes lint, typecheck, format check, Vitest, and React Doctor CI policy.
- React Doctor warnings are blocking because `doctor` and `doctor:ci` run with `--fail-on warning`.

## Conditional Rules

- If only docs changed, run at least `cmd /c npm run format:check`.
- If dependencies or tooling config changed, run `cmd /c npm install` before checks.
- If E2E behavior changed, run `cmd /c npm run test:e2e` or explain why it was not run.

## Failure Reporting

If a check cannot execute or fails, report:

- exact command,
- exact error,
- unverified scope.

## Completion Policy

Only report completion when all required checks pass, or when blockers and unverified scope are clearly documented.
