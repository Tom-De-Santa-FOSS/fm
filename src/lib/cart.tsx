import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  isProductQuantity,
  productLineTotal,
  productQuantityStep,
} from "./products";
import type { Product } from "./products";

export type ChickenCut =
  | "Simple cut"
  | "Biryani"
  | "Karahi"
  | "Cubes"
  | "Breast";

export const chickenCutsFor = (product: Product): ChickenCut[] => {
  if (product.id === 1) {
    return ["Simple cut", "Biryani", "Karahi"];
  }

  if (product.id === 2 || product.id === 3) {
    return ["Simple cut", "Cubes", "Breast"];
  }

  return [];
};

const isWeightChicken = (product: Product) =>
  chickenCutsFor(product).length > 0;

export const defaultChickenCut = (product: Product): ChickenCut | undefined => {
  if (product.id === 1) {
    return "Biryani";
  }

  if (product.id === 2) {
    return "Cubes";
  }

  return product.id === 3 ? "Breast" : undefined;
};

const isChickenCut = (product: Product, cut: string): cut is ChickenCut =>
  chickenCutsFor(product).some((option) => option === cut);

export const productForCut = (
  product: Product,
  cut: ChickenCut | undefined,
  products: Product[]
): Product => {
  if (product.id !== 2 && product.id !== 3) {
    return product;
  }

  const id = cut === "Breast" ? 3 : 2;
  const selected = products.find((item) => item.id === id);

  if (!selected) {
    throw new Error(`Missing boneless chicken product ${id}`);
  }

  return selected;
};

const lineKey = (product: Product, cut?: ChickenCut) =>
  cut ? `${product.id}:${cut}` : String(product.id);

export interface CartLine {
  key: string;
  product: Product;
  quantity: number;
  cut?: ChickenCut;
  weight?: number;
}

export interface CartUpdate {
  quantity: number;
  total: number;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  countLabel: string;
  total: number;
  exceedsLimit: boolean;
  add: (
    product: Product,
    quantity: number,
    cut?: ChickenCut
  ) => CartUpdate | null;
  changeLine: (
    key: string,
    update: { cut?: string; quantity?: number }
  ) => CartUpdate | null;
}

const CartContext = createContext<CartValue | null>(null);
const cartStorageKey = "freshmarket-basket";

const cartTotals = (lines: CartLine[]) => {
  let count = 0;
  let total = 0;

  for (const { product, quantity } of lines) {
    count += 1;

    total += productLineTotal(product, quantity);
  }

  return { count, total: Math.round(total * 100) / 100 };
};

// oxlint-disable-next-line complexity -- Local storage needs legacy and chicken entry validation at the read boundary.
const loadCart = (products: Product[]): CartLine[] => {
  try {
    const saved = window.localStorage.getItem(cartStorageKey);

    if (!saved) {
      return [];
    }

    const entries: unknown = JSON.parse(saved);

    if (!Array.isArray(entries)) {
      return [];
    }

    const lines: CartLine[] = [];

    for (const value of entries) {
      /* oxlint-disable anti-slop/no-runtime-typeof -- Validate untrusted localStorage entries before building cart lines. */
      if (
        typeof value !== "object" ||
        value === null ||
        !("id" in value) ||
        !("quantity" in value) ||
        typeof value.id !== "number" ||
        typeof value.quantity !== "number" ||
        !Number.isInteger(value.id) ||
        !Number.isFinite(value.quantity) ||
        value.quantity <= 0
      ) {
        continue;
      }
      /* oxlint-enable anti-slop/no-runtime-typeof */

      let product = products.find((item) => item.id === value.id);

      if (!product) {
        continue;
      }

      /* oxlint-disable anti-slop/no-runtime-typeof -- Validate untrusted localStorage cut and weight fields. */
      let cut: ChickenCut | undefined;

      if (isWeightChicken(product)) {
        cut =
          "cut" in value &&
          typeof value.cut === "string" &&
          isChickenCut(product, value.cut)
            ? value.cut
            : "Simple cut";
      }

      product = productForCut(product, cut, products);
      const key = lineKey(product, cut);

      const quantity =
        isWeightChicken(product) && "weight" in value
          ? value.weight
          : value.quantity;

      if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
        continue;
      }
      /* oxlint-enable anti-slop/no-runtime-typeof */

      if (
        product.available &&
        quantity > 0 &&
        Number.isInteger(quantity / productQuantityStep(product))
      ) {
        const existing = lines.find((line) => line.key === key);

        if (existing) {
          // Preserve saved quantities when old product IDs collapse into one cut.
          // Over-limit lines must be reduced before ordering.
          existing.quantity += quantity;
          existing.weight = cut ? existing.quantity : undefined;
        } else {
          lines.push({
            cut,
            key,
            product,
            quantity,
            weight: cut ? quantity : undefined,
          });
        }
      }
    }

    return lines;
  } catch {
    return [];
  }
};

const saveCart = (lines: CartLine[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      cartStorageKey,
      JSON.stringify(
        lines.map(({ product, quantity, cut, weight }) => ({
          cut,
          id: product.id,
          quantity,
          weight,
        }))
      )
    );
  } catch {
    // The basket still works in memory when browser storage is unavailable.
  }
};

export const CartProvider = ({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const linesRef = useRef(lines);

  useEffect(() => {
    const restored = loadCart(products);
    linesRef.current = restored;

    // Restore after hydration so the server and first client render match.
    // oxlint-disable-next-line react/set-state-in-effect -- Browser storage cannot be read during SSR.
    setLines(restored);
  }, [products]);

  const value = useMemo<CartValue>(() => {
    const { count, total } = cartTotals(lines);

    const commit = (next: CartLine[]) => {
      linesRef.current = next;
      setLines(next);
      saveCart(next);

      return cartTotals(next).total;
    };

    return {
      add: (requestedProduct, amount, cut) => {
        if (
          !isProductQuantity(requestedProduct, amount) ||
          (isWeightChicken(requestedProduct) && cut === undefined) ||
          (cut !== undefined && !isChickenCut(requestedProduct, cut))
        ) {
          return null;
        }

        const product = productForCut(requestedProduct, cut, products);
        const key = lineKey(product, cut);
        const found = linesRef.current.find((item) => item.key === key);
        const quantity = (found?.quantity ?? 0) + amount;

        if (!isProductQuantity(product, quantity)) {
          return null;
        }

        const line = {
          cut,
          key,
          product,
          quantity,
          weight: cut ? quantity : undefined,
        };

        const next = found
          ? linesRef.current.map((item) => (item.key === key ? line : item))
          : [...linesRef.current, line];

        return { quantity, total: commit(next) };
      },
      changeLine: (key, update) => {
        const found = linesRef.current.find((line) => line.key === key);

        if (!found) {
          return null;
        }

        let { cut } = found;

        if (update.cut !== undefined) {
          if (!isChickenCut(found.product, update.cut)) {
            return null;
          }

          const { cut: nextCut } = update;
          cut = nextCut;
        }

        if (update.quantity === 0) {
          const next = linesRef.current.filter((line) => line.key !== key);

          return { quantity: 0, total: commit(next) };
        }

        const product = productForCut(found.product, cut, products);
        const nextKey = lineKey(product, cut);

        const existing = linesRef.current.find(
          (line) => line.key === nextKey && line.key !== key
        );

        const quantity =
          (update.quantity ?? found.quantity) + (existing?.quantity ?? 0);

        const reducing =
          nextKey === key &&
          quantity > 0 &&
          quantity < found.quantity &&
          Number.isInteger(quantity / productQuantityStep(product));

        if (!isProductQuantity(product, quantity) && !reducing) {
          return null;
        }

        const next = linesRef.current.flatMap((line) => {
          if (line.key !== key) {
            return line.key === nextKey ? [] : [line];
          }

          return [
            {
              ...line,
              cut,
              key: nextKey,
              product,
              quantity,
              weight: cut ? quantity : undefined,
            },
          ];
        });

        return { quantity, total: commit(next) };
      },
      count,
      countLabel: `${count} ${count === 1 ? "item" : "items"}`,
      exceedsLimit: lines.some(
        ({ product, quantity }) => !isProductQuantity(product, quantity)
      ),
      lines,
      total,
    };
  }, [lines, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartValue => {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return cart;
};
