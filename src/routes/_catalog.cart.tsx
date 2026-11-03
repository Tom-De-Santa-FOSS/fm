import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AddToCartSheet } from "../components/add-to-cart-sheet";
import { ArrowRight, CheckoutHeader, Header } from "../components/storefront";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { chickenCutsFor, useCart } from "../lib/cart";
import type { CartLine } from "../lib/cart";
import { formatMoney, formatQuantity } from "../lib/format";
import {
  isVariableWeight,
  minimumOrderRs,
  productLineTotal,
  productQuantityLimit,
  productQuantityStep,
  productWeightGrams,
} from "../lib/products";
import {
  WhatsAppOrderTooLongError,
  whatsappOrderUrl,
  whatsappPhoneNumber,
} from "../lib/whatsapp";

const CartPage = () => {
  const { lines, count, countLabel, total, changeLine, exceedsLimit } =
    useCart();

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
    <div className="page checkout-page">
      <Header basketCount={count} />
      <CheckoutHeader title="Your basket" backTo="/" backLabel="Shop" />
      <main
        className={`shop-main basket-page${remaining > 0 ? " basket-page--incomplete" : ""}`}
      >
        <h1 className="basket-heading">
          Your basket <small>{countLabel}</small>
        </h1>
        {lines.length ? (
          <div className="basket-layout">
            <div className="basket-lines">
              <div className="basket-count">
                <span>{countLabel}</span>
                <Link to="/">Add more items</Link>
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
                const step = productQuantityStep(product);

                return (
                  <article key={key} className="basket-line">
                    <Link
                      className="basket-image"
                      aria-label={cut ? `${cut} chicken` : product.name}
                      to="/product/$id"
                      params={{ id: String(product.id) }}
                    >
                      <Image
                        src={product.image_url}
                        alt=""
                        layout="fixed"
                        width={72}
                        height={72}
                        loading="lazy"
                        unstyled
                      />
                    </Link>
                    <div className="basket-line-info">
                      <Link
                        to="/product/$id"
                        params={{ id: String(product.id) }}
                      >
                        {cut ? `${cut} chicken` : product.name}
                      </Link>
                    </div>
                    <div className="line-quantity">
                      <button
                        type="button"
                        aria-label={`${quantity <= step ? "Remove" : "Decrease"} ${cut ? `${cut} chicken` : product.name}`}
                        onClick={() =>
                          changeLine(key, {
                            quantity: quantity <= step ? 0 : quantity - step,
                          })
                        }
                      >
                        {quantity <= step ? (
                          <Trash2 size={18} />
                        ) : (
                          <Minus size={18} />
                        )}
                      </button>
                      {weighted ? (
                        <button
                          type="button"
                          className="line-quantity-value"
                          aria-label={`Edit weight for ${cut ? `${cut} chicken` : product.name}: ${formatQuantity(product, quantity)}`}
                          onClick={() => setEditing(line)}
                        >
                          {formatQuantity(product, quantity)}
                        </button>
                      ) : (
                        <span>{formatQuantity(product, quantity)}</span>
                      )}
                      <button
                        type="button"
                        aria-label={`Increase ${cut ? `${cut} chicken` : product.name}`}
                        disabled={
                          quantity + step > productQuantityLimit(product)
                        }
                        onClick={() =>
                          changeLine(key, { quantity: quantity + step })
                        }
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    {cut && (
                      <Select
                        items={chickenCutsFor(product).map((option) => ({
                          label: option,
                          value: option,
                        }))}
                        value={cut}
                        onValueChange={(value) => {
                          if (value === null) {
                            return;
                          }

                          const result = changeLine(key, { cut: value });

                          setCutError(
                            result
                              ? ""
                              : "These cuts would exceed the item limit when combined. Reduce their weight before changing the cut."
                          );
                        }}
                      >
                        <SelectTrigger
                          className="edit-cut"
                          aria-label={`Edit cut for ${product.name}`}
                        >
                          <SelectValue>{() => "Edit cut"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent className="edit-cut-menu">
                          <SelectGroup>
                            {chickenCutsFor(product).map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                    <strong>
                      {variableWeight
                        ? "After weighing"
                        : formatMoney(productLineTotal(product, quantity))}
                    </strong>
                  </article>
                );
              })}
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
              {remaining === 0 && (
                <>
                  <Button
                    className="order-button order-button--summary"
                    disabled={exceedsLimit}
                    onClick={order}
                  >
                    Order on WhatsApp <ArrowRight data-icon="inline-end" />
                  </Button>
                  <small>
                    Final total confirmed on WhatsApp. Opening chat does not
                    place an order.
                  </small>
                </>
              )}
            </aside>
            <div
              className={`basket-order-dock${remaining > 0 ? " basket-order-dock--incomplete" : ""}`}
            >
              {remaining > 0 ? (
                <Link className="solid-link" to="/">
                  Add more items <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Button
                    className="order-button"
                    disabled={exceedsLimit}
                    onClick={order}
                  >
                    Order on WhatsApp <ArrowRight data-icon="inline-end" />
                  </Button>
                  <small>
                    Final total confirmed on WhatsApp. Opening chat does not
                    place an order.
                  </small>
                </>
              )}
            </div>
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

export const Route = createFileRoute("/_catalog/cart")({ component: CartPage });
