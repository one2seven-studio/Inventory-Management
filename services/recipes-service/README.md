# recipes-service

Recipe/BOM management with costing, and POS-triggered + manual stock deduction — PRD §3.6, §3.7, and the relevant parts of §3.14 and §7.2.

## Run

Uses the root `.env` (`cp .env.example .env` at the repo root) — no per-service .env file. The Prisma schema/client is shared across every service — see `packages/db`.

```bash
npm run db:push -w packages/db
npm run db:seed -w services/recipes-service      # optional: one sample "Margherita Pizza" recipe
                                                   # (requires inventory-service running + seeded first)
npm run dev -w services/recipes-service           # http://localhost:8004
```

## Routes

- `POST /recipes` / `GET /recipes` / `GET /recipes/:id` / `PATCH /recipes/:id` / `POST /recipes/:id/archive` — recipe/BOM CRUD (requires `MANAGE_RECIPES`: Owner, Manager, Chef — reads only need to be authenticated).
- `GET /recipes/:id/cost` — recursive recipe costing (plate cost, food-cost %, per-ingredient breakdown).
- `POST /sales-events` — inbound POS webhook. **No user JWT** — authenticated by an `x-pos-api-key` header matched against `POS_WEBHOOK_SECRET`. Deducts every sold recipe's flattened ingredient tree from inventory-service.
- `POST /stock-issues` — manual stock issue of a recipe's ingredients to a station (any authenticated role, no special capability).

## Design notes

- **Recipe versioning** (PRD §3.6): editing a recipe never mutates a row — `updateRecipe` inserts a new row (`version` + 1) sharing the same `recipeGroupId`, deactivates the old row (`isActive: false`), and activates the new one. `recipeGroupId` is the stable id for "this recipe" across all its versions; it defaults to a brand-new recipe's own `id`. For MVP, every operation that *uses* a recipe (costing, deduction, further edits) resolves to the group's currently-active version rather than the literal id it was called with — see `src/domains/recipes/internal/resolveActiveRecipe.ts`. Only `GET /recipes/:id` returns a literal historical row.
- **Ingredient tree flattening** (`src/domains/recipes/internal/flattenRecipeIngredients.ts`): shared by costing and both deduction paths. Recursively resolves nested sub-recipes into raw-item quantities (in each item's recipe UoM), scaling by the fraction of a sub-recipe's own yield consumed at each level. Rejects circular sub-recipe references.
- **Recipe costing math** (`src/domains/recipes/functions/getRecipeCost.ts`): `Item.averageCost` (from inventory-service) is $ per unit of the item's *stock* UoM. A recipe ingredient's quantity is in the item's *recipe* UoM. Per-recipe-unit cost = `averageCost / stockToRecipeFactor`; `purchaseToStockFactor` isn't used here (it only matters when a GRN converts a purchase-order quantity into stock UoM before it ever reaches `averageCost`). See the code comment for the full reasoning.
- **Server-to-server calls into inventory-service** (`src/lib/inventoryServiceClient.ts`): item lookups and `POST /stock/issue` are called with forwarded identity headers — either the real authenticated caller's (`src/lib/callerIdentity.ts`, manual issue) or a synthetic `system-pos-integration` / `MANAGER` identity (POS-triggered deduction, since that path has no logged-in user).
- Shares the platform's one Postgres database and one Prisma schema/client (`packages/db`), isolated in its own `recipes` schema via `multiSchema` + `@@schema(...)`.
