import { createClient } from '@/lib/supabase/server'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

// =====================================================
// 类型定义
// =====================================================

export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'openrouter'

export interface UserApiKey {
  id: string
  user_id: string
  provider: AIProviderType
  display_name: string | null
  is_active: boolean
  is_valid: boolean
  last_validated_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ApiKeyInfo {
  provider: AIProviderType
  is_configured: boolean
  is_active: boolean
  is_valid: boolean
  display_name: string | null
  last_validated_at: string | null
  masked_key: string
}

export interface SaveApiKeyInput {
  provider: AIProviderType
  apiKey: string
  displayName?: string
}

// =====================================================
// 加密配置
// =====================================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

/**
 * 获取加密密钥
 * 使用环境变量中的密钥派生
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-secret-key-change-in-production'
  // 使用 scrypt 派生 32 字节密钥
  return scryptSync(secret, 'promto-salt', 32)
}

/**
 * 加密 API Key
 */
function encryptApiKey(plainText: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv)
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // 格式: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * 解密 API Key
 */
function decryptApiKey(encryptedText: string): string {
  const key = getEncryptionKey()
  const parts = encryptedText.split(':')
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }
  
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * 脱敏显示 API Key
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '••••••••'
  }
  return apiKey.substring(0, 4) + '••••••••' + apiKey.substring(apiKey.length - 4)
}

// =====================================================
// Provider 配置信息
// =====================================================

export const PROVIDER_INFO: Record<AIProviderType, {
  name: string
  description: string
  keyUrl: string
  keyPrefix: string
  placeholder: string
}> = {
  openrouter: {
    name: 'OpenRouter',
    description: '推荐！一个 Key 访问所有主流模型',
    keyUrl: 'https://openrouter.ai/keys',
    keyPrefix: 'sk-or-',
    placeholder: 'sk-or-v1-xxxxxxxx',
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini 等模型',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPrefix: 'sk-',
    placeholder: 'sk-xxxxxxxx',
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Haiku 等模型',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPrefix: 'sk-ant-',
    placeholder: 'sk-ant-xxxxxxxx',
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini 2.0, 1.5 Pro/Flash 等模型',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AI',
    placeholder: 'AIzaxxxxxxxx',
  },
}

// =====================================================
// ApiKeyService - API Key 管理服务
// =====================================================

export class ApiKeyService {
  /**
   * 保存用户的 API Key
   */
  static async saveApiKey(
    userId: string,
    input: SaveApiKeyInput
  ): Promise<UserApiKey> {
    const supabase = await createClient()
    const { provider, apiKey, displayName } = input

    // 加密 API Key
    const encryptedKey = encryptApiKey(apiKey)

    // 使用 upsert 插入或更新
    const { data, error } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: userId,
        provider,
        api_key_encrypted: encryptedKey,
        display_name: displayName || PROVIDER_INFO[provider].name,
        is_active: true,
        is_valid: true, // 假设新保存的 key 是有效的
        last_validated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`保存 API Key 失败: ${error.message}`)
    }

    return data as UserApiKey
  }

  /**
   * 获取用户的 API Key（解密）
   */
  static async getApiKey(
    userId: string,
    provider: AIProviderType
  ): Promise<string | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('api_key_encrypted')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 未找到
      }
      throw new Error(`获取 API Key 失败: ${error.message}`)
    }

    try {
      return decryptApiKey(data.api_key_encrypted)
    } catch {
      console.error('API Key 解密失败')
      return null
    }
  }

  /**
   * 获取用户所有配置的 API Keys 信息（脱敏）
   */
  static async getUserApiKeysInfo(userId: string): Promise<ApiKeyInfo[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('provider, is_active, is_valid, display_name, last_validated_at, api_key_encrypted')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`获取 API Keys 信息失败: ${error.message}`)
    }

    // 生成所有 provider 的状态
    const configuredProviders = new Set((data || []).map(k => k.provider))
    const allProviders: AIProviderType[] = ['openrouter', 'openai', 'anthropic', 'gemini']

    return allProviders.map(provider => {
      const keyData = data?.find(k => k.provider === provider)
      
      if (keyData) {
        // 解密后脱敏
        let maskedKey = '••••••••'
        try {
          const decrypted = decryptApiKey(keyData.api_key_encrypted)
          maskedKey = maskApiKey(decrypted)
        } catch {
          // 解密失败，使用默认脱敏
        }

        return {
          provider,
          is_configured: true,
          is_active: keyData.is_active,
          is_valid: keyData.is_valid,
          display_name: keyData.display_name,
          last_validated_at: keyData.last_validated_at,
          masked_key: maskedKey,
        }
      }

      return {
        provider,
        is_configured: false,
        is_active: false,
        is_valid: false,
        display_name: null,
        last_validated_at: null,
        masked_key: '',
      }
    })
  }

  /**
   * 删除用户的 API Key
   */
  static async deleteApiKey(
    userId: string,
    provider: AIProviderType
  ): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider)

    if (error) {
      throw new Error(`删除 API Key 失败: ${error.message}`)
    }
  }

  /**
   * 验证 API Key 有效性
   */
  static async validateApiKey(
    provider: AIProviderType,
    apiKey: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      switch (provider) {
        case 'openai':
          return await this.validateOpenAIKey(apiKey)
        case 'anthropic':
          return await this.validateAnthropicKey(apiKey)
        case 'gemini':
          return await this.validateGeminiKey(apiKey)
        case 'openrouter':
          return await this.validateOpenRouterKey(apiKey)
        default:
          return { valid: false, error: '不支持的 Provider' }
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : '验证失败',
      }
    }
  }

  /**
   * 验证 OpenAI API Key
   */
  private static async validateOpenAIKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return { valid: true }
    }

    const error = await response.json().catch(() => ({}))
    return {
      valid: false,
      error: error.error?.message || `HTTP ${response.status}`,
    }
  }

  /**
   * 验证 Anthropic API Key
   */
  private static async validateAnthropicKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    // Anthropic 没有专门的验证端点，尝试获取模型信息
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })

    // 200 或 400（请求问题）都说明 key 有效
    if (response.ok || response.status === 400) {
      return { valid: true }
    }

    if (response.status === 401) {
      return { valid: false, error: 'API Key 无效' }
    }

    return { valid: false, error: `HTTP ${response.status}` }
  }

  /**
   * 验证 Gemini API Key
   */
  private static async validateGeminiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )

    if (response.ok) {
      return { valid: true }
    }

    const error = await response.json().catch(() => ({}))
    return {
      valid: false,
      error: error.error?.message || `HTTP ${response.status}`,
    }
  }

  /**
   * 验证 OpenRouter API Key
   */
  private static async validateOpenRouterKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return { valid: true }
    }

    return {
      valid: false,
      error: response.status === 401 ? 'API Key 无效' : `HTTP ${response.status}`,
    }
  }

  /**
   * 更新 API Key 验证状态
   */
  static async updateValidationStatus(
    userId: string,
    provider: AIProviderType,
    isValid: boolean
  ): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('user_api_keys')
      .update({
        is_valid: isValid,
        last_validated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('provider', provider)
  }

  /**
   * 获取用户默认的 AI Provider
   */
  static async getDefaultProvider(userId: string): Promise<AIProviderType> {
    const supabase = await createClient()

    const { data } = await supabase
      .from('profiles')
      .select('default_ai_provider')
      .eq('id', userId)
      .single()

    return (data?.default_ai_provider as AIProviderType) || 'openrouter'
  }

  /**
   * 设置用户默认的 AI Provider
   */
  static async setDefaultProvider(
    userId: string,
    provider: AIProviderType
  ): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ default_ai_provider: provider })
      .eq('id', userId)

    if (error) {
      throw new Error(`设置默认 Provider 失败: ${error.message}`)
    }
  }
}

