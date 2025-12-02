"use client"

import { useState } from "react"
import { Lightbulb, ChevronDown, ChevronRight, Copy, Check } from "lucide-react"

const tips = [
  {
    id: "role",
    title: "Define a Role",
    content: "Start with 'You are an expert...' to set context.",
    snippet: "You are an expert {{role}} with {{years}} years of experience...",
  },
  {
    id: "goal",
    title: "State Your Goal",
    content: "Be specific about what you want the AI to accomplish.",
    snippet: "Your task is to {{action}} that {{outcome}}...",
  },
  {
    id: "format",
    title: "Specify Format",
    content: "Tell the AI how to structure its response.",
    snippet: "Format your response as:\n- Bullet points for key ideas\n- Numbered steps for processes",
  },
  {
    id: "constraints",
    title: "Add Constraints",
    content: "Set boundaries and requirements.",
    snippet: "Requirements:\n- Length: {{length}}\n- Tone: {{tone}}\n- Avoid: {{avoid}}",
  },
]

const templates = [
  { id: "blog", label: "Blog Post", icon: "📝" },
  { id: "code", label: "Code Review", icon: "💻" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "summary", label: "Summary", icon: "📋" },
]

interface TipsPanelProps {
  onInsertSnippet: (snippet: string) => void
}

export function TipsPanel({ onInsertSnippet }: TipsPanelProps) {
  const [expandedTip, setExpandedTip] = useState<string | null>("role")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (snippet: string, id: string) => {
    await navigator.clipboard.writeText(snippet)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" />
          Writing Tips
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {tips.map((tip) => (
            <div key={tip.id} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-surface transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{tip.title}</span>
                {expandedTip === tip.id ? (
                  <ChevronDown className="w-4 h-4 text-foreground-secondary" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-foreground-secondary" />
                )}
              </button>
              {expandedTip === tip.id && (
                <div className="px-3 pb-3">
                  <p className="text-xs text-foreground-secondary mb-2">{tip.content}</p>
                  <div className="relative p-2 rounded-md bg-surface font-mono text-xs text-foreground-muted">
                    <pre className="whitespace-pre-wrap">{tip.snippet}</pre>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={() => handleCopy(tip.snippet, tip.id)}
                        className="p-1 rounded hover:bg-surface-hover transition-colors"
                      >
                        {copiedId === tip.id ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => onInsertSnippet(tip.snippet)}
                        className="px-2 py-0.5 text-[10px] rounded bg-primary/20 text-accent hover:bg-primary/30 transition-colors"
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">Quick Templates</h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border hover:border-border-hover transition-colors text-left"
              >
                <span>{template.icon}</span>
                <span className="text-xs text-foreground-secondary">{template.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
