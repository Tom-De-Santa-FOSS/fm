import { NumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";

import { formatQuantity } from "../lib/format";
import {
  isProductQuantity,
  productQuantityLimit,
  productWeightGrams,
} from "../lib/products";
import type { Product } from "../lib/products";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
          <Minus size={18} />
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
            <Select
              items={(["g", "kg"] as const).map((option) => ({
                label: option,
                value: option,
              }))}
              value={unit}
              onValueChange={(next) => {
                if (next !== null) {
                  setUnit(next);
                }
              }}
            >
              <SelectTrigger className="amount-unit" aria-label="Weight unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(["g", "kg"] as const).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
        <NumberField.Increment aria-label={`Increase ${label.toLowerCase()}`}>
          <Plus size={18} />
        </NumberField.Increment>
      </NumberField.Group>
      <p id={`${id}-hint`} className="amount-hint">
        {weighted ? "Use 250 g / 0.25 kg steps." : "Choose a whole quantity."}{" "}
        Maximum {formatQuantity(product, productQuantityLimit(product))}.
      </p>
    </NumberField.Root>
  );
};
