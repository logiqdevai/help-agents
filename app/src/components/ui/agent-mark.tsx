import { BotIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const markTones = [
  "bg-gradient-mint",
  "bg-gradient-peach",
  "bg-gradient-lavender",
  "bg-gradient-sky",
  "bg-gradient-rose",
]

function toneFor(seed: string): string {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return markTones[hash % markTones.length]
}

/** Small pastel disc with a bot glyph; the tint is stable per agent (`seed` = agent id). */
function AgentMark({ seed, className }: { seed: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-ink [&>svg]:size-4",
        toneFor(seed),
        className,
      )}
    >
      <BotIcon />
    </span>
  )
}

export { AgentMark }
