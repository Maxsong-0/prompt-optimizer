import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
} from '@/lib/api/utils'
import { PromptService } from '@/lib/services/prompt'
import { UpdatePromptSchema } from '@/lib/validators/prompt'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/prompts/[id] - 获取单个提示词
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 获取提示词
  const prompt = await PromptService.getById(id, userId)

  if (!prompt) {
    return errorResponse('提示词未找到', 404)
  }

  return successResponse(prompt)
})

/**
 * PUT /api/prompts/[id] - 更新提示词
 */
export const PUT = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, UpdatePromptSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  // 检查提示词是否存在
  const existing = await PromptService.getById(id, userId)
  if (!existing) {
    return errorResponse('提示词未找到', 404)
  }

  // 更新提示词
  const prompt = await PromptService.update(id, userId, bodyResult.data)

  return successResponse(prompt)
})

/**
 * DELETE /api/prompts/[id] - 删除提示词
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 检查提示词是否存在
  const existing = await PromptService.getById(id, userId)
  if (!existing) {
    return errorResponse('提示词未找到', 404)
  }

  // 删除提示词
  await PromptService.delete(id, userId)

  return successResponse({ message: '删除成功' })
})

