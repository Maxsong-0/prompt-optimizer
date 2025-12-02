"use client"

import { useState } from "react"
import { X, FileText } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { TagSelector } from "@/components/ui/tag-selector"
import { useLanguage } from "@/lib/i18n/language-context"

interface SaveTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string; category: string }) => void
  promptContent: string
}

const categoryTags = [
  { id: "writing", label: "Writing" },
  { id: "coding", label: "Coding" },
  { id: "marketing", label: "Marketing" },
  { id: "business", label: "Business" },
  { id: "creative", label: "Creative" },
  { id: "education", label: "Education" },
]

export function SaveTemplateModal({ isOpen, onClose, onSave, promptContent }: SaveTemplateModalProps) {
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string[]>(["writing"])
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onSave({
      name,
      description,
      category: selectedCategory[0] || "writing",
    })
    setIsSaving(false)
    onClose()
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
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t.dashboard.promptLab.saveAsTemplate}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface transition-colors">
            <X className="w-5 h-5 text-foreground-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Template Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., SEO Blog Writer" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this template does..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <TagSelector tags={categoryTags} selected={selectedCategory} onChange={setSelectedCategory} single />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
            <div className="p-3 rounded-lg bg-surface border border-border max-h-24 overflow-y-auto">
              <p className="text-xs text-foreground-secondary font-mono line-clamp-3">
                {promptContent || "No prompt content"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <GradientButton variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </GradientButton>
          <GradientButton onClick={handleSave} loading={isSaving} disabled={!name.trim()}>
            {t.common.save}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
