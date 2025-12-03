"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Camera,
  MapPin,
  Globe,
  TrendingUp,
  FileText,
  Star,
  Zap,
  Calendar,
  Clock,
  Trash2,
  Link2,
  Check,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function ProfilePage() {
  const { t, language } = useLanguage()
  const currentLanguage = language || 'en'
  const [displayName, setDisplayName] = useState("John Doe")
  const [email, setEmail] = useState("john@example.com")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [twitter, setTwitter] = useState("")
  const [github, setGithub] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const stats = [
    { icon: Zap, label: t.dashboard.profile.stats.totalOptimizations, value: "1,234" },
    { icon: FileText, label: t.dashboard.profile.stats.savedTemplates, value: "28" },
    { icon: Star, label: t.dashboard.profile.stats.favorites, value: "45" },
    { icon: TrendingUp, label: t.dashboard.profile.stats.thisMonth, value: "156" },
  ]

  const activities = [
    { type: "optimized", time: "2 hours ago", timeZh: "2 小时前" },
    { type: "savedTemplate", time: "Yesterday", timeZh: "昨天" },
    { type: "sharedPrompt", time: "3 days ago", timeZh: "3 天前" },
    { type: "joinedTeam", time: "1 week ago", timeZh: "1 周前" },
  ]

  const [connectedAccounts, setConnectedAccounts] = useState({
    google: true,
    github: false,
  })

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t.dashboard.profile.title}</h1>
          <p className="text-xs text-foreground-muted">{t.dashboard.profile.subtitle}</p>
        </div>
        <GradientButton size="sm" onClick={handleSave} loading={isSaving}>
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {t.dashboard.profile.saved}
            </>
          ) : (
            t.dashboard.profile.save
          )}
        </GradientButton>
      </motion.header>

      <motion.div
        className="flex-1 overflow-y-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          className="max-w-4xl mx-auto space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Profile Photo */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-4">{t.dashboard.profile.avatar}</h3>
            <div className="flex items-center gap-6">
              <motion.div className="relative group" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <button className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </motion.div>
              <div>
                <p className="text-sm text-foreground-secondary mb-3">{t.dashboard.profile.avatarHint}</p>
                <div className="flex gap-2">
                  <GradientButton variant="secondary" size="sm">
                    {t.dashboard.profile.uploadPhoto}
                  </GradientButton>
                  <GradientButton variant="ghost" size="sm" className="text-error hover:bg-error/10">
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t.dashboard.profile.removePhoto}
                  </GradientButton>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Basic Info */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border space-y-4"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-2">
              {language === "zh" ? "基本信息" : "Basic Information"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t.dashboard.profile.displayName}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.dashboard.profile.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t.dashboard.profile.bio}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.dashboard.profile.bioPlaceholder}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t.dashboard.profile.location}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  {t.dashboard.profile.website}
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border space-y-4"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-2">{t.dashboard.profile.social}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.dashboard.profile.twitter}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">@</span>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.dashboard.profile.github}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">@</span>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.dashboard.profile.linkedin}</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Connected Accounts */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-4">{t.dashboard.profile.connections.title}</h3>
            <div className="space-y-3">
              {/* Google */}
              <motion.div
                className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.dashboard.profile.connections.google}</p>
                    {connectedAccounts.google && <p className="text-xs text-foreground-muted">john@gmail.com</p>}
                  </div>
                </div>
                <GradientButton
                  variant={connectedAccounts.google ? "ghost" : "secondary"}
                  size="sm"
                  onClick={() => setConnectedAccounts((prev) => ({ ...prev, google: !prev.google }))}
                  className={connectedAccounts.google ? "text-error hover:bg-error/10" : ""}
                >
                  {connectedAccounts.google
                    ? t.dashboard.profile.connections.disconnect
                    : t.dashboard.profile.connections.connect}
                </GradientButton>
              </motion.div>
              {/* GitHub */}
              <motion.div
                className="flex items-center justify-between p-4 rounded-lg bg-surface border border-border"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center">
                    <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.dashboard.profile.connections.github}</p>
                    {connectedAccounts.github && <p className="text-xs text-foreground-muted">@johndoe</p>}
                  </div>
                </div>
                <GradientButton
                  variant={connectedAccounts.github ? "ghost" : "secondary"}
                  size="sm"
                  onClick={() => setConnectedAccounts((prev) => ({ ...prev, github: !prev.github }))}
                  className={connectedAccounts.github ? "text-error hover:bg-error/10" : ""}
                >
                  {connectedAccounts.github
                    ? t.dashboard.profile.connections.disconnect
                    : t.dashboard.profile.connections.connect}
                </GradientButton>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-4">{t.dashboard.profile.stats.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="p-4 rounded-lg bg-surface border border-border text-center hover:bg-surface-hover transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                >
                  <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-foreground-muted">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Usage */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-4">{t.dashboard.profile.usage.title}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground-secondary">{t.dashboard.profile.usage.optimizations}</span>
                  <span className="text-foreground font-medium">156 / 200</span>
                </div>
                <div className="h-3 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "78%" }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-foreground-muted">{t.dashboard.profile.usage.remaining}: 44</p>
                  <p className="text-xs text-foreground-muted">{t.dashboard.profile.usage.resetDate}: Jan 1, 2025</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="p-6 rounded-xl bg-card border border-border"
            variants={itemVariants}
            transition={{ duration: 0.4 }}
          >
            <h3 className="text-sm font-medium text-foreground mb-4">{t.dashboard.profile.activity.title}</h3>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    {activity.type === "optimized" && <Zap className="w-4 h-4 text-accent" />}
                    {activity.type === "savedTemplate" && <FileText className="w-4 h-4 text-accent" />}
                    {activity.type === "sharedPrompt" && <Star className="w-4 h-4 text-accent" />}
                    {activity.type === "joinedTeam" && <Calendar className="w-4 h-4 text-accent" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      {t.dashboard.profile.activity[activity.type as keyof typeof t.dashboard.profile.activity]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-foreground-muted">
                    <Clock className="w-3 h-3" />
                    {language === "zh" ? activity.timeZh : activity.time}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
