import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
} from '@/lib/api/utils'
import { ApiKeyService, PROVIDER_INFO } from '@/lib/services/api-keys'
import type { AIProviderType } from '@/lib/services/api-keys'

interface RouteContext {
  params: Promise<{ provider: string }>
}

const VALID_PROVIDERS = ['openai', 'anthropic', 'gemini', 'openrouter']

/**
 * DELETE /api/settings/api-keys/[provider] - 删除指定 Provider 的 API Key
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { provider } = await context.params

  // 验证 provider
  if (!VALID_PROVIDERS.includes(provider)) {
    return errorResponse('无效的 Provider', 400)
  }

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 删除 API Key
  await ApiKeyService.deleteApiKey(userId, provider as AIProviderType)

  return successResponse({
    message: `${PROVIDER_INFO[provider as AIProviderType].name} API Key 已删除`,
    provider,
  })
})

/**
 * POST /api/settings/api-keys/[provider]/validate - 验证指定 Provider 的 API Key
 */
export const POST = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { provider } = await context.params

  // 验证 provider
  if (!VALID_PROVIDERS.includes(provider)) {
    return errorResponse('无效的 Provider', 400)
  }

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 获取用户的 API Key
  const apiKey = await ApiKeyService.getApiKey(userId, provider as AIProviderType)

  if (!apiKey) {
    return errorResponse('未配置该 Provider 的 API Key', 404)
  }

  // 验证 API Key
  const validation = await ApiKeyService.validateApiKey(
    provider as AIProviderType,
    apiKey
  )

  // 更新验证状态
  await ApiKeyService.updateValidationStatus(
    userId,
    provider as AIProviderType,
    validation.valid
  )

  if (validation.valid) {
    return successResponse({
      valid: true,
      message: 'API Key 验证成功',
      provider,
    })
  } else {
    return successResponse({
      valid: false,
      message: validation.error || 'API Key 验证失败',
      provider,
    })
  }
})

