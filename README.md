# Fresh Market storefront

TanStack Start storefront for Fresh Market in Sukkur, built with Nitro and deployed on Cloudflare Workers with a D1 SQLite catalog. Server functions access the `DB` binding; browsers never connect to the database. PostgreSQL and Docker are no longer required.

## Local development

```bash
bun install
bun dev
```

Install Node.js 22.18+ and `just`. The project installs `cf`, Wrangler, and Miniflare as development dependencies. `bun dev` applies SQLite migrations, inserts missing seed products, and starts Vite with Nitro on port 3000. Nitro emulates D1 with Miniflare; local data lives in `.wrangler/state`, shared with the built app's preview and separate from production. `bun run db:migrate` and `bun run db:seed` only modify that local database. The chicken-cut migration renames product #1 only if it still has the original combined name; the seed leaves all existing products unchanged.

The previous Cloudflare Vite plugin kept local data in `.cloudflare/state`. That directory is left untouched. If it contains maintained local products, export them before switching and import them into the new local database rather than replacing them with the seed.

## Database and search

`src/db/schema.ts` defines the SQLite product table. Generate schema changes with `bun run db:generate`; migrations in `drizzle/sqlite` run through `cf d1 migrations apply`, locally or remotely. The old PostgreSQL migrations in `drizzle/` and `compose.yaml` are retained only for access to the previous database. Do not apply those migrations to SQLite or delete the old Docker volume until you no longer need the backup.

The SQLite migration journal includes the hand-written migrations through `0011` so Drizzle Kit generates the next unused number. Applied SQL must not be edited. `database.json` supplies the D1 database and account IDs to Nitro, migration scripts, and the catalog management tool.

FTS5 indexes product names, categories, descriptions, and curated `ai_keywords`, with weights of 4, 2, 1, and 1 respectively. Triggers keep the index current after inserts, updates, and deletes. Exact matches run first; only when no results match does search try prefixes and one-character typos (including adjacent transpositions) in names and keywords. Words shorter than four characters do not allow typos. Results are limited to 60 and retain category filtering. SQL and FTS operators in user input are not executed.

The typo fallback reads the indexed name/keyword vocabulary. This is appropriate for the current small catalog; revisit vocabulary expansion if the catalog grows enough for those reads to affect D1 usage. Search ranking is SQLite BM25, not ParadeDB, so ordering can differ.

Prices and availability belong to D1. Edit maintained products there rather than changing the development seed. `tools/seed-products.ts` provides local catalog data, including three separate chicken cuts. No AI model or API runs during search.

The `selling_rule` product field controls quantity and price presentation: `standard` by default, `variable_weight`, or `whole_kg_only`. Migration `0011` sets rules on existing whole chicken (#4) and chest-cut (#5) rows only when their names, categories, and units still match the known catalog. Check production rows before deploying: if either product was renamed, set its selling rule explicitly after the migration. Reused IDs retain the standard rule. The operator requires a kg unit for either nonstandard rule. `src/lib/product-categories.json` defines the five maintained category tags used by the storefront and operator tool; the storefront also combines Eggs and Bakery into one browsing group.

### Manage products without redeploying

An AI agent or a person with `cf` access can list, read, create, update, and delete products using `tools/products.py`. Install project dependencies and ImageMagick first, then authenticate with `cf auth login` (or supply `CLOUDFLARE_API_TOKEN`). The script uses `cf` for R2 uploads and D1 reads and writes. The site reads D1 on requests, so changes appear without a code deploy.

```json
{
  "name": "Example produce",
  "tag": "Vegetables",
  "description": "Fresh produce, 1 kg.",
  "price_rs": 150,
  "unit": "kg",
  "available": true,
  "selling_rule": "standard",
  "ai_keywords": "example",
  "image": "./example.jpg"
}
```

Save this as `product.json` next to the photo. Commands print JSON so agents can read the results:

```bash
python3 tools/products.py list
python3 tools/products.py get 21
python3 tools/products.py create product.json --dry-run
python3 tools/products.py create product.json
python3 tools/products.py update 21 changes.json --dry-run
python3 tools/products.py update 21 changes.json
python3 tools/products.py delete 21 --yes
```

`changes.json` contains only the fields to change, such as `{"price_rs": 90}` or `{"image": "./new-photo.jpg"}`. Create requires a name, category, description, price, unit, and either a photo or an existing catalog WebP `image_url`; `id` is optional. The script resizes uploaded images to at most 1200 px, encodes them as WebP, and uploads each under a new key before changing D1. It does not delete R2 objects when replacing a photo or deleting a product, because old URLs may still be in use. Delete is permanent in D1 and requires `--yes`. Add `--local` after a command to use local D1; photo uploads are rejected with `--local` because the image domain serves production R2. The local development seed may restore deleted seed products when the dev server starts. Supported categories are Chicken, Vegetables, Eggs, Bakery, Pantry; units are kg, loaf, bunch, dozen, 250g, and 500g. The script requires an authenticated operator and is not a public API.

## Deployment

`nitro.config.ts` selects the `cloudflare_module` preset and declares the existing account, Worker `fm`, custom domain `freshmarketpakistan.com`, and D1 database `fm-catalog` in APAC. Nitro generates `.output/server/wrangler.json`, including the Worker entry, static assets, compatibility settings, and module rules. There is no hand-written `cloudflare.config.ts` or Wrangler configuration file.

Build before checking types or deploying. The build generates `worker-configuration.d.ts` from Nitro's output, so bindings and runtime types match the actual deployed configuration. Neither generated file is committed.

```bash
bun run build
bun run check
bun run deploy --dry-run
bun run db:migrate:remote
bun run deploy
```

Wrangler deploys Nitro's generated output without rebuilding. Use `wrangler login` for local deployment and `cf auth login` for remote D1 operations; the CLIs do not share OAuth logins. CI uses `CLOUDFLARE_API_TOKEN` for both. Do not use `cf build`, `cf dev`, or `cf deploy` here: Nitro does not emit the Build Output format those commands require, and automatic setup would recreate the configuration this integration replaces.

Remote migrations do not seed production. The initial deployment copied all 18 maintained PostgreSQL rows into D1 and checked every column against the source. Keep a separate export before future data migrations. Builds write `.output`; `bun run preview` serves the built app in the Workers runtime.

Product images are served from the `freshmarket-images` R2 bucket at `images.freshmarketpakistan.com`. The zone Cache Rule `Fresh Market image cache` caches image extensions on that hostname for one day at the edge and in browsers. Use a new object key when replacing an image; old keys may remain in caches until their TTL expires. Check a repeated GET for `cf-cache-status: HIT` and `cache-control: max-age=86400`.

### GitHub Actions

Gitea remains the source repository. Its push mirror updates [Tom-De-Santa-FOSS/fm](https://github.com/Tom-De-Santa-FOSS/fm) on GitHub after each push. Commit workflow changes to Gitea, not directly to the mirror.

`.github/workflows/deploy.yml` builds Nitro output, generates binding types, checks the code, and validates deployment without credentials on pull requests. Pushes to mirrored `main` also apply pending D1 migrations with `cf`, deploy the same generated output with Wrangler, and check `https://freshmarketpakistan.com/`. You can rerun deployment using the workflow's manual trigger on `main`. Manual runs on other branches validate without deploying. Production runs do not cancel an in-progress migration or deployment.

The GitHub repository secret `CLOUDFLARE_API_TOKEN` holds a dedicated deployment token. It grants Workers deployment and D1 write access in the configured account, plus zone read and Workers route write access for `freshmarketpakistan.com`. Credentials are passed only to the migration/deployment step. The deployment account comes from Nitro's generated config; the remote migration script explicitly selects the same account. The workflow never runs the development seed against production. Review committed migrations before merging to `main`, since they will run automatically.

For speed, the workflow caches Bun's package store by OS, architecture, Bun revision, and lockfile. A matching older store can supply unchanged packages when the lockfile changes; `bun install --frozen-lockfile` still verifies and installs the current dependency graph. This follows [GitHub's Bun cache example](https://github.com/actions/cache/blob/main/examples.md#bun) and [Superset's production workflow](https://github.com/superset-sh/superset/blob/main/.github/workflows/deploy-production.yml). Bun's setup action also caches its pinned executable. Builds run once per commit; production bundles, D1 data, and credentials are never cached. Documentation-only pushes skip deployment. Cloudflare uploads only changed static assets. Compare Actions step timings rather than assuming every cache hit is faster. Type checking runs after the build because it consumes the generated binding types.

Review the Rs 600/kg cut prices before applying `0002_split_chicken_cuts.sql` remotely. It renames product #1 only if it still has the original combined name, preserves its price, and inserts Karahi (#19) and Biryani (#20) without overwriting existing rows. `0003_whole_chicken_price.sql` sets whole chicken to Rs 900/kg and updates its description only if it still contains the old price. `bun run db:seed` is local-only; use `bun run db:migrate:remote` for these production changes.

No paid Workers subscription is required. Workers Free includes 100,000 dynamic requests/day and 10 ms CPU/request; D1 Free includes 5 million rows read/day, 100,000 rows written/day, and 5 GB total storage. Limits are shared across the account, and exceeding free limits causes requests to fail rather than charging overages. Static asset requests are free. See [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).

Baskets remain in browser localStorage. Ordering opens a prefilled WhatsApp message, not a backend order. Whole chickens count toward the Rs 1,000 minimum at an estimated 1 kg each; chest cuts are sold in fixed 1 kg units. The store confirms delivery, payment, and the final bill in chat. This app is separate from the Expo app in `../freshmarket/apps/expo-app`.
