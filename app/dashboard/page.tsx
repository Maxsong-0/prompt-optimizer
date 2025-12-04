"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { AppHeader } from "@/components/layout/app-header"
import { PromptEditor } from "@/components/dashboard/prompt-editor"
import { OptimizationResults } from "@/components/dashboard/optimization-results"
import { TipsPanel } from "@/components/dashboard/tips-panel"
import { VersionHistoryPanel } from "@/components/dashboard/version-history-panel"
import { SaveTemplateModal } from "@/components/dashboard/save-template-modal"
import { ExportModal } from "@/components/dashboard/export-modal"
import { KeyboardShortcutsModal } from "@/components/dashboard/keyboard-shortcuts-modal"
import { toast } from "sonner"
import { useModelConfig } from "@/lib/contexts/model-config-context"

interface OptimizationResult {
  id: string
  title: string
  content: string
  tags: string[]
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [promptTitle, setPromptTitle] = useState("Untitled Prompt")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [results, setResults] = useState<OptimizationResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [optimizeError, setOptimizeError] = useState<string | null>(null)

  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  
  // 使用 ModelConfigContext 管理模型选择
  const { settings, updateSettings, availableModels } = useModelConfig()
  const selectedModel = settings.model
  
  const handleModelChange = useCallback((modelId: string) => {
    const model = availableModels.find(m => m.id === modelId)
    if (model) {
      updateSettings({ 
        model: modelId, 
        provider: model.provider as any 
      })
    }
  }, [availableModels, updateSettings])

  useEffect(() => {
    setMounted(true)
    // 检查是否有需要重新优化的内容
    const reoptimizeData = sessionStorage.getItem('promto-reoptimize')
    if (reoptimizeData) {
      try {
        const { content, title } = JSON.parse(reoptimizeData)
        if (content) {
          setPrompt(content)
        }
        if (title) {
          setPromptTitle(title)
        }
        sessionStorage.removeItem('promto-reoptimize')
      } catch (e) {
        console.error('Failed to parse reoptimize data:', e)
      }
    }
  }, [])

  const handleOptimize = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to optimize")
      return
    }
    
    setIsOptimizing(true)
    setShowResults(true)
    setOptimizeError(null)
    
    try {
      const response = await fetch('/api/optimize/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: prompt,
          save_result: true,
          title: promptTitle,
          provider: settings.provider, // 传递用户选择的 provider
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Optimization failed')
      }
      
      if (data.success && data.data) {
        // Create result objects from API response
        const optimizedResults: OptimizationResult[] = [
          {
            id: data.data.id || 'v1',
            title: "Optimized Version",
            content: data.data.optimized_content || data.data.content,
            tags: ["AI Optimized"],
          },
        ]
        
        // If we have the original, add a comparison version
        if (data.data.original_content) {
          optimizedResults.push({
            id: 'original',
            title: "Original",
            content: data.data.original_content,
            tags: ["Original"],
          })
        }
        
        setResults(optimizedResults)
        toast.success("Prompt optimized successfully!")
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to optimize prompt'
      setOptimizeError(errorMessage)
      
      // 根据错误类型显示不同的提示
      if (errorMessage.includes('API Key') || errorMessage.includes('未配置')) {
        toast.error(errorMessage, {
          description: 'Go to Settings → Models to configure your API key',
          action: {
            label: 'Configure',
            onClick: () => window.location.href = '/dashboard/models',
          },
          duration: 8000,
        })
      } else {
        toast.error(errorMessage)
      }
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
    }
  }, [prompt, promptTitle, settings.provider])

  const handleInsertSnippet = (snippet: string) => {
    setPrompt((prev) => prev + (prev ? "\n\n" : "") + snippet)
  }

  const handleSaveTemplate = async (data: { name: string; description: string; category: string }) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.name,
          description: data.description,
          category: data.category,
          content: prompt,
          tags: [],
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save template')
      }
      
      toast.success("Template saved successfully!")
      setShowSaveTemplateModal(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save template'
      toast.error(errorMessage)
      console.error('Save template error:', error)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleOptimize()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && !e.shiftKey) {
        e.preventDefault()
        console.log("Saving prompt...")
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault()
        setShowSaveTemplateModal(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault()
        setShowExportModal(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        setShowShortcutsModal(true)
      }
      if (e.key === "Escape") {
        setShowSaveTemplateModal(false)
        setShowExportModal(false)
        setShowShortcutsModal(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleOptimize])

  // 在客户端挂载前，直接渲染内容以避免黑屏
  const content = (
    <>
      <AppHeader
        projectName={promptTitle}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onOptimize={handleOptimize}
        isOptimizing={isOptimizing}
        onSaveAsTemplate={() => setShowSaveTemplateModal(true)}
        onExport={() => setShowExportModal(true)}
        onShowShortcuts={() => setShowShortcutsModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-full lg:w-[400px] xl:w-[450px] border-r border-border flex flex-col">
          <PromptEditor value={prompt} onChange={setPrompt} title={promptTitle} onTitleChange={setPromptTitle} />
          <VersionHistoryPanel
            onRestore={(version) => console.log("Restore version:", version)}
            onPreview={(version) => console.log("Preview version:", version)}
          />
        </div>

        <div className="hidden lg:flex flex-1 flex-col">
          <OptimizationResults results={showResults ? results : []} isLoading={isOptimizing} originalPrompt={prompt} />
        </div>

        <div className="hidden xl:flex w-[280px] border-l border-border">
          <TipsPanel onInsertSnippet={handleInsertSnippet} />
        </div>
      </div>

      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveTemplate}
        promptContent={prompt}
      />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        promptTitle={promptTitle}
        promptContent={prompt}
        optimizedContent={results[0]?.content}
      />
      <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </>
  )

  // 未挂载时直接渲染，避免黑屏
  if (!mounted) {
    return (
      <div className="flex flex-col h-screen">
        {content}
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <AppHeader
        projectName={promptTitle}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onOptimize={handleOptimize}
        isOptimizing={isOptimizing}
        onSaveAsTemplate={() => setShowSaveTemplateModal(true)}
        onExport={() => setShowExportModal(true)}
        onShowShortcuts={() => setShowShortcutsModal(true)}
      />

      <motion.div
        className="flex-1 flex overflow-hidden"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="w-full lg:w-[400px] xl:w-[450px] border-r border-border flex flex-col"
          variants={itemVariants}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <PromptEditor value={prompt} onChange={setPrompt} title={promptTitle} onTitleChange={setPromptTitle} />
          <VersionHistoryPanel
            onRestore={(version) => console.log("Restore version:", version)}
            onPreview={(version) => console.log("Preview version:", version)}
          />
        </motion.div>

        <motion.div
          className="hidden lg:flex flex-1 flex-col"
          variants={itemVariants}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <OptimizationResults results={showResults ? results : []} isLoading={isOptimizing} originalPrompt={prompt} />
        </motion.div>

        <motion.div
          className="hidden xl:flex w-[280px] border-l border-border"
          variants={itemVariants}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        >
          <TipsPanel onInsertSnippet={handleInsertSnippet} />
        </motion.div>
      </motion.div>

      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveTemplate}
        promptContent={prompt}
      />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        promptTitle={promptTitle}
        promptContent={prompt}
        optimizedContent={results[0]?.content}
      />
      <KeyboardShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </motion.div>
  )
}
