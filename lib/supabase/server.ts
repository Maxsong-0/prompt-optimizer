import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSupabaseEnabled } from './config'

/**
 * 创建 Supabase 服务器端客户端
 * 用于服务器组件、Server Actions 和 Route Handlers
 */
export async function createClient() {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase is not configured. Please set environment variables.')
  }
  
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在 Server Component 中调用时可能会失败
            // 这是预期的行为
          }
        },
      },
    }
  )
}

/**
 * 创建 Supabase Admin 客户端
 * 使用 service role key，绑过 RLS 策略
 * 仅在服务器端使用，用于管理操作
 */
export function createAdminClient() {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase is not configured. Please set environment variables.')
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

