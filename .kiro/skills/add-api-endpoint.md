# Skill: 新增后端 API 接口

## Description
在 Express 后端新增一个 REST API 接口。

## Steps

### 1. 确定接口设计
- 路由路径和 HTTP 方法
- 请求体/查询参数结构
- 响应格式（遵循 `{ status, data }` 或 `{ success, message }` 风格）

### 2. 创建或更新 Controller
- 在 `backend/src/controllers/` 中对应的 controller 添加方法
- 用 `catchAsync` 包装异步处理
- 错误用 `AppError` 抛出

### 3. 如需数据库操作
- 在 `backend/src/models/` 中添加或更新 model 方法
- 通过 `queryDatabase.js` 执行 SQL
- 如需新表，在 `backend/src/config/init.sql` 中添加建表语句

### 4. 注册路由
- 在 `backend/src/routes/` 中对应的路由文件注册
- 确定是否需要认证中间件（`authMiddleware` / `optionalUserIdentifier`）

### 5. 前端对接
- 在 `api/backend-service.js` 添加请求方法

## Checklist
- [ ] 响应格式符合项目约定
- [ ] 错误处理完整
- [ ] 需要认证的接口已加中间件
- [ ] 前端 BackendService 已更新
