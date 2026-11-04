import { Drawer } from "@base-ui/react/drawer";
import { X } from "lucide-react";
import { useState } from "react";

import { useCart } from "../lib/cart";
import { formatMoney } from "../lib/format";
import {
  isProductQuantity,
  isVariableWeight,
  isWholeKgOnly,
  productLineTotal,
  productWeightGrams,
} from "../lib/products";
import type { Product } from "../lib/products";
import { AmountField } from "./amount-field";
import { Button } from "./ui/button";
import { WeightSelector } from "./weight-selector";

export const AddToCartSheet = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const { add } = useCart();
  const [open, setOpen] = useState(true);
  const [quantity, setQuantity] = useState<number | null>(1);
  const [error, setError] = useState("");
  const valid = quantity !== null && isProductQuantity(product, quantity);
  const variable = isVariableWeight(product);
  const wholeKgOnly = isWholeKgOnly(product);
  const grams = productWeightGrams(product);

  const changeQuantity = (value: number | null) => {
    setQuantity(value);
    setError("");
  };

  const submit = () => {
    if (quantity === null || !valid) {
      return;
    }

    if (!add(product, quantity)) {
      setError(
        "This would exceed the item limit. Choose a smaller amount or remove the item from your basket first."
      );

      return;
    }

    setOpen(false);
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.Viewport className="sheet-viewport">
          <Drawer.Popup className="product-sheet add-to-cart-sheet">
            <div className="sheet-controls">
              <div className="sheet-grabber" aria-hidden="true" />
              <Drawer.Close
                className="sheet-close"
                aria-label="Close amount selection"
              >
                <X size={20} />
              </Drawer.Close>
            </div>
            <div className="sheet-scroll">
              <Drawer.Title>{product.name}</Drawer.Title>
              <p className="sheet-price">
                {formatMoney(product.price_rs)} / {product.unit}
              </p>
              <Drawer.Description className="add-sheet-description">
                {grams === null ? "How many would you like?" : "Choose weight"}
              </Drawer.Description>
              {grams !== null && !wholeKgOnly && (
                <WeightSelector
                  product={product}
                  grams={grams}
                  initialQuantity={1}
                  onValueChange={changeQuantity}
                />
              )}
              {(grams === null || wholeKgOnly) && (
                <AmountField
                  product={product}
                  value={quantity}
                  onValueChange={changeQuantity}
                />
              )}
              {variable && (
                <p className="weighing-note">
                  Estimate uses 1 kg each. Final price confirmed after weighing.
                </p>
              )}
              {error && (
                <p className="amount-error" role="alert">
                  {error}
                </p>
              )}
              <Button
                className="sheet-add"
                disabled={!open || !valid}
                onClick={submit}
              >
                <span>Add to basket</span>
                {valid && quantity !== null && (
                  <span>
                    {variable ? "~" : ""}
                    {formatMoney(productLineTotal(product, quantity))}
                  </span>
                )}
              </Button>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
