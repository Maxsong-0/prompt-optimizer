"use client"

import { useState } from "react"
import { Camera, Key, Globe, Moon, Sun, Sparkles, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { GradientButton } from "@/components/ui/gradient-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/i18n/language-context"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import type { Locale } from "@/lib/i18n/translations"

export function SettingsForm() {
  const { t, locale, setLocale } = useLanguage()
  const [darkMode, setDarkMode] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDeleting(false)
    setShowDeleteModal(false)
    // In real implementation, delete account and redirect
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Profile Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">{t.dashboard.settings.profile}</h2>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/diverse-user-avatars.png" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-white">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{t.dashboard.settings.profilePicture}</h3>
              <p className="text-sm text-foreground-secondary">{t.dashboard.settings.profilePictureHint}</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.dashboard.settings.firstName}</Label>
                <Input id="firstName" defaultValue="John" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="lastName">{t.dashboard.settings.lastName}</Label>
                <Input id="lastName" defaultValue="Doe" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">{t.dashboard.settings.email}</Label>
              <Input id="email" type="email" defaultValue="john@example.com" className="mt-1.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">{t.dashboard.settings.preferences}</h2>
        <div className="p-6 rounded-xl bg-card border border-border space-y-6">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-foreground">{t.dashboard.settings.defaultModel}</p>
                <p className="text-sm text-foreground-secondary">{t.dashboard.settings.defaultModelDesc}</p>
              </div>
            </div>
            <select className="px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm text-foreground">
              <option>GPT-4</option>
              <option>Claude 3</option>
              <option>Gemini Pro</option>
            </select>
          </div>
        </div>
      </section>

      {/* API Keys Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">{t.dashboard.settings.apiKeys}</h2>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-foreground">{t.dashboard.settings.apiKeyTitle}</p>
              <p className="text-sm text-foreground-secondary">{t.dashboard.settings.apiKeyDesc}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Input type="password" placeholder="sk-..." className="flex-1 font-mono" />
            <GradientButton>{t.dashboard.settings.saveKey}</GradientButton>
          </div>
        </div>
      </section>

      <section className="space-y-6">
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
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <GradientButton size="lg">{t.dashboard.settings.saveChanges}</GradientButton>
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
