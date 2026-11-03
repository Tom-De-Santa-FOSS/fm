import {
  createFileRoute,
  notFound,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";

import { ProductSheet } from "../components/product-sheet";
import { products } from "../lib/products";

const ProductPage = () => {
  const product = useLoaderData({ from: "/_shop/product/$id" });
  const navigate = useNavigate();
  const close = () => navigate({ resetScroll: false, to: "/" });

  return <ProductSheet key={product.id} product={product} onClose={close} />;
};

export const Route = createFileRoute("/_shop/product/$id")({
  component: ProductPage,
  loader: ({ params }) => {
    const product = products.find((item) => String(item.id) === params.id);

    if (!product) {
      throw notFound({ routeId: "/_shop" });
    }

    return product;
  },
});
