"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { notify } from "@/lib/notify"

type CopyButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> & {
  /** The text placed on the clipboard. */
  value: string
  /** Visible label; omit for an icon-only button (then pass `aria-label`). */
  label?: string
}

const COPIED_RESET_MS = 2000

/** Copies `value` to the clipboard and confirms with a toast plus a brief check mark. */
function CopyButton({ value, label, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      notify.success("Copied to clipboard")
      window.setTimeout(() => setCopied(false), COPIED_RESET_MS)
    } catch {
      notify.error("Could not copy", "Select the text and copy it manually.")
    }
  }

  const Icon = copied ? CheckIcon : CopyIcon
  return (
    <Button type="button" onClick={handleCopy} {...props}>
      <Icon aria-hidden="true" />
      {label}
    </Button>
  )
}

export { CopyButton }
