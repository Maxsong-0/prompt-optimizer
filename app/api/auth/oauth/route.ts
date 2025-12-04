import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  errorResponse,
  withRateLimit,
} from '@/lib/api/utils'
import { z } from 'zod'
import { isSupabaseEnabled } from '@/lib/supabase/config'

const OAuthSchema = z.object({
  provider: z.enum(['github', 'google']),
  redirect_to: z.string().optional(),
})

/**
 * 获取应用的正确 origin URL
 * - 优先使用 NEXT_PUBLIC_APP_URL 环境变量
 * - 对于本地开发环境（localhost/127.0.0.1），强制使用 http 协议
 */
function getAppOrigin(request: Request): string {
  const url = new URL(request.url)
  const host = url.host
  
  // 检查是否是本地开发环境
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  
  if (isLocalhost) {
    // 本地开发环境强制使用 http
    return `http://${host}`
  }
  
  // 生产环境使用环境变量或请求的 origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    return appUrl.replace(/\/$/, '') // 移除末尾斜杠
  }
  
  // 回退到请求的 origin
  return request.headers.get('origin') || 
         `${url.protocol}//${host}`
}

/**
 * POST /api/auth/oauth - OAuth 登录入口
 */
export async function POST(request: NextRequest) {
  // 限流
  const rateLimitError = await withRateLimit(request, 10)
  if (rateLimitError) return rateLimitError

  if (!isSupabaseEnabled()) {
    return errorResponse('Supabase is not configured', 500)
  }

  // 解析请求
  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('请求格式错误', 400)
  }

  const validationResult = OAuthSchema.safeParse(body)
  if (!validationResult.success) {
    return errorResponse(validationResult.error.errors[0].message, 400)
  }

  const { provider, redirect_to } = validationResult.data
  
  // 获取正确的应用 origin
  const origin = getAppOrigin(request)
  
  // 默认跳转到 dashboard，除非指定了其他目标
  const nextPath = redirect_to || '/dashboard'

  // 收集需要设置的 cookies
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []
  
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  })

  if (error) {
    return errorResponse(`OAuth初始化失败: ${error.message}`, 500)
  }

  // 创建响应并设置 cookies
  const response = NextResponse.json({
    success: true,
    data: {
      url: data.url,
    },
  })

  // 将收集到的 cookies 设置到响应中
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  }

  return response
}

