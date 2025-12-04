import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// =====================================================
// 类型定义
// =====================================================

export interface Team {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  owner_id: string
  invite_code: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending' | 'inactive'
  joined_at: string | null
  invited_by: string | null
  created_at: string
  updated_at: string
}

export interface TeamMemberWithProfile extends TeamMember {
  display_name: string | null
  avatar_url: string | null
  email: string | null
}

export interface TeamMessage {
  id: string
  team_id: string
  user_id: string | null
  content: string
  message_type: 'text' | 'prompt' | 'ai_response' | 'system'
  prompt_id: string | null
  reply_to_id: string | null
  mentions: string[]
  metadata: Record<string, any>
  is_edited: boolean
  edited_at: string | null
  is_deleted: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface TeamMessageWithUser extends TeamMessage {
  user?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface CreateTeamInput {
  name: string
  description?: string
  avatar_url?: string
}

export interface UpdateTeamInput {
  name?: string
  description?: string
  avatar_url?: string
  settings?: Record<string, any>
}

export interface CreateMessageInput {
  content: string
  message_type?: 'text' | 'prompt' | 'ai_response' | 'system'
  prompt_id?: string
  reply_to_id?: string
  mentions?: string[]
  metadata?: Record<string, any>
}

// =====================================================
// TeamService
// =====================================================

export class TeamService {
  private static async getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
  }

  // =====================================================
  // Team CRUD
  // =====================================================

  /**
   * 创建团队
   */
  static async createTeam(userId: string, input: CreateTeamInput): Promise<Team> {
    const supabase = await this.getSupabase()

    // 创建团队
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: input.name,
        description: input.description,
        avatar_url: input.avatar_url,
        owner_id: userId,
      })
      .select()
      .single()

    if (teamError) throw new Error(teamError.message)

    // 自动添加创建者为owner成员
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString(),
      })

    if (memberError) throw new Error(memberError.message)

    return team
  }

  /**
   * 获取用户的团队列表
   */
  static async getUserTeams(userId: string): Promise<(Team & { member_count: number })[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        team:teams (
          id,
          name,
          description,
          avatar_url,
          owner_id,
          invite_code,
          settings,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) throw new Error(error.message)

    // 获取每个团队的成员数量
    const teams = await Promise.all(
      (data || []).map(async (item: any) => {
        const team = item.team as Team
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.id)
          .eq('status', 'active')

        return {
          ...team,
          member_count: count || 0,
        }
      })
    )

    return teams
  }

  /**
   * 获取单个团队详情
   */
  static async getTeam(teamId: string): Promise<Team | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('teams')
      .select()
      .eq('id', teamId)
      .single()

    if (error) return null
    return data
  }

  /**
   * 更新团队信息
   */
  static async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('teams')
      .update(input)
      .eq('id', teamId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * 删除团队
   */
  static async deleteTeam(teamId: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) throw new Error(error.message)
  }

  /**
   * 通过邀请码加入团队
   */
  static async joinTeamByCode(userId: string, inviteCode: string): Promise<Team> {
    const supabase = await this.getSupabase()

    // 查找团队
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select()
      .eq('invite_code', inviteCode)
      .single()

    if (teamError || !team) throw new Error('Invalid invite code')

    // 检查是否已经是成员
    const { data: existingMember } = await supabase
      .from('team_members')
      .select()
      .eq('team_id', team.id)
      .eq('user_id', userId)
      .single()

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new Error('Already a member of this team')
      }
      // 重新激活
      await supabase
        .from('team_members')
        .update({ status: 'active', joined_at: new Date().toISOString() })
        .eq('id', existingMember.id)
    } else {
      // 添加为新成员
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString(),
        })

      if (error) throw new Error(error.message)
    }

    return team
  }

  // =====================================================
  // Team Members
  // =====================================================

  /**
   * 获取团队成员列表
   */
  static async getTeamMembers(teamId: string): Promise<TeamMemberWithProfile[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url,
          email
        )
      `)
      .eq('team_id', teamId)
      .order('role')
      .order('joined_at')

    if (error) throw new Error(error.message)

    return (data || []).map((item: any) => ({
      ...item,
      display_name: item.profiles?.display_name,
      avatar_url: item.profiles?.avatar_url,
      email: item.profiles?.email,
    }))
  }

  /**
   * 邀请成员加入团队
   */
  static async inviteMember(
    teamId: string,
    invitedByUserId: string,
    targetUserId: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<TeamMember> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: targetUserId,
        role,
        status: 'pending',
        invited_by: invitedByUserId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * 接受团队邀请
   */
  static async acceptInvite(memberId: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('team_members')
      .update({
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .eq('id', memberId)

    if (error) throw new Error(error.message)
  }

  /**
   * 移除团队成员
   */
  static async removeMember(teamId: string, userId: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  }

  /**
   * 更新成员角色
   */
  static async updateMemberRole(
    teamId: string,
    userId: string,
    role: 'admin' | 'member'
  ): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  }

  /**
   * 离开团队
   */
  static async leaveTeam(teamId: string, userId: string): Promise<void> {
    const supabase = await this.getSupabase()

    // 检查是否是owner
    const { data: team } = await supabase
      .from('teams')
      .select('owner_id')
      .eq('id', teamId)
      .single()

    if (team?.owner_id === userId) {
      throw new Error('Team owner cannot leave. Transfer ownership or delete the team.')
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  }

  // =====================================================
  // Team Messages
  // =====================================================

  /**
   * 获取团队消息
   */
  static async getTeamMessages(
    teamId: string,
    options: { limit?: number; before?: string } = {}
  ): Promise<TeamMessageWithUser[]> {
    const supabase = await this.getSupabase()
    const { limit = 50, before } = options

    let query = supabase
      .from('team_messages')
      .select(`
        *,
        user:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return (data || []).reverse() as TeamMessageWithUser[]
  }

  /**
   * 发送消息
   */
  static async sendMessage(
    teamId: string,
    userId: string,
    input: CreateMessageInput
  ): Promise<TeamMessage> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('team_messages')
      .insert({
        team_id: teamId,
        user_id: userId,
        content: input.content,
        message_type: input.message_type || 'text',
        prompt_id: input.prompt_id,
        reply_to_id: input.reply_to_id,
        mentions: input.mentions || [],
        metadata: input.metadata || {},
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * 编辑消息
   */
  static async editMessage(messageId: string, content: string): Promise<TeamMessage> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('team_messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * 删除消息（软删除）
   */
  static async deleteMessage(messageId: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('team_messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', messageId)

    if (error) throw new Error(error.message)
  }

  // =====================================================
  // 权限检查
  // =====================================================

  /**
   * 检查用户是否是团队成员
   */
  static async isMember(teamId: string, userId: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    return !!data
  }

  /**
   * 检查用户是否是团队管理员
   */
  static async isAdmin(teamId: string, userId: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .in('role', ['owner', 'admin'])
      .eq('status', 'active')
      .single()

    return !!data
  }

  /**
   * 检查用户是否是团队所有者
   */
  static async isOwner(teamId: string, userId: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .eq('owner_id', userId)
      .single()

    return !!data
  }
}

