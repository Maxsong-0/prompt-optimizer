"use client"

import { useState } from "react"
import { ChevronDown, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const models = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", badge: "Recommended" },
  { id: "gpt-3.5", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "midjourney", name: "Midjourney", provider: "Midjourney" },
  { id: "gemini", name: "Gemini Pro", provider: "Google" },
]

interface ModelSelectorProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function ModelSelector({ value = "gpt-4", onChange, className }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedModel = models.find((m) => m.id === value) || models[0]

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-border-hover transition-colors min-w-[180px]"
      >
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="flex-1 text-left text-sm text-foreground">{selectedModel.name}</span>
        <ChevronDown className={cn("w-4 h-4 text-foreground-secondary transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange?.(model.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    value === model.id ? "bg-primary/10" : "hover:bg-surface-hover",
                  )}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{model.name}</span>
                      {model.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-accent/20 text-accent">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-foreground-muted">{model.provider}</span>
                  </div>
                  {value === model.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
