import {
  boolean,
  customType,
  integer,
  pgTable,
  text,
} from "drizzle-orm/pg-core";

import type { Product } from "../lib/products";

const productUnit = customType<{ data: Product["unit"] }>({
  dataType: () => "text",
});

export const products = pgTable("products", {
  ai_keywords: text().notNull().default(""),
  available: boolean().notNull().default(true),
  description: text().notNull(),
  id: integer().primaryKey(),
  image_url: text().notNull(),
  name: text().notNull(),
  price_rs: integer().notNull(),
  tag: text().notNull(),
  unit: productUnit().notNull(),
});
