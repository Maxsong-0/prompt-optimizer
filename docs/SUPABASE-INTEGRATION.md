# Supabase 集成完成 ✅

## 📦 已安装的依赖

```json
{
  "@supabase/supabase-js": "latest",
  "@supabase/ssr": "latest"
}
```

## 📁 创建的文件

### 核心文件

```
lib/supabase/
├── client.ts         # 浏览器端客户端
├── server.ts         # 服务器端客户端
├── middleware.ts     # 中间件辅助函数
├── hooks.ts          # React Hooks
├── types.ts          # 类型定义
├── index.ts          # 统一导出
└── README.md         # 完整使用文档

middleware.ts         # Next.js 中间件
.env.local           # 环境变量（已配置）
.env.example         # 环境变量示例
```

## 🔑 环境变量配置

已在 `.env.local` 中配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## 🚀 快速开始

### 1. 在客户端组件中使用

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  
  // 使用 Supabase 客户端
  async function fetchData() {
    const { data } = await supabase.from('your_table').select('*')
    return data
  }
  
  return <div>Your content</div>
}
```

### 2. 在服务器组件中使用

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  
  const { data } = await supabase.from('your_table').select('*')
  
  return <div>{/* Render data */}</div>
}
```

### 3. 使用 React Hooks

```typescript
'use client'

import { useUser } from '@/lib/supabase/hooks'

export default function UserProfile() {
  const { user, loading } = useUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>
  
  return <div>Welcome, {user.email}</div>
}
```

### 4. Server Actions

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('items').insert({
    name: formData.get('name')
  })
  
  return { success: !error }
}
```

## 🔐 认证示例

### 登录

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export async function login(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  return { data, error }
}
```

### 注册

```typescript
export async function signUp(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  return { data, error }
}
```

### 登出

```typescript
export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
```

## 📊 数据库操作

### 查询

```typescript
// 查询所有
const { data } = await supabase.from('prompts').select('*')

// 带条件
const { data } = await supabase
  .from('prompts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// 分页
const { data } = await supabase
  .from('prompts')
  .select('*')
  .range(0, 9)
```

### 插入

```typescript
const { data, error } = await supabase
  .from('prompts')
  .insert([{ content: 'My prompt' }])
  .select()
```

### 更新

```typescript
const { error } = await supabase
  .from('prompts')
  .update({ content: 'Updated' })
  .eq('id', promptId)
```

### 删除

```typescript
const { error } = await supabase
  .from('prompts')
  .delete()
  .eq('id', promptId)
```

## 🔄 实时订阅

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeComponent() {
  const supabase = createClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('table_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'your_table' },
        (payload) => {
          console.log('Change received!', payload)
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return <div>Listening to changes...</div>
}
```

## 🎯 下一步

### 1. 创建数据库表

访问 Supabase Studio：https://supabase.promto.org

创建示例表：

```sql
-- 创建 prompts 表
CREATE TABLE prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  optimized_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 启用 RLS（行级安全）
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的数据
CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的数据
CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的数据
CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的数据
CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. 生成类型定义

```bash
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

### 3. 在应用中使用

创建一个 Prompt 管理页面，集成认证和数据库功能。

## 📖 参考文档

- 本地使用指南：`lib/supabase/README.md`
- 项目框架文档：`框架.md`
- Supabase 官方文档：https://supabase.com/docs
- Next.js + Supabase：https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

## ✅ 集成检查清单

- [x] 安装 Supabase 客户端库
- [x] 创建浏览器端客户端配置
- [x] 创建服务器端客户端配置
- [x] 配置 Next.js 中间件
- [x] 添加环境变量
- [x] 创建 React Hooks
- [x] 创建类型定义
- [x] 编写使用文档
- [x] 更新项目框架文档
- [ ] 在 Supabase Studio 创建数据库表
- [ ] 生成 TypeScript 类型定义
- [ ] 开发认证功能
- [ ] 开发数据 CRUD 功能

---

**🎉 Supabase 客户端已完全集成到项目中！**

现在你可以在任何组件中轻松使用 Supabase 进行数据库操作和用户认证。

