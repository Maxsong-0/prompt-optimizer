import { NextRequest } from 'next/server'
import {
  successResponse,
  requireAuth,
  withErrorHandler,
  withRateLimit,
} from '@/lib/api/utils'
import { TemplateService } from '@/lib/services/template'

// =====================================================
// POST /api/templates/[id]/use - 记录模板使用
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

  // 增加使用计数
  await TemplateService.incrementUsage(id, userId)

  return successResponse({ message: '使用已记录' })
})

