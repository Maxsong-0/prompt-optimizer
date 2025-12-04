"use client"

import { useState, useEffect, useCallback } from "react"
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
  Loader2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { TemplatePreviewModal } from "./template-preview-modal"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
  user_id?: string | null
  is_system?: boolean
}

// API响应类型
interface TemplateFromAPI {
  id: string
  user_id: string | null
  title: string
  description: string | null
  content: string
  category: string
  tags: string[] | null
  is_public: boolean
  is_system: boolean
  usage_count: number
  rating: number
  rating_count: number
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

// 将API响应转换为前端格式
const transformTemplateFromAPI = (template: TemplateFromAPI): Template => {
  // 分类映射
  const categoryMap: Record<string, string> = {
    writing: 'Writing',
    coding: 'Coding',
    marketing: 'Marketing',
    business: 'Business',
    image: 'Image',
    education: 'Education',
    custom: 'Custom',
  }
  
  return {
    id: template.id,
    title: template.title,
    description: template.description || '',
    category: categoryMap[template.category] || 'Custom',
    tags: template.tags || [],
    usageCount: template.usage_count,
    content: template.content,
    author: template.metadata?.author || (template.is_system ? 'Promto Team' : 'You'),
    rating: template.rating || undefined,
    isFavorite: false, // TODO: 可以从收藏API获取
    isCustom: !template.is_system && template.user_id !== null,
    user_id: template.user_id,
    is_system: template.is_system,
  }
}

const DEFAULT_CATEGORIES = ["All", "Writing", "Coding", "Business", "Image", "Marketing", "Custom"]

export function TemplatesGrid() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
    category: "custom",
    tags: "",
    content: "",
  })
  const [newCategory, setNewCategory] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // 获取模板列表
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/templates?limit=100')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // API 返回格式: { data: [...], total, limit, offset }
          // 或者直接数组（兼容两种格式）
          const templateData = Array.isArray(result.data) 
            ? result.data 
            : (result.data.data || [])
          
          if (Array.isArray(templateData)) {
            const transformedTemplates = templateData.map(transformTemplateFromAPI)
            setTemplates(transformedTemplates)
          }
        }
      } else {
        console.error('Failed to fetch templates')
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      toast.error(language === 'zh' ? '获取模板失败' : 'Failed to fetch templates')
    } finally {
      setIsLoading(false)
    }
  }, [language])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

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

  const handleUseTemplate = async (template: Template) => {
    // 记录使用
    try {
      await fetch(`/api/templates/${template.id}/use`, { method: 'POST' })
    } catch (error) {
      // 忽略错误，不影响使用
    }
    
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

  const toggleFavorite = async (id: string) => {
    const template = templates.find(t => t.id === id)
    if (!template) return
    
    const newFavoriteState = !template.isFavorite
    
    // 乐观更新
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, isFavorite: newFavoriteState } : t
    ))
    
    try {
      const response = await fetch(`/api/templates/${id}/favorite`, {
        method: newFavoriteState ? 'POST' : 'DELETE',
      })
      
      if (!response.ok) {
        // 回滚
        setTemplates(templates.map(t => 
          t.id === id ? { ...t, isFavorite: !newFavoriteState } : t
        ))
        toast.error(language === 'zh' ? '操作失败' : 'Failed to update')
      }
    } catch (error) {
      // 回滚
      setTemplates(templates.map(t => 
        t.id === id ? { ...t, isFavorite: !newFavoriteState } : t
      ))
      toast.error(language === 'zh' ? '操作失败' : 'Failed to update')
    }
  }

  // Create Template
  const handleCreate = async () => {
    setIsSaving(true)
    try {
      // 分类映射（前端到后端）
      const categoryMap: Record<string, string> = {
        'Writing': 'writing',
        'Coding': 'coding',
        'Marketing': 'marketing',
        'Business': 'business',
        'Image': 'image',
        'Education': 'education',
        'Custom': 'custom',
      }
      
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          category: categoryMap[formData.category] || 'custom',
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create template')
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        const newTemplate = transformTemplateFromAPI(result.data)
        setTemplates([newTemplate, ...templates])
        toast.success(language === 'zh' ? '模板创建成功' : 'Template created successfully')
      }
      
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create template'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Edit Template
  const handleEdit = async () => {
    if (!editingTemplate) return
    
    setIsSaving(true)
    try {
      // 分类映射（前端到后端）
      const categoryMap: Record<string, string> = {
        'Writing': 'writing',
        'Coding': 'coding',
        'Marketing': 'marketing',
        'Business': 'business',
        'Image': 'image',
        'Education': 'education',
        'Custom': 'custom',
      }
      
      const response = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          category: categoryMap[formData.category] || 'custom',
          tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update template')
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        const updatedTemplate = transformTemplateFromAPI(result.data)
        setTemplates(templates.map(t => 
          t.id === editingTemplate.id ? updatedTemplate : t
        ))
        toast.success(language === 'zh' ? '模板更新成功' : 'Template updated successfully')
      }
      
      setShowEditModal(false)
      setEditingTemplate(null)
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update template'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Delete Template
  const handleDelete = async () => {
    if (!templateToDelete) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/templates/${templateToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete template')
      }
      
      setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      toast.success(language === 'zh' ? '模板已删除' : 'Template deleted')
      setShowDeleteConfirm(false)
      setTemplateToDelete(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete template'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
            <p className="text-sm text-foreground-muted">
              {language === 'zh' ? '加载中...' : 'Loading...'}
            </p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-semibold text-foreground mb-2">
              {language === 'zh' ? '暂无模板' : 'No templates found'}
            </p>
            <p className="text-sm text-foreground-secondary">
              {searchQuery 
                ? (language === 'zh' ? '尝试调整搜索条件' : 'Try adjusting your search')
                : (language === 'zh' ? '创建您的第一个模板' : 'Create your first template')}
            </p>
          </div>
        ) : (
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
        )}
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
                    disabled={isSaving}
                  >
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </GradientButton>
                  <GradientButton
                    onClick={showEditModal ? handleEdit : handleCreate}
                    disabled={!formData.title || !formData.content || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'zh' ? '保存中...' : 'Saving...'}
                      </>
                    ) : showEditModal 
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
                <GradientButton variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                  {language === 'zh' ? '取消' : 'Cancel'}
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  className="text-error hover:bg-error/10"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'zh' ? '删除中...' : 'Deleting...'}
                    </>
                  ) : (language === 'zh' ? '删除' : 'Delete')}
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
