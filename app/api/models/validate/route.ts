import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  parseBody,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { ApiKeyService, PROVIDER_INFO } from '@/lib/services/api-keys'
import type { AIProviderType } from '@/lib/services/api-keys'
import { z } from 'zod'

// 验证器
const ValidateKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini', 'openrouter']),
  api_key: z.string().min(1, 'API Key 不能为空'),
})

/**
 * POST /api/models/validate - 验证 API Key（无需登录）
 * 
 * 用于在保存前验证 API Key 是否有效
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流（更严格）
  const rateLimitError = await withRateLimit(request, 10)
  if (rateLimitError) return rateLimitError

  // 解析请求体
  const bodyResult = await parseBody(request, ValidateKeySchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { provider, api_key } = bodyResult.data

  // 验证格式
  const providerInfo = PROVIDER_INFO[provider as AIProviderType]
  if (providerInfo.keyPrefix && !api_key.startsWith(providerInfo.keyPrefix)) {
    return successResponse({
      valid: false,
      error: `无效的格式，${providerInfo.name} API Key 应以 ${providerInfo.keyPrefix} 开头`,
      provider,
    })
  }

  // 验证有效性
  const validation = await ApiKeyService.validateApiKey(
    provider as AIProviderType,
    api_key
  )

  return successResponse({
    valid: validation.valid,
    error: validation.error,
    provider,
    provider_name: providerInfo.name,
  })
})

