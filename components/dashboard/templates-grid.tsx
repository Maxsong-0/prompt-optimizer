"use client"

import { useState } from "react"
import { Search, ArrowRight, Eye, Star } from "lucide-react"
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
}

const mockTemplates: Template[] = [
  {
    id: "1",
    title: "Blog Post Writer",
    description: "Generate engaging blog posts with proper structure and SEO optimization.",
    category: "Writing",
    tags: ["Blog", "SEO", "Content"],
    usageCount: 2340,
    author: "PromptCraft Team",
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
    author: "PromptCraft Team",
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
    author: "PromptCraft Team",
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
    author: "PromptCraft Team",
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

const categories = ["All", "Writing", "Coding", "Business", "Image", "Marketing"]

export function TemplatesGrid() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const filteredTemplates = mockTemplates.filter((template) => {
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
    // In real implementation, navigate to Prompt Lab with template content
    console.log("Using template:", template.id)
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
            <div
              key={template.id}
              className="group p-5 rounded-xl bg-card border border-border hover:border-border-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 text-xs font-medium rounded-md bg-surface-elevated text-foreground-secondary">
                  {template.category}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-2 rounded-lg hover:bg-surface transition-colors"
                    title={t.dashboard.templates.preview}
                  >
                    <Eye className="w-4 h-4 text-foreground-muted" />
                  </button>
                  <GradientButton size="sm" onClick={() => handleUseTemplate(template)}>
                    Use
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </GradientButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        template={selectedTemplate}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  )
}
