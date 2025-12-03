import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, withErrorHandler } from '@/lib/api/utils'

/**
 * POST /api/auth/signout - 登出
 */
export const POST = withErrorHandler(async (_request: NextRequest) => {
  const supabase = await createClient()

  await supabase.auth.signOut()

  return successResponse({ message: '已登出' })
})

