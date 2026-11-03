import { bindings, defineConfig } from "cf/config";

export const databaseId = "24ce0783-4f73-42ae-a39b-05ebc0bffa55";

export default defineConfig({
  accountId: "b39bde647194d2b90ddb769881e6add9",
  worker: {
    compatibilityDate: "2026-11-03",
    compatibilityFlags: ["nodejs_compat"],
    domains: ["freshmarketpakistan.com"],
    entrypoint: "@tanstack/react-start/server-entry",
    env: {
      DB: bindings.d1({
        id: databaseId,
        name: "fm-catalog",
      }),
    },
    name: "fm",
    workersDev: true,
  },
});
