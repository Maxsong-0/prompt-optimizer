import { NextRequest } from 'next/server'
import {
  successResponse,
  requireAuth,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { TemplateService } from '@/lib/services/template'

// =====================================================
// POST /api/templates/[id]/favorite - 收藏模板
// =====================================================

export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 60)
  if (rateLimitError) return rateLimitError

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const { id } = await params

  // 收藏模板
  await TemplateService.favoriteTemplate(id, userId)

  return successResponse({ message: '已收藏' })
})

// =====================================================
// DELETE /api/templates/[id]/favorite - 取消收藏
// =====================================================

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // 限流检查
  const rateLimitError = await withRateLimit(request, 60)
  if (rateLimitError) return rateLimitError

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const { id } = await params

  // 取消收藏
  await TemplateService.unfavoriteTemplate(id, userId)

  return successResponse({ message: '已取消收藏' })
})

