# ADR 0007: Adopt Identity-Service Login And Admin-Managed Pricing Snapshots

- Date: 2026-06-11
- Status: Accepted

## Context

Cost Console originally documented a first phase that could be demonstrated
without `auth-service`. Since then, `Identity-Service` has matured into a
project-scoped authentication provider with cookie sessions, `user` / `admin`
roles, and an integration pattern already started in `other-gpt`.

Cost Console also needed a clearer authorization boundary around pricing
snapshots. The documentation required snapshot traceability and future
persistence, but it did not define who could access administrative snapshot
surfaces once auth existed.

## Decision Drivers

- Reuse the portfolio identity system instead of inventing a local auth model.
- Require authentication before any playground route renders.
- Keep project roles scoped to `cost-console`, matching Identity-Service.
- Let normal users explore the playground without granting persistence rights.
- Reserve pricing snapshot administration for project admins.

## Decision

Cost Console will require login for all product routes.

Authentication is delegated to `Identity-Service` using the project slug
`cost-console`. Sessions are cookie-based and project-scoped. Navigation is guarded by a Next.js 16 `proxy.ts` that verifies the cookie against `Identity-Service`, while server components and route handlers keep their own fail-closed checks.

Authorization rules:

- unauthenticated visitors are redirected to login;
- authenticated members with the project role `user` may use the playground but
  may not persist scenarios or pricing snapshots;
- authenticated members with the project role `admin` may use the playground and
  may open pricing snapshot administration surfaces.

Cost Console consumes project access state from `Identity-Service`; it does not
become the authority for user identity, membership, or role assignment.

## Consequences

### Positive

- Cost Console now aligns with the portfolio auth model already implemented in
  `Identity-Service`.
- Protected routes can fail closed when auth is missing or unavailable.
- Snapshot administration has a clear permission boundary before the pricing
  backend is fully implemented.
- Future PostgreSQL persistence can map access rules to `project_scope` without
  redefining identity.

### Negative

- The product is no longer usable without a running `Identity-Service`.
- Local development now requires `IDENTITY_URL` configuration in addition to the
  Cost Console app.
- User-level scenario persistence remains intentionally blocked until ownership
  and privacy rules are defined.

## Implementation Notes

- Prefer same-origin BFF route handlers that relay `Set-Cookie` from
  `Identity-Service` back to the browser.
- Use `GET /projects/:slug/auth/session` for lightweight session checks and
  `GET /projects/:slug/me` / SDK access helpers for access decisions.
- Keep auth views server-routed (`/login`, `/login/password`, `/login/register`)
  with a dedicated auth layout, plus profile, theme, and language controls in
  the authenticated UI.
- Admin-only snapshot write operations may remain scaffolded until the pricing
  catalog persistence API exists, but they must stay protected by admin checks.

## Related Decisions

- ADR 0001 defines the Cost Console product boundary.
- ADR 0005 defines the PostgreSQL and Prisma persistence direction.
- `Identity-Service` ADR 0007 defines project-scoped auth and project-admin
  session control.

## References

- `README.md`
- `docs/product/views.md`
- `docs/data/database.md`
- `docs/discovery/open-questions.md`
- `E:\Repositorios\Identity-Service\README.md`
- `E:\Repositorios\Identity-Service\docs\integration-user-apps.md`
