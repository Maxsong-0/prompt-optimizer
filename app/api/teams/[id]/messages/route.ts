import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
} from '@/lib/api/utils'
import { TeamService } from '@/lib/services/team'
import { z } from 'zod'

// 发送消息验证
const SendMessageSchema = z.object({
  content: z.string().min(1, '消息内容不能为空').max(5000, '消息过长'),
  message_type: z.enum(['text', 'prompt', 'ai_response', 'system']).optional().default('text'),
  prompt_id: z.string().uuid().optional(),
  reply_to_id: z.string().uuid().optional(),
  mentions: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.any()).optional(),
})

// 编辑消息验证
const EditMessageSchema = z.object({
  message_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/teams/[id]/messages - 获取团队消息
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult
  const { id: teamId } = await context.params

  // 检查是否是团队成员
  const isMember = await TeamService.isMember(teamId, userId)
  if (!isMember) {
    return errorResponse('Not a member of this team', 403)
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const before = searchParams.get('before') || undefined

  const messages = await TeamService.getTeamMessages(teamId, { limit, before })

  return successResponse(messages)
})

/**
 * POST /api/teams/[id]/messages - 发送消息
 */
export const POST = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult
  const { id: teamId } = await context.params

  // 检查是否是团队成员
  const isMember = await TeamService.isMember(teamId, userId)
  if (!isMember) {
    return errorResponse('Not a member of this team', 403)
  }

  const body = await request.json()
  const messageData = SendMessageSchema.parse(body)

  const message = await TeamService.sendMessage(teamId, userId, messageData)

  return successResponse(message, 201)
})

/**
 * PUT /api/teams/[id]/messages - 编辑消息
 */
export const PUT = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult
  const { id: teamId } = await context.params

  // 检查是否是团队成员
  const isMember = await TeamService.isMember(teamId, userId)
  if (!isMember) {
    return errorResponse('Not a member of this team', 403)
  }

  const body = await request.json()
  const { message_id, content } = EditMessageSchema.parse(body)

  // 编辑消息（RLS会验证是否是消息作者）
  const message = await TeamService.editMessage(message_id, content)

  return successResponse(message)
})

/**
 * DELETE /api/teams/[id]/messages - 删除消息
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult
  const { id: teamId } = await context.params

  // 检查是否是团队成员
  const isMember = await TeamService.isMember(teamId, userId)
  if (!isMember) {
    return errorResponse('Not a member of this team', 403)
  }

  const { searchParams } = new URL(request.url)
  const messageId = searchParams.get('message_id')

  if (!messageId) {
    return errorResponse('message_id is required', 400)
  }

  // 删除消息（RLS会验证是否是消息作者）
  await TeamService.deleteMessage(messageId)

  return successResponse({ message: 'Message deleted' })
})

