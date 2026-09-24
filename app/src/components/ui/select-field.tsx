"use client"

import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectFieldOption<T extends string> {
  id: T
  label: string
  disabled?: boolean
}

interface SelectFieldGroup<T extends string> {
  label: string
  options: readonly SelectFieldOption<T>[]
}

interface SelectFieldProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: readonly SelectFieldOption<T>[]
  groups?: readonly SelectFieldGroup<T>[]
  placeholder?: string
  size?: "sm" | "default"
  className?: string
  disabled?: boolean
  id?: string
  name?: string
  "aria-label"?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  onBlur?: React.FocusEventHandler<HTMLButtonElement>
  ref?: React.Ref<HTMLButtonElement>
}

function SelectField<T extends string>({
  value,
  onValueChange,
  options,
  groups,
  placeholder,
  size,
  className,
  disabled,
  id,
  name,
  onBlur,
  ref,
  ...ariaProps
}: SelectFieldProps<T>) {
  const items = React.useMemo(
    () =>
      [...options, ...(groups?.flatMap((group) => group.options) ?? [])].map((option) => ({
        value: option.id,
        label: option.label,
      })),
    [options, groups]
  )

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next as T)
      }}
      items={items}
      disabled={disabled}
      name={name}
    >
      <SelectTrigger
        ref={ref}
        id={id}
        size={size}
        className={className}
        onBlur={onBlur}
        aria-label={ariaProps["aria-label"]}
        aria-invalid={ariaProps["aria-invalid"]}
        aria-describedby={ariaProps["aria-describedby"]}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
        {groups?.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((option) => (
              <SelectItem key={option.id} value={option.id} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

export { SelectField }
export type { SelectFieldOption, SelectFieldGroup }
