import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { ArrowRight, CheckoutHeader, Header } from "../components/storefront";
import { Button } from "../components/ui/button";
import { useCart } from "../lib/cart";
import { formatMoney, formatQuantity } from "../lib/format";
import {
  isVariableWeight,
  minimumOrderRs,
  productLineTotal,
} from "../lib/products";
import {
  WhatsAppOrderTooLongError,
  whatsappOrderUrl,
  whatsappPhoneNumber,
} from "../lib/whatsapp";

const CartPage = () => {
  const { lines, count, countLabel, total, remove, exceedsLimit } = useCart();

  const navigate = useNavigate();
  const [error, setError] = useState("");
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
              {lines.map((line) => {
                const { product, quantity } = line;
                const variableWeight = isVariableWeight(product);

                return (
                  <article key={product.id} className="basket-line">
                    <Link
                      className="basket-image"
                      aria-label={product.name}
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
                        {product.name}
                      </Link>
                    </div>
                    <div className="line-quantity">
                      <span>{formatQuantity(product, quantity)}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${product.name}`}
                        onClick={() => remove(product.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
                  Some saved items exceed the item limit. Remove them and add a
                  smaller amount before ordering.
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
    </div>
  );
};

export const Route = createFileRoute("/_catalog/cart")({ component: CartPage });
