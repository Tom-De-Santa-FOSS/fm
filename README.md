# Fresh Market storefront

TanStack Start storefront for Fresh Market in Sukkur. The product catalog, prices, availability, and searchable alternate names live in PostgreSQL. `pg_search` (ParadeDB) supplies BM25 ranking, field boosts, and typo-tolerant fallback. Search queries run on the server; the browser does not connect to PostgreSQL.

## Local setup

```bash
bun install
bun dev
```

Install `just` and keep Docker running. `bun dev` runs `just dev`, which starts the local PostgreSQL container, waits for readiness, applies migrations, imports missing seed products, and starts Vite on port 3000. It always connects to `127.0.0.1:55432/fm`, ignoring any external `DATABASE_URL`; no `.env` setup is needed for local development. Existing products are not overwritten. PostgreSQL stays running after Vite exits; stop it with `docker compose stop postgres`. Its named volume preserves data between runs.

The migration requires a Postgres server with `pg_search` installed (and `pgvector`, required by recent ParadeDB releases). The bundled Compose service supplies both. For production, set `DATABASE_URL` on the server and apply migrations before deploying. Plain Postgres and managed services without `pg_search` cannot run this migration or search query. Do not run `db:seed` against an already-maintained production catalog: it inserts missing IDs but never overwrites existing rows. Edit product prices and availability directly in the database or through a separate catalog management tool; the seed is only an initial import.

Search uses the indexed name, category, description, and `ai_keywords` columns. The initial alternate names are curated grocery terms, including common Roman Urdu spellings; no AI model or API runs when users search. Manage keywords as product data and review suggestions before publishing them. Exact token matches rank ahead of the typo fallback, and name matches are boosted. The current UI shows up to 60 results. Typing edits a draft; Enter or the search button submits it. Category changes filter the submitted search, not unfinished edits. Search design follows [Algolia's guidance on searchable attributes](https://www.algolia.com/doc/guides/going-to-production/case-study), [synonym restraint](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/adding-synonyms), and [typo ranking](https://www.algolia.com/doc/guides/managing-results/optimize-search-results/typo-tolerance); implementation uses [ParadeDB's current index and scoring APIs](https://www.paradedb.com/docs/reference/indexing/create-index.md).

The original 18 products are stored in `tools/seed-products.ts` only for initial import. This app does not update the separate Expo app at `../freshmarket/apps/expo-app`; synchronize that app independently if both must display the same prices. Baskets remain in browser localStorage, and ordering opens a prefilled WhatsApp message rather than placing an order in a backend. The store confirms availability, delivery, payment, and final price in chat. The Rs 1,000 minimum and weight/quantity behavior are unchanged.

```bash
bun run check
bun run build
```
