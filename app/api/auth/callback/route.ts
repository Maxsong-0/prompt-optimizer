import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isSupabaseEnabled } from '@/lib/supabase/config'

/**
 * 获取应用的正确 origin URL
 * - 对于本地开发环境（localhost/127.0.0.1），强制使用 http 协议
 * - 生产环境使用环境变量或请求的 origin
 */
function getAppOrigin(request: NextRequest): string {
  const { host, protocol } = new URL(request.url)
  
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
  return `${protocol}//${host}`
}

/**
 * GET /api/auth/callback - OAuth 回调处理
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const origin = getAppOrigin(request)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // 处理OAuth错误
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (!isSupabaseEnabled()) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Supabase 未配置')}`
    )
  }

  if (code) {
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

    // 交换code获取session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('认证失败，请重试')}`
      )
    }

    // 重定向到目标页面，并设置 cookies
    const redirectUrl = next.startsWith('/') ? `${origin}${next}` : next
    const response = NextResponse.redirect(redirectUrl)

    // 将收集到的 cookies 设置到响应中
    for (const { name, value, options } of cookiesToSet) {
      response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
    }

    return response
  }

  // 没有code，重定向到登录页
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('无效的认证请求')}`)
}

