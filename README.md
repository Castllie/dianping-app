# 大众点评网站应用

一个简化版的大众点评网站应用，提供用户注册登录、商家信息展示、用户评价和搜索功能。

## 功能特性

### 用户系统
- ✅ 用户注册/登录（邮箱+密码）
- ✅ 个人资料管理
- ✅ 用户权限管理（普通用户/商家用户）

### 商家模块
- ✅ 商家信息展示
- ✅ 商家分类检索
- ✅ 地理位置展示

### 点评模块
- ✅ 用户评价功能（星级+文字）
- ✅ 评价展示（时间排序，分页）
- ✅ 商家回复功能

### 搜索功能
- ✅ 按商家名称/分类搜索
- ✅ 简单筛选功能（按评分等）

## 技术栈

### 前端
- React 18 + TypeScript
- React Router DOM
- Zustand（状态管理）
- Tailwind CSS（样式）
- Axios（HTTP客户端）
- Lucide React（图标）

### 后端
- Node.js + Express + TypeScript
- JWT（身份认证）
- Supabase（PostgreSQL数据库）

### 部署
- 前端：Vercel/Netlify
- 后端：Railway/Render
- 数据库：Supabase

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env` 并填写相关配置：
```bash
cp .env.example .env
```

### 3. 配置 Supabase
1. 在 [Supabase](https://supabase.com) 创建项目
2. 执行数据库迁移文件 `supabase/migrations/001_create_tables.sql`
3. 执行示例数据 `supabase/migrations/002_insert_sample_data.sql`
4. 获取 API 密钥并填入 `.env` 文件

### 4. 启动开发服务器
```bash
# 同时启动前端和后端
npm run dev

# 单独启动前端
npm run dev:frontend

# 单独启动后端
npm run dev:backend
```

### 5. 访问应用
- 前端：http://localhost:3000
- 后端 API：http://localhost:3001

## 项目结构

```
├── src/                    # 前端代码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── stores/            # 状态管理
│   └── utils/             # 工具函数
├── api/                    # 后端代码
│   ├── routes/            # API 路由
│   ├── middleware/        # 中间件
│   └── config/            # 配置文件
├── supabase/              # 数据库相关
│   └── migrations/        # 数据库迁移文件
└── shared/                # 共享类型定义
```

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户相关
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息

### 商家相关
- `GET /api/businesses` - 获取商家列表
- `GET /api/businesses/:id` - 获取商家详情
- `GET /api/businesses/search` - 搜索商家

### 评价相关
- `GET /api/reviews` - 获取评价列表
- `POST /api/reviews` - 创建评价
- `POST /api/reviews/:id/reply` - 商家回复评价

### 分类相关
- `GET /api/categories` - 获取分类列表

## 部署指南

### 前端部署（Vercel）
1. 在 Vercel 导入 GitHub 仓库
2. 配置环境变量
3. 部署

### 后端部署（Railway）
1. 在 Railway 导入 GitHub 仓库
2. 配置环境变量
3. 部署

### 数据库（Supabase）
1. 创建 Supabase 项目
2. 执行迁移脚本
3. 获取 API 密钥

## 开发计划

- [ ] 手机号+验证码登录
- [ ] 地图集成（显示商家位置）
- [ ] 图片上传功能
- [ ] 评价图片上传
- [ ] 商家认领功能
- [ ] 收藏功能
- [ ] 分享功能
- [ ] 移动端优化

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License