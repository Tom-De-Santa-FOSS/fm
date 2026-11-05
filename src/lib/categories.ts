import productCategories from "./product-categories.json";

export const browseCategories = [
  "All groceries",
  ...productCategories,
  "Eggs & Bakery",
] as const;

export const catalogGroups = [
  "Chicken",
  "Vegetables",
  "Eggs & Bakery",
] as const;

export const isBrowseCategory = (
  value: unknown
): value is (typeof browseCategories)[number] =>
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate unknown URL and server-function input at their entry points.
  typeof value === "string" && browseCategories.some((name) => name === value);

export const categoryTags = (category: string): readonly string[] =>
  category === "Eggs & Bakery" ? ["Eggs", "Bakery"] : [category];
