"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings,
  Palette,
  Bell,
  Keyboard,
  AlertTriangle,
  Moon,
  Sun,
  Globe,
  Sparkles,
  Save,
  Clock,
  Zap,
  Check,
  RefreshCw,
  BellOff,
  Download,
  Trash2,
  LogOut,
  Shield,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Eye,
  Database,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/lib/i18n/language-context"
import { useModelConfig } from "@/lib/contexts/model-config-context"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Locale } from "@/lib/i18n/translations"

// =====================================================
// 类型定义
// =====================================================

interface SettingsTab {
  id: string
  label: string
  labelZh: string
  icon: typeof Settings
  description: string
  descriptionZh: string
}

// =====================================================
// 配置
// =====================================================

const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'general',
    label: 'General',
    labelZh: '通用设置',
    icon: Settings,
    description: 'Optimization preferences and defaults',
    descriptionZh: '优化偏好和默认设置',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    labelZh: '外观设置',
    icon: Palette,
    description: 'Theme, colors, and language',
    descriptionZh: '主题、颜色和语言',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    labelZh: '通知设置',
    icon: Bell,
    description: 'Email and push notifications',
    descriptionZh: '邮件和推送通知',
  },
  {
    id: 'shortcuts',
    label: 'Shortcuts',
    labelZh: '快捷键',
    icon: Keyboard,
    description: 'Keyboard shortcuts configuration',
    descriptionZh: '键盘快捷键配置',
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    labelZh: '危险操作',
    icon: AlertTriangle,
    description: 'Account deletion and data export',
    descriptionZh: '账号删除和数据导出',
  },
]

// =====================================================
// 动画变体
// =====================================================

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const contentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

// =====================================================
// 组件
// =====================================================

export default function SettingsPage() {
  const { t, locale, setLocale, language } = useLanguage()
  const { settings: modelSettings } = useModelConfig()

  // 当前选中的标签
  const [activeTab, setActiveTab] = useState('general')

  // 通用设置
  const [defaultOptimizeMode, setDefaultOptimizeMode] = useState<'quick' | 'deep'>('quick')
  const [autoSave, setAutoSave] = useState(true)
  const [autoSaveInterval, setAutoSaveInterval] = useState(30)
  const [historyRetentionDays, setHistoryRetentionDays] = useState(30)
  const [maxHistoryItems, setMaxHistoryItems] = useState(100)
  const [showPreview, setShowPreview] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  // 外观设置
  const [darkMode, setDarkMode] = useState(true)
  const [themeAccent, setThemeAccent] = useState('purple')
  const [fontSize, setFontSize] = useState('medium')

  // 通知设置
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [optimizationComplete, setOptimizationComplete] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [teamUpdates, setTeamUpdates] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [doNotDisturb, setDoNotDisturb] = useState(false)
  const [dndStartTime, setDndStartTime] = useState('22:00')
  const [dndEndTime, setDndEndTime] = useState('08:00')

  // 快捷键
  const [shortcuts, setShortcuts] = useState({
    optimize: 'Ctrl+Enter',
    save: 'Ctrl+S',
    saveTemplate: 'Ctrl+Shift+S',
    export: 'Ctrl+E',
    help: 'Ctrl+/',
    newPrompt: 'Ctrl+N',
    switchMode: 'Ctrl+M',
  })

  // 状态
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showClearCacheModal, setShowClearCacheModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // 强调色选项
  const accentColors = [
    { id: 'purple', color: 'bg-purple-500', ring: 'ring-purple-500' },
    { id: 'blue', color: 'bg-blue-500', ring: 'ring-blue-500' },
    { id: 'green', color: 'bg-green-500', ring: 'ring-green-500' },
    { id: 'orange', color: 'bg-orange-500', ring: 'ring-orange-500' },
    { id: 'pink', color: 'bg-pink-500', ring: 'ring-pink-500' },
    { id: 'cyan', color: 'bg-cyan-500', ring: 'ring-cyan-500' },
    { id: 'rose', color: 'bg-rose-500', ring: 'ring-rose-500' },
    { id: 'indigo', color: 'bg-indigo-500', ring: 'ring-indigo-500' },
  ]

  // 字体大小选项
  const fontSizes = [
    { id: 'small', label: language === 'zh' ? '小' : 'Small' },
    { id: 'medium', label: language === 'zh' ? '中' : 'Medium' },
    { id: 'large', label: language === 'zh' ? '大' : 'Large' },
  ]

  // 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('promto-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode)
        if (parsed.themeAccent) setThemeAccent(parsed.themeAccent)
        if (parsed.fontSize) setFontSize(parsed.fontSize)
        if (parsed.defaultOptimizeMode) setDefaultOptimizeMode(parsed.defaultOptimizeMode)
        if (parsed.autoSave !== undefined) setAutoSave(parsed.autoSave)
        if (parsed.autoSaveInterval) setAutoSaveInterval(parsed.autoSaveInterval)
        if (parsed.historyRetentionDays) setHistoryRetentionDays(parsed.historyRetentionDays)
        if (parsed.maxHistoryItems) setMaxHistoryItems(parsed.maxHistoryItems)
        if (parsed.showPreview !== undefined) setShowPreview(parsed.showPreview)
        if (parsed.compactMode !== undefined) setCompactMode(parsed.compactMode)
        if (parsed.emailNotifications !== undefined) setEmailNotifications(parsed.emailNotifications)
        if (parsed.optimizationComplete !== undefined) setOptimizationComplete(parsed.optimizationComplete)
        if (parsed.weeklyDigest !== undefined) setWeeklyDigest(parsed.weeklyDigest)
        if (parsed.teamUpdates !== undefined) setTeamUpdates(parsed.teamUpdates)
        if (parsed.pushNotifications !== undefined) setPushNotifications(parsed.pushNotifications)
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled)
        if (parsed.doNotDisturb !== undefined) setDoNotDisturb(parsed.doNotDisturb)
        if (parsed.dndStartTime) setDndStartTime(parsed.dndStartTime)
        if (parsed.dndEndTime) setDndEndTime(parsed.dndEndTime)
        if (parsed.shortcuts) setShortcuts({ ...shortcuts, ...parsed.shortcuts })
      } catch (e) {
        console.error('Failed to parse saved settings:', e)
      }
    }
  }, [])

  // 保存设置
  const handleSaveSettings = async () => {
    setIsSaving(true)
    const settings = {
      darkMode,
      themeAccent,
      fontSize,
      defaultOptimizeMode,
      autoSave,
      autoSaveInterval,
      historyRetentionDays,
      maxHistoryItems,
      showPreview,
      compactMode,
      emailNotifications,
      optimizationComplete,
      weeklyDigest,
      teamUpdates,
      pushNotifications,
      soundEnabled,
      doNotDisturb,
      dndStartTime,
      dndEndTime,
      shortcuts,
      locale,
    }
    localStorage.setItem('promto-settings', JSON.stringify(settings))
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
    setSaved(true)
    toast.success(language === 'zh' ? '设置已保存' : 'Settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  // 删除账号
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDeleting(false)
    setShowDeleteModal(false)
    toast.success(language === 'zh' ? '账号删除请求已提交' : 'Account deletion request submitted')
  }

  // 导出数据
  const handleExportData = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExporting(false)
    setShowExportModal(false)
    toast.success(language === 'zh' ? '数据导出已开始，完成后将发送至您的邮箱' : 'Data export started, will be sent to your email when complete')
  }

  // 清除缓存
  const handleClearCache = async () => {
    localStorage.removeItem('promto-model-config')
    localStorage.removeItem('promto-history-cache')
    toast.success(language === 'zh' ? '缓存已清除' : 'Cache cleared')
    setShowClearCacheModal(false)
  }

  // 渲染通用设置
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* 优化偏好 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '优化偏好' : 'Optimization Preferences'}
          </h3>
        </div>

        <div className="space-y-5">
          {/* 默认模型 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">{t.dashboard.settings.defaultModel}</p>
                <p className="text-xs text-foreground-secondary">{t.dashboard.settings.defaultModelDesc}</p>
              </div>
            </div>
            <span className="text-sm text-foreground-muted bg-surface px-3 py-1.5 rounded-lg font-mono text-xs">
              {modelSettings.model.split('/').pop() || modelSettings.model}
            </span>
          </div>

          {/* 默认优化模式 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '默认优化模式' : 'Default Optimize Mode'}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {language === 'zh' ? '新建优化时默认使用的模式' : 'Default mode for new optimizations'}
                </p>
              </div>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                onClick={() => setDefaultOptimizeMode('quick')}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  defaultOptimizeMode === 'quick'
                    ? "bg-primary text-white"
                    : "bg-surface text-foreground-muted hover:bg-surface-elevated"
                )}
              >
                {language === 'zh' ? '快速' : 'Quick'}
              </button>
              <button
                onClick={() => setDefaultOptimizeMode('deep')}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  defaultOptimizeMode === 'deep'
                    ? "bg-primary text-white"
                    : "bg-surface text-foreground-muted hover:bg-surface-elevated"
                )}
              >
                {language === 'zh' ? '深度' : 'Deep'}
              </button>
            </div>
          </div>

          {/* 自动保存 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '自动保存' : 'Auto Save'}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {language === 'zh' ? '自动保存编辑中的内容' : 'Automatically save work in progress'}
                </p>
              </div>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          {autoSave && (
            <div className="pl-8 pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-foreground-muted">
                  {language === 'zh' ? '保存间隔' : 'Save interval'}
                </span>
                <span className="text-xs text-foreground-muted">{autoSaveInterval}s</span>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="10"
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                className="w-full h-1.5 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          )}

          {/* 预览 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '实时预览' : 'Live Preview'}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {language === 'zh' ? '编辑时实时显示优化结果预览' : 'Show optimization preview while editing'}
                </p>
              </div>
            </div>
            <Switch checked={showPreview} onCheckedChange={setShowPreview} />
          </div>

          {/* 紧凑模式 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '紧凑模式' : 'Compact Mode'}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {language === 'zh' ? '减少界面间距，显示更多内容' : 'Reduce spacing to show more content'}
                </p>
              </div>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </div>
        </div>
      </div>

      {/* 历史记录设置 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '历史记录' : 'History Settings'}
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground">
                {language === 'zh' ? '保留天数' : 'Retention Days'}
              </span>
              <span className="text-sm text-foreground-muted font-mono">{historyRetentionDays} {language === 'zh' ? '天' : 'days'}</span>
            </div>
            <input
              type="range"
              min="7"
              max="365"
              step="7"
              value={historyRetentionDays}
              onChange={(e) => setHistoryRetentionDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground">
                {language === 'zh' ? '最大记录数' : 'Max Items'}
              </span>
              <span className="text-sm text-foreground-muted font-mono">{maxHistoryItems}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={maxHistoryItems}
              onChange={(e) => setMaxHistoryItems(parseInt(e.target.value))}
              className="w-full h-1.5 bg-surface rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染外观设置
  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '主题设置' : 'Theme Settings'}
          </h3>
        </div>

        <div className="space-y-5">
          {/* 深色模式 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-warning" />}
              <div>
                <p className="font-medium text-foreground text-sm">{t.dashboard.settings.darkMode}</p>
                <p className="text-xs text-foreground-secondary">{t.dashboard.settings.darkModeDesc}</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          {/* 强调色 */}
          <div>
            <p className="font-medium text-foreground text-sm mb-3">
              {language === 'zh' ? '强调色' : 'Accent Color'}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setThemeAccent(color.id)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    color.color,
                    themeAccent === color.id ? `ring-2 ring-offset-2 ring-offset-background ${color.ring} scale-110` : "hover:scale-105"
                  )}
                >
                  {themeAccent === color.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 字体大小 */}
          <div>
            <p className="font-medium text-foreground text-sm mb-3">
              {language === 'zh' ? '字体大小' : 'Font Size'}
            </p>
            <div className="flex rounded-lg overflow-hidden border border-border">
              {fontSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setFontSize(size.id)}
                  className={cn(
                    "flex-1 px-4 py-2 text-sm transition-colors",
                    fontSize === size.id
                      ? "bg-primary text-white"
                      : "bg-surface text-foreground-muted hover:bg-surface-elevated"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* 语言 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">{t.dashboard.settings.language}</p>
                <p className="text-xs text-foreground-secondary">{t.dashboard.settings.languageDesc}</p>
              </div>
            </div>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="en">English</option>
              <option value="zh">简体中文</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染通知设置
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* 邮件通知 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '邮件通知' : 'Email Notifications'}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {emailNotifications ? <Bell className="w-5 h-5 text-accent" /> : <BellOff className="w-5 h-5 text-foreground-muted" />}
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '启用邮件通知' : 'Enable Email Notifications'}
                </p>
              </div>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          {emailNotifications && (
            <div className="pl-8 space-y-3 border-l-2 border-border ml-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {language === 'zh' ? '优化完成通知' : 'Optimization complete'}
                </span>
                <Switch checked={optimizationComplete} onCheckedChange={setOptimizationComplete} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {language === 'zh' ? '每周使用摘要' : 'Weekly digest'}
                </span>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {language === 'zh' ? '团队更新' : 'Team updates'}
                </span>
                <Switch checked={teamUpdates} onCheckedChange={setTeamUpdates} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 推送与声音 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Smartphone className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '推送与声音' : 'Push & Sound'}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '浏览器推送' : 'Browser Push Notifications'}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {language === 'zh' ? '在浏览器中接收即时通知' : 'Receive instant notifications in browser'}
                </p>
              </div>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-foreground-muted" /> : <VolumeX className="w-5 h-5 text-foreground-muted" />}
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '通知声音' : 'Notification Sound'}
                </p>
              </div>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>
        </div>
      </div>

      {/* 免打扰 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <BellOff className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '免打扰模式' : 'Do Not Disturb'}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">
                {language === 'zh' ? '启用免打扰' : 'Enable Do Not Disturb'}
              </p>
              <p className="text-xs text-foreground-secondary">
                {language === 'zh' ? '在指定时间段内静音所有通知' : 'Silence all notifications during specified hours'}
              </p>
            </div>
            <Switch checked={doNotDisturb} onCheckedChange={setDoNotDisturb} />
          </div>

          {doNotDisturb && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1">
                <label className="text-xs text-foreground-muted mb-1 block">
                  {language === 'zh' ? '开始时间' : 'Start Time'}
                </label>
                <input
                  type="time"
                  value={dndStartTime}
                  onChange={(e) => setDndStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-foreground-muted mb-1 block">
                  {language === 'zh' ? '结束时间' : 'End Time'}
                </label>
                <input
                  type="time"
                  value={dndEndTime}
                  onChange={(e) => setDndEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // 渲染快捷键设置
  const renderShortcutsSettings = () => (
    <div className="p-5 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-3 mb-4">
        <Keyboard className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">
          {language === 'zh' ? '键盘快捷键' : 'Keyboard Shortcuts'}
        </h3>
      </div>

      <div className="space-y-2">
        {Object.entries(shortcuts).map(([key, value]) => {
          const labels: Record<string, { en: string; zh: string }> = {
            optimize: { en: 'Run Optimize', zh: '运行优化' },
            save: { en: 'Save', zh: '保存' },
            saveTemplate: { en: 'Save as Template', zh: '保存为模板' },
            export: { en: 'Export', zh: '导出' },
            help: { en: 'Help', zh: '帮助' },
            newPrompt: { en: 'New Prompt', zh: '新建提示词' },
            switchMode: { en: 'Switch Mode', zh: '切换模式' },
          }

          return (
            <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-elevated transition-colors">
              <span className="text-sm text-foreground">
                {labels[key]?.[language] || key}
              </span>
              <kbd className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground-muted font-mono">
                {value}
              </kbd>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-foreground-muted mt-4">
        {language === 'zh' ? '快捷键暂不支持自定义，后续版本将开放' : 'Custom shortcuts coming in future updates'}
      </p>
    </div>
  )

  // 渲染危险操作
  const renderDangerSettings = () => (
    <div className="space-y-6">
      {/* 数据导出 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '数据导出' : 'Data Export'}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">
              {language === 'zh' ? '导出所有数据' : 'Export All Data'}
            </p>
            <p className="text-xs text-foreground-secondary">
              {language === 'zh' ? '下载您的所有提示词、模板和历史记录' : 'Download all your prompts, templates, and history'}
            </p>
          </div>
          <GradientButton variant="secondary" onClick={() => setShowExportModal(true)}>
            <Download className="w-4 h-4 mr-2" />
            {language === 'zh' ? '导出' : 'Export'}
          </GradientButton>
        </div>
      </div>

      {/* 清除缓存 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">
            {language === 'zh' ? '清除缓存' : 'Clear Cache'}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">
              {language === 'zh' ? '清除本地缓存' : 'Clear Local Cache'}
            </p>
            <p className="text-xs text-foreground-secondary">
              {language === 'zh' ? '清除浏览器中的缓存数据，不影响云端数据' : 'Clear cached data in browser, does not affect cloud data'}
            </p>
          </div>
          <GradientButton
            variant="secondary"
            className="border-warning/50 text-warning hover:bg-warning/10"
            onClick={() => setShowClearCacheModal(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {language === 'zh' ? '清除' : 'Clear'}
          </GradientButton>
        </div>
      </div>

      {/* 删除账号 */}
      <div className="p-5 rounded-2xl bg-error/5 border border-error/30">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-error" />
          <h3 className="font-semibold text-error">
            {language === 'zh' ? '危险区域' : 'Danger Zone'}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">{t.dashboard.settings.deleteAccount}</p>
            <p className="text-xs text-foreground-secondary">{t.dashboard.settings.deleteAccountDesc}</p>
          </div>
          <GradientButton
            variant="secondary"
            className="border-error/50 text-error hover:bg-error/10"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t.common.delete}
          </GradientButton>
        </div>
      </div>
    </div>
  )

  // 获取当前标签的内容
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'shortcuts':
        return renderShortcutsSettings()
      case 'danger':
        return renderDangerSettings()
      default:
        return null
    }
  }

  return (
    <motion.div
      className="flex h-screen overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* 左侧标签导航 */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm flex flex-col shrink-0">
        {/* 头部 */}
        <div className="h-14 border-b border-border flex items-center px-4">
          <Settings className="w-5 h-5 text-accent mr-2" />
          <h2 className="font-semibold text-foreground">
            {language === 'zh' ? '设置' : 'Settings'}
          </h2>
        </div>

        {/* 标签列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {SETTINGS_TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const isDanger = tab.id === 'danger'

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all flex items-center gap-3",
                  isActive
                    ? isDanger 
                      ? "bg-error/10 border border-error/30"
                      : "bg-primary/10 border border-primary/30"
                    : "hover:bg-surface border border-transparent"
                )}
              >
                <tab.icon className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? (isDanger ? "text-error" : "text-primary") : "text-foreground-muted"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    isActive ? (isDanger ? "text-error" : "text-foreground") : "text-foreground"
                  )}>
                    {language === 'zh' ? tab.labelZh : tab.label}
                  </p>
                  <p className="text-xs text-foreground-muted line-clamp-1">
                    {language === 'zh' ? tab.descriptionZh : tab.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 头部 */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {language === 'zh' 
                ? SETTINGS_TABS.find(t => t.id === activeTab)?.labelZh 
                : SETTINGS_TABS.find(t => t.id === activeTab)?.label
              }
            </h1>
            <p className="text-xs text-foreground-muted">
              {language === 'zh'
                ? SETTINGS_TABS.find(t => t.id === activeTab)?.descriptionZh
                : SETTINGS_TABS.find(t => t.id === activeTab)?.description
              }
            </p>
          </div>
          <GradientButton onClick={handleSaveSettings} loading={isSaving}>
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {language === 'zh' ? '已保存' : 'Saved'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {language === 'zh' ? '保存设置' : 'Save Settings'}
              </>
            )}
          </GradientButton>
        </header>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="max-w-5xl"
              variants={contentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 删除账号确认弹窗 */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title={t.dashboard.settings.deleteAccount}
        message={language === 'zh' 
          ? "确定要删除您的账号吗？此操作无法撤销，所有数据将被永久删除。"
          : "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        }
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* 导出确认弹窗 */}
      <ConfirmationModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleExportData}
        title={language === 'zh' ? '导出数据' : 'Export Data'}
        message={language === 'zh'
          ? "我们将打包您的所有数据并发送到您的邮箱。这可能需要几分钟时间。"
          : "We will package all your data and send it to your email. This may take a few minutes."
        }
        confirmLabel={language === 'zh' ? '开始导出' : 'Start Export'}
        cancelLabel={t.common.cancel}
        isLoading={isExporting}
      />

      {/* 清除缓存确认弹窗 */}
      <ConfirmationModal
        isOpen={showClearCacheModal}
        onClose={() => setShowClearCacheModal(false)}
        onConfirm={handleClearCache}
        title={language === 'zh' ? '清除缓存' : 'Clear Cache'}
        message={language === 'zh'
          ? "这将清除浏览器中的本地缓存数据。您可能需要重新加载某些设置。"
          : "This will clear local cached data in your browser. You may need to reload some settings."
        }
        confirmLabel={language === 'zh' ? '确认清除' : 'Confirm Clear'}
        cancelLabel={t.common.cancel}
        variant="danger"
      />
    </motion.div>
  )
}
