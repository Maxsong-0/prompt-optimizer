"use client"

import { useState } from "react"
import { Trash2, Variable } from "lucide-react"
import { TextAreaPrompt } from "@/components/ui/text-area-prompt"
import { TagSelector } from "@/components/ui/tag-selector"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"

const purposeTags = [
  { id: "writing", label: "Writing" },
  { id: "coding", label: "Coding" },
  { id: "image", label: "Image Gen" },
  { id: "learning", label: "Learning" },
  { id: "business", label: "Business" },
  { id: "creative", label: "Creative" },
]

const styleTags = [
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Casual" },
  { id: "technical", label: "Technical" },
  { id: "simple", label: "Simple" },
  { id: "detailed", label: "Detailed" },
]

interface PromptEditorProps {
  value: string
  onChange: (value: string) => void
  title: string
  onTitleChange: (title: string) => void
}

export function PromptEditor({ value, onChange, title, onTitleChange }: PromptEditorProps) {
  const [selectedPurpose, setSelectedPurpose] = useState<string[]>(["writing"])
  const [selectedStyle, setSelectedStyle] = useState<string[]>(["detailed"])

  const insertVariable = () => {
    onChange(value + "{{variable_name}}")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Prompt"
          className="text-lg font-medium bg-transparent border-none p-0 h-auto focus-visible:ring-0"
        />
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <TextAreaPrompt
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your prompt here...

Example: Write a blog post about the benefits of remote work for software developers."
          className="min-h-[300px]"
        />

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Purpose</label>
            <TagSelector tags={purposeTags} selected={selectedPurpose} onChange={setSelectedPurpose} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Style</label>
            <TagSelector tags={styleTags} selected={selectedStyle} onChange={setSelectedStyle} />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border flex items-center gap-2">
        <GradientButton variant="ghost" size="sm" onClick={insertVariable}>
          <Variable className="w-4 h-4 mr-2" />
          Insert Variable
        </GradientButton>
        <GradientButton variant="ghost" size="sm" onClick={() => onChange("")}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </GradientButton>
      </div>
    </div>
  )
}
