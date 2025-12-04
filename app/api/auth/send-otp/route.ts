import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  errorResponse,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { z } from 'zod'

const SendOtpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  type: z.enum(['signup', 'login', 'recovery']).default('login'),
})

/**
 * POST /api/auth/send-otp - 发送邮箱验证码
 * 
 * Request Body:
 * - email: 邮箱地址
 * - type: 验证码类型 (signup/login/recovery)
 * 
 * Response:
 * - success: boolean
 * - message: string
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流：每分钟最多 5 次（防止滥用，但允许合理的重试）
  const rateLimitError = await withRateLimit(request, 5)
  if (rateLimitError) return rateLimitError

  // 解析请求体
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('请求格式错误', 400)
  }

  // 验证参数
  const validationResult = SendOtpSchema.safeParse(body)
  if (!validationResult.success) {
    return errorResponse(validationResult.error.errors[0].message, 400)
  }

  const { email, type } = validationResult.data
  const supabase = await createClient()

  // 根据类型发送不同的 OTP
  if (type === 'signup' || type === 'login') {
    // 使用 signInWithOtp 发送魔术链接/验证码
    // Supabase 会自动发送包含 OTP 的邮件
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 不自动登录，只发送验证码
        shouldCreateUser: type === 'signup',
      },
    })

    if (error) {
      console.error('Send OTP error:', error)
      
      // 处理特定错误
      if (error.message.includes('rate limit')) {
        return errorResponse('发送频率过高，请稍后再试', 429)
      }
      if (error.message.includes('not allowed')) {
        return errorResponse('该邮箱不允许注册', 400)
      }
      
      return errorResponse('发送验证码失败，请稍后重试', 500)
    }
  } else if (type === 'recovery') {
    // 密码重置
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return errorResponse('发送重置邮件失败', 500)
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      message: type === 'recovery' 
        ? '重置密码邮件已发送，请查收' 
        : '验证码已发送，请查收邮件',
      // 验证码有效期（秒）
      expires_in: 3600,
    },
  })
})

