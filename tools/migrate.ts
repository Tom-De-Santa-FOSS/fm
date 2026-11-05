import { execFileSync } from "node:child_process";

import database from "../database.json";

const remote = process.argv[2] === "--remote";

if (process.argv.length > (remote ? 3 : 2)) {
  throw new Error("Usage: bun tools/migrate.ts [--remote]");
}

execFileSync(
  "cf",
  [
    "d1",
    "migrations",
    "apply",
    database.databaseId,
    "--dir",
    "drizzle/sqlite",
    ...(remote ? [] : ["--local", "--persist-to", ".wrangler/state"]),
  ],
  {
    env: remote
      ? { ...process.env, CLOUDFLARE_ACCOUNT_ID: database.accountId }
      : process.env,
    stdio: "inherit",
  }
);
