// =====================================================
// 深度优化 - 元提示词模板 (Reflexion Loop)
// 基于研究报告2中的迭代式反思循环
// =====================================================

/**
 * 深度优化系统提示词 - 第一阶段：分析与起草
 */
export const DEEP_OPTIMIZE_DRAFT_SYSTEM = `你是一位资深的AI提示词架构师，专精于将模糊的用户意图转化为精确、高效的提示词。

## 你的分析框架 (COSTAR)

1. **Context (背景)**: 识别并补充缺失的背景信息
2. **Objective (目标)**: 提取核心目标，用动词开头表达
3. **Style (风格)**: 确定适合的输出风格
4. **Tone (语调)**: 设定合适的语调
5. **Audience (受众)**: 明确目标受众
6. **Response (格式)**: 指定最佳输出格式

## 优化技巧

- 使用XML标签分隔不同类型的内容
- 添加明确的约束条件
- 包含错误处理指引
- 考虑边缘情况`

/**
 * 分析与起草提示词
 */
export function getDraftPrompt(originalPrompt: string): string {
  return `请分析并优化以下提示词：

<original_prompt>
${originalPrompt}
</original_prompt>

## 任务

1. 首先，简要分析原始提示词的问题（2-3句话）
2. 然后，按照COSTAR框架输出优化后的提示词

## 输出格式

<analysis>
[简要分析]
</analysis>

<optimized_prompt>
[优化后的完整提示词]
</optimized_prompt>`
}

/**
 * 深度优化系统提示词 - 第二阶段：批判评审
 */
export const DEEP_OPTIMIZE_CRITIQUE_SYSTEM = `你是一位严格的提示词质量评审专家。你的任务是对提示词进行批判性审查，找出潜在的问题和改进空间。

## 评审维度

1. **清晰性**: 指令是否无歧义？
2. **完整性**: 是否覆盖了所有必要的方面？
3. **约束性**: 是否有明确的边界和限制？
4. **可执行性**: AI是否能准确执行？
5. **鲁棒性**: 是否考虑了边缘情况？

## 批判原则

- 要具体指出问题，不要泛泛而谈
- 每个问题都要提供改进建议
- 既要指出不足，也要肯定优点`

/**
 * 批判评审提示词
 */
export function getCritiquePrompt(optimizedPrompt: string): string {
  return `请严格评审以下优化后的提示词：

<prompt_to_review>
${optimizedPrompt}
</prompt_to_review>

## 输出格式

<strengths>
[列出2-3个优点]
</strengths>

<weaknesses>
[列出具体的问题，每个问题一行]
</weaknesses>

<suggestions>
[针对每个问题的具体改进建议]
</suggestions>

<severity>
[整体问题严重程度: low/medium/high]
</severity>`
}

/**
 * 深度优化系统提示词 - 第三阶段：修正完善
 */
export const DEEP_OPTIMIZE_REFINE_SYSTEM = `你是一位提示词优化大师。基于批判反馈，你需要修正和完善提示词。

## 修正原则

1. 针对每个指出的问题进行修正
2. 保留原有的优点
3. 不要过度修改，保持简洁
4. 确保修正后的版本确实解决了问题`

/**
 * 修正完善提示词
 */
export function getRefinePrompt(
  originalPrompt: string,
  currentVersion: string,
  critique: string
): string {
  return `请基于批判反馈修正提示词：

<original_prompt>
${originalPrompt}
</original_prompt>

<current_version>
${currentVersion}
</current_version>

<critique>
${critique}
</critique>

## 任务

1. 仔细阅读批判反馈中的问题和建议
2. 逐一解决提出的问题
3. 保留当前版本的优点
4. 输出修正后的最终版本

## 输出格式

<changes_made>
[简要说明做了哪些修改]
</changes_made>

<final_prompt>
[修正后的完整提示词]
</final_prompt>`
}

/**
 * 解析深度优化响应中的XML内容
 */
export function parseXMLContent(response: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i')
  const match = response.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * 检查是否需要继续迭代
 */
export function shouldContinueIteration(critique: string): boolean {
  const severity = parseXMLContent(critique, 'severity').toLowerCase()
  return severity === 'high' || severity === 'medium'
}

