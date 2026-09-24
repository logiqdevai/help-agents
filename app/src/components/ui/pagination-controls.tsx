"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Pagination } from "@/interfaces/common.interfaces"

interface PaginationControlsProps {
  pagination: Pagination | undefined
  onPageChange: (page: number) => void
  noun?: string
}

/** "Showing 1–20 of 128 calls" + prev/next, driven by the API's `pagination` block. */
function PaginationControls({ pagination, onPageChange, noun = "results" }: PaginationControlsProps) {
  if (!pagination || pagination.total === 0) return null
  const from = (pagination.page - 1) * pagination.limit + 1
  const to = Math.min(pagination.page * pagination.limit, pagination.total)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        Showing {from}–{to} of {pagination.total} {noun}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.has_prev}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeftIcon /> Previous
        </Button>
        <span className="tabular-nums">
          {pagination.page} / {Math.max(pagination.total_pages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.has_next}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}

export { PaginationControls }
