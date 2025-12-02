"use client"

import { useState } from "react"
import { Search, Clock, Sparkles, MoreVertical, Trash2, Download, CheckSquare, Square, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

interface HistoryItem {
  id: string
  title: string
  model: string
  tags: string[]
  createdAt: string
  preview: string
  isFavorite?: boolean
}

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    title: "Blog post about AI trends",
    model: "GPT-4",
    tags: ["Writing", "Blog"],
    createdAt: "2 hours ago",
    preview: "Write a comprehensive blog post about emerging AI trends...",
    isFavorite: true,
  },
  {
    id: "2",
    title: "React component generator",
    model: "Claude 3",
    tags: ["Coding", "React"],
    createdAt: "Yesterday",
    preview: "Generate a reusable React component that...",
  },
  {
    id: "3",
    title: "Product description for website",
    model: "GPT-3.5",
    tags: ["Marketing", "E-commerce"],
    createdAt: "3 days ago",
    preview: "Create an engaging product description for...",
  },
  {
    id: "4",
    title: "Midjourney fantasy landscape",
    model: "Midjourney",
    tags: ["Image", "Art"],
    createdAt: "1 week ago",
    preview: "A mystical forest with bioluminescent plants...",
  },
]

export function HistoryList() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState(mockHistory)

  const filters = [
    t.dashboard.history.all,
    t.dashboard.history.writing,
    t.dashboard.history.coding,
    t.dashboard.history.image,
    "Marketing",
  ]

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      !selectedFilter ||
      selectedFilter === t.dashboard.history.all ||
      item.tags.some((tag) => tag.toLowerCase() === selectedFilter?.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    setSelectedItems(new Set(filteredHistory.map((item) => item.id)))
  }

  const deselectAll = () => {
    setSelectedItems(new Set())
  }

  const deleteSelected = () => {
    setHistory(history.filter((item) => !selectedItems.has(item.id)))
    setSelectedItems(new Set())
  }

  const toggleFavorite = (id: string) => {
    setHistory(history.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)))
  }

  const exportSelected = () => {
    const exportData = history.filter((item) => selectedItems.has(item.id))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "prompts-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const isAllSelected = filteredHistory.length > 0 && filteredHistory.every((item) => selectedItems.has(item.id))

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.dashboard.history.search}
            className="pl-10"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter === t.dashboard.history.all ? null : filter)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                  selectedFilter === filter || (filter === t.dashboard.history.all && !selectedFilter)
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "bg-surface text-foreground-secondary hover:bg-surface-hover",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
            <span className="text-sm text-foreground">{selectedItems.size} selected</span>
            <div className="flex items-center gap-2">
              <GradientButton variant="ghost" size="sm" onClick={exportSelected}>
                <Download className="w-4 h-4 mr-1" />
                {t.dashboard.history.export}
              </GradientButton>
              <GradientButton
                variant="ghost"
                size="sm"
                onClick={deleteSelected}
                className="text-error hover:bg-error/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t.dashboard.history.delete}
              </GradientButton>
            </div>
          </div>
        )}
      </div>

      {filteredHistory.length > 0 && (
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <button
            onClick={isAllSelected ? deselectAll : selectAll}
            className="p-1 rounded hover:bg-surface-hover transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-accent" />
            ) : (
              <Square className="w-4 h-4 text-foreground-muted" />
            )}
          </button>
          <span className="text-xs text-foreground-muted">
            {isAllSelected ? t.dashboard.history.deselectAll : t.dashboard.history.selectAll}
          </span>
        </div>
      )}

      {/* History Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.dashboard.history.empty.title}</h3>
            <p className="text-sm text-foreground-secondary">{t.dashboard.history.empty.description}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredHistory.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4 hover:bg-surface transition-colors">
                <button
                  onClick={() => toggleSelectItem(item.id)}
                  className="p-1 rounded hover:bg-surface-hover transition-colors mt-1"
                >
                  {selectedItems.has(item.id) ? (
                    <CheckSquare className="w-4 h-4 text-accent" />
                  ) : (
                    <Square className="w-4 h-4 text-foreground-muted" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-1 rounded hover:bg-surface-hover transition-colors"
                      >
                        <Star
                          className={cn(
                            "w-4 h-4",
                            item.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-foreground-muted",
                          )}
                        />
                      </button>
                      <button className="p-1 rounded hover:bg-surface-hover transition-colors">
                        <MoreVertical className="w-4 h-4 text-foreground-muted" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground-secondary line-clamp-2 mb-3">{item.preview}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-foreground-muted">
                        <Sparkles className="w-3 h-3" />
                        {item.model}
                      </span>
                      <span className="text-foreground-muted">•</span>
                      <span className="text-xs text-foreground-muted">{item.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] rounded-full bg-surface-elevated text-foreground-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
