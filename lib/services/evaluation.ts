import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import {
  getEvalModel,
  EVALUATE_SYSTEM_PROMPT,
  getEvaluatePrompt,
  parseEvaluationResult,
  DEFAULT_PROVIDER,
} from '@/lib/ai'
import type { AIProvider } from '@/lib/ai'

// =====================================================
// 类型定义
// =====================================================

export interface EvaluationResult {
  clarity_score: number
  constraint_score: number
  context_score: number
  format_score: number
  overall_score: number
  feedback: {
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
  }
}

export interface EvaluateOptions {
  content: string
  promptId?: string
  provider?: AIProvider
  saveResult?: boolean
}

// =====================================================
// EvaluationService - LLM评估服务
// =====================================================

export class EvaluationService {
  /**
   * 评估提示词质量
   */
  static async evaluate(options: EvaluateOptions): Promise<EvaluationResult> {
    const { content, promptId, provider = DEFAULT_PROVIDER, saveResult = true } = options
    const { model, config } = getEvalModel(provider)

    // 调用LLM进行评估
    const result = await generateText({
      model,
      system: EVALUATE_SYSTEM_PROMPT,
      prompt: getEvaluatePrompt(content),
      maxTokens: config.maxTokens,
      temperature: config.temperature,
    })

    // 解析评估结果
    const evaluation = parseEvaluationResult(result.text)

    if (!evaluation) {
      throw new Error('评估结果解析失败')
    }

    // 保存评估结果
    if (saveResult && promptId) {
      const supabase = await createClient()

      // 获取当前版本号
      const { data: existingEvals } = await supabase
        .from('evaluations')
        .select('version')
        .eq('prompt_id', promptId)
        .order('version', { ascending: false })
        .limit(1)

      const nextVersion = existingEvals && existingEvals.length > 0
        ? existingEvals[0].version + 1
        : 1

      await supabase.from('evaluations').insert({
        prompt_id: promptId,
        version: nextVersion,
        clarity_score: evaluation.clarity_score,
        constraint_score: evaluation.constraint_score,
        context_score: evaluation.context_score,
        format_score: evaluation.format_score,
        feedback: evaluation.feedback,
        suggestions: evaluation.feedback.suggestions,
        evaluator_model: `${provider}/${config.model}`,
        raw_response: { text: result.text },
      })

      // 更新prompt的分数
      const normalizedScore = evaluation.overall_score / 20 // 转换为0-5分制
      await supabase
        .from('prompts')
        .update({ score: normalizedScore })
        .eq('id', promptId)
    }

    return evaluation
  }

  /**
   * 获取提示词的评估历史
   */
  static async getHistory(promptId: string): Promise<Array<{
    id: string
    version: number
    overall_score: number
    clarity_score: number
    constraint_score: number
    context_score: number
    format_score: number
    feedback: Record<string, unknown>
    evaluator_model: string
    created_at: string
  }>> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('prompt_id', promptId)
      .order('version', { ascending: false })

    if (error) {
      throw new Error(`获取评估历史失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 比较两个提示词的评估结果
   */
  static async compare(
    content1: string,
    content2: string,
    provider: AIProvider = DEFAULT_PROVIDER
  ): Promise<{
    prompt1: EvaluationResult
    prompt2: EvaluationResult
    comparison: {
      winner: 1 | 2 | 'tie'
      score_difference: number
      analysis: string
    }
  }> {
    // 并行评估两个提示词
    const [eval1, eval2] = await Promise.all([
      this.evaluate({ content: content1, provider, saveResult: false }),
      this.evaluate({ content: content2, provider, saveResult: false }),
    ])

    const scoreDiff = eval1.overall_score - eval2.overall_score
    let winner: 1 | 2 | 'tie' = 'tie'
    
    if (scoreDiff > 5) {
      winner = 1
    } else if (scoreDiff < -5) {
      winner = 2
    }

    // 生成比较分析
    const analysis = this.generateComparisonAnalysis(eval1, eval2, winner)

    return {
      prompt1: eval1,
      prompt2: eval2,
      comparison: {
        winner,
        score_difference: Math.abs(scoreDiff),
        analysis,
      },
    }
  }

  /**
   * 生成比较分析文本
   */
  private static generateComparisonAnalysis(
    eval1: EvaluationResult,
    eval2: EvaluationResult,
    winner: 1 | 2 | 'tie'
  ): string {
    const dimensions = [
      { name: '清晰性', key: 'clarity_score' as const },
      { name: '约束性', key: 'constraint_score' as const },
      { name: '上下文', key: 'context_score' as const },
      { name: '格式化', key: 'format_score' as const },
    ]

    const betterDimensions: string[] = []
    const worseDimensions: string[] = []

    dimensions.forEach(({ name, key }) => {
      const diff = eval1[key] - eval2[key]
      if (diff > 10) {
        betterDimensions.push(`${name}(+${diff}分)`)
      } else if (diff < -10) {
        worseDimensions.push(`${name}(${diff}分)`)
      }
    })

    let analysis = ''
    
    if (winner === 1) {
      analysis = `提示词1整体表现更优，总分高出${(eval1.overall_score - eval2.overall_score).toFixed(1)}分。`
    } else if (winner === 2) {
      analysis = `提示词2整体表现更优，总分高出${(eval2.overall_score - eval1.overall_score).toFixed(1)}分。`
    } else {
      analysis = '两个提示词表现相近，差异不显著。'
    }

    if (betterDimensions.length > 0) {
      analysis += ` 提示词1在以下方面表现较好：${betterDimensions.join('、')}。`
    }

    if (worseDimensions.length > 0) {
      analysis += ` 提示词1在以下方面需要改进：${worseDimensions.join('、')}。`
    }

    return analysis
  }
}

