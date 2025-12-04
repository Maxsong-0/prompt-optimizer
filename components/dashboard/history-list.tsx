"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Clock,
  Sparkles,
  Trash2,
  Download,
  CheckSquare,
  Square,
  Star,
  ChevronRight,
  Copy,
  ArrowRight,
  RefreshCw,
  GitCompare,
  Calendar,
  Filter,
  SortDesc,
  MoreHorizontal,
  Tag,
  X,
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// =====================================================
// 类型定义
// =====================================================

interface HistoryItem {
  id: string
  title: string
  model: string
  tags: string[]
  createdAt: string
  timestamp: Date
  preview: string
  originalContent: string
  optimizedContent: string
  isFavorite?: boolean
}

interface TimelineGroup {
  label: string
  labelZh: string
  items: HistoryItem[]
}

// API响应类型
interface PromptFromAPI {
  id: string
  title: string | null
  original_content: string
  optimized_content: string | null
  optimization_mode: string | null
  model_used: string | null
  score: number | null
  is_favorite: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
}

// =====================================================
// 工具函数
// =====================================================

const groupByDate = (items: HistoryItem[], language: string): TimelineGroup[] => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000)
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)

  const groups: TimelineGroup[] = [
    { label: 'Today', labelZh: '今天', items: [] },
    { label: 'Yesterday', labelZh: '昨天', items: [] },
    { label: 'This Week', labelZh: '本周', items: [] },
    { label: 'Last Week', labelZh: '上周', items: [] },
    { label: 'Earlier', labelZh: '更早', items: [] },
  ]

  items.forEach(item => {
    const itemDate = new Date(item.timestamp)
    if (itemDate >= today) {
      groups[0].items.push(item)
    } else if (itemDate >= yesterday) {
      groups[1].items.push(item)
    } else if (itemDate >= thisWeekStart) {
      groups[2].items.push(item)
    } else if (itemDate >= lastWeekStart) {
      groups[3].items.push(item)
    } else {
      groups[4].items.push(item)
    }
  })

  return groups.filter(group => group.items.length > 0)
}

// =====================================================
// 组件
// =====================================================

// 将API响应转换为前端格式
const transformPromptToHistoryItem = (prompt: PromptFromAPI): HistoryItem => {
  const timestamp = new Date(prompt.created_at)
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let createdAt: string
  if (diffHours < 1) {
    createdAt = 'Just now'
  } else if (diffHours < 24) {
    createdAt = `${diffHours} hours ago`
  } else if (diffDays === 1) {
    createdAt = 'Yesterday'
  } else if (diffDays < 7) {
    createdAt = `${diffDays} days ago`
  } else if (diffDays < 30) {
    createdAt = `${Math.floor(diffDays / 7)} weeks ago`
  } else {
    createdAt = timestamp.toLocaleDateString()
  }

  return {
    id: prompt.id,
    title: prompt.title || 'Untitled Prompt',
    model: prompt.model_used || 'Unknown',
    tags: prompt.tags || [],
    createdAt,
    timestamp,
    preview: prompt.original_content.slice(0, 100) + (prompt.original_content.length > 100 ? '...' : ''),
    originalContent: prompt.original_content,
    optimizedContent: prompt.optimized_content || '',
    isFavorite: prompt.is_favorite,
  }
}

export function HistoryList() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取历史记录
  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/prompts?limit=100&page=1')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // API 返回分页格式: { items: [...], total, page, limit, has_more }
          const promptItems = data.data.items || data.data
          if (Array.isArray(promptItems)) {
            const items = promptItems.map(transformPromptToHistoryItem)
            setHistory(items)
          }
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch history:', errorData)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
      toast.error(language === 'zh' ? '获取历史记录失败' : 'Failed to fetch history')
    } finally {
      setIsLoading(false)
    }
  }, [language])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const filters = [
    t.dashboard.history.all,
    t.dashboard.history.writing,
    t.dashboard.history.coding,
    t.dashboard.history.image,
    "Marketing",
  ]

  const models = [...new Set(history.map(item => item.model))]

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.preview.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        !selectedFilter ||
        selectedFilter === t.dashboard.history.all ||
        item.tags.some((tag) => tag.toLowerCase() === selectedFilter?.toLowerCase())
      const matchesModel = !selectedModel || item.model === selectedModel
      return matchesSearch && matchesFilter && matchesModel
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [history, searchQuery, selectedFilter, selectedModel, t.dashboard.history.all])

  const timelineGroups = useMemo(() => groupByDate(filteredHistory, language), [filteredHistory, language])

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

  const deleteSelected = async () => {
    if (selectedItems.size === 0) return
    
    setIsDeleting(true)
    const itemsToDelete = Array.from(selectedItems)
    let successCount = 0
    
    try {
      for (const id of itemsToDelete) {
        const response = await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
        if (response.ok) {
          successCount++
        }
      }
      
      // 更新本地状态
      setHistory(history.filter((item) => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
      
      toast.success(
        language === 'zh' 
          ? `已删除 ${successCount} 条记录` 
          : `Deleted ${successCount} items`
      )
    } catch (error) {
      console.error('Failed to delete items:', error)
      toast.error(language === 'zh' ? '删除失败' : 'Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleFavorite = async (id: string) => {
    const item = history.find(h => h.id === id)
    if (!item) return
    
    const newFavoriteState = !item.isFavorite
    
    // 乐观更新UI
    setHistory(history.map((h) => (h.id === id ? { ...h, isFavorite: newFavoriteState } : h)))
    
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newFavoriteState }),
      })
      
      if (!response.ok) {
        // 回滚
        setHistory(history.map((h) => (h.id === id ? { ...h, isFavorite: !newFavoriteState } : h)))
        toast.error(language === 'zh' ? '操作失败' : 'Failed to update')
      }
    } catch (error) {
      // 回滚
      setHistory(history.map((h) => (h.id === id ? { ...h, isFavorite: !newFavoriteState } : h)))
      console.error('Failed to toggle favorite:', error)
      toast.error(language === 'zh' ? '操作失败' : 'Failed to update')
    }
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

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleReOptimize = (item: HistoryItem) => {
    sessionStorage.setItem('promto-reoptimize', JSON.stringify({
      content: item.originalContent,
      title: item.title,
    }))
    router.push('/dashboard')
  }

  const handleContinueOptimize = (item: HistoryItem) => {
    sessionStorage.setItem('promto-reoptimize', JSON.stringify({
      content: item.optimizedContent,
      title: `${item.title} (v2)`,
    }))
    router.push('/dashboard')
  }

  const isAllSelected = filteredHistory.length > 0 && filteredHistory.every((item) => selectedItems.has(item.id))

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search and Filters */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.dashboard.history.search}
              className="pl-10"
            />
          </div>
          <GradientButton
            variant={showFilters ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {language === 'zh' ? '筛选' : 'Filter'}
            {(selectedFilter || selectedModel) && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-accent text-white">
                {(selectedFilter ? 1 : 0) + (selectedModel ? 1 : 0)}
              </span>
            )}
          </GradientButton>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-2">
                {/* Category Filters */}
                <div>
                  <p className="text-xs text-foreground-muted mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {language === 'zh' ? '分类' : 'Category'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter === t.dashboard.history.all ? null : filter)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                          selectedFilter === filter || (filter === t.dashboard.history.all && !selectedFilter)
                            ? "bg-primary text-white"
                            : "bg-surface text-foreground-secondary hover:bg-surface-hover",
                        )}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Filters */}
                <div>
                  <p className="text-xs text-foreground-muted mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {language === 'zh' ? '模型' : 'Model'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedModel(null)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                        !selectedModel
                          ? "bg-primary text-white"
                          : "bg-surface text-foreground-secondary hover:bg-surface-hover",
                      )}
                    >
                      {language === 'zh' ? '全部模型' : 'All Models'}
                    </button>
                    {models.map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                          selectedModel === model
                            ? "bg-primary text-white"
                            : "bg-surface text-foreground-secondary hover:bg-surface-hover",
                        )}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedFilter || selectedModel) && (
                  <button
                    onClick={() => {
                      setSelectedFilter(null)
                      setSelectedModel(null)
                    }}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    {language === 'zh' ? '清除筛选' : 'Clear filters'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30"
          >
            <div className="flex items-center gap-3">
              <button onClick={deselectAll} className="p-1 rounded hover:bg-surface-hover">
                <X className="w-4 h-4 text-foreground-muted" />
              </button>
              <span className="text-sm font-medium text-foreground">
                {selectedItems.size} {language === 'zh' ? '已选择' : 'selected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GradientButton variant="ghost" size="sm" onClick={exportSelected}>
                <Download className="w-4 h-4 mr-1" />
                {language === 'zh' ? '导出' : 'Export'}
              </GradientButton>
              <GradientButton
                variant="ghost"
                size="sm"
                onClick={deleteSelected}
                className="text-error hover:bg-error/10"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-1" />
                )}
                {language === 'zh' ? '删除' : 'Delete'}
              </GradientButton>
            </div>
          </motion.div>
        )}
      </div>

      {/* Select All Toggle */}
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
            {isAllSelected
              ? (language === 'zh' ? '取消全选' : 'Deselect all')
              : (language === 'zh' ? '全选' : 'Select all')}
          </span>
          <span className="text-xs text-foreground-muted ml-auto">
            {filteredHistory.length} {language === 'zh' ? '条记录' : 'items'}
          </span>
        </div>
      )}

      {/* Timeline View */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p className="text-sm text-foreground-muted">
              {language === 'zh' ? '加载中...' : 'Loading...'}
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-foreground-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.dashboard.history.empty.title}</h3>
            <p className="text-sm text-foreground-secondary">{t.dashboard.history.empty.description}</p>
          </div>
        ) : (
          <div className="p-4">
            {timelineGroups.map((group, groupIndex) => (
              <div key={group.label} className="mb-6 last:mb-0">
                {/* Date Group Header */}
                <div className="flex items-center gap-3 mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {language === 'zh' ? group.labelZh : group.label}
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      {group.items.length} {language === 'zh' ? '条记录' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Timeline Items */}
                <div className="relative ml-5 pl-5 border-l-2 border-border">
                  {group.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: itemIndex * 0.05 }}
                      className="relative pb-4 last:pb-0"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[25px] top-2 w-3 h-3 rounded-full bg-surface border-2 border-primary" />

                      {/* Card */}
                      <div
                        className={cn(
                          "ml-4 p-4 rounded-xl border transition-all cursor-pointer group",
                          expandedItem === item.id
                            ? "bg-surface border-primary/50"
                            : "bg-card border-border hover:border-primary/30 hover:bg-surface"
                        )}
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleSelectItem(item.id)
                            }}
                            className="p-1 rounded hover:bg-surface-hover transition-colors mt-0.5 shrink-0"
                          >
                            {selectedItems.has(item.id) ? (
                              <CheckSquare className="w-4 h-4 text-accent" />
                            ) : (
                              <Square className="w-4 h-4 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-foreground line-clamp-1">{item.title}</h4>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFavorite(item.id)
                                  }}
                                  className="p-1 rounded hover:bg-surface-hover transition-colors"
                                >
                                  <Star
                                    className={cn(
                                      "w-4 h-4",
                                      item.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-foreground-muted",
                                    )}
                                  />
                                </button>
                                <motion.div
                                  animate={{ rotate: expandedItem === item.id ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight className="w-4 h-4 text-foreground-muted" />
                                </motion.div>
                              </div>
                            </div>
                            <p className="text-sm text-foreground-secondary line-clamp-2 mb-3">{item.preview}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-foreground-muted bg-surface px-2 py-0.5 rounded">
                                  <Sparkles className="w-3 h-3" />
                                  {item.model}
                                </span>
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

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {expandedItem === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t border-border space-y-4">
                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <GradientButton size="sm" onClick={(e) => {
                                    e.stopPropagation()
                                    handleReOptimize(item)
                                  }}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {language === 'zh' ? '再次优化' : 'Re-optimize'}
                                  </GradientButton>
                                  <GradientButton variant="secondary" size="sm" onClick={(e) => {
                                    e.stopPropagation()
                                    handleContinueOptimize(item)
                                  }}>
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    {language === 'zh' ? '基于此继续' : 'Continue'}
                                  </GradientButton>
                                  <GradientButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setShowCompare(!showCompare)
                                    }}
                                  >
                                    <GitCompare className="w-4 h-4 mr-2" />
                                    {language === 'zh' ? (showCompare ? '隐藏对比' : '对比') : (showCompare ? 'Hide' : 'Compare')}
                                  </GradientButton>
                                </div>

                                {showCompare ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-error" />
                                          {language === 'zh' ? '原始' : 'Original'}
                                        </h5>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleCopy(item.originalContent, `${item.id}-original`)
                                          }}
                                          className="p-1 rounded hover:bg-surface-hover"
                                        >
                                          {copiedId === `${item.id}-original` ? (
                                            <span className="text-xs text-success">✓</span>
                                          ) : (
                                            <Copy className="w-3 h-3 text-foreground-muted" />
                                          )}
                                        </button>
                                      </div>
                                      <div className="p-3 rounded-lg bg-error/5 border border-error/20 text-sm text-foreground-secondary whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {item.originalContent}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-success" />
                                          {language === 'zh' ? '优化后' : 'Optimized'}
                                        </h5>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleCopy(item.optimizedContent, `${item.id}-optimized`)
                                          }}
                                          className="p-1 rounded hover:bg-surface-hover"
                                        >
                                          {copiedId === `${item.id}-optimized` ? (
                                            <span className="text-xs text-success">✓</span>
                                          ) : (
                                            <Copy className="w-3 h-3 text-foreground-muted" />
                                          )}
                                        </button>
                                      </div>
                                      <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-sm text-foreground-secondary whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {item.optimizedContent}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-sm font-medium text-foreground">
                                        {language === 'zh' ? '优化结果' : 'Optimized Result'}
                                      </h5>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCopy(item.optimizedContent, `${item.id}-result`)
                                        }}
                                        className="p-1 rounded hover:bg-surface-hover"
                                      >
                                        {copiedId === `${item.id}-result` ? (
                                          <span className="text-xs text-success">Copied!</span>
                                        ) : (
                                          <Copy className="w-4 h-4 text-foreground-muted" />
                                        )}
                                      </button>
                                    </div>
                                    <div className="p-4 rounded-lg bg-surface border border-border text-sm text-foreground-secondary whitespace-pre-wrap max-h-60 overflow-y-auto">
                                      {item.optimizedContent}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
