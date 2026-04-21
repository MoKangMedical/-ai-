# 学术写作助手项目交接文档

## 项目概述

**项目名称**：学术写作助手 (Academic Writing Assistant)

**项目定位**：基于 Kimi 2.5 大模型的智能学术写作平台，提供翻译、润色、语法校对、智能续写等全方位写作支持

**设计风格**：参考 bmysci.com，采用深紫色渐变背景、玻璃态卡片效果、现代化动画交互

**技术栈**：
- 前端：React 19 + TypeScript + TailwindCSS 4 + Wouter
- 后端：Express 4 + tRPC 11 + Drizzle ORM
- 数据库：MySQL/TiDB
- AI：Kimi 2.5 大模型（通过 KIMI_API_KEY 环境变量配置）

---

## 项目结构

```
/home/ubuntu/academic-writing-assistant/
├── client/                    # 前端代码
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   │   ├── Home.tsx      # 首页（深紫色主题）
│   │   │   ├── Editor.tsx    # 编辑器页面（核心功能）
│   │   │   ├── Documents.tsx # 文档列表页
│   │   │   └── Pricing.tsx   # 会员价格页面
│   │   ├── components/       # UI 组件（shadcn/ui）
│   │   ├── lib/trpc.ts       # tRPC 客户端配置
│   │   └── index.css         # 全局样式（深紫色主题变量）
│   └── public/               # 静态资源
├── server/
│   ├── routers.ts            # tRPC 路由定义（核心 API）
│   ├── db.ts                 # 数据库操作函数
│   ├── kimi.ts               # Kimi API 封装
│   └── _core/                # 框架核心（不建议修改）
├── drizzle/
│   ├── schema.ts             # 数据库表结构定义
│   └── *.sql                 # 数据库迁移文件
└── todo.md                   # 任务清单（重要！）
```

---

## 核心功能已实现

### 1. 用户认证系统
- 基于 Manus OAuth 的登录注册
- 用户信息存储在 `users` 表
- 角色系统：`admin` / `user`

### 2. 文档管理
- 创建、编辑、保存、删除文档
- 文档列表展示（按更新时间排序）
- 数据库表：`documents`（包含 userId, title, content, createdAt, updatedAt）

### 3. AI 功能（10种）
所有 AI 功能通过 `server/kimi.ts` 调用 Kimi 2.5 API：
- 学科翻译（中英互译）
- 学科润色
- 语法校对
- 时态校正
- 英式美式英语转换
- 句式结构优化
- 逻辑连贯性增强
- 段落结构优化
- 智能续写
- AI 处理历史记录（存储在 `ai_history` 表）

### 4. 会员体系设计
- **基础版**：¥99/月（10,000字/月）
- **专业版**：¥299/月（50,000字/月，推荐）
- **旗舰版**：¥599/月（无限字数）
- 会员价格页面：`/pricing`
- 功能对比表已完成

---

## 待完善功能（优先级排序）

### 高优先级
1. **支付功能集成**
   - 接入微信支付和支付宝
   - 创建订单表（`orders`）
   - 实现订阅逻辑（月付/季付/年付）
   - 文件位置：需要新增 `server/payment.ts` 和相关 tRPC 路由

2. **会员权限控制**
   - 在 `users` 表添加字段：`membershipLevel`（basic/pro/premium）、`membershipExpiry`（过期时间）、`monthlyQuota`（月度配额）、`usedQuota`（已用配额）
   - 在 AI 处理前检查用户配额
   - 每月1日重置 `usedQuota`
   - 文件位置：`server/routers.ts` 中的 AI 路由需要添加权限检查

3. **使用统计面板**
   - 创建 `/dashboard` 页面
   - 展示：当月已用字数、剩余配额、AI 处理历史、会员到期时间
   - 添加图表展示使用趋势（使用 recharts）

### 中优先级
4. **文档导出功能**
   - 导出为 Word（.docx）
   - 导出为 PDF
   - 使用库：`docx` 或 `pdfkit`

5. **团队协作功能**（旗舰版专属）
   - 文档共享和权限管理
   - 多人实时编辑（可选，复杂度高）
   - 需要新增 `document_shares` 表

6. **移动端优化**
   - 当前响应式设计基本完成，但需要优化触摸交互
   - 测试并调整移动端编辑器体验

### 低优先级
7. **3D 图标和视觉元素**
   - 参考 bmysci.com 添加 3D 渲染图标
   - 可使用 Spline 或 Three.js

8. **API 接口访问**（旗舰版专属）
   - 为企业用户提供 REST API
   - 需要 API Key 管理系统

---

## 关键配置

### 环境变量（已配置）
- `KIMI_API_KEY`：Kimi 2.5 API 密钥（已通过 webdev_request_secrets 配置）
- `DATABASE_URL`：数据库连接字符串（系统自动注入）
- `JWT_SECRET`：会话加密密钥（系统自动注入）
- 其他系统环境变量见 `server/_core/env.ts`

### 数据库表结构
当前已有3个表：
1. `users`：用户信息（id, openId, name, email, role, createdAt, updatedAt, lastSignedIn）
2. `documents`：文档（id, userId, title, content, createdAt, updatedAt）
3. `ai_history`：AI 处理历史（id, userId, documentId, actionType, inputText, outputText, createdAt）

**需要添加的表**：
- `orders`：订单记录
- `subscriptions`：订阅记录
- `document_shares`：文档共享（团队协作）

---

## 开发流程

### 1. 修改数据库结构
```bash
# 1. 编辑 drizzle/schema.ts 添加新表
# 2. 生成迁移文件
cd /home/ubuntu/academic-writing-assistant
pnpm drizzle-kit generate

# 3. 查看生成的 SQL 文件
cat drizzle/0002_*.sql

# 4. 通过 webdev_execute_sql 工具执行 SQL
# （在 Manus 中调用，不是命令行）
```

### 2. 添加后端 API
编辑 `server/routers.ts`，添加新的 tRPC 路由：
```typescript
// 示例：添加支付路由
payment: router({
  createOrder: protectedProcedure
    .input(z.object({ plan: z.enum(['basic', 'pro', 'premium']) }))
    .mutation(async ({ ctx, input }) => {
      // 创建订单逻辑
    }),
}),
```

### 3. 添加前端页面
在 `client/src/pages/` 创建新页面，然后在 `client/src/App.tsx` 添加路由：
```typescript
<Route path={"/dashboard"} component={Dashboard} />
```

### 4. 测试
```bash
# 运行测试
pnpm test

# 检查 TypeScript 错误
pnpm check
```

### 5. 保存检查点
使用 `webdev_save_checkpoint` 工具保存进度。

---

## 设计规范

### 配色方案（深紫色主题）
- 主背景渐变：`from-[#1a0f2e] via-[#2d1b4e] to-[#3d2b5e]`
- 主色调：`--primary: oklch(0.55 0.25 285)`（紫色）
- 强调色：`--accent: oklch(0.7 0.2 50)`（金色）
- 文字颜色：白色 + 透明度（`text-white/80`）
- 卡片：`bg-white/5` + `backdrop-blur-sm`（玻璃态效果）
- 边框：`border-white/10`

### 按钮样式
- 主按钮：`bg-gradient-to-r from-primary to-accent`
- 次要按钮：`bg-white/10 text-white hover:bg-white/20`

### 动画效果
- 卡片悬停：`hover:-translate-y-2 hover:shadow-2xl`
- 图标旋转：`group-hover:scale-110 group-hover:rotate-6`
- 过渡时间：`transition-all duration-300`

---

## 常见问题

### Q1: 如何修改 AI 功能的 prompt？
**A**: 编辑 `server/kimi.ts`，找到对应的 AI 功能函数，修改 `systemPrompt` 变量。

### Q2: 如何添加新的 AI 功能？
**A**: 
1. 在 `server/kimi.ts` 添加新函数
2. 在 `server/routers.ts` 的 `ai` 路由添加新接口
3. 在 `client/src/pages/Editor.tsx` 的 AI 面板添加新按钮

### Q3: 如何测试支付功能？
**A**: 建议使用支付宝/微信支付的沙箱环境进行测试，避免真实交易。

### Q4: 数据库迁移失败怎么办？
**A**: 
1. 检查 SQL 语法是否正确
2. 查看 `.manus-logs/devserver.log` 日志
3. 使用 `webdev_rollback_checkpoint` 回滚到上一个版本

### Q5: 如何查看用户的 Kimi API 使用量？
**A**: 在 `ai_history` 表中统计，可以按 `userId` 和日期范围查询。

---

## 重要提醒

1. **不要修改 `server/_core/` 目录**：这是框架核心代码，修改可能导致系统崩溃

2. **所有 AI 调用必须在后端**：不要在前端直接调用 Kimi API，避免泄露 API Key

3. **数据库操作使用 Drizzle ORM**：不要直接写原生 SQL（除了迁移文件）

4. **遵循 tRPC 规范**：所有 API 通过 tRPC 定义，保持类型安全

5. **定期保存检查点**：每完成一个功能模块就保存检查点，方便回滚

6. **查看 todo.md**：所有待办任务都记录在 `todo.md` 中，完成后标记为 `[x]`

---

## 联系方式

如有问题，请参考：
- 项目 README：`/home/ubuntu/academic-writing-assistant/README.md`
- Manus 官方文档：https://docs.manus.im
- tRPC 文档：https://trpc.io
- Drizzle ORM 文档：https://orm.drizzle.team

---

**交接日期**：2026-02-22  
**当前版本**：a0e76c16  
**项目状态**：核心功能已完成，待完善支付和会员系统
