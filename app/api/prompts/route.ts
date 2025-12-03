import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  parseQuery,
  withErrorHandler,
} from '@/lib/api/utils'
import { PromptService } from '@/lib/services/prompt'
import { CreatePromptSchema, ListPromptsSchema } from '@/lib/validators/prompt'

/**
 * GET /api/prompts - 获取提示词列表
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析查询参数
  const queryResult = parseQuery(request.nextUrl.searchParams, ListPromptsSchema)
  if ('error' in queryResult) {
    return queryResult.error
  }

  // 查询列表
  const result = await PromptService.list(userId, queryResult.data)

  return successResponse(result)
})

/**
 * POST /api/prompts - 创建新提示词
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, CreatePromptSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  // 创建提示词
  const prompt = await PromptService.create(userId, bodyResult.data)

  return successResponse(prompt, 201)
})

