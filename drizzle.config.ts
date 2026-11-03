import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle/sqlite",
  schema: "./src/db/schema.ts",
});
