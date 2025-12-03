import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { OptimizationService } from '@/lib/services/optimization'
import { DeepOptimizeSchema } from '@/lib/validators/prompt'

/**
 * POST /api/optimize/deep - 深度优化（创建异步任务）
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 10) // 每分钟10次
  if (rateLimitError) return rateLimitError

  // 认证检查（必须登录）
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, DeepOptimizeSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { content, provider, max_iterations, target_score, title } = bodyResult.data

  try {
    // 创建深度优化任务
    const jobId = await OptimizationService.createDeepOptimizeJob({
      content,
      provider,
      userId,
      maxIterations: max_iterations,
      targetScore: target_score,
      title,
    })

    return successResponse({
      job_id: jobId,
      message: '深度优化任务已创建',
      status: 'pending',
    }, 202)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('配额') || error.message.includes('次数')) {
        return errorResponse(error.message, 429)
      }
      if (error.message.includes('API key')) {
        return errorResponse('AI服务配置错误，请联系管理员', 500)
      }
    }
    throw error
  }
})

