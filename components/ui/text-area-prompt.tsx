"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextAreaPromptProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  showCount?: boolean
  maxLength?: number
}

const TextAreaPrompt = React.forwardRef<HTMLTextAreaElement, TextAreaPromptProps>(
  ({ className, label, showCount = true, maxLength = 2000, value, ...props }, ref) => {
    const charCount = typeof value === "string" ? value.length : 0

    return (
      <div className="relative w-full">
        {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            "w-full min-h-[200px] p-4 rounded-xl font-mono text-sm",
            "bg-card border border-border",
            "text-foreground placeholder:text-foreground-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "transition-all duration-200 resize-y",
            className,
          )}
          {...props}
        />
        {showCount && (
          <div className="absolute bottom-3 right-3 text-xs text-foreground-muted">
            {charCount} / {maxLength}
          </div>
        )}
      </div>
    )
  },
)

TextAreaPrompt.displayName = "TextAreaPrompt"

export { TextAreaPrompt }
