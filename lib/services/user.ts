import { createClient } from '@/lib/supabase/server'
import type { UpdateProfileInput } from '@/lib/validators/prompt'

// =====================================================
// 类型定义
// =====================================================

export interface UserProfile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'user' | 'pro' | 'admin'
  subscription_tier: 'free' | 'pro' | 'enterprise'
  credits: number
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface UsageRecord {
  id: string
  user_id: string
  date: string
  quick_count: number
  deep_count: number
  tokens_used: number
  api_calls: number
  created_at: string
  updated_at: string
}

export interface UserStats {
  total_prompts: number
  total_optimizations: number
  today_quick: number
  today_deep: number
  avg_score: number | null
}

export interface QuotaLimits {
  quick_daily: number
  deep_daily: number
  quick_remaining: number
  deep_remaining: number
}

// =====================================================
// UserService - 用户管理服务
// =====================================================

export class UserService {
  /**
   * 获取用户Profile
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`获取用户信息失败: ${error.message}`)
    }

    return data as UserProfile
  }

  /**
   * 更新用户Profile
   */
  static async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {}
    
    if (input.display_name !== undefined) {
      updateData.display_name = input.display_name
    }
    if (input.avatar_url !== undefined) {
      updateData.avatar_url = input.avatar_url
    }
    if (input.preferences !== undefined) {
      // 合并现有preferences
      const { data: current } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', userId)
        .single()
      
      updateData.preferences = {
        ...(current?.preferences || {}),
        ...input.preferences,
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`更新用户信息失败: ${error.message}`)
    }

    return data as UserProfile
  }

  /**
   * 获取今日使用量
   */
  static async getTodayUsage(userId: string): Promise<UsageRecord | null> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`获取使用量失败: ${error.message}`)
    }

    return data as UsageRecord
  }

  /**
   * 获取使用量历史
   */
  static async getUsageHistory(
    userId: string,
    days: number = 30
  ): Promise<UsageRecord[]> {
    const supabase = await createClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      throw new Error(`获取使用历史失败: ${error.message}`)
    }

    return (data || []) as UsageRecord[]
  }

  /**
   * 增加使用量（通过数据库函数）
   */
  static async incrementUsage(
    userId: string,
    mode: 'quick' | 'deep',
    tokensUsed: number = 0
  ): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_mode: mode,
      p_tokens: tokensUsed,
    })

    if (error) {
      throw new Error(`更新使用量失败: ${error.message}`)
    }
  }

  /**
   * 检查用户配额
   */
  static async checkQuota(
    userId: string,
    mode: 'quick' | 'deep'
  ): Promise<boolean> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('check_user_quota', {
      p_user_id: userId,
      p_mode: mode,
    })

    if (error) {
      throw new Error(`检查配额失败: ${error.message}`)
    }

    return data as boolean
  }

  /**
   * 获取用户统计信息
   */
  static async getStats(userId: string): Promise<UserStats> {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_user_stats', {
      p_user_id: userId,
    })

    if (error) {
      throw new Error(`获取统计信息失败: ${error.message}`)
    }

    return data as UserStats
  }

  /**
   * 获取配额限制
   */
  static async getQuotaLimits(userId: string): Promise<QuotaLimits> {
    const profile = await this.getProfile(userId)
    const todayUsage = await this.getTodayUsage(userId)

    // 根据订阅等级设置限制
    const limits = {
      free: { quick: 10, deep: 3 },
      pro: { quick: 100, deep: 20 },
      enterprise: { quick: 999999, deep: 999999 },
    }

    const tier = profile?.subscription_tier || 'free'
    const tierLimits = limits[tier]

    return {
      quick_daily: tierLimits.quick,
      deep_daily: tierLimits.deep,
      quick_remaining: Math.max(0, tierLimits.quick - (todayUsage?.quick_count || 0)),
      deep_remaining: Math.max(0, tierLimits.deep - (todayUsage?.deep_count || 0)),
    }
  }

  /**
   * 扣减积分
   */
  static async deductCredits(userId: string, amount: number): Promise<number> {
    const supabase = await createClient()

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (fetchError) {
      throw new Error(`获取积分失败: ${fetchError.message}`)
    }

    const newCredits = Math.max(0, (profile?.credits || 0) - amount)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId)

    if (updateError) {
      throw new Error(`扣减积分失败: ${updateError.message}`)
    }

    return newCredits
  }
}

