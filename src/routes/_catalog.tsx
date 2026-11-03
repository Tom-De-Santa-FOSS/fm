import { Outlet, createFileRoute, useLoaderData } from "@tanstack/react-router";

import { CartProvider } from "../lib/cart";
import { getCatalog } from "../lib/catalog";

const CatalogLayout = () => {
  const products = useLoaderData({ from: "/_catalog" });

  return (
    <CartProvider products={products}>
      <Outlet />
    </CartProvider>
  );
};

export const Route = createFileRoute("/_catalog")({
  component: CatalogLayout,
  loader: () => getCatalog(),
});
