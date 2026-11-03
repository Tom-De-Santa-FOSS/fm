import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "cn";
import { Check, ChevronDown } from "lucide-react";

const Select = SelectPrimitive.Root;

const SelectLabel = ({ className, ...props }: SelectPrimitive.Label.Props) => (
  <SelectPrimitive.Label
    data-slot="select-label"
    className={className}
    {...props}
  />
);

const SelectTrigger = ({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    className={cn("focus-visible:outline-ring", className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon render={<ChevronDown size={16} />} />
  </SelectPrimitive.Trigger>
);

const SelectValue = (props: SelectPrimitive.Value.Props) => (
  <SelectPrimitive.Value data-slot="select-value" {...props} />
);

const SelectContent = ({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align" | "alignOffset" | "alignItemWithTrigger"
  >) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      className="select-positioner"
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      alignItemWithTrigger={alignItemWithTrigger}
    >
      <SelectPrimitive.Popup
        data-slot="select-content"
        className={cn("select-popup", className)}
        {...props}
      >
        <SelectPrimitive.List>{children}</SelectPrimitive.List>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
);

const SelectGroup = (props: SelectPrimitive.Group.Props) => (
  <SelectPrimitive.Group data-slot="select-group" {...props} />
);

const SelectItem = ({
  children,
  className,
  ...props
}: SelectPrimitive.Item.Props) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn("select-option", className)}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator>
      <Check size={16} aria-hidden="true" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
);

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
};
