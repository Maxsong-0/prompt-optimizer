'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Check, Sparkles, Loader2, Zap, Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

// =====================================================
// 类型定义
// =====================================================

interface AIModel {
  id: string
  name: string
  provider: string
  description?: string
  context_length?: number
  capabilities?: string[]
  is_free?: boolean
  is_recommended?: boolean
}

interface ModelListResponse {
  provider: string
  models: AIModel[]
  error?: string
}

interface DynamicModelSelectorProps {
  value?: string
  onChange?: (modelId: string, provider: string) => void
  provider?: string // 筛选特定provider
  className?: string
  disabled?: boolean
  placeholder?: string
}

// Provider 显示名称映射
const PROVIDER_NAMES: Record<string, string> = {
  openrouter: 'OpenRouter',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
}

// Provider 排序优先级
const PROVIDER_ORDER = ['openrouter', 'openai', 'anthropic', 'gemini']

// =====================================================
// 动态模型选择器组件
// =====================================================

export function DynamicModelSelector({
  value,
  onChange,
  provider: filterProvider,
  className,
  disabled = false,
  placeholder = '选择模型',
}: DynamicModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modelData, setModelData] = useState<ModelListResponse[]>([])

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = filterProvider
          ? `/api/models?provider=${filterProvider}`
          : '/api/models'
        const response = await fetch(url)
        if (response.ok) {
          const result = await response.json()
          setModelData(result.data?.providers || [])
        } else {
          setError('获取模型列表失败')
        }
      } catch (err) {
        setError('网络错误')
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [filterProvider])

  // 按 provider 分组的模型列表
  const groupedModels = useMemo(() => {
    const groups: Record<string, AIModel[]> = {}
    
    // 按优先级排序 provider
    const sortedData = [...modelData].sort((a, b) => {
      const aIndex = PROVIDER_ORDER.indexOf(a.provider)
      const bIndex = PROVIDER_ORDER.indexOf(b.provider)
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    })

    sortedData.forEach((providerData) => {
      if (providerData.models.length > 0) {
        groups[providerData.provider] = providerData.models
      }
    })

    return groups
  }, [modelData])

  // 查找当前选中的模型
  const selectedModel = useMemo(() => {
    if (!value) return null
    for (const models of Object.values(groupedModels)) {
      const found = models.find((m) => m.id === value)
      if (found) return found
    }
    return null
  }, [value, groupedModels])

  // 所有模型的扁平列表
  const allModels = useMemo(() => {
    return Object.values(groupedModels).flat()
  }, [groupedModels])

  // 处理模型选择
  const handleSelect = (model: AIModel) => {
    onChange?.(model.id, model.provider)
    setIsOpen(false)
  }

  // 渲染模型标签
  const renderBadges = (model: AIModel) => {
    const badges = []
    
    if (model.is_recommended) {
      badges.push(
        <span key="recommended" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full bg-violet-500/20 text-violet-300">
          <Star className="w-2.5 h-2.5" />
          推荐
        </span>
      )
    }
    
    if (model.is_free) {
      badges.push(
        <span key="free" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300">
          <Zap className="w-2.5 h-2.5" />
          免费
        </span>
      )
    }

    if (model.capabilities?.includes('reasoning')) {
      badges.push(
        <span key="reasoning" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-300">
          <Crown className="w-2.5 h-2.5" />
          推理
        </span>
      )
    }

    return badges
  }

  return (
    <div className={cn('relative', className)}>
      {/* 触发按钮 */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors min-w-[220px] w-full',
          'bg-slate-900/50 border-slate-700',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-slate-600',
          isOpen && 'border-violet-500 ring-1 ring-violet-500'
        )}
      >
        <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <span className="flex-1 text-left text-sm text-white truncate">
          {loading ? (
            '加载中...'
          ) : selectedModel ? (
            selectedModel.name
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 max-h-[400px] overflow-auto rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50">
            {error ? (
              <div className="p-4 text-center text-sm text-red-400">{error}</div>
            ) : allModels.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                暂无可用模型
                <br />
                <span className="text-xs">请先配置 API Key</span>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedModels).map(([provider, models]) => (
                  <div key={provider} className="mb-2 last:mb-0">
                    {/* Provider 标题 */}
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {PROVIDER_NAMES[provider] || provider}
                    </div>
                    
                    {/* 模型列表 */}
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleSelect(model)}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                          value === model.id
                            ? 'bg-violet-500/20'
                            : 'hover:bg-slate-800'
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white truncate">
                              {model.name}
                            </span>
                            {renderBadges(model)}
                          </div>
                          {model.description && (
                            <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                              {model.description}
                            </p>
                          )}
                          {model.context_length && (
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              上下文: {(model.context_length / 1000).toFixed(0)}K tokens
                            </p>
                          )}
                        </div>
                        {value === model.id && (
                          <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

