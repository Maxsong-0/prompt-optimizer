"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Moon, Sun, LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"
import { GradientButton } from "@/components/ui/gradient-button"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/lib/i18n/language-context"
import { useUser } from "@/lib/supabase/hooks"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const { user, loading: userLoading } = useUser()

  // 避免 hydration 错误：只在客户端挂载后渲染主题相关内容
  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: "#features", label: t.nav.features },
    { href: "#pricing", label: t.nav.pricing },
    { href: "/templates", label: t.nav.templates },
    { href: "/docs", label: t.nav.docs },
  ]

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo with hover animation - 左侧 flex-1 靠左对齐 */}
          <div className="flex-1 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Image src="/apple-icon.png" alt="Promto Logo" width={32} height={32} className="w-full h-full object-cover" />
              </motion.div>
              <motion.span
                className="text-lg font-bold text-foreground"
                whileHover={{
                  background: "linear-gradient(90deg, #4F46E5, #06B6D4)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Promto
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation - 中间居中，固定宽度 */}
          <div className="hidden md:flex items-center justify-center gap-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="relative text-sm text-foreground-secondary hover:text-foreground transition-colors group"
                >
                  <motion.span whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
                    {link.label}
                  </motion.span>
                  {/* Animated underline */}
                  <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Actions - 右侧 flex-1 靠右对齐 */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-3">
            {/* Theme toggle with rotation animation */}
            <motion.button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-surface transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {/* 只在客户端挂载后渲染，避免 hydration 错误 */}
              {mounted ? (
                <AnimatePresence mode="wait" initial={false}>
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-5 h-5 text-foreground-secondary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-5 h-5 text-foreground-secondary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <div className="w-5 h-5" /> 
              )}
            </motion.button>
            <LanguageSwitcher />
            {mounted && !userLoading && (
              user ? (
                // 已登录：显示 Go to Dashboard
                <Link href="/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-0 blur-lg"
                      whileHover={{ opacity: 0.4 }}
                      transition={{ duration: 0.3 }}
                    />
                    <GradientButton size="sm" className="relative z-10">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      {t.nav.dashboard || "Dashboard"}
                    </GradientButton>
                  </motion.div>
                </Link>
              ) : (
                // 未登录：显示 Sign in 和 Get Started
                <>
                  <Link href="/login">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <GradientButton variant="ghost" size="sm">
                        {t.nav.signIn}
                      </GradientButton>
                    </motion.div>
                  </Link>
                  <Link href="/register">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-0 blur-lg"
                        whileHover={{ opacity: 0.4 }}
                        transition={{ duration: 0.3 }}
                      />
                      <GradientButton size="sm" className="relative z-10">
                        {t.nav.getStarted}
                      </GradientButton>
                    </motion.div>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button with animation */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-foreground" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu with slide animation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                className="flex flex-col gap-2 pt-4 pb-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={link.href}
                      className="px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-surface rounded-lg transition-colors block"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  className="flex items-center gap-2 px-4 pt-4 border-t border-border mt-2"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {mounted && !userLoading && (
                    user ? (
                      // 已登录：显示 Go to Dashboard
                      <Link href="/dashboard" className="flex-1" onClick={() => setIsOpen(false)}>
                        <GradientButton size="sm" className="w-full">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          {t.nav.dashboard || "Dashboard"}
                        </GradientButton>
                      </Link>
                    ) : (
                      // 未登录：显示 Sign in 和 Get Started
                      <>
                        <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                          <GradientButton variant="secondary" size="sm" className="w-full">
                            {t.nav.signIn}
                          </GradientButton>
                        </Link>
                        <Link href="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                          <GradientButton size="sm" className="w-full">
                            {t.nav.getStarted}
                          </GradientButton>
                        </Link>
                      </>
                    )
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
