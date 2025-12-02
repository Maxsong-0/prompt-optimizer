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

const mockResults = [
  {
    id: "v1",
    title: "Enhanced Version",
    content: `You are an expert content strategist with 10+ years of experience in digital marketing and SEO optimization.

Your task is to write a comprehensive, engaging blog post that:
- Captures the reader's attention from the first sentence
- Provides actionable insights and real-world examples
- Is optimized for search engines without sacrificing readability
- Follows a clear structure with compelling headings

Topic: [Your topic here]
Target Audience: [Define your audience]
Desired Length: 1500-2000 words
Tone: Professional yet conversational

Format your response with:
1. An attention-grabbing headline
2. A hook introduction (2-3 sentences)
3. 3-4 main sections with subheadings
4. Bullet points for key takeaways
5. A strong call-to-action conclusion`,
    tags: ["More Detailed", "SEO Focused"],
  },
  {
    id: "v2",
    title: "Concise Version",
    content: `Act as a professional blogger.

Write a blog post about [topic] that:
- Uses simple, clear language
- Includes 3 main points with examples
- Has an engaging intro and conclusion
- Is approximately 800 words

Target: General audience
Style: Friendly and informative`,
    tags: ["Shorter", "Beginner Friendly"],
  },
]

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
  const [prompt, setPrompt] = useState("")
  const [promptTitle, setPromptTitle] = useState("Untitled Prompt")
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [results, setResults] = useState(mockResults)
  const [showResults, setShowResults] = useState(false)

  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  const handleOptimize = useCallback(async () => {
    if (!prompt.trim()) return
    setIsOptimizing(true)
    setShowResults(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsOptimizing(false)
  }, [prompt])

  const handleInsertSnippet = (snippet: string) => {
    setPrompt((prev) => prev + (prev ? "\n\n" : "") + snippet)
  }

  const handleSaveTemplate = (data: { name: string; description: string; category: string }) => {
    console.log("Saving template:", data, "Content:", prompt)
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
        onModelChange={setSelectedModel}
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
