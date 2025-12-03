# Supabase 集成指南

本目录包含 Supabase 客户端配置和辅助工具。

## 📁 文件结构

```
lib/supabase/
├── client.ts         # 浏览器端客户端
├── server.ts         # 服务器端客户端
├── middleware.ts     # 中间件辅助函数
├── hooks.ts          # React Hooks
├── types.ts          # TypeScript 类型定义
├── index.ts          # 统一导出
└── README.md         # 本文件
```

## 🚀 使用方法

### 1. 客户端组件中使用

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [data, setData] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('your_table')
        .select('*')
      
      if (data) setData(data)
    }
    
    fetchData()
  }, [])

  return <div>{/* 渲染数据 */}</div>
}
```

### 2. 服务器组件中使用

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('your_table')
    .select('*')

  return <div>{/* 渲染数据 */}</div>
}
```

### 3. Server Actions 中使用

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createItem(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('your_table')
    .insert({
      name: formData.get('name'),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/items')
  return { success: true }
}
```

### 4. Route Handlers 中使用

```typescript
// app/api/items/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('your_table')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

### 5. 使用 React Hooks

```typescript
'use client'

import { useUser, useSession } from '@/lib/supabase/hooks'

export default function UserProfile() {
  const { user, loading } = useUser()

  if (loading) return <div>加载中...</div>
  if (!user) return <div>请登录</div>

  return (
    <div>
      <h1>欢迎, {user.email}</h1>
    </div>
  )
}
```

## 🔐 用户认证示例

### 登录

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const supabase = createClient()

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="邮箱"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />
      <button type="submit">登录</button>
    </form>
  )
}
```

### 注册

```typescript
async function handleSignUp() {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    alert(error.message)
  } else {
    alert('请检查邮箱确认注册！')
  }
}
```

### 登出

```typescript
async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    alert(error.message)
  }
}
```

## 📊 数据库操作示例

### 查询数据

```typescript
// 查询所有
const { data } = await supabase.from('prompts').select('*')

// 带条件查询
const { data } = await supabase
  .from('prompts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// 分页查询
const { data } = await supabase
  .from('prompts')
  .select('*')
  .range(0, 9)  // 获取前 10 条
```

### 插入数据

```typescript
const { data, error } = await supabase
  .from('prompts')
  .insert([
    { content: 'My prompt', user_id: userId }
  ])
  .select()
```

### 更新数据

```typescript
const { error } = await supabase
  .from('prompts')
  .update({ optimized_content: 'New content' })
  .eq('id', promptId)
```

### 删除数据

```typescript
const { error } = await supabase
  .from('prompts')
  .delete()
  .eq('id', promptId)
```

## 🔄 实时订阅

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeComponent() {
  const [items, setItems] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // 初始数据加载
    const fetchItems = async () => {
      const { data } = await supabase.from('items').select('*')
      if (data) setItems(data)
    }
    fetchItems()

    // 订阅实时更新
    const channel = supabase
      .channel('items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('变化:', payload)
          // 更新本地状态
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>{/* 渲染数据 */}</div>
}
```

## 🔧 环境变量

确保在 `.env.local` 文件中配置了以下变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📝 类型安全

生成类型定义：

```bash
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

然后在 `types.ts` 中导入使用。

## 🔗 相关链接

- [Supabase 文档](https://supabase.com/docs)
- [Next.js + Supabase 指南](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

