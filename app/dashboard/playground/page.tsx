"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, RotateCcw, Zap, Clock, Coins, ChevronDown, History, Sliders } from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const models = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "gemini-ultra", name: "Gemini Ultra", provider: "Google" },
]

const presets = [
  { id: "creative", name: "Creative", temperature: 1.2, topP: 0.95, maxTokens: 2048 },
  { id: "balanced", name: "Balanced", temperature: 0.7, topP: 0.9, maxTokens: 1024 },
  { id: "precise", name: "Precise", temperature: 0.3, topP: 0.8, maxTokens: 512 },
]

interface RunHistoryItem {
  id: string
  prompt: string
  modelA: string
  modelB: string
  timestamp: Date
}

export default function PlaygroundPage() {
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [modelA, setModelA] = useState("gpt-4")
  const [modelB, setModelB] = useState("claude-3-sonnet")
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [topP, setTopP] = useState(0.9)
  const [frequencyPenalty, setFrequencyPenalty] = useState(0)
  const [presencePenalty, setPresencePenalty] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<{ a: string | null; b: string | null }>({ a: null, b: null })
  const [showHistory, setShowHistory] = useState(false)
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>([])
  const [activePreset, setActivePreset] = useState<string | null>("balanced")

  const handleRun = async () => {
    if (!prompt.trim()) return
    setIsRunning(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setResults({
      a: `This is a simulated response from ${models.find((m) => m.id === modelA)?.name}.\n\nBased on your prompt: "${prompt.slice(0, 50)}..."\n\nTemperature: ${temperature}\nMax Tokens: ${maxTokens}\n\nIn a real implementation, this would be the actual response from the AI model.`,
      b: `This is a simulated response from ${models.find((m) => m.id === modelB)?.name}.\n\nBased on your prompt: "${prompt.slice(0, 50)}..."\n\nTemperature: ${temperature}\nMax Tokens: ${maxTokens}\n\nDifferent models have different strengths. Compare them to find what works best for your use case.`,
    })
    setRunHistory((prev) => [
      { id: Date.now().toString(), prompt: prompt.slice(0, 50), modelA, modelB, timestamp: new Date() },
      ...prev.slice(0, 9),
    ])
    setIsRunning(false)
  }

  const handleReset = () => {
    setPrompt("")
    setSystemPrompt("")
    setResults({ a: null, b: null })
    setTemperature(0.7)
    setMaxTokens(1024)
    setTopP(0.9)
    setFrequencyPenalty(0)
    setPresencePenalty(0)
    setActivePreset("balanced")
  }

  const applyPreset = (preset: (typeof presets)[0]) => {
    setTemperature(preset.temperature)
    setMaxTokens(preset.maxTokens)
    setTopP(preset.topP)
    setActivePreset(preset.id)
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
      {/* Header */}
      <motion.header
        className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t.dashboard.playground.title}</h1>
          <p className="text-xs text-foreground-muted">{t.dashboard.playground.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <GradientButton
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className={cn(showHistory && "bg-surface")}
          >
            <History className="w-4 h-4 mr-2" />
            {t.dashboard.playground.history}
          </GradientButton>
          <GradientButton variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t.dashboard.playground.reset}
          </GradientButton>
          <GradientButton size="sm" onClick={handleRun} loading={isRunning} disabled={!prompt.trim()}>
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? t.dashboard.playground.running : t.dashboard.playground.run}
          </GradientButton>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Prompt Input & Parameters */}
        <motion.div
          className="w-[380px] border-r border-border flex flex-col shrink-0 overflow-y-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* System Prompt */}
          <div className="p-4 border-b border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.dashboard.playground.systemPrompt}
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={t.dashboard.playground.systemPromptPlaceholder}
              className="w-full h-20 p-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
          </div>

          {/* User Prompt */}
          <div className="p-4 border-b border-border">
            <label className="block text-sm font-medium text-foreground mb-2">{t.dashboard.playground.prompt}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.dashboard.playground.promptPlaceholder}
              className="w-full h-40 p-3 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
            />
          </div>

          {/* Presets */}
          <div className="p-4 border-b border-border">
            <label className="block text-sm font-medium text-foreground mb-3">{t.dashboard.playground.presets}</label>
            <div className="flex gap-2">
              {presets.map((preset) => (
                <motion.button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    activePreset === preset.id
                      ? "bg-gradient-to-r from-primary to-accent text-white"
                      : "bg-surface border border-border text-foreground-secondary hover:bg-surface-hover",
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t.dashboard.playground[preset.id as keyof typeof t.dashboard.playground] || preset.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="p-4 space-y-5 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-foreground-muted" />
              <h3 className="text-sm font-medium text-foreground">{t.dashboard.playground.parameters}</h3>
            </div>

            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-foreground-secondary">{t.dashboard.playground.temperature}</label>
                <span className="text-sm text-foreground font-mono bg-surface px-2 py-0.5 rounded">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => {
                  setTemperature(Number.parseFloat(e.target.value))
                  setActivePreset(null)
                }}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground-muted mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-foreground-secondary">{t.dashboard.playground.maxTokens}</label>
                <span className="text-sm text-foreground font-mono bg-surface px-2 py-0.5 rounded">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => {
                  setMaxTokens(Number.parseInt(e.target.value))
                  setActivePreset(null)
                }}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Top P */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-foreground-secondary">{t.dashboard.playground.topP}</label>
                <span className="text-sm text-foreground font-mono bg-surface px-2 py-0.5 rounded">{topP}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={topP}
                onChange={(e) => {
                  setTopP(Number.parseFloat(e.target.value))
                  setActivePreset(null)
                }}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Frequency Penalty */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-foreground-secondary">{t.dashboard.playground.frequencyPenalty}</label>
                <span className="text-sm text-foreground font-mono bg-surface px-2 py-0.5 rounded">
                  {frequencyPenalty}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={frequencyPenalty}
                onChange={(e) => setFrequencyPenalty(Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Presence Penalty */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-foreground-secondary">{t.dashboard.playground.presencePenalty}</label>
                <span className="text-sm text-foreground font-mono bg-surface px-2 py-0.5 rounded">
                  {presencePenalty}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={presencePenalty}
                onChange={(e) => setPresencePenalty(Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Model Comparison */}
        <div className="flex-1 flex overflow-hidden">
          {/* Model A */}
          <motion.div
            className="flex-1 flex flex-col border-r border-border min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="p-4 border-b border-border shrink-0">
              <label className="block text-xs font-medium text-foreground-muted mb-2">
                {t.dashboard.playground.modelA}
              </label>
              <ModelSelector value={modelA} onChange={setModelA} models={models} />
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isRunning ? (
                  <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ResultSkeleton />
                  </motion.div>
                ) : results.a ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultCard result={results.a} model={models.find((m) => m.id === modelA)!} t={t} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="h-full flex items-center justify-center text-foreground-muted text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {t.dashboard.playground.noResults}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Model B */}
          <motion.div
            className="flex-1 flex flex-col min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="p-4 border-b border-border shrink-0">
              <label className="block text-xs font-medium text-foreground-muted mb-2">
                {t.dashboard.playground.modelB}
              </label>
              <ModelSelector value={modelB} onChange={setModelB} models={models} />
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isRunning ? (
                  <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ResultSkeleton />
                  </motion.div>
                ) : results.b ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultCard result={results.b} model={models.find((m) => m.id === modelB)!} t={t} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="h-full flex items-center justify-center text-foreground-muted text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {t.dashboard.playground.noResults}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                className="w-72 border-l border-border flex flex-col shrink-0"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 288 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{t.dashboard.playground.history}</h3>
                  {runHistory.length > 0 && (
                    <button
                      onClick={() => setRunHistory([])}
                      className="text-xs text-foreground-muted hover:text-error transition-colors"
                    >
                      {t.dashboard.playground.clearHistory}
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {runHistory.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-foreground-muted text-sm text-center p-4">
                      Run comparisons to see history
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {runHistory.map((item, index) => (
                        <motion.button
                          key={item.id}
                          onClick={() => {
                            setPrompt(item.prompt)
                            setModelA(item.modelA)
                            setModelB(item.modelB)
                          }}
                          className="w-full p-3 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors text-left"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ x: -4 }}
                        >
                          <p className="text-sm text-foreground truncate">{item.prompt}...</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-foreground-muted">
                            <span>{models.find((m) => m.id === item.modelA)?.name}</span>
                            <span>vs</span>
                            <span>{models.find((m) => m.id === item.modelB)?.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function ModelSelector({
  value,
  onChange,
  models,
}: { value: string; onChange: (v: string) => void; models: typeof models }) {
  const [open, setOpen] = useState(false)
  const selected = models.find((m) => m.id === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border text-foreground hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-medium">{selected?.name}</span>
          <span className="text-xs text-foreground-muted">{selected?.provider}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-foreground-muted transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute top-full left-0 right-0 mt-1 p-1 rounded-lg bg-surface border border-border shadow-lg z-20 max-h-64 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange(model.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors",
                    value === model.id
                      ? "bg-primary/20 text-foreground"
                      : "text-foreground-secondary hover:bg-surface-hover",
                  )}
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-foreground-muted">{model.provider}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function ResultSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="space-y-2">
          <div className="h-4 bg-surface rounded w-full" />
          <div className="h-4 bg-surface rounded w-5/6" />
          <div className="h-4 bg-surface rounded w-4/6" />
          <div className="h-4 bg-surface rounded w-full" />
          <div className="h-4 bg-surface rounded w-3/6" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-surface rounded w-16" />
        <div className="h-4 bg-surface rounded w-20" />
        <div className="h-4 bg-surface rounded w-14" />
      </div>
    </div>
  )
}

function ResultCard({ result, model, t }: { result: string; model: (typeof models)[0]; t: any }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-medium text-foreground">{model.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-foreground-muted">{model.provider}</span>
        </div>
        <p className="text-sm text-foreground-secondary whitespace-pre-wrap leading-relaxed">{result}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-foreground-muted">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>1.2s</span>
        </div>
        <div className="flex items-center gap-1">
          <Coins className="w-3 h-3" />
          <span>~0.002 USD</span>
        </div>
      </div>
    </div>
  )
}
