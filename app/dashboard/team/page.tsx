"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  UserPlus,
  Share2,
  Activity,
  Settings,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Mail,
  Copy,
  Check,
  Search,
  X,
  Plus,
  Loader2,
  MessageSquare,
  Link as LinkIcon,
  Trash2,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/i18n/language-context"
import { useUser } from "@/lib/supabase/hooks"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

// =====================================================
// 类型定义
// =====================================================

interface Team {
  id: string
  name: string
  description: string | null
  avatar_url: string | null
  owner_id: string
  invite_code: string
  member_count: number
  created_at: string
}

interface TeamMember {
  id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending' | 'inactive'
  display_name: string | null
  avatar_url: string | null
  email: string | null
  joined_at: string | null
}

// =====================================================
// 动画变体
// =====================================================

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// =====================================================
// 组件
// =====================================================

const RoleIcon = ({ role }: { role: 'owner' | 'admin' | 'member' }) => {
  switch (role) {
    case "owner":
      return <Crown className="w-4 h-4 text-yellow-500" />
    case "admin":
      return <Shield className="w-4 h-4 text-accent" />
    default:
      return <User className="w-4 h-4 text-foreground-muted" />
  }
}

export default function TeamSpacePage() {
  const { t, language } = useLanguage()
  const { user } = useUser()

  // 状态
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  // 弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // 表单状态
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDescription, setNewTeamDescription] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [copiedCode, setCopiedCode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 获取团队列表
  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data.data || [])
        if (data.data?.length > 0 && !selectedTeam) {
          setSelectedTeam(data.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTeam])

  // 获取团队成员
  const fetchMembers = useCallback(async (teamId: string) => {
    setIsLoadingMembers(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setIsLoadingMembers(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers(selectedTeam.id)
    }
  }, [selectedTeam, fetchMembers])

  // 创建团队
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription,
        }),
      })

      if (response.ok) {
        toast.success(language === 'zh' ? '团队创建成功' : 'Team created successfully')
        setShowCreateModal(false)
        setNewTeamName("")
        setNewTeamDescription("")
        await fetchTeams()
      } else {
        const data = await response.json()
        toast.error(data.error || (language === 'zh' ? '创建失败' : 'Failed to create'))
      }
    } catch (error) {
      toast.error(language === 'zh' ? '创建失败' : 'Failed to create')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 加入团队
  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: joinCode }),
      })

      if (response.ok) {
        toast.success(language === 'zh' ? '加入成功' : 'Joined successfully')
        setShowJoinModal(false)
        setJoinCode("")
        await fetchTeams()
      } else {
        const data = await response.json()
        toast.error(data.error || (language === 'zh' ? '加入失败' : 'Failed to join'))
      }
    } catch (error) {
      toast.error(language === 'zh' ? '加入失败' : 'Failed to join')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 离开团队
  const handleLeaveTeam = async () => {
    if (!selectedTeam) return
    if (!confirm(language === 'zh' ? '确定要离开这个团队吗？' : 'Are you sure you want to leave this team?')) return

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success(language === 'zh' ? '已离开团队' : 'Left team')
        setSelectedTeam(null)
        await fetchTeams()
      } else {
        const data = await response.json()
        toast.error(data.error || (language === 'zh' ? '操作失败' : 'Operation failed'))
      }
    } catch (error) {
      toast.error(language === 'zh' ? '操作失败' : 'Operation failed')
    }
  }

  // 复制邀请码
  const handleCopyInviteCode = async () => {
    if (!selectedTeam) return
    await navigator.clipboard.writeText(selectedTeam.invite_code)
    setCopiedCode(true)
    toast.success(language === 'zh' ? '邀请码已复制' : 'Invite code copied')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const filteredMembers = members.filter(
    (member) =>
      member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isOwner = selectedTeam?.owner_id === user?.id

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  // 无团队状态
  if (teams.length === 0) {
    return (
      <motion.div
        className="flex flex-col h-screen"
        initial="initial"
        animate="animate"
        variants={pageVariants}
      >
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center px-6">
          <Users className="w-5 h-5 text-accent mr-3" />
          <h1 className="text-lg font-semibold text-foreground">{t.dashboard.team.title}</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-foreground-muted" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {language === 'zh' ? '欢迎来到团队空间' : 'Welcome to Team Space'}
            </h2>
            <p className="text-foreground-secondary mb-8">
              {language === 'zh'
                ? '创建您的第一个团队或通过邀请码加入现有团队'
                : 'Create your first team or join an existing one with an invite code'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GradientButton onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'zh' ? '创建团队' : 'Create Team'}
              </GradientButton>
              <GradientButton variant="secondary" onClick={() => setShowJoinModal(true)}>
                <LinkIcon className="w-4 h-4 mr-2" />
                {language === 'zh' ? '加入团队' : 'Join Team'}
              </GradientButton>
            </div>
          </div>
        </div>

        {/* 创建团队弹窗 */}
        <AnimatePresence>
          {showCreateModal && (
            <Modal onClose={() => setShowCreateModal(false)}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Plus className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {language === 'zh' ? '创建团队' : 'Create Team'}
                </h2>
              </div>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'zh' ? '团队名称' : 'Team Name'}</Label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder={language === 'zh' ? '输入团队名称' : 'Enter team name'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'zh' ? '团队描述' : 'Description'}</Label>
                  <Input
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder={language === 'zh' ? '简短描述您的团队（可选）' : 'Brief description (optional)'}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <GradientButton
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowCreateModal(false)}
                  >
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </GradientButton>
                  <GradientButton type="submit" className="flex-1" loading={isSubmitting}>
                    {language === 'zh' ? '创建' : 'Create'}
                  </GradientButton>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>

        {/* 加入团队弹窗 */}
        <AnimatePresence>
          {showJoinModal && (
            <Modal onClose={() => setShowJoinModal(false)}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <LinkIcon className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {language === 'zh' ? '加入团队' : 'Join Team'}
                </h2>
              </div>
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'zh' ? '邀请码' : 'Invite Code'}</Label>
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder={language === 'zh' ? '输入邀请码' : 'Enter invite code'}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <GradientButton
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowJoinModal(false)}
                  >
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </GradientButton>
                  <GradientButton type="submit" className="flex-1" loading={isSubmitting}>
                    {language === 'zh' ? '加入' : 'Join'}
                  </GradientButton>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex flex-col h-screen"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold text-foreground">{t.dashboard.team.title}</h1>
          {selectedTeam && (
            <span className="text-foreground-muted">/ {selectedTeam.name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/team/chat`}>
            <GradientButton variant="ghost" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              {language === 'zh' ? '团队聊天' : 'Team Chat'}
            </GradientButton>
          </Link>
          <GradientButton size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'zh' ? '新建团队' : 'New Team'}
          </GradientButton>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 团队列表侧边栏 */}
        <div className="w-64 border-r border-border bg-card/50 p-3 space-y-2 shrink-0 overflow-y-auto">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={cn(
                "w-full p-3 rounded-xl text-left transition-all",
                selectedTeam?.id === team.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-surface border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{team.name}</p>
                  <p className="text-xs text-foreground-muted">
                    {team.member_count} {language === 'zh' ? '成员' : 'members'}
                  </p>
                </div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setShowJoinModal(true)}
            className="w-full p-3 rounded-xl text-left hover:bg-surface border border-dashed border-border transition-colors"
          >
            <div className="flex items-center gap-3 text-foreground-muted">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                <LinkIcon className="w-5 h-5" />
              </div>
              <span className="text-sm">{language === 'zh' ? '加入团队' : 'Join Team'}</span>
            </div>
          </button>
        </div>

        {/* 主内容区 */}
        {selectedTeam && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* 团队信息卡片 */}
              <motion.div
                className="p-5 rounded-2xl bg-card border border-border"
                variants={itemVariants}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                      {selectedTeam.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedTeam.name}</h2>
                      {selectedTeam.description && (
                        <p className="text-sm text-foreground-secondary">{selectedTeam.description}</p>
                      )}
                      <p className="text-xs text-foreground-muted mt-1">
                        {selectedTeam.member_count} {language === 'zh' ? '成员' : 'members'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyInviteCode}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-sm text-foreground-secondary transition-colors"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      <span className="font-mono">{selectedTeam.invite_code}</span>
                    </button>
                    {!isOwner && (
                      <button
                        onClick={handleLeaveTeam}
                        className="p-2 rounded-lg hover:bg-error/10 text-error transition-colors"
                        title={language === 'zh' ? '离开团队' : 'Leave Team'}
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* 成员列表 */}
              <motion.div
                className="p-5 rounded-2xl bg-card border border-border"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    {t.dashboard.team.members}
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                    <Input
                      placeholder={t.common.search}
                      className="pl-9 w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                              {(member.display_name || member.email || '?').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {member.display_name || member.email}
                              </span>
                              {member.status === "pending" && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
                                  Pending
                                </span>
                              )}
                            </div>
                            {member.display_name && (
                              <span className="text-sm text-foreground-secondary">{member.email}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface">
                          <RoleIcon role={member.role} />
                          <span className="text-sm text-foreground-secondary capitalize">
                            {t.dashboard.team.role[member.role]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* 创建团队弹窗 */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal onClose={() => setShowCreateModal(false)}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Plus className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {language === 'zh' ? '创建团队' : 'Create Team'}
              </h2>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'zh' ? '团队名称' : 'Team Name'}</Label>
                <Input
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder={language === 'zh' ? '输入团队名称' : 'Enter team name'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'zh' ? '团队描述' : 'Description'}</Label>
                <Input
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder={language === 'zh' ? '简短描述您的团队（可选）' : 'Brief description (optional)'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <GradientButton
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </GradientButton>
                <GradientButton type="submit" className="flex-1" loading={isSubmitting}>
                  {language === 'zh' ? '创建' : 'Create'}
                </GradientButton>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* 加入团队弹窗 */}
      <AnimatePresence>
        {showJoinModal && (
          <Modal onClose={() => setShowJoinModal(false)}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <LinkIcon className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {language === 'zh' ? '加入团队' : 'Join Team'}
              </h2>
            </div>
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'zh' ? '邀请码' : 'Invite Code'}</Label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder={language === 'zh' ? '输入邀请码' : 'Enter invite code'}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <GradientButton
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowJoinModal(false)}
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </GradientButton>
                <GradientButton type="submit" className="flex-1" loading={isSubmitting}>
                  {language === 'zh' ? '加入' : 'Join'}
                </GradientButton>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Modal组件
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5 text-foreground-muted" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  )
}
