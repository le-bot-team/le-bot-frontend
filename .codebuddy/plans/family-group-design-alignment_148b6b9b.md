---
name: family-group-design-alignment
overview: 将家庭组详情页(DetailPage.vue)与蓝湖设计稿对齐，儿童编辑复用 AddVirtualDevicePage 表单样式，成员信息页(MemberPage.vue)对齐设计稿并移除声纹属性。
todos:
  - id: update-detail-page
    content: 使用 [skill:lanhu-ui-sync] 对齐 DetailPage.vue：儿童头卡改用 100px 圆形头像居中布局，成员列表改用全局 .family-group-member-card/.family-group-member-name/.family-group-member-meta/.family-group-member-chevron 类，邀请按钮复用 .family-group-add-btn 类
    status: completed
  - id: update-member-page
    content: 使用 [skill:lanhu-ui-sync] 对齐 MemberPage.vue：移除声纹行（模板+逻辑），信息卡片改用全局 .family-member-info-card/.family-member-info-row/.family-member-info-label/.family-member-info-value 类，删除按钮改用 .family-member-delete-btn 类
    status: completed
  - id: update-i18n-child-edit
    content: 补充 ChildEditPage 编辑模式按钮文案：中文"提交修改"，英文"Submit Changes"
    status: completed
  - id: verify-child-edit-flow
    content: 使用 [skill:vue-expert] 验证点击儿童头像 → ChildEditPage 编辑模式的完整流程：确认路由参数传递、表单预填数据、提交更新逻辑正常工作
    status: completed
---

## 用户需求

### 1. 家庭组详情页对齐设计稿 (eb36a568)

将 `DetailPage.vue` 的儿童头卡和成员列表与设计稿对齐：

- 儿童区域：100×100px 圆形头像，下方居中显示名字（15px Regular）和性别年龄（15px Regular, rgba(147,152,169,1)）
- 成员行：左侧名称（15px Regular 主色），箭头分隔，右侧角色（15px Regular 水印色）
- 底部"邀请成员"按钮（311×56px, 圆角28px, 主色背景白色文字）

### 2. 点击儿童头像查看/编辑

复用 AddVirtualDevicePage 的 Step1 表单（性别选择 + 名字输入 + 生日选择），支持查看和修改已有儿童信息，提交按钮文案为"提交修改"。该功能现有 `ChildEditPage.vue` 已基本实现，仅需调整 i18n。

### 3. 成员信息页对齐设计稿 (5d6d5199)

更新 `MemberPage.vue`：

- 移除"声纹"行（设计稿有此属性但用户明确不需要）
- 保留创建者信息展示
- 信息卡片使用全局 CSS 样式（335×302px, 12px 圆角）
- 删除按钮使用全局警示按钮样式（335×56px）

## 技术方案

### 实现策略

项目已在 `src/css/app.scss` 中预定义了完整的设计稿对应全局 CSS 类（含 family-group 和 family-member 系列 class），当前 `DetailPage.vue` 和 `MemberPage.vue` 使用了 scoped 私有样式而非这些全局类。本次对齐的核心策略是：**将页面组件的 scoped 样式替换为已有的全局 CSS 类**，确保视觉效果严格匹配蓝湖设计稿。

### 关键决策

1. **复用全局 CSS 类而非重写**：`app.scss` 已根据蓝湖设计稿的精准尺寸定义了 `.family-group-member-card`（335×62px r12）、`.family-member-info-card`（335×302px r12）、`.family-member-delete-btn`（335×56px danger 色）等 class，直接引用可避免样式漂移
2. **儿童编辑复用现有流程**：点击儿童头像 → `family-group-child-edit` 路由（已有），ChildEditPage 已含编辑模式并使用了与 AddVirtualDevicePage 相同的表单组件（性别选择 + 名字输入 + BirthdayPicker），仅需补充"提交修改"的 i18n 文案
3. **声纹行完全移除**：MemberPage 中的声纹行从模板和逻辑中删除，不依赖 v-if 隐藏

### 受影响文件

| 文件 | 变更类型 | 说明 |
| --- | --- | --- |
| `src/pages/stack/family-group/DetailPage.vue` | MODIFY | 替换 scoped 样式为全局 class，调整儿童头卡布局 |
| `src/pages/stack/family-group/MemberPage.vue` | MODIFY | 移除声纹行，替换为全局 class，更新删除按钮样式 |
| `src/i18n/zh-CN/index.ts` | MODIFY | 补充 ChildEditPage 编辑模式按钮文案 |
| `src/i18n/en-US/index.ts` | MODIFY | 补充对应英文翻译 |


## 使用的 Agent 扩展

### Skill

- **lanhu-ui-sync**
- 用途：比对蓝湖设计稿与当前代码的全局 CSS 定义，确保设计令牌（字体、颜色、尺寸）与设计稿完全对齐
- 预期结果：确认 `app.scss` 中 family-group 相关全局 class 已覆盖设计稿中所有元素的样式定义

- **vue-expert**
- 用途：指导 Vue 3 Composition API 组件重构，确保 scoped 样式到全局 class 的迁移过程中不引入响应式问题或样式泄漏
- 预期结果：DetailPage 和 MemberPage 的模板结构清晰，全局 class 正确绑定，组件逻辑无回归