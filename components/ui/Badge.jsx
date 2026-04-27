import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-terracotta-500 text-white shadow hover:bg-terracotta-600",
    secondary: "border-transparent bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200",
    destructive: "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
    outline: "text-charcoal-950 border-charcoal-200",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
