import {
  Outlet,
  createFileRoute,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AddToCartSheet } from "../components/add-to-cart-sheet";
import {
  BasketDock,
  CategoryNav,
  Footer,
  Header,
  ProductCard,
} from "../components/storefront";
import { Button } from "../components/ui/button";
import { useCart } from "../lib/cart";
import { findProducts } from "../lib/catalog";
import type { Product } from "../lib/products";

const SearchSummary = ({ count }: { count: number }) => (
  <div className="search-summary">
    <h1>Search results</h1>
    <output aria-live="polite">
      {count} {count === 1 ? "product" : "products"}
    </output>
  </div>
);

const ShopLayout = () => {
  const { category: selectedCategory } = useSearch({ from: "/_catalog/_shop" });
  const { count } = useCart();
  const navigate = useNavigate({ from: "/" });
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState({ query: "" });
  const products = useLoaderData({ from: "/_catalog" });
  const category = selectedCategory ?? "All groceries";

  const [chosen, setChosen] = useState<Product | null>(null);

  const [results, setResults] = useState<{
    key: string;
    items: Product[];
  } | null>(null);

  const [searchError, setSearchError] = useState("");
  const searchKey = `${selectedCategory ?? ""}:${submitted.query}`;

  useEffect(() => {
    if (!submitted.query) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        const items = await findProducts({
          data: { category: selectedCategory, query: submitted.query },
        });

        if (active) {
          setResults({ items, key: searchKey });
          setSearchError("");
        }
      } catch {
        if (active) {
          setSearchError(searchKey);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [submitted, searchKey, selectedCategory]);

  const setCategory = (name: string) =>
    navigate({
      resetScroll: false,
      search: { category: name === "All groceries" ? undefined : name },
      to: "/",
    });

  const visible = submitted.query
    ? (results?.key === searchKey ? results.items : []).filter(
        (product) =>
          !selectedCategory ||
          product.tag === selectedCategory ||
          (selectedCategory === "Eggs & Bakery" &&
            (product.tag === "Eggs" || product.tag === "Bakery"))
      )
    : products.filter(
        (product) =>
          !selectedCategory ||
          product.tag === selectedCategory ||
          (selectedCategory === "Eggs & Bakery" &&
            (product.tag === "Eggs" || product.tag === "Bakery"))
      );

  const pending = Boolean(
    submitted.query && results?.key !== searchKey && searchError !== searchKey
  );

  const searchComplete = !pending && searchError !== searchKey;
  const browsing = category === "All groceries" && !submitted.query;

  const groups = browsing
    ? ([
        ["Chicken", products.filter((product) => product.tag === "Chicken")],
        [
          "Vegetables",
          products.filter((product) => product.tag === "Vegetables"),
        ],
        [
          "Eggs & Bakery",
          products.filter(
            (product) => product.tag === "Eggs" || product.tag === "Bakery"
          ),
        ],
      ] as const)
    : [[submitted.query ? "Search results" : category, visible] as const];

  return (
    <div className="page">
      <Header
        basketCount={count}
        search={query}
        onSearch={setQuery}
        onSearchSubmit={(value) => {
          setQuery(value);
          setResults(null);
          setSearchError("");
          setSubmitted({ query: value.trim() });
        }}
      />
      <main className="shop-main">
        <CategoryNav category={category} onCategory={setCategory} />
        {searchError === searchKey && (
          <section className="no-results" role="alert">
            <h1>Search is unavailable</h1>
            <p>Try again in a moment.</p>
          </section>
        )}
        {pending && (
          <output className="no-results">
            <p>Searching groceries…</p>
          </output>
        )}
        {searchComplete &&
          (visible.length ? (
            groups.map(([title, items]) => (
              <section className="catalog-section" key={title}>
                <div className="section-heading">
                  <h1>{title}</h1>
                  {submitted.query && (
                    <output className="search-count" aria-live="polite">
                      {visible.length}{" "}
                      {visible.length === 1 ? "product" : "products"}
                    </output>
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
            <>
              <SearchSummary count={0} />
              <section className="search-empty" aria-live="polite">
                <h2>No products found</h2>
                <p>Try another search or browse all groceries.</p>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSubmitted({ query: "" });
                    setCategory("All groceries");
                  }}
                >
                  Clear search and filters
                </Button>
              </section>
            </>
          ))}
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

export const Route = createFileRoute("/_catalog/_shop")({
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
      "Eggs & Bakery",
    ].includes(String(search.category));

    return category ? { category: String(search.category) } : {};
  },
});
