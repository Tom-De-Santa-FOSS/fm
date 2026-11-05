import { isVariableWeight, productWeightGrams } from "./products";
import type { Product } from "./products";

export const formatMoney = (amount: number) =>
  `Rs ${(Math.ceil(amount / 5) * 5).toLocaleString("en-PK")}`;

export const formatQuantity = (product: Product, quantity: number) => {
  const unitGrams = productWeightGrams(product);

  if (unitGrams !== null) {
    const grams = Math.round(quantity * unitGrams);

    return grams < 1000 ? `${grams} g` : `${grams / 1000} kg`;
  }

  if (isVariableWeight(product)) {
    return `${quantity} item${quantity === 1 ? "" : "s"}`;
  }

  return `${quantity} ${product.unit}`;
};
