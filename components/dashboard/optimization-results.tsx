"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { PromptCard } from "@/components/ui/prompt-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/i18n/language-context"

interface OptimizationResult {
  id: string
  title: string
  content: string
  tags: string[]
}

interface OptimizationResultsProps {
  results: OptimizationResult[]
  isLoading?: boolean
  originalPrompt?: string
}

type TabType = "v1" | "v2" | "diff"

export function OptimizationResults({ results, isLoading = false, originalPrompt = "" }: OptimizationResultsProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>("v1")

  const tabs: { id: TabType; label: string }[] = [
    { id: "v1", label: `${t.dashboard.promptLab.version} 1` },
    { id: "v2", label: `${t.dashboard.promptLab.version} 2` },
    { id: "diff", label: t.dashboard.promptLab.diff },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          {tabs.map((tab) => (
            <Skeleton key={tab.id} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              activeTab === tab.id
                ? "bg-gradient-to-r from-primary to-accent text-white"
                : "text-foreground-secondary hover:bg-surface",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "diff" ? (
          <EnhancedDiffView original={originalPrompt} optimized={results[0]?.content || ""} />
        ) : (
          <div className="space-y-4">
            {results
              .filter((_, i) => (activeTab === "v1" ? i === 0 : i === 1))
              .map((result) => (
                <PromptCard
                  key={result.id}
                  title={result.title}
                  content={result.content}
                  tags={result.tags}
                  variant="optimized"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EnhancedDiffView({ original, optimized }: { original: string; optimized: string }) {
  const { t } = useLanguage()

  // Simple word-level diff simulation
  const getHighlightedText = (text: string, isOriginal: boolean) => {
    if (!text) return null

    const words = text.split(/(\s+)/)
    const otherWords = (isOriginal ? optimized : original).split(/(\s+)/)

    return words.map((word, i) => {
      const isDifferent = !otherWords.includes(word) && word.trim().length > 0
      return (
        <span
          key={i}
          className={cn(
            isDifferent && (isOriginal ? "bg-error/30 text-error line-through" : "bg-success/30 text-success"),
          )}
        >
          {word}
        </span>
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-surface border border-border text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-error/50" />
          <span className="text-foreground-muted">
            Removed: {original.split(" ").length - optimized.split(" ").filter((w) => original.includes(w)).length}{" "}
            words
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-success/50" />
          <span className="text-foreground-muted">
            Added: {optimized.split(" ").length - original.split(" ").filter((w) => optimized.includes(w)).length} words
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error" />
            Original
          </h4>
          <p className="text-sm text-foreground-secondary font-mono whitespace-pre-wrap leading-relaxed">
            {original ? getHighlightedText(original, true) : "No original prompt"}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            Optimized
          </h4>
          <p className="text-sm text-foreground-secondary font-mono whitespace-pre-wrap leading-relaxed">
            {optimized ? getHighlightedText(optimized, false) : "No optimized prompt"}
          </p>
        </div>
      </div>
    </div>
  )
}
