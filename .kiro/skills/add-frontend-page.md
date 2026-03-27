# Skill: 新增前端页面

## Description
在单页应用中新增一个页面（原生 JS，无框架）。

## Steps

### 1. 在 index.html 中添加页面容器
- 在 `index.html` 中新增 `<div class="page" id="<页面名>-page">` 区块
- 遵循现有页面的 HTML 结构模式

### 2. 添加样式
- 在 `css/style.css` 中添加页面样式
- 使用 CSS 变量（`--primary-color` 等）保持主题一致
- 确保暗色主题兼容（`[data-theme="dark"]`）

### 3. 添加逻辑
- 在 `js/app.js` 中添加页面初始化和交互逻辑
- 页面切换使用现有的导航机制
- 如需调用 API，通过 `BackendService` / `AIService`

### 4. 导航接入
- 在导航栏或相关入口添加跳转
- 确保页面间流转顺畅

## Checklist
- [ ] HTML 结构已添加
- [ ] 样式支持亮色/暗色主题
- [ ] 移动端适配正常
- [ ] 导航可达
