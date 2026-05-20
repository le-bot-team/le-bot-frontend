---
name: temporary-voiceprint-ui
overview: 根据蓝湖设计稿，在声纹设置列表页新增"临时声纹"标签展示，在详情/编辑页实现临时声纹转永久保存功能（修改名称+关系后提交即为永久保存）。
todos:
  - id: add-i18n-keys
    content: 在 zh-CN 和 en-US 国际化文件中为 VoiceprintPage.labels 新增 temporalTag 和 temporalHint 翻译键
    status: completed
  - id: add-css-styles
    content: 在 app.scss 的 voiceprint-page 样式块下方新增 voiceprint-row__temporal-tag（48x16px 橙色圆角标签）和 voiceprint-hint（12px 提示文字）样式
    status: completed
  - id: update-list-page
    content: 修改 VoiceprintPage.vue 模板，在声纹名称右侧条件渲染"临时声纹"标签，并在列表卡片下方添加提示文字
    status: completed
    dependencies:
      - add-i18n-keys
      - add-css-styles
  - id: update-detail-page
    content: "修改 DetailPage.vue 的 submitUpdate() 方法，调用 updatePerson 时传入 isTemporal: false 实现临时转永久"
    status: completed
---

## 用户需求

根据蓝湖设计稿（94e98b66 / d2a7b5f3），在声纹设置模块实现临时声纹的完整 UI 交互。

## 核心功能

### 1. 声纹列表页新增临时声纹标识

- 当 `person.is_temporal === true` 时，在声纹名称右侧显示橙色"临时声纹"标签（48x16px 圆角，白色 10px 文字）
- 在声纹列表卡片下方显示提示文字："*临时声纹保存一段时间后会自动清除，点击声纹去保留*"（12px, rgba(147,152,169,1)）

### 2. 声纹编辑页支持临时声纹转永久

- 用户进入临时声纹的编辑页，修改名称和关系后点击"提交修改"时，自动将 `isTemporal` 设为 `false`，实现"永久保存"
- 编辑页仅允许修改名称和关系，不允许重新录制声纹（已由现有 VoiceNamingPanel 组件支持）

### 3. 业务场景

- 聊天过程中有人喊乐宝，系统不认识时会询问身份，后端自动记录为临时声纹
- 临时声纹若长期未被后端匹配到，会通过后端指令删除
- 用户点击临时声纹进入编辑页并保存后，转为永久声纹

## Tech Stack

- 前端框架：Vue 3 + Composition API + TypeScript
- UI 框架：Quasar (q-icon, q-page)
- 样式：SCSS (app.scss)
- 国际化：项目内置 i18n (zh-CN / en-US)
- API：axios (boot/axios)

## Implementation Approach

采用**最小增量修改**策略，在现有声纹模块架构上直接扩展：

1. **VoiceprintPage.vue**：在模板的 `v-for` 循环中利用已有的 `person.is_temporal` 字段，条件渲染"临时声纹"标签；在列表卡片下方添加提示文字段落
2. **DetailPage.vue**：在 `submitUpdate()` 中调用 `updatePerson()` 时额外传入 `isTemporal: false`，利用已有 API 参数实现转永久
3. **i18n 文件**：在 `VoiceprintPage.labels` 下新增 2 个 key（中英文）
4. **app.scss**：在现有 voiceprint-* 样式块下方新增 tag 和 hint 的样式规则

所有修改复用现有组件 API、类型定义和设计 token 变量，无需新增组件或 API 接口。

## Implementation Notes

- **性能**：`is_temporal` 条件判断在 v-for 循环中为 O(1) 布尔检查，无性能影响
- **向后兼容**：仅在 `is_temporal === true` 时渲染新 UI 元素，永久声纹的列表行行为完全不变
- **日志**：`submitUpdate()` 中已有的错误处理会自动覆盖新增的 `isTemporal` 参数传递场景
- **DetailPage 中的 isTemporal 传递**：无论当前声纹是否临时，统一传 `isTemporal: false` 是安全的——对永久声纹无副作用，对临时声纹完成转换

## Architecture Design

无架构变更。所有修改集中在现有组件和样式的增量扩展上。

## Directory Structure

```
le-bot-frontend/
├── src/
│   ├── pages/stack/settings/
│   │   ├── VoiceprintPage.vue          # [MODIFY] 模板新增临时标签和提示文字
│   │   └── voiceprint/
│   │       └── DetailPage.vue          # [MODIFY] submitUpdate() 新增 isTemporal: false
│   ├── i18n/
│   │   ├── zh-CN/index.ts              # [MODIFY] 新增 temporalTag, temporalHint 翻译
│   │   └── en-US/index.ts              # [MODIFY] 新增 temporalTag, temporalHint 翻译
│   └── css/
│       └── app.scss                    # [MODIFY] 新增 voiceprint-row__temporal-tag 和 voiceprint-hint 样式
```

## Agent Extensions

### Skill

- **vue-expert**
- Purpose：确保 Vue 3 Composition API、Quasar 组件和 SCSS 样式的修改符合项目现有模式和最佳实践
- Expected outcome：代码风格一致、类型安全、样式与现有设计 token 对齐

### MCP

- **lanhu**
- Purpose：在开发过程中可随时查阅蓝湖设计稿，确认"临时声纹"标签的精确颜色值、尺寸和布局参数
- Expected outcome：UI 实现与设计稿视觉一致