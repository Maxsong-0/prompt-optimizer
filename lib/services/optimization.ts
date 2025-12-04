import { streamText, generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import {
  getQuickModel,
  getDeepModel,
  QUICK_OPTIMIZE_SYSTEM_PROMPT,
  getQuickOptimizePrompt,
  DEEP_OPTIMIZE_DRAFT_SYSTEM,
  DEEP_OPTIMIZE_CRITIQUE_SYSTEM,
  DEEP_OPTIMIZE_REFINE_SYSTEM,
  getDraftPrompt,
  getCritiquePrompt,
  getRefinePrompt,
  parseXMLContent,
  shouldContinueIteration,
  DEFAULT_PROVIDER,
} from '@/lib/ai'
import type { AIProvider } from '@/lib/ai'
import { UserService } from './user'

// =====================================================
// 类型定义
// =====================================================

export interface QuickOptimizeOptions {
  content: string
  provider?: AIProvider
  userId?: string
  saveResult?: boolean
  title?: string
}

export interface DeepOptimizeOptions {
  content: string
  provider?: AIProvider
  userId: string
  maxIterations?: number
  targetScore?: number
  saveResult?: boolean
  title?: string
}

export interface OptimizationProgress {
  iteration: number
  phase: 'draft' | 'critique' | 'refine'
  message: string
  data?: unknown
}

export interface DeepOptimizeResult {
  jobId: string
  original: string
  optimized: string
  iterations: number
  finalScore?: number
  history: Array<{
    iteration: number
    version: string
    critique: string
    changes?: string
  }>
}

// =====================================================
// OptimizationService - 核心优化服务
// =====================================================

export class OptimizationService {
  /**
   * 快速优化 - 返回流式响应
   */
  static async quickOptimizeStream(options: QuickOptimizeOptions) {
    const { content, provider = DEFAULT_PROVIDER, userId } = options
    const { model, config } = getQuickModel(provider)

    // 检查配额（如果提供了userId）
    if (userId) {
      const hasQuota = await UserService.checkQuota(userId, 'quick')
      if (!hasQuota) {
        throw new Error('今日快速优化次数已用完')
      }
    }

    // 使用streamText进行流式生成
    const result = streamText({
      model,
      system: QUICK_OPTIMIZE_SYSTEM_PROMPT,
      prompt: getQuickOptimizePrompt(content),
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    })

    return result
  }

  /**
   * 快速优化 - 返回完整结果
   */
  static async quickOptimize(options: QuickOptimizeOptions): Promise<{
    original: string
    optimized: string
    provider: AIProvider
    tokensUsed?: number
  }> {
    const { content, provider = DEFAULT_PROVIDER, userId, saveResult, title } = options
    const { model, config } = getQuickModel(provider)

    // 检查配额
    if (userId) {
      const hasQuota = await UserService.checkQuota(userId, 'quick')
      if (!hasQuota) {
        throw new Error('今日快速优化次数已用完')
      }
    }

    // 生成优化结果
    const result = await generateText({
      model,
      system: QUICK_OPTIMIZE_SYSTEM_PROMPT,
      prompt: getQuickOptimizePrompt(content),
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    })

    const optimized = result.text.trim()
    const tokensUsed = result.usage?.totalTokens || 0

    // 更新使用量
    if (userId) {
      await UserService.incrementUsage(userId, 'quick', tokensUsed)
    }

    // 保存结果
    if (saveResult && userId) {
      const supabase = await createClient()
      await supabase.from('prompts').insert({
        user_id: userId,
        title: title || `快速优化 - ${new Date().toLocaleDateString('zh-CN')}`,
        original_content: content,
        optimized_content: optimized,
        model_used: provider,
        optimization_mode: 'quick',
        metadata: { tokens_used: tokensUsed },
      })
    }

    return {
      original: content,
      optimized,
      provider,
      tokensUsed,
    }
  }

  /**
   * 深度优化 - 创建异步任务
   */
  static async createDeepOptimizeJob(options: DeepOptimizeOptions): Promise<string> {
    const {
      content,
      provider = DEFAULT_PROVIDER,
      userId,
      maxIterations = 3,
      title,
    } = options

    // 检查配额
    const hasQuota = await UserService.checkQuota(userId, 'deep')
    if (!hasQuota) {
      throw new Error('今日深度优化次数已用完')
    }

    const supabase = await createClient()

    // 创建任务记录
    const { data: job, error } = await supabase
      .from('optimization_jobs')
      .insert({
        user_id: userId,
        status: 'pending',
        mode: 'deep',
        provider,
        original_content: content,
        iterations_total: maxIterations,
        current_iteration: 0,
        progress_log: [{
          iteration: 0,
          timestamp: new Date().toISOString(),
          message: '任务已创建，等待处理',
        }],
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`创建任务失败: ${error.message}`)
    }

    // 异步启动任务处理（在实际生产中可以使用队列）
    this.processDeepOptimizeJob(job.id, {
      content,
      provider,
      userId,
      maxIterations,
      title,
    }).catch(console.error)

    return job.id
  }

  /**
   * 处理深度优化任务（Reflexion Loop）
   */
  private static async processDeepOptimizeJob(
    jobId: string,
    options: DeepOptimizeOptions
  ): Promise<void> {
    const { content, provider = DEFAULT_PROVIDER, userId, maxIterations = 3, title } = options
    const supabase = await createClient()

    const updateJob = async (updates: Record<string, unknown>) => {
      await supabase
        .from('optimization_jobs')
        .update(updates)
        .eq('id', jobId)
    }

    const appendLog = async (log: { iteration: number; message: string; data?: unknown }) => {
      const { data: job } = await supabase
        .from('optimization_jobs')
        .select('progress_log')
        .eq('id', jobId)
        .single()

      const progressLog = (job?.progress_log || []) as Array<{
        iteration: number
        timestamp: string
        message: string
        data?: unknown
      }>
      progressLog.push({
        ...log,
        timestamp: new Date().toISOString(),
      })

      await updateJob({ progress_log: progressLog })
    }

    try {
      // 更新状态为处理中
      await updateJob({
        status: 'processing',
        started_at: new Date().toISOString(),
      })

      const { model: deepModel, config: deepConfig } = getDeepModel(provider)
      let currentVersion = ''
      let totalTokens = 0
      const history: Array<{
        iteration: number
        version: string
        critique: string
        changes?: string
      }> = []

      // 迭代优化循环
      for (let iteration = 1; iteration <= maxIterations; iteration++) {
        await updateJob({ current_iteration: iteration })

        // 阶段1: 起草/修正
        await appendLog({
          iteration,
          message: iteration === 1 ? '正在分析并生成初始优化版本...' : '正在修正并改进...',
        })

        let draftResult: { text: string; usage?: { totalTokens?: number } }

        if (iteration === 1) {
          // 第一次迭代：分析并起草
          draftResult = await generateText({
            model: deepModel,
            system: DEEP_OPTIMIZE_DRAFT_SYSTEM,
            prompt: getDraftPrompt(content),
            maxTokens: deepConfig.maxTokens,
            temperature: deepConfig.temperature,
          })
        } else {
          // 后续迭代：基于批评修正
          const lastHistory = history[history.length - 1]
          draftResult = await generateText({
            model: deepModel,
            system: DEEP_OPTIMIZE_REFINE_SYSTEM,
            prompt: getRefinePrompt(content, currentVersion, lastHistory.critique),
            maxTokens: deepConfig.maxTokens,
            temperature: deepConfig.temperature,
          })
        }

        totalTokens += draftResult.usage?.totalTokens || 0

        // 解析生成的内容
        if (iteration === 1) {
          currentVersion = parseXMLContent(draftResult.text, 'optimized_prompt') || draftResult.text
        } else {
          const changes = parseXMLContent(draftResult.text, 'changes_made')
          currentVersion = parseXMLContent(draftResult.text, 'final_prompt') || currentVersion
          history[history.length - 1].changes = changes
        }

        await appendLog({
          iteration,
          message: '已生成优化版本',
          data: { version_length: currentVersion.length },
        })

        // 如果是最后一次迭代，跳过批评阶段
        if (iteration === maxIterations) {
          history.push({
            iteration,
            version: currentVersion,
            critique: '已达到最大迭代次数',
          })
          break
        }

        // 阶段2: 批评评审
        await appendLog({
          iteration,
          message: '正在进行批判评审...',
        })

        const critiqueResult = await generateText({
          model: deepModel,
          system: DEEP_OPTIMIZE_CRITIQUE_SYSTEM,
          prompt: getCritiquePrompt(currentVersion),
          maxTokens: 2048,
          temperature: 0.3,
        })

        totalTokens += critiqueResult.usage?.totalTokens || 0

        const critique = critiqueResult.text

        history.push({
          iteration,
          version: currentVersion,
          critique,
        })

        await appendLog({
          iteration,
          message: '批评评审完成',
          data: {
            severity: parseXMLContent(critique, 'severity'),
          },
        })

        // 检查是否需要继续迭代
        if (!shouldContinueIteration(critique)) {
          await appendLog({
            iteration,
            message: '质量已达标，提前结束迭代',
          })
          break
        }
      }

      // 更新使用量
      await UserService.incrementUsage(userId, 'deep', totalTokens)

      // 保存最终结果
      let promptId: string | null = null
      const { data: savedPrompt } = await supabase
        .from('prompts')
        .insert({
          user_id: userId,
          title: title || `深度优化 - ${new Date().toLocaleDateString('zh-CN')}`,
          original_content: content,
          optimized_content: currentVersion,
          model_used: provider,
          optimization_mode: 'deep',
          metadata: {
            iterations: history.length,
            tokens_used: totalTokens,
            history,
          },
        })
        .select('id')
        .single()

      if (savedPrompt) {
        promptId = savedPrompt.id
      }

      // 更新任务为完成状态
      await updateJob({
        status: 'completed',
        prompt_id: promptId,
        result: {
          original: content,
          optimized: currentVersion,
          iterations: history.length,
          history,
        },
        tokens_used: totalTokens,
        completed_at: new Date().toISOString(),
      })

      await appendLog({
        iteration: history.length,
        message: '深度优化完成！',
        data: { total_tokens: totalTokens },
      })

    } catch (error) {
      // 更新任务为失败状态
      await updateJob({
        status: 'failed',
        error_message: error instanceof Error ? error.message : '未知错误',
        completed_at: new Date().toISOString(),
      })

      await appendLog({
        iteration: 0,
        message: `任务失败: ${error instanceof Error ? error.message : '未知错误'}`,
      })
    }
  }

  /**
   * 获取任务状态
   */
  static async getJobStatus(jobId: string, userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('optimization_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`获取任务状态失败: ${error.message}`)
    }

    return data
  }
}

