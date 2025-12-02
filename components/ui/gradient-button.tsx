"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary:
        "bg-gradient-to-r from-primary to-accent text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-[0.98] focus:ring-primary",
      secondary:
        "border border-border bg-transparent text-foreground hover:bg-surface hover:border-border-hover focus:ring-accent",
      ghost: "text-foreground-secondary hover:text-foreground hover:bg-surface focus:ring-accent",
    }

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-full",
      md: "h-10 px-5 text-sm rounded-full",
      lg: "h-12 px-8 text-base rounded-full",
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

GradientButton.displayName = "GradientButton"

export { GradientButton }
