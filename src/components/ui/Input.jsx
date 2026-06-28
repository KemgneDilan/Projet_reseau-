import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(
  ({ className, type = "text", icon: Icon, error, disabled, label, helperText, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-charcoal-900 mb-2">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border-2 border-charcoal-200 bg-white px-4 py-2 text-sm transition-all duration-200 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-100 disabled:cursor-not-allowed disabled:bg-charcoal-50 disabled:opacity-50",
            Icon && "pl-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className
          )}
          disabled={disabled}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-charcoal-500">{helperText}</p>
      )}
    </div>
  )
)
Input.displayName = "Input"

export { Input }
