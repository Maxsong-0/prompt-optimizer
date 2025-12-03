import { createBrowserClient } from '@supabase/ssr'
import { isSupabaseEnabled } from './config'

/**
 * 创建 Supabase 浏览器端客户端
 * 用于客户端组件和浏览器环境
 */
export function createClient() {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase is not configured. Please set environment variables.')
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

