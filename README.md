# Smart Inventory — Restaurant Inventory Management Platform

A true-microservices implementation of `docs/Restaurant_Inventory_Management_PRD.md`, scoped to the PRD's own Phase 1 / P0 (MVP) feature set. Next.js is the frontend/BFF only; every domain is an independently runnable Node/TypeScript service behind a single API gateway.

## Architecture

```
apps/
  web/                    Next.js 16 (App Router) — frontend/BFF                     :3000
  gateway/                Verifies JWTs, proxies /api/v1/<service>/* downstream       :4000
services/
  identity-service/       users, roles (RBAC), JWT auth                              :8001
  inventory-service/      items, locations, stock ledger, transfers, batches, wastage :8002
  purchasing-service/     suppliers, purchase orders, GRN, reorder suggestions        :8003
  recipes-service/        recipe/BOM costing, POS sale-event & manual stock deduction :8004
  notifications-service/  PAR/expiry alert detection, in-app notification center      :8005
  reporting-service/      dashboard KPIs, food-cost/spend/valuation reports           :8006
packages/
  contracts/              shared Zod schemas + TS types — the only DTO code shared between services
  http-client/            tiny typed fetch wrapper used by every service/app to call another
  db/                     single shared Prisma schema + client — every service imports @platform/db
```

Every backend service except `reporting-service` owns its own Postgres **schema** inside one shared Neon database — no service reads another's tables directly, only HTTP. There's one Prisma schema and one generated client for the whole platform (`packages/db`, one `DATABASE_URL` in the root `.env`); Prisma's `multiSchema` preview feature + `@@schema("identity" | "inventory" | ...)` on every model is what keeps each service's tables in its own Postgres schema, not separate connections. `reporting-service` is fully stateless: it has no database of its own and computes everything by fanning out, in parallel, to the other services' read endpoints on every request. `notifications-service` persists its own notification rows, but the low-stock/expiry *detection* that creates them is itself a poller over inventory-service's read endpoints.

**Trust boundary**: the gateway is the only publicly reachable entry point. It verifies the caller's JWT (issued by identity-service) and injects `x-user-id` / `x-user-email` / `x-user-roles` / `x-user-locations` headers on the proxied request, stripping any client-supplied versions of those headers first — so every downstream service can trust them unconditionally without re-verifying the token itself.

**File convention**: inside each service, one business function per file under `src/domains/<domain>/functions/<verbNoun>.ts`; `routes.ts` per domain is pure Fastify wiring; `schema.ts` re-exports the matching Zod contracts from `@platform/contracts`.

## Prerequisites

- Node 20+, npm 10+
- A Postgres database reachable from this machine (the running instance was built against Neon; any Postgres 14+ works — `db:push` creates every service's Postgres schema on first run, nothing needs pre-creating)

## First-time setup

```bash
npm install

# Shared packages must be compiled before anything imports them — this also
# runs `prisma generate` for packages/db first, since its build depends on
# the generated client existing.
npm run build:shared

# One .env at the repo root — every app/service reads from it, no per-service
# .env files.
cp .env.example .env
# edit DATABASE_URL — one Postgres connection for every service; multiSchema
# + @@schema(...) in packages/db/prisma/schema.prisma keeps each service's
# tables in their own Postgres schema

npm run db:push        # creates every service's Postgres schema, from the one shared schema.prisma

# identity-service and inventory-service ship a seed script:
npm run db:seed -w services/identity-service    # owner@restaurant.test / Owner123!
npm run db:seed -w services/inventory-service    # a starter location + a few sample items
```

## Run everything

```bash
npm run dev          # every service + gateway + web, in parallel
npm run dev:core      # just web + gateway + identity + inventory, for faster iteration
```

Then open http://localhost:3000 and sign in with the seeded owner account.

## Web app pages

`Dashboard · Items · Stock (receive/issue/adjust/count/wastage) · Suppliers · Purchase Orders (create/approve/receive via GRN) · Reorder Suggestions (one-tap → PO) · Recipes (BOM/costing/manual issue) · Wastage · Transfers (request/approve/dispatch/receive) · Alerts · Reports (food cost/spend/valuation) · Users` — nav items are shown/hidden per the signed-in user's role capabilities (`packages/contracts/src/common/roles.ts`).

## Verification

- `npm run typecheck` — type-checks every package/service/app in the workspace; currently clean.
- Each service has a `/health` endpoint and a README documenting its routes; curl them directly on their own port before assuming a gateway-routing issue.
- No end-to-end browser test runner is wired up yet (no headless browser in the environment this was built in). Every page and API flow has instead been manually verified via curl with real session cookies/JWTs against a real Postgres database — login, RBAC enforcement (including that the gateway overwrites any client-supplied `x-user-*` headers, so a caller cannot spoof a role), and the full receive → deduct-via-recipe → wastage → transfer → count-reconcile → reorder → PO → GRN loop.

## PRD coverage

| PRD section | Service |
|---|---|
| §3.1 Item/Product Master | inventory-service |
| §3.2 Supplier/Vendor Management | purchasing-service |
| §3.3 Purchase Order Management | purchasing-service |
| §3.4 Goods Receiving (GRN) | purchasing-service → posts to inventory-service |
| §3.5 Stock/Warehouse Management | inventory-service |
| §3.6 Recipe & Menu Engineering (BOM) | recipes-service |
| §3.7 Automatic Stock Deduction | recipes-service → posts to inventory-service |
| §3.8 Wastage & Spoilage | inventory-service |
| §3.9 Batch & Expiry Tracking | inventory-service |
| §3.10 Stock Transfer | inventory-service |
| §3.11 Stock Adjustment & Reconciliation | inventory-service |
| §3.13 Low-Stock Alerts & Reordering | notifications-service (detection) + purchasing-service (suggestions/conversion) |
| §3.14 POS Integration | recipes-service (`POST /sales-events` inbound webhook) |
| §3.16 Roles & Permissions | identity-service + `packages/contracts` role/capability matrix, enforced at every service's API layer |
| §3.17 Reporting & Analytics | reporting-service |
| §3.18 Notifications & Alerts | notifications-service |

## Scope

P0 (MVP) only, per the PRD's own Phase 1 roadmap (§11). Explicitly out of scope for this build: mobile apps, offline sync, real POS/accounting/label-printer vendor integrations (recipes-service exposes a generic authenticated inbound webhook instead), MFA/SSO, AI demand forecasting, menu-engineering matrix, custom report builder, Bluetooth scanners, multi-language UI.
