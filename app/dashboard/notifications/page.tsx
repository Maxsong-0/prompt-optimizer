"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  CheckCheck,
  Settings,
  Users,
  Zap,
  FileText,
  Sparkles,
  Info,
  AlertTriangle,
  Share2,
  X,
  ChevronLeft,
  Filter,
  Trash2,
  Check,
  BellOff,
  Moon,
  Clock,
  MailOpen,
  Mail,
  Volume2,
  VolumeX,
  RefreshCw,
  Loader2,
  Inbox,
  Archive,
  MoreHorizontal,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/supabase/hooks"
import { toast } from "sonner"

// =====================================================
// 类型定义
// =====================================================

interface Notification {
  id: string
  type: 'system' | 'optimization' | 'team' | 'billing' | 'feature'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionable?: boolean
  metadata?: Record<string, any>
}

interface NotificationCategory {
  id: string
  label: string
  labelZh: string
  icon: typeof Bell
  count: number
}

// =====================================================
// 动画变体
// =====================================================

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const listItemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -100, height: 0, marginBottom: 0, padding: 0 },
}

// =====================================================
// Mock数据
// =====================================================

const generateMockNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'team',
    title: 'Team Invitation',
    message: 'Sarah invited you to join Marketing Team',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actionable: true,
    metadata: { sender: 'Sarah', team: 'Marketing Team' },
  },
  {
    id: '2',
    type: 'feature',
    title: 'New Feature: AI Playground',
    message: 'Try our new AI Playground for testing prompts in real-time',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'optimization',
    title: 'Optimization Complete',
    message: 'Your deep optimization task has completed successfully',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    metadata: { promptId: 'abc123' },
  },
  {
    id: '4',
    type: 'billing',
    title: 'Usage Warning',
    message: 'You have used 80% of your monthly quota',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: '5',
    type: 'team',
    title: 'Template Shared',
    message: 'Alex shared "SEO Blog Post" template with you',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    metadata: { sender: 'Alex', templateName: 'SEO Blog Post' },
  },
  {
    id: '6',
    type: 'system',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for Dec 15, 2024 at 2:00 AM UTC',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
]

// =====================================================
// 组件
// =====================================================

export default function NotificationsPage() {
  const { t, language } = useLanguage()
  const { user } = useUser()

  // 状态
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 通知设置
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [doNotDisturb, setDoNotDisturb] = useState(false)
  const [dndStartTime, setDndStartTime] = useState('22:00')
  const [dndEndTime, setDndEndTime] = useState('08:00')
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [teamUpdates, setTeamUpdates] = useState(true)
  const [productNews, setProductNews] = useState(true)
  const [billingAlerts, setBillingAlerts] = useState(true)

  // 加载通知
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true)
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      setNotifications(generateMockNotifications())
      setIsLoading(false)
    }
    loadNotifications()
  }, [])

  // 计算分类数量
  const categories: NotificationCategory[] = [
    {
      id: 'all',
      label: 'All',
      labelZh: '全部',
      icon: Inbox,
      count: notifications.length,
    },
    {
      id: 'unread',
      label: 'Unread',
      labelZh: '未读',
      icon: Mail,
      count: notifications.filter(n => !n.read).length,
    },
    {
      id: 'system',
      label: 'System',
      labelZh: '系统',
      icon: Info,
      count: notifications.filter(n => n.type === 'system').length,
    },
    {
      id: 'optimization',
      label: 'Optimization',
      labelZh: '优化',
      icon: Zap,
      count: notifications.filter(n => n.type === 'optimization').length,
    },
    {
      id: 'team',
      label: 'Team',
      labelZh: '团队',
      icon: Users,
      count: notifications.filter(n => n.type === 'team').length,
    },
    {
      id: 'billing',
      label: 'Billing',
      labelZh: '账单',
      icon: AlertTriangle,
      count: notifications.filter(n => n.type === 'billing').length,
    },
  ]

  // 过滤通知
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !n.read
    return n.type === activeFilter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // 操作函数
  const refreshNotifications = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setNotifications(generateMockNotifications())
    setIsRefreshing(false)
    toast.success(language === 'zh' ? '已刷新' : 'Refreshed')
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success(language === 'zh' ? '已全部标记为已读' : 'All marked as read')
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    selectedIds.delete(id)
    setSelectedIds(new Set(selectedIds))
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)))
    }
  }

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)))
    setSelectedIds(new Set())
    setIsSelectionMode(false)
    toast.success(language === 'zh' ? '已删除所选通知' : 'Selected notifications deleted')
  }

  const markSelectedRead = () => {
    setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, read: true } : n))
    setSelectedIds(new Set())
    setIsSelectionMode(false)
    toast.success(language === 'zh' ? '已标记为已读' : 'Marked as read')
  }

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
      return language === 'zh' ? `${minutes} 分钟前` : `${minutes}m ago`
    }
    if (hours < 24) {
      return language === 'zh' ? `${hours} 小时前` : `${hours}h ago`
    }
    if (days < 7) {
      return language === 'zh' ? `${days} 天前` : `${days}d ago`
    }
    return new Date(timestamp).toLocaleDateString()
  }

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, typeof Bell> = {
      system: Info,
      optimization: Zap,
      team: Users,
      billing: AlertTriangle,
      feature: Sparkles,
    }
    return icons[type] || Bell
  }

  // 渲染通知设置
  const renderSettings = () => (
    <motion.div
      className="p-6 max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* 通知渠道 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          {language === 'zh' ? '通知渠道' : 'Notification Channels'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '邮件通知' : 'Email Notifications'}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {language === 'zh' ? '重要通知发送到您的邮箱' : 'Receive important notifications via email'}
                </p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === 'zh' ? '浏览器推送' : 'Browser Push'}
                </p>
                <p className="text-xs text-foreground-secondary">
                  {language === 'zh' ? '浏览器中接收即时通知' : 'Receive instant push notifications'}
                </p>
              </div>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
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
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-accent" />
          {language === 'zh' ? '免打扰模式' : 'Do Not Disturb'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">
                {language === 'zh' ? '启用免打扰' : 'Enable Do Not Disturb'}
              </p>
              <p className="text-xs text-foreground-secondary">
                {language === 'zh' ? '在指定时间段内静音所有通知' : 'Silence notifications during specified hours'}
              </p>
            </div>
            <Switch checked={doNotDisturb} onCheckedChange={setDoNotDisturb} />
          </div>
          {doNotDisturb && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1">
                <label className="text-xs text-foreground-muted mb-1 block">
                  {language === 'zh' ? '开始时间' : 'Start'}
                </label>
                <input
                  type="time"
                  value={dndStartTime}
                  onChange={(e) => setDndStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-foreground-muted mb-1 block">
                  {language === 'zh' ? '结束时间' : 'End'}
                </label>
                <input
                  type="time"
                  value={dndEndTime}
                  onChange={(e) => setDndEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-foreground"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 通知类型 */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-accent" />
          {language === 'zh' ? '通知类型' : 'Notification Types'}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{language === 'zh' ? '每周使用摘要' : 'Weekly Digest'}</span>
            <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{language === 'zh' ? '团队更新' : 'Team Updates'}</span>
            <Switch checked={teamUpdates} onCheckedChange={setTeamUpdates} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{language === 'zh' ? '产品更新' : 'Product News'}</span>
            <Switch checked={productNews} onCheckedChange={setProductNews} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{language === 'zh' ? '账单提醒' : 'Billing Alerts'}</span>
            <Switch checked={billingAlerts} onCheckedChange={setBillingAlerts} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <GradientButton onClick={() => {
          toast.success(language === 'zh' ? '设置已保存' : 'Settings saved')
          setShowSettings(false)
        }}>
          {language === 'zh' ? '保存设置' : 'Save Settings'}
        </GradientButton>
      </div>
    </motion.div>
  )

  // 渲染通知列表
  const renderNotificationsList = () => (
    <div className="flex h-full">
      {/* 侧边栏 - 分类筛选 */}
      <div className="w-56 border-r border-border bg-card/50 p-3 space-y-1 shrink-0">
        {categories.map((category) => {
          const isActive = activeFilter === category.id

          return (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all",
                isActive
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-surface border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <category.icon className={cn(
                  "w-4 h-4",
                  isActive ? "text-primary" : "text-foreground-muted"
                )} />
                <span className={cn(
                  "text-sm",
                  isActive ? "text-foreground font-medium" : "text-foreground-secondary"
                )}>
                  {language === 'zh' ? category.labelZh : category.label}
                </span>
              </div>
              {category.count > 0 && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isActive ? "bg-primary text-white" : "bg-surface text-foreground-muted"
                )}>
                  {category.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 通知列表 */}
      <div className="flex-1 flex flex-col">
        {/* 工具栏 */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSelectionMode ? (
              <>
                <button
                  onClick={selectAll}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-foreground-secondary hover:bg-surface transition-colors"
                >
                  <Check className="w-4 h-4" />
                  {selectedIds.size === filteredNotifications.length
                    ? (language === 'zh' ? '取消全选' : 'Deselect All')
                    : (language === 'zh' ? '全选' : 'Select All')
                  }
                </button>
                <span className="text-sm text-foreground-muted">
                  {selectedIds.size} {language === 'zh' ? '已选择' : 'selected'}
                </span>
              </>
            ) : (
              <span className="text-sm text-foreground-muted">
                {filteredNotifications.length} {language === 'zh' ? '条通知' : 'notifications'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSelectionMode ? (
              <>
                <GradientButton
                  variant="ghost"
                  size="sm"
                  onClick={markSelectedRead}
                  disabled={selectedIds.size === 0}
                >
                  <MailOpen className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '标为已读' : 'Mark Read'}
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error/10"
                  onClick={deleteSelected}
                  disabled={selectedIds.size === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '删除' : 'Delete'}
                </GradientButton>
                <GradientButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsSelectionMode(false)
                    setSelectedIds(new Set())
                  }}
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </GradientButton>
              </>
            ) : (
              <>
                <button
                  onClick={refreshNotifications}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg text-foreground-muted hover:bg-surface transition-colors"
                >
                  <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                </button>
                <GradientButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSelectionMode(true)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '选择' : 'Select'}
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '全部已读' : 'Mark All'}
                </GradientButton>
              </>
            )}
          </div>
        </div>

        {/* 列表内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {language === 'zh' ? '暂无通知' : 'No notifications'}
              </h3>
              <p className="text-sm text-foreground-muted">
                {language === 'zh' ? '您已处理完所有通知' : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type)
                  const isSelected = selectedIds.has(notification.id)

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      variants={listItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={cn(
                        "p-4 rounded-xl border transition-all group relative",
                        notification.read
                          ? "bg-card border-border hover:bg-surface"
                          : "bg-gradient-to-r from-primary/5 to-accent/5 border-primary/30",
                        isSelected && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* 选择框或图标 */}
                        <div
                          onClick={() => isSelectionMode ? toggleSelection(notification.id) : markAsRead(notification.id)}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                            isSelectionMode
                              ? isSelected
                                ? "bg-primary text-white"
                                : "bg-surface border-2 border-border hover:border-primary"
                              : notification.read
                                ? "bg-surface hover:bg-surface-hover"
                                : "bg-primary/20 hover:bg-primary/30"
                          )}
                        >
                          {isSelectionMode ? (
                            isSelected && <Check className="w-5 h-5" />
                          ) : (
                            <Icon className={cn(
                              "w-5 h-5",
                              notification.read ? "text-foreground-muted" : "text-accent"
                            )} />
                          )}
                        </div>

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className={cn(
                              "font-medium text-sm",
                              notification.read ? "text-foreground-secondary" : "text-foreground"
                            )}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-accent" />
                              )}
                              <span className="text-xs text-foreground-muted">
                                {formatTime(notification.timestamp)}
                              </span>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error/10 text-foreground-muted hover:text-error transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-foreground-muted mt-1">{notification.message}</p>

                          {/* 操作按钮 */}
                          {notification.actionable && notification.type === 'team' && !notification.read && (
                            <div className="flex gap-2 mt-3">
                              <GradientButton size="sm">
                                {language === 'zh' ? '接受' : 'Accept'}
                              </GradientButton>
                              <GradientButton variant="secondary" size="sm">
                                {language === 'zh' ? '拒绝' : 'Decline'}
                              </GradientButton>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          {showSettings && (
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-lg hover:bg-surface-hover transition-colors mr-2"
            >
              <ChevronLeft className="w-5 h-5 text-foreground-muted" />
            </button>
          )}
          <Bell className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold text-foreground">
            {showSettings
              ? (language === 'zh' ? '通知设置' : 'Notification Settings')
              : (language === 'zh' ? '通知中心' : 'Notifications')
            }
          </h1>
          {!showSettings && unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-accent text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {!showSettings && (
          <GradientButton variant="secondary" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            {language === 'zh' ? '设置' : 'Settings'}
          </GradientButton>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto"
            >
              {renderSettings()}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {renderNotificationsList()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
