"use client"

import { useState } from "react"
import { X, Copy, Check, ArrowRight, Star, Users } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  usageCount: number
  content: string
  author?: string
  rating?: number
}

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: Template | null
  onUseTemplate: (template: Template) => void
}

export function TemplatePreviewModal({ isOpen, onClose, template, onUseTemplate }: TemplatePreviewModalProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  if (!isOpen || !template) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-surface-elevated text-foreground-secondary">
                  {template.category}
                </span>
                {template.rating && (
                  <span className="flex items-center gap-1 text-xs text-foreground-muted">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    {template.rating}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-foreground">{template.title}</h2>
              <p className="text-sm text-foreground-secondary mt-1">{template.description}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface transition-colors">
              <X className="w-5 h-5 text-foreground-muted" />
            </button>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-4 text-xs text-foreground-muted">
            {template.author && <span>By {template.author}</span>}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {template.usageCount.toLocaleString()} uses
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {template.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-accent">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Template Content</h3>
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors",
                copied ? "bg-success/20 text-success" : "bg-surface hover:bg-surface-hover text-foreground-secondary",
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4 rounded-lg bg-surface border border-border font-mono text-sm text-foreground-secondary whitespace-pre-wrap leading-relaxed">
            {template.content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <GradientButton variant="ghost" onClick={onClose}>
            {t.common.close}
          </GradientButton>
          <GradientButton
            onClick={() => {
              onUseTemplate(template)
              onClose()
            }}
          >
            {t.dashboard.templates.useTemplate}
            <ArrowRight className="w-4 h-4 ml-2" />
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
