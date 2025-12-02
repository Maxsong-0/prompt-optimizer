"use client"

import { useState } from "react"
import { History, ChevronRight, RotateCcw, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { GradientButton } from "@/components/ui/gradient-button"

interface Version {
  id: string
  timestamp: string
  model: string
  preview: string
}

const mockVersions: Version[] = [
  {
    id: "v5",
    timestamp: "Just now",
    model: "GPT-4",
    preview: "You are an expert content strategist with 10+ years...",
  },
  {
    id: "v4",
    timestamp: "5 min ago",
    model: "GPT-4",
    preview: "Act as a professional content writer and create...",
  },
  {
    id: "v3",
    timestamp: "15 min ago",
    model: "Claude 3",
    preview: "Write a detailed blog post about the following topic...",
  },
  {
    id: "v2",
    timestamp: "1 hour ago",
    model: "GPT-3.5",
    preview: "Create a blog post about AI trends in 2024...",
  },
  {
    id: "v1",
    timestamp: "2 hours ago",
    model: "GPT-3.5",
    preview: "Write about AI",
  },
]

interface VersionHistoryPanelProps {
  onRestore?: (version: Version) => void
  onPreview?: (version: Version) => void
}

export function VersionHistoryPanel({ onRestore, onPreview }: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-surface transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-foreground-muted" />
          <span className="text-sm font-medium text-foreground">Version History</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-surface-elevated text-foreground-muted">
            {mockVersions.length}
          </span>
        </div>
        <ChevronRight className={cn("w-4 h-4 text-foreground-muted transition-transform", isExpanded && "rotate-90")} />
      </button>

      {isExpanded && (
        <div className="max-h-64 overflow-y-auto">
          {mockVersions.map((version, index) => (
            <div
              key={version.id}
              onClick={() => setSelectedVersion(version.id)}
              className={cn(
                "p-3 border-t border-border cursor-pointer transition-colors",
                selectedVersion === version.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-surface",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{version.id}</span>
                  {index === 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-success/20 text-success">Current</span>
                  )}
                </div>
                <span className="text-xs text-foreground-muted">{version.timestamp}</span>
              </div>
              <p className="text-xs text-foreground-secondary line-clamp-1 mb-2">{version.preview}</p>

              {selectedVersion === version.id && (
                <div className="flex items-center gap-2 mt-2">
                  <GradientButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview?.(version)
                    }}
                    className="h-7 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </GradientButton>
                  {index !== 0 && (
                    <GradientButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRestore?.(version)
                      }}
                      className="h-7 text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restore
                    </GradientButton>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
