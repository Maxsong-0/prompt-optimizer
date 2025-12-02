"use client"

import { Save, Download, Play, ChevronDown, Moon, Sun, FileText, Keyboard } from "lucide-react"
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
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-foreground-secondary" />
          ) : (
            <Moon className="w-4 h-4 text-foreground-secondary" />
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
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-foreground-secondary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
