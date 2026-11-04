import { defineConfig } from "nitro";

export const databaseId = "24ce0783-4f73-42ae-a39b-05ebc0bffa55";

export default defineConfig({
  cloudflare: {
    wrangler: {
      account_id: "b39bde647194d2b90ddb769881e6add9",
      d1_databases: [
        { binding: "DB", database_id: databaseId, database_name: "fm-catalog" },
      ],
      name: "fm",
      routes: [{ custom_domain: true, pattern: "freshmarketpakistan.com" }],
      workers_dev: true,
    },
  },
  compatibilityDate: "2026-11-03",
  preset: "cloudflare_module",
});
