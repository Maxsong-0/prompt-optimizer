/**
 * Supabase 数据库类型定义
 * 
 * 可以使用以下命令自动生成类型：
 * npx supabase gen types typescript --local > lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// 数据库表类型示例
export interface Database {
  public: {
    Tables: {
      // 在此添加你的表定义
      // 示例：
      // prompts: {
      //   Row: {
      //     id: string
      //     user_id: string
      //     content: string
      //     optimized_content: string | null
      //     created_at: string
      //     updated_at: string
      //   }
      //   Insert: {
      //     id?: string
      //     user_id: string
      //     content: string
      //     optimized_content?: string | null
      //     created_at?: string
      //     updated_at?: string
      //   }
      //   Update: {
      //     id?: string
      //     user_id?: string
      //     content?: string
      //     optimized_content?: string | null
      //     created_at?: string
      //     updated_at?: string
      //   }
      // }
    }
    Views: {
      // 视图定义
    }
    Functions: {
      // 函数定义
    }
    Enums: {
      // 枚举类型定义
    }
  }
}

