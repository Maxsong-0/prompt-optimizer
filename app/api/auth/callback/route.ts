import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/auth/callback - OAuth 回调处理
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
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

  if (code) {
    const supabase = await createClient()

    // 交换code获取session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('认证失败，请重试')}`
      )
    }

    // 重定向到目标页面
    const redirectUrl = next.startsWith('/') ? `${origin}${next}` : next
    return NextResponse.redirect(redirectUrl)
  }

  // 没有code，重定向到登录页
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('无效的认证请求')}`)
}

