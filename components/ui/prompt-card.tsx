"use client"

import { Copy, Check, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface PromptCardProps {
  title: string
  content: string
  tags?: string[]
  variant?: "default" | "optimized"
  className?: string
}

export function PromptCard({ title, content, tags = [], variant = "default", className }: PromptCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl border transition-all duration-300",
        variant === "optimized"
          ? "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 backdrop-blur-sm"
          : "bg-card/50 border-border/50 backdrop-blur-sm",
        "hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm text-foreground">{title}</h4>
          {variant === "optimized" && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-accent border border-primary/30">
              Optimized
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-surface-hover transition-colors">
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-foreground-secondary" />
            )}
          </button>
          <button className="p-1.5 rounded-md hover:bg-surface-hover transition-colors">
            <MoreHorizontal className="w-4 h-4 text-foreground-secondary" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-foreground-secondary leading-relaxed font-mono whitespace-pre-wrap">{content}</p>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-surface-elevated text-foreground-secondary">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
