import { createClient } from '@/lib/supabase/server'

// =====================================================
// 类型定义
// =====================================================

export type TemplateCategory = 'writing' | 'coding' | 'marketing' | 'business' | 'image' | 'education' | 'custom'

export interface Template {
  id: string
  user_id: string | null
  title: string
  description: string | null
  content: string
  category: TemplateCategory
  tags: string[]
  is_public: boolean
  is_system: boolean
  usage_count: number
  rating: number
  rating_count: number
  variables: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateTemplateInput {
  title: string
  description?: string
  content: string
  category?: TemplateCategory
  tags?: string[]
  is_public?: boolean
  variables?: string[]
  metadata?: Record<string, any>
}

export interface UpdateTemplateInput {
  title?: string
  description?: string
  content?: string
  category?: TemplateCategory
  tags?: string[]
  is_public?: boolean
  variables?: string[]
  metadata?: Record<string, any>
}

export interface TemplateListOptions {
  category?: TemplateCategory
  search?: string
  includeSystem?: boolean
  includePublic?: boolean
  limit?: number
  offset?: number
}

export interface PaginatedTemplates {
  data: Template[]
  total: number
  limit: number
  offset: number
}

// =====================================================
// TemplateService
// =====================================================

export class TemplateService {
  /**
   * 创建新模板
   */
  static async createTemplate(
    userId: string,
    input: CreateTemplateInput
  ): Promise<Template> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description || null,
        content: input.content,
        category: input.category || 'custom',
        tags: input.tags || [],
        is_public: input.is_public || false,
        is_system: false,
        variables: input.variables || [],
        metadata: input.metadata || {},
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create template:', error)
      throw new Error(`Failed to create template: ${error.message}`)
    }
    
    return data as Template
  }
  
  /**
   * 获取模板列表
   */
  static async getTemplates(
    userId: string,
    options: TemplateListOptions = {}
  ): Promise<PaginatedTemplates> {
    const supabase = await createClient()
    const {
      category,
      search,
      includeSystem = true,
      includePublic = true,
      limit = 50,
      offset = 0,
    } = options
    
    let query = supabase
      .from('templates')
      .select('*', { count: 'exact' })
    
    // 可见性过滤：用户自己的 + 公开的 + 系统的
    const visibilityConditions: string[] = [`user_id.eq.${userId}`]
    if (includePublic) {
      visibilityConditions.push('is_public.eq.true')
    }
    if (includeSystem) {
      visibilityConditions.push('is_system.eq.true')
    }
    query = query.or(visibilityConditions.join(','))
    
    // 分类过滤
    if (category) {
      query = query.eq('category', category)
    }
    
    // 搜索过滤
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // 排序和分页
    query = query
      .order('is_system', { ascending: false })
      .order('usage_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Failed to fetch templates:', error)
      throw new Error(`Failed to fetch templates: ${error.message}`)
    }
    
    return {
      data: (data || []) as Template[],
      total: count || 0,
      limit,
      offset,
    }
  }
  
  /**
   * 获取单个模板
   */
  static async getTemplateById(templateId: string): Promise<Template | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Failed to fetch template:', error)
      throw new Error(`Failed to fetch template: ${error.message}`)
    }
    
    return data as Template
  }
  
  /**
   * 更新模板
   */
  static async updateTemplate(
    templateId: string,
    userId: string,
    input: UpdateTemplateInput
  ): Promise<Template> {
    const supabase = await createClient()
    
    // 首先检查模板是否属于用户
    const { data: existing, error: fetchError } = await supabase
      .from('templates')
      .select('user_id, is_system')
      .eq('id', templateId)
      .single()
    
    if (fetchError || !existing) {
      throw new Error('Template not found')
    }
    
    if (existing.user_id !== userId || existing.is_system) {
      throw new Error('You do not have permission to update this template')
    }
    
    const updateData: Record<string, any> = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.content !== undefined) updateData.content = input.content
    if (input.category !== undefined) updateData.category = input.category
    if (input.tags !== undefined) updateData.tags = input.tags
    if (input.is_public !== undefined) updateData.is_public = input.is_public
    if (input.variables !== undefined) updateData.variables = input.variables
    if (input.metadata !== undefined) updateData.metadata = input.metadata
    
    const { data, error } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single()
    
    if (error) {
      console.error('Failed to update template:', error)
      throw new Error(`Failed to update template: ${error.message}`)
    }
    
    return data as Template
  }
  
  /**
   * 删除模板
   */
  static async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const supabase = await createClient()
    
    // 首先检查模板是否属于用户
    const { data: existing, error: fetchError } = await supabase
      .from('templates')
      .select('user_id, is_system')
      .eq('id', templateId)
      .single()
    
    if (fetchError || !existing) {
      throw new Error('Template not found')
    }
    
    if (existing.user_id !== userId || existing.is_system) {
      throw new Error('You do not have permission to delete this template')
    }
    
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
    
    if (error) {
      console.error('Failed to delete template:', error)
      throw new Error(`Failed to delete template: ${error.message}`)
    }
  }
  
  /**
   * 增加模板使用计数
   */
  static async incrementUsage(templateId: string, userId: string): Promise<void> {
    const supabase = await createClient()
    
    // 使用 RPC 函数来增加计数并记录使用
    const { error } = await supabase.rpc('increment_template_usage', {
      p_template_id: templateId,
      p_user_id: userId,
    })
    
    if (error) {
      // 如果 RPC 失败，尝试直接更新
      console.warn('RPC increment_template_usage failed, using fallback:', error)
      
      await supabase
        .from('templates')
        .update({ usage_count: supabase.rpc('usage_count', {}) })
        .eq('id', templateId)
      
      await supabase
        .from('template_usage')
        .insert({ user_id: userId, template_id: templateId })
    }
  }
  
  /**
   * 收藏模板
   */
  static async favoriteTemplate(templateId: string, userId: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('user_favorite_templates')
      .insert({
        user_id: userId,
        template_id: templateId,
      })
    
    if (error && error.code !== '23505') { // 忽略重复键错误
      console.error('Failed to favorite template:', error)
      throw new Error(`Failed to favorite template: ${error.message}`)
    }
  }
  
  /**
   * 取消收藏模板
   */
  static async unfavoriteTemplate(templateId: string, userId: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('user_favorite_templates')
      .delete()
      .eq('user_id', userId)
      .eq('template_id', templateId)
    
    if (error) {
      console.error('Failed to unfavorite template:', error)
      throw new Error(`Failed to unfavorite template: ${error.message}`)
    }
  }
  
  /**
   * 获取用户收藏的模板
   */
  static async getFavoriteTemplates(userId: string): Promise<Template[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_favorite_templates')
      .select('template_id, templates(*)')
      .eq('user_id', userId)
    
    if (error) {
      console.error('Failed to fetch favorite templates:', error)
      throw new Error(`Failed to fetch favorite templates: ${error.message}`)
    }
    
    return (data || []).map((item: any) => item.templates) as Template[]
  }
  
  /**
   * 检查模板是否被用户收藏
   */
  static async isFavorited(templateId: string, userId: string): Promise<boolean> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_favorite_templates')
      .select('id')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to check favorite status:', error)
      return false
    }
    
    return !!data
  }
}

