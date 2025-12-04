"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Key,
  Globe,
  Moon,
  Sun,
  Sparkles,
  AlertTriangle,
  Bell,
  BellOff,
  Keyboard,
  Save,
  Clock,
  Zap,
  Palette,
  Monitor,
  Check,
  RefreshCw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/i18n/language-context"
import { useModelConfig } from "@/lib/contexts/model-config-context"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import type { Locale } from "@/lib/i18n/translations"

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function SettingsForm() {
  const { t, locale, setLocale, language } = useLanguage()
  const { settings: modelSettings } = useModelConfig()
  
  // Theme settings
  const [darkMode, setDarkMode] = useState(true)
  const [themeAccent, setThemeAccent] = useState('purple')
  
  // Optimization settings
  const [defaultOptimizeMode, setDefaultOptimizeMode] = useState<'quick' | 'deep'>('quick')
  const [autoSave, setAutoSave] = useState(true)
  const [autoSaveInterval, setAutoSaveInterval] = useState(30)
  
  // History settings
  const [historyRetentionDays, setHistoryRetentionDays] = useState(30)
  const [maxHistoryItems, setMaxHistoryItems] = useState(100)
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [optimizationComplete, setOptimizationComplete] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [teamUpdates, setTeamUpdates] = useState(true)
  
  // Keyboard shortcuts
  const [shortcuts, setShortcuts] = useState({
    optimize: 'Ctrl+Enter',
    save: 'Ctrl+S',
    saveTemplate: 'Ctrl+Shift+S',
    export: 'Ctrl+E',
    help: 'Ctrl+/',
  })
  
  // Modal and save states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Accent color options
  const accentColors = [
    { id: 'purple', color: 'bg-purple-500', name: 'Purple' },
    { id: 'blue', color: 'bg-blue-500', name: 'Blue' },
    { id: 'green', color: 'bg-green-500', name: 'Green' },
    { id: 'orange', color: 'bg-orange-500', name: 'Orange' },
    { id: 'pink', color: 'bg-pink-500', name: 'Pink' },
    { id: 'cyan', color: 'bg-cyan-500', name: 'Cyan' },
  ]

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDeleting(false)
    setShowDeleteModal(false)
    // In real implementation, delete account and redirect
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    // Save settings to localStorage or API
    const settings = {
      darkMode,
      themeAccent,
      defaultOptimizeMode,
      autoSave,
      autoSaveInterval,
      historyRetentionDays,
      maxHistoryItems,
      emailNotifications,
      optimizationComplete,
      weeklyDigest,
      teamUpdates,
      shortcuts,
      locale,
    }
    localStorage.setItem('promto-settings', JSON.stringify(settings))
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('promto-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode)
        if (parsed.themeAccent) setThemeAccent(parsed.themeAccent)
        if (parsed.defaultOptimizeMode) setDefaultOptimizeMode(parsed.defaultOptimizeMode)
        if (parsed.autoSave !== undefined) setAutoSave(parsed.autoSave)
        if (parsed.autoSaveInterval) setAutoSaveInterval(parsed.autoSaveInterval)
        if (parsed.historyRetentionDays) setHistoryRetentionDays(parsed.historyRetentionDays)
        if (parsed.maxHistoryItems) setMaxHistoryItems(parsed.maxHistoryItems)
        if (parsed.emailNotifications !== undefined) setEmailNotifications(parsed.emailNotifications)
        if (parsed.optimizationComplete !== undefined) setOptimizationComplete(parsed.optimizationComplete)
        if (parsed.weeklyDigest !== undefined) setWeeklyDigest(parsed.weeklyDigest)
        if (parsed.teamUpdates !== undefined) setTeamUpdates(parsed.teamUpdates)
        if (parsed.shortcuts) setShortcuts(parsed.shortcuts)
      } catch (e) {
        console.error('Failed to parse saved settings:', e)
      }
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Appearance Section */}
      <motion.section
        className="space-y-6"
        variants={itemVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'zh' ? '外观设置' : 'Appearance'}
          </h2>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
          {/* Theme Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-accent" /> : <Sun className="w-5 h-5 text-warning" />}
              <div>
                <p className="font-medium text-foreground">{t.dashboard.settings.darkMode}</p>
                <p className="text-sm text-foreground-secondary">{t.dashboard.settings.darkModeDesc}</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          {/* Accent Color */}
          <div>
            <p className="font-medium text-foreground mb-2">
              {language === 'zh' ? '强调色' : 'Accent Color'}
            </p>
            <div className="flex items-center gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setThemeAccent(color.id)}
                  className={`w-8 h-8 rounded-full ${color.color} flex items-center justify-center transition-all ${
                    themeAccent === color.id ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110' : 'hover:scale-105'
                  }`}
                >
                  {themeAccent === color.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-foreground">{t.dashboard.settings.language}</p>
                <p className="text-sm text-foreground-secondary">{t.dashboard.settings.languageDesc}</p>
              </div>
            </div>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-foreground"
            >
              <option value="en">English</option>
              <option value="zh">简体中文</option>
            </select>
          </div>
        </div>
      </motion.section>

      {/* Optimization Preferences Section */}
      <motion.section
        className="space-y-6"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'zh' ? '优化偏好' : 'Optimization Preferences'}
          </h2>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
          {/* Default Model */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-foreground">{t.dashboard.settings.defaultModel}</p>
                <p className="text-sm text-foreground-secondary">{t.dashboard.settings.defaultModelDesc}</p>
              </div>
            </div>
            <span className="text-sm text-foreground-muted bg-surface px-3 py-1 rounded-lg">
              {modelSettings.model.split('/').pop() || modelSettings.model}
            </span>
          </div>

          {/* Default Optimize Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-foreground">
                  {language === 'zh' ? '默认优化模式' : 'Default Optimize Mode'}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {language === 'zh' ? '新建优化时默认使用的模式' : 'Default mode for new optimizations'}
                </p>
              </div>
            </div>
            <select
              value={defaultOptimizeMode}
              onChange={(e) => setDefaultOptimizeMode(e.target.value as 'quick' | 'deep')}
              className="px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-foreground"
            >
              <option value="quick">{language === 'zh' ? '快速模式' : 'Quick Mode'}</option>
              <option value="deep">{language === 'zh' ? '深度模式' : 'Deep Mode'}</option>
            </select>
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-foreground">
                  {language === 'zh' ? '自动保存' : 'Auto Save'}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {language === 'zh' ? '自动保存编辑中的内容' : 'Automatically save work in progress'}
                </p>
              </div>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          {autoSave && (
            <div className="pl-8">
              <label className="text-sm text-foreground-muted mb-2 block">
                {language === 'zh' ? '保存间隔（秒）' : 'Save interval (seconds)'}
              </label>
              <input
                type="range"
                min="10"
                max="120"
                step="10"
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground-muted mt-1">
                <span>10s</span>
                <span>{autoSaveInterval}s</span>
                <span>120s</span>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* History Settings Section */}
      <motion.section
        className="space-y-6"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'zh' ? '历史记录设置' : 'History Settings'}
          </h2>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
          {/* Retention Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-foreground">
                {language === 'zh' ? '历史记录保留天数' : 'History Retention Days'}
              </p>
              <span className="text-sm text-foreground-muted">{historyRetentionDays} {language === 'zh' ? '天' : 'days'}</span>
            </div>
            <input
              type="range"
              min="7"
              max="365"
              step="1"
              value={historyRetentionDays}
              onChange={(e) => setHistoryRetentionDays(parseInt(e.target.value))}
              className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-foreground-muted mt-1">
              <span>7</span>
              <span>365</span>
            </div>
          </div>

          {/* Max History Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-foreground">
                {language === 'zh' ? '最大历史记录数' : 'Max History Items'}
              </p>
              <span className="text-sm text-foreground-muted">{maxHistoryItems}</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={maxHistoryItems}
              onChange={(e) => setMaxHistoryItems(parseInt(e.target.value))}
              className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </motion.section>

      {/* Notifications Section */}
      <motion.section
        className="space-y-6"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'zh' ? '通知设置' : 'Notifications'}
          </h2>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {emailNotifications ? <Bell className="w-5 h-5 text-accent" /> : <BellOff className="w-5 h-5 text-foreground-muted" />}
              <div>
                <p className="font-medium text-foreground">
                  {language === 'zh' ? '邮件通知' : 'Email Notifications'}
                </p>
                <p className="text-sm text-foreground-secondary">
                  {language === 'zh' ? '接收重要更新的邮件通知' : 'Receive email notifications for important updates'}
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
      </motion.section>

      {/* Keyboard Shortcuts Section */}
      <motion.section
        className="space-y-6"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">
            {language === 'zh' ? '快捷键' : 'Keyboard Shortcuts'}
          </h2>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="space-y-3">
            {Object.entries(shortcuts).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                <span className="text-sm text-foreground capitalize">
                  {key === 'optimize' && (language === 'zh' ? '运行优化' : 'Run Optimize')}
                  {key === 'save' && (language === 'zh' ? '保存' : 'Save')}
                  {key === 'saveTemplate' && (language === 'zh' ? '保存为模板' : 'Save as Template')}
                  {key === 'export' && (language === 'zh' ? '导出' : 'Export')}
                  {key === 'help' && (language === 'zh' ? '帮助' : 'Help')}
                </span>
                <kbd className="px-2 py-1 text-xs rounded bg-surface-elevated border border-border text-foreground-muted">
                  {value}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* API Keys Section */}
      <motion.section
        className="space-y-6"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-foreground">{t.dashboard.settings.apiKeys}</h2>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="font-medium text-foreground">{t.dashboard.settings.apiKeyTitle}</p>
              <p className="text-sm text-foreground-secondary">{t.dashboard.settings.apiKeyDesc}</p>
            </div>
          </div>
          <GradientButton variant="secondary" onClick={() => window.location.href = '/settings/api-keys'}>
            {language === 'zh' ? '管理 API Keys' : 'Manage API Keys'}
          </GradientButton>
        </div>
      </motion.section>

      {/* Danger Zone */}
      <motion.section
        className="space-y-6"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-lg font-semibold text-error">{t.dashboard.settings.danger}</h2>
        <div className="p-6 rounded-xl bg-error/5 border border-error/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-error" />
              <div>
                <p className="font-medium text-foreground">{t.dashboard.settings.deleteAccount}</p>
                <p className="text-sm text-foreground-secondary">{t.dashboard.settings.deleteAccountDesc}</p>
              </div>
            </div>
            <GradientButton
              variant="secondary"
              className="border-error/50 text-error hover:bg-error/10"
              onClick={() => setShowDeleteModal(true)}
            >
              {t.common.delete}
            </GradientButton>
          </div>
        </div>
      </motion.section>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <GradientButton size="lg" onClick={handleSaveSettings} loading={isSaving}>
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {language === 'zh' ? '已保存' : 'Saved'}
            </>
          ) : (
            t.dashboard.settings.saveChanges
          )}
        </GradientButton>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title={t.dashboard.settings.deleteAccount}
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
