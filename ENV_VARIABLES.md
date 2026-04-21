# 环境变量配置说明

本文档说明学术写作助手项目所需的环境变量配置。

---

## 必需的环境变量

### 1. DATABASE_URL（数据库连接）

**格式：**
```
mysql://用户名:密码@主机:端口/数据库名
```

**示例：**
```bash
# 本地 MySQL
DATABASE_URL="mysql://writing_user:password123@localhost:3306/academic_writing"

# 云数据库（PlanetScale）
DATABASE_URL="mysql://user:pass@gateway.planetscale.com:3306/dbname?ssl=true"

# 云数据库（TiDB Cloud）
DATABASE_URL="mysql://user:pass@gateway.tidbcloud.com:4000/dbname?ssl=true"
```

**获取方式：**
- **本地数据库**：参考 SETUP_GUIDE.md 第三步
- **云数据库**：在云服务商控制台创建数据库后获取

---

### 2. KIMI_API_KEY（Kimi AI 密钥）

**获取步骤：**
1. 访问 [月之暗面开放平台](https://platform.moonshot.cn/)
2. 注册/登录账号
3. 进入"控制台" → "API Keys"
4. 点击"创建新的 API Key"
5. 复制生成的 Key（只显示一次）

**示例：**
```bash
KIMI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**注意事项：**
- 新注册用户有免费额度
- 超出免费额度需要充值
- 不要泄露 API Key

---

### 3. JWT_SECRET（会话加密密钥）

**生成方式：**
```bash
# 方法 1：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方法 2：使用 OpenSSL
openssl rand -hex 32

# 方法 3：在线生成
# 访问 https://www.random.org/strings/
```

**示例：**
```bash
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
```

**安全建议：**
- 使用至少 32 字符的随机字符串
- 不要使用简单的密码
- 生产环境和开发环境使用不同的密钥

---

## 可选的环境变量

### 4. OAuth 配置（用于登录功能）

如果需要完整的用户登录功能，需要配置以下变量：

```bash
# Manus OAuth 服务器地址（固定值）
OAUTH_SERVER_URL="https://api.manus.im"

# Manus OAuth 登录门户地址（固定值）
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"

# Manus 应用 ID（需要在 Manus 平台注册应用获取）
VITE_APP_ID="your_app_id_here"
```

**获取 VITE_APP_ID 的步骤：**
1. 访问 [Manus 开发者控制台](https://manus.im/developer)
2. 创建新应用
3. 设置回调 URL：`http://localhost:3000/api/oauth/callback`
4. 复制生成的 App ID

**开发环境替代方案：**

如果不想配置 OAuth，可以在 `server/_core/context.ts` 中添加测试用户：

```typescript
// 仅用于开发测试
if (process.env.NODE_ENV === 'development' && !user) {
  user = {
    id: 1,
    openId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    loginMethod: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}
```

---

### 5. 应用配置

```bash
# 运行环境（development / production）
NODE_ENV="development"

# 服务器端口（默认 3000）
PORT=3000

# 项目所有者信息（可选）
OWNER_NAME="Your Name"
OWNER_OPEN_ID="your_open_id"
```

---

## 生产环境自动注入的变量

以下变量在 Manus 平台部署时会自动注入，**本地开发不需要配置**：

```bash
# Manus 内置 API 服务
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="auto_injected"
VITE_FRONTEND_FORGE_API_KEY="auto_injected"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# 分析服务
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="auto_injected"

# 应用信息
VITE_APP_LOGO="https://cdn.manus.im/logo.png"
VITE_APP_TITLE="学术写作助手"
```

---

## 配置文件创建步骤

### 方法 1：手动创建 .env 文件

```bash
# 在项目根目录创建 .env 文件
cd academic-writing-assistant
touch .env

# 使用编辑器打开
code .env  # VS Code
# 或
nano .env  # 命令行编辑器
```

### 方法 2：从模板复制（如果有）

```bash
# 复制模板文件
cp .env.example .env

# 编辑并填写实际值
code .env
```

---

## 完整的 .env 文件示例

```bash
# ========================================
# 必填配置
# ========================================

DATABASE_URL="mysql://writing_user:password123@localhost:3306/academic_writing"
KIMI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

# ========================================
# OAuth 配置（可选）
# ========================================

OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"
# VITE_APP_ID="your_app_id_here"

# ========================================
# 应用配置
# ========================================

NODE_ENV="development"
PORT=3000
```

---

## 验证配置

配置完成后，运行以下命令验证：

```bash
# 启动开发服务器
pnpm dev

# 如果看到以下输出，说明配置成功：
# Server running on http://localhost:3000/
# [OAuth] Initialized with baseURL: https://api.manus.im
```

---

## 常见问题

### Q1: 如何检查环境变量是否生效？

在 `server/_core/env.ts` 中可以查看所有可用的环境变量。

或者在代码中临时添加：
```typescript
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('KIMI_API_KEY:', process.env.KIMI_API_KEY ? '已配置' : '未配置');
```

### Q2: 修改 .env 后不生效？

需要重启开发服务器：
```bash
# 停止服务器（Ctrl+C）
# 重新启动
pnpm dev
```

### Q3: 数据库连接失败？

检查以下几点：
1. MySQL 服务是否运行
2. 用户名和密码是否正确
3. 数据库是否已创建
4. 端口号是否正确（默认 3306）

### Q4: Kimi API 调用失败？

检查以下几点：
1. API Key 是否正确（没有多余空格）
2. API Key 是否过期
3. 账号余额是否充足
4. 网络是否正常

---

## 安全建议

1. **不要提交 .env 文件到 Git**
   - 确保 `.gitignore` 包含 `.env`
   - 使用 `.env.example` 作为模板

2. **定期更换密钥**
   - JWT_SECRET 定期更换
   - API Key 泄露后立即更换

3. **使用不同的密钥**
   - 开发环境和生产环境使用不同的密钥
   - 不同项目使用不同的密钥

4. **限制数据库权限**
   - 不要使用 root 用户
   - 只授予必要的权限（SELECT, INSERT, UPDATE, DELETE）

---

## 需要帮助？

如果配置过程中遇到问题：
1. 查看 SETUP_GUIDE.md 的"常见问题"部分
2. 检查控制台错误信息
3. 查看日志文件（`.manus-logs/devserver.log`）
4. 联系项目负责人

---

**配置完成后，请继续阅读 OPENCLAW_QUICKSTART.md 开始开发！**
