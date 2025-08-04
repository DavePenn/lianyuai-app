# 开发问题记录日志

> 记录开发过程中遇到的问题及解决方案，供AI参考和快速定位

## 问题索引

- [#001 前端API路径错误](#001-前端api路径错误)
- [#002 浏览器缓存导致API路径错误](#002-浏览器缓存导致api路径错误)

---

## #001 前端API路径错误

**时间**: 2025-08-04  
**状态**: ✅ 已解决  

### 问题描述
前端调用 `/api/auth/login` 返回 "Route not found"，实际后端路由为 `/api/users/login`

### 根本原因
前后端API路径不匹配
- 前端: `/api/auth/*`
- 后端: `/api/users/*`

### 解决方案
修改 `api/backend-service.js`:
```javascript
// 修改前
login: '/api/auth/login'
register: '/api/auth/register'
profile: '/api/auth/profile'

// 修改后
login: '/api/users/login'
register: '/api/users/register'
profile: '/api/users/profile'
```

### 关键文件
- `api/backend-service.js` - 前端API配置
- `backend/src/routes/userRoutes.js` - 后端路由定义
- `backend/src/index.js` - 路由挂载点

### 预防措施
- API文档标准化
- 前后端路径配置集中管理
- 自动化测试覆盖API端点

---

## #002 浏览器缓存导致API路径错误

**时间**: 2025-08-04  
**状态**: ✅ 已解决  

### 问题描述
前端仍然调用 `/api/auth/login` 返回 "Route not found"，但代码已修复为 `/api/users/login`

### 根本原因
浏览器缓存了旧版本的JavaScript文件，导致修复后的代码没有生效

### 解决方案
1. 强制刷新浏览器缓存 (Ctrl+F5 或 Cmd+Shift+R)
2. 在URL后添加版本参数避免缓存
3. 设置HTTP头禁用缓存
4. 重新同步backend-service.js文件到远程服务器
5. 重启前端服务并使用 `-c-1` 参数禁用服务器缓存

### 关键文件
- `api/backend-service.js` - 前端API配置文件
- 浏览器缓存机制

### 预防措施
- 在开发环境禁用缓存 (`http-server -c-1`)
- 使用版本号或时间戳作为文件查询参数
- 配置适当的HTTP缓存头
- 确保文件同步后重启服务
- 定期验证远程服务器文件版本

---

## 问题记录模板

```markdown
## #XXX 问题标题

**时间**: YYYY-MM-DD  
**状态**: 🔍 待解决 / ✅ 已解决  

### 问题描述
简要描述问题现象

### 根本原因
问题的技术原因

### 解决方案
具体的修复步骤或代码变更

### 关键文件
涉及的重要文件列表

### 预防措施
避免类似问题的建议
```

---

**更新时间**: 2025-08-04 23:30  
**维护者**: 开发团队