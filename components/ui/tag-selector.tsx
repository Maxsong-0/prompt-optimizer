"use client"

import { cn } from "@/lib/utils"

interface Tag {
  id: string
  label: string
}

interface TagSelectorProps {
  tags: Tag[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
  single?: boolean
}

export function TagSelector({ tags, selected, onChange, className, single = false }: TagSelectorProps) {
  const toggleTag = (id: string) => {
    if (single) {
      onChange([id])
      return
    }

    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => toggleTag(tag.id)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
            selected.includes(tag.id)
              ? "bg-gradient-to-r from-primary to-accent text-white"
              : "bg-surface text-foreground-secondary border border-border hover:border-border-hover",
          )}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}
