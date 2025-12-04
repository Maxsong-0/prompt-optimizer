"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { AIProvider } from '@/lib/ai/providers'

// =====================================================
// 类型定义
// =====================================================

export interface ModelSettings {
  provider: AIProvider | 'promto'
  model: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

export interface ModelConfigContextType {
  // 当前配置
  settings: ModelSettings
  // 更新配置
  updateSettings: (settings: Partial<ModelSettings>) => void
  // 重置为默认
  resetToDefault: () => void
  // 是否已加载
  isLoaded: boolean
  // 可用的模型列表
  availableModels: ModelOption[]
  // 刷新模型列表
  refreshModels: () => Promise<void>
  // 是否正在加载模型列表
  isLoadingModels: boolean
}

export interface ModelOption {
  id: string
  name: string
  provider: AIProvider | 'promto'
  contextLength?: number
  badges?: string[]
}

// =====================================================
// 默认配置
// =====================================================

const DEFAULT_SETTINGS: ModelSettings = {
  provider: 'openrouter',
  model: 'google/gemini-2.0-flash-exp:free',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

// Promto AI 占位符模型
const PROMTO_AI_MODELS: ModelOption[] = [
  {
    id: 'promto-optimizer-v1',
    name: 'Promto Optimizer v1',
    provider: 'promto',
    contextLength: 8192,
    badges: ['Coming Soon'],
  },
  {
    id: 'promto-writer-v1',
    name: 'Promto Writer v1',
    provider: 'promto',
    contextLength: 16384,
    badges: ['Coming Soon'],
  },
]

// 内置模型列表（当API不可用时使用）
const BUILTIN_MODELS: ModelOption[] = [
  // OpenRouter
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', provider: 'openrouter', contextLength: 1000000, badges: ['Free', 'Recommended'] },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', contextLength: 200000 },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter', contextLength: 128000 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter', contextLength: 128000 },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'openrouter', contextLength: 131072 },
  // OpenAI
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextLength: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextLength: 128000 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextLength: 128000 },
  // Anthropic
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', contextLength: 200000 },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', contextLength: 200000 },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', contextLength: 200000 },
  // Gemini
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'gemini', contextLength: 1000000 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', contextLength: 2000000 },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', contextLength: 1000000 },
  // Promto AI
  ...PROMTO_AI_MODELS,
]

// =====================================================
// Context
// =====================================================

const ModelConfigContext = createContext<ModelConfigContextType | undefined>(undefined)

// =====================================================
// Provider
// =====================================================

export function ModelConfigProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ModelSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(BUILTIN_MODELS)
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  // 从localStorage加载配置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('promto-model-config')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setSettings({ ...DEFAULT_SETTINGS, ...parsed })
        } catch (e) {
          console.error('Failed to parse saved model config:', e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // 保存配置到localStorage
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('promto-model-config', JSON.stringify(settings))
    }
  }, [settings, isLoaded])

  // 更新配置
  const updateSettings = useCallback((newSettings: Partial<ModelSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  // 重置为默认
  const resetToDefault = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  // 刷新模型列表
  const refreshModels = useCallback(async () => {
    setIsLoadingModels(true)
    try {
      const response = await fetch('/api/models')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // API返回格式: { providers: [...], stats: {...} }
          const providers = data.data.providers
          if (Array.isArray(providers)) {
            // 合并所有provider的模型
            const apiModels: ModelOption[] = []
            for (const providerResult of providers) {
              if (providerResult.models && Array.isArray(providerResult.models)) {
                for (const m of providerResult.models) {
                  apiModels.push({
                    id: m.id,
                    name: m.name,
                    provider: m.provider || providerResult.provider,
                    contextLength: m.context_length,
                    badges: m.badges,
                  })
                }
              }
            }
            // 合并API返回的模型和Promto AI模型
            if (apiModels.length > 0) {
              setAvailableModels([...apiModels, ...PROMTO_AI_MODELS])
            } else {
              // 如果没有获取到模型，使用内置列表
              setAvailableModels(BUILTIN_MODELS)
            }
          } else {
            setAvailableModels(BUILTIN_MODELS)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      // 使用内置模型列表作为后备
      setAvailableModels(BUILTIN_MODELS)
    } finally {
      setIsLoadingModels(false)
    }
  }, [])

  // 初始加载模型列表
  useEffect(() => {
    refreshModels()
  }, [refreshModels])

  return (
    <ModelConfigContext.Provider
      value={{
        settings,
        updateSettings,
        resetToDefault,
        isLoaded,
        availableModels,
        refreshModels,
        isLoadingModels,
      }}
    >
      {children}
    </ModelConfigContext.Provider>
  )
}

// =====================================================
// Hook
// =====================================================

export function useModelConfig() {
  const context = useContext(ModelConfigContext)
  if (context === undefined) {
    throw new Error('useModelConfig must be used within a ModelConfigProvider')
  }
  return context
}

// =====================================================
// 工具函数
// =====================================================

export function getProviderDisplayName(provider: AIProvider | 'promto'): string {
  const names: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    gemini: 'Google Gemini',
    openrouter: 'OpenRouter',
    promto: 'Promto AI',
  }
  return names[provider] || provider
}

export function getProviderColor(provider: AIProvider | 'promto'): string {
  const colors: Record<string, string> = {
    openai: 'bg-green-500',
    anthropic: 'bg-orange-500',
    gemini: 'bg-blue-500',
    openrouter: 'bg-purple-500',
    promto: 'bg-gradient-to-r from-primary to-accent',
  }
  return colors[provider] || 'bg-gray-500'
}

