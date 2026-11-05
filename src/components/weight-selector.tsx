import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";

import { formatMoney, formatQuantity } from "../lib/format";
import {
  isProductQuantity,
  productLineTotal,
  productQuantityLimit,
} from "../lib/products";
import type { Product } from "../lib/products";

const presets = [250, 500, 1000];

export const WeightSelector = ({
  product,
  grams,
  onValueChange,
}: {
  product: Product;
  grams: number;
  onValueChange: (quantity: number) => void;
}) => {
  const initialWeight = grams;

  const [selectedWeight, setSelectedWeight] = useState(
    presets.includes(initialWeight) ? String(initialWeight) : "custom"
  );

  const [customWeight, setCustomWeight] = useState(
    presets.includes(initialWeight) ? 0.25 : initialWeight / 1000
  );

  const changeCustomWeight = (weight: number) => {
    setCustomWeight(weight);
    setSelectedWeight("custom");
    onValueChange((weight * 1000) / grams);
  };

  return (
    <RadioGroup
      className="weight-options"
      aria-label="Choose weight"
      value={selectedWeight}
      onValueChange={(weight) => {
        if (weight !== null) {
          setSelectedWeight(weight);
          onValueChange(
            weight === "custom"
              ? (customWeight * 1000) / grams
              : Number(weight) / grams
          );
        }
      }}
    >
      {presets.map((weight) => (
        <label key={weight}>
          <Radio.Root
            value={String(weight)}
            className="weight-option"
            disabled={!isProductQuantity(product, weight / grams)}
          >
            <span>{formatQuantity(product, weight / grams)}</span>
            <span className="weight-option-price">
              {formatMoney(productLineTotal(product, weight / grams))}
            </span>
            <Radio.Indicator
              keepMounted
              className="weight-option-check"
              aria-hidden="true"
            >
              <Check size={16} strokeWidth={3} />
            </Radio.Indicator>
          </Radio.Root>
        </label>
      ))}
      <div className="weight-option weight-custom-row">
        <span>Custom weight</span>
        <div className="weight-custom-stepper">
          <button
            type="button"
            aria-label="Decrease custom weight"
            disabled={customWeight <= 0.25}
            onClick={() => changeCustomWeight(customWeight - 0.25)}
          >
            <Minus size={16} />
          </button>
          <span>{customWeight.toFixed(2)} kg</span>
          <button
            type="button"
            aria-label="Increase custom weight"
            disabled={
              customWeight >= (productQuantityLimit(product) * grams) / 1000
            }
            onClick={() => changeCustomWeight(customWeight + 0.25)}
          >
            <Plus size={16} />
          </button>
        </div>
        <Radio.Root
          value="custom"
          className="weight-custom-option"
          aria-label="Custom weight"
        >
          <Radio.Indicator
            keepMounted
            className="weight-option-check"
            aria-hidden="true"
          >
            <Check size={16} strokeWidth={3} />
          </Radio.Indicator>
        </Radio.Root>
      </div>
    </RadioGroup>
  );
};
