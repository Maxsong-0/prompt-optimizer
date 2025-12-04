import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
} from '@/lib/api/utils'
import { TeamService } from '@/lib/services/team'
import { z } from 'zod'

// 更新团队验证
const UpdateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional(),
  avatar_url: z.string().url().nullable().optional(),
  settings: z.record(z.any()).optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/teams/[id] - 获取团队详情
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

  const team = await TeamService.getTeam(teamId)
  if (!team) {
    return errorResponse('Team not found', 404)
  }

  return successResponse(team)
})

/**
 * PUT /api/teams/[id] - 更新团队信息
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

  // 检查是否是管理员
  const isAdmin = await TeamService.isAdmin(teamId, userId)
  if (!isAdmin) {
    return errorResponse('Only team admins can update team info', 403)
  }

  const body = await request.json()
  const updateData = UpdateTeamSchema.parse(body)

  const team = await TeamService.updateTeam(teamId, updateData)

  return successResponse(team)
})

/**
 * DELETE /api/teams/[id] - 删除团队
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

  // 检查是否是所有者
  const isOwner = await TeamService.isOwner(teamId, userId)
  if (!isOwner) {
    return errorResponse('Only team owner can delete the team', 403)
  }

  await TeamService.deleteTeam(teamId)

  return successResponse({ message: 'Team deleted successfully' })
})

