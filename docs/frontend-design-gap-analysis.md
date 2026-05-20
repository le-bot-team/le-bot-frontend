# 前端页面完成度盘点与补充设计建议

> 生成日期：2026-05-09
> 作者：前端工程师（Qoder 辅助生成）
> 关联文档：
>
> - `docs/lanhu-sync-progress.md`（设计稿同步进度盘点，36 张已同步 32 张）
> - `.qoder/skills/lanhu-ui-sync/tokens.md`（tokens 权威表）
> - `src/css/app.scss`（全局 token 与组件基础样式）
> - `src/router/routes.ts`（当前路由表）
>   适用版本：leBot 前端 v1.x（Quasar + Vue 3 + TS）

---

## 0. 使用说明

本文档面向三类读者：

- **UI 设计师**：查阅第 2/3/4 节确认"还需要补哪些设计稿"及各批次交付范围；第 5 节是所有新增设计必须遵守的风格一致性规范。
- **前端开发**：第 3/6 节直接驱动路由与组件的补齐；第 7 节定义了实施动作；附录 A/B 提供路由与 i18n 键位样板。
- **产品/项目负责人**：第 4 节（优先级）、第 7 节（时间表）、第 8 节（RACI）、第 9 节（跟踪与复盘）。

本文档与 `lanhu-sync-progress.md` 互补：progress 文档记录"已有设计稿的同步进度"，本文档记录"尚无设计稿但产品/代码已经存在入口或规划"的缺口。

---

## 1. 背景与目标

### 1.1 背景

`lanhu-sync-progress.md` 显示：全量 36 张蓝湖设计稿中 32 张已完全同步（含 tokens 收录），另 4 张为边界状态（启动页未设计、功能引导占位、语义不明、已被合并）。

但与蓝湖设计稿数量无关、**当前 APP 代码中存在的入口、菜单、按钮、弹窗**却有相当数量处于"无设计稿可参照"的状态，具体可分为四类：

1. **菜单入口存在但目标页未设计**（例如 `DeviceConfigPage` 的"WiFi 管理/固件更新/关于本机"、`SettingsPage` 的 12 条 `disabled: true` 菜单项）。
2. **代码已实现但缺少蓝湖设计稿**（例如 `DevicesPage`、`DeviceConfigPage`、`GrowthDataPage`、`ProfileFieldEditPage`、`settings/voiceprint/TestPage`、`FinishPanel`）。
3. **弹窗/组件沿用 Quasar 默认样式**（例如 `CropperDialog`、`$q.dialog` 确认弹窗），与设计系统视觉不一致。
4. **蓝湖已有占位但明确标注"还没设计"**（`03fd2e0a` 启动页、`4b2d5a38` 功能引导）。

### 1.2 目标

- 给出**完整、去重、可验收**的缺口清单
- 按业务价值和闭环完整度**分批**给出补设计建议
- 明确与现有 UI **风格一致性**的约束，避免新页面走偏
- 给出**实施步骤、时间表、RACI**，使三方可以落地协作

---

## 2. 当前实现全景

以下九张表覆盖当前仓库全部页面实现（`src/pages/**`）、路由（`src/router/routes.ts`）与主要弹窗组件。字段含义：

- **实现文件**：留空表示"代码尚未实现"
- **蓝湖设计稿**：ID 取 `all-designs.json` 前 8 位；`—` 表示"无"
- **状态**：`已同步` / `有代码无设计` / `有设计无代码` / `入口存在未实现` / `未设计`

### 2.1 主导航页面（MainLayout, `/main/*`）

| 页面     | 实现文件                             | 蓝湖 ID  | 状态                                     |
| -------- | ------------------------------------ | -------- | ---------------------------------------- |
| 首页     | `src/pages/main/HomePage.vue`        | ed2b5fdd | 已同步                                   |
| 我的     | `src/pages/main/MePage.vue`          | 84fafb58 | 已同步                                   |
| 成长 Tab | `src/pages/stack/GrowthDataPage.vue` | —        | 有代码无设计                             |
| 商城 Tab | —                                    | —        | `navigations.ts` 标记 `available: false` |

### 2.2 认证模块（`/stack/auth`）

| 面板/页面     | 实现文件                                  | 蓝湖 ID             | 状态                                                   |
| ------------- | ----------------------------------------- | ------------------- | ------------------------------------------------------ |
| 登录/注册入口 | `components/auth/SignInOrSignUpPanel.vue` | 72b3b33f            | 已同步                                                 |
| 验证码登录    | 同上                                      | 4a4704cc            | 已同步                                                 |
| 密码登录      | 同上                                      | 883b0908            | 已同步                                                 |
| 注册-设置密码 | `components/auth/NewPasswordPanel.vue`    | 2d090f70            | 已同步                                                 |
| 完善儿童信息  | `components/auth/SetupProfilePanel.vue`   | ed71eb82 / fb8d01d5 | 已同步                                                 |
| 注册完成      | `components/auth/FinishPanel.vue`         | —                   | 有代码无设计，已改用设计token (已改进 2026-05-09)      |
| 启动页/闪屏   | `src/pages/SplashPage.vue`                | 03fd2e0a            | 占位稿注明"还没设计"，已有代码实现 (已实现 2026-05-09) |
| 功能引导      | `src/pages/stack/OnboardingGuidePage.vue` | 4b2d5a38            | 占位稿，已实现4步引导页 (已实现 2026-05-09)            |

### 2.3 用户资料模块（`/stack/profile*`）

| 页面             | 实现文件                                           | 蓝湖 ID  | 状态                                     |
| ---------------- | -------------------------------------------------- | -------- | ---------------------------------------- |
| 编辑资料         | `src/pages/stack/ProfilePage.vue`                  | 448a71c7 | 已同步                                   |
| 修改密码         | `src/pages/stack/profile/ChangePasswordPage.vue`   | ec169e34 | 已同步                                   |
| 字段编辑         | `src/pages/stack/profile/ProfileFieldEditPage.vue` | —        | 有代码无设计                             |
| 绑定邮箱         | —                                                  | —        | 入口存在未实现                           |
| 绑定手机         | —                                                  | —        | 入口存在未实现                           |
| 注销账号确认弹窗 | `components/ConfirmDialog.vue` (统一弹窗)          | —        | 已改用 ConfirmDialog (已实现 2026-05-09) |

### 2.4 设置模块（`/stack/settings*`）

| 页面                 | 实现文件                                                | 蓝湖 ID                        | 状态                                            |
| -------------------- | ------------------------------------------------------- | ------------------------------ | ----------------------------------------------- |
| 设置主页             | `src/pages/stack/SettingsPage.vue`                      | daac9da5                       | 已同步                                          |
| 声纹设置             | `src/pages/stack/settings/VoiceprintPage.vue`           | 94e98b66                       | 已同步                                          |
| 声纹详情/修改        | `src/pages/stack/settings/voiceprint/DetailPage.vue`    | d2a7b5f3                       | 已同步                                          |
| 声纹录制（新）       | `src/pages/stack/settings/voiceprint/NewPage.vue`       | affd466e / 4e6ad306 / 1ed5ff10 | 已同步                                          |
| 声纹测试             | `src/pages/stack/settings/voiceprint/TestPage.vue`      | —                              | 有代码无设计                                    |
| 收货地址             | `src/pages/stack/settings/AddressesPage.vue`            | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 语言设置（App 端）   | `src/pages/stack/settings/AppLanguagePage.vue`          | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 消息设置             | `src/pages/stack/settings/NotificationSettingsPage.vue` | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 通用设置             | `src/pages/stack/settings/GeneralSettingsPage.vue`      | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 隐私设置             | `src/pages/stack/settings/PrivacySettingsPage.vue`      | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 权限管理             | `src/pages/stack/settings/PermissionManagementPage.vue` | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 敏感词过滤           | `src/pages/stack/settings/WordFilterPage.vue`           | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 清除缓存（确认交互） | `src/pages/stack/settings/ClearCachePage.vue`           | —                              | 入口已实现，含ConfirmDialog (已实现 2026-05-09) |
| 网络诊断             | `src/pages/stack/settings/NetworkDiagnosticsPage.vue`   | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 存储空间             | `src/pages/stack/settings/StorageSpacePage.vue`         | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 隐私政策             | `src/pages/stack/settings/PrivacyPolicyPage.vue`        | —                              | 入口已实现 (已实现 2026-05-09)                  |
| 个人信息清单         | `src/pages/stack/settings/PersonalInfoListPage.vue`     | —                              | 入口已实现 (已实现 2026-05-09)                  |

### 2.5 设备与乐宝配置模块（`/stack/device-config*`、`/stack/devices`）

| 页面             | 实现文件                                                  | 蓝湖 ID             | 状态                                                          |
| ---------------- | --------------------------------------------------------- | ------------------- | ------------------------------------------------------------- |
| 设备列表         | `src/pages/stack/DevicesPage.vue`                         | —                   | 有代码无设计，已改用me-card+ConfirmDialog (已改进 2026-05-09) |
| 乐宝配置主页     | `src/pages/stack/DeviceConfigPage.vue`                    | —                   | 有代码无设计，已改用me-card+me-btn-danger (已改进 2026-05-09) |
| 语音风格         | `src/pages/stack/device-config/VoiceStylePage.vue`        | 4b20baad            | 已同步                                                        |
| 多语言           | `src/pages/stack/device-config/LanguagePage.vue`          | d4baeedf            | 已同步                                                        |
| AI 个性调节主页  | `src/pages/stack/device-config/PersonalityPage.vue`       | f001e23d            | 已同步                                                        |
| AI 个性调节详情  | `src/pages/stack/device-config/PersonalityDetailPage.vue` | 31e9fabe / 31c5986a | 已同步                                                        |
| WiFi 管理        | `src/pages/stack/device-config/WifiPage.vue`              | —                   | 已实现 (2026-05-09)                                           |
| 固件更新         | `src/pages/stack/device-config/FirmwareUpdatePage.vue`    | —                   | 已实现 (2026-05-09)                                           |
| 关于本机         | `src/pages/stack/device-config/AboutDevicePage.vue`       | —                   | 已实现 (2026-05-09)                                           |
| 解绑设备确认弹窗 | `components/ConfirmDialog.vue` (统一弹窗)                 | —                   | 已改用ConfirmDialog (已实现 2026-05-09)                       |

### 2.6 家庭组模块（`/stack/family-groups*`）

| 页面              | 实现文件                                         | 蓝湖 ID             | 状态   |
| ----------------- | ------------------------------------------------ | ------------------- | ------ |
| 家庭组设置        | `src/pages/stack/FamilyGroupPage.vue`            | 902f07b4            | 已同步 |
| 家庭组详情        | `src/pages/stack/family-group/DetailPage.vue`    | eb36a568            | 已同步 |
| 成员信息          | `src/pages/stack/family-group/MemberPage.vue`    | 5d6d5199            | 已同步 |
| 邀请成员          | `src/pages/stack/family-group/InvitePage.vue`    | 90de50b4            | 已同步 |
| 修改/创建儿童信息 | `src/pages/stack/family-group/ChildEditPage.vue` | b7df1135 / c7826afa | 已同步 |

### 2.7 聊天模块（`/stack/chat`）

| 页面/交互        | 实现文件                                   | 蓝湖 ID  | 状态                                    |
| ---------------- | ------------------------------------------ | -------- | --------------------------------------- |
| 聊天主页         | `src/pages/stack/ChatPage.vue`             | a2096a64 | 已同步                                  |
| 聊天记录/历史    | `src/pages/stack/chat/ChatHistoryPage.vue` | —        | 已实现 (2026-05-09)                     |
| 静音动作反馈     | `notify` 信息提示                          | —        | 原生反馈                                |
| 呼叫设备确认弹窗 | `components/ConfirmDialog.vue` (统一弹窗)  | —        | 已改用ConfirmDialog (已实现 2026-05-09) |

### 2.8 外围页面（`/stack/*`）

| 页面         | 实现文件                                         | 蓝湖 ID  | 状态                |
| ------------ | ------------------------------------------------ | -------- | ------------------- |
| 消息列表     | `src/pages/stack/MessagesPage.vue`               | 5f6208e5 | 已同步              |
| 消息详情     | `src/pages/stack/messages/MessageDetailPage.vue` | —        | 已实现 (2026-05-09) |
| 我的订单     | `src/pages/stack/OrdersPage.vue`                 | 64595f70 | 已同步              |
| 关于我们     | `src/pages/stack/AboutPage.vue`                  | 897ffb14 | 已同步              |
| 帮助与反馈   | `src/pages/stack/HelpPage.vue`                   | 689263cd | 已同步              |
| 常见问题     | `src/pages/stack/help/FaqPage.vue`               | —        | 已实现 (2026-05-09) |
| 意见反馈     | `src/pages/stack/help/FeedbackPage.vue`          | —        | 已实现 (2026-05-09) |
| 问题日志上报 | —                                                | —        | 入口存在未实现      |
| 微信客服     | —                                                | —        | 入口存在未实现      |

### 2.9 通用弹窗/组件

| 弹窗/组件        | 实现文件                                  | 设计稿 | 状态                                        |
| ---------------- | ----------------------------------------- | ------ | ------------------------------------------- |
| 头像裁剪弹窗     | `components/CropperDialog.vue`            | —      | 已改用设计token+BEM样式 (已改进 2026-05-09) |
| 注销确认弹窗     | `components/ConfirmDialog.vue` (统一弹窗) | —      | 已改用ConfirmDialog (已实现 2026-05-09)     |
| 解绑设备确认弹窗 | `components/ConfirmDialog.vue` (统一弹窗) | —      | 已改用ConfirmDialog (已实现 2026-05-09)     |
| 呼叫设备确认弹窗 | `components/ConfirmDialog.vue` (统一弹窗) | —      | 已改用ConfirmDialog (已实现 2026-05-09)     |
| 分享家庭组弹窗   | `components/ShareSheetDialog.vue`         | —      | 已实现 (2026-05-09)                         |

---

## 3. 缺失设计稿清单（按优先级分组）

> 判定依据：**入口存在性**（已暴露在已同步页面的菜单/按钮上）× **闭环重要性**（不补 UI 会阻断主干流程）×**用户可感知度**。

### P0 核心功能缺失（用户直接感知，入口已存在）

| #   | 页面/模块     | 代码状态                          | 入口位置                                      |
| --- | ------------- | --------------------------------- | --------------------------------------------- |
| 1   | 启动页 / 闪屏 | 无代码→已实现 (2026-05-09)        | APP 冷启动第一屏                              |
| 2   | 设备列表页    | 有代码无设计，已改进 (2026-05-09) | 首页 `icon-device-change`、MePage 菜单        |
| 3   | 乐宝配置主页  | 有代码无设计，已改进 (2026-05-09) | 首页 `icon-robot-set`、`DevicesPage` 卡片点击 |
| 4   | 聊天历史页    | 无代码→已实现 (2026-05-09)        | `HomePage` "聊天记录" 链接                    |
| 5   | 成长数据页    | 有代码无设计，已改进 (2026-05-09) | 主导航 `navigations.ts` "成长" tab            |

### P1 关键交互缺失（入口可见但功能未闭环）

| #   | 页面/模块       | 入口位置            |
| --- | --------------- | ------------------- | ----------------------- |
| 6   | WiFi 管理       | 已实现 (2026-05-09) | `DeviceConfigPage` 菜单 |
| 7   | 固件更新        | 已实现 (2026-05-09) | `DeviceConfigPage` 菜单 |
| 8   | 关于本机        | 已实现 (2026-05-09) | `DeviceConfigPage` 菜单 |
| 9   | 常见问题（FAQ） | 已实现 (2026-05-09) | `HelpPage` 顶部入口     |
| 10  | 意见反馈        | 已实现 (2026-05-09) | `HelpPage` 列表项       |
| 11  | 消息详情页      | 已实现 (2026-05-09) | `MessagesPage` 点击消息 |

### P2 设置子页缺失（SettingsPage 12 条 disabled 菜单项）

| #   | 页面         | 备注                |
| --- | ------------ | ------------------- |
| 12  | 收货地址     | 已实现 (2026-05-09) |
| 13  | App 语言设置 | 已实现 (2026-05-09) |
| 14  | 消息通知设置 | 已实现 (2026-05-09) |
| 15  | 通用设置     | 已实现 (2026-05-09) |
| 16  | 隐私设置     | 已实现 (2026-05-09) |
| 17  | 权限管理     | 已实现 (2026-05-09) |
| 18  | 敏感词过滤   | 已实现 (2026-05-09) |
| 19  | 清除缓存交互 | 已实现 (2026-05-09) |
| 20  | 网络诊断     | 已实现 (2026-05-09) |
| 21  | 存储空间     | 已实现 (2026-05-09) |
| 22  | 隐私政策     | 已实现 (2026-05-09) |
| 23  | 个人信息清单 | 已实现 (2026-05-09) |

### P3 注册/登录流程补充

| #   | 页面             | 备注                                    |
| --- | ---------------- | --------------------------------------- |
| 24  | 注册完成页       | 已改进设计token (2026-05-09)            |
| 25  | 首次登录功能引导 | 已实现 OnboardingGuidePage (2026-05-09) |

### P4 弹窗/组件级补充

| #   | 组件/弹窗        | 备注                                 |
| --- | ---------------- | ------------------------------------ |
| 26  | 通用确认弹窗     | 已实现 ConfirmDialog (2026-05-09)    |
| 27  | 头像裁剪弹窗     | 已改进设计token+BEM (2026-05-09)     |
| 28  | 呼叫设备确认弹窗 | 已改用 ConfirmDialog (2026-05-09)    |
| 29  | 分享家庭组弹窗   | 已实现 ShareSheetDialog (2026-05-09) |
| 30  | 声纹测试页       | 独立页或并入声纹详情页               |

### P5 资料绑定补充

| #   | 页面       | 备注                   |
| --- | ---------- | ---------------------- |
| 31  | 绑定邮箱   | ProfilePage actionRow  |
| 32  | 绑定手机   | ProfilePage actionRow  |
| 33  | 字段编辑页 | 已有代码，需标准设计稿 |

### P6 远期功能

| #   | 页面   | 备注                                              |
| --- | ------ | ------------------------------------------------- |
| 34  | 商城页 | `navigations.ts` `available: false`，需产品先定义 |

---

## 4. 补充设计建议（分 5 批）

### 第一批 · 核心页面（P0，5 项）

| 序号 | 页面         | 建议内容                                                                 | 理由                     | 关联入口            |
| ---- | ------------ | ------------------------------------------------------------------------ | ------------------------ | ------------------- |
| 1    | 启动页/闪屏  | 375×812，品牌 LOGO + slogan，淡入淡出过渡，支持加载进度                  | APP 冷启动第一眼         | PWA/Capacitor 入口  |
| 2    | 设备列表页   | 已绑定设备卡片列表（名称 + SN + 状态） + "添加虚拟设备"按钮 + 空状态插画 | 设备选择/解绑闭环        | 首页切换设备图标    |
| 3    | 乐宝配置主页 | 2 组 6 项菜单卡片，最后"解绑设备"危险按钮                                | 进入所有乐宝端配置的入口 | 首页机器人设置图标  |
| 4    | 聊天历史页   | 按日期分组的会话摘要 + 搜索栏 + 点击进入历史详情                         | 首页"聊天记录"链接须闭环 | HomePage "聊天记录" |
| 5    | 成长数据页   | 总览卡片 + 本周互动 + 能力雷达图 + 热门话题                              | 产品差异化核心           | 主导航"成长"tab     |

### 第二批 · 设备配置子页（P1 前半，3 项）

| 序号 | 页面      | 建议内容                                         | 关联入口                  |
| ---- | --------- | ------------------------------------------------ | ------------------------- |
| 6    | WiFi 管理 | 当前连接状态卡片 + 可用 WiFi 列表 + 密码输入弹窗 | `DeviceConfigPage.wifi`   |
| 7    | 固件更新  | 当前版本号 + 最新版本 + 检查更新按钮 + 更新进度  | `DeviceConfigPage.update` |
| 8    | 关于本机  | 设备信息列表（SN/型号/固件/MAC/序列号/出厂日期） | `DeviceConfigPage.about`  |

### 第三批 · 帮助与消息闭环（P1 后半，3 项）

| 序号 | 页面       | 建议内容                                                 | 关联入口                |
| ---- | ---------- | -------------------------------------------------------- | ----------------------- |
| 9    | 常见问题页 | FAQ 分类 tab + 折叠面板                                  | `HelpPage` "常见问题"   |
| 10   | 意见反馈页 | 多行文本 + 图片上传 + 联系方式 + 提交按钮                | `HelpPage` "意见反馈"   |
| 11   | 消息详情页 | 顶部消息头（图标+标题+时间）+ 正文 + 操作区（跳转/确认） | `MessagesPage` 点击消息 |

### 第四批 · 设置子页（P2，12 项）

建议以**两种模版**覆盖：

- **模板 A：菜单/开关列表**（收货地址/消息设置/通用设置/隐私设置/权限管理/敏感词过滤/网络诊断/存储空间/个人信息清单）
- **模板 B：富文本长文**（隐私政策）
- **模板 C：单一交互**（清除缓存：确认弹窗 + 成功 toast；App 语言：RadioList）

| 序号 | 页面         | 模板 | 关联菜单 `SettingsPage.labels` |
| ---- | ------------ | ---- | ------------------------------ |
| 12   | 收货地址     | A    | `deliveryAddresses`            |
| 13   | App 语言设置 | C    | `languageSettings`             |
| 14   | 消息通知设置 | A    | `messageSettings`              |
| 15   | 通用设置     | A    | `generalSettings`              |
| 16   | 隐私设置     | A    | `privacySettings`              |
| 17   | 权限管理     | A    | `permissionManagement`         |
| 18   | 敏感词过滤   | A    | `sensitiveWordFilter`          |
| 19   | 清除缓存交互 | C    | `clearCache`                   |
| 20   | 网络诊断     | A    | `networkDiagnostics`           |
| 21   | 存储空间     | A    | `storageSpace`                 |
| 22   | 隐私政策     | B    | `privacyPolicy`                |
| 23   | 个人信息清单 | A    | `personalInfoList`             |

### 第五批 · 弹窗/组件（P4 + P3 部分，6 项）

| 序号 | 组件           | 建议内容                                                 |
| ---- | -------------- | -------------------------------------------------------- |
| 24   | 通用确认弹窗   | 280×180 卡片，圆角 16，标题 + 描述 + 双按钮（取消/确认） |
| 25   | 头像裁剪弹窗   | 沿用 280 宽卡片，顶部标题 + 裁剪区 + 底部工具条与双按钮  |
| 26   | 呼叫设备弹窗   | 同通用确认，primary 按钮为 `--clr-link`                  |
| 27   | 分享家庭组弹窗 | 底部弹出的分享 sheet（微信/复制链接/保存二维码）         |
| 28   | 注册完成页     | 欢迎文案 + 插画 + 3 秒倒计时跳转                         |
| 29   | 功能引导页     | 3–4 步蒙层 + 步进点 + 跳过按钮（对应蓝湖 4b2d5a38）      |

---

## 5. UI 风格一致性规范

所有新增设计稿/页面必须遵守以下 10 条规范。引用 token 请以 `src/css/app.scss` 中 `:root` 变量为准，语义化命名参见 `.qoder/skills/lanhu-ui-sync/tokens.md`。

1. **画布尺寸**：375 × 812（与现有 36 张设计稿保持一致）
2. **圆角体系**：
   - 卡片 `--card-radius: 12px`
   - 主操作按钮 28px（311×56）
   - 弹窗 16px
   - 小组件/芯片 6–8px
3. **颜色 token**：禁止硬编码，统一使用 `--clr-*`
   - 正文 `--clr-text`、次要 `--clr-caption`、弱化 `--clr-weak`
   - 链接/强调 `--clr-link`
   - 危险 `--clr-danger-bg` / `--clr-error`
   - 页面背景 `--clr-page-bg`、卡片白 `--clr-white`
4. **字体**：`AlibabaPuHuiTi, PingFang SC, Microsoft YaHei, sans-serif`
   - Body 14/22
   - 次标题 15/22 Medium
   - 标题 17/24 Medium
   - Slogan 20/28 Medium
5. **间距**：
   - 页面左右 padding 20px（`q-pa-md` 或 `q-pa-lg`）
   - 卡片间 gap 12px
   - 菜单行高 48–56px（`--menu-row-height`）
6. **主操作按钮**：
   - 默认 311×56，r28，rgba(18,14,44,1) 深色实底 + 白字
   - 链接态使用 `--clr-link` 蓝色
7. **危险操作**：沿用 `.me-btn-danger`（`--clr-danger-bg` 红色，无填充）
8. **导航栏**：使用 `StackHeader`，高度 44px，返回箭头 9×16 stroke，标题 17/24 居中
9. **弹窗**：统一 Vue 组件化包装，避免 `$q.dialog({ title, message })` 原生外观
   - 280 宽或 300 宽卡片
   - 顶部 20px padding + 标题 17px
   - 正文 14/22
   - 底部双按钮横排：取消 secondary + 确认 primary/danger
10. **图标**：
    - 首页/Me/设置优先使用蓝湖切图（webp/2x），存放于 `src/assets/lanhu/<module>/`
    - 通用小图标（chevron / back）用 MDI
    - 禁止混用 emoji

> 所有新增样式必须在 PR 中**同步更新** `tokens.md` 的对应章节；PR 描述需列出新增/变更 token 清单。

---

## 6. 实施步骤（开发侧）

针对每一张新增设计稿，前端开发按以下 7 步执行（与 `.qoder/skills/lanhu-ui-sync/SKILL.md` 对齐）：

1. **UI 出稿**：设计师将新设计稿上传到 leBot 蓝湖项目，提供 `image_id`。
2. **素材抓取**：
   - `node page/lanhu-mcp-assets/fetch-raw.mjs <image_id>` 抓 raw JSON
   - MCP `lanhu_get_screenshot` 保存截图
   - MCP `lanhu_download_slices`（默认 2× webp）保存切图到 `src/assets/lanhu/<module>/`
3. **路由与 i18n**：
   - 新增 `src/router/routes.ts` 条目（见附录 A）
   - 在 `src/i18n/zh-CN/index.ts`、`en-US/index.ts` 添加文案（见附录 B）
   - 更新 `components/navigations.ts`（如为 stack 页面）
4. **组件实现**：
   - 页面文件顶部注释 `// <Name> — design <id>`
   - 引用 token（禁硬编码）
   - 复用既有共享组件（`me-card`、`me-btn-danger`、`family-group-add-btn` 等）
5. **回填同步文档**：在 `lanhu-sync-progress.md` 的 2.1/2.2 表格追加条目（不许插入中间行）
6. **tokens 权威化**：如引入新 token，在 `.qoder/skills/lanhu-ui-sync/tokens.md` 追加章节
7. **走查与回归**：
   - 设计师按截图走查
   - 测试覆盖路由跳转、空态、错误态、深色/浅色背景

---

## 7. 时间安排（建议）

假设 1 名 UI、2 名前端开发并行工作；周指自然周。

| 批次   | 内容               | 起止  | UI 设计稿工时 | 前端开发工时 | 备注               |
| ------ | ------------------ | ----- | ------------- | ------------ | ------------------ |
| 第一批 | P0 核心页 5 项     | W1–W2 | 3 天          | 7 天         | 5 张设计稿并行出图 |
| 第二批 | 设备配置子页 3 项  | W3    | 2 天          | 3 天         | WiFi 含密码弹窗    |
| 第三批 | 帮助/消息闭环 3 项 | W4    | 2 天          | 3 天         | 意见反馈含上传交互 |
| 第四批 | 设置子页 12 项     | W5–W7 | 5 天          | 10 天        | 模板化后可压缩     |
| 第五批 | 弹窗/组件 6 项     | W8    | 3 天          | 4 天         | 含通用确认弹窗抽取 |

**总计**：约 8 周（15 天 UI + 27 天前端，可并行）。按 P0→P1 顺序发布，不堵塞后续批次。

**里程碑**：

- M1（W2 末）：核心页上线，APP 主干流程闭环
- M2（W4 末）：帮助与设备配置子页上线，消息/设置入口不再"coming soon"
- M3（W7 末）：设置子页全部解除 `disabled: true`
- M4（W8 末）：弹窗/组件统一，设计体系收敛完成

---

## 8. 责任分配（RACI）

| 角色       | 第一批 P0 | 第二批设备 | 第三批帮助 | 第四批设置 | 第五批弹窗 |
| ---------- | --------- | ---------- | ---------- | ---------- | ---------- |
| UI 设计师  | R/A       | R/A        | R/A        | R/A        | R/A        |
| 前端开发   | R         | R          | R          | R          | R          |
| 产品经理   | A         | C          | C          | A          | C          |
| 测试       | C         | C          | C          | C          | C          |
| 项目负责人 | I         | I          | I          | I          | I          |

说明：R = Responsible 执行, A = Accountable 签字, C = Consulted 咨询, I = Informed 知会。

---

## 9. 跟踪与复盘

- **进度回填**：每张设计稿同步完成后由开发在 `lanhu-sync-progress.md` 2.1 表末追加一行，不允许插入历史顺序中间。
- **周例会**：每周一 30 分钟对齐当前批次进度、阻塞项与下一周计划。
- **批次复盘**：每批次结束后，由项目负责人汇总 tokens 变更、共享组件抽取与 i18n 增量，更新本文档第 2–4 节的对应行。
- **风险项**：
  1. UI 设计稿未按期交付 → 采用本文档"补充设计建议"作为临时视觉基线，开发先写路由/空页
  2. Tokens 冲突（新 token 与既有命名冲突） → 在 `tokens.md` 评审阶段拦截
  3. 共享组件抽取返工 → 第一批上线后立即完成"通用确认弹窗"抽取，避免后续重复内联 `$q.dialog`
  4. i18n 文案遗漏 → 代码 PR 必须包含 zh-CN/en-US 同步更新

---

## 附录 A：需新增的路由规划（`src/router/routes.ts`）

> 以下路由名与路径为建议值，实际以开发联调时为准。

### A.1 设备配置子页

```ts
{ name: 'device-config-wifi',   path: 'wifi',   /* WiFi 管理 */ },
{ name: 'device-config-update', path: 'update', /* 固件更新 */ },
{ name: 'device-config-about',  path: 'about',  /* 关于本机 */ },
```

（均作为 `/stack/device-config/` 的子路由）

### A.2 帮助/消息闭环

```ts
{ name: 'help-faq',      path: 'help/faq' },
{ name: 'help-feedback', path: 'help/feedback' },
{ name: 'message-detail', path: 'messages/:id' },
```

### A.3 设置子页

```ts
// 均作为 /stack/settings/ 的子路由
{ name: 'settings-addresses',     path: 'addresses' },
{ name: 'settings-app-language',  path: 'language' },
{ name: 'settings-notifications', path: 'notifications' },
{ name: 'settings-general',       path: 'general' },
{ name: 'settings-privacy',       path: 'privacy' },
{ name: 'settings-permissions',   path: 'permissions' },
{ name: 'settings-word-filter',   path: 'word-filter' },
{ name: 'settings-network',       path: 'network' },
{ name: 'settings-storage',       path: 'storage' },
{ name: 'settings-privacy-policy', path: 'privacy-policy' },
{ name: 'settings-info-list',     path: 'info-list' },
```

### A.4 其他

```ts
{ name: 'chat-history',    path: 'chat/history' },
{ name: 'profile-bind-email', path: 'profile/bind-email' },
{ name: 'profile-bind-phone', path: 'profile/bind-phone' },
// 成长数据已有路由 /stack/growth-data；保留
// 启动页建议由 Capacitor/PWA manifest 承载，不入 vue-router
```

---

## 附录 B：i18n 键位建议

所有新页面的文案均按 `pages.<path>.<PageName>.labels.*` 组织。举例：

```json
// zh-CN
{
  "pages": {
    "stack": {
      "device-config": {
        "WifiPage": {
          "labels": {
            "title": "WiFi 管理",
            "connected": "已连接",
            "availableNetworks": "可用网络",
            "passwordPlaceholder": "请输入 WiFi 密码"
          }
        }
      },
      "help": {
        "FaqPage": {
          "labels": {
            "title": "常见问题"
          }
        }
      }
    }
  }
}
```

弹窗文案建议统一在 `components.dialogs.*`，便于复用。

---

## 附录 C：与既有文档的关系

| 文档                                    | 读者      | 记录内容                  | 本文档的关系                 |
| --------------------------------------- | --------- | ------------------------- | ---------------------------- |
| `docs/lanhu-sync-progress.md`           | 开发      | 36 张蓝湖设计稿的同步进度 | 本文档记录"未设计"缺口，互补 |
| `.qoder/skills/lanhu-ui-sync/tokens.md` | 开发/UI   | 全量 token 权威表         | 本文档的一致性章节引用它     |
| `.qoder/skills/lanhu-ui-sync/SKILL.md`  | 开发      | 同步流程                  | 本文档的实施步骤引用它       |
| `docs/api-specification.md`             | 后端/前端 | 接口规范                  | 新增页面的接口对接入口       |
| `docs/virtual-device-implementation.md` | 前端      | 虚拟设备实施              | 设备列表/乐宝配置主页的背景  |

---

## 10. 维护条款

- 新设计稿交付或页面实现完成后，更新本文档第 2 节对应行的"状态"列
- 第 3/4 节的条目迁移至"已实现"后，在条目末尾标注 `(已实现 YYYY-MM-DD)` 并在年度/季度归档时移入历史附录
- 新增分批建议，只能追加到"第六批"之后，不得插入历史批次
- 任何规范变更（第 5 节）必须同步修改 `tokens.md`，并在 PR 描述中交叉引用
