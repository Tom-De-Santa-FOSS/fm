import { createServerFn } from "@tanstack/react-start";

export const getCatalog = createServerFn().handler(async () => {
  const { listProducts } = await import("../db/catalog.server");

  return listProducts();
});

export const getCatalogProduct = createServerFn()
  .validator((id: number) => {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid product ID");
    }

    return id;
  })
  .handler(async ({ data }) => {
    const { getProduct } = await import("../db/catalog.server");

    return getProduct(data);
  });

export const findProducts = createServerFn()
  .validator((input: { query: string; category?: string }) => ({
    category: [
      "Chicken",
      "Vegetables",
      "Eggs",
      "Bakery",
      "Eggs & Bakery",
    ].includes(input.category ?? "")
      ? input.category
      : undefined,
    query: input.query.slice(0, 100),
  }))
  .handler(async ({ data }) => {
    const { searchProducts } = await import("../db/catalog.server");

    return searchProducts(data.query, data.category);
  });
