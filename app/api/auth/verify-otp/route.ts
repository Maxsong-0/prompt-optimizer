import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  errorResponse,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { z } from 'zod'

const VerifyOtpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  otp: z.string().length(6, '验证码必须是6位数字'),
  type: z.enum(['signup', 'email']).default('email'),
})

/**
 * POST /api/auth/verify-otp - 验证邮箱验证码
 * 
 * Request Body:
 * - email: 邮箱地址
 * - otp: 6位验证码
 * - type: 验证类型 (signup/email)
 * 
 * Response:
 * - success: boolean
 * - data: { user, session } 验证成功后返回用户信息和会话
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流：每分钟最多 10 次
  const rateLimitError = await withRateLimit(request, 10)
  if (rateLimitError) return rateLimitError

  // 解析请求体
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('请求格式错误', 400)
  }

  // 验证参数
  const validationResult = VerifyOtpSchema.safeParse(body)
  if (!validationResult.success) {
    return errorResponse(validationResult.error.errors[0].message, 400)
  }

  const { email, otp, type } = validationResult.data
  const supabase = await createClient()

  // 验证 OTP
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: type === 'signup' ? 'signup' : 'email',
  })

  if (error) {
    console.error('Verify OTP error:', error)
    
    // 处理特定错误
    if (error.message.includes('expired')) {
      return errorResponse('验证码已过期，请重新获取', 400)
    }
    if (error.message.includes('invalid') || error.message.includes('Invalid')) {
      return errorResponse('验证码错误，请重新输入', 400)
    }
    
    return errorResponse('验证失败，请重试', 400)
  }

  // 验证成功
  return NextResponse.json({
    success: true,
    data: {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
      } : null,
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      } : null,
      message: '验证成功',
    },
  })
})

