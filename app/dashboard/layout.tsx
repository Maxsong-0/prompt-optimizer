"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
      >
        {children}
      </main>
    </div>
  )
}
