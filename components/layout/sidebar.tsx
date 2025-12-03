"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  Beaker,
  History,
  LayoutTemplate,
  FlaskConical,
  Users,
  Settings,
  ChevronRight,
  Star,
  User,
  CreditCard,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n/language-context"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()

  const mainNavItems = [
    { icon: Beaker, label: t.dashboard.sidebar.promptLab, href: "/dashboard" },
    {
      icon: FlaskConical,
      label: t.dashboard.sidebar.playground,
      href: "/dashboard/playground",
      badge: t.dashboard.sidebar.new,
    },
    { icon: History, label: t.dashboard.sidebar.history, href: "/dashboard/history" },
    { icon: LayoutTemplate, label: t.dashboard.sidebar.templates, href: "/dashboard/templates" },
    { icon: Star, label: t.dashboard.sidebar.favorites, href: "/dashboard/favorites" },
    { icon: Users, label: t.dashboard.sidebar.teamSpace, href: "/dashboard/team", badge: t.dashboard.sidebar.pro },
  ]

  const accountNavItems = [
    { icon: User, label: t.dashboard.sidebar.profile, href: "/dashboard/profile" },
    { icon: CreditCard, label: t.dashboard.sidebar.billing, href: "/dashboard/billing" },
    { icon: Bell, label: t.dashboard.sidebar.notifications, href: "/dashboard/notifications" },
    { icon: Settings, label: t.dashboard.sidebar.settings, href: "/dashboard/settings" },
  ]

  const renderNavItem = (item: (typeof mainNavItems)[0], index: number) => {
    const isActive = pathname === item.href
    return (
      <motion.li
        key={item.href}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link href={item.href}>
          <motion.div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
              isActive
                ? "bg-gradient-to-r from-primary/20 to-accent/20 text-sidebar-foreground border border-primary/30"
                : "text-foreground-secondary hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
            whileHover={{
              x: 4,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              whileHover={{ rotate: isActive ? 0 : 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-accent")} />
            </motion.div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <span className="flex-1 text-sm font-medium whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "px-1.5 py-0.5 text-[10px] rounded-full",
                        item.badge === t.dashboard.sidebar.new
                          ? "bg-accent/20 text-accent"
                          : "bg-surface-elevated text-foreground-muted",
                      )}
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Link>
      </motion.li>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <motion.div
            className="w-8 h-8 rounded-lg overflow-hidden shrink-0"
            whileHover={{ rotate: 15, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Image src="/apple-icon.png" alt="Promto Logo" width={32} height={32} className="w-full h-full object-cover" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-sidebar-foreground whitespace-nowrap"
              >
                Promto
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {/* Main Navigation */}
        <ul className="space-y-1">{mainNavItems.map((item, index) => renderNavItem(item, index))}</ul>

        {/* Divider */}
        <div className="my-4 border-t border-sidebar-border" />

        {/* Account Navigation */}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 mb-2 text-xs font-medium text-foreground-muted uppercase tracking-wider"
            >
              Account
            </motion.p>
          )}
        </AnimatePresence>
        <ul className="space-y-1">
          {accountNavItems.map((item, index) => renderNavItem(item, index + mainNavItems.length))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <motion.button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <ChevronRight className="w-4 h-4 text-foreground-secondary" />
        </motion.div>
      </motion.button>
    </motion.aside>
  )
}
