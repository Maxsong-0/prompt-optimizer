import { createClient, createAdminClient } from '@/lib/supabase/server'
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
  first_name: z.string().min(1, '请输入名字').max(50),
  last_name: z.string().min(1, '请输入姓氏').max(50),
  phone: z.string().max(20).optional(),
  // 保留 display_name 向后兼容
  display_name: z.string().min(1).max(100).optional(),
})

/**
 * POST /api/auth/signup - 邮箱注册
 * 
 * Request Body:
 * - email: 邮箱地址
 * - password: 密码（6-72位）
 * - first_name: 名字
 * - last_name: 姓氏
 * - phone: 手机号（可选）
 */
export const POST = withErrorHandler(async (request: Request) => {
  // 限流（更严格）
  const rateLimitError = await withRateLimit(request, 5)
  if (rateLimitError) return rateLimitError

  // 解析请求
  const bodyResult = await parseBody(request, SignUpSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { email, password, first_name, last_name, phone, display_name } = bodyResult.data
  
  // 构建显示名称
  const fullName = display_name || `${first_name} ${last_name}`
  
  const supabase = await createClient()

  // 注册用户
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        name: fullName,
        first_name,
        last_name,
        phone,
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

  // 如果用户创建成功且有 phone，更新 profiles 表
  if (data.user && phone) {
    try {
      const adminClient = createAdminClient()
      await adminClient
        .from('profiles')
        .update({ phone, first_name, last_name })
        .eq('id', data.user.id)
    } catch (updateError) {
      // 非关键错误，记录日志但不影响注册流程
      console.error('Failed to update profile phone:', updateError)
    }
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
      ? '注册成功，请查收验证邮件完成注册'
      : '注册成功',
  }, 201)
})
