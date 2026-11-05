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
  selling_rule: text({ enum: ["standard", "variable_weight", "whole_kg_only"] })
    .notNull()
    .default("standard"),
  tag: text().notNull(),
  unit: text().$type<Product["unit"]>().notNull(),
});
