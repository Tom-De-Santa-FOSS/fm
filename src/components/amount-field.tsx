import { NumberField } from "@base-ui/react/number-field";
import { Select } from "@base-ui/react/select";
import {
  CaretDownIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
} from "@phosphor-icons/react/ssr";
import { useId, useState } from "react";

import { formatQuantity } from "../lib/format";
import {
  isProductQuantity,
  productQuantityLimit,
  productWeightGrams,
} from "../lib/products";
import type { Product } from "../lib/products";

export const AmountField = ({
  product,
  value,
  onValueChange,
}: {
  product: Product;
  value: number | null;
  onValueChange: (value: number | null) => void;
}) => {
  const id = useId();

  const [unit, setUnit] = useState<"g" | "kg">(
    product.unit === "kg" ? "kg" : "g"
  );

  const grams = productWeightGrams(product);
  const weighted = grams !== null;
  const kilograms = weighted && unit === "kg";
  const unitScale = kilograms ? 1000 : 1;
  const scale = (grams ?? 1) / unitScale;
  const step = weighted ? 250 / unitScale : 1;
  const label = weighted ? "Weight" : "Quantity";
  const invalid = value !== null && !isProductQuantity(product, value);

  return (
    <NumberField.Root
      className="amount-field"
      data-invalid={invalid || undefined}
      value={value === null ? null : value * scale}
      min={step}
      max={productQuantityLimit(product) * scale}
      step={step}
      smallStep={step}
      largeStep={step}
      snapOnStep
      format={{
        // Preserve invalid typed values rather than rounding them into valid weights.
        maximumFractionDigits: 20,
        useGrouping: false,
      }}
      allowOutOfRange
      onValueChange={(next) =>
        onValueChange(next === null ? null : next / scale)
      }
    >
      <label className="amount-label" htmlFor={id}>
        {label}
      </label>
      <NumberField.Group className="amount-control">
        <NumberField.Decrement aria-label={`Decrease ${label.toLowerCase()}`}>
          <MinusIcon size={18} />
        </NumberField.Decrement>
        <div className="amount-value">
          <NumberField.Input
            id={id}
            inputMode={kilograms ? "decimal" : "numeric"}
            aria-label={label}
            aria-invalid={invalid}
            aria-describedby={`${id}-hint`}
          />
          {weighted && (
            <Select.Root
              value={unit}
              onValueChange={(next) => {
                if (next !== null) {
                  setUnit(next);
                }
              }}
            >
              <Select.Trigger className="amount-unit" aria-label="Weight unit">
                <Select.Value />
                <Select.Icon>
                  <CaretDownIcon size={14} />
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
                        {(["g", "kg"] as const).map((option) => (
                          <Select.Item
                            key={option}
                            value={option}
                            className="select-option"
                          >
                            <Select.ItemText>{option}</Select.ItemText>
                            <Select.ItemIndicator>
                              <CheckIcon size={16} />
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
        </div>
        <NumberField.Increment aria-label={`Increase ${label.toLowerCase()}`}>
          <PlusIcon size={18} />
        </NumberField.Increment>
      </NumberField.Group>
      <p id={`${id}-hint`} className="amount-hint">
        {weighted ? "Use 250 g / 0.25 kg steps." : "Choose a whole quantity."}{" "}
        Maximum {formatQuantity(product, productQuantityLimit(product))}.
      </p>
    </NumberField.Root>
  );
};
