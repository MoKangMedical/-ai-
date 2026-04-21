# OpenClaw 快速启动指南

欢迎接手学术写作助手项目！这份文档将帮助你快速上手。

---

## 第一步：了解项目现状

### 已完成功能 ✅
- ✅ 用户登录注册系统（Manus OAuth）
- ✅ 在线文本编辑器（支持实时编辑）
- ✅ 10种 AI 功能（翻译、润色、语法校对等）
- ✅ 文档管理（创建、编辑、保存、删除）
- ✅ 会员价格页面（3个套餐）
- ✅ 深紫色渐变主题 + 玻璃态效果
- ✅ 响应式设计（基础完成）

### 待完成功能 ⏳
- ⏳ 支付功能（微信/支付宝）
- ⏳ 会员权限控制（配额限制）
- ⏳ 使用统计面板
- ⏳ 文档导出（Word/PDF）
- ⏳ 团队协作功能

---

## 第二步：熟悉项目结构

### 关键文件位置
```
📁 client/src/pages/
  ├── Home.tsx          # 首页（深紫色主题）
  ├── Editor.tsx        # 编辑器（核心功能）⭐
  ├── Documents.tsx     # 文档列表
  └── Pricing.tsx       # 会员价格页

📁 server/
  ├── routers.ts        # API 路由定义 ⭐
  ├── db.ts             # 数据库操作 ⭐
  └── kimi.ts           # Kimi AI 封装 ⭐

📁 drizzle/
  └── schema.ts         # 数据库表结构 ⭐

📄 todo.md             # 任务清单（重要！）⭐
📄 HANDOVER.md         # 详细交接文档
```

---

## 第三步：建议的开发顺序

### 阶段一：支付功能（1-2天）
**目标**：让用户能够购买会员

**步骤**：
1. 阅读支付网关文档（微信支付/支付宝）
2. 创建订单表（`orders`）和订阅表（`subscriptions`）
   - 编辑 `drizzle/schema.ts`
   - 运行 `pnpm drizzle-kit generate`
   - 通过 `webdev_execute_sql` 执行迁移
3. 在 `server/routers.ts` 添加支付路由：
   ```typescript
   payment: router({
     createOrder: protectedProcedure.mutation(...),
     verifyPayment: protectedProcedure.mutation(...),
   }),
   ```
4. 在 `Pricing.tsx` 页面连接支付接口
5. 测试沙箱环境

**参考资料**：
- 微信支付文档：https://pay.weixin.qq.com/wiki/doc/api/
- 支付宝文档：https://opendocs.alipay.com/

---

### 阶段二：会员权限控制（1天）
**目标**：根据会员等级限制 AI 使用

**步骤**：
1. 在 `users` 表添加字段：
   ```typescript
   membershipLevel: mysqlEnum('membershipLevel', ['free', 'basic', 'pro', 'premium']),
   membershipExpiry: timestamp('membershipExpiry'),
   monthlyQuota: int('monthlyQuota').default(0),
   usedQuota: int('usedQuota').default(0),
   ```
2. 在 `server/routers.ts` 的 AI 路由添加配额检查：
   ```typescript
   // 在每个 AI 处理前
   if (ctx.user.usedQuota >= ctx.user.monthlyQuota) {
     throw new TRPCError({ code: 'FORBIDDEN', message: '配额已用完' });
   }
   ```
3. 处理完成后更新 `usedQuota`
4. 创建定时任务（每月1日重置配额）

---

### 阶段三：使用统计面板（1天）
**目标**：让用户看到自己的使用情况

**步骤**：
1. 创建 `client/src/pages/Dashboard.tsx`
2. 添加路由：`<Route path="/dashboard" component={Dashboard} />`
3. 展示内容：
   - 当前会员等级和到期时间
   - 本月已用字数 / 总配额
   - AI 处理历史（最近10条）
   - 使用趋势图表（使用 recharts）
4. 在导航栏添加"统计面板"入口

---

### 阶段四：文档导出（1天）
**目标**：支持导出 Word 和 PDF

**步骤**：
1. 安装依赖：`pnpm add docx pdfkit`
2. 在 `server/routers.ts` 添加导出路由：
   ```typescript
   document: router({
     exportWord: protectedProcedure.mutation(...),
     exportPdf: protectedProcedure.mutation(...),
   }),
   ```
3. 在 `Editor.tsx` 添加导出按钮
4. 处理文档格式转换

---

### 阶段五：团队协作（2-3天，可选）
**目标**：旗舰版用户可以共享文档

**步骤**：
1. 创建 `document_shares` 表
2. 添加文档权限管理（owner/editor/viewer）
3. 实现邀请链接生成
4. 添加协作者列表展示
5. （可选）实时编辑功能（使用 WebSocket）

---

## 第四步：开发工作流

### 每次开始开发前
1. 阅读 `todo.md` 确认当前任务
2. 阅读 `HANDOVER.md` 了解相关模块

### 开发过程中
1. 修改代码
2. 实时预览（开发服务器自动刷新）
3. 检查 TypeScript 错误：`pnpm check`
4. 运行测试：`pnpm test`

### 完成功能后
1. 在 `todo.md` 标记任务为 `[x]`
2. 使用 `webdev_save_checkpoint` 保存检查点
3. 写清楚检查点描述（方便回滚）

---

## 第五步：调试技巧

### 查看日志
```bash
# 服务器日志
tail -f /home/ubuntu/academic-writing-assistant/.manus-logs/devserver.log

# 浏览器控制台日志
tail -f /home/ubuntu/academic-writing-assistant/.manus-logs/browserConsole.log

# 网络请求日志
tail -f /home/ubuntu/academic-writing-assistant/.manus-logs/networkRequests.log
```

### 常见错误
1. **tRPC 类型错误**：重启开发服务器 `webdev_restart_server`
2. **数据库连接失败**：检查 `DATABASE_URL` 环境变量
3. **AI 调用失败**：检查 `KIMI_API_KEY` 是否正确

---

## 第六步：测试清单

每完成一个功能，测试以下场景：

### 支付功能
- [ ] 创建订单成功
- [ ] 支付成功后会员等级更新
- [ ] 支付失败处理
- [ ] 订单记录正确保存

### 会员权限
- [ ] 免费用户无法使用高级功能
- [ ] 基础版用户配额限制生效
- [ ] 专业版和旗舰版配额正确
- [ ] 配额用完后提示升级

### 使用统计
- [ ] 数据展示正确
- [ ] 图表渲染正常
- [ ] 移动端显示正常

### 文档导出
- [ ] Word 导出格式正确
- [ ] PDF 导出格式正确
- [ ] 中文显示正常
- [ ] 大文档导出不卡顿

---

## 第七步：发布上线

### 发布前检查
- [ ] 所有功能测试通过
- [ ] 移动端适配完成
- [ ] 支付功能切换到生产环境
- [ ] 错误处理完善
- [ ] 加载状态添加

### 发布流程
1. 保存最终检查点
2. 在 Manus 管理界面点击"发布"
3. 配置自定义域名（可选）
4. 监控错误日志

---

## 资源链接

- **项目文档**：`HANDOVER.md`（详细技术文档）
- **任务清单**：`todo.md`（所有待办任务）
- **Manus 文档**：https://docs.manus.im
- **tRPC 文档**：https://trpc.io
- **Drizzle ORM**：https://orm.drizzle.team
- **shadcn/ui**：https://ui.shadcn.com
- **TailwindCSS**：https://tailwindcss.com

---

## 需要帮助？

遇到问题时：
1. 先查看 `HANDOVER.md` 的"常见问题"部分
2. 检查日志文件（`.manus-logs/` 目录）
3. 查看相关文档和示例代码
4. 使用 `webdev_rollback_checkpoint` 回滚到稳定版本

---

**祝开发顺利！🚀**

记住：小步快跑，频繁保存检查点，遇到问题及时回滚。
