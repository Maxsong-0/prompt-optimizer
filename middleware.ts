import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// =====================================================
// 路由保护配置
// =====================================================

// 需要登录才能访问的路由
const PROTECTED_ROUTES = [
  '/dashboard',
  '/settings',
  '/api/prompts',
  '/api/optimize/deep',
  '/api/evaluate',
  '/api/user',
  '/api/jobs',
  '/api/settings',
]

// 只允许未登录用户访问的路由
const AUTH_ROUTES = [
  '/login',
  '/register',
]

// 公开API路由（不需要登录）
const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/optimize/quick', // 快速优化允许匿名使用
]

/**
 * 检查路径是否匹配某个模式列表
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1))
    }
    return pathname === pattern || pathname.startsWith(pattern + '/')
  })
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查环境变量是否存在
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables are not set. Skipping auth middleware.')
    return NextResponse.next()
  }
  
  // 首先更新session
  const response = await updateSession(request)

  // 如果是公开API路由，直接放行
  if (matchesPath(pathname, PUBLIC_API_ROUTES)) {
    return response
  }

  // 获取用户信息
  let user = null
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // 不需要在这里设置cookie，updateSession已经处理了
          },
        },
      }
    )
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  } catch {
    // 忽略获取用户信息的错误
  }

  const isLoggedIn = !!user
  const isProtectedRoute = matchesPath(pathname, PROTECTED_ROUTES)
  const isAuthRoute = matchesPath(pathname, AUTH_ROUTES)

  // 未登录用户访问受保护路由
  if (isProtectedRoute && !isLoggedIn) {
    // API路由返回401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: '未登录或登录已过期' },
        { status: 401 }
      )
    }
    // 页面路由重定向到登录
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录用户访问认证页面（登录/注册）
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的路径：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标文件)
     * - 公开文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

