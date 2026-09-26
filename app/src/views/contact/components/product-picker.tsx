"use client";

import type { FC } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ContactProductFormOptions } from "@/config/constants/dropdowns/contact/contact-product-form.options";
import type { ProductSlug } from "@/config/constants/products";
import { cn } from "@/lib/utils";

interface ProductPickerProps {
  value: ProductSlug[];
  onChange: (value: ProductSlug[]) => void;
  invalid?: boolean;
}

/** Multi-select cards: pick one or more agents to hear about. */
export const ProductPicker: FC<ProductPickerProps> = ({ value, onChange, invalid }) => {
  const toggle = (id: ProductSlug, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter((selected) => selected !== id));

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ContactProductFormOptions.map(({ id, label, description }) => {
        const checked = value.includes(id);
        return (
          <label
            key={id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors",
              "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              checked ? "border-foreground" : invalid ? "border-destructive" : "border-border hover:border-hairline-strong",
            )}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(next) => toggle(id, next)}
              aria-invalid={invalid}
              className="mt-0.5"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{label}</span>
              <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
};
