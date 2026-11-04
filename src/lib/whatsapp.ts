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
    ...lines.map(({ product, quantity }) => {
      const estimated = isVariableWeight(product);

      const amount = estimated
        ? `${quantity}x`
        : formatQuantity(product, quantity);

      return `${product.name} ${amount} = ${estimated ? "~" : ""}${formatMoney(productLineTotal(product, quantity))}`;
    }),
    "",
    `Items total: ${formatMoney(total)}`,
    "Bill may change on WhatsApp.",
  ].join("\n");

export const whatsappOrderUrl = (lines: CartLine[], total: number) => {
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappOrderText(lines, total))}`;

  if (url.length > 2000) {
    throw new WhatsAppOrderTooLongError("WhatsApp order is too long");
  }

  return url;
};
