"use client"

import { useState, useMemo } from "react"
import { ChevronDown, Check, Sparkles, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useModelConfig, getProviderDisplayName } from "@/lib/contexts/model-config-context"
import Link from "next/link"

interface ModelSelectorProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings, availableModels } = useModelConfig()

  // 使用传入的value或context中的model
  const currentModelId = value ?? settings.model
  
  // 当前选中的模型
  const selectedModel = useMemo(() => {
    return availableModels.find((m) => m.id === currentModelId) || availableModels[0]
  }, [availableModels, currentModelId])

  // 按provider分组
  const modelsByProvider = useMemo(() => {
    return availableModels.reduce((acc, model) => {
      const provider = model.provider
      if (!acc[provider]) {
        acc[provider] = []
      }
      acc[provider].push(model)
      return acc
    }, {} as Record<string, typeof availableModels>)
  }, [availableModels])

  const handleSelectModel = (modelId: string) => {
    if (onChange) {
      onChange(modelId)
    } else {
      // 如果没有传入onChange，使用context
      const model = availableModels.find(m => m.id === modelId)
      if (model) {
        updateSettings({ model: modelId, provider: model.provider as any })
      }
    }
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-border-hover transition-colors min-w-[180px]"
      >
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="flex-1 text-left text-sm text-foreground truncate">
          {selectedModel?.name || 'Select Model'}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-foreground-secondary transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-lg z-[100] overflow-hidden max-h-[400px] overflow-y-auto">
            <div className="p-2">
              {Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider} className="mb-2">
                  <p className="px-3 py-1.5 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    {getProviderDisplayName(provider as any)}
                  </p>
                  {models.slice(0, 5).map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model.id)}
                      disabled={model.badges?.includes('Coming Soon')}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        currentModelId === model.id ? "bg-primary/10" : "hover:bg-surface-hover",
                        model.badges?.includes('Coming Soon') && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{model.name}</span>
                          {model.badges?.map((badge) => (
                            <span
                              key={badge}
                              className={cn(
                                "px-1.5 py-0.5 text-[10px] rounded-full shrink-0",
                                badge === 'Free' && "bg-success/20 text-success",
                                badge === 'Recommended' && "bg-accent/20 text-accent",
                                badge === 'Coming Soon' && "bg-warning/20 text-warning"
                              )}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        {model.contextLength && (
                          <span className="text-xs text-foreground-muted">
                            {(model.contextLength / 1000).toFixed(0)}K context
                          </span>
                        )}
                      </div>
                      {currentModelId === model.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="border-t border-border p-2">
              <Link
                href="/dashboard/models"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent hover:bg-surface-hover transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                高级模型配置
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
