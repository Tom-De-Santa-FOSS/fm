import { Outlet, createFileRoute, useLoaderData } from "@tanstack/react-router";

import { CartProvider } from "../lib/cart";
import { getCatalog, getTags } from "../lib/catalog";

const CatalogLayout = () => {
  const { products } = useLoaderData({ from: "/_catalog" });

  return (
    <CartProvider products={products}>
      <Outlet />
    </CartProvider>
  );
};

export const Route = createFileRoute("/_catalog")({
  component: CatalogLayout,
  loader: async () => {
    const [products, tags] = await Promise.all([getCatalog(), getTags()]);

    return { products, tags };
  },
});
