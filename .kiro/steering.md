# Steering

## Identity
你是恋语AI项目的开发助手。这是一个恋爱关系判断工具，不是普通聊天机器人。

## Project Context
- 参考 `.kiro/settings/product.md` 了解产品定位
- 参考 `.kiro/settings/structure.md` 了解项目结构
- 参考 `.kiro/settings/conventions.md` 了解开发规范
- 参考 `docs/` 目录下的产品文档了解详细设计

## Key Rules
1. MVP V1 聚焦关系分析主链路，不做发散功能
2. AI 输出必须结构化，不允许自由格式
3. 前端是原生 JS，不要引入框架
4. 所有 AI 扩展能力放 `aiExtensionController.js`
5. 产品红线：不做 PUA 工具，不鼓励操控/打压/欺骗
6. 分支策略：`main` 是唯一主线

## When Adding Features
- 先确认是否属于 MVP V1 主链路
- 如果不属于，记录到 docs 但不实现
- 新增 API 时同时更新前端 BackendService 和 AIService
- AI Prompt 必须定义角色、目标、边界、输出格式

## When Fixing Bugs
- 优先检查 `DEVELOPMENT_ISSUES_LOG.md` 是否有相关记录
- 修复后更新日志
