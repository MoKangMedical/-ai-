# OpenClaw 环境配置指南

欢迎！这份文档将帮助你从零开始配置学术写作助手的开发环境。

---

## 前置要求

在开始之前，请确保你的电脑已安装：

- **Node.js** 22.x 或更高版本
- **pnpm** 包管理器
- **MySQL** 8.0 或更高版本（或使用云数据库）
- **Git**（用于克隆代码）
- **代码编辑器**（推荐 VS Code）

---

## 第一步：获取代码

### 方式 A：从 GitHub 克隆（推荐）

```bash
# 克隆仓库（替换为实际的仓库地址）
git clone https://github.com/YOUR_USERNAME/academic-writing-assistant.git

# 进入项目目录
cd academic-writing-assistant
```

### 方式 B：从代码包解压

如果你收到的是 ZIP 文件：

```bash
# 解压代码包
unzip academic-writing-assistant.zip

# 进入项目目录
cd academic-writing-assistant
```

---

## 第二步：安装依赖

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

**预计时间**：2-5 分钟（取决于网络速度）

---

## 第三步：配置数据库

### 选项 A：本地 MySQL 数据库

#### 1. 安装 MySQL

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
- 下载并安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

#### 2. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 在 MySQL 命令行中执行
CREATE DATABASE academic_writing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建数据库用户（可选，更安全）
CREATE USER 'writing_user'@'localhost' IDENTIFIED BY 'your_password_here';
GRANT ALL PRIVILEGES ON academic_writing.* TO 'writing_user'@'localhost';
FLUSH PRIVILEGES;

# 退出
EXIT;
```

#### 3. 获取数据库连接字符串

```
mysql://writing_user:your_password_here@localhost:3306/academic_writing
```

### 选项 B：使用云数据库（推荐）

**推荐服务：**
- [PlanetScale](https://planetscale.com/)（免费额度）
- [TiDB Cloud](https://tidbcloud.com/)（免费额度）
- [阿里云 RDS](https://www.aliyun.com/product/rds)
- [腾讯云 MySQL](https://cloud.tencent.com/product/cdb)

**优点：**
- 无需本地安装
- 自动备份
- 更好的性能
- SSL 连接

创建数据库后，复制提供的连接字符串。

---

## 第四步：配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 在项目根目录执行
touch .env
```

编辑 `.env` 文件，添加以下内容：

```env
# ========================================
# 数据库配置
# ========================================
DATABASE_URL="mysql://writing_user:your_password_here@localhost:3306/academic_writing"

# 如果使用云数据库，连接字符串可能类似：
# DATABASE_URL="mysql://user:password@gateway.example.com:4000/dbname?ssl=true"

# ========================================
# Kimi API 配置
# ========================================
KIMI_API_KEY="your_kimi_api_key_here"

# 获取方式：访问 https://platform.moonshot.cn/console/api-keys
# 注册账号后在控制台创建 API Key

# ========================================
# JWT 密钥（用于 Session 加密）
# ========================================
JWT_SECRET="your_random_secret_key_here"

# 生成随机密钥的方法：
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ========================================
# OAuth 配置（开发环境可选）
# ========================================
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"

# 如果需要完整的 OAuth 功能，需要在 Manus 平台注册应用
# 获取 VITE_APP_ID 等配置

# ========================================
# 其他配置
# ========================================
NODE_ENV="development"
PORT=3000

# 项目所有者信息（可选）
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your_open_id"
```

### 重要：如何获取 Kimi API Key

1. 访问 [月之暗面开放平台](https://platform.moonshot.cn/)
2. 注册/登录账号
3. 进入控制台 → API Keys
4. 点击"创建新的 API Key"
5. 复制生成的 Key（只显示一次，请妥善保存）
6. 将 Key 填入 `.env` 文件的 `KIMI_API_KEY`

**注意**：Kimi API 有免费额度，超出后需要充值。

---

## 第五步：初始化数据库

### 1. 运行数据库迁移

```bash
# 生成迁移文件（如果需要）
pnpm drizzle-kit generate

# 应用迁移到数据库
pnpm drizzle-kit migrate
```

### 2. 验证数据库表

```bash
# 登录数据库
mysql -u writing_user -p academic_writing

# 查看表
SHOW TABLES;

# 应该看到以下表：
# - users
# - documents
# - ai_history
```

---

## 第六步：启动开发服务器

```bash
# 启动开发服务器
pnpm dev
```

**成功启动后，你应该看到：**

```
Server running on http://localhost:3000/
[OAuth] Initialized with baseURL: https://api.manus.im
```

**访问应用：**
- 前端：http://localhost:3000
- API：http://localhost:3000/api/trpc

---

## 第七步：验证功能

### 1. 测试首页

访问 http://localhost:3000，应该看到：
- 深紫色渐变背景
- "学术写作助手" 标题
- "开始写作" 按钮

### 2. 测试数据库连接

```bash
# 运行测试
pnpm test
```

应该看到所有测试通过。

### 3. 测试 AI 功能

由于需要登录，你可以：

**选项 A：跳过 OAuth（开发模式）**

编辑 `server/_core/context.ts`，临时添加测试用户：

```typescript
// 在 createContext 函数中添加（仅用于开发测试）
if (process.env.NODE_ENV === 'development' && !user) {
  user = {
    id: 1,
    openId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    // ... 其他字段
  };
}
```

**选项 B：配置完整 OAuth**

参考下一节"OAuth 配置"。

---

## 第八步：OAuth 配置（可选）

如果需要完整的登录功能：

### 1. 在 Manus 平台注册应用

1. 访问 [Manus 开发者控制台](https://manus.im/developer)
2. 创建新应用
3. 设置回调 URL：`http://localhost:3000/api/oauth/callback`
4. 获取 `App ID` 和 `App Secret`

### 2. 更新 `.env` 文件

```env
VITE_APP_ID="your_app_id_here"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"
```

### 3. 重启开发服务器

```bash
# 停止服务器（Ctrl+C）
# 重新启动
pnpm dev
```

---

## 常见问题

### Q1: 数据库连接失败

**错误信息：**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方法：**
1. 检查 MySQL 是否运行：`mysql -u root -p`
2. 检查 `.env` 中的 `DATABASE_URL` 是否正确
3. 检查数据库用户权限

### Q2: Kimi API 调用失败

**错误信息：**
```
Error: Invalid API key
```

**解决方法：**
1. 检查 `.env` 中的 `KIMI_API_KEY` 是否正确
2. 确认 API Key 没有过期
3. 检查账号余额是否充足

### Q3: 端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法：**
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者使用其他端口
PORT=3001 pnpm dev
```

### Q4: pnpm 安装依赖失败

**解决方法：**
```bash
# 清除缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### Q5: TypeScript 类型错误

**解决方法：**
```bash
# 重新生成类型
pnpm drizzle-kit generate

# 检查 TypeScript 错误
pnpm check
```

---

## 开发工具推荐

### VS Code 扩展

安装以下扩展提升开发体验：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",           // ESLint
    "esbenp.prettier-vscode",           // Prettier
    "bradlc.vscode-tailwindcss",        // Tailwind CSS 智能提示
    "ms-vscode.vscode-typescript-next", // TypeScript
    "formulahendry.auto-rename-tag",    // 自动重命名标签
    "christian-kohler.path-intellisense" // 路径智能提示
  ]
}
```

### 数据库管理工具

- [TablePlus](https://tableplus.com/)（macOS/Windows/Linux）
- [DBeaver](https://dbeaver.io/)（免费开源）
- [MySQL Workbench](https://www.mysql.com/products/workbench/)（官方工具）

### API 测试工具

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [HTTPie](https://httpie.io/)

---

## 项目结构快速参考

```
academic-writing-assistant/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # UI 组件
│   │   └── lib/trpc.ts    # tRPC 客户端
│   └── public/            # 静态资源
├── server/                # 后端代码
│   ├── routers.ts         # API 路由 ⭐
│   ├── db.ts              # 数据库操作 ⭐
│   ├── kimi.ts            # Kimi AI 封装 ⭐
│   └── _core/             # 框架核心
├── drizzle/               # 数据库相关
│   ├── schema.ts          # 表结构定义 ⭐
│   └── *.sql              # 迁移文件
├── .env                   # 环境变量（需要创建）
├── package.json           # 依赖配置
├── todo.md                # 任务清单 ⭐
├── HANDOVER.md            # 技术文档 ⭐
├── OPENCLAW_QUICKSTART.md # 快速启动指南 ⭐
└── ARCHITECTURE.md        # 架构文档 ⭐
```

---

## 下一步

环境配置完成后，建议按以下顺序学习：

1. ✅ **阅读 OPENCLAW_QUICKSTART.md** - 了解开发流程
2. ✅ **阅读 HANDOVER.md** - 理解项目全貌
3. ✅ **阅读 ARCHITECTURE.md** - 深入技术架构
4. ✅ **查看 todo.md** - 开始第一个任务

---

## 需要帮助？

- **技术问题**：查看 HANDOVER.md 的"常见问题"部分
- **开发流程**：参考 OPENCLAW_QUICKSTART.md
- **架构疑问**：阅读 ARCHITECTURE.md
- **任务规划**：查看 todo.md

---

**祝配置顺利！🚀**

如有任何问题，请随时联系项目负责人。
