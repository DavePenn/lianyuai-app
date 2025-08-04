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
用户登录时出现API路径不一致错误，前端调用 `/api/auth/login` 但后端只有 `/api/users/login` 路径。

### 根本原因
1. **配置文件不一致**: `api/config.js` 中配置的登录路径为 `/api/auth/login`，与后端实际路径不匹配
2. **后端路由重复**: `backend/src/index.js` 中存在重复的 `/api/auth` 路由定义
3. **浏览器缓存问题**: `backend-service.js` 文件缺少缓存破坏机制，导致浏览器使用旧版本文件

### 解决方案
1. **修复配置文件**: 更新 `api/config.js` 中的登录路径为 `/api/users/login`
2. **清理后端路由**: 删除 `backend/src/index.js` 中重复的 `/api/auth` 路由
3. **添加缓存破坏**: 为 `backend-service.js` 在 `index.html` 中添加时间戳缓存破坏机制
4. **同步所有文件**: 确保本地、远程服务器、GitHub三处代码一致
5. **重启服务**: 重启前端和后端服务使修改生效

### 关键文件
- `api/backend-service.js` - 前端API配置文件
- 浏览器缓存机制

### 预防措施
- **确保所有配置文件中的API路径保持一致**
- **后端路由注册时避免重复路径，统一使用一套API路径**
- 在开发环境禁用缓存 (`http-server -c-1`)
- 使用版本号或时间戳作为文件查询参数
- 配置适当的HTTP缓存头
- 确保文件同步后重启服务
- 定期验证远程服务器文件版本
- **定期检查 `api/config.js` 和后端路由配置的一致性**
- **为所有关键JavaScript文件添加时间戳缓存破坏机制**
- **确保本地、远程服务器、GitHub三处代码同步**

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

## 问题记录

### 2025-01-XX - 测试账户登录问题修复

**问题描述：**
用户反馈登录仍有问题，测试账号没有变更，出现2个错误：
1. 前端显示 "Route /api/auth/login not found" 错误
2. 测试账户 daiyiping821@gmail.com / daiyiping123 登录失败

**根本原因：**
1. 浏览器缓存问题：虽然代码已修复，但浏览器仍使用缓存的旧版本
2. 测试账户密码哈希不匹配：数据库中的密码哈希与新密码 'daiyiping123' 不匹配
3. 前端服务未正确重启

**解决方案：**
1. 强制重启前端服务以清除缓存
2. 创建MySQL专用的测试账户脚本 `create-mysql-test-accounts.js`
3. 更新数据库中测试账户的密码哈希
4. 验证登录功能正常工作

**技术细节：**
- 创建了适用于MySQL的测试账户管理脚本
- 使用bcrypt正确加密密码：`$2b$10$...`
- 数据库字段：`password_hash` 而非 `password`
- 测试账户信息：用户名 'LianYu'，邮箱 'daiyiping821@gmail.com'，密码 'daiyiping123'

**预防措施：**
1. 为所有JavaScript文件添加缓存破坏机制
2. 确保本地、远程服务器、GitHub三处代码同步
3. 建立测试账户管理的标准流程
4. 部署前进行完整的功能测试
5. 建立标准的部署流程和检查清单

---

**更新时间**: 2025-08-04 23:30  
**维护者**: 开发团队