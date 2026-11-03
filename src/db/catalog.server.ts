import { and, asc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";

import type { Product } from "../lib/products";
import { products } from "./schema";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is required for the product catalog");
}

const db = drizzle(url);

// The DB owns prices and availability. The initial seed preserves the old catalog order.
export const listProducts = (): Promise<Product[]> =>
  db.select().from(products).orderBy(asc(products.id));

export const getProduct = async (id: number): Promise<Product | undefined> => {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return rows[0];
};

export const searchProducts = async (query: string, category?: string) => {
  const term = query.trim().slice(0, 100);
  let filter = category ? eq(products.tag, category) : undefined;

  if (category === "Eggs & Bakery") {
    filter = sql`${products.tag} IN ('Eggs', 'Bakery')`;
  }

  if (!term) {
    return db.select().from(products).where(filter).orderBy(asc(products.id));
  }

  // Name outranks category and enrichment; keep fuzzy matches behind exact token matches.
  const match = sql`${products.name} &&& ${term}::pdb.boost(4) OR ${products.tag} &&& ${term}::pdb.boost(2) OR ${products.ai_keywords} &&& ${term} OR ${products.description} &&& ${term}`;
  const rank = sql`pdb.score(${products.id})`;

  const exact = await db
    .select()
    .from(products)
    .where(and(filter, sql`(${match})`))
    .orderBy(sql`${rank} DESC`, asc(products.id))
    .limit(60);

  if (exact.length) {
    return exact;
  }

  if (term.length < 2) {
    return [];
  }

  const fallback =
    term.length >= 4
      ? sql`(${products.name} &&& ${term}::pdb.fuzzy(1, t, t) OR ${products.ai_keywords} &&& ${term}::pdb.fuzzy(1, t, t))`
      : sql`(${products.name} &&& ${term}::pdb.fuzzy(0, t) OR ${products.ai_keywords} &&& ${term}::pdb.fuzzy(0, t))`;

  return await db
    .select()
    .from(products)
    .where(and(filter, fallback))
    .orderBy(sql`${rank} DESC`, asc(products.id))
    .limit(60);
};
