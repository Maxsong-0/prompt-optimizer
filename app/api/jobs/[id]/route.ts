import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  requireAuth,
  withErrorHandler,
} from '@/lib/api/utils'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: Promise<{ id: string }>
}

// =====================================================
// 优化任务类型
// =====================================================

interface OptimizationJob {
  id: string
  user_id: string
  prompt_id: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  mode: 'quick' | 'deep'
  provider: 'openai' | 'anthropic'
  original_content: string
  iterations_total: number
  current_iteration: number
  result: Record<string, unknown> | null
  error_message: string | null
  progress_log: Array<{
    iteration: number
    timestamp: string
    message: string
    data?: unknown
  }>
  tokens_used: number
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * GET /api/jobs/[id] - 获取任务状态
 */
export const GET = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const supabase = await createClient()

  // 获取任务
  const { data: job, error } = await supabase
    .from('optimization_jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return errorResponse('任务未找到', 404)
    }
    throw new Error(`获取任务失败: ${error.message}`)
  }

  const typedJob = job as OptimizationJob

  // 计算进度百分比
  const progress = typedJob.status === 'completed'
    ? 100
    : typedJob.status === 'failed' || typedJob.status === 'cancelled'
    ? 0
    : Math.round((typedJob.current_iteration / typedJob.iterations_total) * 100)

  return successResponse({
    ...typedJob,
    progress,
  })
})

/**
 * DELETE /api/jobs/[id] - 取消任务
 */
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params

  // 认证检查
  const authResult = await requireAuth()
  if (authResult instanceof Response) {
    return authResult
  }
  const { userId } = authResult

  const supabase = await createClient()

  // 获取任务
  const { data: job, error: fetchError } = await supabase
    .from('optimization_jobs')
    .select('status')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return errorResponse('任务未找到', 404)
    }
    throw new Error(`获取任务失败: ${fetchError.message}`)
  }

  // 只能取消pending或processing状态的任务
  if (!['pending', 'processing'].includes(job.status)) {
    return errorResponse('只能取消等待中或处理中的任务', 400)
  }

  // 更新任务状态为cancelled
  const { error: updateError } = await supabase
    .from('optimization_jobs')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`取消任务失败: ${updateError.message}`)
  }

  return successResponse({ message: '任务已取消' })
})

