import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  parseBody,
  withErrorHandler,
} from '@/lib/api/utils'
import { TeamService } from '@/lib/services/team'
import { z } from 'zod'

// 创建团队验证
const CreateTeamSchema = z.object({
  name: z.string().min(1, '团队名称不能为空').max(50, '团队名称过长'),
  description: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
})

// 加入团队验证
const JoinTeamSchema = z.object({
  invite_code: z.string().min(1, '邀请码不能为空'),
})

/**
 * GET /api/teams - 获取用户的团队列表
 */
export const GET = withErrorHandler(async () => {
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const teams = await TeamService.getUserTeams(userId)

  return successResponse(teams)
})

/**
 * POST /api/teams - 创建新团队或通过邀请码加入团队
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const body = await request.json()

  // 判断是创建团队还是加入团队
  if (body.invite_code) {
    // 通过邀请码加入团队
    const bodyResult = await parseBody(request, JoinTeamSchema)
    if ('error' in bodyResult) {
      // Re-parse since we already consumed the body
      const joinData = JoinTeamSchema.parse(body)
      const team = await TeamService.joinTeamByCode(userId, joinData.invite_code)
      return successResponse(team, 200)
    }
    const team = await TeamService.joinTeamByCode(userId, body.invite_code)
    return successResponse(team, 200)
  } else {
    // 创建新团队
    const createData = CreateTeamSchema.parse(body)
    const team = await TeamService.createTeam(userId, createData)
    return successResponse(team, 201)
  }
})

