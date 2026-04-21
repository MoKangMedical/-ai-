# 学术写作助手技术架构

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  首页    │  │  编辑器  │  │  文档    │  │  价格    │   │
│  │ Home.tsx │  │Editor.tsx│  │Docs.tsx  │  │Price.tsx │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                         │                                     │
│                    tRPC Client                                │
│                    (lib/trpc.ts)                              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Express 服务器                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              tRPC Router (routers.ts)                  │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │  │
│  │  │  auth   │  │document │  │   ai    │  │ system  │ │  │
│  │  │  路由   │  │  路由   │  │  路由   │  │  路由   │ │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘ │  │
│  └───────┼────────────┼────────────┼────────────┼───────┘  │
│          │            │            │            │           │
│  ┌───────▼────────────▼────────────▼────────────▼───────┐  │
│  │              数据库操作层 (db.ts)                      │  │
│  │  • getUserByOpenId()                                  │  │
│  │  • createDocument()                                   │  │
│  │  • updateDocument()                                   │  │
│  │  • deleteDocument()                                   │  │
│  │  • saveAIHistory()                                    │  │
│  └───────────────────────┬───────────────────────────────┘  │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────────┐  │
│  │              AI 服务层 (kimi.ts)                       │  │
│  │  • translateText()      • polishText()                │  │
│  │  • checkGrammar()       • correctTense()              │  │
│  │  • convertStyle()       • optimizeSentence()          │  │
│  │  • enhanceLogic()       • improveParagraph()          │  │
│  │  • continueWriting()                                  │  │
│  └───────────────────────┬───────────────────────────────┘  │
└──────────────────────────┼─────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  MySQL/TiDB   │  │  Kimi 2.5 API │  │  Manus OAuth  │
│   数据库      │  │   大模型      │  │   认证服务    │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## 数据流向

### 1. 用户登录流程
```
用户点击登录
  → 跳转到 Manus OAuth 登录页
  → 用户授权
  → 回调到 /api/oauth/callback
  → 创建/更新用户记录（users 表）
  → 设置 Session Cookie
  → 跳转回首页
```

### 2. AI 处理流程
```
用户在编辑器选择文本
  → 点击 AI 功能按钮
  → 前端调用 tRPC: trpc.ai.translate.mutate()
  → 后端检查用户登录状态
  → 调用 kimi.ts 的 translateText()
  → 发送请求到 Kimi API
  → 接收 AI 响应
  → 保存处理记录到 ai_history 表
  → 返回结果给前端
  → 前端展示结果
```

### 3. 文档保存流程
```
用户编辑文档内容
  → 点击保存按钮
  → 前端调用 tRPC: trpc.document.save.mutate()
  → 后端验证用户权限
  → 更新 documents 表
  → 返回成功状态
  → 前端显示保存成功提示
```

---

## 数据库设计

### users 表（用户信息）
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,    -- Manus OAuth ID
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### documents 表（文档）
```sql
CREATE TABLE documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,                   -- 关联 users.id
  title TEXT NOT NULL,
  content TEXT,                          -- 文档内容
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### ai_history 表（AI 处理历史）
```sql
CREATE TABLE ai_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,                   -- 关联 users.id
  documentId INT,                        -- 关联 documents.id（可选）
  actionType VARCHAR(50) NOT NULL,       -- 操作类型：translate/polish/grammar等
  inputText TEXT NOT NULL,               -- 输入文本
  outputText TEXT NOT NULL,              -- AI 输出结果
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE SET NULL
);
```

### 待添加的表

#### orders 表（订单）
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  orderNo VARCHAR(64) UNIQUE NOT NULL,   -- 订单号
  plan ENUM('basic', 'pro', 'premium'),  -- 套餐类型
  amount DECIMAL(10, 2) NOT NULL,        -- 金额
  status ENUM('pending', 'paid', 'failed', 'refunded'),
  paymentMethod VARCHAR(50),             -- 支付方式：wechat/alipay
  transactionId VARCHAR(128),            -- 第三方交易ID
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paidAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

#### subscriptions 表（订阅）
```sql
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  plan ENUM('basic', 'pro', 'premium'),
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  autoRenew BOOLEAN DEFAULT FALSE,
  status ENUM('active', 'expired', 'cancelled'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## API 路由结构

### auth 路由（认证）
```typescript
auth: router({
  me: publicProcedure.query(),           // 获取当前用户信息
  logout: publicProcedure.mutation(),    // 登出
}),
```

### document 路由（文档管理）
```typescript
document: router({
  list: protectedProcedure.query(),      // 获取文档列表
  get: protectedProcedure.input(z.object({ id: z.number() })).query(),
  save: protectedProcedure.input(z.object({ id?, title, content })).mutation(),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(),
}),
```

### ai 路由（AI 功能）
```typescript
ai: router({
  translate: protectedProcedure.input(z.object({ text, targetLang })).mutation(),
  polish: protectedProcedure.input(z.object({ text, discipline })).mutation(),
  checkGrammar: protectedProcedure.input(z.object({ text })).mutation(),
  correctTense: protectedProcedure.input(z.object({ text })).mutation(),
  convertStyle: protectedProcedure.input(z.object({ text, style })).mutation(),
  optimizeSentence: protectedProcedure.input(z.object({ text })).mutation(),
  enhanceLogic: protectedProcedure.input(z.object({ text })).mutation(),
  improveParagraph: protectedProcedure.input(z.object({ text })).mutation(),
  continueWriting: protectedProcedure.input(z.object({ text, context })).mutation(),
}),
```

### 待添加：payment 路由（支付）
```typescript
payment: router({
  createOrder: protectedProcedure.input(z.object({ plan, period })).mutation(),
  verifyPayment: protectedProcedure.input(z.object({ orderNo })).mutation(),
  getOrders: protectedProcedure.query(),
}),
```

---

## 前端组件层次

```
App.tsx (路由根组件)
├── ThemeProvider (主题上下文)
├── TooltipProvider (提示框上下文)
└── Router
    ├── Home.tsx (首页)
    │   ├── Header (导航栏)
    │   ├── Hero Section (主标题区)
    │   ├── Features Section (功能展示)
    │   └── CTA Section (行动号召)
    │
    ├── Editor.tsx (编辑器)
    │   ├── Header (导航栏)
    │   ├── Toolbar (工具栏)
    │   ├── Textarea (文本编辑区)
    │   ├── AI Panel (AI 功能面板)
    │   │   ├── Button (翻译)
    │   │   ├── Button (润色)
    │   │   ├── Button (语法校对)
    │   │   └── ...
    │   └── Result Dialog (结果展示弹窗)
    │
    ├── Documents.tsx (文档列表)
    │   ├── Header (导航栏)
    │   ├── Search Bar (搜索栏)
    │   └── Document Cards (文档卡片列表)
    │
    └── Pricing.tsx (会员价格)
        ├── Header (导航栏)
        ├── Hero Section (标题区)
        ├── Pricing Cards (价格卡片)
        │   ├── Basic Plan (基础版)
        │   ├── Pro Plan (专业版)
        │   └── Premium Plan (旗舰版)
        ├── Comparison Table (功能对比表)
        └── FAQ Section (常见问题)
```

---

## 技术栈详解

### 前端
- **React 19**：最新版本，支持 Server Components（未使用）
- **TypeScript**：类型安全
- **TailwindCSS 4**：原子化 CSS，使用 OKLCH 色彩空间
- **Wouter**：轻量级路由（替代 React Router）
- **tRPC**：类型安全的 API 调用
- **shadcn/ui**：高质量 UI 组件库
- **Lucide React**：图标库

### 后端
- **Express 4**：Web 服务器框架
- **tRPC 11**：类型安全的 RPC 框架
- **Drizzle ORM**：类型安全的 ORM
- **Superjson**：支持 Date、Map、Set 等类型的序列化
- **Zod**：运行时类型验证

### 数据库
- **MySQL/TiDB**：关系型数据库
- **Drizzle Kit**：数据库迁移工具

### AI
- **Kimi 2.5**：月之暗面大模型
- **Axios**：HTTP 客户端

### 开发工具
- **Vite**：构建工具
- **TSX**：TypeScript 执行器
- **Vitest**：单元测试框架
- **ESBuild**：生产环境打包

---

## 性能优化策略

### 前端优化
1. **懒加载**：路由组件按需加载（Wouter 自动支持）
2. **防抖**：编辑器自动保存使用防抖（300ms）
3. **虚拟滚动**：文档列表超过100条时使用虚拟滚动
4. **图片优化**：使用 WebP 格式，懒加载

### 后端优化
1. **数据库索引**：在 userId、createdAt 等字段添加索引
2. **查询优化**：使用 Drizzle 的 select 指定字段，避免查询全表
3. **缓存**：AI 处理结果缓存（相同输入返回缓存结果）
4. **限流**：防止 API 滥用（每用户每分钟最多10次 AI 请求）

### AI 调用优化
1. **流式输出**：长文本使用 SSE 流式返回
2. **批量处理**：多个段落合并为一次请求
3. **超时控制**：AI 请求超时时间设为30秒
4. **错误重试**：失败后自动重试1次

---

## 安全措施

### 认证与授权
- ✅ 使用 Manus OAuth，不存储密码
- ✅ Session Cookie 使用 HttpOnly + Secure
- ✅ tRPC 的 protectedProcedure 自动验证登录状态
- ⏳ 待添加：会员权限验证中间件

### 数据安全
- ✅ 数据库连接使用 SSL
- ✅ 环境变量加密存储
- ✅ API Key 仅在服务器端使用
- ⏳ 待添加：敏感数据加密存储

### 输入验证
- ✅ 使用 Zod 验证所有输入
- ✅ 防止 SQL 注入（Drizzle ORM 自动处理）
- ✅ 防止 XSS（React 自动转义）
- ⏳ 待添加：文件上传大小限制

---

## 部署架构

```
用户
  │
  ▼
CDN (静态资源)
  │
  ▼
负载均衡器
  │
  ├─▶ 应用服务器 1 (Express + tRPC)
  ├─▶ 应用服务器 2 (Express + tRPC)
  └─▶ 应用服务器 3 (Express + tRPC)
       │
       ▼
   数据库集群 (MySQL/TiDB)
       │
       ├─▶ 主库 (读写)
       └─▶ 从库 (只读)
```

### 环境变量
- `NODE_ENV`：production / development
- `DATABASE_URL`：数据库连接字符串
- `KIMI_API_KEY`：Kimi API 密钥
- `JWT_SECRET`：Session 加密密钥
- `OAUTH_SERVER_URL`：OAuth 服务地址

---

## 监控与日志

### 日志文件
- `devserver.log`：服务器启动和错误日志
- `browserConsole.log`：前端控制台日志
- `networkRequests.log`：HTTP 请求日志
- `sessionReplay.log`：用户交互日志

### 监控指标
- API 响应时间
- AI 调用成功率
- 数据库查询时间
- 用户活跃度
- 错误率

---

## 扩展性设计

### 水平扩展
- 应用服务器无状态，可随时增加实例
- Session 存储在数据库，支持多实例共享
- 静态资源使用 CDN

### 功能扩展
- 插件系统：支持第三方 AI 模型
- Webhook：支持外部系统集成
- API 开放：为企业用户提供 REST API

---

**文档版本**：v1.0  
**更新日期**：2026-02-22
