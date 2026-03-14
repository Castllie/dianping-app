# 技术架构文档

## 系统架构
采用前后端分离架构，前端使用React + TypeScript，后端使用Node.js + Express + TypeScript，数据库使用PostgreSQL（通过Supabase服务）。

## 前端架构
- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **路由**: React Router DOM
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios
- **地图服务**: 集成第三方地图API

### 页面结构
- 首页：商家列表和搜索
- 商家详情页：商家信息和评价列表
- 用户中心：个人资料管理
- 登录/注册页：用户认证

## 后端架构
- **运行时**: Node.js
- **框架**: Express.js + TypeScript
- **数据库**: PostgreSQL (Supabase)
- **认证**: JWT + Supabase Auth
- **文件存储**: Supabase Storage

### API设计
- `/api/auth/*`: 用户认证相关
- `/api/users/*`: 用户管理
- `/api/businesses/*`: 商家信息管理
- `/api/reviews/*`: 评价管理
- `/api/categories/*`: 分类管理

## 数据库设计

### 用户表 (users)
```sql
id: UUID (主键)
email: VARCHAR(255) (唯一)
phone: VARCHAR(20)
password_hash: VARCHAR(255)
nickname: VARCHAR(100)
avatar_url: TEXT
user_type: ENUM('user', 'merchant')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### 商家表 (businesses)
```sql
id: UUID (主键)
name: VARCHAR(255)
category_id: UUID (外键)
description: TEXT
address: TEXT
phone: VARCHAR(20)
opening_hours: TEXT
latitude: DECIMAL(10,8)
longitude: DECIMAL(11,8)
images: JSON
rating: DECIMAL(3,2)
review_count: INTEGER
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### 分类表 (categories)
```sql
id: UUID (主键)
name: VARCHAR(100)
icon: VARCHAR(100)
sort_order: INTEGER
```

### 评价表 (reviews)
```sql
id: UUID (主键)
user_id: UUID (外键)
business_id: UUID (外键)
rating: INTEGER (1-5)
content: TEXT
images: JSON
is_merchant_reply: BOOLEAN
parent_id: UUID (自引用，用于商家回复)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

## 部署架构
- **前端**: 静态文件托管（Vercel/Netlify）
- **后端**: Node.js应用部署（Railway/Render）
- **数据库**: Supabase PostgreSQL
- **文件存储**: Supabase Storage
- **CDN**: 使用CDN加速静态资源

## 安全考虑
- JWT token认证
- 输入验证和SQL注入防护
- CORS配置
- HTTPS强制使用
- 文件上传安全检查