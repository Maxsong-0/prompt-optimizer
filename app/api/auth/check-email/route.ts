import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  errorResponse,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { z } from 'zod'

const EmailSchema = z.string().email('请输入有效的邮箱地址')

/**
 * GET /api/auth/check-email - 检查邮箱是否已注册
 * 
 * Query Parameters:
 * - email: 要检查的邮箱地址
 * 
 * Response:
 * - exists: boolean - 邮箱是否已存在
 * - provider: string | null - 如果存在，返回注册方式 (email/google/github)
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 限流（防止枚举攻击）
  const rateLimitError = await withRateLimit(request, 30)
  if (rateLimitError) return rateLimitError

  // 获取查询参数
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return errorResponse('请提供邮箱地址', 400)
  }

  // 验证邮箱格式
  const validationResult = EmailSchema.safeParse(email)
  if (!validationResult.success) {
    return errorResponse('邮箱格式无效', 400)
  }

  // 使用 admin 客户端绕过 RLS
  const supabase = createAdminClient()

  // 查询 profiles 表检查邮箱是否存在
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (error) {
    console.error('Check email error:', error)
    return errorResponse('检查邮箱时出错', 500)
  }

  // 如果 profile 存在，尝试获取更多用户信息来判断注册方式
  let provider: string | null = null
  
  if (profile) {
    // 通过 admin API 查询 auth.users 获取用户的 provider 信息
    const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
    
    if (userData?.user) {
      // 从 app_metadata 或 identities 获取 provider
      const identities = userData.user.identities || []
      if (identities.length > 0) {
        provider = identities[0].provider
      } else {
        provider = 'email'
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      exists: !!profile,
      provider: profile ? provider : null,
    },
  })
})

