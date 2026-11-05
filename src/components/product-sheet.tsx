import { Dialog } from "@base-ui/react/dialog";
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
import { useMobileSheet } from "./use-mobile-sheet";

export const ProductSheet = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const { add } = useCart();
  const mobile = useMobileSheet();
  const Overlay = mobile ? Drawer : Dialog;
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
    <Overlay.Root
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <Overlay.Portal>
        <Overlay.Backdrop className="sheet-backdrop" />
        <Overlay.Viewport className="sheet-viewport">
          <Overlay.Popup className="product-sheet">
            <div className="sheet-controls">
              {mobile && <div className="sheet-grabber" aria-hidden="true" />}
              <Overlay.Close
                className="sheet-close"
                aria-label="Close product details"
              >
                <X size={20} />
              </Overlay.Close>
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
                <Overlay.Title>{product.name}</Overlay.Title>
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
                    Estimated at 1 kg each. Final price depends on weight.
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
                    ? `Add ${formatQuantity(product, amount)} · ${variable ? "~" : ""}${formatMoney(productLineTotal(product, amount))}`
                    : "Choose an amount"}
                </Button>
              </div>
            </div>
          </Overlay.Popup>
        </Overlay.Viewport>
      </Overlay.Portal>
    </Overlay.Root>
  );
};
