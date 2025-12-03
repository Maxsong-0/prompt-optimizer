# 在 v0.app 上连接本地 Supabase

本指南将帮助你在 v0.app 上连接到你的本地 Supabase 实例（通过 Cloudflare Tunnel 暴露）。

## 📋 架构概述

```
v0.app (云端)
    ↓ HTTPS
Cloudflare CDN
    ↓ Cloudflare Tunnel
你的本地服务器
    ├── Next.js App (localhost:3000)
    ├── Supabase Studio (localhost:54323)
    └── Supabase API (localhost:54321)
```

## 🚀 配置步骤

### 步骤 1: 更新 Cloudflared 配置

已配置的域名映射：

| 域名 | 本地服务 | 端口 | 用途 |
|------|----------|------|------|
| www.promto.org | Next.js | 3000 | 主应用 |
| supabase.promto.org | Supabase Studio | 54323 | 数据库管理界面 |
| **api.promto.org** | **Supabase API** | **54321** | **API 端点（新增）** |

运行配置脚本：

```bash
./setup-v0-supabase.sh
```

或手动执行：

```bash
# 1. 复制配置文件
sudo cp /home/maxsong/cloudflared-config-fixed.yml /etc/cloudflared/config.yml

# 2. 验证配置
sudo cloudflared tunnel ingress validate

# 3. 重启服务
sudo systemctl restart cloudflared

# 4. 查看状态
sudo systemctl status cloudflared
```

### 步骤 2: 配置 Cloudflare DNS

登录 Cloudflare Dashboard: https://dash.cloudflare.com

**添加新的 CNAME 记录：**

| 类型 | 名称 | 目标 | 代理状态 |
|------|------|------|----------|
| CNAME | **api** | 9557c896-c0d5-4b97-b4d2-dc8fd8cd93b0.cfargotunnel.com | 已代理（橙色云朵） |

**已有的记录（确认存在）：**

| 类型 | 名称 | 目标 | 代理状态 |
|------|------|------|----------|
| CNAME | www | 9557c896-c0d5-4b97-b4d2-dc8fd8cd93b0.cfargotunnel.com | 已代理 |
| CNAME | supabase | 9557c896-c0d5-4b97-b4d2-dc8fd8cd93b0.cfargotunnel.com | 已代理 |

**添加步骤：**
1. 选择域名 `promto.org`
2. 进入 **DNS** → **记录**
3. 点击 **添加记录**
4. 填写：
   - 类型: `CNAME`
   - 名称: `api`
   - 目标: `9557c896-c0d5-4b97-b4d2-dc8fd8cd93b0.cfargotunnel.com`
   - 代理状态: **已代理**（橙色云朵）
5. 保存

### 步骤 3: 验证连接

等待 DNS 传播（通常 1-5 分钟），然后测试：

```bash
# 测试 Supabase API 连接
curl https://api.promto.org

# 测试 Supabase Studio
curl https://supabase.promto.org
```

预期结果：应该返回 HTML 或 JSON 响应，而不是错误。

### 步骤 4: 在 v0.app 配置环境变量

在 v0.app 项目设置中添加以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://api.promto.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

**重要提示：**
- ✅ 使用 `https://api.promto.org`（不是 http://127.0.0.1:54321）
- ✅ 使用你的实际 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ 确保使用 `https://`（Cloudflare 会自动提供 SSL）

**如何在 v0.app 添加环境变量：**

1. 打开你的 v0.app 项目
2. 进入项目设置 (Settings)
3. 找到 **Environment Variables** 部分
4. 添加以上两个变量
5. 保存并重新部署

### 步骤 5: 测试

在 v0.app 部署完成后：

1. 打开你的 v0.app 预览 URL
2. 检查浏览器控制台是否有错误
3. 测试 Supabase 功能（如果有的话）

## 🔐 安全注意事项

### 当前配置的安全性

✅ **已有的安全措施：**
- Cloudflare Tunnel 加密通道
- Cloudflare CDN 和 DDoS 保护
- HTTPS 自动加密
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是公开密钥（设计上可以暴露）

⚠️ **需要注意：**
- 本地 Supabase 通过公网可访问
- 确保已配置 Supabase Row Level Security (RLS)
- 不要在客户端代码中使用 `SUPABASE_SERVICE_ROLE_KEY`

### 配置 Supabase 安全策略

在 Supabase Studio (https://supabase.promto.org) 中：

1. 启用 Row Level Security (RLS):
```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

2. 创建访问策略:
```sql
-- 示例：用户只能查看自己的数据
CREATE POLICY "Users can view own data"
  ON your_table FOR SELECT
  USING (auth.uid() = user_id);
```

## 🛠️ 故障排查

### 问题 1: v0.app 连接超时

**可能原因：**
- DNS 还未传播
- Cloudflared 服务未运行
- 防火墙阻止

**解决方法：**
```bash
# 检查 DNS
nslookup api.promto.org

# 检查 Cloudflared 状态
sudo systemctl status cloudflared

# 查看日志
sudo journalctl -u cloudflared -f
```

### 问题 2: CORS 错误

如果在 v0.app 上看到 CORS 错误：

**解决方法：**

编辑 Supabase 配置 `supabase/config.toml`：

```toml
[api]
# 添加你的 v0.app 域名
extra_cors_origins = ["https://your-app.v0.app"]
```

然后重启 Supabase：
```bash
export PATH="$HOME/.local/bin:$PATH"
supabase stop
supabase start
```

### 问题 3: 401 未授权错误

**可能原因：**
- API Key 不正确
- 环境变量未正确设置

**解决方法：**
1. 确认 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 正确
2. 在 v0.app 重新部署
3. 检查浏览器控制台的实际请求

### 问题 4: 本地 Supabase 未运行

```bash
# 检查 Supabase 状态
export PATH="$HOME/.local/bin:$PATH"
supabase status

# 如果未运行，启动它
supabase start
```

## 📊 完整的服务访问地址

| 服务 | 本地地址 | 公网地址 | 用途 |
|------|----------|----------|------|
| Next.js App | http://localhost:3000 | https://www.promto.org | 主应用 |
| Supabase Studio | http://127.0.0.1:54323 | https://supabase.promto.org | 数据库管理 |
| Supabase API | http://127.0.0.1:54321 | https://api.promto.org | API 端点 |
| PostgreSQL | localhost:54322 | - | 数据库直连 |
| Mailpit | http://127.0.0.1:54324 | - | 邮件测试 |

## 🎯 使用场景

### 场景 1: 在 v0.app 编辑 UI，使用本地数据

1. v0.app 连接到 `https://api.promto.org`
2. 在本地 Supabase Studio 管理数据
3. v0.app 实时看到数据变化

### 场景 2: 团队协作

1. 团队成员通过 `https://supabase.promto.org` 查看数据库
2. 开发者在 v0.app 上编辑前端
3. 所有人共享同一个本地 Supabase 实例

### 场景 3: 快速原型开发

1. 在本地快速修改数据库结构
2. 在 v0.app 上调整 UI
3. 实时测试和迭代

## 📝 环境变量汇总

### 本地开发 (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### v0.app 环境变量
```bash
NEXT_PUBLIC_SUPABASE_URL=https://api.promto.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### 生产环境（Vercel/其他）
```bash
NEXT_PUBLIC_SUPABASE_URL=https://api.promto.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

## ⚡ 性能优化建议

### 1. 启用 Cloudflare 缓存

在 Cloudflare Dashboard 中：
- 设置缓存级别为 "Standard"
- 为静态资源启用缓存

### 2. 压缩响应

Cloudflare 会自动启用 Brotli/Gzip 压缩。

### 3. 监控延迟

由于 v0.app → Cloudflare → 本地，可能会有一些延迟：
- 预计 RTT: 50-200ms（取决于地理位置）
- 可接受用于开发和测试

## 🔗 相关链接

- [Cloudflare Tunnel 文档](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Supabase 文档](https://supabase.com/docs)
- [v0.app 文档](https://v0.dev/docs)

## ✅ 配置检查清单

使用此清单确保所有配置正确：

- [ ] Cloudflared 配置已更新（包含 api.promto.org）
- [ ] Cloudflared 服务已重启
- [ ] Cloudflare DNS 已添加 api CNAME 记录
- [ ] DNS 已传播（可以 ping 通 api.promto.org）
- [ ] 本地 Supabase 正在运行
- [ ] v0.app 环境变量已配置
- [ ] v0.app 项目已重新部署
- [ ] 测试连接成功

---

**💡 提示：** 保持你的本地服务器运行，v0.app 才能访问到数据。如果本地服务器关机，v0.app 将无法连接。

**🎉 完成！** 现在你可以在 v0.app 上愉快地使用本地 Supabase 了！

