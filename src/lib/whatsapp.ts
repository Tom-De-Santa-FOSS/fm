import type { CartLine } from "./cart";
import { formatMoney, formatQuantity } from "./format";
import { isVariableWeight, productLineTotal } from "./products";

export const whatsappPhoneNumber = "+92 333 7125030";
export const whatsappNumber = "923337125030";

export class WhatsAppOrderTooLongError extends Error {
  name = "WhatsAppOrderTooLongError";
}

export const whatsappOrderText = (lines: CartLine[], total: number) =>
  [
    "Hi, I'd like to order:",
    "",
    ...lines.map(({ product, quantity }) => {
      if (isVariableWeight(product)) {
        return `${product.name}: ${quantity} ${product.id === 4 ? "chickens" : "cuts"} at ${formatMoney(product.price_rs)}/kg. Please confirm actual weight and price.`;
      }

      return `${product.name}: ${formatQuantity(product, quantity)} = ${formatMoney(productLineTotal(product, quantity))} (${formatMoney(product.price_rs)} per ${product.unit})`;
    }),
    "",
    `Priced items: ${formatMoney(total)}`,
    "Delivery charge: please confirm on WhatsApp.",
    "Please confirm availability, whole chicken weight and the final total.",
  ].join("\n");

export const whatsappOrderUrl = (lines: CartLine[], total: number) => {
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappOrderText(lines, total))}`;

  if (url.length > 2000) {
    throw new WhatsAppOrderTooLongError("WhatsApp order is too long");
  }

  return url;
};
