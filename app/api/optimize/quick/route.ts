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
import { QuickOptimizeSchema } from '@/lib/validators/prompt'

/**
 * POST /api/optimize/quick - 快速优化（流式响应）
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 30) // 每分钟30次
  if (rateLimitError) return rateLimitError

  // 认证检查（可选，匿名用户也可以使用但不保存）
  const authResult = await requireAuth()
  const userId = authResult instanceof Response ? undefined : authResult.userId

  // 解析请求体
  const bodyResult = await parseBody(request, QuickOptimizeSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { content, provider, save_result, title } = bodyResult.data

  try {
    // 检查是否需要流式响应
    const acceptStream = request.headers.get('accept')?.includes('text/event-stream')

    if (acceptStream) {
      // 流式响应
      const result = await OptimizationService.quickOptimizeStream({
        content,
        provider,
        userId,
      })

      // 返回流式响应
      return result.toDataStreamResponse()
    } else {
      // 非流式响应
      const result = await OptimizationService.quickOptimize({
        content,
        provider,
        userId,
        saveResult: save_result && !!userId,
        title,
      })

      return successResponse(result)
    }
  } catch (error) {
    console.error('Optimization error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('配额') || error.message.includes('次数')) {
        return errorResponse(error.message, 429)
      }
      // API key 相关错误
      if (error.message.includes('API key') || 
          error.message.includes('apiKey') || 
          error.message.includes('authentication') ||
          error.message.includes('unauthorized') ||
          error.message.includes('401')) {
        return errorResponse('AI服务未配置。请在设置中配置您的 API Key，或联系管理员配置默认服务。', 500)
      }
      // 模型不存在
      if (error.message.includes('model') && error.message.includes('not found')) {
        return errorResponse('AI模型暂时不可用，请稍后再试', 503)
      }
      // 其他错误
      return errorResponse(`优化失败: ${error.message}`, 500)
    }
    throw error
  }
})

