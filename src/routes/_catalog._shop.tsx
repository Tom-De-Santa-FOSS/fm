import { useQuery } from "@tanstack/react-query";
import {
  Outlet,
  createFileRoute,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";

import { AddToBasketSheet } from "../components/add-to-basket-sheet";
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
import {
  catalogGroups,
  categoryTags,
  isBrowseCategory,
} from "../lib/categories";
import type { Product } from "../lib/products";

interface ShopSearch {
  category?: string;
  search?: string;
}

const EmptySummary = ({ title }: { title: string }) => (
  <div className="search-summary">
    <h1>{title}</h1>
    <output aria-live="polite">0 products</output>
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
        search: undefined,
      },
      to: "/",
    });

  const visible = submittedQuery
    ? (search.data ?? [])
    : products.filter(
        (product) =>
          !selectedCategory ||
          categoryTags(selectedCategory).includes(product.tag)
      );

  const pending = Boolean(submittedQuery && search.isPending);
  const searchComplete = !pending && !search.isError;
  const browsing = category === "All groceries" && !submittedQuery;

  const groups = browsing
    ? catalogGroups
        .map(
          (name) =>
            [
              name,
              products.filter((product) =>
                categoryTags(name).includes(product.tag)
              ),
            ] as const
        )
        .filter(([, items]) => items.length)
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
              <EmptySummary
                title={submittedQuery ? "Search results" : category}
              />
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
        <AddToBasketSheet
          key={chosen.id}
          product={chosen}
          onClose={() => setChosen(null)}
          layout="compact"
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
  validateSearch: (search): ShopSearch => {
    const category =
      isBrowseCategory(search.category) && search.category !== "All groceries"
        ? search.category
        : undefined;

    /* oxlint-disable anti-slop/no-runtime-typeof -- Validate unknown URL data at the route boundary. */
    const query =
      typeof search.search === "string"
        ? search.search.trim().slice(0, 100)
        : "";
    /* oxlint-enable anti-slop/no-runtime-typeof */

    return {
      category,
      search: query || undefined,
    };
  },
});
