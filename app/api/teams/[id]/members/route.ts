import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
} from '@/lib/api/utils'
import { TeamService } from '@/lib/services/team'
import { z } from 'zod'

// 邀请成员验证
const InviteMemberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member']).optional().default('member'),
})

// 更新成员角色验证
const UpdateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member']),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/teams/[id]/members - 获取团队成员列表
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

  const members = await TeamService.getTeamMembers(teamId)

  return successResponse(members)
})

/**
 * POST /api/teams/[id]/members - 邀请成员
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

  // 检查是否是管理员
  const isAdmin = await TeamService.isAdmin(teamId, userId)
  if (!isAdmin) {
    return errorResponse('Only team admins can invite members', 403)
  }

  const body = await request.json()
  const { user_id, role } = InviteMemberSchema.parse(body)

  const member = await TeamService.inviteMember(teamId, userId, user_id, role)

  return successResponse(member, 201)
})

/**
 * PUT /api/teams/[id]/members - 更新成员角色
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
    return errorResponse('Only team admins can update member roles', 403)
  }

  const body = await request.json()
  const { user_id, role } = UpdateRoleSchema.parse(body)

  // 不能更改owner的角色
  const isOwner = await TeamService.isOwner(teamId, user_id)
  if (isOwner) {
    return errorResponse('Cannot change owner role', 400)
  }

  await TeamService.updateMemberRole(teamId, user_id, role)

  return successResponse({ message: 'Member role updated' })
})

/**
 * DELETE /api/teams/[id]/members - 移除成员或离开团队
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

  const { searchParams } = new URL(request.url)
  const targetUserId = searchParams.get('user_id')

  if (targetUserId && targetUserId !== userId) {
    // 移除其他成员 - 需要管理员权限
    const isAdmin = await TeamService.isAdmin(teamId, userId)
    if (!isAdmin) {
      return errorResponse('Only team admins can remove members', 403)
    }

    // 不能移除owner
    const isOwner = await TeamService.isOwner(teamId, targetUserId)
    if (isOwner) {
      return errorResponse('Cannot remove team owner', 400)
    }

    await TeamService.removeMember(teamId, targetUserId)
    return successResponse({ message: 'Member removed' })
  } else {
    // 自己离开团队
    await TeamService.leaveTeam(teamId, userId)
    return successResponse({ message: 'Left team successfully' })
  }
})

