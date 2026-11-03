import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { Product } from "../lib/products";

export const products = sqliteTable("products", {
  ai_keywords: text().notNull().default(""),
  available: integer({ mode: "boolean" }).notNull().default(true),
  description: text().notNull(),
  id: integer().primaryKey(),
  image_url: text().notNull(),
  name: text().notNull(),
  price_rs: integer().notNull(),
  tag: text().notNull(),
  unit: text().$type<Product["unit"]>().notNull(),
});
