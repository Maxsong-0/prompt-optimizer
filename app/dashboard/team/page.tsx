"use client"

import { useState } from "react"
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
} from "lucide-react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

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

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2 },
}

// ... existing code (interfaces and mock data) ...

interface TeamMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
  avatar?: string
  status: "active" | "pending"
}

interface SharedPrompt {
  id: string
  title: string
  author: string
  createdAt: string
  tags: string[]
}

interface ActivityItem {
  id: string
  user: string
  action: string
  target: string
  time: string
}

const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "owner", status: "active" },
  { id: "2", name: "Alice Chen", email: "alice@example.com", role: "admin", status: "active" },
  { id: "3", name: "Bob Smith", email: "bob@example.com", role: "member", status: "active" },
  { id: "4", name: "Emma Wilson", email: "emma@example.com", role: "member", status: "pending" },
]

const mockSharedPrompts: SharedPrompt[] = [
  {
    id: "1",
    title: "SEO Blog Post Generator",
    author: "Alice Chen",
    createdAt: "2 hours ago",
    tags: ["Writing", "SEO"],
  },
  {
    id: "2",
    title: "Code Review Assistant",
    author: "John Doe",
    createdAt: "1 day ago",
    tags: ["Coding", "Review"],
  },
  {
    id: "3",
    title: "Customer Support Reply",
    author: "Bob Smith",
    createdAt: "3 days ago",
    tags: ["Support", "Email"],
  },
]

const mockActivity: ActivityItem[] = [
  { id: "1", user: "Alice Chen", action: "shared", target: "SEO Blog Post Generator", time: "2 hours ago" },
  { id: "2", user: "John Doe", action: "updated", target: "Code Review Assistant", time: "5 hours ago" },
  { id: "3", user: "Bob Smith", action: "joined", target: "the team", time: "1 day ago" },
  { id: "4", user: "Emma Wilson", action: "was invited to", target: "the team", time: "2 days ago" },
]

const RoleIcon = ({ role }: { role: TeamMember["role"] }) => {
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
  const { t } = useLanguage()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredMembers = mockTeamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
          <Users className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold text-foreground">{t.dashboard.team.title}</h1>
        </div>
        <GradientButton size="sm" onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {t.dashboard.team.inviteMember}
        </GradientButton>
      </motion.header>

      {/* Content */}
      <motion.div
        className="flex-1 overflow-y-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.div
          className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Team Members */}
          <motion.div className="lg:col-span-2 space-y-4" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t.dashboard.team.members}</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <Input
                  placeholder={t.common.search}
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="divide-y divide-border">
                {filteredMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    className="flex items-center justify-between p-4 hover:bg-surface transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{member.name}</span>
                          {member.status === "pending" && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">Pending</span>
                          )}
                        </div>
                        <span className="text-sm text-foreground-secondary">{member.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface">
                        <RoleIcon role={member.role} />
                        <span className="text-sm text-foreground-secondary capitalize">
                          {t.dashboard.team.role[member.role]}
                        </span>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-surface transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-foreground-muted" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Shared Prompts */}
            <motion.div className="mt-8" variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-foreground">{t.dashboard.team.sharedPrompts}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockSharedPrompts.map((prompt, index) => (
                  <motion.div
                    key={prompt.id}
                    className="p-4 bg-card border border-border rounded-xl hover:border-border-hover transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-foreground">{prompt.title}</h3>
                      <button
                        onClick={() => handleCopy(prompt.id, prompt.title)}
                        className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                      >
                        {copiedId === prompt.id ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4 text-foreground-muted" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-foreground-secondary">{prompt.author}</span>
                      <span className="text-foreground-muted">·</span>
                      <span className="text-sm text-foreground-muted">{prompt.createdAt}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs rounded-full bg-surface text-foreground-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Recent Activity */}
            <motion.div
              className="bg-card border border-border rounded-xl p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-accent" />
                <h2 className="font-semibold text-foreground">{t.dashboard.team.activity}</h2>
              </div>
              <div className="space-y-4">
                {mockActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-foreground-secondary">{activity.action}</span>{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <span className="text-xs text-foreground-muted">{activity.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Team Settings */}
            <motion.div
              className="bg-card border border-border rounded-xl p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-accent" />
                <h2 className="font-semibold text-foreground">{t.dashboard.team.settings}</h2>
              </div>
              <div className="space-y-3">
                {["Team Name", "Billing", "Invite Link"].map((item, index) => (
                  <motion.div
                    key={item}
                    className="p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  >
                    <p className="text-sm font-medium text-foreground">{item}</p>
                    <p className="text-xs text-foreground-secondary">
                      {item === "Team Name" && "My Awesome Team"}
                      {item === "Billing" && "Pro Plan · 4 members"}
                      {item === "Invite Link" && "promptcraft.io/invite/abc123"}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowInviteModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-foreground-muted" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <UserPlus className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">{t.dashboard.team.invite.title}</h2>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setShowInviteModal(false)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">{t.dashboard.team.invite.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="colleague@example.com"
                      className="pl-10"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t.dashboard.team.invite.role}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInviteRole("member")}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border transition-colors",
                        inviteRole === "member"
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-border-hover",
                      )}
                    >
                      <User className="w-4 h-4 text-foreground-muted" />
                      <span className="text-sm font-medium text-foreground">{t.dashboard.team.role.member}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteRole("admin")}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border transition-colors",
                        inviteRole === "admin"
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-border-hover",
                      )}
                    >
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">{t.dashboard.team.role.admin}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <GradientButton
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowInviteModal(false)}
                  >
                    {t.dashboard.team.invite.cancel}
                  </GradientButton>
                  <GradientButton type="submit" className="flex-1">
                    {t.dashboard.team.invite.send}
                  </GradientButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
