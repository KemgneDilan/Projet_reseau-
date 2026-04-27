"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta-500 disabled:pointer-events-none disabled:opacity-50"

  const variants = {
    default: "bg-terracotta-500 text-white shadow hover:bg-terracotta-600",
    destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
    outline: "border border-charcoal-200 bg-transparent shadow-sm hover:bg-charcoal-50 hover:text-charcoal-900",
    secondary: "bg-charcoal-100 text-charcoal-900 shadow-sm hover:bg-charcoal-200",
    ghost: "hover:bg-charcoal-50 hover:text-charcoal-900",
    link: "text-terracotta-500 underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-md px-8",
    icon: "h-10 w-10",
  }

  const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className)

  // Si asChild est true, on rend juste un <button> normal (pour éviter les conflits avec <Link>)
  if (asChild) {
    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <motion.button
      className={combinedClassName}
      ref={ref}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  )
})
Button.displayName = "Button"

export { Button }
