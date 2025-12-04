import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { ModelsService } from '@/lib/services/models'
import { ApiKeyService } from '@/lib/services/api-keys'
import { DEFAULT_OPENROUTER_API_KEY } from '@/lib/ai/providers'
import type { AIProviderType } from '@/lib/services/api-keys'

/**
 * GET /api/models - 获取可用模型列表
 * 
 * Query params:
 *   - provider: 可选，指定provider
 *   - include_all: 可选，是否包含所有模型（包括未配置key的provider）
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 限流
  const rateLimitError = await withRateLimit(request, 30)
  if (rateLimitError) return rateLimitError

  // 认证检查（可选，未登录用户只能获取公开模型）
  const authResult = await requireAuth()
  const userId = authResult instanceof Response ? null : authResult.userId

  const { searchParams } = request.nextUrl
  const providerFilter = searchParams.get('provider') as AIProviderType | null
  const includeAll = searchParams.get('include_all') === 'true'

  // 收集用户配置的 API Keys
  const apiKeys: Partial<Record<AIProviderType, string>> = {}

  if (userId) {
    // 登录用户：获取所有配置的 API Keys
    const providers: AIProviderType[] = ['openai', 'anthropic', 'gemini', 'openrouter']
    
    for (const provider of providers) {
      const key = await ApiKeyService.getApiKey(userId, provider)
      if (key) {
        apiKeys[provider] = key
      }
    }
  }

  // 如果用户没有配置任何 key，使用默认或环境变量
  if (!apiKeys.openrouter) {
    apiKeys.openrouter = process.env.OPENROUTER_API_KEY || DEFAULT_OPENROUTER_API_KEY
  }
  if (!apiKeys.openai && process.env.OPENAI_API_KEY) {
    apiKeys.openai = process.env.OPENAI_API_KEY
  }
  if (!apiKeys.anthropic && process.env.ANTHROPIC_API_KEY) {
    apiKeys.anthropic = process.env.ANTHROPIC_API_KEY
  }
  if (!apiKeys.gemini && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    apiKeys.gemini = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  }

  // 获取模型列表
  let results

  if (providerFilter) {
    // 单个 provider
    switch (providerFilter) {
      case 'openrouter':
        results = [await ModelsService.fetchOpenRouterModels(apiKeys.openrouter)]
        break
      case 'openai':
        if (apiKeys.openai) {
          results = [await ModelsService.fetchOpenAIModels(apiKeys.openai)]
        } else {
          results = [{ provider: 'openai', models: [], error: '未配置 OpenAI API Key' }]
        }
        break
      case 'gemini':
        if (apiKeys.gemini) {
          results = [await ModelsService.fetchGeminiModels(apiKeys.gemini)]
        } else {
          results = [{ provider: 'gemini', models: [], error: '未配置 Gemini API Key' }]
        }
        break
      case 'anthropic':
        results = [ModelsService.getAnthropicModels()]
        if (!apiKeys.anthropic) {
          results[0].models = []
          results[0].error = '未配置 Anthropic API Key'
        }
        break
      default:
        return errorResponse('无效的 Provider', 400)
    }
  } else {
    // 所有 provider
    results = await ModelsService.getAllModels(apiKeys)
  }

  // 计算统计信息
  const totalModels = results.reduce((sum, r) => sum + r.models.length, 0)
  const configuredProviders = Object.keys(apiKeys).length

  return successResponse({
    providers: results,
    stats: {
      total_models: totalModels,
      configured_providers: configuredProviders,
    },
    user_has_keys: userId ? configuredProviders > 0 : false,
  })
})

