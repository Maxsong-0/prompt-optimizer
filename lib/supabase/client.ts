import { createBrowserClient } from '@supabase/ssr'
import { isSupabaseEnabled } from './config'

/**
 * 创建 Supabase 浏览器端客户端
 * 用于客户端组件和浏览器环境
 * 
 * 配置说明：
 * - persistSession: 持久化session到localStorage，保持登录状态
 * - autoRefreshToken: 自动刷新token，配合后端jwt_expiry实现14天登录
 */
export function createClient() {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase is not configured. Please set environment variables.')
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Session存储14天
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'promto-auth-token',
      },
    }
  )
}

