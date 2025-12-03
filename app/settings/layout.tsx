'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Key, User, Bell } from 'lucide-react'

interface SettingsLayoutProps {
  children: ReactNode
}

const settingsNav = [
  {
    name: 'API Keys',
    href: '/settings/api-keys',
    icon: Key,
    description: '配置 AI 服务 API Key',
  },
  {
    name: '个人资料',
    href: '/settings/profile',
    icon: User,
    description: '管理账户信息',
  },
  {
    name: '通知设置',
    href: '/settings/notifications',
    icon: Bell,
    description: '配置通知偏好',
  },
]

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">设置</h1>
              <p className="text-sm text-slate-400">管理您的账户和应用配置</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* 侧边导航 */}
          <nav className="w-full lg:w-64 flex-shrink-0">
            <ul className="space-y-1">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                        isActive
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

