'use client'

import { useState, useEffect } from 'react'
import { Key, Check, X, ExternalLink, Loader2, Trash2, RefreshCw, Star } from 'lucide-react'
import { toast } from 'sonner'

// =====================================================
// 类型定义
// =====================================================

interface ProviderInfo {
  provider: string
  name: string
  description: string
  keyUrl: string
  keyPrefix: string
  placeholder: string
}

interface ApiKeyInfo {
  provider: string
  is_configured: boolean
  is_active: boolean
  is_valid: boolean
  display_name: string | null
  last_validated_at: string | null
  masked_key: string
}

interface ApiKeysData {
  api_keys: ApiKeyInfo[]
  default_provider: string
  providers_info: ProviderInfo[]
}

// =====================================================
// API Key 配置页面
// =====================================================

export default function ApiKeysSettingsPage() {
  const [data, setData] = useState<ApiKeysData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [validating, setValidating] = useState<string | null>(null)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [newKeyValue, setNewKeyValue] = useState('')

  // 获取 API Keys 数据
  const fetchData = async () => {
    try {
      const response = await fetch('/api/settings/api-keys')
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      toast.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 保存 API Key
  const handleSaveKey = async (provider: string) => {
    if (!newKeyValue.trim()) {
      toast.error('请输入 API Key')
      return
    }

    setSaving(provider)
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key: newKeyValue,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('API Key 保存成功')
        setEditingProvider(null)
        setNewKeyValue('')
        fetchData()
      } else {
        toast.error(result.error || '保存失败')
      }
    } catch (error) {
      toast.error('保存失败')
    } finally {
      setSaving(null)
    }
  }

  // 删除 API Key
  const handleDeleteKey = async (provider: string) => {
    if (!confirm('确定要删除这个 API Key 吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/settings/api-keys/${provider}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('API Key 已删除')
        fetchData()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      toast.error('删除失败')
    }
  }

  // 验证 API Key
  const handleValidateKey = async (provider: string) => {
    setValidating(provider)
    try {
      const response = await fetch(`/api/settings/api-keys/${provider}`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.data?.valid) {
        toast.success('API Key 验证成功')
      } else {
        toast.error(result.data?.message || 'API Key 验证失败')
      }
      fetchData()
    } catch (error) {
      toast.error('验证失败')
    } finally {
      setValidating(null)
    }
  }

  // 设置默认 Provider
  const handleSetDefault = async (provider: string) => {
    try {
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('默认 Provider 已更新')
        fetchData()
      } else {
        toast.error(result.error || '设置失败')
      }
    } catch (error) {
      toast.error('设置失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">加载失败，请刷新页面重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Key className="h-5 w-5 text-violet-400" />
          API Key 配置
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          配置您的 AI 服务 API Key，用于提示词优化功能
        </p>
      </div>

      {/* 提示信息 */}
      <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
        <div className="flex gap-3">
          <Star className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-violet-300 font-medium">推荐使用 OpenRouter</p>
            <p className="text-sm text-slate-400 mt-1">
              OpenRouter 是一个 AI 模型聚合平台，只需一个 API Key 即可访问 OpenAI、Claude、Gemini 等多个模型。
              按量付费，无月费。
            </p>
          </div>
        </div>
      </div>

      {/* Provider 列表 */}
      <div className="space-y-4">
        {data.providers_info.map((providerInfo) => {
          const keyInfo = data.api_keys.find(k => k.provider === providerInfo.provider)
          const isConfigured = keyInfo?.is_configured
          const isDefault = data.default_provider === providerInfo.provider
          const isEditing = editingProvider === providerInfo.provider
          const isSaving = saving === providerInfo.provider
          const isValidating = validating === providerInfo.provider

          return (
            <div
              key={providerInfo.provider}
              className={`rounded-xl border p-5 transition-all ${
                isDefault
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-slate-700 bg-slate-800/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{providerInfo.name}</h3>
                    {isDefault && (
                      <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300">
                        默认
                      </span>
                    )}
                    {isConfigured && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        keyInfo?.is_valid
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {keyInfo?.is_valid ? (
                          <>
                            <Check className="h-3 w-3" />
                            已验证
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" />
                            无效
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{providerInfo.description}</p>
                  
                  {/* 获取 Key 链接 */}
                  <a
                    href={providerInfo.keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                  >
                    获取 API Key
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  {isConfigured && !isEditing && (
                    <>
                      <button
                        onClick={() => handleValidateKey(providerInfo.provider)}
                        disabled={isValidating}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
                        title="验证 Key"
                      >
                        {isValidating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteKey(providerInfo.provider)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="删除 Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {!isDefault && (
                        <button
                          onClick={() => handleSetDefault(providerInfo.provider)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-violet-400 hover:bg-violet-500/20 transition-colors"
                        >
                          设为默认
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 已配置的 Key 显示 */}
              {isConfigured && !isEditing && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 rounded-lg bg-slate-900/50 px-4 py-2.5 font-mono text-sm text-slate-300">
                    {keyInfo?.masked_key}
                  </div>
                  <button
                    onClick={() => {
                      setEditingProvider(providerInfo.provider)
                      setNewKeyValue('')
                    }}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    更换
                  </button>
                </div>
              )}

              {/* 输入新 Key */}
              {(!isConfigured || isEditing) && (
                <div className="mt-4 space-y-3">
                  <input
                    type="password"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder={providerInfo.placeholder}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveKey(providerInfo.provider)}
                      disabled={isSaving || !newKeyValue.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          验证中...
                        </>
                      ) : (
                        '保存'
                      )}
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => {
                          setEditingProvider(null)
                          setNewKeyValue('')
                        }}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        取消
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 安全提示 */}
      <div className="rounded-xl bg-slate-800/50 p-4 text-sm text-slate-400">
        <p className="font-medium text-slate-300 mb-1">🔒 安全说明</p>
        <ul className="list-disc list-inside space-y-1">
          <li>您的 API Key 会加密存储，只有您可以使用</li>
          <li>我们不会将您的 Key 用于任何其他用途</li>
          <li>建议为每个应用创建独立的 API Key</li>
        </ul>
      </div>
    </div>
  )
}

