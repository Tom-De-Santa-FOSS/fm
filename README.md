# Fresh Market storefront

TanStack Start storefront for Fresh Market in Sukkur, deployed on Cloudflare Workers with a D1 SQLite catalog. Server functions access the `DB` binding; browsers never connect to the database. PostgreSQL and Docker are no longer required.

## Local development

```bash
bun install
bun dev
```

Install Node.js 22.18+, `cf`, and `just`. `bun dev` applies SQLite migrations, inserts missing seed products, and starts `cf dev` on port 3000. Local D1 data lives in `.cloudflare/state`, separate from production. `bun run db:migrate` and `bun run db:seed` only modify that local database. The chicken-cut migration renames product #1 only if it still has the original combined name; the seed leaves all existing products unchanged.

## Database and search

`src/db/schema.ts` defines the SQLite product table. Generate schema changes with `bun run db:generate`; migrations in `drizzle/sqlite` run through `cf d1 migrations apply`, locally or remotely. The old PostgreSQL migrations in `drizzle/` and `compose.yaml` are retained only for access to the previous database. Do not apply those migrations to SQLite or delete the old Docker volume until you no longer need the backup.

FTS5 indexes product names, categories, descriptions, and curated `ai_keywords`, with weights of 4, 2, 1, and 1 respectively. Triggers keep the index current after inserts, updates, and deletes. Exact matches run first; only when no results match does search try prefixes and one-character typos (including adjacent transpositions) in names and keywords. Words shorter than four characters do not allow typos. Results are limited to 60 and retain category filtering. SQL and FTS operators in user input are not executed.

The typo fallback reads the indexed name/keyword vocabulary. This is appropriate for the current small catalog; revisit vocabulary expansion if the catalog grows enough for those reads to affect D1 usage. Search ranking is SQLite BM25, not ParadeDB, so ordering can differ.

Prices and availability belong to D1. Edit maintained products there rather than changing the development seed. `tools/seed-products.ts` provides local catalog data, including three separate chicken cuts. No AI model or API runs during search.

## Deployment

`cloudflare.config.ts` pins the personal Cloudflare account, Worker `fm`, custom domain `givelavish.com`, and D1 database `fm-catalog` in APAC. Sign in using `cf auth login` before remote operations.

```bash
bun run check
cf deploy --dry-run
bun run db:migrate:remote
bun run deploy
```

Remote migrations do not seed production. The initial deployment copied all 18 maintained PostgreSQL rows into D1 and checked every column against the source. Keep a separate export before future data migrations. Builds write `.cloudflare/output/v0`; `bun run preview` serves the built app in the Workers runtime.

Review the Rs 600/kg prices before applying `0002_split_chicken_cuts.sql` remotely. It renames product #1 only if it still has the original combined name, preserves its price, and inserts Karahi (#19) and Biryani (#20) without overwriting existing rows. `bun run db:seed` is local-only; use `bun run db:migrate:remote` for these production changes.

No paid Workers subscription is required. Workers Free includes 100,000 dynamic requests/day and 10 ms CPU/request; D1 Free includes 5 million rows read/day, 100,000 rows written/day, and 5 GB total storage. Limits are shared across the account, and exceeding free limits causes requests to fail rather than charging overages. Static asset requests are free. See [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).

Baskets remain in browser localStorage. Ordering opens a prefilled WhatsApp message, not a backend order. The store confirms availability, delivery, payment, and final price in chat. The Rs 1,000 minimum and weight/quantity behavior are unchanged. This app does not update the separate Expo app in `../freshmarket/apps/expo-app`.
