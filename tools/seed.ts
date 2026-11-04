import { execFileSync } from "node:child_process";

import { databaseId } from "../nitro.config";
import { products } from "./seed-products";

// Curated alternate names and use-cases. Replace or expand these when catalog owners approve them.
const keywords = {
  1: "poultry murghi chicken simple cut pieces",
  10: "hari mirch green chili chilli spicy pepper",
  11: "dabal roti double roti bread toast sandwich",
  12: "adrak ginger spice tea",
  13: "lehsan lahsun garlic spice",
  14: "dhania cilantro coriander herb garnish",
  15: "matar mutter peas green vegetable",
  16: "podina pudina mint herb chutney",
  17: "nimbu lemon lime citrus",
  18: "pape papay rusk toast biscuit tea",
  19: "poultry murghi chicken karahi curry pieces",
  2: "poultry boneless chicken cubes tikka curry",
  20: "poultry murghi chicken biryani pieces",
  21: "kheera khira cucumber vegetable salad",
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

// Local only. Production imports use a reviewed export of the maintained catalog.
const statements = products.map((product) => {
  const values = [
    product.id,
    product.name,
    product.tag,
    product.description,
    product.image_url,
    product.price_rs,
    product.unit,
    Number(product.available),
    keywordMap.get(product.id) ?? "",
  ].map((value) => `'${String(value).replaceAll("'", "''")}'`);

  return `INSERT INTO products (id, name, tag, description, image_url, price_rs, unit, available, ai_keywords) VALUES (${values.join(", ")}) ON CONFLICT(id) DO NOTHING;`;
});

execFileSync(
  "cf",
  [
    "d1",
    "raw",
    databaseId,
    "--sql",
    statements.join("\n"),
    "--local",
    "--persist-to",
    ".wrangler/state",
  ],
  { stdio: "pipe" }
);

console.log(
  `Imported up to ${products.length} catalog products (existing rows unchanged).`
);
