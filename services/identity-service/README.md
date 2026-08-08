# identity-service

Users, roles (RBAC per PRD §3.16/§6), and JWT authentication. Owns its own Postgres schema (`identity`) — no other service reads it directly.

## Run

Uses the root `.env` (`cp .env.example .env` at the repo root) — no per-service .env file. The Prisma schema/client is shared across every service — see `packages/db`.

```bash
npm run db:push -w packages/db
npm run db:seed -w services/identity-service   # creates owner@restaurant.test / Owner123!
npm run dev -w services/identity-service        # http://localhost:8001
```

## Endpoints

- `POST /auth/login` — `{ email, password }` → access + refresh token
- `POST /auth/refresh` — `{ refreshToken }` → rotates and returns a new pair
- `POST /auth/logout` — `{ refreshToken }` → revokes it
- `GET /auth/me` — requires `x-user-id`/`x-user-roles` headers (normally injected by the gateway)
- `GET/POST /users`, `PATCH /users/:id/roles`, `POST /users/:id/deactivate` — require the `MANAGE_USERS` capability (Owner role)

## Database

All services share one Postgres database and one Prisma schema/client (`packages/db`), each isolated in its own schema namespace via `multiSchema` + `@@schema(...)` (this service uses `identity`). No cross-service DB access — only HTTP.
