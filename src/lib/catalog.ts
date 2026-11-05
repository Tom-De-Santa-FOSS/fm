import { createServerFn } from "@tanstack/react-start";

import { isBrowseCategory } from "./categories";

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
  .validator((input: { query: string; category?: string }) => {
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate untrusted server-function input before searching.
    if (!input || typeof input.query !== "string") {
      throw new Error("Invalid search query");
    }

    return {
      category:
        isBrowseCategory(input.category) && input.category !== "All groceries"
          ? input.category
          : undefined,
      query: input.query.trim().slice(0, 100),
    };
  })
  .handler(async ({ data }) => {
    const { searchProducts } = await import("../db/catalog.server");

    return searchProducts(data.query, data.category);
  });
