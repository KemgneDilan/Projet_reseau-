"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, children, isLoading = false, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta-500 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed"

  const variants = {
    default: "bg-gradient-to-r from-terracotta-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:from-terracotta-600 hover:to-orange-600 active:shadow-md",
    destructive: "bg-red-500 text-white shadow-md hover:bg-red-600 active:bg-red-700",
    outline: "border-2 border-terracotta-300 bg-white text-terracotta-700 shadow-sm hover:bg-terracotta-50 hover:border-terracotta-400 active:bg-terracotta-100",
    secondary: "bg-charcoal-100 text-charcoal-900 shadow-sm hover:bg-charcoal-200 active:bg-charcoal-300",
    ghost: "text-charcoal-700 hover:bg-charcoal-100 active:bg-charcoal-200",
    link: "text-terracotta-600 underline-offset-4 hover:underline hover:text-terracotta-700",
    success: "bg-green-500 text-white shadow-md hover:bg-green-600 active:bg-green-700",
    subtle: "text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50",
  }

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-lg px-8 text-base",
    xl: "h-14 rounded-lg px-10 text-lg",
    icon: "h-10 w-10",
    "icon-sm": "h-8 w-8 rounded-md",
  }

  const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className)

  const content = isLoading ? (
    <>
      <span className="inline-block animate-spin mr-2">⏳</span>
      {children}
    </>
  ) : children

  if (asChild) {
    return (
      <button
        className={combinedClassName}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {content}
      </button>
    )
  }

  return (
    <motion.button
      className={combinedClassName}
      ref={ref}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {content}
    </motion.button>
  )
})
Button.displayName = "Button"

export { Button }
