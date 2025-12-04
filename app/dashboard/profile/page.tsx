"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  RefreshCw,
  Loader2,
  User,
  Link as LinkIcon,
  BarChart3,
  Activity,
  ChevronRight,
  ExternalLink,
  Unlink,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { useLanguage } from "@/lib/i18n/language-context"
import { useUser } from "@/lib/supabase/hooks"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

// =====================================================
// 类型定义
// =====================================================

interface ProfileTab {
  id: string
  label: string
  labelZh: string
  icon: typeof User
  description: string
  descriptionZh: string
}

interface ProfileData {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: string
  subscription_tier: string
  credits: number
  preferences: Record<string, any>
  created_at?: string
}

interface UserStats {
  total_prompts: number
  total_optimizations: number
  today_quick: number
  today_deep: number
  avg_score: number | null
}

interface ActivityItem {
  id: string
  type: 'optimized' | 'savedTemplate' | 'sharedPrompt' | 'joinedTeam' | 'login'
  description: string
  timestamp: string
}

// =====================================================
// 配置
// =====================================================

const PROFILE_TABS: ProfileTab[] = [
  {
    id: 'profile',
    label: 'Profile',
    labelZh: '个人资料',
    icon: User,
    description: 'Your personal information',
    descriptionZh: '您的个人信息',
  },
  {
    id: 'connections',
    label: 'Connected Accounts',
    labelZh: '账号连接',
    icon: LinkIcon,
    description: 'Manage linked accounts',
    descriptionZh: '管理关联账号',
  },
  {
    id: 'stats',
    label: 'Usage Statistics',
    labelZh: '使用统计',
    icon: BarChart3,
    description: 'Your usage and analytics',
    descriptionZh: '您的使用数据和分析',
  },
  {
    id: 'activity',
    label: 'Activity',
    labelZh: '活动记录',
    icon: Activity,
    description: 'Recent activity history',
    descriptionZh: '最近活动历史',
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

export default function ProfilePage() {
  const { t, language } = useLanguage()
  const { user, loading: userLoading } = useUser()
  const supabase = createClient()

  // 当前选中的标签
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [twitter, setTwitter] = useState("")
  const [github, setGithub] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [connectedAccounts, setConnectedAccounts] = useState({
    google: { connected: false, email: '', avatar: '' },
    github: { connected: false, username: '', avatar: '' },
  })

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      setIsLoading(true)
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const profileData = data.data.profile
            const statsData = data.data.stats

            setProfile(profileData)
            setStats(statsData)

            // Populate form fields
            setDisplayName(profileData.display_name || '')
            setEmail(profileData.email || user.email || '')
            setBio(profileData.preferences?.bio || '')
            setLocation(profileData.preferences?.location || '')
            setWebsite(profileData.preferences?.website || '')
            setTwitter(profileData.preferences?.twitter || '')
            setGithub(profileData.preferences?.github || '')
            setLinkedin(profileData.preferences?.linkedin || '')
            setAvatarUrl(profileData.avatar_url)

            // Check connected accounts from user metadata and identities
            const identities = user.identities || []
            const googleIdentity = identities.find(i => i.provider === 'google')
            const githubIdentity = identities.find(i => i.provider === 'github')

            setConnectedAccounts({
              google: {
                connected: !!googleIdentity,
                email: googleIdentity?.identity_data?.email || user.email || '',
                avatar: googleIdentity?.identity_data?.avatar_url || '',
              },
              github: {
                connected: !!githubIdentity,
                username: githubIdentity?.identity_data?.user_name || githubIdentity?.identity_data?.preferred_username || '',
                avatar: githubIdentity?.identity_data?.avatar_url || '',
              },
            })

            // Generate mock activities (in real app, fetch from API)
            const mockActivities: ActivityItem[] = [
              { id: '1', type: 'optimized', description: 'Optimized a prompt', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
              { id: '2', type: 'savedTemplate', description: 'Saved a new template', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
              { id: '3', type: 'sharedPrompt', description: 'Shared a prompt with team', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
              { id: '4', type: 'login', description: 'Logged in', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
            ]
            setActivities(mockActivities)
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!userLoading) {
      fetchProfile()
    }
  }, [user, userLoading])

  // Connect account via OAuth
  const handleConnectAccount = async (provider: 'google' | 'github') => {
    setIsConnecting(provider)
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
      }
    } catch (error) {
      console.error('Failed to connect account:', error)
      toast.error(language === 'zh' ? '连接失败' : 'Failed to connect')
    } finally {
      setIsConnecting(null)
    }
  }

  // Disconnect account
  const handleDisconnectAccount = async (provider: 'google' | 'github') => {
    if (!confirm(language === 'zh' ? `确定要断开与 ${provider} 的连接吗？` : `Are you sure you want to disconnect ${provider}?`)) {
      return
    }

    setIsDisconnecting(provider)
    try {
      const identities = user?.identities || []
      const identity = identities.find(i => i.provider === provider)

      if (identity) {
        const { error } = await supabase.auth.unlinkIdentity(identity)

        if (error) {
          toast.error(error.message)
        } else {
          toast.success(language === 'zh' ? '已断开连接' : 'Disconnected')
          setConnectedAccounts(prev => ({
            ...prev,
            [provider]: { connected: false, email: '', username: '', avatar: '' },
          }))
        }
      }
    } catch (error) {
      console.error('Failed to disconnect account:', error)
      toast.error(language === 'zh' ? '断开连接失败' : 'Failed to disconnect')
    } finally {
      setIsDisconnecting(null)
    }
  }

  // Sync from OAuth provider
  const handleSyncFromOAuth = async () => {
    if (!user) return

    setIsSyncing(true)
    try {
      const metadata = user.user_metadata || {}
      const oauthName = metadata.full_name || metadata.name || metadata.user_name
      const oauthAvatar = metadata.avatar_url || metadata.picture

      if (oauthName) setDisplayName(oauthName)
      if (oauthAvatar) setAvatarUrl(oauthAvatar)

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: oauthName || displayName,
          avatar_url: oauthAvatar || avatarUrl,
        }),
      })

      if (response.ok) {
        toast.success(language === 'zh' ? '已同步' : 'Synced')
      }
    } catch (error) {
      console.error('Failed to sync from OAuth:', error)
      toast.error(language === 'zh' ? '同步失败' : 'Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  // Save profile
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
          preferences: {
            bio,
            location,
            website,
            twitter,
            github,
            linkedin,
          },
        }),
      })

      if (response.ok) {
        setSaved(true)
        toast.success(language === 'zh' ? '已保存' : 'Saved')
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error(language === 'zh' ? '保存失败' : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.slice(0, 2).toUpperCase() || 'U'
  }

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return language === 'zh' ? `${minutes} 分钟前` : `${minutes} minutes ago`
    if (hours < 24) return language === 'zh' ? `${hours} 小时前` : `${hours} hours ago`
    return language === 'zh' ? `${days} 天前` : `${days} days ago`
  }

  // Loading state
  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  // 渲染个人资料标签
  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">{t.dashboard.profile.avatar}</h3>
        <div className="flex items-center gap-6">
          <motion.div className="relative group" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary/20">
                {getInitials()}
              </div>
            )}
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
              {avatarUrl && (
                <GradientButton
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error/10"
                  onClick={() => setAvatarUrl(null)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {language === 'zh' ? '移除' : 'Remove'}
                </GradientButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
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
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.dashboard.profile.email}</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground-muted cursor-not-allowed"
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
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
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
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                placeholder="in/username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染连接账号标签
  const renderConnectionsTab = () => (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-card border border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">
          {language === 'zh' ? '关联的账号' : 'Linked Accounts'}
        </h3>
        <p className="text-sm text-foreground-secondary mb-6">
          {language === 'zh'
            ? '连接您的社交账号以便于登录和同步信息'
            : 'Connect your social accounts for easier login and profile sync'}
        </p>

        <div className="space-y-4">
          {/* Google */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                <p className="font-medium text-foreground">Google</p>
                {connectedAccounts.google.connected ? (
                  <p className="text-sm text-foreground-muted">{connectedAccounts.google.email}</p>
                ) : (
                  <p className="text-sm text-foreground-muted">
                    {language === 'zh' ? '未连接' : 'Not connected'}
                  </p>
                )}
              </div>
            </div>
            {connectedAccounts.google.connected ? (
              <GradientButton
                variant="ghost"
                size="sm"
                className="text-error hover:bg-error/10"
                onClick={() => handleDisconnectAccount('google')}
                loading={isDisconnecting === 'google'}
              >
                <Unlink className="w-4 h-4 mr-2" />
                {language === 'zh' ? '断开连接' : 'Disconnect'}
              </GradientButton>
            ) : (
              <GradientButton
                variant="secondary"
                size="sm"
                onClick={() => handleConnectAccount('google')}
                loading={isConnecting === 'google'}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {language === 'zh' ? '连接' : 'Connect'}
              </GradientButton>
            )}
          </div>

          {/* GitHub */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#24292f] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">GitHub</p>
                {connectedAccounts.github.connected ? (
                  <p className="text-sm text-foreground-muted">@{connectedAccounts.github.username}</p>
                ) : (
                  <p className="text-sm text-foreground-muted">
                    {language === 'zh' ? '未连接' : 'Not connected'}
                  </p>
                )}
              </div>
            </div>
            {connectedAccounts.github.connected ? (
              <GradientButton
                variant="ghost"
                size="sm"
                className="text-error hover:bg-error/10"
                onClick={() => handleDisconnectAccount('github')}
                loading={isDisconnecting === 'github'}
              >
                <Unlink className="w-4 h-4 mr-2" />
                {language === 'zh' ? '断开连接' : 'Disconnect'}
              </GradientButton>
            ) : (
              <GradientButton
                variant="secondary"
                size="sm"
                onClick={() => handleConnectAccount('github')}
                loading={isConnecting === 'github'}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {language === 'zh' ? '连接' : 'Connect'}
              </GradientButton>
            )}
          </div>
        </div>
      </div>

      {/* Sync Info */}
      {(connectedAccounts.google.connected || connectedAccounts.github.connected) && (
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                {language === 'zh' ? '同步账号信息' : 'Sync Account Info'}
              </p>
              <p className="text-sm text-foreground-secondary">
                {language === 'zh'
                  ? '从关联账号同步头像和名称到您的个人资料'
                  : 'Sync avatar and name from connected accounts to your profile'}
              </p>
            </div>
            <GradientButton onClick={handleSyncFromOAuth} loading={isSyncing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {language === 'zh' ? '同步' : 'Sync'}
            </GradientButton>
          </div>
        </div>
      )}
    </div>
  )

  // 渲染统计标签
  const renderStatsTab = () => {
    const displayStats = [
      { icon: Zap, label: t.dashboard.profile.stats.totalOptimizations, value: stats?.total_optimizations?.toString() || "0", color: 'text-yellow-500' },
      { icon: FileText, label: t.dashboard.profile.stats.savedTemplates, value: stats?.total_prompts?.toString() || "0", color: 'text-blue-500' },
      { icon: Star, label: language === 'zh' ? '平均评分' : 'Avg Score', value: stats?.avg_score?.toFixed(1) || "N/A", color: 'text-orange-500' },
      { icon: TrendingUp, label: language === 'zh' ? '今日使用' : 'Today', value: `${(stats?.today_quick || 0) + (stats?.today_deep || 0)}`, color: 'text-green-500' },
    ]

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="p-5 rounded-2xl bg-card border border-border text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <stat.icon className={cn("w-6 h-6 mx-auto mb-3", stat.color)} />
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-foreground-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Usage Chart Placeholder */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">
            {language === 'zh' ? '使用趋势' : 'Usage Trend'}
          </h3>
          <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl">
            <p className="text-foreground-muted text-sm">
              {language === 'zh' ? '使用图表即将上线' : 'Usage chart coming soon'}
            </p>
          </div>
        </div>

        {/* Usage Quota */}
        <div className="p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">{t.dashboard.profile.usage.title}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-foreground-secondary">{t.dashboard.profile.usage.optimizations}</span>
                <span className="text-foreground font-medium">
                  {(stats?.today_quick || 0) + (stats?.today_deep || 0)} / {profile?.subscription_tier === 'pro' ? '∞' : '10'}
                </span>
              </div>
              <div className="h-3 bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: profile?.subscription_tier === 'pro'
                      ? '100%'
                      : `${Math.min(((stats?.today_quick || 0) + (stats?.today_deep || 0)) / 10 * 100, 100)}%`
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-foreground-muted">
                  {t.dashboard.profile.usage.remaining}: {profile?.subscription_tier === 'pro' ? '∞' : Math.max(0, 10 - ((stats?.today_quick || 0) + (stats?.today_deep || 0)))}
                </p>
                <p className="text-xs text-accent font-medium">
                  {profile?.subscription_tier === 'pro' ? 'Pro' : 'Free'} Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染活动标签
  const renderActivityTab = () => {
    const activityIcons = {
      optimized: Zap,
      savedTemplate: FileText,
      sharedPrompt: Star,
      joinedTeam: Calendar,
      login: User,
    }

    const activityLabels = {
      optimized: language === 'zh' ? '优化了提示词' : 'Optimized a prompt',
      savedTemplate: language === 'zh' ? '保存了模板' : 'Saved a template',
      sharedPrompt: language === 'zh' ? '分享了提示词' : 'Shared a prompt',
      joinedTeam: language === 'zh' ? '加入了团队' : 'Joined a team',
      login: language === 'zh' ? '登录' : 'Logged in',
    }

    return (
      <div className="space-y-6">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-sm font-medium text-foreground mb-4">
            {language === 'zh' ? '最近活动' : 'Recent Activity'}
          </h3>

          {activities.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type]

                  return (
                    <motion.div
                      key={activity.id}
                      className="relative flex items-start gap-4 pl-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-foreground">{activityLabels[activity.type]}</p>
                        <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-foreground-muted py-8">
              {language === 'zh' ? '暂无活动记录' : 'No activity yet'}
            </p>
          )}
        </div>

        {/* Account Created */}
        {profile?.created_at && (
          <div className="p-5 rounded-2xl bg-surface/50 border border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-foreground-muted" />
              <div>
                <p className="text-sm text-foreground">
                  {language === 'zh' ? '账号创建于' : 'Account created on'}
                </p>
                <p className="text-xs text-foreground-muted">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 获取当前标签的内容
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'connections':
        return renderConnectionsTab()
      case 'stats':
        return renderStatsTab()
      case 'activity':
        return renderActivityTab()
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
        {/* 头部 - 用户信息 */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {getInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{displayName || email}</p>
              <p className="text-xs text-foreground-muted truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* 标签列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {PROFILE_TABS.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full p-3 rounded-xl text-left transition-all flex items-center gap-3",
                  isActive
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-surface border border-transparent"
                )}
              >
                <tab.icon className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-primary" : "text-foreground-muted"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm",
                    isActive ? "text-foreground" : "text-foreground"
                  )}>
                    {language === 'zh' ? tab.labelZh : tab.label}
                  </p>
                  <p className="text-xs text-foreground-muted line-clamp-1">
                    {language === 'zh' ? tab.descriptionZh : tab.description}
                  </p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
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
                ? PROFILE_TABS.find(t => t.id === activeTab)?.labelZh
                : PROFILE_TABS.find(t => t.id === activeTab)?.label
              }
            </h1>
            <p className="text-xs text-foreground-muted">
              {language === 'zh'
                ? PROFILE_TABS.find(t => t.id === activeTab)?.descriptionZh
                : PROFILE_TABS.find(t => t.id === activeTab)?.description
              }
            </p>
          </div>
          {activeTab === 'profile' && (
            <GradientButton onClick={handleSave} loading={isSaving}>
              {saved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '已保存' : 'Saved'}
                </>
              ) : (
                t.dashboard.profile.save
              )}
            </GradientButton>
          )}
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
    </motion.div>
  )
}
