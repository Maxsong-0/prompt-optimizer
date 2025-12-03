import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
} from '@/lib/api/utils'
import { ApiKeyService, PROVIDER_INFO } from '@/lib/services/api-keys'
import type { AIProviderType } from '@/lib/services/api-keys'
import { z } from 'zod'

// 验证器
const SaveApiKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini', 'openrouter']),
  api_key: z.string().min(1, 'API Key 不能为空'),
  display_name: z.string().max(100).optional(),
})

const SetDefaultProviderSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini', 'openrouter']),
})

/**
 * GET /api/settings/api-keys - 获取用户配置的 API Keys 信息
 */
export const GET = withErrorHandler(async () => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 获取用户的 API Keys 信息
  const apiKeysInfo = await ApiKeyService.getUserApiKeysInfo(userId)

  // 获取默认 provider
  const defaultProvider = await ApiKeyService.getDefaultProvider(userId)

  // 获取所有 provider 的配置信息
  const providersInfo = Object.entries(PROVIDER_INFO).map(([key, info]) => ({
    provider: key,
    ...info,
  }))

  return successResponse({
    api_keys: apiKeysInfo,
    default_provider: defaultProvider,
    providers_info: providersInfo,
  })
})

/**
 * POST /api/settings/api-keys - 保存 API Key
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, SaveApiKeySchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { provider, api_key, display_name } = bodyResult.data

  // 验证 API Key 格式（简单检查前缀）
  const providerInfo = PROVIDER_INFO[provider as AIProviderType]
  if (providerInfo.keyPrefix && !api_key.startsWith(providerInfo.keyPrefix)) {
    return errorResponse(
      `无效的 ${providerInfo.name} API Key 格式，应以 ${providerInfo.keyPrefix} 开头`,
      400
    )
  }

  // 验证 API Key 有效性
  const validation = await ApiKeyService.validateApiKey(
    provider as AIProviderType,
    api_key
  )

  if (!validation.valid) {
    return errorResponse(
      validation.error || 'API Key 验证失败',
      400
    )
  }

  // 保存 API Key
  const savedKey = await ApiKeyService.saveApiKey(userId, {
    provider: provider as AIProviderType,
    apiKey: api_key,
    displayName: display_name,
  })

  return successResponse({
    message: 'API Key 保存成功',
    provider,
    is_valid: true,
  }, 201)
})

/**
 * PUT /api/settings/api-keys - 设置默认 Provider
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, SetDefaultProviderSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { provider } = bodyResult.data

  // 设置默认 provider
  await ApiKeyService.setDefaultProvider(userId, provider as AIProviderType)

  return successResponse({
    message: '默认 Provider 设置成功',
    default_provider: provider,
  })
})

