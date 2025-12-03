import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
} from '@/lib/api/utils'
import { UserService } from '@/lib/services/user'
import { UpdateProfileSchema } from '@/lib/validators/prompt'

/**
 * GET /api/user/profile - 获取当前用户信息
 */
export const GET = withErrorHandler(async () => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 获取用户信息
  const profile = await UserService.getProfile(userId)

  if (!profile) {
    return errorResponse('用户不存在', 404)
  }

  // 获取额外的统计信息
  const stats = await UserService.getStats(userId)
  const quotaLimits = await UserService.getQuotaLimits(userId)

  return successResponse({
    profile,
    stats,
    quota: quotaLimits,
  })
})

/**
 * PUT /api/user/profile - 更新用户信息
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, UpdateProfileSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  // 更新用户信息
  const profile = await UserService.updateProfile(userId, bodyResult.data)

  return successResponse(profile)
})

