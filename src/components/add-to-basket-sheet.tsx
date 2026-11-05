import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { Image } from "@unpic/react";
import { X } from "lucide-react";
import { useState } from "react";

import { useCart } from "../lib/cart";
import { formatMoney, formatQuantity } from "../lib/format";
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
import { useMobileSheet } from "./use-mobile-sheet";
import { WeightSelector } from "./weight-selector";

const AddSelection = ({
  product,
  layout,
  open,
  onAdded,
}: {
  product: Product;
  layout: "compact" | "detail";
  open: boolean;
  onAdded: () => void;
}) => {
  const { add } = useCart();
  const [quantity, setQuantity] = useState<number | null>(1);
  const [error, setError] = useState("");
  const valid = quantity !== null && isProductQuantity(product, quantity);
  const variable = isVariableWeight(product);
  const grams = productWeightGrams(product);

  const estimatedTotal =
    valid && quantity !== null
      ? formatMoney(productLineTotal(product, quantity))
      : "";

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

    onAdded();
  };

  let buttonLabel = "Choose an amount";

  if (valid && quantity !== null) {
    buttonLabel = `Add ${formatQuantity(product, quantity)} · ${variable ? "~" : ""}${estimatedTotal}`;
  }

  return (
    <>
      {grams !== null && !isWholeKgOnly(product) ? (
        <WeightSelector
          product={product}
          grams={grams}
          onValueChange={changeQuantity}
        />
      ) : (
        <AmountField
          product={product}
          value={quantity}
          onValueChange={changeQuantity}
        />
      )}
      {variable && (
        <p className="weighing-note">
          Estimate uses 1 kg per item. Final price confirmed after weighing.
        </p>
      )}
      {error && (
        <p className="amount-error" role="alert">
          {error}
        </p>
      )}
      <Button className="sheet-add" disabled={!open || !valid} onClick={submit}>
        {layout === "compact" ? (
          <>
            <span>Add to basket</span>
            {valid && quantity !== null && (
              <span>
                {variable ? "~" : ""}
                {estimatedTotal}
              </span>
            )}
          </>
        ) : (
          buttonLabel
        )}
      </Button>
    </>
  );
};

export const AddToBasketSheet = ({
  product,
  onClose,
  layout,
}: {
  product: Product;
  onClose: () => void;
  layout: "compact" | "detail";
}) => {
  const mobile = useMobileSheet();
  const Overlay = mobile ? Drawer : Dialog;
  const [open, setOpen] = useState(true);
  const grams = productWeightGrams(product);

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
          <Overlay.Popup
            className={
              layout === "compact"
                ? "product-sheet add-to-cart-sheet"
                : "product-sheet"
            }
            finalFocus={
              layout === "compact"
                ? () =>
                    document.querySelector<HTMLElement>(
                      `[data-product-id="${product.id}"] .card-quantity button, [data-product-id="${product.id}"] .card-action`
                    ) ?? true
                : undefined
            }
          >
            <div className="sheet-controls">
              {mobile && <div className="sheet-grabber" aria-hidden="true" />}
              <Overlay.Close
                className="sheet-close"
                aria-label={
                  layout === "compact"
                    ? "Close amount selection"
                    : "Close product details"
                }
              >
                <X size={20} />
              </Overlay.Close>
            </div>
            <div className="sheet-scroll">
              {layout === "detail" && (
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
              )}
              <div
                className={layout === "detail" ? "sheet-content" : undefined}
              >
                <Overlay.Title>{product.name}</Overlay.Title>
                <p className="sheet-price">
                  {layout === "detail" ? (
                    <>
                      <strong>{formatMoney(product.price_rs)}</strong> /{" "}
                      {product.unit}
                    </>
                  ) : (
                    <>
                      {formatMoney(product.price_rs)} / {product.unit}
                    </>
                  )}
                </p>
                {layout === "compact" && (
                  <Overlay.Description className="add-sheet-description">
                    {grams === null
                      ? "How many would you like?"
                      : "Choose weight"}
                  </Overlay.Description>
                )}
                <AddSelection
                  product={product}
                  layout={layout}
                  open={open}
                  onAdded={() => setOpen(false)}
                />
              </div>
            </div>
          </Overlay.Popup>
        </Overlay.Viewport>
      </Overlay.Portal>
    </Overlay.Root>
  );
};
