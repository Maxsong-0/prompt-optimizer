"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/lib/i18n/language-context"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  ArrowRight, 
  Eye, 
  Star, 
  Copy, 
  Check, 
  X,
  LayoutTemplate,
  Wand2,
  Code2,
  Briefcase,
  Image,
  Megaphone,
  Sparkles
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Template {
  id: string
  title: string
  titleZh: string
  description: string
  descriptionZh: string
  category: string
  tags: string[]
  usageCount: number
  content: string
  author: string
  rating: number
  iconName: string
}

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  Wand2,
  Code2,
  Briefcase,
  Image,
  Megaphone,
}

const mockTemplates: Template[] = [
  {
    id: "1",
    title: "Blog Post Writer",
    titleZh: "博客文章写手",
    description: "Generate engaging blog posts with proper structure and SEO optimization.",
    descriptionZh: "生成结构清晰、SEO 优化的精彩博客文章。",
    category: "Writing",
    tags: ["Blog", "SEO", "Content"],
    usageCount: 2340,
    author: "Promto Team",
    rating: 4.8,
    iconName: "Wand2",
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
    titleZh: "代码审查专家",
    description: "Get detailed code reviews with suggestions for improvement.",
    descriptionZh: "获取详细的代码审查和改进建议。",
    category: "Coding",
    tags: ["Review", "Best Practices"],
    usageCount: 1890,
    author: "Promto Team",
    rating: 4.9,
    iconName: "Code2",
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
    titleZh: "邮件撰写助手",
    description: "Craft professional emails for any occasion.",
    descriptionZh: "为任何场合撰写专业邮件。",
    category: "Business",
    tags: ["Email", "Communication"],
    usageCount: 3210,
    author: "Promto Team",
    rating: 4.7,
    iconName: "Briefcase",
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
    titleZh: "Midjourney 艺术提示词",
    description: "Create detailed prompts for stunning AI-generated artwork.",
    descriptionZh: "创建详细的提示词，生成惊艳的 AI 艺术作品。",
    category: "Image",
    tags: ["Art", "Midjourney", "Creative"],
    usageCount: 4560,
    author: "Creative Studio",
    rating: 4.9,
    iconName: "Image",
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
    titleZh: "产品描述生成器",
    description: "Write compelling product descriptions that convert.",
    descriptionZh: "撰写吸引人的产品描述，提高转化率。",
    category: "Marketing",
    tags: ["E-commerce", "Copywriting"],
    usageCount: 1560,
    author: "Marketing Pro",
    rating: 4.6,
    iconName: "Megaphone",
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
    titleZh: "技术文档撰写",
    description: "Create clear and comprehensive technical docs.",
    descriptionZh: "创建清晰全面的技术文档。",
    category: "Coding",
    tags: ["Docs", "Technical"],
    usageCount: 890,
    author: "Promto Team",
    rating: 4.5,
    iconName: "Code2",
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
  {
    id: "7",
    title: "Social Media Post",
    titleZh: "社交媒体帖子",
    description: "Create engaging social media content that drives engagement.",
    descriptionZh: "创建吸引人的社交媒体内容，提升互动率。",
    category: "Marketing",
    tags: ["Social", "Viral", "Engagement"],
    usageCount: 2100,
    author: "Social Expert",
    rating: 4.7,
    iconName: "Megaphone",
    content: `Create a viral social media post for [PLATFORM - Twitter/LinkedIn/Instagram].

Topic: [TOPIC]
Goal: [GOAL - awareness/engagement/conversion]
Tone: [TONE - professional/casual/humorous/inspirational]
Include: [HASHTAGS/EMOJIS/CTA]

The post should:
- Hook readers in the first line
- Provide value or entertainment
- Encourage engagement (likes, comments, shares)
- Include relevant hashtags
- Be optimized for the platform's algorithm`,
  },
  {
    id: "8",
    title: "Story Writer",
    titleZh: "故事创作助手",
    description: "Craft compelling stories with rich characters and plots.",
    descriptionZh: "创作引人入胜的故事，塑造丰富的角色和情节。",
    category: "Writing",
    tags: ["Story", "Creative", "Fiction"],
    usageCount: 1750,
    author: "Promto Team",
    rating: 4.8,
    iconName: "Wand2",
    content: `Write a compelling short story with the following elements:

Genre: [GENRE - fantasy/sci-fi/romance/thriller/mystery]
Setting: [SETTING - time and place]
Main character: [CHARACTER DESCRIPTION]
Conflict: [MAIN CONFLICT]
Theme: [UNDERLYING THEME]

Length: [WORD COUNT]
Tone: [TONE - dark/light-hearted/suspenseful/romantic]

Include vivid descriptions, engaging dialogue, and a satisfying resolution.`,
  },
]

const categories = [
  { id: "All", label: "All", labelZh: "全部", icon: LayoutTemplate },
  { id: "Writing", label: "Writing", labelZh: "写作", icon: Wand2 },
  { id: "Coding", label: "Coding", labelZh: "编程", icon: Code2 },
  { id: "Business", label: "Business", labelZh: "商务", icon: Briefcase },
  { id: "Image", label: "Image", labelZh: "图像", icon: Image },
  { id: "Marketing", label: "Marketing", labelZh: "营销", icon: Megaphone },
]

// 渲染图标的辅助函数
function TemplateIcon({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = iconMap[iconName] || Wand2
  return <IconComponent className={className} />
}

export default function TemplatesShowcasePage() {
  const { locale } = useLanguage()
  const isZh = locale === "zh"
  const [mounted, setMounted] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 使用 useMemo 优化过滤性能
  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter((template) => {
      const title = isZh ? template.titleZh : template.title
      const description = isZh ? template.descriptionZh : template.description
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, isZh])

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template)
    setShowPreviewModal(true)
  }

  const handleCloseModal = () => {
    setShowPreviewModal(false)
    setTimeout(() => setSelectedTemplate(null), 200)
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // 在客户端挂载前显示静态内容
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-6">
                <LayoutTemplate className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground-secondary">Template Library</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Professional Prompt Templates
              </h1>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-8">
                Explore hundreds of carefully crafted prompt templates covering writing, coding, design, and more.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-6">
              <LayoutTemplate className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground-secondary">
                {isZh ? "模板库" : "Template Library"}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {isZh ? "专业提示词模板" : "Professional Prompt Templates"}
            </h1>
            <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-8">
              {isZh 
                ? "探索数百个精心设计的提示词模板，涵盖写作、编程、设计等多个领域。" 
                : "Explore hundreds of carefully crafted prompt templates covering writing, coding, design, and more."}
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isZh ? "搜索模板..." : "Search templates..."}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>

          {/* Category Filter - 使用简单的 CSS 过渡 */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
            {categories.map((category) => {
              const CategoryIcon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                      : "bg-surface text-foreground-secondary hover:bg-surface-hover border border-border"
                  )}
                >
                  <CategoryIcon className="w-4 h-4" />
                  {isZh ? category.labelZh : category.label}
                </button>
              )
            })}
          </div>

          {/* Templates Count */}
          <div className="text-center mb-8">
            <p className="text-foreground-muted text-sm">
              {isZh 
                ? `找到 ${filteredTemplates.length} 个模板` 
                : `Found ${filteredTemplates.length} templates`}
            </p>
          </div>

          {/* Templates Grid - 使用简单的 CSS 过渡代替复杂动画 */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                    <TemplateIcon iconName={template.iconName} className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-foreground-muted">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      {template.rating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isZh ? template.titleZh : template.title}
                </h3>
                <p className="text-sm text-foreground-secondary mb-4 line-clamp-2 flex-grow">
                  {isZh ? template.descriptionZh : template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-foreground-muted">
                    {template.usageCount.toLocaleString()} {isZh ? "次使用" : "uses"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-2 rounded-lg hover:bg-surface transition-colors hover:scale-110 active:scale-95"
                      title={isZh ? "预览" : "Preview"}
                    >
                      <Eye className="w-4 h-4 text-foreground-muted" />
                    </button>
                    <button
                      onClick={() => handleCopy(template.content, template.id)}
                      className="p-2 rounded-lg hover:bg-surface transition-colors hover:scale-110 active:scale-95"
                      title={isZh ? "复制" : "Copy"}
                    >
                      {copiedId === template.id ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4 text-foreground-muted" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
            <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isZh ? "想要更多功能？" : "Want More Features?"}
            </h2>
            <p className="text-foreground-secondary mb-6 max-w-xl mx-auto">
              {isZh 
                ? "注册免费账户，解锁提示词优化、版本对比、保存收藏等更多强大功能。" 
                : "Sign up for a free account to unlock prompt optimization, version comparison, favorites, and more powerful features."}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/register">
                <GradientButton size="lg">
                  {isZh ? "免费注册" : "Sign Up Free"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GradientButton>
              </Link>
              <Link href="/dashboard">
                <GradientButton variant="secondary" size="lg">
                  {isZh ? "进入工作台" : "Go to Dashboard"}
                </GradientButton>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-2xl max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                      <TemplateIcon iconName={selectedTemplate.iconName} className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        {isZh ? selectedTemplate.titleZh : selectedTemplate.title}
                      </h2>
                      <p className="text-sm text-foreground-secondary">
                        {isZh ? `作者：${selectedTemplate.author}` : `By ${selectedTemplate.author}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-lg hover:bg-surface transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground-muted" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-md bg-surface-elevated text-foreground-secondary">
                    {selectedTemplate.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-foreground-muted">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    {selectedTemplate.rating}
                  </span>
                  <span className="text-sm text-foreground-muted">
                    {selectedTemplate.usageCount.toLocaleString()} {isZh ? "次使用" : "uses"}
                  </span>
                </div>
                
                <p className="text-foreground-secondary mb-6">
                  {isZh ? selectedTemplate.descriptionZh : selectedTemplate.description}
                </p>

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {isZh ? "模板内容" : "Template Content"}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedTemplate.content, selectedTemplate.id + "-modal")}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-surface hover:bg-surface-hover transition-colors text-sm"
                    >
                      {copiedId === selectedTemplate.id + "-modal" ? (
                        <>
                          <Check className="w-4 h-4 text-success" />
                          {isZh ? "已复制" : "Copied"}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {isZh ? "复制" : "Copy"}
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-surface border border-border text-sm text-foreground-secondary whitespace-pre-wrap font-mono overflow-x-auto">
                    {selectedTemplate.content}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border bg-surface/50 shrink-0">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 text-xs rounded-full bg-primary/10 text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href="/register">
                    <GradientButton>
                      {isZh ? "使用此模板" : "Use Template"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </GradientButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
