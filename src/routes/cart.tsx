import { MinusIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react/ssr";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AddToCartSheet } from "../components/add-to-cart-sheet";
import {
  ArrowRight,
  CategoryNav,
  Footer,
  Header,
} from "../components/storefront";
import { Button } from "../components/ui/button";
import { chickenCutsFor, useCart } from "../lib/cart";
import type { CartLine } from "../lib/cart";
import { formatMoney, formatQuantity } from "../lib/format";
import {
  isVariableWeight,
  minimumOrderRs,
  productLineTotal,
  productQuantityLimit,
  productWeightGrams,
} from "../lib/products";
import {
  WhatsAppOrderTooLongError,
  whatsappOrderUrl,
  whatsappPhoneNumber,
} from "../lib/whatsapp";

const CartPage = () => {
  const { lines, countLabel, total, changeLine, exceedsLimit } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [cutError, setCutError] = useState("");
  const [editing, setEditing] = useState<CartLine | null>(null);
  const remaining = Math.max(0, minimumOrderRs - total);

  const variable = lines.some(({ product }) => isVariableWeight(product));

  const order = () => {
    if (!lines.length || remaining || exceedsLimit) {
      return;
    }

    let url: string;

    try {
      url = whatsappOrderUrl(lines, total);
    } catch (error_) {
      setError(
        error_ instanceof WhatsAppOrderTooLongError
          ? "This basket is too large for one WhatsApp message. Remove some items or call us instead. Your basket is still here."
          : "Couldn't open WhatsApp. Try again or call us instead. Your basket is still here."
      );

      return;
    }

    const popup = window.open("about:blank", "_blank");

    if (!popup) {
      setError(
        "Couldn't open WhatsApp. Try again or call us instead. Your basket is still here."
      );

      return;
    }

    try {
      popup.opener = null;
      popup.location.replace(url);
      setError("");
      navigate({ to: "/handoff" });
    } catch {
      popup.close();
      setError(
        "Couldn't open WhatsApp. Try again or call us instead. Your basket is still here."
      );
    }
  };

  return (
    <div className="page">
      <Header />
      <main className="shop-main basket-page">
        <CategoryNav />
        <div className="basket-heading">
          <h1>
            Your basket <small>{countLabel}</small>
          </h1>
          <Link to="/">Continue shopping →</Link>
        </div>
        {lines.length ? (
          <div className="basket-layout">
            <div className="basket-lines">
              <div className="basket-columns">
                <span>Item</span>
                <span>Weight / quantity</span>
                <span>Subtotal</span>
              </div>
              {cutError && (
                <p className="order-error" role="alert">
                  {cutError}
                </p>
              )}
              {lines.map((line) => {
                const { key, product, quantity, cut } = line;
                const variableWeight = isVariableWeight(product);
                const weighted = productWeightGrams(product) !== null;

                return (
                  <article key={key} className="basket-line">
                    <Link
                      className="basket-image"
                      aria-label={cut ? `${cut} chicken` : product.name}
                      to="/product/$id"
                      params={{ id: String(product.id) }}
                    >
                      <img src={product.image_url} alt="" />
                    </Link>
                    <div className="basket-line-info">
                      <Link
                        to="/product/$id"
                        params={{ id: String(product.id) }}
                      >
                        {cut ? `${cut} chicken` : product.name}
                      </Link>
                      {cut && (
                        <label className="edit-cut">
                          Edit cut
                          <select
                            aria-label={`Cut for ${product.name}`}
                            value={cut}
                            onChange={(event) => {
                              const result = changeLine(key, {
                                cut: event.target.value,
                              });

                              setCutError(
                                result
                                  ? ""
                                  : "These cuts would exceed the item limit when combined. Reduce their weight before changing the cut."
                              );
                            }}
                          >
                            {chickenCutsFor(product).map((option) => (
                              <option key={option}>{option}</option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                    {weighted ? (
                      <div className="line-weight">
                        <button
                          type="button"
                          className="edit-weight"
                          aria-label={`Edit weight for ${cut ? `${cut} chicken` : product.name}`}
                          onClick={() => setEditing(line)}
                        >
                          {formatQuantity(product, quantity)}{" "}
                          <small>Edit weight</small>
                        </button>
                        <button
                          type="button"
                          className="remove-line"
                          aria-label={`Remove ${cut ? `${cut} chicken` : product.name}`}
                          onClick={() => changeLine(key, { quantity: 0 })}
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                    ) : (
                      <div className="line-quantity">
                        <button
                          type="button"
                          aria-label={`Remove one ${product.name}`}
                          onClick={() =>
                            changeLine(key, { quantity: quantity - 1 })
                          }
                        >
                          {quantity === 1 ? (
                            <TrashIcon size={17} />
                          ) : (
                            <MinusIcon size={17} />
                          )}
                        </button>
                        <span>{quantity}</span>
                        <button
                          type="button"
                          aria-label={`Add one ${product.name}`}
                          disabled={quantity >= productQuantityLimit(product)}
                          onClick={() =>
                            changeLine(key, { quantity: quantity + 1 })
                          }
                        >
                          <PlusIcon size={17} />
                        </button>
                      </div>
                    )}
                    <strong>
                      {variableWeight
                        ? "After weighing"
                        : formatMoney(productLineTotal(product, quantity))}
                    </strong>
                  </article>
                );
              })}
              <Link className="continue-link" to="/">
                + Add more items
              </Link>
            </div>
            <aside className="order-summary">
              <h2>Order summary</h2>
              <div className="summary-total">
                <span>Priced items</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <span>Confirmed in chat</span>
              </div>
              {variable && (
                <p>Whole chicken and chest cuts are priced after weighing.</p>
              )}
              {remaining > 0 && (
                <output className="minimum-note">
                  Add {formatMoney(remaining)} more in priced items to reach the{" "}
                  {formatMoney(minimumOrderRs)} minimum.
                </output>
              )}
              {exceedsLimit && (
                <p className="order-error" role="alert">
                  Some saved items exceed the item limit after combining
                  matching cuts. Reduce their weight or quantity before
                  ordering.
                </p>
              )}
              {error && (
                <p className="order-error" role="alert">
                  {error}{" "}
                  <a href="tel:+923337125030">Call {whatsappPhoneNumber}</a>
                </p>
              )}
              <Button
                className="order-button"
                disabled={remaining > 0 || exceedsLimit}
                onClick={order}
              >
                Order on WhatsApp <ArrowRight data-icon="inline-end" />
              </Button>
              <small>
                Final total confirmed on WhatsApp. Opening chat does not place
                an order.
              </small>
            </aside>
          </div>
        ) : (
          <div className="empty-basket">
            <h2>Nothing in your basket yet.</h2>
            <p>Browse the market and add what you need.</p>
            <Link className="solid-link" to="/">
              Shop groceries <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </main>
      <Footer />
      {editing && (
        <AddToCartSheet
          key={editing.key}
          product={editing.product}
          line={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

export const Route = createFileRoute("/cart")({ component: CartPage });
