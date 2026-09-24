"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"

type ActionButtonWithPendingProps = React.ComponentProps<typeof Button> & {
  isPending?: boolean
}

/** Submit / destructive action button: shows a spinner (no loading text) and disables itself while pending. */
function ActionButtonWithPending({
  isPending = false,
  disabled,
  children,
  ...props
}: ActionButtonWithPendingProps) {
  return (
    <Button disabled={disabled || isPending} {...props}>
      {isPending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  )
}

export { ActionButtonWithPending }
