import { defineConfig } from "nitro";

import database from "./database.json";

export const { databaseId } = database;

export default defineConfig({
  cloudflare: {
    wrangler: {
      account_id: database.accountId,
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
