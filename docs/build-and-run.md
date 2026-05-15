# Le Bot 前端 — 编译与运行指南

## 1. 环境要求

| 依赖    | 版本                                                 | 说明               |
| ------- | ---------------------------------------------------- | ------------------ |
| Node.js | ^18 \|\| ^20 \|\| ^22 \|\| ^24 \|\| ^26 \|\| ^28     | 推荐 LTS（如 v22） |
| pnpm    | 10.16.1（由 package.json `packageManager` 字段锁定） | 项目唯一包管理器   |

### 1.1 安装 Node.js（推荐 fnm）

```powershell
# 安装 fnm
winget install Schniz.fnm

# 刷新当前终端 PATH（解决 winget 安装后 fnm 不在 PATH 的问题）
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 安装 Node.js 22 LTS
fnm install 22

# 加载 fnm 环境到当前终端（必须执行，否则 node / pnpm 不可用）
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

> **重要**：`fnm use 22` 无法在未初始化的 PowerShell 会话中生效（会报 "We can't find the necessary environment variables"）。
> 必须改用 `fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression` 来加载 Node.js 环境。
> 建议将该命令加入 PowerShell Profile，避免每次手动执行。

### 1.2 激活 pnpm

> 确保已执行 1.1 中的 `fnm env` 命令，当前终端能识别 `node` 和 `corepack`。

```powershell
corepack enable
corepack prepare pnpm@10.16.1 --activate

# 验证
node -v    # v22.x.x
pnpm -v    # 10.16.1
```

---

## 2. 安装依赖

```powershell
cd D:\workspace\AIPETCLIENT\leBotChatClient\le-bot-frontend
pnpm install
```

安装完成后会自动运行 `quasar prepare`，在 `.quasar/` 目录生成 TypeScript 配置和类型声明。

若遇到 esbuild 构建脚本审批提示，运行：

```powershell
pnpm approve-builds esbuild
```

---

## 3. 开发模式

```powershell
pnpm dev
# 等价于: npx quasar dev -m pwa
```

- 默认访问地址：**http://localhost:3001**（若端口被占用，Quasar 会自动切换到最近可用端口如 3002）
- 支持热模块替换（HMR），代码修改即时生效
- 集成 `vite-plugin-checker`，实时显示 TypeScript 和 ESLint 错误

### 开发环境后端地址

开发模式下，前端自动连接本地后端：

| 服务      | 地址                           |
| --------- | ------------------------------ |
| HTTP API  | `http://localhost:3000/api/v1` |
| WebSocket | `ws://localhost:3000`          |

> 需确保 `le-bot-backend` 在本地 3000 端口运行，否则 API 和 WebSocket 调用会失败。

---

## 4. 生产构建

```powershell
pnpm build
# 等价于: npx quasar build -m pwa
```

构建产物输出到 `dist/pwa/` 目录。

### GitHub Pages 部署构建

```powershell
$env:DEPLOY_GITHUB_PAGE="1"; pnpm build
```

此模式会将资源 base 路径设为 `/le-bot-frontend/`，API 指向远程服务器 `https://cafuuchino.studio26f.org:10543`。

### 预览生产构建

```powershell
npx quasar serve dist/pwa
```

---

## 5. 代码质量

```powershell
# ESLint 检查
pnpm lint

# Prettier 格式化
pnpm format
```

---

## 6. 已知问题与修复记录

### 6.1 PWA Service Worker 构建失败（workbox + esbuild）

**现象**：`quasar build -m pwa` 时 esbuild 报错：

```
Transforming destructuring to the configured target environment
("chrome115", "es2022", "firefox115", "safari14") is not supported yet
```

**原因**：workbox 包使用了解构语法，而 esbuild 无法将其降级到配置的目标环境。

**修复**：在 `quasar.config.ts` 的 `pwa` 配置中添加：

```ts
pwa: {
  workboxMode: 'InjectManifest',
  extendPWACustomSWConf(esbuildConf) {
    esbuildConf.target = 'es2022';
  },
},
```

---

## 7. 核心功能测试要点

| 功能           | 测试方法                             | 前提条件                    |
| -------------- | ------------------------------------ | --------------------------- |
| 用户认证       | 登录/注册页面，验证 Token 持久化     | 后端运行在 localhost:3000   |
| WebSocket 连接 | DevTools → Network → WS 面板观察消息 | 后端运行 + 已登录           |
| 音频录制       | 点击录音按钮，浏览器请求麦克风权限   | 必须使用 localhost 或 HTTPS |
| 音频播放       | 发送语音后观察 AI 音频流式回复       | WebSocket 已连接            |
| 静音检测       | 录音时保持沉默 3 秒，观察自动停止    | 聊天会话进行中              |
| PWA 安装       | 浏览器地址栏出现安装图标             | HTTPS 或 localhost          |

---

## 8. 常用命令速查

| 命令                        | 说明                                                      |
| --------------------------- | --------------------------------------------------------- |
| `pnpm install`              | 安装依赖                                                  |
| `pnpm dev`                  | 启动开发服务器（PWA 模式，默认端口 3001，占用时自动切换） |
| `pnpm build`                | 生产构建（PWA）                                           |
| `pnpm lint`                 | ESLint 代码检查                                           |
| `pnpm format`               | Prettier 代码格式化                                       |
| `npx quasar serve dist/pwa` | 预览生产构建产物                                          |
