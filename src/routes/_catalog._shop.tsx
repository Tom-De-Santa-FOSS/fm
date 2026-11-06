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
  Footer,
  Header,
  ProductCard,
  TagNav,
} from "../components/storefront";
import { Button } from "../components/ui/button";
import { useCart } from "../lib/cart";
import { findProducts } from "../lib/catalog";
import type { Product } from "../lib/products";

interface ShopSearch {
  tag?: string;
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
  tag,
  onSearchSubmit,
  search,
}: {
  basketCount: number;
  tag?: string;
  onSearchSubmit: (value: string) => void;
  search?: string;
}) => {
  const [draft, setDraft] = useState({ query: search ?? "", search, tag });

  if (draft.tag !== tag || draft.search !== search) {
    setDraft({ query: search ?? "", search, tag });
  }

  return (
    <Header
      basketCount={basketCount}
      showBanner
      search={draft.query}
      onSearch={(query) => setDraft({ query, search, tag })}
      onSearchSubmit={onSearchSubmit}
    />
  );
};

const ShopLayout = () => {
  const { tag: selectedTag, search: submittedQuery } = useSearch({
    from: "/_catalog/_shop",
  });

  const { count } = useCart();
  const navigate = useNavigate({ from: "/" });
  const { products, tags } = useLoaderData({ from: "/_catalog" });

  const tag = tags.find((name) => name === selectedTag);

  const [chosen, setChosen] = useState<Product | null>(null);

  const search = useQuery({
    enabled: Boolean(submittedQuery),
    queryFn: () =>
      findProducts({
        data: submittedQuery ?? "",
      }),
    queryKey: ["catalog-search", submittedQuery],
    retry: false,
  });

  const setTag = (name?: string) =>
    navigate({
      resetScroll: false,
      search: {
        search: undefined,
        tag: name,
      },
      to: "/",
    });

  const visible = submittedQuery
    ? (search.data ?? [])
    : products.filter((product) => !tag || product.tag === tag);

  const pending = Boolean(submittedQuery && search.isPending);
  const searchComplete = !pending && !search.isError;
  const browsing = !tag && !submittedQuery;

  const browseTags = [
    ...tags.filter((name) => name === "Chicken"),
    ...tags.filter((name) => name !== "Chicken"),
  ];

  const groups = browsing
    ? browseTags.flatMap((name) => {
        const items = products.filter((product) => product.tag === name);

        return items.length ? [[name, items] as const] : [];
      })
    : [[submittedQuery ? "Search results" : tag, visible] as const];

  return (
    <div
      className={count ? "page shop-page shop-page--basket" : "page shop-page"}
    >
      <ShopHeader
        basketCount={count}
        tag={tag}
        onSearchSubmit={(value) => {
          void navigate({
            resetScroll: false,
            search: {
              search: value.trim() || undefined,
              tag: undefined,
            },
            to: "/",
          });
        }}
        search={submittedQuery}
      />
      <main className="shop-main">
        {submittedQuery === undefined && <PromotionVideo />}
        {!submittedQuery && <TagNav tag={tag} tags={tags} onTag={setTag} />}
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
                title={
                  submittedQuery ? "Search results" : (tag ?? "All groceries")
                }
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
    /* oxlint-disable anti-slop/no-runtime-typeof -- Validate unknown URL data at the route boundary. */
    const query =
      typeof search.search === "string"
        ? search.search.trim().slice(0, 100)
        : "";
    /* oxlint-enable anti-slop/no-runtime-typeof */

    return {
      search: query || undefined,
      tag:
        // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Validate unknown URL data at the route boundary.
        !query && typeof search.tag === "string" && search.tag.length <= 120
          ? search.tag
          : undefined,
    };
  },
});
