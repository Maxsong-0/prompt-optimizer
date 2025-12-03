import type { AIProviderType } from './api-keys'

// =====================================================
// 类型定义
// =====================================================

export interface AIModel {
  id: string
  name: string
  provider: AIProviderType
  description?: string
  context_length?: number
  pricing?: {
    prompt: number  // 每1M tokens的价格
    completion: number
  }
  capabilities?: string[]
  is_free?: boolean
  is_recommended?: boolean
}

export interface ModelListResponse {
  provider: AIProviderType
  models: AIModel[]
  error?: string
}

// =====================================================
// Anthropic 模型列表（硬编码，因为没有公开API）
// =====================================================

const ANTHROPIC_MODELS: AIModel[] = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: '最新旗舰模型，平衡性能与成本',
    context_length: 200000,
    pricing: { prompt: 3, completion: 15 },
    capabilities: ['chat', 'code', 'analysis', 'vision'],
    is_recommended: true,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: '快速响应，适合简单任务',
    context_length: 200000,
    pricing: { prompt: 0.25, completion: 1.25 },
    capabilities: ['chat', 'code'],
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: '最强能力，适合复杂任务',
    context_length: 200000,
    pricing: { prompt: 15, completion: 75 },
    capabilities: ['chat', 'code', 'analysis', 'vision'],
  },
]

// =====================================================
// ModelsService - 模型列表服务
// =====================================================

export class ModelsService {
  /**
   * 获取所有可用模型（聚合所有provider）
   */
  static async getAllModels(apiKeys: Partial<Record<AIProviderType, string>>): Promise<ModelListResponse[]> {
    const results: ModelListResponse[] = []

    // 并行获取所有provider的模型
    const promises: Promise<ModelListResponse>[] = []

    // OpenRouter（公开API，不需要key也能获取列表）
    promises.push(this.fetchOpenRouterModels(apiKeys.openrouter))

    // OpenAI
    if (apiKeys.openai) {
      promises.push(this.fetchOpenAIModels(apiKeys.openai))
    }

    // Gemini
    if (apiKeys.gemini) {
      promises.push(this.fetchGeminiModels(apiKeys.gemini))
    }

    // Anthropic（使用硬编码列表）
    promises.push(Promise.resolve({
      provider: 'anthropic' as AIProviderType,
      models: apiKeys.anthropic ? ANTHROPIC_MODELS : [],
    }))

    const responses = await Promise.allSettled(promises)

    for (const response of responses) {
      if (response.status === 'fulfilled') {
        results.push(response.value)
      }
    }

    return results
  }

  /**
   * 获取 OpenRouter 模型列表
   */
  static async fetchOpenRouterModels(apiKey?: string): Promise<ModelListResponse> {
    try {
      const headers: Record<string, string> = {}
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch('https://openrouter.ai/api/v1/models', { headers })

      if (!response.ok) {
        return {
          provider: 'openrouter',
          models: [],
          error: `HTTP ${response.status}`,
        }
      }

      const data = await response.json()
      const models: AIModel[] = (data.data || []).map((m: {
        id: string
        name?: string
        description?: string
        context_length?: number
        pricing?: { prompt: string; completion: string }
      }) => ({
        id: m.id,
        name: m.name || m.id,
        provider: 'openrouter' as AIProviderType,
        description: m.description,
        context_length: m.context_length,
        pricing: m.pricing ? {
          prompt: parseFloat(m.pricing.prompt) * 1000000,
          completion: parseFloat(m.pricing.completion) * 1000000,
        } : undefined,
        capabilities: this.inferCapabilities(m.id),
        is_free: m.id.includes(':free'),
        is_recommended: this.isRecommendedModel(m.id),
      }))

      // 按推荐度排序
      models.sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1
        if (!a.is_recommended && b.is_recommended) return 1
        if (a.is_free && !b.is_free) return -1
        if (!a.is_free && b.is_free) return 1
        return 0
      })

      return { provider: 'openrouter', models }
    } catch (error) {
      return {
        provider: 'openrouter',
        models: [],
        error: error instanceof Error ? error.message : '获取失败',
      }
    }
  }

  /**
   * 获取 OpenAI 模型列表
   */
  static async fetchOpenAIModels(apiKey: string): Promise<ModelListResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        return {
          provider: 'openai',
          models: [],
          error: `HTTP ${response.status}`,
        }
      }

      const data = await response.json()
      
      // 筛选出 chat 模型
      const chatModels = (data.data || []).filter((m: { id: string }) => 
        m.id.startsWith('gpt-') || m.id.startsWith('o1')
      )

      const models: AIModel[] = chatModels.map((m: { id: string; created?: number }) => ({
        id: m.id,
        name: this.formatModelName(m.id),
        provider: 'openai' as AIProviderType,
        description: this.getOpenAIModelDescription(m.id),
        context_length: this.getOpenAIContextLength(m.id),
        capabilities: this.inferCapabilities(m.id),
        is_recommended: this.isRecommendedModel(m.id),
      }))

      // 按推荐度和名称排序
      models.sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1
        if (!a.is_recommended && b.is_recommended) return 1
        return a.name.localeCompare(b.name)
      })

      return { provider: 'openai', models }
    } catch (error) {
      return {
        provider: 'openai',
        models: [],
        error: error instanceof Error ? error.message : '获取失败',
      }
    }
  }

  /**
   * 获取 Gemini 模型列表
   */
  static async fetchGeminiModels(apiKey: string): Promise<ModelListResponse> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )

      if (!response.ok) {
        return {
          provider: 'gemini',
          models: [],
          error: `HTTP ${response.status}`,
        }
      }

      const data = await response.json()
      
      // 筛选出支持 generateContent 的模型
      const genModels = (data.models || []).filter((m: { 
        supportedGenerationMethods?: string[]
        name?: string
      }) => 
        m.supportedGenerationMethods?.includes('generateContent') &&
        m.name?.includes('gemini')
      )

      const models: AIModel[] = genModels.map((m: {
        name: string
        displayName?: string
        description?: string
        inputTokenLimit?: number
      }) => {
        const id = m.name.replace('models/', '')
        return {
          id,
          name: m.displayName || this.formatModelName(id),
          provider: 'gemini' as AIProviderType,
          description: m.description,
          context_length: m.inputTokenLimit,
          capabilities: this.inferCapabilities(id),
          is_free: id.includes('flash'),
          is_recommended: this.isRecommendedModel(id),
        }
      })

      // 按推荐度排序
      models.sort((a, b) => {
        if (a.is_recommended && !b.is_recommended) return -1
        if (!a.is_recommended && b.is_recommended) return 1
        return 0
      })

      return { provider: 'gemini', models }
    } catch (error) {
      return {
        provider: 'gemini',
        models: [],
        error: error instanceof Error ? error.message : '获取失败',
      }
    }
  }

  /**
   * 获取 Anthropic 模型列表（硬编码）
   */
  static getAnthropicModels(): ModelListResponse {
    return {
      provider: 'anthropic',
      models: ANTHROPIC_MODELS,
    }
  }

  // =====================================================
  // 辅助函数
  // =====================================================

  /**
   * 格式化模型名称
   */
  private static formatModelName(modelId: string): string {
    const nameMap: Record<string, string> = {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'o1-preview': 'o1 Preview',
      'o1-mini': 'o1 Mini',
      'gemini-2.0-flash-exp': 'Gemini 2.0 Flash',
      'gemini-1.5-pro': 'Gemini 1.5 Pro',
      'gemini-1.5-flash': 'Gemini 1.5 Flash',
      'gemini-pro': 'Gemini Pro',
    }

    return nameMap[modelId] || modelId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  }

  /**
   * 获取 OpenAI 模型描述
   */
  private static getOpenAIModelDescription(modelId: string): string {
    const descMap: Record<string, string> = {
      'gpt-4o': '最新旗舰模型，支持多模态',
      'gpt-4o-mini': '轻量快速，性价比高',
      'gpt-4-turbo': '高性能版本',
      'gpt-4': '强大的推理能力',
      'gpt-3.5-turbo': '快速响应，适合简单任务',
      'o1-preview': '强推理能力，适合复杂问题',
      'o1-mini': '轻量推理模型',
    }
    return descMap[modelId] || ''
  }

  /**
   * 获取 OpenAI 模型上下文长度
   */
  private static getOpenAIContextLength(modelId: string): number {
    if (modelId.includes('gpt-4o')) return 128000
    if (modelId.includes('gpt-4-turbo')) return 128000
    if (modelId.includes('gpt-4')) return 8192
    if (modelId.includes('gpt-3.5')) return 16385
    if (modelId.includes('o1')) return 128000
    return 4096
  }

  /**
   * 推断模型能力
   */
  private static inferCapabilities(modelId: string): string[] {
    const capabilities: string[] = ['chat']
    
    if (modelId.includes('gpt-4') || modelId.includes('claude-3') || modelId.includes('gemini')) {
      capabilities.push('code', 'analysis')
    }
    
    if (modelId.includes('vision') || modelId.includes('4o') || modelId.includes('gemini')) {
      capabilities.push('vision')
    }

    if (modelId.includes('o1')) {
      capabilities.push('reasoning')
    }

    return capabilities
  }

  /**
   * 判断是否为推荐模型
   */
  private static isRecommendedModel(modelId: string): boolean {
    const recommended = [
      'gpt-4o',
      'gpt-4o-mini',
      'claude-3-5-sonnet',
      'claude-3-5-haiku',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'google/gemini-2.0-flash-exp',
      'google/gemini-pro-1.5',
    ]
    
    return recommended.some(r => modelId.includes(r))
  }
}

