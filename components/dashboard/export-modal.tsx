"use client"

import { useState } from "react"
import { X, Download, FileText, FileCode, FileJson, Copy, Check } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { cn } from "@/lib/utils"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  promptTitle: string
  promptContent: string
  optimizedContent?: string
}

type ExportFormat = "txt" | "md" | "json"

export function ExportModal({ isOpen, onClose, promptTitle, promptContent, optimizedContent }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("txt")
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const formats: { id: ExportFormat; label: string; icon: typeof FileText }[] = [
    { id: "txt", label: "Plain Text (.txt)", icon: FileText },
    { id: "md", label: "Markdown (.md)", icon: FileCode },
    { id: "json", label: "JSON (.json)", icon: FileJson },
  ]

  const getExportContent = () => {
    switch (selectedFormat) {
      case "txt":
        return `${promptTitle}\n\n--- Original ---\n${promptContent}\n\n--- Optimized ---\n${optimizedContent || "N/A"}`
      case "md":
        return `# ${promptTitle}\n\n## Original Prompt\n\n\`\`\`\n${promptContent}\n\`\`\`\n\n## Optimized Prompt\n\n\`\`\`\n${optimizedContent || "N/A"}\n\`\`\``
      case "json":
        return JSON.stringify(
          {
            title: promptTitle,
            original: promptContent,
            optimized: optimizedContent,
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        )
    }
  }

  const handleDownload = () => {
    const content = getExportContent()
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${promptTitle.toLowerCase().replace(/\s+/g, "-")}.${selectedFormat}`
    a.click()
    URL.revokeObjectURL(url)
    onClose()
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getExportContent())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Export Prompt</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface transition-colors">
            <X className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-foreground">Select Format</label>
          <div className="space-y-2">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                  selectedFormat === format.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-surface border-border hover:bg-surface-hover",
                )}
              >
                <format.icon
                  className={cn("w-5 h-5", selectedFormat === format.id ? "text-accent" : "text-foreground-muted")}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    selectedFormat === format.id ? "text-foreground" : "text-foreground-secondary",
                  )}
                >
                  {format.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
          <div className="p-3 rounded-lg bg-surface border border-border max-h-32 overflow-y-auto">
            <pre className="text-xs text-foreground-secondary font-mono whitespace-pre-wrap">
              {getExportContent().slice(0, 300)}...
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <GradientButton variant="ghost" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-success" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </GradientButton>
          <GradientButton onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
