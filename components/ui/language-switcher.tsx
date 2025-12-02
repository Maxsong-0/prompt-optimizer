"use client"

import { useState } from "react"
import { Globe, Check } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "简体中文", flag: "🇨🇳" },
] as const

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-surface transition-colors flex items-center gap-2"
      >
        <Globe className="w-5 h-5 text-foreground-secondary" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  locale === lang.code
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground-secondary hover:bg-surface hover:text-foreground",
                )}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {locale === lang.code && <Check className="w-4 h-4 text-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
