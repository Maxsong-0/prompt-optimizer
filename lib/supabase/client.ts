import { createBrowserClient } from '@supabase/ssr'

/**
 * 创建 Supabase 浏览器端客户端
 * 用于客户端组件和浏览器环境
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

