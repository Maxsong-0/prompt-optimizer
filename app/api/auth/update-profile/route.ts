import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  errorResponse,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  first_name: z.string().min(1, '请输入名字').max(50).optional(),
  last_name: z.string().min(1, '请输入姓氏').max(50).optional(),
  phone: z.string().max(20).optional(),
  password: z.string().min(6, '密码至少6位').max(72, '密码最长72位').optional(),
})

/**
 * POST /api/auth/update-profile - 更新用户资料
 * 
 * 需要用户已登录
 * 
 * Request Body:
 * - first_name: 名字（可选）
 * - last_name: 姓氏（可选）
 * - phone: 手机号（可选）
 * - password: 新密码（可选）
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
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
  const validationResult = UpdateProfileSchema.safeParse(body)
  if (!validationResult.success) {
    return errorResponse(validationResult.error.errors[0].message, 400)
  }

  const { first_name, last_name, phone, password } = validationResult.data
  const supabase = await createClient()

  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return errorResponse('请先登录', 401)
  }

  // 更新密码（如果提供）
  if (password) {
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    })

    if (passwordError) {
      console.error('Password update error:', passwordError)
      return errorResponse('密码更新失败: ' + passwordError.message, 400)
    }
  }

  // 更新用户元数据
  const metadata: Record<string, string> = {}
  if (first_name) metadata.first_name = first_name
  if (last_name) metadata.last_name = last_name
  if (phone) metadata.phone = phone
  if (first_name && last_name) {
    metadata.full_name = `${first_name} ${last_name}`
    metadata.name = `${first_name} ${last_name}`
  }

  if (Object.keys(metadata).length > 0) {
    const { error: metadataError } = await supabase.auth.updateUser({
      data: metadata,
    })

    if (metadataError) {
      console.error('Metadata update error:', metadataError)
    }
  }

  // 更新 profiles 表
  try {
    const adminClient = createAdminClient()
    const profileUpdate: Record<string, string | undefined> = {}
    if (first_name) profileUpdate.first_name = first_name
    if (last_name) profileUpdate.last_name = last_name
    if (phone) profileUpdate.phone = phone
    if (first_name && last_name) {
      profileUpdate.display_name = `${first_name} ${last_name}`
    }

    if (Object.keys(profileUpdate).length > 0) {
      await adminClient
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
    }
  } catch (updateError) {
    console.error('Profile table update error:', updateError)
    // 非关键错误，不影响主流程
  }

  return NextResponse.json({
    success: true,
    data: {
      message: '资料更新成功',
    },
  })
})

