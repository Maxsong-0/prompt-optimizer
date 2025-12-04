"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

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

// =====================================================
// Mock数据
// =====================================================

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    title: "Blog post about AI trends",
    model: "GPT-4o",
    tags: ["Writing", "Blog"],
    createdAt: "2 hours ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    preview: "Write a comprehensive blog post about emerging AI trends...",
    originalContent: `Write a blog post about AI trends.

Make it interesting and informative.
Include some examples.`,
    optimizedContent: `You are an expert technology journalist with 10+ years of experience covering AI developments.

Your task is to write a comprehensive, engaging blog post about emerging AI trends that:
- Captures the reader's attention from the first sentence
- Provides actionable insights and real-world examples
- Is optimized for search engines without sacrificing readability
- Follows a clear structure with compelling headings

Target Audience: Tech enthusiasts and business professionals
Desired Length: 1500-2000 words
Tone: Professional yet conversational

Format your response with:
1. An attention-grabbing headline
2. A hook introduction (2-3 sentences)
3. 3-4 main sections covering key AI trends
4. Real-world examples and case studies
5. A strong call-to-action conclusion`,
    isFavorite: true,
  },
  {
    id: "2",
    title: "React component generator",
    model: "Claude 3.5",
    tags: ["Coding", "React"],
    createdAt: "5 hours ago",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    preview: "Generate a reusable React component that...",
    originalContent: `Create a React button component.`,
    optimizedContent: `Act as a senior React developer with expertise in TypeScript and modern React patterns.

Create a reusable Button component with the following specifications:

**Requirements:**
- TypeScript with proper type definitions
- Support for variants: primary, secondary, outline, ghost
- Support for sizes: sm, md, lg
- Loading state with spinner
- Disabled state styling
- Icon support (left and right positions)
- Proper accessibility attributes (ARIA)
- CSS-in-JS or Tailwind CSS styling

**Include:**
- Component file with all variants
- Usage examples
- PropTypes documentation`,
  },
  {
    id: "3",
    title: "Product description for website",
    model: "GPT-4o Mini",
    tags: ["Marketing", "E-commerce"],
    createdAt: "Yesterday",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    preview: "Create an engaging product description for...",
    originalContent: `Write a product description for a wireless headphone.`,
    optimizedContent: `You are a professional e-commerce copywriter specializing in consumer electronics.

Create a compelling product description for premium wireless headphones that:

**Product Details:**
- Product: [Wireless Over-ear Headphones]
- Key Features: Active Noise Cancellation, 30-hour battery, Hi-Fi sound

**Guidelines:**
1. Open with a benefit-focused headline
2. Highlight 3-5 key features with customer benefits
3. Use sensory language to describe the audio experience
4. Include social proof placeholder
5. End with a compelling CTA

**Tone:** Premium, aspirational, yet accessible
**Length:** 150-200 words
**Format:** Include bullet points for features`,
  },
  {
    id: "4",
    title: "Email marketing template",
    model: "Claude 3.5",
    tags: ["Marketing", "Email"],
    createdAt: "2 days ago",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    preview: "Create an email marketing template for product launch...",
    originalContent: `Write an email for product launch.`,
    optimizedContent: `Act as a senior email marketing specialist. Create a product launch email...`,
  },
  {
    id: "5",
    title: "Midjourney fantasy landscape",
    model: "Midjourney",
    tags: ["Image", "Art"],
    createdAt: "1 week ago",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    preview: "A mystical forest with bioluminescent plants...",
    originalContent: `A fantasy forest image.`,
    optimizedContent: `A mystical enchanted forest at twilight, bioluminescent plants casting ethereal blue and purple glow, ancient twisted trees with glowing runes carved into bark, magical fireflies dancing in the mist, a hidden pathway leading to a distant crystal tower, volumetric fog, cinematic lighting, fantasy art style, highly detailed, 8k resolution --ar 16:9 --v 5.2 --style raw`,
  },
  {
    id: "6",
    title: "API Documentation",
    model: "GPT-4o",
    tags: ["Coding", "Documentation"],
    createdAt: "2 weeks ago",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    preview: "Generate comprehensive API documentation...",
    originalContent: `Write API docs for a REST API.`,
    optimizedContent: `Act as a technical writer specializing in API documentation. Create comprehensive, developer-friendly API documentation...`,
  },
]

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

export function HistoryList() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState(mockHistory)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

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
              >
                <Trash2 className="w-4 h-4 mr-1" />
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
        {filteredHistory.length === 0 ? (
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
