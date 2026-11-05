import {
  createFileRoute,
  notFound,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import { ProductSheet } from "../components/product-sheet";
import { getCatalogProduct } from "../lib/catalog";

const ProductPage = () => {
  const product = useLoaderData({ from: "/_catalog/_shop/product/$id" });
  const navigate = useNavigate();
  const search = useSearch({ from: "/_catalog/_shop/product/$id" });
  const close = () => navigate({ resetScroll: false, search, to: "/" });

  return <ProductSheet key={product.id} product={product} onClose={close} />;
};

export const Route = createFileRoute("/_catalog/_shop/product/$id")({
  component: ProductPage,
  loader: async ({ params }) => {
    const id = Number(params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw notFound({ routeId: "/_catalog/_shop" });
    }

    const product = await getCatalogProduct({ data: id });

    if (!product) {
      throw notFound({ routeId: "/_catalog/_shop" });
    }

    return product;
  },
});
