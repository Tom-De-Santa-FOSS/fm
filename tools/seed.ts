import { drizzle } from "drizzle-orm/postgres-js";

import { products as table } from "../src/db/schema";
import { products } from "./seed-products";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is required");
}

// Curated alternate names and use-cases. Replace or expand these when catalog owners approve them.
const keywords = {
  1: "poultry murghi chicken curry biryani karahi pieces",
  10: "hari mirch green chili chilli spicy pepper",
  11: "dabal roti double roti bread toast sandwich",
  12: "adrak ginger spice tea",
  13: "lehsan lahsun garlic spice",
  14: "dhania cilantro coriander herb garnish",
  15: "matar mutter peas green vegetable",
  16: "podina pudina mint herb chutney",
  17: "nimbu lemon lime citrus",
  18: "pape papay rusk toast biscuit tea",
  2: "poultry boneless chicken cubes tikka curry",
  3: "poultry boneless breast fillet lean chicken",
  4: "poultry whole murghi roast chicken",
  5: "poultry chicken tikka chest breast",
  6: "anda anday eggs breakfast omelette",
  7: "tamatar tomato vegetable salad curry",
  8: "piyaz pyaz onion vegetable salad curry",
  9: "aloo potato vegetable fries curry",
} satisfies Record<number, string>;

const keywordMap = new Map<number, string>(
  Object.entries(keywords).map(([id, value]): [number, string] => [
    Number(id),
    value,
  ])
);

const db = drizzle(url);

// Upsert only known IDs; don't delete catalog entries added after this initial import.
await db
  .insert(table)
  .values(
    products.map((product) => ({
      ...product,
      ai_keywords: keywordMap.get(product.id) ?? "",
    }))
  )
  .onConflictDoNothing({ target: table.id });

console.log(
  `Imported up to ${products.length} catalog products (existing rows unchanged).`
);

await db.$client.end();
