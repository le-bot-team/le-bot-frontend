---
name: growth-data-page-lanhu-sync
overview: 将 GrowthDataPage 从 tab 切换面板改为长滚动页面，对齐蓝湖设计稿的布局、图表样式、装饰元素和交互方式。
todos:
  - id: copy-slices-to-public
    content: 将 lanhu 下载的切图资源（img-1/2/3.webp, icon-1/2/3/4.webp）复制到 public/ 目录，供页面引用
    status: completed
  - id: update-i18n-emotion-labels
    content: 在 i18n 中/英文文件新增5个情绪类别翻译键（开心/愉悦/平静/担忧/难过）
    status: completed
  - id: rewrite-growth-page-layout
    content: 重写 GrowthDataPage.vue：将 q-tabs/q-tab-panels 切换改为长滚动锚点模式，所有 section 平铺渲染，tab 点击触发 scrollIntoView 滚动
    status: completed
    dependencies:
      - copy-slices-to-public
  - id: update-emotion-chart-multiline
    content: 重写情绪变化图表为5线图（开心/愉悦/平静/担忧/难过），Y轴改为类别轴，每条线独立颜色和圆点标记
    status: completed
    dependencies:
      - rewrite-growth-page-layout
      - update-i18n-emotion-labels
  - id: add-top-decoration-images
    content: 在页面顶部添加装饰图片（img-1/2/3.webp），对齐设计稿的装饰层布局
    status: completed
    dependencies:
      - rewrite-growth-page-layout
  - id: align-section-card-styling
    content: 在 app.scss 中添加长滚动 section 卡片样式（独立白色卡片、accent bar、分隔线、总结标签），移除 share 按钮样式
    status: completed
    dependencies:
      - rewrite-growth-page-layout
  - id: fix-overview-card-styling
    content: 微调 OverviewCard.vue：移除头像灰色边框，对齐设计稿的统计行间距和文字样式
    status: completed
  - id: add-scrollspy-active-tab
    content: 实现滚动监听（IntersectionObserver），滚动时自动高亮当前可视 section 对应的顶部 tab
    status: completed
    dependencies:
      - rewrite-growth-page-layout
---

## 用户需求

将"成长数据中心"（GrowthDataPage）页面对齐蓝湖设计稿 `image_id: eaf176a6-e185-48c4-babe-da8398f0098b`（375×2242px 长滚动页面）。

## 核心功能变更

- **布局模式**：从 tab 面板切换改为长滚动页面，所有 section 连续排列；顶部 tab 按钮点击后滚动到对应锚点位置，不做面板切换
- **情绪图表**：从单条折线改为五条折线（开心/愉悦/平静/担忧/难过），每条独立颜色和圆点标记
- **顶部装饰**：添加设计稿中的装饰图片和光晕效果
- **移除分享按钮**：设计稿头部无分享 icon
- **Section 样式**：每个 section 为独立白色圆角卡片，带 accent bar（4×12px 蓝色渐变竖条）、分隔线、黑底白字"总结"标签

## 视觉对齐要点

- 标题"成长数据中心"：YouSheBiaoTiHei 36px，letter-spacing 4%，color rgba(36,61,59,1)
- 日期：Roboto Regular 14px，rgba(58,89,86,1)
- Section 标题：AlibabaPuHuiTi Medium 17px，rgba(21,23,23,1)
- 图表坐标轴标签：10px，rgba(74,74,74,1)
- 总结标签：黑底 rgba(18,14,44,1) 白字 12px Medium

## 技术栈

- Vue 3 Composition API + TypeScript
- Quasar Framework (布局组件保留，但 tab 组件替换逻辑)
- vue-echarts / ECharts v6（图表渲染）
- SCSS（样式层，CSS 变量体系）

## 实现方案

### 布局变更策略

当前使用 `q-tabs` + `q-tab-panels` 的 panel 切换模式。改为：

1. 保留顶部 tab 按钮视觉结构，但使用自定义点击事件触发 `scrollIntoView({ behavior: 'smooth' })` 滚动到对应 section
2. 全部 section 卡片连续渲染在页面中，通过 `ref` 引用获取 DOM 元素
3. 滚动监听：`activeTab` 状态通过 IntersectionObserver 或 scroll 事件动态更新，高亮当前可视 section 对应的 tab
4. `q-page` 使用 `position: relative` + overflow-y: auto 的滚动容器

### 情绪图表变更

从单条 line series 扩展到5条 line series：

- 5条线分别对应：开心、愉悦、平静、担忧、难过
- Y轴改为类别轴（category type），5个情绪标签
- X轴保持日期轴
- 每条线使用不同颜色和圆点标记（参考设计稿中的 Bar containers 颜色体系）

### 装饰图片引用

将已下载的切图复制到 `public/` 目录下，在模板中使用相对路径引用：

- `img-1.webp` → 顶部大面积装饰图
- `img-2.webp` → 数据成长插图
- `img-3.webp` → 写字板装饰

### 性能考虑

- ECharts 实例通过 `shallowRef` 避免不必要的响应式追踪
- 图表初始化使用 `{ renderer: 'canvas' }` 保持透明背景
- 滚动监听使用 `passive: true` 防止阻塞主线程
- 锚点滚动使用原生 `scrollIntoView`，无需额外依赖

## 涉及文件

```
src/
├── pages/stack/
│   └── GrowthDataPage.vue          # [MODIFY] 主页面：布局从 tab 切换改为长滚动锚点模式，情绪图表改为5线图，添加顶部装饰图，移除分享按钮
├── components/growth-data/
│   └── OverviewCard.vue            # [MODIFY] 概览卡片：微调头像边框（移除灰色边框）、对齐设计 token
├── css/
│   └── app.scss                    # [MODIFY] 新增 growth-scroll-section、growth-anchor-tab、growth-section-anchor 等 CSS 类和变量
├── i18n/
│   ├── zh-CN/index.ts              # [MODIFY] 新增情绪类别翻译：开心/愉悦/平静/担忧/难过
│   └── en-US/index.ts              # [MODIFY] 对应英文翻译：Happy/Delighted/Calm/Worried/Sad
```

## 关键代码结构

### GrowthDataPage.vue 逻辑变更摘要

1. 移除 `q-tab-panels`，将所有 section 卡片直接平铺在 `growth-content` 内
2. 添加 `const sectionRefs = { emotion: ref(), interaction: ref(), capability: ref(), hotTopics: ref() }`
3. 添加 `function scrollToSection(name) { sectionRefs[name].value?.$el?.scrollIntoView(...) }`
4. Tab 点击事件改为 `@click="scrollToSection(tab.name)"`
5. emotion chart option 改为包含5个 series 的多线配置
6. 添加 scroll 事件监听更新 activeTab（IntersectionObserver 更优）

## Agent Extensions

### Skill

- **lanhu-ui-sync**
- Purpose: 指导设计 token 的提取、CSS 变量层的级联修改、确保暗色模式兼容
- Expected outcome: 产出全局→页面→组件的三层级联 CSS 修复方案，确保所有新增样式遵循项目 token 体系

### MCP

- **lanhu**
- Purpose: 已用于获取设计稿结构化数据、截图和切图资源。后续可验证最终实现与设计稿的一致性
- Expected outcome: 设计稿数据已全部获取并保存在 `page/lanhu-mcp-assets/` 目录