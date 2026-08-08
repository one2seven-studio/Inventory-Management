# notifications-service

In-app notification center plus PAR-level low-stock and expiry-window alert detection — PRD §3.13, §3.18, and the alert-driven part of §3.8/§3.9.

## Run

Uses the root `.env` (`cp .env.example .env` at the repo root) — no per-service .env file. The Prisma schema/client is shared across every service — see `packages/db`.

```bash
npm run db:push -w packages/db
npm run dev -w services/notifications-service   # http://localhost:8005
```

Needs inventory-service running to have anything to detect against.

## How alert detection works

A background sweep (`src/alertScheduler.ts`) runs immediately on boot and then every 5 minutes: for every location returned by inventory-service, it calls `detectLowStockAlerts` (against `GET /stock/below-par`) and `detectExpiryAlerts` (against `GET /batches/expiring?withinDays=3`), turning each hit into a persisted `Notification` row targeted at the roles that PRD §6 says care about it (Owner/Manager/Purchasing for low stock; +Chef/Store Clerk for expiry). To avoid re-notifying every 5 minutes for the same unresolved shortfall, both detectors skip creating a new notification if an **unread** one for the same item/batch + location already exists from the last 24h — marking existing ones read (or letting them age past 24h) lets the next sweep raise them again.

`POST /alert-rules/run` triggers both detectors on demand (any authenticated user) without waiting for the interval — useful for testing or an ops "check now" button.

## Endpoints

- `GET /notifications?unreadOnly=` — rows targeted at the caller directly or at any role they hold
- `POST /notifications/:id/read`, `POST /notifications/read-all`
- `POST /alert-rules/run` — manual detector trigger

## Database

Shares the platform's one Postgres database and one Prisma schema/client (`packages/db`), isolated in its own `notifications` schema via `multiSchema` + `@@schema(...)` — no cross-service DB access, only HTTP.
