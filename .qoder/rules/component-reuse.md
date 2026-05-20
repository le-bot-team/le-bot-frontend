# 组件开发复用规范

新增或修改组件时，应遵循以下原则：

- **优先复用 Quasar 框架组件**：使用 Quasar 提供的 UI 组件（如 `q-btn`、`q-input`、`q-card` 等）而非自行实现相同功能的 HTML/CSS 结构。参考 Quasar 官方文档选择合适的组件。
- **复用项目全局样式**：优先使用 `src/css/app.scss` 中已定义的 CSS class 和变量，避免在组件内重复定义相同的样式规则。
- **保持文件结构一致**：新组件应放在与所属功能模块对应的目录下，遵循项目已有的目录组织方式（如 `components/auth/`、`components/chat/` 等）。
- **保持语法风格一致**：组件使用 `<script setup lang="ts">` 语法，CSS 使用 `<style lang="scss">`，遵循项目已有组件的代码风格和命名约定。
