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
  minimumOrderRs,
  productLineTotal,
  productQuantityStep,
} from "./products";
import type { Product } from "./products";

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  countLabel: string;
  total: number;
  exceedsLimit: boolean;
  canOrder: boolean;
  add: (product: Product, quantity: number) => boolean;
  decrement: (productId: number) => void;
  remove: (productId: number) => void;
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

// Validate saved data and translate old cut-based entries at the storage boundary.
// oxlint-disable-next-line complexity -- Saved entries need shape, product, legacy, and quantity checks.
const readSavedLine = (
  // oxlint-disable-next-line anti-slop/no-unknown-parameters -- Parse untrusted JSON at the storage boundary.
  value: unknown,
  products: Product[]
): CartLine | null => {
  /* oxlint-disable anti-slop/no-runtime-typeof -- Validate untrusted localStorage data before using it. */
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
    return null;
  }

  let { id } = value;

  if (value.id === 1 && "cut" in value) {
    if (value.cut === "Karahi") {
      id = 19;
    } else if (value.cut === "Biryani") {
      id = 20;
    }
  }

  if (
    (value.id === 2 || value.id === 3) &&
    "cut" in value &&
    typeof value.cut === "string"
  ) {
    id = value.cut === "Breast" ? 3 : 2;
  }

  const product = products.find((item) => item.id === id);

  if (!product) {
    return null;
  }

  const quantity =
    value.id <= 3 && "weight" in value ? value.weight : value.quantity;

  if (
    typeof quantity !== "number" ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !product.available ||
    !Number.isInteger(quantity / productQuantityStep(product))
  ) {
    return null;
  }
  /* oxlint-enable anti-slop/no-runtime-typeof */

  return { product, quantity };
};

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
      const line = readSavedLine(value, products);

      if (!line) {
        continue;
      }

      const existing = lines.find(
        (item) => item.product.id === line.product.id
      );

      if (existing) {
        // Old cut variants can collapse into one product; preserve their quantities.
        existing.quantity += line.quantity;
      } else {
        lines.push(line);
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
        lines.map(({ product, quantity }) => ({
          id: product.id,
          quantity,
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
  const restored = useRef(false);

  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      const saved = loadCart(products);
      linesRef.current = saved;

      // Restore after hydration so the server and first client render match.
      // oxlint-disable-next-line react/set-state-in-effect -- Browser storage cannot be read during SSR.
      setLines(saved);

      return;
    }

    const previous = linesRef.current;

    const next = previous.flatMap(({ product, quantity }) => {
      const current = products.find((item) => item.id === product.id);

      return current &&
        current.available &&
        Number.isInteger(quantity / productQuantityStep(current))
        ? [{ product: current, quantity }]
        : [];
    });

    if (
      next.length === previous.length &&
      next.every((line, index) => line.product === previous[index].product)
    ) {
      return;
    }

    linesRef.current = next;
    setLines(next);
    saveCart(next);
  }, [products]);

  const value = useMemo<CartValue>(() => {
    const { count, total } = cartTotals(lines);

    const commit = (next: CartLine[]) => {
      linesRef.current = next;
      setLines(next);
      saveCart(next);
    };

    const exceedsLimit = lines.some(
      ({ product, quantity }) => !isProductQuantity(product, quantity)
    );

    return {
      add: (product, amount) => {
        if (!isProductQuantity(product, amount)) {
          return false;
        }

        const found = linesRef.current.find(
          (item) => item.product.id === product.id
        );

        const quantity = (found?.quantity ?? 0) + amount;

        if (!isProductQuantity(product, quantity)) {
          return false;
        }

        const line = { product, quantity };

        const next = found
          ? linesRef.current.map((item) =>
              item.product.id === product.id ? line : item
            )
          : [...linesRef.current, line];

        commit(next);

        return true;
      },
      canOrder: lines.length > 0 && total >= minimumOrderRs && !exceedsLimit,
      count,
      countLabel: `${count} ${count === 1 ? "item" : "items"}`,
      decrement: (productId) => {
        const line = linesRef.current.find(
          (item) => item.product.id === productId
        );

        if (!line) {
          return;
        }

        const quantity = line.quantity - productQuantityStep(line.product);

        commit(
          quantity > 0
            ? linesRef.current.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
              )
            : linesRef.current.filter((item) => item.product.id !== productId)
        );
      },
      exceedsLimit,
      lines,
      remove: (productId) => {
        commit(
          linesRef.current.filter((line) => line.product.id !== productId)
        );
      },
      total,
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartValue => {
  const cart = useContext(CartContext);

  if (!cart) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return cart;
};
