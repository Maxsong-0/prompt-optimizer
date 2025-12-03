"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Download, Play, ChevronDown, Moon, Sun, FileText, Keyboard, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { GradientButton } from "@/components/ui/gradient-button"
import { ModelSelector } from "@/components/ui/model-selector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/lib/i18n/language-context"
import { useUser } from "@/lib/supabase/hooks"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface AppHeaderProps {
  projectName?: string
  selectedModel: string
  onModelChange: (model: string) => void
  onOptimize: () => void
  isOptimizing?: boolean
  onSaveAsTemplate?: () => void
  onExport?: () => void
  onShowShortcuts?: () => void
}

export function AppHeader({
  projectName = "Untitled Prompt",
  selectedModel,
  onModelChange,
  onOptimize,
  isOptimizing = false,
  onSaveAsTemplate,
  onExport,
  onShowShortcuts,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 避免 hydration 错误
  useEffect(() => {
    setMounted(true)
  }, [])

  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (!user) return "Guest"
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split("@")[0] || 
           "User"
  }

  // 获取用户头像
  const getUserAvatar = () => {
    if (!user) return null
    return user.user_metadata?.avatar_url || 
           user.user_metadata?.picture || 
           null
  }

  // 获取用户名首字母
  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.substring(0, 2).toUpperCase()
  }

  // 退出登录
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-medium text-foreground">{projectName}</h1>
        <ModelSelector value={selectedModel} onChange={onModelChange} />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShowShortcuts}
          className="p-2 rounded-lg hover:bg-surface transition-colors"
          title="Keyboard Shortcuts (Ctrl+/)"
        >
          <Keyboard className="w-4 h-4 text-foreground-secondary" />
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-surface transition-colors"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="w-4 h-4 text-foreground-secondary" />
            ) : (
              <Moon className="w-4 h-4 text-foreground-secondary" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>
        <GradientButton variant="ghost" size="sm">
          <Save className="w-4 h-4 mr-2" />
          {t.common.save}
        </GradientButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <GradientButton variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              {t.dashboard.promptLab.export}
              <ChevronDown className="w-3 h-3 ml-1" />
            </GradientButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Prompt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSaveAsTemplate}>
              <FileText className="w-4 h-4 mr-2" />
              {t.dashboard.promptLab.saveAsTemplate}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <GradientButton size="sm" onClick={onOptimize} loading={isOptimizing}>
          <Play className="w-4 h-4 mr-2" />
          {isOptimizing ? t.dashboard.promptLab.optimizing : t.dashboard.promptLab.optimize}
        </GradientButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 ml-2 p-1 rounded-lg hover:bg-surface transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src={getUserAvatar() || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                  {userLoading ? "..." : getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm text-foreground-secondary max-w-[100px] truncate">
                {userLoading ? "..." : getUserDisplayName()}
              </span>
              <ChevronDown className="w-4 h-4 text-foreground-secondary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm text-foreground-muted truncate">
              {user?.email || "Guest"}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">{t.dashboard.sidebar.profile}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing">{t.dashboard.sidebar.billing}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">{t.dashboard.sidebar.settings}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
