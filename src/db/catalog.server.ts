import { env } from "cloudflare:workers";
import { asc, eq, getTableColumns, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import type { Product } from "../lib/products";
import { products } from "./schema";

const database = () => drizzle(env.DB);

export const listProducts = (): Promise<Product[]> =>
  database().select().from(products).orderBy(asc(products.id));

export const getProduct = async (id: number): Promise<Product | undefined> => {
  const rows = await database()
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return rows[0];
};

const isTypo = (word: string, term: string) => {
  if (Math.abs(word.length - term.length) > 1) {
    return false;
  }

  let index = 0;

  while (
    index < Math.min(word.length, term.length) &&
    word[index] === term[index]
  ) {
    index += 1;
  }

  if (word.slice(index + 1) === term.slice(index + 1)) {
    return true;
  }

  if (word.length !== term.length) {
    return word.length > term.length
      ? word.slice(index + 1) === term.slice(index)
      : word.slice(index) === term.slice(index + 1);
  }

  return (
    word[index] === term[index + 1] &&
    word[index + 1] === term[index] &&
    word.slice(index + 2) === term.slice(index + 2)
  );
};

export const searchProducts = async (query: string) => {
  const db = database();
  const term = query.trim().slice(0, 100);

  if (!term) {
    return db.select().from(products).orderBy(asc(products.id));
  }

  // Tokenize user input rather than accepting FTS operators or query syntax.
  const tokens = term.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

  if (!tokens.length) {
    return [];
  }

  const search = (match: string) =>
    db
      .select(getTableColumns(products))
      .from(products)
      .innerJoin(sql`products_fts`, sql`products_fts.rowid = ${products.id}`)
      .where(sql`products_fts MATCH ${match}`)
      .orderBy(sql`bm25(products_fts, 4, 2, 1, 1)`, asc(products.id))
      .limit(60);

  const exact = await search(tokens.map((token) => `"${token}"`).join(" AND "));

  if (exact.length) {
    return exact;
  }

  // FTS5 has no fuzzy operator. Expand against the indexed vocabulary only
  // after exact search misses; short words allow prefixes but not typos.
  const { results: vocabulary } = await env.DB.prepare(
    "SELECT term FROM products_vocab WHERE col IN ('name', 'ai_keywords')"
  ).all<{ term: string }>();

  const expanded = tokens.map((token) => {
    const words = vocabulary.filter(
      (word) => token.length >= 4 && isTypo(word.term, token)
    );

    const alternatives = new Set([
      `"${token}"*`,
      ...words.map((word) => `"${word.term.replaceAll('"', '""')}"`),
    ]);

    return `{name ai_keywords} : (${[...alternatives].join(" OR ")})`;
  });

  return search(expanded.join(" AND "));
};
