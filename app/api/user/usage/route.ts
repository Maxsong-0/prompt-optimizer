import { NextRequest } from 'next/server'
import {
  successResponse,
  requireAuth,
  withErrorHandler,
} from '@/lib/api/utils'
import { UserService } from '@/lib/services/user'
import { z } from 'zod'

const UsageQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
})

/**
 * GET /api/user/usage - 获取使用量统计
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析查询参数
  const daysParam = request.nextUrl.searchParams.get('days')
  const { days } = UsageQuerySchema.parse({ days: daysParam })

  // 获取今日使用量
  const todayUsage = await UserService.getTodayUsage(userId)

  // 获取历史使用量
  const history = await UserService.getUsageHistory(userId, days)

  // 获取配额限制
  const quota = await UserService.getQuotaLimits(userId)

  // 计算汇总数据
  const summary = {
    total_quick: history.reduce((sum, r) => sum + r.quick_count, 0),
    total_deep: history.reduce((sum, r) => sum + r.deep_count, 0),
    total_tokens: history.reduce((sum, r) => sum + r.tokens_used, 0),
    total_api_calls: history.reduce((sum, r) => sum + r.api_calls, 0),
  }

  return successResponse({
    today: todayUsage || {
      quick_count: 0,
      deep_count: 0,
      tokens_used: 0,
      api_calls: 0,
    },
    quota,
    summary,
    history,
  })
})

