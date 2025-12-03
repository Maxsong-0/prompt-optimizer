import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { EvaluationService } from '@/lib/services/evaluation'
import { EvaluatePromptSchema } from '@/lib/validators/prompt'
import { PromptService } from '@/lib/services/prompt'

/**
 * POST /api/evaluate - 评估提示词质量
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 20) // 每分钟20次
  if (rateLimitError) return rateLimitError

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, EvaluatePromptSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { content, prompt_id, provider } = bodyResult.data

  // 如果提供了prompt_id，验证所有权
  if (prompt_id) {
    const prompt = await PromptService.getById(prompt_id, userId)
    if (!prompt) {
      return errorResponse('提示词未找到或无权访问', 404)
    }
  }

  try {
    // 执行评估
    const evaluation = await EvaluationService.evaluate({
      content,
      promptId: prompt_id,
      provider,
      saveResult: !!prompt_id,
    })

    return successResponse({
      evaluation,
      prompt_id,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('解析失败')) {
        return errorResponse('评估结果解析失败，请重试', 500)
      }
      if (error.message.includes('API key')) {
        return errorResponse('AI服务配置错误，请联系管理员', 500)
      }
    }
    throw error
  }
})

