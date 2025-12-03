"use client"

import { useState } from "react"
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
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const listItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20, height: 0, marginBottom: 0 },
}

const mockNotifications = [
  {
    id: "1",
    type: "teamInvite",
    sender: "Sarah",
    target: "Marketing Team",
    time: 2,
    timeUnit: "hours",
    read: false,
  },
  {
    id: "2",
    type: "newFeature",
    time: 1,
    timeUnit: "days",
    read: false,
  },
  {
    id: "3",
    type: "weeklyReport",
    count: 45,
    time: 3,
    timeUnit: "days",
    read: true,
  },
  {
    id: "4",
    type: "usageWarning",
    percent: 80,
    time: 4,
    timeUnit: "days",
    read: true,
  },
  {
    id: "5",
    type: "templateShared",
    sender: "Alex",
    templateName: "SEO Blog Post",
    time: 5,
    timeUnit: "days",
    read: true,
  },
  {
    id: "6",
    type: "system",
    date: "Dec 15, 2024",
    dateZh: "2024年12月15日",
    timeStr: "2:00 AM UTC",
    time: 6,
    timeUnit: "days",
    read: true,
  },
]

const notificationIcons: Record<string, typeof Bell> = {
  teamInvite: Users,
  optimizationComplete: Zap,
  weeklyReport: FileText,
  newFeature: Sparkles,
  system: Info,
  usageWarning: AlertTriangle,
  templateShared: Share2,
}

export default function NotificationsPage() {
  const { t, language } = useLanguage()
  const currentLanguage = language || 'en'
  const [notifications, setNotifications] = useState(mockNotifications)
  const [showSettings, setShowSettings] = useState(false)

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationContent = (notification: (typeof mockNotifications)[0]) => {
    const types = t.dashboard.notifications.types
    const messages = t.dashboard.notifications.messages

    switch (notification.type) {
      case "teamInvite":
        return {
          title: types.teamInvite,
          message: `${notification.sender} ${messages.teamInvite} ${notification.target}`,
        }
      case "newFeature":
        return {
          title: `${types.newFeature}: Playground`,
          message: messages.newFeature,
        }
      case "weeklyReport":
        return {
          title: types.weeklyReport,
          message: messages.weeklyReport.replace("{count}", String(notification.count)),
        }
      case "usageWarning":
        return {
          title: types.usageWarning,
          message: messages.usageWarning.replace("{percent}", String(notification.percent)),
        }
      case "templateShared":
        return {
          title: types.templateShared,
          message: `${notification.sender} ${messages.templateShared}: "${notification.templateName}"`,
        }
      case "system":
        return {
          title: types.system,
          message: messages.systemMaintenance
            .replace("{date}", language === "zh" ? notification.dateZh || "" : notification.date || "")
            .replace("{time}", notification.timeStr || ""),
        }
      default:
        return { title: "", message: "" }
    }
  }

  const formatTime = (time: number, unit: string) => {
    const timeStrings = t.dashboard.notifications.time
    if (time === 0) return timeStrings.now
    if (unit === "minutes") return timeStrings.minutesAgo.replace("{count}", String(time))
    if (unit === "hours") return timeStrings.hoursAgo.replace("{count}", String(time))
    return timeStrings.daysAgo.replace("{count}", String(time))
  }

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.header
        className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {showSettings && (
              <motion.button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-lg hover:bg-surface-hover transition-colors mr-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <ChevronLeft className="w-5 h-5 text-foreground-muted" />
              </motion.button>
            )}
          </AnimatePresence>
          <h1 className="text-lg font-semibold text-foreground">
            {showSettings ? t.dashboard.notifications.preferences.title : t.dashboard.notifications.title}
          </h1>
          {!showSettings && unreadCount > 0 && (
            <motion.span
              className="px-2 py-0.5 text-xs rounded-full bg-accent text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {unreadCount}
            </motion.span>
          )}
        </div>
        {!showSettings && (
          <div className="flex items-center gap-2">
            <GradientButton variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="w-4 h-4 mr-2" />
              {t.dashboard.notifications.markAllRead}
            </GradientButton>
            <GradientButton variant="secondary" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              {t.dashboard.notifications.settings}
            </GradientButton>
          </div>
        )}
      </motion.header>

      <motion.div
        className="flex-1 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {showSettings ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NotificationSettings onClose={() => setShowSettings(false)} />
            </motion.div>
          ) : notifications.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center h-full text-center px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              >
                <Bell className="w-8 h-8 text-foreground-muted" />
              </motion.div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t.dashboard.notifications.empty.title}</h3>
              <p className="text-sm text-foreground-muted">{t.dashboard.notifications.empty.description}</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="p-6 space-y-2 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const Icon = notificationIcons[notification.type] || Bell
                  const content = getNotificationContent(notification)
                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      variants={listItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={cn(
                        "p-4 rounded-xl border transition-all group relative",
                        notification.read
                          ? "bg-card border-border hover:bg-surface"
                          : "bg-gradient-to-r from-primary/5 to-accent/5 border-primary/30 hover:from-primary/10 hover:to-accent/10",
                      )}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          onClick={() => markAsRead(notification.id)}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                            notification.read
                              ? "bg-surface hover:bg-surface-hover"
                              : "bg-primary/20 hover:bg-primary/30",
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon
                            className={cn("w-5 h-5", notification.read ? "text-foreground-muted" : "text-accent")}
                          />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className={cn(
                                "font-medium",
                                notification.read ? "text-foreground-secondary" : "text-foreground",
                              )}
                            >
                              {content.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-accent shrink-0"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500 }}
                                />
                              )}
                              <motion.button
                                onClick={() => deleteNotification(notification.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-hover transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className="w-4 h-4 text-foreground-muted" />
                              </motion.button>
                            </div>
                          </div>
                          <p className="text-sm text-foreground-muted mt-1">{content.message}</p>
                          <p className="text-xs text-foreground-muted mt-2">
                            {formatTime(notification.time, notification.timeUnit)}
                          </p>
                        </div>
                      </div>
                      {/* Action buttons for specific types */}
                      {notification.type === "teamInvite" && !notification.read && (
                        <motion.div
                          className="flex gap-2 mt-3 ml-14"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <GradientButton size="sm">{language === "zh" ? "接受邀请" : "Accept"}</GradientButton>
                          <GradientButton variant="secondary" size="sm">
                            {language === "zh" ? "拒绝" : "Decline"}
                          </GradientButton>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

function NotificationSettings({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage()
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [marketingEnabled, setMarketingEnabled] = useState(false)
  const [teamUpdates, setTeamUpdates] = useState(true)
  const [productNews, setProductNews] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    onClose()
  }

  const toggles = [
    { id: "email", label: t.dashboard.notifications.preferences.email, value: emailEnabled, onChange: setEmailEnabled },
    { id: "push", label: t.dashboard.notifications.preferences.push, value: pushEnabled, onChange: setPushEnabled },
    {
      id: "weekly",
      label: t.dashboard.notifications.preferences.weekly,
      value: weeklyDigest,
      onChange: setWeeklyDigest,
    },
    {
      id: "team",
      label: t.dashboard.notifications.preferences.teamUpdates,
      value: teamUpdates,
      onChange: setTeamUpdates,
    },
    {
      id: "product",
      label: t.dashboard.notifications.preferences.productNews,
      value: productNews,
      onChange: setProductNews,
    },
    {
      id: "marketing",
      label: t.dashboard.notifications.preferences.marketing,
      value: marketingEnabled,
      onChange: setMarketingEnabled,
    },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        className="p-6 rounded-xl bg-card border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-4">
          {toggles.map((toggle, index) => (
            <motion.div
              key={toggle.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <span className="text-sm text-foreground">{toggle.label}</span>
              <motion.button
                onClick={() => toggle.onChange(!toggle.value)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  toggle.value ? "bg-accent" : "bg-surface-hover",
                )}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                  animate={{ x: toggle.value ? 24 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="mt-6 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GradientButton onClick={handleSave} loading={isSaving}>
            {t.dashboard.notifications.preferences.save}
          </GradientButton>
        </motion.div>
      </motion.div>
    </div>
  )
}
