import {
  createFileRoute,
  notFound,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";

import { AddToBasketSheet } from "../components/add-to-basket-sheet";
import { getCatalogProduct } from "../lib/catalog";

const ProductPage = () => {
  const product = useLoaderData({ from: "/_catalog/_shop/product/$id" });
  const navigate = useNavigate();
  const search = useSearch({ from: "/_catalog/_shop/product/$id" });

  const close = () =>
    navigate({
      resetScroll: false,
      search:
        search.from === "cart"
          ? {}
          : { search: search.search, tag: search.tag },
      to: search.from === "cart" ? "/cart" : "/",
    });

  return (
    <AddToBasketSheet
      key={product.id}
      product={product}
      onClose={close}
      layout="detail"
    />
  );
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
  validateSearch: (search) => ({
    ...(search.from === "cart" && { from: "cart" as const }),
  }),
});
