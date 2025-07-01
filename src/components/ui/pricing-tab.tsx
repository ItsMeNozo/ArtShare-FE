import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TabProps {
  text: string
  selected: boolean
  setSelected: (text: string) => void
  discount?: boolean
}

export function Tab({
  text,
  selected,
  setSelected,
  discount = false,
}: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        "relative w-fit px-4 py-2 text-sm font-medium capitalize cursor-pointer",
        "text-foreground transition-colors",
        discount && "flex items-center justify-center gap-2.5"
      )}
    >
      <span className="z-10 relative">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          className="z-0 absolute inset-0 bg-background shadow-sm border border-mountain-100 rounded-full"
        />
      )}
      {discount && (
        <Badge
          variant="secondary"
          className={cn(
            "relative z-10 bg-muted text-mountain-400 whitespace-nowrap shadow-none",
            selected && "text-mountain-600"
          )}
        >
          Save 20%
        </Badge>
      )}
    </button>
  )
}