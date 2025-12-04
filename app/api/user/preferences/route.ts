import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
} from '@/lib/api/utils'
import { UserService } from '@/lib/services/user'
import { z } from 'zod'

// 用户偏好设置Schema
const UpdatePreferencesSchema = z.object({
  default_model: z.string().optional(),
  default_provider: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'zh']).optional(),
  default_optimize_mode: z.enum(['quick', 'deep']).optional(),
  auto_save: z.boolean().optional(),
  auto_save_interval: z.number().min(10).max(300).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    weekly_digest: z.boolean().optional(),
  }).optional(),
}).partial()

/**
 * GET /api/user/preferences - 获取用户偏好设置
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

  // 从 profile 的 preferences 字段获取偏好设置
  return successResponse({
    preferences: profile.preferences || {},
  })
})

/**
 * PUT /api/user/preferences - 更新用户偏好设置
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, UpdatePreferencesSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  // 获取当前用户信息
  const currentProfile = await UserService.getProfile(userId)
  if (!currentProfile) {
    return errorResponse('用户不存在', 404)
  }

  // 合并当前偏好设置和新的偏好设置
  const currentPreferences = currentProfile.preferences || {}
  const newPreferences = {
    ...currentPreferences,
    ...bodyResult.data,
  }

  // 更新用户偏好设置
  const profile = await UserService.updateProfile(userId, {
    preferences: newPreferences,
  })

  return successResponse({
    preferences: profile?.preferences || newPreferences,
  })
})

