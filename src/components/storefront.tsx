import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { ArrowRight, Search, ShoppingBag, X } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

import { useCart } from "../lib/cart";
import { formatMoney } from "../lib/format";
import type { Product } from "../lib/products";
import { isVariableWeight } from "../lib/products";
import { Button } from "./ui/button";

export const Header = ({
  basketCount,
  search = "",
  onSearch,
  onSearchSubmit,
}: {
  basketCount?: number;
  search?: string;
  onSearch?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}) => {
  const searchInput = useRef<HTMLInputElement>(null);

  return (
    <header
      className={onSearch ? "site-header site-header--search" : "site-header"}
    >
      <div className="header-inner">
        <div className="header-brand-row">
          <Link
            className="wordmark"
            to="/"
            search={{}}
            onClick={() => {
              onSearch?.("");
              onSearchSubmit?.("");
            }}
          >
            <Image
              src="/logo.png"
              alt="Fresh Market"
              layout="constrained"
              width={132}
              height={88}
              loading="eager"
            />
          </Link>
          <nav aria-label="Main navigation">
            <Link to="/delivery">Delivery</Link>
            <Link className="basket-link" to="/cart">
              <ShoppingBag size={19} />
              <span>
                Basket{basketCount === undefined ? "" : ` (${basketCount})`}
              </span>
            </Link>
          </nav>
        </div>
        {onSearch && (
          <div className="header-search-row">
            <form
              className="header-search"
              /* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Keep the search landmark on the submitting form. */
              role="search"
              aria-label="Search groceries"
              onSubmit={(event) => {
                event.preventDefault();
                const query = search.trim();

                if (query) {
                  onSearchSubmit?.(query);
                }
              }}
            >
              <div className="header-search-field">
                <input
                  ref={searchInput}
                  aria-label="Search groceries"
                  type="search"
                  value={search}
                  maxLength={100}
                  autoCapitalize="none"
                  enterKeyHint="search"
                  onChange={(event) => onSearch(event.target.value)}
                  placeholder="Search groceries"
                />
                {search.length > 0 && (
                  <Button
                    className="header-search-clear"
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      onSearch("");
                      onSearchSubmit?.("");
                      searchInput.current?.focus();
                    }}
                  >
                    <X />
                  </Button>
                )}
              </div>
              <Button
                className="header-search-submit"
                size="icon"
                type="submit"
                aria-label="Search groceries"
              >
                <Search />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export const CheckoutHeader = ({
  title,
  backTo,
  backLabel,
}: {
  title: string;
  backTo: "/" | "/cart";
  backLabel: string;
}) => (
  <header className="checkout-header">
    <Link to={backTo}>← {backLabel}</Link>
    <span>{title}</span>
    <ShoppingBag size={19} aria-hidden="true" />
  </header>
);

export const CategoryNav = ({
  category,
  onCategory,
}: {
  category?: string;
  onCategory?: (value: string) => void;
}) => {
  const nav = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const list = nav.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');

    if (!list) {
      return;
    }

    const update = () => {
      if (category && active) {
        list.style.setProperty("--active-tab-left", `${active.offsetLeft}px`);
        list.style.setProperty("--active-tab-width", `${active.offsetWidth}px`);
      }

      list.toggleAttribute("data-overflow-start", list.scrollLeft > 1);
      list.toggleAttribute(
        "data-overflow-end",
        list.scrollWidth - list.clientWidth - list.scrollLeft > 1
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);

    for (const tab of list.querySelectorAll("button, a")) {
      observer.observe(tab);
    }

    list.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", update);
    };
  }, [category]);

  return (
    <nav ref={nav} className="category-nav" aria-label="Product categories">
      {["All groceries", "Chicken", "Vegetables", "Eggs", "Bakery"].map(
        (name) =>
          onCategory ? (
            <button
              key={name}
              type="button"
              aria-current={category === name ? "page" : undefined}
              onClick={() => onCategory(name)}
            >
              {name}
            </button>
          ) : (
            <Link key={name} to="/" search={{ category: name }}>
              {name}
            </Link>
          )
      )}
      {onCategory && <div className="category-indicator" aria-hidden="true" />}
      <span>Sukkur</span>
    </nav>
  );
};

export const ProductCard = ({
  product,
  onChoose,
}: {
  product: Product;
  onChoose: (product: Product) => void;
}) => {
  const variable = isVariableWeight(product);

  return (
    <article className="product-card">
      <Link
        className="product-photo"
        aria-label={product.name}
        to="/product/$id"
        params={{ id: String(product.id) }}
        resetScroll={false}
      >
        <Image
          src={product.image_url}
          alt=""
          layout="fullWidth"
          height={178}
          loading="lazy"
          unstyled
        />
      </Link>
      <div className="product-info">
        <h3>
          <Link
            to="/product/$id"
            params={{ id: String(product.id) }}
            resetScroll={false}
          >
            {product.name}
          </Link>
        </h3>
        <strong>{formatMoney(product.price_rs)}</strong>
        <span>
          {variable ? "Per kg · weight varies" : `Per ${product.unit}`}
        </span>
      </div>
      <Button
        className="card-action"
        disabled={!product.available}
        onClick={() => onChoose(product)}
      >
        {product.available ? "Add to basket" : "Unavailable"}
      </Button>
    </article>
  );
};

export const Footer = () => (
  <footer className="site-footer">
    <Image
      src="/logo.png"
      alt="Fresh Market"
      layout="fixed"
      width={105}
      height={70}
      loading="lazy"
    />
    <div>
      <Link to="/delivery">Delivery</Link>
      <a href="https://wa.me/923337125030">WhatsApp</a>
      <a href="tel:+923337125030">+92 333 7125030</a>
    </div>
  </footer>
);

export const BasketDock = () => {
  const { count, total, lines } = useCart();

  if (!count) {
    return null;
  }

  return (
    <Link to="/cart" className="basket-dock">
      <span>
        Basket ({count}) · {formatMoney(total)}
        {lines.some(({ product }) => product.id === 4 || product.id === 5)
          ? " + items priced after weighing"
          : ""}
      </span>
      <ArrowRight size={18} />
    </Link>
  );
};

export { ArrowLeft, ArrowRight, Search } from "lucide-react";
