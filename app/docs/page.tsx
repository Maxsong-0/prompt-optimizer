"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/lib/i18n/language-context"
import { motion } from "framer-motion"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion"
import { 
  Book, 
  Sparkles, 
  Zap, 
  Settings, 
  Code2, 
  HelpCircle, 
  ChevronRight,
  ArrowRight,
  Lightbulb,
  Target,
  Layers,
  Copy,
  Check
} from "lucide-react"
import Link from "next/link"
import { GradientButton } from "@/components/ui/gradient-button"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { id: "getting-started", icon: Zap, label: "快速开始", labelEn: "Getting Started" },
  { id: "features", icon: Sparkles, label: "功能介绍", labelEn: "Features" },
  { id: "how-to-use", icon: Book, label: "使用教程", labelEn: "How to Use" },
  { id: "best-practices", icon: Lightbulb, label: "最佳实践", labelEn: "Best Practices" },
  { id: "api", icon: Code2, label: "API 文档", labelEn: "API Reference" },
  { id: "faq", icon: HelpCircle, label: "常见问题", labelEn: "FAQ" },
]

export default function DocsPage() {
  const { locale } = useLanguage()
  const [activeSection, setActiveSection] = useState("getting-started")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const isZh = locale === "zh"

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <FadeIn>
            <div className="text-center mb-16">
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Book className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground-secondary">
                  {isZh ? "文档中心" : "Documentation"}
                </span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {isZh ? "Promto 使用指南" : "Promto Documentation"}
              </h1>
              <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
                {isZh 
                  ? "学习如何使用 Promto 优化你的 AI 提示词，获得更好的结果。" 
                  : "Learn how to use Promto to optimize your AI prompts and get better results."}
              </p>
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <div className="sticky top-24">
                <nav className="space-y-1">
                  {sidebarItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                        activeSection === item.id
                          ? "bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border border-primary/30"
                          : "text-foreground-secondary hover:bg-surface hover:text-foreground"
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <item.icon className={cn(
                        "w-5 h-5",
                        activeSection === item.id ? "text-accent" : "text-foreground-muted"
                      )} />
                      <span className="font-medium">
                        {isZh ? item.label : item.labelEn}
                      </span>
                      {activeSection === item.id && (
                        <ChevronRight className="w-4 h-4 ml-auto text-accent" />
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === "getting-started" && (
                  <GettingStartedSection isZh={isZh} />
                )}
                {activeSection === "features" && (
                  <FeaturesSection isZh={isZh} />
                )}
                {activeSection === "how-to-use" && (
                  <HowToUseSection isZh={isZh} copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                )}
                {activeSection === "best-practices" && (
                  <BestPracticesSection isZh={isZh} />
                )}
                {activeSection === "api" && (
                  <ApiSection isZh={isZh} copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
                )}
                {activeSection === "faq" && (
                  <FaqSection isZh={isZh} />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">{children}</h2>
  )
}

function SubSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xl font-semibold text-foreground mb-4 mt-8">{children}</h3>
  )
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-foreground-secondary leading-relaxed mb-4">{children}</p>
  )
}

function CodeBlock({ code, id, copyToClipboard, copiedCode }: { 
  code: string; 
  id: string; 
  copyToClipboard: (code: string, id: string) => void;
  copiedCode: string | null;
}) {
  return (
    <div className="relative group">
      <pre className="bg-surface border border-border rounded-xl p-4 overflow-x-auto text-sm font-mono text-foreground-secondary">
        <code>{code}</code>
      </pre>
      <motion.button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-3 right-3 p-2 rounded-lg bg-surface-elevated opacity-0 group-hover:opacity-100 transition-opacity"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Copy className="w-4 h-4 text-foreground-muted" />
        )}
      </motion.button>
    </div>
  )
}

function StepCard({ number, title, description, icon: Icon }: {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div 
      className="p-6 rounded-xl bg-card border border-border"
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(79, 70, 229, 0.1)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-accent">STEP {number}</span>
          </div>
          <h4 className="font-semibold text-foreground mb-2">{title}</h4>
          <p className="text-sm text-foreground-secondary">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function GettingStartedSection({ isZh }: { isZh: boolean }) {
  return (
    <div className="space-y-8">
      <SectionTitle>{isZh ? "快速开始" : "Getting Started"}</SectionTitle>
      
      <Paragraph>
        {isZh 
          ? "欢迎使用 Promto！这是一个智能的 AI 提示词优化工具，帮助你写出更好的提示词，获得更优质的 AI 输出结果。"
          : "Welcome to Promto! This is an intelligent AI prompt optimization tool that helps you write better prompts and get higher quality AI outputs."}
      </Paragraph>

      <SubSectionTitle>{isZh ? "开始使用的步骤" : "Steps to Get Started"}</SubSectionTitle>
      
      <StaggerContainer className="grid sm:grid-cols-2 gap-4">
        <StaggerItem>
          <StepCard
            number={1}
            title={isZh ? "创建账户" : "Create an Account"}
            description={isZh 
              ? "注册一个免费账户，开始使用 Promto 的全部功能。" 
              : "Sign up for a free account to start using all of Promto's features."}
            icon={Zap}
          />
        </StaggerItem>
        <StaggerItem>
          <StepCard
            number={2}
            title={isZh ? "输入提示词" : "Enter Your Prompt"}
            description={isZh 
              ? "在提示词实验室中输入你想优化的原始提示词。" 
              : "Enter the original prompt you want to optimize in the Prompt Lab."}
            icon={Target}
          />
        </StaggerItem>
        <StaggerItem>
          <StepCard
            number={3}
            title={isZh ? "选择模型" : "Select a Model"}
            description={isZh 
              ? "选择你想要优化的目标 AI 模型（ChatGPT、Claude 等）。" 
              : "Choose your target AI model (ChatGPT, Claude, etc.)."}
            icon={Layers}
          />
        </StaggerItem>
        <StaggerItem>
          <StepCard
            number={4}
            title={isZh ? "获取优化结果" : "Get Optimized Results"}
            description={isZh 
              ? "点击优化按钮，获取多个增强版本的提示词。" 
              : "Click optimize to get multiple enhanced versions of your prompt."}
            icon={Sparkles}
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
        <div className="flex items-start gap-4">
          <Lightbulb className="w-6 h-6 text-accent shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              {isZh ? "小提示" : "Pro Tip"}
            </h4>
            <p className="text-sm text-foreground-secondary">
              {isZh 
                ? "尝试使用快捷键 Ctrl/Cmd + Enter 快速优化提示词，提高你的工作效率！" 
                : "Try using the keyboard shortcut Ctrl/Cmd + Enter to quickly optimize prompts and boost your productivity!"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <Link href="/register">
          <GradientButton>
            {isZh ? "立即注册" : "Sign Up Now"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </GradientButton>
        </Link>
        <Link href="/dashboard">
          <GradientButton variant="secondary">
            {isZh ? "进入仪表盘" : "Go to Dashboard"}
          </GradientButton>
        </Link>
      </div>
    </div>
  )
}

function FeaturesSection({ isZh }: { isZh: boolean }) {
  const features = [
    {
      icon: Sparkles,
      title: isZh ? "智能优化" : "Smart Optimization",
      description: isZh 
        ? "AI 分析你的提示词，自动改进清晰度、具体性和有效性。" 
        : "AI analyzes your prompts and automatically improves clarity, specificity, and effectiveness."
    },
    {
      icon: Layers,
      title: isZh ? "多模型支持" : "Multi-Model Support",
      description: isZh 
        ? "支持 ChatGPT、Claude、Midjourney、Stable Diffusion 等多种 AI 平台。" 
        : "Support for ChatGPT, Claude, Midjourney, Stable Diffusion, and more AI platforms."
    },
    {
      icon: Target,
      title: isZh ? "版本对比" : "Version Comparison",
      description: isZh 
        ? "并排比较不同版本的提示词，快速找到最佳方案。" 
        : "Compare different versions of prompts side by side to quickly find the best solution."
    },
    {
      icon: Book,
      title: isZh ? "模板库" : "Template Library",
      description: isZh 
        ? "访问数百个预制模板，涵盖写作、编程、设计等多个领域。" 
        : "Access hundreds of pre-built templates covering writing, coding, design, and more."
    },
    {
      icon: Settings,
      title: isZh ? "自定义设置" : "Custom Settings",
      description: isZh 
        ? "根据你的需求自定义优化参数和输出格式。" 
        : "Customize optimization parameters and output formats according to your needs."
    },
    {
      icon: Code2,
      title: isZh ? "API 集成" : "API Integration",
      description: isZh 
        ? "通过 API 将 Promto 集成到你的工作流程中。" 
        : "Integrate Promto into your workflow through our API."
    },
  ]

  return (
    <div className="space-y-8">
      <SectionTitle>{isZh ? "功能介绍" : "Features"}</SectionTitle>
      
      <Paragraph>
        {isZh 
          ? "Promto 提供了一系列强大的功能，帮助你更高效地创建和管理 AI 提示词。"
          : "Promto offers a range of powerful features to help you create and manage AI prompts more efficiently."}
      </Paragraph>

      <StaggerContainer className="grid sm:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <StaggerItem key={index}>
            <motion.div 
              className="p-6 rounded-xl bg-card border border-border h-full"
              whileHover={{ y: -4, borderColor: "rgba(79, 70, 229, 0.5)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-sm text-foreground-secondary">{feature.description}</p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}

function HowToUseSection({ isZh, copyToClipboard, copiedCode }: { 
  isZh: boolean; 
  copyToClipboard: (code: string, id: string) => void;
  copiedCode: string | null;
}) {
  const examplePrompt = isZh
    ? `原始提示词：
写一篇关于 AI 的文章

优化后的提示词：
你是一位拥有 10 年经验的技术博主，专注于人工智能领域。

请写一篇全面的博客文章，主题是人工智能：
- 用简单易懂的语言解释核心概念
- 包含真实世界的例子和应用场景
- 使用清晰的标题和要点进行结构化
- 针对对科技感兴趣的普通读者
- 字数约 1500 字

语气：专业但不失亲和力
格式：以吸引人的开头开始，包含 3-4 个主要部分，以行动号召结尾`
    : `Original prompt:
Write an article about AI

Optimized prompt:
You are an expert tech blogger with 10+ years of experience in the AI field.

Write a comprehensive blog post about artificial intelligence that:
- Explains core concepts in simple terms
- Includes real-world examples and use cases
- Is structured with clear headings and bullet points
- Targets a general audience interested in technology
- Is approximately 1500 words

Tone: Professional yet conversational
Format: Start with a hook, include 3-4 main sections, end with a call-to-action`

  return (
    <div className="space-y-8">
      <SectionTitle>{isZh ? "使用教程" : "How to Use"}</SectionTitle>
      
      <Paragraph>
        {isZh 
          ? "以下是使用 Promto 优化提示词的详细步骤指南。"
          : "Here's a detailed step-by-step guide on how to use Promto to optimize your prompts."}
      </Paragraph>

      <SubSectionTitle>{isZh ? "基本使用流程" : "Basic Usage Flow"}</SubSectionTitle>
      
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">1</div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              {isZh ? "进入提示词实验室" : "Enter the Prompt Lab"}
            </h4>
            <p className="text-foreground-secondary text-sm">
              {isZh 
                ? "登录后，点击侧边栏的「提示词实验室」进入主工作区。"
                : "After logging in, click 'Prompt Lab' in the sidebar to enter the main workspace."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">2</div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              {isZh ? "输入原始提示词" : "Input Your Original Prompt"}
            </h4>
            <p className="text-foreground-secondary text-sm">
              {isZh 
                ? "在左侧编辑器中输入或粘贴你想优化的提示词。不用担心格式或长度。"
                : "Enter or paste the prompt you want to optimize in the left editor. Don't worry about format or length."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">3</div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              {isZh ? "点击优化按钮" : "Click the Optimize Button"}
            </h4>
            <p className="text-foreground-secondary text-sm">
              {isZh 
                ? "点击「优化」按钮或使用快捷键 Ctrl/Cmd + Enter。AI 将分析并生成多个优化版本。"
                : "Click 'Optimize' or use Ctrl/Cmd + Enter. The AI will analyze and generate multiple optimized versions."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">4</div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              {isZh ? "比较并选择" : "Compare and Select"}
            </h4>
            <p className="text-foreground-secondary text-sm">
              {isZh 
                ? "在右侧面板查看优化后的版本，比较差异，选择最适合你需求的版本。"
                : "Review optimized versions in the right panel, compare differences, and select the one that best fits your needs."}
            </p>
          </div>
        </div>
      </div>

      <SubSectionTitle>{isZh ? "示例展示" : "Example"}</SubSectionTitle>
      
      <CodeBlock 
        code={examplePrompt} 
        id="example-prompt" 
        copyToClipboard={copyToClipboard}
        copiedCode={copiedCode}
      />
    </div>
  )
}

function BestPracticesSection({ isZh }: { isZh: boolean }) {
  const practices = [
    {
      title: isZh ? "具体明确" : "Be Specific",
      description: isZh 
        ? "提供具体的上下文、目标和约束条件。模糊的提示词会导致模糊的结果。"
        : "Provide specific context, goals, and constraints. Vague prompts lead to vague results."
    },
    {
      title: isZh ? "定义角色" : "Define the Role",
      description: isZh 
        ? "让 AI 扮演特定角色（如：你是一位专家...），可以获得更专业的输出。"
        : "Having AI play a specific role (e.g., 'You are an expert...') leads to more professional output."
    },
    {
      title: isZh ? "结构化输出" : "Structure the Output",
      description: isZh 
        ? "明确指定你想要的输出格式、长度和风格。"
        : "Clearly specify the format, length, and style of output you want."
    },
    {
      title: isZh ? "提供示例" : "Provide Examples",
      description: isZh 
        ? "如果可能，提供你期望的输出示例，帮助 AI 理解你的需求。"
        : "When possible, provide examples of expected output to help AI understand your needs."
    },
    {
      title: isZh ? "迭代优化" : "Iterate and Refine",
      description: isZh 
        ? "不断尝试不同的表达方式，根据结果持续优化你的提示词。"
        : "Keep trying different phrasings and continuously refine your prompts based on results."
    },
    {
      title: isZh ? "使用分隔符" : "Use Delimiters",
      description: isZh 
        ? "使用引号、破折号或 XML 标签来清晰分隔提示词的不同部分。"
        : "Use quotes, dashes, or XML tags to clearly separate different parts of your prompt."
    },
  ]

  return (
    <div className="space-y-8">
      <SectionTitle>{isZh ? "最佳实践" : "Best Practices"}</SectionTitle>
      
      <Paragraph>
        {isZh 
          ? "掌握这些技巧，让你的提示词更加有效。"
          : "Master these techniques to make your prompts more effective."}
      </Paragraph>

      <div className="space-y-4">
        {practices.map((practice, index) => (
          <motion.div
            key={index}
            className="p-4 rounded-xl bg-card border border-border"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ borderColor: "rgba(79, 70, 229, 0.5)" }}
          >
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{practice.title}</h4>
                <p className="text-sm text-foreground-secondary">{practice.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ApiSection({ isZh, copyToClipboard, copiedCode }: { 
  isZh: boolean;
  copyToClipboard: (code: string, id: string) => void;
  copiedCode: string | null;
}) {
  const apiExample = `// API 请求示例
const response = await fetch('https://api.promto.ai/v1/optimize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prompt: "Your original prompt here",
    model: "gpt-4",
    options: {
      style: "professional",
      length: "medium"
    }
  })
});

const result = await response.json();
console.log(result.optimizedPrompts);`

  return (
    <div className="space-y-8">
      <SectionTitle>{isZh ? "API 文档" : "API Reference"}</SectionTitle>
      
      <Paragraph>
        {isZh 
          ? "通过 API 将 Promto 的优化能力集成到你的应用中。"
          : "Integrate Promto's optimization capabilities into your application through our API."}
      </Paragraph>

      <div className="p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/30 mb-6">
        <p className="text-sm text-foreground-secondary">
          <span className="font-semibold text-warning">
            {isZh ? "注意：" : "Note: "}
          </span>
          {isZh 
            ? "API 功能仅对 Pro 及以上版本的用户开放。" 
            : "API access is only available for Pro plan users and above."}
        </p>
      </div>

      <SubSectionTitle>{isZh ? "请求示例" : "Request Example"}</SubSectionTitle>
      
      <CodeBlock 
        code={apiExample} 
        id="api-example" 
        copyToClipboard={copyToClipboard}
        copiedCode={copiedCode}
      />

      <SubSectionTitle>{isZh ? "响应格式" : "Response Format"}</SubSectionTitle>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-foreground font-semibold">
                {isZh ? "字段" : "Field"}
              </th>
              <th className="text-left py-3 px-4 text-foreground font-semibold">
                {isZh ? "类型" : "Type"}
              </th>
              <th className="text-left py-3 px-4 text-foreground font-semibold">
                {isZh ? "说明" : "Description"}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-3 px-4 font-mono text-accent">optimizedPrompts</td>
              <td className="py-3 px-4 text-foreground-secondary">array</td>
              <td className="py-3 px-4 text-foreground-secondary">
                {isZh ? "优化后的提示词数组" : "Array of optimized prompts"}
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 px-4 font-mono text-accent">usage</td>
              <td className="py-3 px-4 text-foreground-secondary">object</td>
              <td className="py-3 px-4 text-foreground-secondary">
                {isZh ? "API 使用统计" : "API usage statistics"}
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 px-4 font-mono text-accent">requestId</td>
              <td className="py-3 px-4 text-foreground-secondary">string</td>
              <td className="py-3 px-4 text-foreground-secondary">
                {isZh ? "请求唯一标识符" : "Unique request identifier"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FaqSection({ isZh }: { isZh: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  const faqs = [
    {
      question: isZh ? "Promto 是免费的吗？" : "Is Promto free?",
      answer: isZh 
        ? "Promto 提供免费版本，每天可以进行 10 次优化。如需更多功能，可以升级到 Pro 或 Team 版本。"
        : "Promto offers a free version with 10 optimizations per day. For more features, you can upgrade to Pro or Team plans."
    },
    {
      question: isZh ? "支持哪些 AI 模型？" : "Which AI models are supported?",
      answer: isZh 
        ? "Promto 支持 ChatGPT（GPT-3.5/GPT-4）、Claude、Midjourney、Stable Diffusion、DALL-E 等主流 AI 平台。"
        : "Promto supports ChatGPT (GPT-3.5/GPT-4), Claude, Midjourney, Stable Diffusion, DALL-E, and other major AI platforms."
    },
    {
      question: isZh ? "我的提示词数据安全吗？" : "Is my prompt data safe?",
      answer: isZh 
        ? "是的，我们非常重视数据安全。你的提示词数据经过加密存储，我们不会将其用于训练或分享给第三方。"
        : "Yes, we take data security very seriously. Your prompts are encrypted and we never use them for training or share with third parties."
    },
    {
      question: isZh ? "如何取消订阅？" : "How do I cancel my subscription?",
      answer: isZh 
        ? "你可以在「设置」>「账单与订阅」页面随时取消订阅。取消后，你仍可以使用当前计费周期剩余的服务。"
        : "You can cancel your subscription anytime from Settings > Billing. After cancellation, you can still use the service for the remainder of your billing period."
    },
    {
      question: isZh ? "可以和团队一起使用吗？" : "Can I use it with my team?",
      answer: isZh 
        ? "是的！Team 版本支持团队协作，包括共享工作区、团队模板库和管理员控制等功能。"
        : "Yes! The Team plan supports collaboration with shared workspaces, team template libraries, and admin controls."
    },
  ]

  return (
    <div className="space-y-8">
      <SectionTitle>{isZh ? "常见问题" : "Frequently Asked Questions"}</SectionTitle>
      
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            className="rounded-xl bg-card border border-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-foreground">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className={cn(
                  "w-5 h-5 text-foreground-muted transition-transform",
                  openIndex === index && "rotate-90"
                )} />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ 
                height: openIndex === index ? "auto" : 0,
                opacity: openIndex === index ? 1 : 0
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-4 text-foreground-secondary text-sm">
                {faq.answer}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30 text-center">
        <h4 className="font-semibold text-foreground mb-2">
          {isZh ? "还有其他问题？" : "Still have questions?"}
        </h4>
        <p className="text-sm text-foreground-secondary mb-4">
          {isZh 
            ? "欢迎联系我们的支持团队，我们将竭诚为你解答。" 
            : "Feel free to contact our support team, we're happy to help."}
        </p>
        <Link href="mailto:support@promto.ai">
          <GradientButton variant="secondary" size="sm">
            {isZh ? "联系支持" : "Contact Support"}
          </GradientButton>
        </Link>
      </div>
    </div>
  )
}

