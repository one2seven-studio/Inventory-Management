# purchasing-service

Suppliers, purchase orders (with approval workflow), goods receiving (GRN), and reorder
suggestions — PRD §3.2, §3.3, §3.4, and the reorder-suggestion part of §3.13.

## Run

Uses the root `.env` (`cp .env.example .env` at the repo root) — no per-service .env file. The Prisma schema/client is shared across every service — see `packages/db`.

```bash
npm run db:push -w packages/db
npm run db:seed -w services/purchasing-service      # 2 suppliers + preferred prices against inventory-service's seeded items (inventory-service must be running)
npm run dev -w services/purchasing-service           # http://localhost:8003
```

## Routes

| Method | Path | Capability |
|---|---|---|
| GET | `/suppliers` | authenticated |
| GET | `/suppliers/:id` | authenticated |
| POST | `/suppliers` | `MANAGE_ITEM_MASTER` |
| PATCH | `/suppliers/:id` | `MANAGE_ITEM_MASTER` |
| GET | `/supplier-item-prices?itemId=` | authenticated |
| PUT | `/supplier-item-prices` | `MANAGE_ITEM_MASTER` |
| GET | `/purchase-orders` | authenticated |
| GET | `/purchase-orders/:id` | authenticated |
| POST | `/purchase-orders` | `CREATE_PURCHASE_ORDER` |
| POST | `/purchase-orders/from-suggestions` | `CREATE_PURCHASE_ORDER` |
| POST | `/purchase-orders/:id/approve` | `APPROVE_PURCHASE_ORDER` |
| GET | `/purchase-orders/:purchaseOrderId/grns` | authenticated |
| GET | `/grns/:id` | authenticated |
| POST | `/grns` | `RECEIVE_GOODS` |
| GET | `/reorder-suggestions?locationId=` | authenticated |

## Notes / deviations from the brief

- **No `packages/contracts` changes.** The existing `purchasing/*` schemas were sufficient as-is; nothing was added or edited there, so the "rebuild `dist/`" step wasn't needed.
- **Approval directly sets `SENT`.** The brief explicitly allows this simplification: `POST /purchase-orders/:id/approve` transitions `DRAFT`/`PENDING_APPROVAL` → `SENT` (approved) or → `REJECTED` (declined). There's no separate manual "send to supplier" action/status in MVP — a distinct `sendPurchaseOrderInputSchema` exists in contracts for a future PDF/email-send action, but isn't wired to a route here since it doesn't change PO state.
- **PO status history** is modeled as a related table (`PurchaseOrderStatusEvent`), not a JSON column, so it reads/writes like every other append-only audit-log pattern in this platform (see `postStockTransaction` in inventory-service). The API still returns it as the `statusHistory` array the contract expects.
- **GRN discrepancy is computed against the *outstanding* quantity** on the PO line (ordered minus already received across prior GRNs), not the line's original ordered quantity. This makes discrepancy flags meaningful when a PO is received across more than one GRN event (`PARTIALLY_RECEIVED` → another `POST /grns` → …→ `RECEIVED`).
- **Reorder-quantity heuristic** (`src/domains/reorder-suggestions/internal/computeSuggestedQuantity.ts`, reused by `convertSuggestionsToPurchaseOrder`): tops up to `maxLevel` when configured, otherwise targets 2× PAR as a simple safety-stock buffer, falling back to a full PAR's worth if that target doesn't clear on-hand. Lead-time/usage-velocity-aware forecasting is P1 (PRD §3.13 "Demand forecasting").
- **Cross-service calls are best-effort, not distributed transactions.** `createGrn` commits the GRN + PO status transition locally first, then posts each received line to inventory-service's `/stock/receive`. If the inventory-service call fails partway, the GRN/PO already reflect what was recorded as received on this service; there's no saga/compensation logic in MVP.
- **`isPreferred` uniqueness** ("at most one preferred supplier per item") is enforced at the application layer (`upsertSupplierItemPrice` un-sets any other preferred row for the same item inside a transaction), not via a DB constraint — Prisma's schema DSL doesn't model Postgres partial unique indexes.
- The gateway does not yet proxy to this service (separate follow-up task) — hit it directly at `:8003` with `x-user-id` / `x-user-roles` headers, same as inventory-service.
