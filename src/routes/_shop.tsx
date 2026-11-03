import {
  Outlet,
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";

import { AddToCartSheet } from "../components/add-to-cart-sheet";
import {
  BasketDock,
  CategoryNav,
  Footer,
  Header,
  ProductCard,
} from "../components/storefront";
import { products, searchProducts } from "../lib/products";
import type { Product } from "../lib/products";

const ShopLayout = () => {
  const { category: selectedCategory } = useSearch({ from: "/_shop" });
  const navigate = useNavigate({ from: "/" });
  const [query, setQuery] = useState("");
  const category = selectedCategory ?? "All groceries";
  const [chosen, setChosen] = useState<Product | null>(null);

  const setCategory = (name: string) =>
    navigate({
      resetScroll: false,
      search: { category: name === "All groceries" ? undefined : name },
      to: "/",
    });

  const visible =
    category === "Eggs & bakery"
      ? products.filter(
          (product) =>
            (product.tag === "Eggs" || product.tag === "Bakery") &&
            searchProducts(query, null).includes(product)
        )
      : searchProducts(query, category === "All groceries" ? null : category);

  const groups =
    query || category !== "All groceries"
      ? [
          [
            category === "All groceries" ? "Search results" : category,
            visible,
          ] as const,
        ]
      : ([
          ["Chicken", products.filter((product) => product.tag === "Chicken")],
          [
            "Vegetables",
            products.filter((product) => product.tag === "Vegetables"),
          ],
          [
            "Eggs & bakery",
            products.filter(
              (product) => product.tag === "Eggs" || product.tag === "Bakery"
            ),
          ],
        ] as const);

  return (
    <div className="page">
      <Header search={query} onSearch={setQuery} />
      <main className="shop-main">
        <CategoryNav category={category} onCategory={setCategory} />
        {visible.length ? (
          groups.map(([title, items]) => (
            <section className="catalog-section" key={title}>
              <div className="section-heading">
                <h1>{title}</h1>
                {category === "All groceries" && !query && (
                  <button type="button" onClick={() => setCategory(title)}>
                    View all →
                  </button>
                )}
                {category !== "All groceries" && (
                  <button
                    type="button"
                    onClick={() => setCategory("All groceries")}
                  >
                    All groceries
                  </button>
                )}
              </div>
              <div className="product-grid">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onChoose={setChosen}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <section className="no-results">
            <h1>No groceries found</h1>
            <p>Try another search or category.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All groceries");
              }}
            >
              Show all groceries
            </button>
          </section>
        )}
      </main>
      <Footer />
      <BasketDock />
      {chosen && (
        <AddToCartSheet
          key={chosen.id}
          product={chosen}
          onClose={() => setChosen(null)}
        />
      )}
      <Outlet />
    </div>
  );
};

export const Route = createFileRoute("/_shop")({
  component: ShopLayout,
  notFoundComponent: () => (
    <div className="page">
      <Header />
      <main className="shop-main">
        <h1>Product not found</h1>
        <a href="/">Back to the market</a>
      </main>
    </div>
  ),
  validateSearch: (search) => {
    const category = [
      "Chicken",
      "Vegetables",
      "Eggs",
      "Bakery",
      "Eggs & bakery",
    ].includes(String(search.category));

    return category ? { category: String(search.category) } : {};
  },
});
