import { redirect } from 'next/navigation'

export default function SettingsPage() {
  // 重定向到 API Keys 设置页面
  redirect('/settings/api-keys')
}

