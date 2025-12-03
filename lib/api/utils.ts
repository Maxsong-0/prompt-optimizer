import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZodError, ZodSchema } from 'zod'

// =====================================================
// API 响应工具函数
// =====================================================

/**
 * 成功响应
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

/**
 * 错误响应
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Zod 验证错误响应
 */
export function validationErrorResponse(error: ZodError) {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

  return NextResponse.json(
    {
      success: false,
      error: '请求参数验证失败',
      details: issues,
    },
    { status: 400 }
  )
}

// =====================================================
// 认证和授权
// =====================================================

/**
 * 获取当前认证用户
 * @returns 用户ID或null
 */
export async function getCurrentUser(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user.id
}

/**
 * 要求认证的装饰器
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const userId = await getCurrentUser()

  if (!userId) {
    return errorResponse('未登录或登录已过期', 401)
  }

  return { userId }
}

// =====================================================
// 请求解析
// =====================================================

/**
 * 解析并验证JSON请求体
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: validationErrorResponse(error) }
    }
    if (error instanceof SyntaxError) {
      return { error: errorResponse('无效的JSON格式', 400) }
    }
    return { error: errorResponse('请求解析失败', 400) }
  }
}

/**
 * 解析查询参数
 */
export function parseQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { data: T } | { error: NextResponse } {
  try {
    const params: Record<string, string | string[]> = {}
    
    searchParams.forEach((value, key) => {
      if (params[key]) {
        // 如果key已存在，转为数组
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value)
        } else {
          params[key] = [params[key] as string, value]
        }
      } else {
        params[key] = value
      }
    })

    const data = schema.parse(params)
    return { data }
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: validationErrorResponse(error) }
    }
    return { error: errorResponse('查询参数解析失败', 400) }
  }
}

// =====================================================
// 错误处理
// =====================================================

/**
 * 统一错误处理wrapper
 */
export function withErrorHandler(
  handler: (request: Request, context?: unknown) => Promise<NextResponse>
) {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof Error) {
        // 数据库错误
        if (error.message.includes('duplicate key')) {
          return errorResponse('数据已存在', 409)
        }
        if (error.message.includes('foreign key')) {
          return errorResponse('关联数据不存在', 400)
        }
        if (error.message.includes('not found') || error.message.includes('未找到')) {
          return errorResponse('资源未找到', 404)
        }

        return errorResponse(error.message, 500)
      }

      return errorResponse('服务器内部错误', 500)
    }
  }
}

// =====================================================
// 限流
// =====================================================

// 简单的内存限流器（生产环境应使用Redis）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * 检查限流
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * 限流中间件
 */
export async function withRateLimit(
  request: Request,
  maxRequests: number = 60
): Promise<NextResponse | null> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const key = `rate_limit:${ip}`

  if (!checkRateLimit(key, maxRequests)) {
    return errorResponse('请求过于频繁，请稍后再试', 429)
  }

  return null
}

