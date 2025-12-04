"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ArrowRight,
  Eye,
  Star,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Copy,
  Check,
  X,
  FolderPlus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { TemplatePreviewModal } from "./template-preview-modal"
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
  isFavorite?: boolean
  isCustom?: boolean
}

const mockTemplates: Template[] = [
  {
    id: "1",
    title: "Blog Post Writer",
    description: "Generate engaging blog posts with proper structure and SEO optimization.",
    category: "Writing",
    tags: ["Blog", "SEO", "Content"],
    usageCount: 2340,
    author: "Promto Team",
    rating: 4.8,
    content: `You are an expert content writer specializing in creating engaging, SEO-optimized blog posts.

Your task is to write a blog post on the topic: [TOPIC]

Follow these guidelines:
1. Start with an attention-grabbing headline
2. Include a compelling introduction that hooks the reader
3. Use clear subheadings to organize content (H2, H3)
4. Include relevant keywords naturally throughout
5. Add bullet points or numbered lists for easy scanning
6. End with a strong call-to-action

Target audience: [AUDIENCE]
Tone: [TONE - professional/casual/friendly]
Word count: [WORD_COUNT]`,
  },
  {
    id: "2",
    title: "Code Reviewer",
    description: "Get detailed code reviews with suggestions for improvement.",
    category: "Coding",
    tags: ["Review", "Best Practices"],
    usageCount: 1890,
    author: "Promto Team",
    rating: 4.9,
    content: `Act as a senior software engineer conducting a thorough code review.

Analyze the following code and provide:
1. A summary of what the code does
2. Potential bugs or issues
3. Security vulnerabilities
4. Performance improvements
5. Code style and best practice suggestions
6. Refactoring recommendations

Be specific and provide code examples when suggesting improvements.

Code to review:
\`\`\`
[PASTE YOUR CODE HERE]
\`\`\``,
  },
  {
    id: "3",
    title: "Email Composer",
    description: "Craft professional emails for any occasion.",
    category: "Business",
    tags: ["Email", "Communication"],
    usageCount: 3210,
    author: "Promto Team",
    rating: 4.7,
    content: `You are a professional communication specialist. Write an email with the following details:

Purpose: [PURPOSE - follow-up/introduction/request/thank you]
Recipient: [RECIPIENT - colleague/client/manager]
Tone: [TONE - formal/semi-formal/friendly]
Key points to include:
- [POINT 1]
- [POINT 2]
- [POINT 3]

The email should be concise, clear, and professional while maintaining a [TONE] tone.`,
  },
  {
    id: "4",
    title: "Midjourney Art Prompt",
    description: "Create detailed prompts for stunning AI-generated artwork.",
    category: "Image",
    tags: ["Art", "Midjourney", "Creative"],
    usageCount: 4560,
    author: "Creative Studio",
    rating: 4.9,
    content: `Generate a detailed Midjourney prompt for the following concept:

Subject: [SUBJECT]
Style: [STYLE - photorealistic/anime/oil painting/digital art]
Mood: [MOOD - dramatic/peaceful/mysterious/vibrant]
Lighting: [LIGHTING - golden hour/studio/neon/natural]
Camera angle: [ANGLE - close-up/wide shot/bird's eye]

Format the output as:
[subject description], [style], [mood], [lighting], [camera angle], [additional details] --ar [aspect ratio] --v 5.2`,
  },
  {
    id: "5",
    title: "Product Description",
    description: "Write compelling product descriptions that convert.",
    category: "Marketing",
    tags: ["E-commerce", "Copywriting"],
    usageCount: 1560,
    author: "Marketing Pro",
    rating: 4.6,
    content: `Create a compelling product description for an e-commerce listing.

Product: [PRODUCT NAME]
Category: [CATEGORY]
Key Features:
- [FEATURE 1]
- [FEATURE 2]
- [FEATURE 3]

Target audience: [TARGET AUDIENCE]
Unique selling points: [USPs]

Write a description that:
1. Hooks the reader in the first sentence
2. Highlights benefits over features
3. Uses sensory language
4. Includes a call-to-action
5. Is optimized for SEO with natural keyword placement`,
  },
  {
    id: "6",
    title: "Technical Documentation",
    description: "Create clear and comprehensive technical docs.",
    category: "Coding",
    tags: ["Docs", "Technical"],
    usageCount: 890,
    author: "Promto Team",
    rating: 4.5,
    content: `Write technical documentation for the following:

Component/Feature: [NAME]
Type: [API/Component/Function/System]
Purpose: [BRIEF DESCRIPTION]

Include:
1. Overview/Introduction
2. Prerequisites/Requirements
3. Installation/Setup (if applicable)
4. Usage examples with code snippets
5. API reference/Props (if applicable)
6. Common use cases
7. Troubleshooting section
8. Related resources

Use clear, concise language suitable for developers of all skill levels.`,
  },
]

const DEFAULT_CATEGORIES = ["All", "Writing", "Coding", "Business", "Image", "Marketing", "Custom"]

export function TemplatesGrid() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Custom",
    tags: "",
    content: "",
  })
  const [newCategory, setNewCategory] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template)
    setShowPreviewModal(true)
  }

  const handleUseTemplate = (template: Template) => {
    // 存储到sessionStorage然后跳转到Dashboard
    sessionStorage.setItem('promto-reoptimize', JSON.stringify({
      content: template.content,
      title: template.title,
    }))
    router.push('/dashboard')
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleFavorite = (id: string) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    ))
  }

  // Create Template
  const handleCreate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      content: formData.content,
      usageCount: 0,
      author: "You",
      isCustom: true,
    }
    setTemplates([newTemplate, ...templates])
    setShowCreateModal(false)
    resetForm()
  }

  // Edit Template
  const handleEdit = () => {
    if (!editingTemplate) return
    setTemplates(templates.map(t => 
      t.id === editingTemplate.id ? {
        ...t,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        content: formData.content,
      } : t
    ))
    setShowEditModal(false)
    setEditingTemplate(null)
    resetForm()
  }

  // Delete Template
  const handleDelete = () => {
    if (!templateToDelete) return
    setTemplates(templates.filter(t => t.id !== templateToDelete.id))
    setShowDeleteConfirm(false)
    setTemplateToDelete(null)
  }

  // Open edit modal
  const openEditModal = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      title: template.title,
      description: template.description,
      category: template.category,
      tags: template.tags.join(", "),
      content: template.content,
    })
    setShowEditModal(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Custom",
      tags: "",
      content: "",
    })
  }

  // Add category
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories.slice(0, -1), newCategory, "Custom"])
      setNewCategory("")
      setShowCategoryModal(false)
    }
  }

  // Export templates
  const handleExport = () => {
    const exportData = templates.filter(t => t.isCustom)
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "promto-templates.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import templates
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (Array.isArray(imported)) {
          const newTemplates = imported.map((t: any) => ({
            ...t,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            isCustom: true,
            author: "Imported",
          }))
          setTemplates([...newTemplates, ...templates])
        }
      } catch (error) {
        console.error("Failed to import templates:", error)
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.dashboard.templates.search}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <GradientButton size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'zh' ? '新建模板' : 'New Template'}
            </GradientButton>
            <GradientButton variant="secondary" size="sm" onClick={() => setShowCategoryModal(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              {language === 'zh' ? '添加分类' : 'Add Category'}
            </GradientButton>
            <GradientButton variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </GradientButton>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <GradientButton variant="ghost" size="sm" as="span" className="cursor-pointer">
                <Upload className="w-4 h-4" />
              </GradientButton>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                selectedCategory === category
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "bg-surface text-foreground-secondary hover:bg-surface-hover",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              className="group p-5 rounded-xl bg-card border border-border hover:border-border-hover transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-md",
                  template.isCustom 
                    ? "bg-accent/20 text-accent" 
                    : "bg-surface-elevated text-foreground-secondary"
                )}>
                  {template.category}
                  {template.isCustom && " ★"}
                </span>
                <div className="flex items-center gap-2">
                  {template.rating && (
                    <span className="flex items-center gap-1 text-xs text-foreground-muted">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {template.rating}
                    </span>
                  )}
                  <span className="text-xs text-foreground-muted">{template.usageCount.toLocaleString()} uses</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{template.title}</h3>
              <p className="text-sm text-foreground-secondary mb-4 line-clamp-2">{template.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-accent">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(template.id)}
                    className="p-2 rounded-lg hover:bg-surface transition-colors"
                  >
                    <Star className={cn(
                      "w-4 h-4",
                      template.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-foreground-muted"
                    )} />
                  </button>
                  <button
                    onClick={() => handleCopy(template.content, template.id)}
                    className="p-2 rounded-lg hover:bg-surface transition-colors"
                  >
                    {copiedId === template.id ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-foreground-muted" />
                    )}
                  </button>
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-2 rounded-lg hover:bg-surface transition-colors"
                    title={t.dashboard.templates.preview}
                  >
                    <Eye className="w-4 h-4 text-foreground-muted" />
                  </button>
                  {template.isCustom && (
                    <>
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-2 rounded-lg hover:bg-surface transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-foreground-muted" />
                      </button>
                      <button
                        onClick={() => {
                          setTemplateToDelete(template)
                          setShowDeleteConfirm(true)
                        }}
                        className="p-2 rounded-lg hover:bg-error/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </button>
                    </>
                  )}
                  <GradientButton size="sm" onClick={() => handleUseTemplate(template)}>
                    Use
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        template={selectedTemplate}
        onUseTemplate={handleUseTemplate}
      />

      {/* Create/Edit Template Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowCreateModal(false)
                setShowEditModal(false)
                resetForm()
              }}
            />
            <motion.div
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {showEditModal 
                    ? (language === 'zh' ? '编辑模板' : 'Edit Template')
                    : (language === 'zh' ? '创建模板' : 'Create Template')}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    resetForm()
                  }}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <X className="w-5 h-5 text-foreground-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'zh' ? '模板名称' : 'Template Name'}
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={language === 'zh' ? '输入模板名称...' : 'Enter template name...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'zh' ? '描述' : 'Description'}
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === 'zh' ? '简短描述模板用途...' : 'Brief description of the template...'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {language === 'zh' ? '分类' : 'Category'}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground"
                    >
                      {categories.filter(c => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {language === 'zh' ? '标签（逗号分隔）' : 'Tags (comma separated)'}
                    </label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g. Writing, SEO, Blog"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === 'zh' ? '模板内容' : 'Template Content'}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={language === 'zh' ? '输入Prompt模板内容，使用 [PLACEHOLDER] 作为占位符...' : 'Enter prompt template content, use [PLACEHOLDER] for placeholders...'}
                    rows={10}
                    className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted resize-none font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <GradientButton
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                      resetForm()
                    }}
                  >
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </GradientButton>
                  <GradientButton
                    onClick={showEditModal ? handleEdit : handleCreate}
                    disabled={!formData.title || !formData.content}
                  >
                    {showEditModal 
                      ? (language === 'zh' ? '保存更改' : 'Save Changes')
                      : (language === 'zh' ? '创建模板' : 'Create Template')}
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && templateToDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {language === 'zh' ? '删除模板' : 'Delete Template'}
              </h2>
              <p className="text-sm text-foreground-secondary mb-6">
                {language === 'zh' 
                  ? `确定要删除模板 "${templateToDelete.title}" 吗？此操作无法撤销。`
                  : `Are you sure you want to delete "${templateToDelete.title}"? This action cannot be undone.`}
              </p>
              <div className="flex justify-end gap-3">
                <GradientButton variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                  {language === 'zh' ? '取消' : 'Cancel'}
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  className="text-error hover:bg-error/10"
                  onClick={handleDelete}
                >
                  {language === 'zh' ? '删除' : 'Delete'}
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCategoryModal(false)}
            />
            <motion.div
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {language === 'zh' ? '添加分类' : 'Add Category'}
              </h2>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={language === 'zh' ? '输入分类名称...' : 'Enter category name...'}
                className="mb-4"
              />
              <div className="flex justify-end gap-3">
                <GradientButton variant="secondary" onClick={() => setShowCategoryModal(false)}>
                  {language === 'zh' ? '取消' : 'Cancel'}
                </GradientButton>
                <GradientButton onClick={handleAddCategory} disabled={!newCategory}>
                  {language === 'zh' ? '添加' : 'Add'}
                </GradientButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
