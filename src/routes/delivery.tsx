import { Link, createFileRoute } from "@tanstack/react-router";

import { ArrowLeft, Header } from "../components/storefront";
import { formatMoney } from "../lib/format";
import { minimumOrderRs } from "../lib/products";
import { whatsappNumber, whatsappPhoneNumber } from "../lib/whatsapp";

const DeliveryPage = () => (
  <div className="page">
    <Header />
    <main className="shop-main delivery-page">
      <Link className="back-link" to="/">
        <ArrowLeft size={18} /> Shop
      </Link>
      <h1>Sukkur</h1>
      <dl className="delivery-facts">
        <div>
          <dt>Minimum order</dt>
          <dd>{formatMoney(minimumOrderRs)} in items</dd>
        </div>
        <div>
          <dt>Delivery charge</dt>
          <dd>Confirmed on WhatsApp</dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd>Confirmed before your order</dd>
        </div>
        <div>
          <dt>Payment</dt>
          <dd>Arrange on WhatsApp</dd>
        </div>
        <div>
          <dt>Chicken</dt>
          <dd>Whole chickens are weighed; chest cuts come in 1 kg units</dd>
        </div>
      </dl>
      <a className="solid-link" href={`https://wa.me/${whatsappNumber}`}>
        Contact on WhatsApp
      </a>
      <a className="delivery-phone" href={`tel:+${whatsappNumber}`}>
        {whatsappPhoneNumber}
      </a>
    </main>
  </div>
);

export const Route = createFileRoute("/delivery")({ component: DeliveryPage });
