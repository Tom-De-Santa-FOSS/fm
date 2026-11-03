import { Drawer } from "@base-ui/react/drawer";
import { Image } from "@unpic/react";
import { X } from "lucide-react";
import { useState } from "react";

import { useCart } from "../lib/cart";
import { formatMoney, formatQuantity } from "../lib/format";
import type { Product } from "../lib/products";
import {
  isProductQuantity,
  isVariableWeight,
  productLineTotal,
} from "../lib/products";
import { AmountField } from "./amount-field";
import { Button } from "./ui/button";

export const ProductSheet = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const { add } = useCart();
  const [open, setOpen] = useState(true);
  const [amount, setAmount] = useState<number | null>(1);
  const [error, setError] = useState("");
  const variable = isVariableWeight(product);
  const valid = amount !== null && isProductQuantity(product, amount);

  const submit = () => {
    if (amount === null || !valid) {
      return;
    }

    if (!add(product, amount)) {
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
          <Drawer.Popup className="product-sheet">
            <div className="sheet-controls">
              <div className="sheet-grabber" aria-hidden="true" />
              <Drawer.Close
                className="sheet-close"
                aria-label="Close product details"
              >
                <X size={20} />
              </Drawer.Close>
            </div>
            <div className="sheet-scroll">
              <div className="sheet-photo">
                <Image
                  src={product.image_url}
                  alt=""
                  layout="fullWidth"
                  height={540}
                  loading="eager"
                  unstyled
                />
              </div>
              <div className="sheet-content">
                <Drawer.Title>{product.name}</Drawer.Title>
                <p className="sheet-price">
                  <strong>{formatMoney(product.price_rs)}</strong> /{" "}
                  {product.unit}
                </p>
                <AmountField
                  product={product}
                  value={amount}
                  onValueChange={(value) => {
                    setAmount(value);
                    setError("");
                  }}
                />
                {variable && (
                  <p className="weighing-note">
                    Priced after weighing at {formatMoney(product.price_rs)} per
                    kg
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
                  {valid && amount !== null
                    ? `Add ${formatQuantity(product, amount)}${variable ? "" : ` · ${formatMoney(productLineTotal(product, amount))}`}`
                    : "Choose an amount"}
                </Button>
              </div>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
