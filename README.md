<p align="center">
  <img src="public/apple-icon.png" alt="Promto Logo" width="120" height="120" />
</p>

<h1 align="center">Promto</h1>

<p align="center">
  <strong>🚀 智能 AI Prompt 优化工具</strong>
</p>

<p align="center">
  让你的 Prompt 更精准、更高效、更专业
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#部署指南">部署指南</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-Latest-3FCF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
</p>

---

## ✨ 功能特性

### 🎯 Prompt 优化

- **快速优化** - 一键优化，流式响应，即时获取结果
- **深度优化** - Reflexion Loop 迭代，多轮自动改进
- **COSTAR 评估** - 基于 Context、Objective、Style、Tone、Audience、Response 六维度评分

### 🤖 多模型支持

- **OpenRouter** - 一个 API Key 访问所有主流模型（推荐）
- **OpenAI** - GPT-4o、GPT-4o-mini 等
- **Anthropic** - Claude 3.5 Sonnet、Claude 3.5 Haiku 等
- **Google Gemini** - Gemini 2.0 Flash、Gemini 1.5 Pro 等

### 🛡️ 用户系统

- **认证登录** - 邮箱注册、GitHub/Google OAuth
- **个人配置** - 自定义 API Key，独立管理
- **历史记录** - 保存优化历史，随时回顾
- **使用配额** - 免费/专业/企业多层级

### 🌍 国际化

- 支持中文和英文界面
- 一键切换语言

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20.9.0
- **Docker** (用于本地 Supabase)
- **npm** 或 **pnpm**

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Maxsong-0/prompt-optimizer.git
cd prompt-optimizer

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入必要的配置

# 4. 启动本地 Supabase
supabase start

# 5. 运行数据库迁移
supabase db reset

# 6. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可看到应用。

### 环境变量配置

在 `.env.local` 中配置：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider（可选，用户可在界面自行配置）
OPENROUTER_API_KEY=sk-or-v1-xxx
```

> 📖 详细配置说明请参考 [docs/ENV-SETUP.md](docs/ENV-SETUP.md)

---

## 🛠️ 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.0 | App Router + Turbopack |
| React | 19.2 | 最新 React 版本 |
| TypeScript | 5.0 | 类型安全 |
| Tailwind CSS | 4.1 | 原子化 CSS |
| Radix UI | Latest | 无障碍组件库 |
| Framer Motion | Latest | 动画库 |

### 后端

| 技术 | 说明 |
|------|------|
| Supabase | BaaS 平台（PostgreSQL + Auth + Storage） |
| Vercel AI SDK | 统一的 AI Provider 接口 |
| Zod | 数据验证 |

### AI 集成

| Provider | 模型 |
|----------|------|
| OpenRouter | 聚合平台，支持所有模型 |
| OpenAI | GPT-4o, GPT-4o-mini |
| Anthropic | Claude 3.5 Sonnet, Haiku |
| Google | Gemini 2.0, 1.5 系列 |

---

## 📁 项目结构

```
prompt-optimizer/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── auth/            # 认证相关
│   │   ├── optimize/        # 优化 API
│   │   ├── evaluate/        # 评估 API
│   │   ├── prompts/         # Prompt CRUD
│   │   └── settings/        # 设置 API
│   ├── dashboard/           # 仪表板页面
│   ├── login/               # 登录页
│   └── register/            # 注册页
├── components/              # React 组件
│   ├── dashboard/          # 仪表板组件
│   ├── landing/            # 落地页组件
│   ├── layout/             # 布局组件
│   └── ui/                 # 通用 UI 组件
├── lib/                    # 核心库
│   ├── ai/                 # AI Provider 配置
│   ├── api/                # API 工具函数
│   ├── i18n/               # 国际化
│   ├── services/           # 业务服务层
│   ├── supabase/           # Supabase 客户端
│   └── validators/         # 数据验证
├── supabase/               # Supabase 配置
│   ├── migrations/         # 数据库迁移
│   └── seed.sql            # 种子数据
└── docs/                   # 项目文档
```

---

## 🌐 部署指南

### 本地开发（Cloudflare Tunnel）

项目支持通过 Cloudflare Tunnel 实现公网访问：

```
www.promto.org      → localhost:3000   (Next.js)
supabase.promto.org → localhost:54323  (Supabase Studio)
```

配置详情请参考 [docs/框架.md](docs/框架.md)

### 生产部署

1. **前端部署** - Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Maxsong-0/prompt-optimizer)

2. **数据库** - 使用 [Supabase Cloud](https://supabase.com)

3. **环境变量** - 在 Vercel 后台配置生产环境变量

---

## 📖 API 文档

### 优化 API

```bash
# 快速优化（流式响应）
POST /api/optimize/quick
{
  "prompt": "你的原始 prompt",
  "provider": "openrouter",  // 可选
  "model": "openai/gpt-4o"   // 可选
}

# 深度优化（异步任务）
POST /api/optimize/deep
{
  "prompt": "你的原始 prompt",
  "iterations": 3
}
```

### 评估 API

```bash
POST /api/evaluate
{
  "prompt": "要评估的 prompt"
}
```

> 📖 完整 API 文档请参考 [docs/框架.md](docs/框架.md)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI 开发工具包
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件库
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Maxsong-0">Maxsong</a>
</p>

<p align="center">
  <a href="https://www.promto.org">🌐 官网</a> •
  <a href="https://github.com/Maxsong-0/prompt-optimizer/issues">🐛 问题反馈</a>
</p>
