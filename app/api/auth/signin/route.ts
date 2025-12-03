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

const SignInSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

/**
 * POST /api/auth/signin - 邮箱密码登录
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流
  const rateLimitError = await withRateLimit(request, 10)
  if (rateLimitError) return rateLimitError

  // 解析请求
  const bodyResult = await parseBody(request, SignInSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { email, password } = bodyResult.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return errorResponse('邮箱或密码错误', 401)
    }
    if (error.message.includes('Email not confirmed')) {
      return errorResponse('请先验证邮箱', 401)
    }
    return errorResponse(error.message, 401)
  }

  return successResponse({
    user: {
      id: data.user.id,
      email: data.user.email,
    },
    session: {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    },
  })
})

