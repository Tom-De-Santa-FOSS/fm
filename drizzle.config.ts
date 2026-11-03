import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost/fm" },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema.ts",
});
