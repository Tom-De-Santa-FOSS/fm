export interface Product {
  available: boolean;
  tag: string;
  description: string;
  id: number;
  image_url: string;
  name: string;
  price_rs: number;
  unit: "kg" | "loaf" | "bunch" | "dozen" | "250g" | "500g";
  ai_keywords: string;
  selling_rule: "standard" | "variable_weight" | "whole_kg_only";
}

export const minimumOrderRs = 1000;

export const productQuantityLimit = (product: Product): number =>
  product.available ? 10 : 0;

export const isVariableWeight = (product: Product) =>
  product.selling_rule === "variable_weight";

export const isWholeKgOnly = (product: Product) =>
  product.selling_rule === "whole_kg_only";

// Quantity remains a multiple of the catalog's priced unit, including in saved baskets.
export const productWeightGrams = (product: Product): number | null => {
  if (isVariableWeight(product)) {
    return null;
  }

  if (product.unit === "kg") {
    return 1000;
  }

  return product.unit.endsWith("g") ? Number(product.unit.slice(0, -1)) : null;
};

export const productQuantityStep = (product: Product) => {
  if (isWholeKgOnly(product)) {
    return 1;
  }

  const grams = productWeightGrams(product);

  return grams === null ? 1 : 250 / grams;
};

export const isProductQuantity = (product: Product, quantity: number) => {
  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > productQuantityLimit(product)
  ) {
    return false;
  }

  return Number.isInteger(quantity / productQuantityStep(product));
};

// A whole chicken is estimated at 1 kg until it is weighed.
export const productLineTotal = (product: Product, quantity: number) =>
  Math.round(product.price_rs * quantity * 100) / 100;
