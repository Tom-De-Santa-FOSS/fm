export const catalogGroups = [
  "Vegetables",
  "Eggs & Bakery",
  "Pantry",
  "Chicken",
] as const;

export const browseCategories = ["All groceries", ...catalogGroups] as const;

export const isBrowseCategory = (
  value: unknown
): value is (typeof browseCategories)[number] =>
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate unknown URL and server-function input at their entry points.
  typeof value === "string" && browseCategories.some((name) => name === value);

export const categoryTags = (category: string): readonly string[] =>
  category === "Eggs & Bakery" ? ["Eggs", "Bakery"] : [category];
