/**
 * Supabase 统一导出文件
 * 
 * 使用示例：
 * 
 * 客户端组件：
 * import { createClient } from '@/lib/supabase/client'
 * const supabase = createClient()
 * 
 * 服务器组件：
 * import { createClient } from '@/lib/supabase/server'
 * const supabase = await createClient()
 * 
 * React Hooks：
 * import { useUser } from '@/lib/supabase/hooks'
 * const { user, loading } = useUser()
 */

export * from './client'
export * from './server'
export * from './hooks'
export type { Database } from './types'

