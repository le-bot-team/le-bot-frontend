---
name: growth-data-page-lanhu-sync
overview: 根据蓝湖设计稿(eaf176a6)完全同步"成长数据中心"页面，修复背景颜色、日期显示、顶部操作按键、装饰图标重叠、爱心切图、整体布局等6大类差异问题。
todos:
  - id: fix-bg-glow
    content: 修正页面背景渐变和光晕层CSS变量
    status: completed
  - id: fix-date-picker
    content: 重构日期选择器为设计稿样式(文字+图标)
    status: completed
    dependencies:
      - fix-bg-glow
  - id: fix-action-buttons
    content: 修正顶部操作按钮为切图
    status: completed
    dependencies:
      - fix-bg-glow
  - id: fix-decorations
    content: 调整右侧装饰图位置和层级
    status: completed
    dependencies:
      - fix-bg-glow
  - id: fix-overview-card
    content: 修复OverviewCard头像、陪伴徽章、爱心图标
    status: completed
    dependencies:
      - fix-date-picker
  - id: fix-stats-row
    content: 修正统计行布局和分割线颜色
    status: completed
    dependencies:
      - fix-overview-card
  - id: verify-sync
    content: 使用[mcp:lanhu]获取设计稿截图比对验证
    status: completed
    dependencies:
      - fix-stats-row
      - fix-action-buttons
      - fix-decorations
---

## 产品概述

同步成长数据中心页面与设计稿(eaf176a6-e185-48c4-babe-da8398f0098b)完全一致，修正6处视觉差异。

## 核心功能

- 页面背景渐变 + 径向光晕层
- 顶部标题 + 日期选择器样式
- OverviewCard组件布局（头像、昵称、陪伴时间徽章）
- 统计数据行布局
- 图表区域样式

## Tech Stack

- Vue 3 + TypeScript + Quasar Framework
- SCSS for styling
- ECharts for data visualization

## 实现方案

基于蓝湖设计稿精确尺寸和颜色值，采用分层修复策略：

1. **全局CSS变量校准** - 修正背景渐变、光晕位置、颜色值
2. **页面级结构调整** - 重构日期选择器为设计稿样式、调整装饰图位置
3. **组件级细节修复** - OverviewCard头像、陪伴徽章、统计行分割线

## 关键设计Token (来自raw_json)

- 页面背景: linear-gradient(180deg, rgba(114,228,218,1) 0%, rgba(236,255,246,1) 20%, rgba(255,255,255,1) 45%)
- 标题: YouSheBiaoTiHei-Bold, 36px, letter-spacing:4%, rgba(36,61,59,1)
- 日期: Roboto Regular 14px, rgba(58,89,86,1), 容器150×28圆角
- 头像背景: rgba(134,224,248,1), 56×56圆形
- 陪伴徽章: rgba(32,204,249,1)文字, 浅青底色rgba(200,244,240,0.6)
- 统计分割线: 1×16, rgba(32,204,249,1)

## 切图资源映射

- img-1.webp: 顶部大图 (345×326)
- img-2.webp: 数据插图 (170×162)  
- img-3.webp: 写字板装饰 (181×176)
- icon-1.webp: 日期下拉图标 (16×16)
- icon-4.webp: 爱心图标 (14×14)

## 目录结构

```
src/pages/stack/
  GrowthDataPage.vue          [MODIFY] 页面布局、日期选择器、装饰图位置
src/components/growth-data/
  OverviewCard.vue            [MODIFY] 头像、陪伴徽章、统计行
src/css/
  app.scss                    [MODIFY] CSS变量微调
public/lanhu-slices/
  img-1.webp ~ img-3.webp     [EXIST] 已下载
  icon-1.webp ~ icon-9.webp   [EXIST] 已下载
```

## Agent Extensions

### MCP

- **lanhu**
- Purpose: 获取蓝湖设计稿精确尺寸、颜色、切图资源
- Expected outcome: 确保所有视觉参数严格对齐设计稿

### Skill

- **lanhu-ui-sync**
- Purpose: 系统性同步UI代码与蓝湖设计规范
- Expected outcome: 分层修复全局CSS→页面→组件样式

- **vue-expert**
- Purpose: Vue 3组件结构优化、Composition API最佳实践
- Expected outcome: 组件代码符合项目规范