"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  LayoutTemplate,
  Copy,
  Trash2,
  Search,
  Star,
  ChevronDown,
  ExternalLink,
  Clock,
  Eye,
  X,
  Check,
  ArrowUpDown,
  Sparkles,
  Code,
  ImageIcon,
  Briefcase,
  GraduationCap,
  Heart,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

// Extended mock data with more details
const mockFavoritePrompts = [
  {
    id: "1",
    title: "SEO Blog Writer",
    content:
      "You are an expert content strategist with 10+ years of experience in SEO and digital marketing. Your task is to write a comprehensive, engaging blog post that ranks well on search engines while providing genuine value to readers. Focus on natural keyword integration, proper heading structure, and actionable insights.",
    tags: ["Writing", "SEO", "Marketing"],
    category: "writing",
    savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    usageCount: 23,
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: "PromptCraft",
  },
  {
    id: "2",
    title: "Code Reviewer",
    content:
      "Act as a senior software engineer with expertise in code quality, design patterns, and best practices. Review the following code for: 1) Bugs and potential issues, 2) Performance optimizations, 3) Code style and readability, 4) Security vulnerabilities, 5) Suggestions for improvement. Provide specific line-by-line feedback.",
    tags: ["Coding", "Review", "Best Practices"],
    category: "coding",
    savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    usageCount: 45,
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: "You",
  },
  {
    id: "3",
    title: "Midjourney Portrait",
    content:
      "Professional headshot portrait photography, studio lighting, shallow depth of field, 85mm lens, natural skin texture, corporate style, neutral background, high resolution, photorealistic, award-winning photography --ar 3:4 --v 6 --style raw",
    tags: ["Image", "Midjourney", "Portrait"],
    category: "image",
    savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    usageCount: 12,
    lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: "PromptCraft",
  },
  {
    id: "4",
    title: "Email Tone Adjuster",
    content:
      "You are an expert communication specialist. Take the following email draft and rewrite it to be more [TONE: professional/friendly/assertive/apologetic]. Maintain the core message while adjusting the language, greetings, and closing to match the desired tone. Preserve any specific details or deadlines mentioned.",
    tags: ["Email", "Communication", "Business"],
    category: "business",
    savedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    usageCount: 67,
    lastUsed: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdBy: "You",
  },
  {
    id: "5",
    title: "Study Notes Generator",
    content:
      "You are an educational expert specializing in creating effective study materials. Transform the following content into comprehensive study notes with: 1) Key concepts highlighted, 2) Bullet-point summaries, 3) Mnemonics for memorization, 4) Practice questions, 5) Related topics to explore. Make it suitable for active recall learning.",
    tags: ["Education", "Study", "Learning"],
    category: "education",
    savedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    usageCount: 34,
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdBy: "PromptCraft",
  },
]

const mockFavoriteTemplates = [
  {
    id: "1",
    title: "Product Description",
    description:
      "Generate compelling product descriptions for e-commerce platforms with SEO optimization and emotional triggers.",
    content:
      "Write a product description for {{product_name}}. Target audience: {{audience}}. Key features: {{features}}. Tone: {{tone}}. Include benefits, specifications, and a compelling call-to-action.",
    category: "Marketing",
    tags: ["E-commerce", "Copywriting"],
    savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    usageCount: 89,
    lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000),
    createdBy: "PromptCraft",
  },
  {
    id: "2",
    title: "Email Responder",
    description:
      "Professional email response generator for various business scenarios including customer support and sales.",
    content:
      "Draft a professional response to this email: {{email_content}}. Context: {{context}}. Desired outcome: {{outcome}}. Tone: {{tone}}.",
    category: "Business",
    tags: ["Communication", "Customer Service"],
    savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    usageCount: 156,
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: "You",
  },
  {
    id: "3",
    title: "Code Documentation",
    description: "Auto-generate comprehensive documentation for code functions, classes, and APIs.",
    content:
      "Generate documentation for the following code: {{code}}. Include: purpose, parameters, return values, examples, and edge cases.",
    category: "Development",
    tags: ["Documentation", "API"],
    savedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    usageCount: 42,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: "PromptCraft",
  },
  {
    id: "4",
    title: "Social Media Post",
    description: "Create engaging social media content optimized for different platforms.",
    content:
      "Create a {{platform}} post about {{topic}}. Goal: {{goal}}. Include relevant hashtags and emoji. Character limit: {{limit}}.",
    category: "Marketing",
    tags: ["Social Media", "Content"],
    savedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    usageCount: 234,
    lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
    createdBy: "You",
  },
]

const categories = [
  { id: "all", icon: Star },
  { id: "writing", icon: FileText },
  { id: "coding", icon: Code },
  { id: "image", icon: ImageIcon },
  { id: "business", icon: Briefcase },
  { id: "education", icon: GraduationCap },
]

const categoryLabels: Record<string, Record<string, string>> = {
  en: {
    all: "All",
    writing: "Writing",
    coding: "Coding",
    image: "Image",
    business: "Business",
    education: "Education",
    Marketing: "Marketing",
    Business: "Business",
    Development: "Development",
  },
  zh: {
    all: "全部",
    writing: "写作",
    coding: "编程",
    image: "图像",
    business: "商务",
    education: "教育",
    Marketing: "营销",
    Business: "商务",
    Development: "开发",
  },
}

type SortOption = "newest" | "oldest" | "nameAsc" | "nameDesc" | "mostUsed"

export default function FavoritesPage() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<"prompts" | "templates">("prompts")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t.dashboard.favorites.time?.today || "Today"
    if (diffDays === 1) return t.dashboard.favorites.time?.yesterday || "Yesterday"
    if (diffDays < 7)
      return (t.dashboard.favorites.time?.daysAgo || "{count} days ago").replace("{count}", String(diffDays))
    if (diffDays < 30)
      return (t.dashboard.favorites.time?.weeksAgo || "{count} weeks ago").replace(
        "{count}",
        String(Math.floor(diffDays / 7)),
      )
    return (t.dashboard.favorites.time?.monthsAgo || "{count} months ago").replace(
      "{count}",
      String(Math.floor(diffDays / 30)),
    )
  }

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let result = [...mockFavoritePrompts]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory)
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => a.savedAt.getTime() - b.savedAt.getTime())
        break
      case "nameAsc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "nameDesc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "mostUsed":
        result.sort((a, b) => b.usageCount - a.usageCount)
        break
      default:
        result.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
    }

    return result
  }, [searchQuery, selectedCategory, sortBy])

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...mockFavoriteTemplates]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => a.savedAt.getTime() - b.savedAt.getTime())
        break
      case "nameAsc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "nameDesc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "mostUsed":
        result.sort((a, b) => b.usageCount - a.usageCount)
        break
      default:
        result.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
    }

    return result
  }, [searchQuery, sortBy])

  const stats = {
    prompts: mockFavoritePrompts.length,
    templates: mockFavoriteTemplates.length,
    total: mockFavoritePrompts.length + mockFavoriteTemplates.length,
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <Heart className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{t.dashboard.favorites.title}</h1>
            <p className="text-xs text-foreground-muted">
              {t.dashboard.favorites.subtitle || "Your saved prompts and templates"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-foreground-muted" />
              <span className="text-foreground-secondary">
                {stats.prompts} {t.dashboard.favorites.stats?.prompts || "Prompts"}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-foreground-muted" />
              <span className="text-foreground-secondary">
                {stats.templates} {t.dashboard.favorites.stats?.templates || "Templates"}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-6 py-4 border-b border-border bg-surface/50"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-surface rounded-xl w-fit">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("prompts")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === "prompts"
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-foreground-secondary hover:text-foreground hover:bg-background/50",
                )}
              >
                <FileText className="w-4 h-4" />
                {t.dashboard.favorites.tabs?.prompts || "Prompts"}
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    activeTab === "prompts" ? "bg-white/20" : "bg-surface-elevated",
                  )}
                >
                  {stats.prompts}
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("templates")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === "templates"
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-foreground-secondary hover:text-foreground hover:bg-background/50",
                )}
              >
                <LayoutTemplate className="w-4 h-4" />
                {t.dashboard.favorites.tabs?.templates || "Templates"}
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full",
                    activeTab === "templates" ? "bg-white/20" : "bg-surface-elevated",
                  )}
                >
                  {stats.templates}
                </span>
              </motion.button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.dashboard.favorites.search || "Search favorites..."}
                  className="w-64 pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Category Filter (only for prompts) */}
              {activeTab === "prompts" && (
                <div className="flex items-center gap-1 p-1 bg-background rounded-xl border border-border">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          selectedCategory === cat.id
                            ? "bg-primary/20 text-primary"
                            : "text-foreground-muted hover:text-foreground hover:bg-surface",
                        )}
                        title={categoryLabels[language]?.[cat.id] || cat.id}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.button>
                    )
                  })}
                </div>
              )}

              {/* Sort */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-sm text-foreground-secondary hover:text-foreground hover:border-border-hover transition-all"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {t.dashboard.favorites.sortBy || "Sort by"}
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showSortDropdown && "rotate-180")} />
                </motion.button>

                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl bg-card border border-border shadow-xl z-50"
                    >
                      {(["newest", "oldest", "nameAsc", "nameDesc", "mostUsed"] as SortOption[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option)
                            setShowSortDropdown(false)
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm transition-colors",
                            sortBy === option
                              ? "bg-primary/20 text-primary"
                              : "text-foreground-secondary hover:text-foreground hover:bg-surface",
                          )}
                        >
                          {t.dashboard.favorites.sortOptions?.[option] || option}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "prompts" ? (
              <motion.div
                key="prompts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {filteredPrompts.length === 0 ? (
                  <EmptyState
                    type="favorites"
                    title={
                      searchQuery
                        ? "No results found"
                        : t.dashboard.favorites.empty?.promptsTitle || "No favorite prompts"
                    }
                    description={
                      searchQuery
                        ? "Try adjusting your search or filters"
                        : t.dashboard.favorites.empty?.promptsDescription ||
                          "Save your best prompts here for quick access"
                    }
                  />
                ) : (
                  <div className="grid gap-4">
                    {filteredPrompts.map((prompt, index) => (
                      <motion.div
                        key={prompt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                        onClick={() => setSelectedItem({ ...prompt, type: "prompt" })}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-2 rounded-xl",
                                prompt.category === "writing" && "bg-blue-500/20 text-blue-400",
                                prompt.category === "coding" && "bg-green-500/20 text-green-400",
                                prompt.category === "image" && "bg-purple-500/20 text-purple-400",
                                prompt.category === "business" && "bg-orange-500/20 text-orange-400",
                                prompt.category === "education" && "bg-cyan-500/20 text-cyan-400",
                              )}
                            >
                              {prompt.category === "writing" && <FileText className="w-4 h-4" />}
                              {prompt.category === "coding" && <Code className="w-4 h-4" />}
                              {prompt.category === "image" && <ImageIcon className="w-4 h-4" />}
                              {prompt.category === "business" && <Briefcase className="w-4 h-4" />}
                              {prompt.category === "education" && <GraduationCap className="w-4 h-4" />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {prompt.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-foreground-muted">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(prompt.savedAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {prompt.usageCount}x used
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(prompt.id, prompt.content)
                              }}
                              className="p-2 rounded-lg hover:bg-surface transition-colors"
                            >
                              {copiedId === prompt.id ? (
                                <Check className="w-4 h-4 text-success" />
                              ) : (
                                <Copy className="w-4 h-4 text-foreground-muted" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem({ ...prompt, type: "prompt" })
                              }}
                              className="p-2 rounded-lg hover:bg-surface transition-colors"
                            >
                              <Eye className="w-4 h-4 text-foreground-muted" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(prompt.id)
                              }}
                              className="p-2 rounded-lg hover:bg-error/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">{prompt.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {prompt.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 text-xs rounded-full bg-surface text-foreground-muted border border-border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {filteredTemplates.length === 0 ? (
                  <EmptyState
                    type="templates"
                    title={
                      searchQuery
                        ? "No results found"
                        : t.dashboard.favorites.empty?.templatesTitle || "No favorite templates"
                    }
                    description={
                      searchQuery
                        ? "Try adjusting your search"
                        : t.dashboard.favorites.empty?.templatesDescription || "Save templates you use frequently"
                    }
                    actionLabel={t.dashboard.favorites.empty?.action || "Browse Templates"}
                    onAction={() => (window.location.href = "/dashboard/templates")}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredTemplates.map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="group p-5 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all cursor-pointer"
                        onClick={() => setSelectedItem({ ...template, type: "template" })}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                            <LayoutTemplate className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(template.id, template.content)
                              }}
                              className="p-2 rounded-lg hover:bg-surface transition-colors"
                            >
                              {copiedId === template.id ? (
                                <Check className="w-4 h-4 text-success" />
                              ) : (
                                <Copy className="w-4 h-4 text-foreground-muted" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(template.id)
                              }}
                              className="p-2 rounded-lg hover:bg-error/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </motion.button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                          {template.title}
                        </h3>
                        <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-xs rounded-full bg-accent/20 text-accent font-medium">
                              {categoryLabels[language]?.[template.category] || template.category}
                            </span>
                            <span className="text-xs text-foreground-muted flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {template.usageCount}
                            </span>
                          </div>
                          <GradientButton
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Navigate to prompt lab with template
                            }}
                          >
                            {t.dashboard.favorites.actions?.use || "Use"}
                          </GradientButton>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-card border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    {selectedItem.type === "prompt" ? (
                      <FileText className="w-5 h-5 text-accent" />
                    ) : (
                      <LayoutTemplate className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selectedItem.title}</h2>
                    <p className="text-xs text-foreground-muted">
                      {t.dashboard.favorites.detail?.createdBy || "Created by"}: {selectedItem.createdBy}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-foreground-muted" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-surface">
                    <p className="text-xs text-foreground-muted mb-1">
                      {t.dashboard.favorites.detail?.savedAt || "Saved at"}
                    </p>
                    <p className="text-sm font-medium text-foreground">{formatTime(selectedItem.savedAt)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface">
                    <p className="text-xs text-foreground-muted mb-1">
                      {t.dashboard.favorites.detail?.usageCount || "Times used"}
                    </p>
                    <p className="text-sm font-medium text-foreground">{selectedItem.usageCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface">
                    <p className="text-xs text-foreground-muted mb-1">
                      {t.dashboard.favorites.detail?.lastUsed || "Last used"}
                    </p>
                    <p className="text-sm font-medium text-foreground">{formatTime(selectedItem.lastUsed)}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    {t.dashboard.favorites.detail?.content || "Content"}
                  </h3>
                  <div className="relative p-4 rounded-xl bg-surface border border-border">
                    <pre className="text-sm text-foreground-secondary whitespace-pre-wrap font-mono">
                      {selectedItem.content}
                    </pre>
                    <button
                      onClick={() => handleCopy(selectedItem.id + "-modal", selectedItem.content)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-background hover:bg-surface-elevated transition-colors"
                    >
                      {copiedId === selectedItem.id + "-modal" ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-foreground-muted" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    {t.dashboard.favorites.detail?.tags || "Tags"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                <GradientButton variant="secondary" onClick={() => setSelectedItem(null)}>
                  {t.dashboard.favorites.detail?.close || "Close"}
                </GradientButton>
                <GradientButton onClick={() => (window.location.href = "/dashboard")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t.dashboard.favorites.actions?.openInLab || "Open in Prompt Lab"}
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-error/20">
                  <Trash2 className="w-6 h-6 text-error" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t.dashboard.favorites.confirmDelete?.title || "Remove from favorites?"}
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    {t.dashboard.favorites.confirmDelete?.description ||
                      "This item will be removed from your favorites list."}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <GradientButton variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                  {t.dashboard.favorites.confirmDelete?.cancel || "Cancel"}
                </GradientButton>
                <button
                  onClick={() => {
                    // Handle delete
                    setShowDeleteConfirm(null)
                  }}
                  className="px-4 py-2 rounded-full bg-error text-white font-medium hover:bg-error/90 transition-colors"
                >
                  {t.dashboard.favorites.confirmDelete?.confirm || "Remove"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
