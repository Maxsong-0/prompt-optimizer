import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

// =====================================================
// AI Provider 类型定义
// =====================================================

export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'openrouter'

// 默认使用 OpenRouter
export const DEFAULT_PROVIDER: AIProvider = 'openrouter'

export interface ModelConfig {
  provider: AIProvider
  model: string
  maxTokens: number
  temperature: number
}

// =====================================================
// Provider 工厂函数
// =====================================================

/**
 * 创建 OpenAI 客户端
 */
export function createOpenAIClient(apiKey?: string) {
  return createOpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
    compatibility: 'strict',
  })
}

/**
 * 创建 Anthropic 客户端
 */
export function createAnthropicClient(apiKey?: string) {
  return createAnthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  })
}

/**
 * 创建 Google Gemini 客户端
 */
export function createGeminiClient(apiKey?: string) {
  return createGoogleGenerativeAI({
    apiKey: apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })
}

/**
 * 创建 OpenRouter 客户端
 * OpenRouter 使用 OpenAI 兼容的 API
 */
export function createOpenRouterClient(apiKey?: string) {
  return createOpenAI({
    apiKey: apiKey || process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    compatibility: 'compatible',
  })
}

// =====================================================
// 默认客户端实例（使用环境变量）
// =====================================================

export const openai = createOpenAIClient()
export const anthropic = createAnthropicClient()
export const gemini = createGeminiClient()
export const openrouter = createOpenRouterClient()

// =====================================================
// 模型配置
// =====================================================

/**
 * 快速优化使用的模型配置
 * 使用较小/快速的模型以降低成本和延迟
 */
export const QUICK_MODEL_CONFIG: Record<AIProvider, ModelConfig> = {
  openrouter: {
    provider: 'openrouter',
    model: 'google/gemini-2.0-flash-exp:free', // 免费快速模型
    maxTokens: 4096,
    temperature: 0.7,
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 4096,
    temperature: 0.7,
  },
  anthropic: {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 4096,
    temperature: 0.7,
  },
  gemini: {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    maxTokens: 4096,
    temperature: 0.7,
  },
}

/**
 * 深度优化使用的模型配置
 * 使用更强大的模型以获得更好的结果
 */
export const DEEP_MODEL_CONFIG: Record<AIProvider, ModelConfig> = {
  openrouter: {
    provider: 'openrouter',
    model: 'anthropic/claude-3.5-sonnet', // 通过 OpenRouter 使用 Claude
    maxTokens: 8192,
    temperature: 0.5,
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 8192,
    temperature: 0.5,
  },
  anthropic: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 8192,
    temperature: 0.5,
  },
  gemini: {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    maxTokens: 8192,
    temperature: 0.5,
  },
}

/**
 * 评估使用的模型配置
 */
export const EVAL_MODEL_CONFIG: Record<AIProvider, ModelConfig> = {
  openrouter: {
    provider: 'openrouter',
    model: 'openai/gpt-4o', // 通过 OpenRouter 使用 GPT-4o
    maxTokens: 2048,
    temperature: 0.3,
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 2048,
    temperature: 0.3,
  },
  anthropic: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 2048,
    temperature: 0.3,
  },
  gemini: {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    maxTokens: 2048,
    temperature: 0.3,
  },
}

// =====================================================
// 获取模型实例
// =====================================================

/**
 * 根据 provider 创建客户端
 */
export function createProviderClient(provider: AIProvider, apiKey?: string) {
  switch (provider) {
    case 'openai':
      return createOpenAIClient(apiKey)
    case 'anthropic':
      return createAnthropicClient(apiKey)
    case 'gemini':
      return createGeminiClient(apiKey)
    case 'openrouter':
      return createOpenRouterClient(apiKey)
    default:
      throw new Error(`不支持的 Provider: ${provider}`)
  }
}

/**
 * 获取指定 Provider 的模型
 * @param provider - AI Provider 类型
 * @param modelId - 模型 ID
 * @param apiKey - 可选的自定义 API Key
 */
export function getModel(provider: AIProvider, modelId: string, apiKey?: string) {
  const client = createProviderClient(provider, apiKey)
  return client(modelId)
}

/**
 * 获取快速优化模型
 * @param provider - AI Provider，默认使用 OpenRouter
 * @param apiKey - 可选的自定义 API Key
 */
export function getQuickModel(provider: AIProvider = DEFAULT_PROVIDER, apiKey?: string) {
  const config = QUICK_MODEL_CONFIG[provider]
  return {
    model: getModel(provider, config.model, apiKey),
    config,
  }
}

/**
 * 获取深度优化模型
 * @param provider - AI Provider，默认使用 OpenRouter
 * @param apiKey - 可选的自定义 API Key
 */
export function getDeepModel(provider: AIProvider = DEFAULT_PROVIDER, apiKey?: string) {
  const config = DEEP_MODEL_CONFIG[provider]
  return {
    model: getModel(provider, config.model, apiKey),
    config,
  }
}

/**
 * 获取评估模型
 * @param provider - AI Provider，默认使用 OpenRouter
 * @param apiKey - 可选的自定义 API Key
 */
export function getEvalModel(provider: AIProvider = DEFAULT_PROVIDER, apiKey?: string) {
  const config = EVAL_MODEL_CONFIG[provider]
  return {
    model: getModel(provider, config.model, apiKey),
    config,
  }
}

// =====================================================
// 动态模型获取（支持用户自定义模型）
// =====================================================

export interface DynamicModelOptions {
  provider: AIProvider
  modelId: string
  apiKey?: string
  maxTokens?: number
  temperature?: number
}

/**
 * 动态获取模型（支持用户自定义配置）
 */
export function getDynamicModel(options: DynamicModelOptions) {
  const { provider, modelId, apiKey, maxTokens = 4096, temperature = 0.7 } = options
  
  return {
    model: getModel(provider, modelId, apiKey),
    config: {
      provider,
      model: modelId,
      maxTokens,
      temperature,
    },
  }
}
