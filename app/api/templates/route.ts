import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { TemplateService, TemplateCategory } from '@/lib/services/template'

// =====================================================
// 验证 Schema
// =====================================================

const CreateTemplateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(255, '标题过长'),
  description: z.string().optional(),
  content: z.string().min(1, '内容不能为空'),
  category: z.enum(['writing', 'coding', 'marketing', 'business', 'image', 'education', 'custom']).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  variables: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

// =====================================================
// GET /api/templates - 获取模板列表
// =====================================================

export const GET = withErrorHandler(async (request: NextRequest) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 60)
  if (rateLimitError) return rateLimitError

  // 认证检查（可选，未登录用户也可以查看公开模板）
  const authResult = await requireAuth()
  const userId = 'userId' in authResult ? authResult.userId : null

  // 解析查询参数
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category') as TemplateCategory | null
  const search = searchParams.get('search') || undefined
  const includeSystem = searchParams.get('include_system') !== 'false'
  const includePublic = searchParams.get('include_public') !== 'false'
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  // 如果未登录，只返回公开和系统模板
  if (!userId) {
    const supabase = (await import('@/lib/supabase/server')).createClient()
    const client = await supabase
    
    let query = client
      .from('templates')
      .select('*', { count: 'exact' })
      .or('is_public.eq.true,is_system.eq.true')

    if (category) {
      query = query.eq('category', category)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query
      .order('is_system', { ascending: false })
      .order('usage_count', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count } = await query

    return successResponse({
      data: data || [],
      total: count || 0,
      limit,
      offset,
    })
  }

  // 已登录用户
  const result = await TemplateService.getTemplates(userId, {
    category: category || undefined,
    search,
    includeSystem,
    includePublic,
    limit,
    offset,
  })

  return successResponse(result)
})

// =====================================================
// POST /api/templates - 创建模板
// =====================================================

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 30)
  if (rateLimitError) return rateLimitError

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  // 解析请求体
  const bodyResult = await parseBody(request, CreateTemplateSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }
  const input = bodyResult.data

  // 创建模板
  const template = await TemplateService.createTemplate(userId, {
    title: input.title,
    description: input.description,
    content: input.content,
    category: input.category,
    tags: input.tags,
    is_public: input.is_public,
    variables: input.variables,
    metadata: input.metadata,
  })

  return successResponse(template, 201)
})

