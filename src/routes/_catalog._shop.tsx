import { useQuery } from "@tanstack/react-query";
import {
  Outlet,
  createFileRoute,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";

import { AddToCartSheet } from "../components/add-to-cart-sheet";
import { PromotionVideo } from "../components/promotion-video";
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

const ShopHeader = ({
  basketCount,
  category,
  onSearchSubmit,
  search,
}: {
  basketCount: number;
  category: string;
  onSearchSubmit: (value: string) => void;
  search?: string;
}) => {
  const [draft, setDraft] = useState({ category, query: search ?? "", search });

  if (draft.category !== category || draft.search !== search) {
    setDraft({ category, query: search ?? "", search });
  }

  return (
    <Header
      basketCount={basketCount}
      showBanner
      search={draft.query}
      onSearch={(query) => setDraft({ category, query, search })}
      onSearchSubmit={onSearchSubmit}
    />
  );
};

const ShopLayout = () => {
  const { category: selectedCategory, search: submittedQuery } = useSearch({
    from: "/_catalog/_shop",
  });

  const { count } = useCart();
  const navigate = useNavigate({ from: "/" });
  const products = useLoaderData({ from: "/_catalog" });
  const category = selectedCategory ?? "All groceries";

  const [chosen, setChosen] = useState<Product | null>(null);

  const search = useQuery({
    enabled: Boolean(submittedQuery),
    queryFn: () =>
      findProducts({
        data: { category: selectedCategory, query: submittedQuery ?? "" },
      }),
    queryKey: ["catalog-search", selectedCategory, submittedQuery],
    retry: false,
  });

  const setCategory = (name: string) =>
    navigate({
      resetScroll: false,
      search: {
        category: name === "All groceries" ? undefined : name,
        search: submittedQuery === undefined ? undefined : "",
      },
      to: "/",
    });

  const visible = submittedQuery
    ? (search.data ?? [])
    : products.filter(
        (product) =>
          !selectedCategory ||
          product.tag === selectedCategory ||
          (selectedCategory === "Eggs & Bakery" &&
            (product.tag === "Eggs" || product.tag === "Bakery"))
      );

  const pending = Boolean(submittedQuery && search.isPending);
  const searchComplete = !pending && !search.isError;
  const browsing = category === "All groceries" && !submittedQuery;

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
    : [[submittedQuery ? "Search results" : category, visible] as const];

  return (
    <div
      className={count ? "page shop-page shop-page--basket" : "page shop-page"}
    >
      <ShopHeader
        basketCount={count}
        category={category}
        onSearchSubmit={(value) => {
          void navigate({
            resetScroll: false,
            search: {
              category: selectedCategory,
              search: value.trim() || undefined,
            },
            to: "/",
          });
        }}
        search={submittedQuery}
      />
      <main className="shop-main">
        {submittedQuery === undefined && <PromotionVideo />}
        <CategoryNav category={category} onCategory={setCategory} />
        {submittedQuery && search.isError && (
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
                  {submittedQuery && (
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
                  onClick={() =>
                    navigate({ resetScroll: false, search: {}, to: "/" })
                  }
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

    return {
      ...(category && { category: String(search.category) }),
      // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate unknown URL data at the route boundary.
      ...(typeof search.search === "string" && {
        search: search.search.trim().slice(0, 100),
      }),
    };
  },
});
