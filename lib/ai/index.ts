// =====================================================
// AI 模块统一导出
// =====================================================

// Provider 配置
export {
  openai,
  anthropic,
  getModel,
  getQuickModel,
  getDeepModel,
  getEvalModel,
  QUICK_MODEL_CONFIG,
  DEEP_MODEL_CONFIG,
  EVAL_MODEL_CONFIG,
  DEFAULT_PROVIDER,
} from './providers'

export type { AIProvider, ModelConfig } from './providers'

// 快速优化提示词
export {
  QUICK_OPTIMIZE_SYSTEM_PROMPT,
  getQuickOptimizePrompt,
} from './prompts/quick-optimize'

// 深度优化提示词
export {
  DEEP_OPTIMIZE_DRAFT_SYSTEM,
  DEEP_OPTIMIZE_CRITIQUE_SYSTEM,
  DEEP_OPTIMIZE_REFINE_SYSTEM,
  getDraftPrompt,
  getCritiquePrompt,
  getRefinePrompt,
  parseXMLContent,
  shouldContinueIteration,
} from './prompts/deep-optimize'

// 评估提示词
export {
  EVALUATE_SYSTEM_PROMPT,
  getEvaluatePrompt,
  parseEvaluationResult,
} from './prompts/evaluate'

