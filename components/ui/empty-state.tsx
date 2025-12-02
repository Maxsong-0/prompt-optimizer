"use client"

import { FileText, Search, History, Star, Users } from "lucide-react"
import { GradientButton } from "./gradient-button"
import { cn } from "@/lib/utils"

type EmptyStateType = "history" | "templates" | "favorites" | "search" | "team"

interface EmptyStateProps {
  type: EmptyStateType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const icons = {
  history: History,
  templates: FileText,
  favorites: Star,
  search: Search,
  team: Users,
}

export function EmptyState({ type, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  const Icon = icons[type]

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-8 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-accent" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-foreground-secondary max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && <GradientButton onClick={onAction}>{actionLabel}</GradientButton>}
    </div>
  )
}
