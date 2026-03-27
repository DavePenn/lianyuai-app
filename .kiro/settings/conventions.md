# 恋语AI - 开发规范

## 代码风格
- JavaScript ES6+，使用 ESLint Standard Style
- 前端无框架，原生 DOM 操作
- 后端 Express，controller -> service -> model 分层
- 异步统一用 async/await，错误用 catchAsync 包装

## 命名约定
- 文件名: kebab-case（如 `ai-service.js`）
- 变量/函数: camelCase
- 类名: PascalCase
- 常量: UPPER_SNAKE_CASE
- API 路由: kebab-case（如 `/api/ai/relationship-analysis`）

## API 响应格式
```json
{
  "status": "success",
  "data": { ... }
}
```
错误响应：
```json
{
  "success": false,
  "message": "错误描述"
}
```

## AI 服务约定
- 当前默认 provider: qwen-plus (阿里云 DashScope)
- AI 扩展能力统一放 `aiExtensionController.js`
- AI 输出必须结构化（JSON），不允许自由格式
- Prompt 必须明确角色、目标、边界、输出格式
- AI 角色定位：冷静克制的关系判断助手，不是陪聊机器人

## 关系分析输出结构（核心）
每次关系分析必须返回以下固定字段：
- `stage` — 当前关系阶段（含 label + reason）
- `summary` — 2-4 句局势摘要
- `positiveSignals` — 2-3 条兴趣信号
- `riskSignals` — 2-3 条风险信号
- `initiativeBalance` — 主动度对比（含 label + reason）
- `pushWindow` — 推进窗口（含 label + reason）
- `nextBestAction` — 下一步建议（含 label + reason + tip）
- `avoidActions` — 1-3 条不建议做的事
- `suggestedReplies` — 3 条话术（含 style + content + reason）

## 前端服务层
- `BackendService` — 负责 HTTP 请求
- `AIService` — 负责 AI 业务逻辑封装
- 新增 AI 能力时，两层都需要加对应方法

## 数据库
- 支持 MySQL 和 PostgreSQL
- 通过 `dbManager.js` 统一管理连接
- SQL 初始化脚本在 `backend/src/config/init.sql`

## 部署
- 后端部署在 152.32.218.174
- 前端可独立部署或与后端同服务器
- 使用 `scripts/deploy-standard.sh` 标准部署
- 环境变量通过 `.env.development` / `.env.production` 管理

## 安全
- 不在代码中硬编码 API Key
- 敏感配置走环境变量
- CORS 生产环境限制具体域名
