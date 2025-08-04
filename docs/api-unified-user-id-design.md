# API统一用户ID参数设计方案

## 当前状况分析

### 现有用户识别方式
1. **JWT Token认证** - 通过Authorization header传递，在authMiddleware中解析获取用户ID
2. **邮箱参数** - 部分接口支持通过邮箱参数查询用户信息
3. **会话关联** - 通过session_id间接关联到用户

### 数据库关联结构
```sql
users (id, username, email, ...)
  ↓ (user_id)
sessions (id, user_id, title, ...)
  ↓ (session_id)
messages (id, session_id, role, content, ...)
```

## 设计目标

实现所有API接口都能通过唯一ID关联用户的所有信息，包括：
- 用户基本信息
- 用户的所有会话
- 用户的所有消息历史
- 用户的配置和偏好

## 设计方案

### 1. 统一用户标识符支持

支持多种用户标识符：
- `user_id` - 数据库主键ID
- `email` - 用户邮箱
- `username` - 用户名
- `google_id` - Google OAuth ID

### 2. 中间件增强

创建新的中间件 `userIdentifierMiddleware.js`：
```javascript
// 支持多种用户标识方式
// 1. Authorization header (JWT token)
// 2. 请求参数中的 user_id, email, username
// 3. 请求体中的用户标识符
```

### 3. API接口改造

#### 3.1 路由参数支持
```javascript
// 支持多种标识符的路由
GET /api/users/:identifier/profile
GET /api/users/:identifier/sessions
GET /api/users/:identifier/messages
POST /api/users/:identifier/sessions
```

#### 3.2 查询参数支持
```javascript
// 在现有接口中添加用户标识符参数
GET /api/sessions?user_id=123
GET /api/sessions?email=user@example.com
GET /api/messages?user_id=123&session_id=456
```

#### 3.3 请求体参数支持
```javascript
// POST/PUT请求体中包含用户标识符
{
  "user_id": 123,
  "message": "Hello",
  "session_id": 456
}
```

### 4. 用户解析服务

创建 `userResolverService.js`：
```javascript
class UserResolverService {
  // 根据任意标识符解析用户
  async resolveUser(identifier, type = 'auto')
  
  // 获取用户完整信息
  async getUserFullProfile(userId)
  
  // 获取用户所有会话
  async getUserSessions(userId)
  
  // 获取用户所有消息
  async getUserMessages(userId, filters = {})
}
```

### 5. 接口改造清单

#### 5.1 用户相关接口
- [x] `GET /api/auth/profile/:email` - 已支持邮箱查询
- [ ] `GET /api/users/:identifier/profile` - 新增统一用户查询
- [ ] `PUT /api/users/:identifier/profile` - 支持通过标识符更新

#### 5.2 会话相关接口
- [ ] `GET /api/users/:identifier/sessions` - 获取指定用户的所有会话
- [ ] `POST /api/users/:identifier/sessions` - 为指定用户创建会话
- [ ] `GET /api/sessions?user_id=:id` - 查询参数支持

#### 5.3 消息相关接口
- [ ] `GET /api/users/:identifier/messages` - 获取用户所有消息
- [ ] `GET /api/messages?user_id=:id` - 支持用户ID过滤
- [ ] `POST /api/messages` - 请求体支持用户标识符

#### 5.4 AI聊天接口
- [ ] `POST /api/ai/chat` - 支持用户标识符参数
- [ ] `GET /api/ai/config?user_id=:id` - 支持用户个性化配置

## 实施步骤

### 第一阶段：基础设施
1. 创建用户解析服务
2. 创建统一用户标识符中间件
3. 更新数据库查询方法

### 第二阶段：核心接口改造
1. 用户信息相关接口
2. 会话管理接口
3. 消息查询接口

### 第三阶段：高级功能
1. AI聊天接口增强
2. 统计和分析接口
3. 批量操作接口

### 第四阶段：前端适配
1. 更新前端API调用
2. 支持多种用户标识符输入
3. 优化用户体验

## 兼容性考虑

1. **向后兼容** - 保持现有接口不变，新增功能作为扩展
2. **渐进式迁移** - 逐步迁移现有功能到新的统一接口
3. **错误处理** - 提供清晰的错误信息和用户标识符验证

## 安全考虑

1. **权限验证** - 确保用户只能访问自己的数据
2. **标识符验证** - 验证用户标识符的有效性和权限
3. **敏感信息保护** - 在响应中排除敏感字段

## 性能优化

1. **缓存机制** - 缓存用户解析结果
2. **数据库索引** - 为常用查询字段添加索引
3. **分页支持** - 大数据量查询支持分页

## 测试策略

1. **单元测试** - 用户解析服务和中间件
2. **集成测试** - API接口功能测试
3. **性能测试** - 大数据量场景测试
4. **安全测试** - 权限和数据安全测试