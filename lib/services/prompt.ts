import { createClient } from '@/lib/supabase/server'
import type {
  CreatePromptInput,
  UpdatePromptInput,
  ListPromptsInput,
} from '@/lib/validators/prompt'

// =====================================================
// 类型定义
// =====================================================

export interface Prompt {
  id: string
  user_id: string
  title: string | null
  original_content: string
  optimized_content: string | null
  model_used: 'openai' | 'anthropic' | null
  optimization_mode: 'quick' | 'deep' | null
  score: number | null
  metadata: Record<string, unknown>
  tags: string[]
  is_public: boolean
  is_favorite: boolean
  version: number
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// =====================================================
// PromptService - 提示词CRUD服务
// =====================================================

export class PromptService {
  /**
   * 创建新提示词
   */
  static async create(
    userId: string,
    input: CreatePromptInput
  ): Promise<Prompt> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        title: input.title,
        original_content: input.original_content,
        tags: input.tags || [],
        is_public: input.is_public ?? false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`创建提示词失败: ${error.message}`)
    }

    return data as Prompt
  }

  /**
   * 获取单个提示词
   */
  static async getById(
    promptId: string,
    userId?: string
  ): Promise<Prompt | null> {
    const supabase = await createClient()

    let query = supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)

    // 如果指定了用户ID，验证所有权
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 未找到
      }
      throw new Error(`获取提示词失败: ${error.message}`)
    }

    return data as Prompt
  }

  /**
   * 更新提示词
   */
  static async update(
    promptId: string,
    userId: string,
    input: UpdatePromptInput
  ): Promise<Prompt> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('prompts')
      .update({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.original_content !== undefined && { original_content: input.original_content }),
        ...(input.optimized_content !== undefined && { optimized_content: input.optimized_content }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.is_public !== undefined && { is_public: input.is_public }),
        ...(input.is_favorite !== undefined && { is_favorite: input.is_favorite }),
        ...(input.score !== undefined && { score: input.score }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
      })
      .eq('id', promptId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`更新提示词失败: ${error.message}`)
    }

    return data as Prompt
  }

  /**
   * 删除提示词
   */
  static async delete(promptId: string, userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`删除提示词失败: ${error.message}`)
    }
  }

  /**
   * 列表查询提示词
   */
  static async list(
    userId: string,
    input: ListPromptsInput
  ): Promise<PaginatedResult<Prompt>> {
    const supabase = await createClient()
    const { page, limit, search, tags, is_public, is_favorite, sort_by, sort_order } = input

    // 构建查询
    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // 搜索
    if (search) {
      query = query.or(`title.ilike.%${search}%,original_content.ilike.%${search}%`)
    }

    // 标签筛选
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    // 公开状态筛选
    if (is_public !== undefined) {
      query = query.eq('is_public', is_public)
    }

    // 收藏筛选
    if (is_favorite !== undefined) {
      query = query.eq('is_favorite', is_favorite)
    }

    // 排序
    query = query.order(sort_by || 'created_at', { ascending: sort_order === 'asc' })

    // 分页
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`查询提示词列表失败: ${error.message}`)
    }

    const total = count || 0

    return {
      items: (data || []) as Prompt[],
      total,
      page,
      limit,
      has_more: offset + limit < total,
    }
  }

  /**
   * 获取公开提示词列表
   */
  static async listPublic(
    input: Omit<ListPromptsInput, 'is_public'>
  ): Promise<PaginatedResult<Prompt>> {
    const supabase = await createClient()
    const { page, limit, search, tags, sort_by, sort_order } = input

    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('is_public', true)

    if (search) {
      query = query.or(`title.ilike.%${search}%,original_content.ilike.%${search}%`)
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
    }

    query = query.order(sort_by || 'created_at', { ascending: sort_order === 'asc' })

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(`查询公开提示词失败: ${error.message}`)
    }

    const total = count || 0

    return {
      items: (data || []) as Prompt[],
      total,
      page,
      limit,
      has_more: offset + limit < total,
    }
  }

  /**
   * 保存优化结果
   */
  static async saveOptimization(
    userId: string,
    data: {
      title?: string
      original_content: string
      optimized_content: string
      model_used: 'openai' | 'anthropic'
      optimization_mode: 'quick' | 'deep'
      score?: number
      metadata?: Record<string, unknown>
    }
  ): Promise<Prompt> {
    const supabase = await createClient()

    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        title: data.title || `优化于 ${new Date().toLocaleDateString('zh-CN')}`,
        original_content: data.original_content,
        optimized_content: data.optimized_content,
        model_used: data.model_used,
        optimization_mode: data.optimization_mode,
        score: data.score,
        metadata: data.metadata || {},
      })
      .select()
      .single()

    if (error) {
      throw new Error(`保存优化结果失败: ${error.message}`)
    }

    return prompt as Prompt
  }
}

