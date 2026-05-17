# Lanhu 设计稿同步进度盘点

> 生成日期：2026-05-08（首版）｜设备设置子页簇同步更新：2026-05-08｜ChatPage 权威化同步更新：2026-05-08｜SetupProfilePanel / FamilyGroupPage 素材就绪同步更新：2026-05-08｜家庭组 5 页（含儿童信息）权威化同步更新：2026-05-08｜消息/订单/关于/帮助 4 页权威化同步更新：2026-05-08｜成长数据中心同步更新：2026-05-09
> 数据源：
>
> - `page/lanhu-mcp-assets/all-designs.json`（37 张设计稿清单）
> - `page/lanhu-mcp-assets/designs/*.json`（parsed 与 `_raw.json`）
> - `page/lanhu-mcp-assets/screenshots/*.png`（设计稿截图）
> - `src/**/*.vue` 中 `// <Name> — design <id>` 锚点注释
> - `.qoder/skills/lanhu-ui-sync/tokens.md`（token 权威表）

---

## 1. 口径定义

| 列名        | 含义                                                            |
| ----------- | --------------------------------------------------------------- |
| 设计稿 ID   | 取自 `all-designs.json` `id` 字段前 8 位缩写                    |
| \_raw.json  | `designs/<id>_raw.json` 是否存在                                |
| parsed      | `designs/<id>.json` 是否存在且非空（≥1KB）                      |
| screenshot  | `screenshots/<id>.png` 是否存在                                 |
| 实现文件    | `.vue` 顶部存在 `// <Name> — design <id>` / `designs <id>` 注释 |
| 首轮同步    | 实现文件存在且模板/样式与设计稿锚点对齐                         |
| tokens 收录 | `tokens.md` 中存在以该 id 或页面名作为章节标题的条目            |

---

## 2. 全量状态表（37 张）

### 2.1 已完全同步（首轮 + tokens.md 已收录）

| ID       | 中文名                       | \_raw | parsed | screenshot | 实现文件                                                                         | tokens 章节                                                                |
| -------- | ---------------------------- | ----- | ------ | ---------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ed2b5fdd | 首页                         | 是    | 是     | 否         | `src/pages/main/HomePage.vue`                                                    | HomePage (ed2b5fdd)                                                        |
| 84fafb58 | 我的                         | 是    | 是     | 是         | `src/pages/main/MePage.vue`                                                      | MePage Highlight Cards / page background / Icon slices                     |
| 448a71c7 | 编辑资料                     | 是    | 是     | 是         | `src/pages/stack/ProfilePage.vue`                                                | Profile Avatar / Danger Button / Cards & Menu Rows                         |
| ec169e34 | 修改密码                     | 是    | 否     | 是         | `src/pages/stack/profile/ChangePasswordPage.vue`                                 | ChangePasswordPage (ec169e34)                                              |
| daac9da5 | 设置                         | 是    | 否     | 是         | `src/pages/stack/SettingsPage.vue`                                               | SettingsPage (daac9da5)                                                    |
| 94e98b66 | 声纹设置                     | 是    | 否     | 是         | `src/pages/stack/settings/VoiceprintPage.vue`                                    | VoiceprintPage (94e98b66)                                                  |
| d2a7b5f3 | 修改声纹设置                 | 是    | 否     | 是         | `src/pages/stack/settings/voiceprint/DetailPage.vue`                             | VoiceprintPage DetailPage (d2a7b5f3)                                       |
| 4e6ad306 | 声纹录制 3（准备）           | 否    | 是     | 否         | `src/components/settings/voiceprint/RecordPanel.vue`                             | Voiceprint Recording Module                                                |
| 1ed5ff10 | 声纹录制 4（朗读）           | 否    | 否     | 否         | `src/components/settings/voiceprint/RecordPanel.vue`                             | Voiceprint Recording Module                                                |
| affd466e | 声纹录制 2（命名）           | 否    | 否     | 否         | `src/components/settings/voiceprint/VoiceNamingPanel.vue` + `SubmitPanel.vue`    | Voiceprint Recording Module                                                |
| 2d090f70 | 登录页-注册                  | 否    | 是     | 是         | `src/pages/stack/AuthPage.vue` + `components/auth/*`                             | Typography / Buttons / Input Fields / Page Background Gradient（通用章节） |
| 72b3b33f | 登录页-检测手机号            | 否    | 是     | 是         | 同上                                                                             | 同上                                                                       |
| 883b0908 | 登录页-密码登录              | 否    | 是     | 是         | 同上                                                                             | 同上                                                                       |
| 4a4704cc | 登录页-验证码登录            | 否    | 是     | 是         | 同上                                                                             | 同上                                                                       |
| d4baeedf | 乐宝设置-多语言              | 是    | 否     | 是         | `src/pages/stack/device-config/LanguagePage.vue`                                 | LanguagePage (d4baeedf) / Device-Config Slice Fingerprints                 |
| 4b20baad | 乐宝设置-语音风格            | 是    | 否     | 是         | `src/pages/stack/device-config/VoiceStylePage.vue`                               | VoiceStylePage (4b20baad) / Device-Config Slice Fingerprints               |
| f001e23d | 乐宝设置-未开启 AI 个性调节  | 是    | 否     | 是         | `src/pages/stack/device-config/PersonalityPage.vue`                              | PersonalityPage / PersonalityDetailPage (f001e23d / 31e9fabe / 31c5986a)   |
| 31e9fabe | 乐宝设置-AI 个性调节初始     | 是    | 否     | 是         | `src/pages/stack/device-config/PersonalityDetailPage.vue`                        | PersonalityPage / PersonalityDetailPage (f001e23d / 31e9fabe / 31c5986a)   |
| 31c5986a | 乐宝设置-AI 个性调节修改     | 是    | 否     | 是         | `src/pages/stack/device-config/PersonalityDetailPage.vue`                        | PersonalityPage / PersonalityDetailPage (f001e23d / 31e9fabe / 31c5986a)   |
| a2096a64 | 聊天页                       | 是    | 否     | 否         | `src/pages/stack/ChatPage.vue` + `components/chat/*`                             | ChatPage (a2096a64) / Chat Slice Fingerprints                              |
| ed71eb82 | 完善个人信息                 | 是    | 是     | 是         | `src/components/auth/SetupProfilePanel.vue`                                      | SetupProfilePanel (ed71eb82 / fb8d01d5)                                    |
| fb8d01d5 | 完善个人信息（选择关系弹窗） | 是    | 是     | 是         | 同上（底部关系网格）                                                             | SetupProfilePanel (ed71eb82 / fb8d01d5)                                    |
| 902f07b4 | 家庭组设置                   | 是    | 否     | 是         | `src/pages/stack/FamilyGroupPage.vue`                                            | FamilyGroupPage (902f07b4)                                                 |
| eb36a568 | xx 的家庭组                  | 是    | 否     | 否         | `src/pages/stack/family-group/DetailPage.vue`                                    | FamilyGroupDetailPage (eb36a568)                                           |
| 5d6d5199 | xx 的家庭组-成员信息         | 是    | 否     | 否         | `src/pages/stack/family-group/MemberPage.vue`                                    | FamilyGroupMemberPage (5d6d5199)                                           |
| 90de50b4 | xx 的家庭组-邀请成员         | 是    | 否     | 否         | `src/pages/stack/family-group/InvitePage.vue`                                    | FamilyGroupInvitePage (90de50b4)                                           |
| b7df1135 | 修改儿童信息                 | 是    | 否     | 否         | `src/pages/stack/family-group/ChildEditPage.vue`                                 | ChildEditPage (b7df1135 / c7826afa)                                        |
| c7826afa | 填写儿童信息后创建家庭组     | 是    | 否     | 否         | 同上                                                                             | ChildEditPage (b7df1135 / c7826afa)                                        |
| 5f6208e5 | 消息页                       | 是    | 否     | 否         | `src/pages/stack/MessagesPage.vue`                                               | MessagesPage (5f6208e5)                                                    |
| 64595f70 | 我的订单                     | 是    | 否     | 否         | `src/pages/stack/OrdersPage.vue`                                                 | OrdersPage (64595f70)                                                      |
| 897ffb14 | 关于我们                     | 是    | 否     | 否         | `src/pages/stack/AboutPage.vue`                                                  | AboutPage (897ffb14)                                                       |
| 689263cd | 帮助与反馈                   | 是    | 否     | 否         | `src/pages/stack/HelpPage.vue`                                                   | HelpPage (689263cd)                                                        |
| 824d2d70 | 成长数据中心                 | 是    | 否     | 否         | `src/pages/stack/GrowthDataPage.vue` + `components/growth-data/OverviewCard.vue` | GrowthDataPage (824d2d70)                                                  |

小计：33 张完全同步。

### 2.2 已首轮同步但 tokens.md 无专属章节（待复核）

_全部 4 张已于 2026-05-08 晋升到 2.1（候选 D 完成），本节目前为空。_

### 2.3 暂不处理（边界状态）

| ID       | 中文名                | 备注                                |
| -------- | --------------------- | ----------------------------------- |
| 03fd2e0a | 启动页（还没设计）    | `all-designs.json` 名字即注明未设计 |
| 4b2d5a38 | 首次登录-功能引导示例 | 占位稿，功能未纳入当前版本          |
| 50f08b5c | 乐宝                  | 名字语义不明，无对应页面需求        |
| e545d325 | 声纹录制 1            | 已被 RecordPanel 的两阶段流统一实现 |

小计：4 张。

**合计**：33 完全同步 + 0 待复核 + 4 暂不处理 = 37 张，与 `all-designs.json` 一致。

---

## 3. 下一步建议（按优先级）

1. ~~**候选 D — 非家庭组外围页**~~（已完成 2026-05-08）
   - 5f6208e5 / 64595f70 / 897ffb14 / 689263cd 已晋升到 2.1
   - 关键改动：messages 改为 4 独立 card + 12px gap、dot 色对齐 `--clr-danger-bg`；orders image 64→88、action button 64×24 + primary 改 `--clr-link`；about bg 修正为 `--clr-white`、title 15px；help body 改 padding+行高布局、`.help-row__value` 默认改 link 色
2. ~~**候选 A — 家庭组 5 页 tokens 复核**~~（已完成 2026-05-08）
   - eb36a568 / 5d6d5199 / 90de50b4 / b7df1135 / c7826afa 已晋升到 2.1
   - 关键改动：新增 `--clr-btn-weak-border-soft` 与 SetupProfilePanel 共享；child-edit 间距全量修正；info-card 显式 `height: 302px`
3. ~~**候选 B — ChatPage 权威化**~~（已完成 2026-05-08）
   - a2096a64 已晋升到 2.1
   - tokens 章节：ChatPage (a2096a64) / Chat Slice Fingerprints
   - 关键改动：`:root` 新增 20 个 `--chat-*` token、mascot 位置由 16px 修正为 30px、对 bubble/input 为 code-enhancement 的 shadow/gradient 记入 Principle 10 Decisions
4. ~~**候选 C — 设备设置子页簇**~~（已完成 2026-05-08）
   - d4baeedf / 4b20baad / 31e9fabe / 31c5986a / f001e23d 已晋升到 2.1
   - tokens 章节：LanguagePage / VoiceStylePage / PersonalityPage & PersonalityDetailPage / Device-Config Slice Fingerprints
5. **成长数据中心同步**（已完成 2026-05-09）
   - 824d2d70 已归入 2.1
   - tokens 章节：GrowthDataPage (824d2d70)
   - 关键改动：`:root` 新增 27 个 `--growth-*` / `--clr-growth-*` token、YouSheBiaoTiHei 字体、CSS-only 图表占位符（3 个 Principle decisions）

---

## 4. 工具速查

| 条目          | 值                                                    |
| ------------- | ----------------------------------------------------- |
| `tid`         | `043c655d-def8-4d64-8b42-11143b799069`                |
| `pid`         | `aba59ed3-cb41-4ddb-9e79-ccb13b416f04`                |
| 抓 raw JSON   | `node page/lanhu-mcp-assets/fetch-raw.mjs <image_id>` |
| 抓截图        | MCP `lanhu_get_screenshot`                            |
| 抓切图        | MCP `lanhu_download_slices`（默认 2× webp）           |
| tokens 权威表 | `.qoder/skills/lanhu-ui-sync/tokens.md`               |
| 技能文档      | `.qoder/skills/lanhu-ui-sync/SKILL.md`                |

---

## 5. 维护条款

任何后续 `/lanhu-ui-sync` 任务开始前，**必须先阅读本文件第 2 节**；任务完成后必须回填相应行（将 2.2 的条目移入 2.1，或在 2.1 的行里更新 tokens 章节名）。

新增设计稿时：

- 在 `all-designs.json` 条目出现后，先归入 2.2 或 2.3；
- 在表末追加行，**不允许插入到中间**，以保持历史顺序稳定。

修改 `tokens.md` 章节标题时，同步修改本文件 2.1 "tokens 章节" 列，避免交叉引用失效。
