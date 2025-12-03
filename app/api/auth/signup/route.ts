import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  parseBody,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { z } from 'zod'

const SignUpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位').max(72, '密码最长72位'),
  display_name: z.string().min(1, '请输入显示名称').max(100).optional(),
})

/**
 * POST /api/auth/signup - 邮箱注册
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流（更严格）
  const rateLimitError = await withRateLimit(request, 5)
  if (rateLimitError) return rateLimitError

  // 解析请求
  const bodyResult = await parseBody(request, SignUpSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { email, password, display_name } = bodyResult.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: display_name,
        name: display_name,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return errorResponse('该邮箱已注册', 400)
    }
    if (error.message.includes('Password')) {
      return errorResponse('密码不符合要求', 400)
    }
    return errorResponse(error.message, 400)
  }

  // 检查是否需要邮箱验证
  const needsVerification = !data.session

  return successResponse({
    user: data.user ? {
      id: data.user.id,
      email: data.user.email,
    } : null,
    needs_verification: needsVerification,
    message: needsVerification
      ? '注册成功，请查收验证邮件'
      : '注册成功',
  }, 201)
})

