# 部署指南

## 概述
本文档提供大众点评网站应用的完整部署指南，包括前端、后端和数据库的部署步骤。

## 环境要求

### 系统要求
- Node.js 18+ 
- npm 或 pnpm
- Git

### 数据库要求
- PostgreSQL 14+（通过Supabase提供）

## 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Vercel) │    │  后端 (Railway) │    │ 数据库 (Supabase)│
│                 │    │                 │    │                 │
│ React + TS      │◄──►│ Node.js + Exp   │◄──►│ PostgreSQL      │
│ Tailwind CSS    │    │ TypeScript      │    │ Row Level Sec   │
│                 │    │ JWT Auth        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 数据库部署（Supabase）

### 1. 创建Supabase项目
1. 访问 [https://supabase.com](https://supabase.com)
2. 注册账号并登录
3. 点击"New Project"创建新项目
4. 填写项目信息：
   - 项目名称：dianping-app
   - 数据库密码：设置强密码
   - 地区：选择最近的地区

### 2. 获取API密钥
1. 进入项目设置（Settings）
2. 点击"API"选项卡
3. 复制以下信息：
   - Project URL（项目URL）
   - anon public（匿名公钥）
   - service_role（服务端角色密钥）

### 3. 执行数据库迁移
1. 进入SQL编辑器（SQL Editor）
2. 执行 `supabase/migrations/001_create_tables.sql` 文件内容
3. 执行 `supabase/migrations/002_insert_sample_data.sql` 文件内容

### 4. 配置数据库权限
在Supabase控制台中执行以下SQL命令：

```sql
-- 确保权限正确
GRANT SELECT ON users TO anon, authenticated;
GRANT UPDATE ON users TO authenticated;
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON businesses TO anon, authenticated;
GRANT INSERT, UPDATE ON businesses TO authenticated;
GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON reviews TO authenticated;
```

## 图片存储（Supabase Storage）

商家上传本地图片文件会将图片存储到 Supabase Storage，并把图片的公开 URL 写入 `businesses.images` 字段。

### 1. 创建 Storage Bucket
1. 进入 Supabase 控制台 → Storage → Buckets
2. 新建 bucket：`business-images`
3. 访问权限：选择 Public（公开桶，便于前端直接展示图片）

### 2. 验证桶是否可访问
上传任意图片到 bucket 后，点击文件获取 Public URL，在浏览器打开能正常显示即可。

## 后端部署（Railway）

### 1. 准备后端代码
确保后端代码已推送到GitHub仓库。

### 2. 创建Railway项目
1. 访问 [https://railway.app](https://railway.app)
2. 注册账号并登录
3. 点击"New Project"
4. 选择"Deploy from GitHub repo"
5. 选择你的代码仓库

### 3. 配置环境变量
在Railway项目设置中配置以下环境变量：

```bash
# Supabase配置
SUPABASE_URL=你的Supabase项目URL
SUPABASE_ANON_KEY=你的Supabase匿名公钥
SUPABASE_SERVICE_KEY=你的Supabase服务端密钥

# JWT配置
JWT_SECRET=生成一个强密钥

# 服务器配置
PORT=3001
NODE_ENV=production
```

### 4. 部署后端
Railway会自动检测并部署Node.js应用，部署完成后会提供访问URL。

### 5. 验证部署
访问 `https://your-app.railway.app/api/health` 验证后端是否正常运行。

## 前端部署（Vercel）

### 1. 准备前端代码
确保前端代码已推送到GitHub仓库。

### 2. 创建Vercel项目
1. 访问 [https://vercel.com](https://vercel.com)
2. 注册账号并登录
3. 点击"New Project"
4. 导入GitHub仓库

### 3. 配置构建设置
在Vercel项目设置中配置：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### 4. 配置环境变量
在Vercel项目设置中添加环境变量：

```bash
# API配置
VITE_API_URL=你的后端Railway URL
```

### 5. 修改前端API配置
更新 `src/stores/authStore.ts` 和 `src/stores/businessStore.ts` 中的API URL：

```typescript
// 将 /api 替换为你的后端URL
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`)
```

### 6. 部署前端
Vercel会自动构建并部署前端应用。

## 完整部署配置

### 环境变量配置

#### 后端 (.env)
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-jwt-secret-key

# Server
PORT=3001
NODE_ENV=production
```

#### 前端 (.env)
```bash
VITE_API_URL=https://your-backend.railway.app
```

## 单台服务器（Nginx）部署注意事项（图片上传）

如果你在自建服务器上使用 Nginx 反向代理 `/api`，默认上传体积可能只有 1MB，图片上传会失败（413/502）。
建议在你的站点 `server {}` 中增加：

```nginx
client_max_body_size 10m;
```

修改后执行：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 部署验证清单

#### 数据库验证
- [ ] 所有表已创建
- [ ] 示例数据已插入
- [ ] 权限配置正确
- [ ] 行级安全已启用

#### 后端验证
- [ ] 健康检查端点正常
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 商家列表API正常
- [ ] 评价功能正常

#### 前端验证
- [ ] 页面加载正常
- [ ] 用户注册/登录正常
- [ ] 商家列表显示正常
- [ ] 评价提交正常
- [ ] 搜索功能正常

## 监控和维护

### 日志监控
- 使用Railway的日志功能监控后端
- 使用Vercel的Analytics监控前端

### 性能监控
- 监控API响应时间
- 监控数据库查询性能
- 监控前端加载时间

### 备份策略
- 定期备份Supabase数据库
- 使用Git版本控制代码

## 故障排除

### 常见问题

#### 数据库连接失败
1. 检查Supabase URL是否正确
2. 检查API密钥是否正确
3. 检查网络连接

#### 后端API无响应
1. 检查Railway日志
2. 验证环境变量配置
3. 检查数据库连接

#### 前端构建失败
1. 检查依赖包是否安装
2. 验证环境变量配置
3. 检查构建命令

### 联系方式
如遇到部署问题，请联系技术支持：
- 邮箱：support@dianping.com
- 文档：[项目文档](README.md)

## 更新和回滚

### 代码更新
1. 更新本地代码
2. 推送到GitHub
3. Railway和Vercel会自动部署

### 数据库更新
1. 在本地测试数据库迁移
2. 在Supabase执行迁移脚本
3. 验证数据完整性

### 回滚策略
1. 使用Git回滚代码
2. 使用数据库备份恢复数据
3. 重新部署应用
