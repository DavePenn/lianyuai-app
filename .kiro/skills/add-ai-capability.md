# Skill: 新增 AI 扩展能力

## Description
在后端新增一个 AI 扩展能力接口（如关系分析、情感分析等）。

## Steps

### 1. 定义接口协议
- 确定请求体结构（输入字段）
- 确定响应体结构（必须是固定 JSON 格式）
- 确定路由路径（`/api/ai/<能力名>`）

### 2. 后端实现
- 在 `backend/src/controllers/aiExtensionController.js` 新增控制器方法
- 编写专用 Prompt（必须包含：角色定义、判断框架、输出格式要求）
- 调用 `aiService.js` 的模型调用能力
- 解析模型返回的 JSON，做 fallback 处理

### 3. 注册路由
- 在 `backend/src/routes/aiRoutes.js` 新增路由
- 从 `aiExtensionController` 导入新方法
- 决定是否需要认证中间件

### 4. 前端对接
- 在 `api/backend-service.js` 新增请求方法
- 在 `api/ai-service.js` 新增业务封装方法
- 在 `js/app.js` 中调用并渲染结果

### 5. 验证
- 准备 2-3 个典型测试输入
- 验证输出结构是否稳定
- 验证 fallback 是否正常工作

## Checklist
- [ ] Prompt 包含角色、目标、边界、输出格式
- [ ] 输出是固定结构 JSON，不是自由文本
- [ ] 有 fallback 处理（模型失败时返回可渲染结构）
- [ ] 路由已注册
- [ ] 前端 BackendService + AIService 都已更新
