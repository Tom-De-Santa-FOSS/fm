import {
  ArrowRightIcon,
  MagnifyingGlassIcon as Search,
  ShoppingBagIcon as ShoppingBag,
} from "@phosphor-icons/react/ssr";
import { Link } from "@tanstack/react-router";

import { useCart } from "../lib/cart";
import { formatMoney } from "../lib/format";
import type { Product } from "../lib/products";
import { isVariableWeight } from "../lib/products";
import { Button } from "./ui/button";

export const Header = ({
  search,
  onSearch,
}: {
  search?: string;
  onSearch?: (value: string) => void;
}) => {
  const { count } = useCart();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link
          className="wordmark"
          to="/"
          search={{}}
          onClick={() => onSearch?.("")}
        >
          Fresh Market
        </Link>
        {onSearch && (
          <label className="header-search">
            <span className="sr-only">Search groceries</span>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search groceries"
            />
            <Search size={21} />
          </label>
        )}
        <nav aria-label="Main navigation">
          <Link to="/delivery">Delivery</Link>
          <Link className="basket-link" to="/cart">
            <ShoppingBag size={19} />
            <span>Basket ({count})</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export const CategoryNav = ({
  category,
  onCategory,
}: {
  category?: string;
  onCategory?: (value: string) => void;
}) => (
  <nav className="category-nav" aria-label="Product categories">
    {["All groceries", "Chicken", "Vegetables", "Eggs", "Bakery"].map((name) =>
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
    <span>Sukkur</span>
  </nav>
);

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
        <img src={product.image_url} alt="" loading="lazy" />
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
    <strong>Fresh Market</strong>
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
      <ArrowRightIcon size={18} />
    </Link>
  );
};

export {
  ArrowLeftIcon as ArrowLeft,
  ArrowRightIcon as ArrowRight,
  MagnifyingGlassIcon as Search,
} from "@phosphor-icons/react/ssr";
