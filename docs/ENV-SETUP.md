# 环境变量配置指南

## 必需的环境变量

在项目根目录创建 `.env.local` 文件，添加以下环境变量：

### Supabase 配置

```bash
# 公网访问环境（推荐，支持多设备和其他用户访问）
NEXT_PUBLIC_SUPABASE_URL=https://api.promto.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# 或者：本地开发环境（仅本机访问）
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```

运行 `supabase start` 后，可以从输出中获取 anon_key 和 service_role_key。

---

## AI Provider 配置

### 方式一：用户自行配置（推荐）

用户可以在 **设置 > API Keys** 页面自行配置自己的 API Key，无需配置环境变量。

访问地址：`/settings/api-keys`

### 方式二：系统级配置（环境变量）

如果需要为所有用户提供默认的 AI 服务，可以配置以下环境变量：

```bash
# ============================================
# AI Provider API Keys
# ============================================

# OpenRouter (推荐！一个 Key 访问所有模型)
# 获取地址: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxx

# OpenAI (直连)
# 获取地址: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# Anthropic Claude (直连)
# 获取地址: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

# Google Gemini (直连)
# 获取地址: https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=xxxxxxxxxxxxxxxx

# API Key 加密密钥（用于加密存储用户的 API Key）
# 生产环境必须设置为强随机字符串
API_KEY_ENCRYPTION_SECRET=your-strong-random-secret-key
```

### API Key 获取教程

#### OpenRouter（推荐首选）

OpenRouter 是一个 AI 模型聚合平台，只需一个 API Key 即可访问 OpenAI、Claude、Gemini 等多个模型。

1. 访问 https://openrouter.ai
2. 点击右上角 "Sign In" 登录（支持 Google 登录）
3. 点击头像 → "Keys"
4. 点击 "Create Key"
5. 复制 Key 到配置

**优势：**
- 一个 Key 访问几乎所有主流模型
- 按量付费，无月费
- 部分模型免费使用

#### OpenAI

1. 访问 https://platform.openai.com
2. 登录账户
3. 点击左侧 "API Keys"
4. 点击 "Create new secret key"
5. 复制 Key（只显示一次！）

#### Anthropic Claude

1. 访问 https://console.anthropic.com
2. 注册/登录账户
3. 点击 "Settings" → "API Keys"
4. 点击 "Create Key"
5. 复制 Key

#### Google Gemini

1. 访问 https://aistudio.google.com
2. 使用 Google 账号登录
3. 点击左侧 "Get API Key"
4. 点击 "Create API Key"
5. 选择项目或创建新项目
6. 复制 Key

---

## OAuth 配置（GitHub / Google 登录）

### 第一步：获取 OAuth 凭证

#### GitHub OAuth（推荐）

1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name**: `Promto`
   - **Homepage URL**: `https://www.promto.org`
   - **Authorization callback URL**: `https://api.promto.org/auth/v1/callback`
4. 点击 "Register application"
5. 复制 **Client ID**
6. 点击 "Generate a new client secret"，复制 **Client Secret**

#### Google OAuth

1. 访问 https://console.cloud.google.com/apis/credentials
2. 创建项目或选择现有项目
3. 点击 "创建凭据" → "OAuth 客户端 ID"
4. 配置同意屏幕（首次需要）：
   - 选择 "外部"
   - 填写应用名称、用户支持邮箱、开发者联系信息
5. 创建 OAuth 客户端：
   - **应用类型**: Web 应用
   - **名称**: `Promto`
   - **已授权的重定向 URI**: `https://api.promto.org/auth/v1/callback`
6. 复制 **客户端 ID** 和 **客户端密钥**

### 第二步：配置环境变量

在 `.env.local` 中添加：

```bash
# GitHub OAuth
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_github_client_secret

# Google OAuth
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
```

### 第三步：重启 Supabase

```bash
# 停止 Supabase
supabase stop

# 重新启动（加载新配置）
supabase start
```

### 第四步：验证配置

重启后，访问 Supabase Studio：http://127.0.0.1:54323

1. 进入 **Authentication** → **Providers**
2. 确认 **GitHub** 和 **Google** 显示为 "Enabled"

### 回调 URL 总结

| Provider | 公网回调 URL (推荐) | 本地开发回调 URL |
|----------|---------------------|-----------------|
| GitHub   | `https://api.promto.org/auth/v1/callback` | `http://127.0.0.1:54321/auth/v1/callback` |
| Google   | `https://api.promto.org/auth/v1/callback` | `http://127.0.0.1:54321/auth/v1/callback` |

**重要**: 如果需要其他设备或用户使用 OAuth 登录，必须使用公网回调 URL。

### 常见问题

**Q: OAuth 回调后显示错误？**
A: 确保回调 URL 完全匹配，包括协议（http/https）和端口。

**Q: Google OAuth 显示 "此应用未经验证"？**
A: 在开发阶段，点击 "继续" 即可。生产环境需要提交应用验证。

**Q: 配置正确但仍无法登录？**
A: 尝试清除浏览器缓存，或使用隐身模式测试。

---

## 应用配置

```bash
# 应用URL（用于OAuth回调）
# 公网访问使用：
NEXT_PUBLIC_APP_URL=https://www.promto.org

# 或者本地开发使用：
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node环境
NODE_ENV=development
```

---

## 生产环境

生产环境需要使用 Supabase 云服务：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# 生产环境必须设置强随机密钥
API_KEY_ENCRYPTION_SECRET=your-production-secret-key
```

---

## 验证配置

启动开发服务器验证配置是否正确：

```bash
npm run dev
```

如果看到以下警告，说明 Supabase 环境变量未配置：

```
Supabase environment variables are not set. Skipping auth middleware.
```

---

## 完整配置示例

### 公网访问配置（推荐）

```bash
# ============================================
# Supabase (公网)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://api.promto.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# ============================================
# AI Providers (可选，用户可自行在界面配置)
# ============================================
OPENROUTER_API_KEY=sk-or-v1-...
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_GENERATIVE_AI_API_KEY=AI...

# ============================================
# 安全
# ============================================
API_KEY_ENCRYPTION_SECRET=change-this-in-production

# ============================================
# 应用
# ============================================
NEXT_PUBLIC_APP_URL=https://www.promto.org
NODE_ENV=development
```

### 本地开发配置（仅本机访问）

```bash
# ============================================
# Supabase (本地)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# ============================================
# 应用
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```
