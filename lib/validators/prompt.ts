import { z } from 'zod'

// =====================================================
// 枚举类型
// =====================================================

export const UserRole = z.enum(['user', 'pro', 'admin'])
export type UserRole = z.infer<typeof UserRole>

export const SubscriptionTier = z.enum(['free', 'pro', 'enterprise'])
export type SubscriptionTier = z.infer<typeof SubscriptionTier>

export const OptimizationMode = z.enum(['quick', 'deep'])
export type OptimizationMode = z.infer<typeof OptimizationMode>

export const JobStatus = z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled'])
export type JobStatus = z.infer<typeof JobStatus>

export const AIProvider = z.enum(['openai', 'anthropic', 'gemini', 'openrouter'])
export type AIProvider = z.infer<typeof AIProvider>

// =====================================================
// Prompt 验证器
// =====================================================

// 创建提示词
export const CreatePromptSchema = z.object({
  title: z.string().max(200).optional(),
  original_content: z.string().min(1, '提示词内容不能为空').max(10000, '提示词内容过长'),
  tags: z.array(z.string().max(50)).max(10).optional(),
  is_public: z.boolean().optional().default(false),
})
export type CreatePromptInput = z.infer<typeof CreatePromptSchema>

// 更新提示词
export const UpdatePromptSchema = z.object({
  title: z.string().max(200).optional(),
  original_content: z.string().min(1).max(10000).optional(),
  optimized_content: z.string().max(15000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  is_public: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  score: z.number().min(0).max(5).optional(),
  metadata: z.record(z.unknown()).optional(),
})
export type UpdatePromptInput = z.infer<typeof UpdatePromptSchema>

// 查询提示词列表
export const ListPromptsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.coerce.boolean().optional(),
  is_favorite: z.coerce.boolean().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'score', 'title']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})
export type ListPromptsInput = z.infer<typeof ListPromptsSchema>

// =====================================================
// 优化请求验证器
// =====================================================

// 快速优化请求
export const QuickOptimizeSchema = z.object({
  content: z.string().min(1, '提示词内容不能为空').max(10000, '提示词内容过长'),
  provider: AIProvider.optional().default('openrouter'),
  save_result: z.boolean().optional().default(false),
  title: z.string().max(200).optional(),
})
export type QuickOptimizeInput = z.infer<typeof QuickOptimizeSchema>

// 深度优化请求
export const DeepOptimizeSchema = z.object({
  content: z.string().min(1, '提示词内容不能为空').max(10000, '提示词内容过长'),
  provider: AIProvider.optional().default('openrouter'),
  max_iterations: z.number().int().min(1).max(5).optional().default(3),
  target_score: z.number().min(0).max(100).optional().default(85),
  save_result: z.boolean().optional().default(true),
  title: z.string().max(200).optional(),
})
export type DeepOptimizeInput = z.infer<typeof DeepOptimizeSchema>

// =====================================================
// 任务查询验证器
// =====================================================

export const JobQuerySchema = z.object({
  status: JobStatus.optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
})
export type JobQueryInput = z.infer<typeof JobQuerySchema>

// =====================================================
// 评估验证器
// =====================================================

export const EvaluatePromptSchema = z.object({
  prompt_id: z.string().uuid().optional(),
  content: z.string().min(1).max(15000),
  provider: AIProvider.optional().default('openrouter'),
})
export type EvaluatePromptInput = z.infer<typeof EvaluatePromptSchema>

// =====================================================
// 用户配置验证器
// =====================================================

export const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.object({
    default_provider: AIProvider.optional(),
    default_mode: OptimizationMode.optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().max(10).optional(),
  }).optional(),
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

// =====================================================
// 响应类型
// =====================================================

// 通用API响应
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })

// 分页响应
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    has_more: z.boolean(),
  })

// 评估结果
export const EvaluationResultSchema = z.object({
  clarity_score: z.number().min(0).max(100),
  constraint_score: z.number().min(0).max(100),
  context_score: z.number().min(0).max(100),
  format_score: z.number().min(0).max(100),
  overall_score: z.number().min(0).max(100),
  feedback: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
})
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>

// 优化结果
export const OptimizationResultSchema = z.object({
  original: z.string(),
  optimized: z.string(),
  changes: z.array(z.object({
    type: z.enum(['added', 'removed', 'modified']),
    description: z.string(),
  })),
  evaluation: EvaluationResultSchema.optional(),
})
export type OptimizationResult = z.infer<typeof OptimizationResultSchema>

