import { Drawer } from "@base-ui/react/drawer";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { CheckIcon, XIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";

import { defaultChickenCut, useCart } from "../lib/cart";
import type { CartLine } from "../lib/cart";
import { formatMoney, formatQuantity } from "../lib/format";
import {
  isProductQuantity,
  isVariableWeight,
  productLineTotal,
  productWeightGrams,
} from "../lib/products";
import type { Product } from "../lib/products";
import { AmountField } from "./amount-field";
import { Button } from "./ui/button";

export const AddToCartSheet = ({
  product,
  line,
  onClose,
}: {
  product: Product;
  line?: CartLine;
  onClose: () => void;
}) => {
  const { add, changeLine } = useCart();
  const [open, setOpen] = useState(true);
  const [quantity, setQuantity] = useState<number | null>(line?.quantity ?? 1);
  const [error, setError] = useState("");
  const valid = quantity !== null && isProductQuantity(product, quantity);
  const variable = isVariableWeight(product);
  const grams = productWeightGrams(product);

  const changeQuantity = (value: number | null) => {
    setQuantity(value);
    setError("");
  };

  const submit = () => {
    if (quantity === null || !valid) {
      return;
    }

    const result = line
      ? changeLine(line.key, { quantity })
      : add(product, quantity, defaultChickenCut(product));

    if (!result) {
      setError(
        "This would exceed the item limit. Choose a smaller amount or edit the item in your basket."
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
                <XIcon size={20} />
              </Drawer.Close>
            </div>
            <div className="sheet-scroll">
              <Drawer.Title>
                {line?.cut ? `${line.cut} chicken` : product.name}
              </Drawer.Title>
              <p className="sheet-price">
                {formatMoney(product.price_rs)} / {product.unit}
              </p>
              <Drawer.Description className="add-sheet-description">
                {grams === null ? "How many would you like?" : "Choose weight"}
              </Drawer.Description>
              {grams !== null && (
                <RadioGroup
                  className="weight-options"
                  aria-label="Choose weight"
                  value={quantity === null ? null : quantity * grams}
                  onValueChange={(weight) => {
                    if (weight !== null) {
                      changeQuantity(weight / grams);
                    }
                  }}
                >
                  {[250, 500, 1000].map((weight) => (
                    <label key={weight}>
                      <Radio.Root
                        value={weight}
                        className="weight-option"
                        disabled={!isProductQuantity(product, weight / grams)}
                      >
                        <span>{formatQuantity(product, weight / grams)}</span>
                        <span className="weight-option-price">
                          {formatMoney(
                            productLineTotal(product, weight / grams)
                          )}
                        </span>
                        <Radio.Indicator
                          keepMounted
                          className="weight-option-check"
                          aria-hidden="true"
                        >
                          <CheckIcon size={16} weight="bold" />
                        </Radio.Indicator>
                      </Radio.Root>
                    </label>
                  ))}
                </RadioGroup>
              )}
              <AmountField
                product={product}
                value={quantity}
                onValueChange={changeQuantity}
              />
              {variable && (
                <p className="weighing-note">
                  Final price confirmed after weighing.
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
                <span>{line ? "Update basket" : "Add to basket"}</span>
                {valid && quantity !== null && (
                  <span>
                    {variable
                      ? formatQuantity(product, quantity)
                      : formatMoney(productLineTotal(product, quantity))}
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
