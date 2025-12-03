// =====================================================
// LLM-as-a-Judge 评估 - 元提示词模板
// 基于研究报告2中的COSTAR评分维度
// =====================================================

/**
 * 评估系统提示词
 */
export const EVALUATE_SYSTEM_PROMPT = `你是一位专业的AI提示词质量评估专家。你需要对提示词进行客观、全面的评估。

## 评分维度及权重

1. **清晰性 (Clarity) - 30%**
   - 指令是否无歧义
   - 逻辑是否清晰
   - 语言是否精确

2. **约束性 (Constraint) - 25%**
   - 是否明确输出格式
   - 是否有长度/风格限制
   - 边界条件是否清晰

3. **上下文 (Context) - 25%**
   - 背景信息是否充分
   - 角色定义是否明确
   - 目标受众是否清晰

4. **格式化 (Format) - 20%**
   - 结构是否清晰
   - 是否使用了有效的格式化
   - 是否易于阅读

## 评分标准

- 0-20: 差 - 存在严重问题
- 21-40: 较差 - 问题较多
- 41-60: 一般 - 基本可用
- 61-80: 良好 - 质量较高
- 81-100: 优秀 - 专业水准

## 输出要求

必须严格按照JSON格式输出评估结果。`

/**
 * 评估提示词模板
 */
export function getEvaluatePrompt(promptToEvaluate: string): string {
  return `请评估以下提示词的质量：

<prompt>
${promptToEvaluate}
</prompt>

请严格按照以下JSON格式输出评估结果：

\`\`\`json
{
  "clarity_score": <0-100的整数>,
  "constraint_score": <0-100的整数>,
  "context_score": <0-100的整数>,
  "format_score": <0-100的整数>,
  "feedback": {
    "strengths": ["优点1", "优点2", ...],
    "weaknesses": ["不足1", "不足2", ...],
    "suggestions": ["建议1", "建议2", ...]
  }
}
\`\`\`

请确保：
1. 每个分数都在0-100之间
2. 评价要具体、有建设性
3. 优点、不足、建议各至少提供2条`
}

/**
 * 解析评估结果JSON
 */
export function parseEvaluationResult(response: string): {
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
} | null {
  try {
    // 尝试从响应中提取JSON
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : response

    const result = JSON.parse(jsonStr)

    // 验证必要字段
    if (
      typeof result.clarity_score !== 'number' ||
      typeof result.constraint_score !== 'number' ||
      typeof result.context_score !== 'number' ||
      typeof result.format_score !== 'number'
    ) {
      return null
    }

    // 计算总分（加权平均）
    const overall_score = 
      result.clarity_score * 0.30 +
      result.constraint_score * 0.25 +
      result.context_score * 0.25 +
      result.format_score * 0.20

    return {
      clarity_score: Math.round(result.clarity_score),
      constraint_score: Math.round(result.constraint_score),
      context_score: Math.round(result.context_score),
      format_score: Math.round(result.format_score),
      overall_score: Math.round(overall_score * 100) / 100,
      feedback: {
        strengths: result.feedback?.strengths || [],
        weaknesses: result.feedback?.weaknesses || [],
        suggestions: result.feedback?.suggestions || [],
      },
    }
  } catch {
    return null
  }
}

