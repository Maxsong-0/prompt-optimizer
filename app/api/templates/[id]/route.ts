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
import { TemplateService } from '@/lib/services/template'

// =====================================================
// 验证 Schema
// =====================================================

const UpdateTemplateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  content: z.string().min(1).optional(),
  category: z.enum(['writing', 'coding', 'marketing', 'business', 'image', 'education', 'custom']).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  variables: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

// =====================================================
// GET /api/templates/[id] - 获取单个模板
// =====================================================

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 100)
  if (rateLimitError) return rateLimitError

  const { id } = await params

  // 获取模板
  const template = await TemplateService.getTemplateById(id)

  if (!template) {
    return errorResponse('模板未找到', 404)
  }

  // 如果模板不是公开的且不是系统模板，检查用户权限
  if (!template.is_public && !template.is_system) {
    const authResult = await requireAuth()
    if (authResult instanceof Response) {
      return authResult
    }
    if (template.user_id !== authResult.userId) {
      return errorResponse('无权访问此模板', 403)
    }
  }

  return successResponse(template)
})

// =====================================================
// PUT /api/templates/[id] - 更新模板
// =====================================================

export const PUT = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 30)
  if (rateLimitError) return rateLimitError

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const { id } = await params

  // 解析请求体
  const bodyResult = await parseBody(request, UpdateTemplateSchema)
  if ('error' in bodyResult) {
    return bodyResult.error
  }
  const input = bodyResult.data

  // 更新模板
  try {
    const template = await TemplateService.updateTemplate(id, userId, input)
    return successResponse(template)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return errorResponse('模板未找到', 404)
      }
      if (error.message.includes('permission')) {
        return errorResponse('无权更新此模板', 403)
      }
    }
    throw error
  }
})

// =====================================================
// DELETE /api/templates/[id] - 删除模板
// =====================================================

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 30)
  if (rateLimitError) return rateLimitError

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const { id } = await params

  // 删除模板
  try {
    await TemplateService.deleteTemplate(id, userId)
    return successResponse({ message: '模板已删除' })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return errorResponse('模板未找到', 404)
      }
      if (error.message.includes('permission')) {
        return errorResponse('无权删除此模板', 403)
      }
    }
    throw error
  }
})

