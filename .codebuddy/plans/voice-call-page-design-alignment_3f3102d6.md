---
name: voice-call-page-design-alignment
overview: VoiceCallPage.vue 与设计稿对比，发现6项差异需要修复：右上角"字"按钮缺失、机器人背景错误(应无圆框)、机器人图片带多余底色、底部缺中间"..."按钮、页面背景色偏差等
todos:
  - id: fix-nav-button
    content: "修复导航栏\"字\"按钮: 扩展bus事件类型+StackHeader接口+app.scss样式+routes配置+页面事件监听"
    status: completed
  - id: fix-robot-area
    content: "重构机器人区域: 移除圆形渐变背景层, 更换或优化机器人图片, 调整尺寸和透明度"
    status: completed
  - id: fix-buttons-layout
    content: "修正底部按钮布局: 将圆点指示器从文字下方移到麦克风和挂断按钮之间形成3列"
    status: completed
  - id: fix-messages-and-bg
    content: 修复消息区域重叠效果+页面背景色调整为浅米色调
    status: completed
    dependencies:
      - fix-robot-area
---

## 产品概述

修复 VoiceCallPage.vue（语音通话页面）使其与蓝湖设计稿完全一致。用户提供了当前实现的错误截图和蓝湖设计稿截图，要求全面对比差异并逐个修复。

## 核心功能差异清单

通过逐像素对比**当前实现(error_chat)** vs **蓝湖设计稿(设计稿)**，确认以下所有差异项：

| # | 差异项 | 设计稿 | 当前实现 | 优先级 |
| --- | --- | --- | --- | --- |
| 1 | **导航栏右侧"字"按钮** | 右上角有"字"图标按钮，用于切换文字显示模式 | 完全缺失 | P0 |
| 2 | **机器人圆形渐变背景** | 无任何背景容器，机器人直接展示在页面背景上 | 有浅蓝绿渐变圆形背景(opacity-60) + 内部粉红圆角矩形 | P0 |
| 3 | **机器人图片本身** | 大尺寸透明底乐宝图，无方框底色 | 使用了带粉红色圆角矩形底的缩略图标(img-lebot2-example.png) | P0 |
| 4 | **底部按钮布局** | 3个元素: 麦克风(左) + 圆点指示器(中) + 挂断(右)，水平排列 | 仅2个按钮: 麦克风(左)+挂断(右)，圆点在文字下方 | P1 |
| 5 | **消息文字位置** | 文字浮于机器人下半部分之上(融合/重叠效果) | 文字完全在机器人区域下方(分离布局) | P1 |
| 6 | **页面背景色** | 浅米色暖调(#F5F5F0左右) | 纯白色(#FFFFFF) | P2 |
| 7 | **机器人尺寸比例** | 机器人占据页面上半大部分区域，视觉占比大 | 机器人在374x367圆形内，视觉占比较小 | P1 |


## 技术栈

- Quasar Framework + Vue 3 (Composition API) + TypeScript + SCSS
- 路由: Vue Router（StackHeader 布局支持 headerActions 机制）
- 事件总线: Quasar EventBus（src/boot/bus.ts）
- i18n: vue-i18n（i18nSubPath 工具函数）

## 实现方案

### 修改策略：分层级联修复

按依赖关系分4步执行，每步独立可验证：

### Step 1: 导航栏"字"按钮（headerActions机制）

- **bus.ts**: 在 EventBus 类型声明中添加 `'chat:text-toggle': () => void` 事件
- **StackHeader.vue**: 扩展 `HeaderActionMeta.event` 联合类型，增加 `'chat:text-toggle'`
- **app.scss**: 添加 `.stack-header-action--chat-text-toggle` CSS 类，使用 `icon-text-n-nav-chat.png` 作为 background-image
- **routes.ts**: 取消 voice-call 路由的 headerActions 注释，配置 `{ icon: 'chat-text-toggle', event: 'chat:text-toggle', ariaLabel: '文字模式' }`
- **VoiceCallPage.vue**: 监听 `chat:text-toggle` bus 事件，切换 `showTextMode` 状态控制消息区域显隐

### Step 2: 机器人区域重构（移除圆形背景+更换图片）

- **VoiceCallPage.vue template**: 移除 `.voice-call__robot-circle` 包装层，改为单层 `<img>` 直接展示
- **VoiceCallPage.vue style**: 
- 删除 `.voice-call__robot-circle` 的渐变背景和固定尺寸样式
- 重写 `.voice-call__robot-area`: 移除固定宽高和opacity-60，改用 flex 居中+自适应
- 重写 `.voice-call__robot-img`: 加大尺寸至约280-320px宽度，object-fit: contain
- **图片资源**: 当前 `img-lebot2-example.png` 是带粉底的设备列表缩略图（约32px），不适合作为通话页面大图。需要从蓝湖下载正确的透明底大图，或暂时使用现有资源但移除圆形背景使视觉效果接近设计稿。如果蓝湖没有单独的大图切图，则使用 CSS 移除背景框来改善效果。

### Step 3: 底部按钮布局调整（3列布局）

- **VoiceCallPage.vue template**: 将 `.voice-call__dots` 从 `.voice-call__bottom` 内部移到 `.voice-call__controls` 内部，放在麦克风和挂断按钮之间
- **VoiceCallPage.vue style**: 
- `.voice-call__controls` 保持 `display: flex; justify-content: center; gap: 32px`
- `.voice-call__dots` 样式适配行内排列（已在flex容器中）

### Step 4: 消息区域重叠+页面背景色

- **VoiceCallPage.vue style**:
- `.voice-call__messages`: 改为绝对定位或负margin-top，使其与机器人区域下半部分重叠
- `.voice-call-page`: 背景色从 `var(--clr-white)` 改为设计稿的浅米色调（约 `#F5F5F0` 或 `rgba(245,245,240,1)`）
- 为消息区添加从下往上的渐变遮罩（融合到背景）

## 关键文件变更清单

```
src/
├── boot/
│   └── bus.ts                              # [MODIFY] 添加 chat:text-toggle 事件类型
├── layouts/
│   └── headers/
│       └── StackHeader.vue                 # [MODIFY] 扩展 HeaderActionMeta.event 联合类型
├── css/
│   └── app.scss                            # [MODIFY] 添加 .stack-header-action--chat-text-toggle 样式
├── router/
│   └── routes.ts                           # [MODIFY] 启用 voice-call 路由的 headerActions 配置
└── pages/stack/chat/
    └── VoiceCallPage.vue                   # [MODIFY] 重构机器人区域、按钮布局、消息定位、背景色
```

## 实现注意事项

- headerActions 的 icon 字段会映射到 CSS class `stack-header-action--<suffix>`，必须与 app.scss 中定义的类名一致
- 机器人图片：如果当前资源库中没有合适的透明底大图，先用 CSS 方案（移除圆形背景+放大图片）逼近设计稿效果，后续替换图片资源即可
- 消息区域重叠需要注意 z-index 层级和滚动区域的交互
- 所有修改保持与项目现有约定一致：使用 `src/assets/lanhu/...` 路径引用图片、SCSS 变量引用颜色、i18n 引用文案

## Agent Extensions

### MCP: lanhu

- **Purpose**: 下载蓝湖设计稿中可能缺失的透明底乐宝机器人大图切片资源
- **Expected outcome**: 获取设计稿 64d5ecc8 或 98751f24 中的机器人图层切图（如果有独立的大图资源），用于替换当前带粉底的缩略图

### Skill: lanhu-ui-sync

- **Purpose**: 确保修复后的 UI 样式与蓝湖设计稿 token 一致（颜色值、间距、字号等）
- **Expected outcome**: 验证使用的 CSS 值与蓝湖原始设计数据匹配

### Skill: vue-expert

- **Purpose**: 确保 VoiceCallPage.vue 的 Vue 3 Composition API 重构符合最佳实践
- **Expected outcome**: 正确的响应式状态管理（showTextMode）、生命周期清理、事件监听器管理