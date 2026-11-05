# Codebase untangling decision log

Baseline: `afe7a15` (2026-11-06). Preserve the public storefront, existing URLs, saved baskets, catalog data, and WhatsApp ordering. No production migration or deployment is part of this refactor. Applied SQL is immutable; local build/check and disposable database checks are the rollback/verification route. The uncommitted tree was clean at the start. Legacy PostgreSQL files and the Docker volume are retained backups, not active code.

## Put selling rules in product data

- `src/lib/products.ts:18-19` treats IDs 4 and 5 as variable-weight and whole-kg-only; replacing either row with `tools/products.py` silently gives an unrelated item that rule. Seed, schema, migration and management tool must represent the selling rule together. Historical IDs in `src/lib/cart.tsx:79-103` remain only in the saved-basket migration, not current rules.
- `src/components/storefront.tsx`, `src/lib/format.ts`, `src/lib/whatsapp.ts`, `src/routes/_catalog.cart.tsx` and both sheets depend on the ID convention indirectly. One maintained product attribute should drive all of them.
- Keep the saved-basket old-cut mapping and over-limit restoration: they preserve existing baskets and permit decrementing them. `src/lib/cart.tsx` owns this storage boundary.

## Make catalog browsing one policy

- Category choices differ between `src/components/storefront.tsx`, `src/routes/_catalog._shop.tsx`, `src/lib/catalog.ts`, `src/db/catalog.server.ts`, and `tools/products.py`. `Eggs & Bakery` is accepted but absent from navigation; the shop hides tags outside its hard-coded groups. Preserve the four maintained tags and the combined display group, with one app-side policy for browsing/search.
- `src/routes/_catalog._shop.tsx` uses an empty `search` URL as a sentinel for hiding promotion, yet treats it as no search for results. Normalize empty search to absent and only show nonempty groups.
- The empty category state is mislabeled “Search results”; give browsing and searching their respective titles.
- `src/lib/catalog.ts` accepts externally submitted server-function input without checking its shape. Validate it at the trust boundary.
- `CategoryNav` in `src/components/storefront.tsx` has a link-only mode with no caller; remove it.

## Let one sheet own adding to basket

- `src/components/add-to-cart-sheet.tsx` and `src/components/product-sheet.tsx` duplicate add validation, errors, close state, price estimate and quantity controls; card and product-detail entry give the same product different quantity controls. Share the add interaction while retaining their distinct photo/layout and URL behavior.
- `src/components/weight-selector.tsx` accepts `initialQuantity` but every caller fixes it at 1; remove the hypothetical option.
- `src/lib/cart.tsx` returns `{quantity,total}` from `add` but callers only check success; return a boolean and avoid recalculating totals on commit.
- Basket product links navigate to a shop-owned sheet whose close returns to `/`; preserve the basket origin when entered from `/cart` without changing canonical product URLs.

## Keep order recovery and contact in one place

- `src/routes/_catalog.cart.tsx` and `src/routes/_catalog.handoff.tsx` repeat the ready-to-order rule. Put the derived rule with cart state; keep both route guards because direct handoff navigation must still be blocked.
- Oversize WhatsApp URLs are rejected in cart before the existing copy fallback at `/handoff` can be reached. Route that case to the existing fallback.
- `src/components/storefront.tsx` and cart repeat the phone number literals owned by `src/lib/whatsapp.ts`; derive links from the maintained number.
- Responsive duplicate navigation/count elements are intentionally mutually exclusive; retain them. The localStorage catch and SSR hydration are external constraints, not surplus.

## Remove unsupported paths, repair tooling contracts

- `package.json`'s `generate-routes` duplicates `build` under a misleading name; remove it. `src/lib/utils.ts` looked unused by runtime callers, but `components.json` names it as the component generator's import target. Keep that small adapter rather than breaking generation.
- `drizzle/sqlite/meta/_journal.json` stops at 0003 while checked-in SQL ends at 0010; the next generated file risks colliding. Reconcile journal numbering without changing applied SQL and verify generation on a disposable copy.
- D1 database/account identifiers are repeated in `nitro.config.ts`, `package.json`, and `tools/products.py`; align maintained configuration or add a check that prevents silent drift, while preserving operator and deployment ergonomics.
- Dormant CSS for removed product-detail and delivery layouts is surplus only after checking all selectors against JSX; remove verified dead selectors, not responsive alternatives.
- Remove comments that restate implementation, retaining notes about SSR, browser storage, migrations, FTS constraints and other outside-code reasons. There are no tracked application tests to prune; add only useful end-to-end verification where practical.

Review remaining special cases against actual constraints at the end. No UI browser run without explicit authorization. No production changes, old-database backup removal, or replacement of historical migrations.

## Final review

- The `0011` backfill now checks product name, tag and unit as well as historical ID. An operator who renamed either product must inspect the production catalog and set its flag after migration; the migration must not assign chicken rules to an ID that was reused. Disposable SQLite checks covered both cases and all 12 SQL migrations applied in a disposable local D1.
- The category URL validator explicitly overrides malformed/empty raw values with `undefined`: TanStack Router merges its validation output with raw URL search, so merely omitting an invalid property does not remove it from the state. This also preserves optional navigation search types.
- Variable-weight quantities use a generic item count in detailed views; the basket's existing product name supplies the noun. Card quantities retain their compact numeric display. Operator writes reject weight rules on non-kg products; the single selling-rule value cannot combine modes.
- The responsive delivery page CSS was retained after a CSS audit initially classified it as unused. Saved-basket migration, storage failure fallback, route-level handoff guard, and responsive alternatives are intentional remaining special cases tied to external constraints.
- PR review found two boolean selling flags permitted an invalid combination; before applying `0011`, they were replaced with one `selling_rule` value (`standard`, `variable_weight`, `whole_kg_only`). The delivery page's duplicated later width rule also overrode its 520px layout; the duplicate was removed.
- No application test files existed to prune. `bun run check`, `bun run build`, `git diff --check`, Python syntax, disposable D1 migrations and SQL backfill checks passed. No browser or production environment was used; UI appearance and production catalog state remain unverified.
