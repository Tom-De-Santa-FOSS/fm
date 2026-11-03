import { Drawer } from "@base-ui/react/drawer";
import { Select } from "@base-ui/react/select";
import {
  CaretDownIcon,
  XIcon as X,
  CheckIcon as Check,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";

import {
  chickenCutsFor,
  defaultChickenCut,
  productForCut,
  useCart,
} from "../lib/cart";
import type { ChickenCut } from "../lib/cart";
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

  const [cut, setCut] = useState<ChickenCut>(
    () => defaultChickenCut(product) ?? "Biryani"
  );

  const chicken = product.id >= 1 && product.id <= 3;
  const variable = isVariableWeight(product);
  const selectedProduct = productForCut(product, cut);

  const cuts = chickenCutsFor(selectedProduct);
  const valid = amount !== null && isProductQuantity(selectedProduct, amount);

  const submit = () => {
    if (amount === null || !valid) {
      return;
    }

    if (!add(selectedProduct, amount, chicken ? cut : undefined)) {
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
                <img src={selectedProduct.image_url} alt="" />
              </div>
              <div className="sheet-content">
                <Drawer.Title>{selectedProduct.name}</Drawer.Title>
                <p className="sheet-price">
                  <strong>{formatMoney(selectedProduct.price_rs)}</strong> /{" "}
                  {selectedProduct.unit}
                </p>
                {chicken && (
                  <Select.Root
                    value={cut}
                    onValueChange={(value) => {
                      if (value !== null) {
                        setCut(value);
                      }
                    }}
                  >
                    <Select.Label className="cut-field">Cut</Select.Label>
                    <Select.Trigger className="cut-trigger">
                      <Select.Value />
                      <Select.Icon>
                        <CaretDownIcon size={16} />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner
                        className="select-positioner"
                        alignItemWithTrigger={false}
                        sideOffset={4}
                      >
                        <Select.Popup className="select-popup">
                          <Select.List>
                            <Select.Group>
                              {cuts.map((option) => (
                                <Select.Item
                                  key={option}
                                  value={option}
                                  className="select-option"
                                >
                                  <Select.ItemText>{option}</Select.ItemText>
                                  <Select.ItemIndicator>
                                    <Check size={16} aria-hidden="true" />
                                  </Select.ItemIndicator>
                                </Select.Item>
                              ))}
                            </Select.Group>
                          </Select.List>
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                )}
                <AmountField
                  product={selectedProduct}
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
                    ? `Add ${formatQuantity(selectedProduct, amount)}${variable ? "" : ` · ${formatMoney(productLineTotal(selectedProduct, amount))}`}`
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
