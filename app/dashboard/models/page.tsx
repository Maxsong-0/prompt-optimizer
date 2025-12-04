"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Settings2,
  Cpu,
  Zap,
  RefreshCw,
  Check,
  ExternalLink,
  Sliders,
  Info,
  Key,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Star,
  Loader2,
  ChevronRight,
  Globe,
  Bot,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  Hash,
  Shield,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { useModelConfig, getProviderDisplayName, getProviderColor, type ModelOption } from "@/lib/contexts/model-config-context"
import type { AIProvider } from "@/lib/ai/providers"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// =====================================================
// 类型定义
// =====================================================

interface ProviderConfig {
  id: AIProvider | 'promto'
  name: string
  description: string
  icon: typeof Sparkles
  keyUrl?: string
  keyPrefix?: string
  placeholder?: string
  gradient: string
}

interface ApiKeyInfo {
  provider: string
  is_configured: boolean
  is_active: boolean
  is_valid: boolean
  display_name: string | null
  last_validated_at: string | null
  masked_key: string
}

type SortOption = 'name-asc' | 'name-desc' | 'context-asc' | 'context-desc' | 'newest' | 'oldest'

type PageTab = 'models' | 'api-keys'

// =====================================================
// 配置
// =====================================================

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: '一个Key访问所有模型，推荐',
    icon: Globe,
    keyUrl: 'https://openrouter.ai/keys',
    keyPrefix: 'sk-or-',
    placeholder: 'sk-or-v1-...',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, o1, GPT-4 Turbo',
    icon: Sparkles,
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPrefix: 'sk-',
    placeholder: 'sk-...',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet/Opus/Haiku',
    icon: Cpu,
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPrefix: 'sk-ant-',
    placeholder: 'sk-ant-...',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 2.0, 1.5 Pro/Flash',
    icon: Zap,
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AI',
    placeholder: 'AIza...',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'promto',
    name: 'Promto AI',
    description: '专为Prompt优化设计',
    icon: Bot,
    gradient: 'from-violet-600 to-fuchsia-600',
  },
]

const SORT_OPTIONS: { id: SortOption; labelZh: string; labelEn: string; icon: typeof ArrowUpDown }[] = [
  { id: 'newest', labelZh: '最新优先', labelEn: 'Newest First', icon: Clock },
  { id: 'oldest', labelZh: '最旧优先', labelEn: 'Oldest First', icon: Clock },
  { id: 'name-asc', labelZh: '名称 A-Z', labelEn: 'Name A-Z', icon: ArrowUp },
  { id: 'name-desc', labelZh: '名称 Z-A', labelEn: 'Name Z-A', icon: ArrowDown },
  { id: 'context-desc', labelZh: '上下文长度 ↓', labelEn: 'Context Length ↓', icon: Hash },
  { id: 'context-asc', labelZh: '上下文长度 ↑', labelEn: 'Context Length ↑', icon: Hash },
]

// =====================================================
// 动画变体
// =====================================================

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const sidebarVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
}

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

// =====================================================
// 组件
// =====================================================

export default function ModelsPage() {
  const { language } = useLanguage()
  const {
    settings,
    updateSettings,
    resetToDefault,
    availableModels,
    refreshModels,
    isLoadingModels,
  } = useModelConfig()

  // 状态
  const [activeTab, setActiveTab] = useState<PageTab>('models')
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'promto'>(settings.provider)
  const [apiKeysInfo, setApiKeysInfo] = useState<Record<string, ApiKeyInfo>>({})
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newApiKeys, setNewApiKeys] = useState<Record<string, string>>({})
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [validatingProvider, setValidatingProvider] = useState<string | null>(null)
  const [modelSearch, setModelSearch] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [defaultModel, setDefaultModel] = useState<string | null>(null)
  const [isSavingDefault, setIsSavingDefault] = useState(false)

  // 获取API Keys信息
  const fetchApiKeys = useCallback(async () => {
    setIsLoadingKeys(true)
    try {
      const response = await fetch('/api/settings/api-keys')
      if (response.ok) {
        const result = await response.json()
        const keysMap: Record<string, ApiKeyInfo> = {}
        for (const key of result.data?.api_keys || []) {
          keysMap[key.provider] = key
        }
        setApiKeysInfo(keysMap)
        // 设置默认provider
        if (result.data?.default_provider) {
          setDefaultModel(result.data.default_provider)
        }
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setIsLoadingKeys(false)
    }
  }, [])

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  // 当前provider配置
  const currentProviderConfig = PROVIDERS.find(p => p.id === selectedProvider)
  const currentKeyInfo = apiKeysInfo[selectedProvider]
  const isConfigured = currentKeyInfo?.is_configured || false
  const isValid = currentKeyInfo?.is_valid || false

  // 按provider分组模型
  const modelsByProvider = useMemo(() => {
    return availableModels.reduce((acc, model) => {
      const provider = model.provider
      if (!acc[provider]) acc[provider] = []
      acc[provider].push(model)
      return acc
    }, {} as Record<string, ModelOption[]>)
  }, [availableModels])

  // 排序和过滤模型
  const filteredAndSortedModels = useMemo(() => {
    let models = availableModels
      .filter(m => m.provider === selectedProvider)
      .filter(m => 
        modelSearch === '' || 
        m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
        m.id.toLowerCase().includes(modelSearch.toLowerCase())
      )

    // 排序
    switch (sortOption) {
      case 'name-asc':
        models = [...models].sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        models = [...models].sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'context-asc':
        models = [...models].sort((a, b) => (a.contextLength || 0) - (b.contextLength || 0))
        break
      case 'context-desc':
        models = [...models].sort((a, b) => (b.contextLength || 0) - (a.contextLength || 0))
        break
      case 'newest':
        // Keep original order (newest first from API)
        break
      case 'oldest':
        models = [...models].reverse()
        break
    }

    return models
  }, [availableModels, selectedProvider, modelSearch, sortOption])

  // 保存API Key
  const handleSaveApiKey = async (provider: string) => {
    const apiKey = newApiKeys[provider]
    if (!apiKey?.trim()) {
      toast.error(language === 'zh' ? '请输入API Key' : 'Please enter API Key')
      return
    }

    const providerConfig = PROVIDERS.find(p => p.id === provider)
    
    // 验证前缀
    if (providerConfig?.keyPrefix && !apiKey.startsWith(providerConfig.keyPrefix)) {
      toast.error(
        language === 'zh' 
          ? `API Key格式错误，应以 ${providerConfig.keyPrefix} 开头` 
          : `Invalid API Key format, should start with ${providerConfig.keyPrefix}`
      )
      return
    }

    setValidatingProvider(provider)
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key: apiKey,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(language === 'zh' ? 'API Key保存成功' : 'API Key saved successfully')
        setNewApiKeys(prev => ({ ...prev, [provider]: '' }))
        setShowApiKeys(prev => ({ ...prev, [provider]: false }))
        await fetchApiKeys()
        await refreshModels()
      } else {
        toast.error(result.error || (language === 'zh' ? '保存失败' : 'Save failed'))
      }
    } catch (error) {
      toast.error(language === 'zh' ? '保存失败' : 'Save failed')
    } finally {
      setValidatingProvider(null)
    }
  }

  // 删除API Key
  const handleDeleteApiKey = async (provider: string) => {
    if (!confirm(language === 'zh' ? '确定要删除这个API Key吗？' : 'Are you sure you want to delete this API Key?')) {
      return
    }

    try {
      const response = await fetch(`/api/settings/api-keys/${provider}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success(language === 'zh' ? 'API Key已删除' : 'API Key deleted')
        await fetchApiKeys()
        await refreshModels()
      } else {
        toast.error(result.error || (language === 'zh' ? '删除失败' : 'Delete failed'))
      }
    } catch (error) {
      toast.error(language === 'zh' ? '删除失败' : 'Delete failed')
    }
  }

  // 验证API Key
  const handleValidateApiKey = async (provider: string) => {
    setValidatingProvider(provider)
    try {
      const response = await fetch(`/api/settings/api-keys/${provider}`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.data?.valid) {
        toast.success(language === 'zh' ? 'API Key验证成功' : 'API Key validated')
      } else {
        toast.error(result.data?.message || (language === 'zh' ? 'API Key验证失败' : 'API Key validation failed'))
      }
      await fetchApiKeys()
    } catch (error) {
      toast.error(language === 'zh' ? '验证失败' : 'Validation failed')
    } finally {
      setValidatingProvider(null)
    }
  }

  // 设为默认Provider
  const handleSetDefaultProvider = async (provider: string) => {
    setIsSavingDefault(true)
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_provider: provider }),
      })

      const result = await response.json()

      if (result.success) {
        setDefaultModel(provider)
        toast.success(language === 'zh' ? '默认服务商已更新' : 'Default provider updated')
      } else {
        toast.error(result.error || (language === 'zh' ? '设置失败' : 'Failed to set default'))
      }
    } catch (error) {
      toast.error(language === 'zh' ? '设置失败' : 'Failed to set default')
    } finally {
      setIsSavingDefault(false)
    }
  }

  // 设为默认模型
  const handleSetDefaultModel = async (modelId: string, provider: AIProvider | 'promto') => {
    setIsSavingDefault(true)
    try {
      // 更新本地设置
      updateSettings({ model: modelId, provider })
      
      // 同步到后端（保存用户偏好）
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          default_model: modelId,
          default_provider: provider,
        }),
      })

      if (response.ok) {
        toast.success(language === 'zh' ? '默认模型已设置' : 'Default model set')
      } else {
        // 即使后端失败，本地也已更新
        toast.success(language === 'zh' ? '默认模型已设置（本地）' : 'Default model set (local)')
      }
    } catch (error) {
      // 本地仍然更新成功
      toast.success(language === 'zh' ? '默认模型已设置（本地）' : 'Default model set (local)')
    } finally {
      setIsSavingDefault(false)
    }
  }

  // 保存配置
  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
    setSaved(true)
    toast.success(language === 'zh' ? '配置已保存' : 'Configuration saved')
    setTimeout(() => setSaved(false), 2000)
  }

  // 选择Provider
  const handleSelectProvider = (providerId: AIProvider | 'promto') => {
    setSelectedProvider(providerId)
    updateSettings({ provider: providerId })
    // 选择该provider的第一个模型
    const models = modelsByProvider[providerId]
    if (models && models.length > 0) {
      updateSettings({ model: models[0].id })
    }
    setModelSearch('')
  }

  const isPromtoAI = selectedProvider === 'promto'

  // 渲染模型选择内容
  const renderModelsContent = () => (
    <motion.div
      key="models"
      className="max-w-4xl mx-auto p-6 space-y-6"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {/* Promto AI 提示 */}
      {isPromtoAI && (
        <motion.div
          className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30"
          variants={itemVariants}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-lg">
                {language === 'zh' ? 'Promto AI 即将推出' : 'Promto AI Coming Soon'}
              </p>
              <p className="text-sm text-foreground-secondary mt-1">
                {language === 'zh'
                  ? 'Promto AI 是我们专为 Prompt 优化设计的AI模型。它将具备更强的上下文理解能力和优化建议能力，敬请期待！'
                  : 'Promto AI is our AI model designed specifically for prompt optimization. It will have stronger context understanding and optimization suggestion capabilities. Stay tuned!'}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm">
                  {language === 'zh' ? '开发中' : 'In Development'}
                </span>
                <span className="text-sm text-foreground-muted">
                  {language === 'zh' ? '预计 2025 Q2 上线' : 'Expected Q2 2025'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 模型选择 */}
      <motion.div
        className="p-5 rounded-2xl bg-card border border-border"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">
              {language === 'zh' ? '选择模型' : 'Select Model'}
            </h3>
            <span className="text-sm text-foreground-muted">
              ({filteredAndSortedModels.length} {language === 'zh' ? '可用' : 'available'})
            </span>
          </div>
          
          {/* 排序选择 */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground hover:border-primary transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {SORT_OPTIONS.find(o => o.id === sortOption)?.[language === 'zh' ? 'labelZh' : 'labelEn']}
            </button>
            
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortOption(option.id)
                        setShowSortMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        sortOption === option.id 
                          ? "bg-primary/10 text-primary" 
                          : "text-foreground hover:bg-surface"
                      )}
                    >
                      <option.icon className="w-4 h-4" />
                      {language === 'zh' ? option.labelZh : option.labelEn}
                      {sortOption === option.id && <Check className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            placeholder={language === 'zh' ? '搜索模型...' : 'Search models...'}
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 模型列表 */}
        {filteredAndSortedModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredAndSortedModels.map((model) => {
              const isSelected = settings.model === model.id
              const isDefault = settings.model === model.id && settings.provider === model.provider
              
              return (
                <motion.div
                  key={model.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left group relative",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-surface",
                    model.badges?.includes('Coming Soon') && "opacity-50"
                  )}
                  whileHover={!model.badges?.includes('Coming Soon') ? { x: 4 } : undefined}
                >
                  <button
                    onClick={() => updateSettings({ model: model.id })}
                    disabled={model.badges?.includes('Coming Soon')}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{model.name}</p>
                        <p className="text-xs text-foreground-muted mt-1 font-mono truncate">{model.id}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {model.contextLength && (
                        <span className="text-xs text-foreground-muted bg-surface px-2 py-0.5 rounded">
                          {(model.contextLength / 1000).toFixed(0)}K
                        </span>
                      )}
                      {model.badges?.map((badge) => (
                        <span
                          key={badge}
                          className={cn(
                            "px-2 py-0.5 text-[10px] rounded-full font-medium",
                            badge === 'Free' && "bg-success/20 text-success",
                            badge === 'Recommended' && "bg-accent/20 text-accent",
                            badge === 'Coming Soon' && "bg-warning/20 text-warning"
                          )}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </button>
                  
                  {/* 设为默认按钮 */}
                  {isSelected && !model.badges?.includes('Coming Soon') && (
                    <motion.div 
                      className="mt-3 pt-3 border-t border-border"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <button
                        onClick={() => handleSetDefaultModel(model.id, model.provider)}
                        disabled={isSavingDefault}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors",
                          isDefault 
                            ? "bg-primary/20 text-primary cursor-default"
                            : "bg-surface hover:bg-primary/10 text-foreground-secondary hover:text-primary"
                        )}
                      >
                        {isSavingDefault ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Star className={cn("w-4 h-4", isDefault && "fill-primary")} />
                        )}
                        {isDefault 
                          ? (language === 'zh' ? '当前默认' : 'Current Default')
                          : (language === 'zh' ? '设为默认' : 'Set as Default')
                        }
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground-muted">
              {isPromtoAI
                ? (language === 'zh' ? 'Promto AI 模型即将推出' : 'Promto AI models coming soon')
                : (language === 'zh' ? '请先配置 API Key 以获取模型列表' : 'Please configure API Key first to get model list')
              }
            </p>
          </div>
        )}
      </motion.div>

      {/* 微调参数 */}
      <motion.div
        className="p-5 rounded-2xl bg-card border border-border"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3 mb-6">
          <Sliders className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '微调参数' : 'Fine-tuning Parameters'}
          </h3>
        </div>

        <div className="space-y-6">
          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Temperature</label>
              <span className="text-sm text-foreground-muted font-mono">{settings.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={settings.temperature}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-foreground-muted mt-1">
              <span>{language === 'zh' ? '精确' : 'Precise'}</span>
              <span>{language === 'zh' ? '创意' : 'Creative'}</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Max Tokens</label>
              <span className="text-sm text-foreground-muted font-mono">{settings.maxTokens}</span>
            </div>
            <input
              type="range"
              min="256"
              max="16384"
              step="256"
              value={settings.maxTokens}
              onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
              className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-foreground-muted mt-1">
              <span>256</span>
              <span>16K</span>
            </div>
          </div>

          {/* Top P & Penalties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top P */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Top P</label>
                <span className="text-sm text-foreground-muted font-mono">{settings.topP.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.topP}
                onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Frequency Penalty */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Freq Penalty</label>
                <span className="text-sm text-foreground-muted font-mono">{settings.frequencyPenalty.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={settings.frequencyPenalty}
                onChange={(e) => updateSettings({ frequencyPenalty: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Presence Penalty */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">Pres Penalty</label>
                <span className="text-sm text-foreground-muted font-mono">{settings.presencePenalty.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={settings.presencePenalty}
                onChange={(e) => updateSettings({ presencePenalty: parseFloat(e.target.value) })}
                className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 配置摘要 */}
      <motion.div
        className="p-5 rounded-2xl bg-surface/50 border border-border"
        variants={itemVariants}
      >
        <h3 className="text-sm font-medium text-foreground-secondary mb-4">
          {language === 'zh' ? '当前配置摘要' : 'Current Configuration'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-foreground-muted text-xs">{language === 'zh' ? '服务商' : 'Provider'}</p>
            <p className="font-medium text-foreground">{getProviderDisplayName(settings.provider)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-foreground-muted text-xs">{language === 'zh' ? '模型' : 'Model'}</p>
            <p className="font-medium text-foreground font-mono text-xs truncate">{settings.model}</p>
          </div>
          <div className="space-y-1">
            <p className="text-foreground-muted text-xs">Temperature</p>
            <p className="font-medium text-foreground font-mono">{settings.temperature}</p>
          </div>
          <div className="space-y-1">
            <p className="text-foreground-muted text-xs">Max Tokens</p>
            <p className="font-medium text-foreground font-mono">{settings.maxTokens}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  // 渲染API Keys配置内容
  const renderApiKeysContent = () => (
    <motion.div
      key="api-keys"
      className="max-w-4xl mx-auto p-6 space-y-6"
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
    >
      {/* 说明 */}
      <motion.div
        className="p-5 rounded-2xl bg-primary/5 border border-primary/20"
        variants={itemVariants}
      >
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">
              {language === 'zh' ? 'API密钥安全说明' : 'API Key Security'}
            </p>
            <p className="text-sm text-foreground-secondary mt-1">
              {language === 'zh'
                ? '您的 API 密钥采用 AES-256 加密存储，只有您本人可以使用。建议为每个应用创建独立的 API 密钥。'
                : 'Your API keys are stored with AES-256 encryption and are only accessible by you. We recommend creating separate keys for each application.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* API Keys列表 */}
      {isLoadingKeys ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" />
        </div>
      ) : (
        <div className="space-y-4">
          {PROVIDERS.filter(p => p.id !== 'promto').map((provider) => {
            const keyInfo = apiKeysInfo[provider.id]
            const isConfigured = keyInfo?.is_configured
            const isValid = keyInfo?.is_valid
            const newKey = newApiKeys[provider.id] || ''
            const showKey = showApiKeys[provider.id]
            const isValidating = validatingProvider === provider.id
            const isDefault = defaultModel === provider.id

            return (
              <motion.div
                key={provider.id}
                className="p-5 rounded-2xl bg-card border border-border"
                variants={itemVariants}
              >
                {/* Provider头部 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      `bg-gradient-to-br ${provider.gradient}`
                    )}>
                      <provider.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{provider.name}</p>
                        {isDefault && (
                          <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/20 text-primary font-medium">
                            {language === 'zh' ? '默认' : 'Default'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground-muted">{provider.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* 状态指示 */}
                    <span className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      isConfigured 
                        ? isValid 
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                        : "bg-foreground-muted/20 text-foreground-muted"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        isConfigured ? (isValid ? "bg-success" : "bg-warning") : "bg-foreground-muted/50"
                      )} />
                      {isConfigured 
                        ? isValid 
                          ? (language === 'zh' ? '已配置' : 'Configured')
                          : (language === 'zh' ? '待验证' : 'Pending')
                        : (language === 'zh' ? '未配置' : 'Not Set')
                      }
                    </span>
                    
                    {/* 获取Key链接 */}
                    {provider.keyUrl && (
                      <a
                        href={provider.keyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent hover:underline flex items-center gap-1"
                      >
                        {language === 'zh' ? '获取' : 'Get'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 已配置的Key */}
                {isConfigured ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                      <div className={cn(
                        "w-3 h-3 rounded-full shrink-0",
                        isValid ? "bg-success" : "bg-warning"
                      )} />
                      <code className="flex-1 text-sm text-foreground-secondary font-mono">
                        {keyInfo?.masked_key || '•••••••••••••••'}
                      </code>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <GradientButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleValidateApiKey(provider.id)}
                        loading={isValidating}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {language === 'zh' ? '验证' : 'Validate'}
                      </GradientButton>
                      
                      {!isDefault && (
                        <GradientButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefaultProvider(provider.id)}
                          disabled={isSavingDefault}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {language === 'zh' ? '设为默认' : 'Set Default'}
                        </GradientButton>
                      )}
                      
                      <GradientButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteApiKey(provider.id)}
                        className="text-error hover:bg-error/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {language === 'zh' ? '删除' : 'Delete'}
                      </GradientButton>
                    </div>
                  </div>
                ) : (
                  /* 输入新Key */
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showKey ? "text" : "password"}
                        value={newKey}
                        onChange={(e) => setNewApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        placeholder={provider.placeholder || 'Enter your API Key...'}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-sm font-mono text-foreground placeholder-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                      >
                        {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <GradientButton
                      onClick={() => handleSaveApiKey(provider.id)}
                      loading={isValidating}
                      disabled={!newKey.trim()}
                      className="w-full"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      {language === 'zh' ? '保存并验证' : 'Save & Validate'}
                    </GradientButton>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )

  return (
    <motion.div
      className="flex h-screen overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* 左侧Provider列表 */}
      <motion.aside
        className="w-72 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col"
        variants={sidebarVariants}
        transition={{ duration: 0.3 }}
      >
        {/* 侧边栏头部 */}
        <div className="h-14 border-b border-border flex items-center px-4">
          <Settings2 className="w-5 h-5 text-accent mr-2" />
          <h2 className="font-semibold text-foreground">
            {language === 'zh' ? 'AI 服务商' : 'AI Providers'}
          </h2>
        </div>

        {/* Tab切换 */}
        <div className="p-3 border-b border-border">
          <div className="flex rounded-lg bg-surface p-1">
            <button
              onClick={() => setActiveTab('models')}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'models'
                  ? "bg-primary text-white"
                  : "text-foreground-secondary hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              {language === 'zh' ? '模型' : 'Models'}
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all",
                activeTab === 'api-keys'
                  ? "bg-primary text-white"
                  : "text-foreground-secondary hover:text-foreground"
              )}
            >
              <Key className="w-4 h-4 inline mr-2" />
              {language === 'zh' ? '密钥' : 'Keys'}
            </button>
          </div>
        </div>

        {/* Provider列表 - 仅在 Models tab 显示 */}
        {activeTab === 'models' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {PROVIDERS.map((provider) => {
              const keyInfo = apiKeysInfo[provider.id]
              const isSelected = selectedProvider === provider.id
              const hasKey = keyInfo?.is_configured
              const modelCount = modelsByProvider[provider.id]?.length || 0

              return (
                <motion.button
                  key={provider.id}
                  onClick={() => handleSelectProvider(provider.id)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all relative group",
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-surface border border-transparent hover:border-border"
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    {/* Provider图标 */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      `bg-gradient-to-br ${provider.gradient}`
                    )}>
                      <provider.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Provider信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{provider.name}</p>
                        {provider.id === 'promto' && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-accent/20 text-accent">
                            {language === 'zh' ? '即将推出' : 'Soon'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground-muted line-clamp-1 mt-0.5">
                        {provider.description}
                      </p>
                      
                      {/* 状态指示 */}
                      <div className="flex items-center gap-2 mt-2">
                        {provider.id !== 'promto' && (
                          <>
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              hasKey && keyInfo?.is_valid ? "bg-success" : hasKey ? "bg-warning" : "bg-foreground-muted/30"
                            )} />
                            <span className="text-[10px] text-foreground-muted">
                              {hasKey 
                                ? (keyInfo?.is_valid 
                                    ? (language === 'zh' ? '已配置' : 'Configured') 
                                    : (language === 'zh' ? '待验证' : 'Pending'))
                                : (language === 'zh' ? '未配置' : 'Not Set')
                              }
                            </span>
                          </>
                        )}
                        {modelCount > 0 && (
                          <span className="text-[10px] text-foreground-muted ml-auto">
                            {modelCount} {language === 'zh' ? '模型' : 'models'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 选中指示 */}
                    {isSelected && (
                      <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* API Keys tab - 显示简要信息 */}
        {activeTab === 'api-keys' && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {PROVIDERS.filter(p => p.id !== 'promto').map((provider) => {
                const keyInfo = apiKeysInfo[provider.id]
                const isConfigured = keyInfo?.is_configured
                const isValid = keyInfo?.is_valid

                return (
                  <div
                    key={provider.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      `bg-gradient-to-br ${provider.gradient}`
                    )}>
                      <provider.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{provider.name}</p>
                    </div>
                    <span className={cn(
                      "w-3 h-3 rounded-full shrink-0",
                      isConfigured 
                        ? isValid ? "bg-success" : "bg-warning"
                        : "bg-foreground-muted/30"
                    )} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 刷新模型按钮 */}
        <div className="p-3 border-t border-border">
          <button
            onClick={refreshModels}
            disabled={isLoadingModels}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm text-foreground-secondary hover:text-foreground hover:bg-surface transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isLoadingModels && "animate-spin")} />
            {language === 'zh' ? '刷新模型列表' : 'Refresh Models'}
          </button>
        </div>
      </motion.aside>

      {/* 右侧配置面板 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 头部 */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {activeTab === 'models' ? (
              <>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  currentProviderConfig && `bg-gradient-to-br ${currentProviderConfig.gradient}`
                )}>
                  {currentProviderConfig && <currentProviderConfig.icon className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {currentProviderConfig?.name}
                  </h1>
                  <p className="text-xs text-foreground-muted">
                    {currentProviderConfig?.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                  <Key className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {language === 'zh' ? 'API 密钥管理' : 'API Key Management'}
                  </h1>
                  <p className="text-xs text-foreground-muted">
                    {language === 'zh' ? '配置您的 AI 服务商密钥' : 'Configure your AI provider keys'}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <GradientButton variant="ghost" size="sm" onClick={resetToDefault}>
              {language === 'zh' ? '重置默认' : 'Reset'}
            </GradientButton>
            <GradientButton size="sm" onClick={handleSave} loading={isSaving}>
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '已保存' : 'Saved'}
                </>
              ) : (
                language === 'zh' ? '保存配置' : 'Save'
              )}
            </GradientButton>
          </div>
        </header>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'models' ? renderModelsContent() : renderApiKeysContent()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
