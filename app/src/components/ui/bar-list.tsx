import { cn } from "@/lib/utils"

export interface BarListItem {
  id: string
  label: string
  value: number
  /** Ink bar when true, quiet gray bar otherwise. */
  emphasis?: boolean
}

interface BarListProps {
  items: BarListItem[]
  /** Formats the figure at the end of each row. */
  formatValue?: (value: number) => string
  className?: string
}

/** Horizontal ranked bars with the label on the left and the figure on the right. */
function BarList({ items, formatValue = String, className }: BarListProps) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[minmax(0,7.5rem)_1fr_3rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,9.25rem)_1fr_3rem]"
        >
          <span className="truncate" title={item.label}>
            {item.label}
          </span>
          <span className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <span
              className={cn(
                "block h-full rounded-full",
                item.emphasis ? "bg-primary" : "bg-hairline-strong dark:bg-muted-ink",
              )}
              style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 2 : 0)}%` }}
            />
          </span>
          <span className="text-right tabular-nums">{formatValue(item.value)}</span>
        </li>
      ))}
    </ul>
  )
}

export { BarList }
