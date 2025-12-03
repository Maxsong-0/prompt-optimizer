import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  errorResponse,
  parseBody,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { z } from 'zod'

const OAuthSchema = z.object({
  provider: z.enum(['github', 'google']),
  redirect_to: z.string().optional(),
})

/**
 * POST /api/auth/oauth - OAuth 登录入口
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流
  const rateLimitError = await withRateLimit(request, 10)
  if (rateLimitError) return rateLimitError

  // 解析请求
  const bodyResult = await parseBody(request, OAuthSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }

  const { provider, redirect_to } = bodyResult.data
  const supabase = await createClient()

  // 获取当前请求的origin
  const origin = request.headers.get('origin') || 
                 `${request.nextUrl.protocol}//${request.nextUrl.host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback${redirect_to ? `?next=${encodeURIComponent(redirect_to)}` : ''}`,
    },
  })

  if (error) {
    return errorResponse(`OAuth初始化失败: ${error.message}`, 500)
  }

  // 返回重定向URL
  return NextResponse.json({
    success: true,
    data: {
      url: data.url,
    },
  })
})

