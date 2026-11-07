import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CheckoutHeader, Header } from "../components/storefront";
import { useCart } from "../lib/cart";
import {
  WhatsAppOrderTooLongError,
  whatsappOrderText,
  whatsappOrderUrl,
} from "../lib/whatsapp";

const HandoffPage = () => {
  const { lines, count, total, exceedsLimit, canOrder } = useCart();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!canOrder) {
    return (
      <div className="page checkout-page">
        <Header basketCount={count} />
        <CheckoutHeader
          title="Order on WhatsApp"
          backTo="/cart"
          backLabel="Basket"
        />
        <main className="shop-main handoff-page">
          <h1>Your basket is not ready to order.</h1>
          <p>
            {exceedsLimit
              ? "Reduce items that exceed the item limit before sending an order."
              : "Estimated items must reach Rs 1,000 before you can send an order."}
          </p>
          <Link to="/cart">Review basket</Link>
        </main>
      </div>
    );
  }

  const text = whatsappOrderText(lines, total);
  let url: string | undefined;

  try {
    url = whatsappOrderUrl(lines, total);
  } catch (error) {
    if (!(error instanceof WhatsAppOrderTooLongError)) {
      throw error;
    }
  }

  return (
    <div className="page checkout-page">
      <Header basketCount={count} />
      <CheckoutHeader
        title="Order on WhatsApp"
        backTo="/cart"
        backLabel="Basket"
      />
      <main className="shop-main handoff-page">
        <Link to="/cart">← Basket</Link>
        <h1>Order on WhatsApp</h1>
        <p>
          Your order is not confirmed until you send the message and the store
          replies.
        </p>
        <pre>{text}</pre>
        {url ? (
          <a
            className="solid-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open WhatsApp again
          </a>
        ) : (
          <p>
            This basket is too large for one WhatsApp link. Copy the order text
            instead.
          </p>
        )}
        <button
          type="button"
          className="copy-order"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopiedText(text);
            } catch {
              setCopiedText(null);
            }
          }}
        >
          {copiedText === text ? "Copied" : "Copy order text"}
        </button>
      </main>
    </div>
  );
};

export const Route = createFileRoute("/_catalog/handoff")({
  component: HandoffPage,
});
