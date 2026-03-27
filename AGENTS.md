# AGENTS.md

## 项目概述
恋语AI — 恋爱关系军师，帮用户看懂关系局势、判断推进时机、给出可执行动作。不是普通聊天机器人。

## 技术栈
- 前端: 原生 HTML5 + CSS3 + JavaScript（无框架），单页应用
- 后端: Node.js + Express（`backend/src/`）
- 数据库: MySQL / PostgreSQL
- AI: 多模型适配，当前默认 qwen-plus (阿里云 DashScope)
- 跨平台: Capacitor (iOS/Android) + 微信小程序

## 关键文件
- `index.html` — 前端单页入口
- `js/app.js` — 前端核心逻辑（293KB，所有 UI 逻辑）
- `css/style.css` — 主样式（支持亮色/暗色主题）
- `backend/src/index.js` — Express 入口
- `backend/src/controllers/aiExtensionController.js` — AI 扩展能力（关系分析等）
- `backend/src/services/aiService.js` — AI 模型调用
- `backend/src/routes/aiRoutes.js` — AI 路由
- `api/backend-service.js` — 前端 HTTP 请求封装
- `api/ai-service.js` — 前端 AI 业务封装
- `docs/` — 完整产品文档

## 开发规范
- API 响应格式: `{ "status": "success", "data": {...} }`
- 错误响应: `{ "success": false, "message": "..." }`
- 文件名 kebab-case，变量 camelCase，类 PascalCase
- 异步用 async/await，错误用 catchAsync 包装
- AI 输出必须是固定结构 JSON，不允许自由格式
- 分支策略: `main` 是唯一主线

## MVP V1 聚焦
当前只做关系分析主链路：用户提供聊天上下文 → 系统分析 → 输出关系雷达 + 推进建议 + 话术。核心接口: `POST /api/ai/relationship-analysis`。不做发散功能。

## 新增 AI 能力的流程
1. `backend/src/controllers/aiExtensionController.js` 加控制器方法（含专用 Prompt）
2. `backend/src/routes/aiRoutes.js` 注册路由
3. `api/backend-service.js` 加请求方法
4. `api/ai-service.js` 加业务封装
5. Prompt 必须包含：角色定义、判断框架、输出格式要求

## 新增 API 接口的流程
1. `backend/src/controllers/` 对应 controller 加方法（用 catchAsync 包装）
2. `backend/src/routes/` 对应路由文件注册
3. `api/backend-service.js` 加前端请求方法

## 产品红线
- 不做 PUA 工具，不鼓励操控/打压/欺骗
- AI 角色是冷静克制的关系判断助手，不是陪聊机器人
- 先判断再建议，给具体动作不给空话
