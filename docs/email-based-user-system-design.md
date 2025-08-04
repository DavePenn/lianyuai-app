# 基于邮箱的统一用户标识符系统设计

## 设计理念

### 为什么选择邮箱作为主要标识符？

1. **唯一性保证**：邮箱地址天然具有全球唯一性
2. **用户友好**：用户更容易记住自己的邮箱地址
3. **业务逻辑清晰**：避免了用户ID自增带来的不稳定性
4. **安全性更高**：邮箱可以用于身份验证和找回密码
5. **跨系统兼容**：便于与第三方系统集成

### 系统架构

```
邮箱标识符 (user@example.com)
    ↓
用户解析服务 (UserResolverService)
    ↓
用户数据 (users表中的完整信息)
    ↓
关联数据 (sessions, messages等)
```

## 核心组件

### 1. EmailBasedUserMiddleware

**功能**：统一处理邮箱标识符的解析和验证

**特性**：
- 优先从多个来源获取邮箱标识符
- 自动将其他标识符（ID、用户名）转换为邮箱
- 支持权限验证
- 向后兼容现有系统

**获取优先级**：
1. 路径参数中的邮箱 (`/api/users/email/:email`)
2. 请求头中的邮箱 (`X-User-Email`)
3. 查询参数中的邮箱 (`?email=user@example.com`)
4. 请求体中的邮箱 (`{"email": "user@example.com"}`)
5. JWT Token（转换为邮箱）
6. 用户ID（转换为邮箱）
7. 用户名（转换为邮箱）

### 2. EmailBasedUserRoutes

**路径格式**：`/api/email-users/email/:email/*`

**支持的操作**：
- 用户资料管理
- 会话管理
- 消息管理
- 邮箱验证
- 批量操作
- 搜索功能

### 3. 更新的控制器

**SessionController**：
- 优先接受 `user_email` 参数
- 向后兼容 `user_id` 参数

**AIController**：
- 支持通过 `user_email` 识别用户
- 自动关联AI对话到正确的用户

## API接口设计

### 基础用户操作

#### 获取用户资料
```bash
# 主要方式：通过邮箱
GET /api/email-users/email/user@example.com/profile

# 兼容方式：通过请求头
GET /api/email-users/email/any/profile
Headers:
  X-User-Email: user@example.com
```

#### 更新用户资料
```bash
PUT /api/email-users/email/user@example.com/profile
{
  "username": "new_username",
  "bio": "Updated bio"
}
```

### 会话管理

#### 获取用户会话
```bash
GET /api/email-users/email/user@example.com/sessions?limit=20&offset=0
```

#### 创建新会话
```bash
POST /api/email-users/email/user@example.com/sessions
{
  "title": "新对话"
}

# 或者通过请求体传递邮箱
POST /api/sessions
{
  "user_email": "user@example.com",
  "title": "新对话"
}
```

### 消息管理

#### 获取用户消息
```bash
GET /api/email-users/email/user@example.com/messages?session_id=123&limit=50
```

#### 发送消息
```bash
POST /api/email-users/email/user@example.com/messages
{
  "session_id": 123,
  "role": "user",
  "content": "Hello AI!"
}
```

### AI聊天

#### 发送AI消息
```bash
POST /api/ai/chat
{
  "user_email": "user@example.com",
  "message": "Hello AI!",
  "session_id": 123
}
```

### 工具接口

#### 邮箱验证
```bash
POST /api/email-users/email/validate
{
  "email": "user@example.com"
}

# 响应
{
  "success": true,
  "data": {
    "exists": true,
    "email": "user@example.com",
    "user_id": 5,
    "username": "john_doe"
  }
}
```

#### 批量获取用户
```bash
POST /api/email-users/email/batch/profiles
{
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

#### 邮箱搜索
```bash
GET /api/email-users/email/search?q=example.com&limit=10
```

## 数据库设计

### 现有表结构保持不变

```sql
-- 用户表（保持现有结构）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    email VARCHAR(255) UNIQUE,  -- 关键：邮箱唯一约束
    name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 会话表（继续使用user_id外键）
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 消息表（通过session_id间接关联用户）
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 数据写入策略

1. **用户识别**：所有API接口优先通过邮箱识别用户
2. **数据关联**：内部仍使用user_id作为外键，保持数据库结构稳定
3. **转换机制**：邮箱 → user_id → 关联数据

## 向后兼容性

### 现有接口保持可用

```bash
# 原有方式仍然支持
GET /api/users/123/profile
GET /api/sessions?user_id=123
POST /api/ai/chat
Headers:
  Authorization: Bearer <jwt_token>
```

### 渐进式迁移

1. **第一阶段**：新接口与旧接口并存
2. **第二阶段**：前端逐步迁移到邮箱标识符
3. **第三阶段**：旧接口标记为废弃
4. **第四阶段**：移除旧接口（可选）

## 安全考虑

### 权限验证

```javascript
// 中间件自动验证用户权限
emailBasedUserMiddleware({ 
    required: true, 
    validatePermission: true 
})
```

### 邮箱隐私保护

1. **路径参数**：仅在必要时暴露邮箱
2. **请求头**：敏感操作使用请求头传递邮箱
3. **响应过滤**：返回数据时可选择性隐藏邮箱

### 防止邮箱枚举

```javascript
// 统一的错误响应，避免泄露用户存在性
if (!user) {
    return next(new AppError('用户不存在或无权限访问', 404));
}
```

## 性能优化

### 缓存策略

1. **邮箱→用户ID映射缓存**
2. **用户基本信息缓存**
3. **会话列表缓存**

### 数据库优化

1. **邮箱字段索引**：确保快速查询
2. **复合索引**：(email, status) 等常用查询组合
3. **查询优化**：减少不必要的JOIN操作

## 错误处理

### 标准错误响应

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "邮箱用户不存在",
    "details": {
      "email": "user@example.com",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 常见错误类型

- `INVALID_EMAIL_FORMAT`：邮箱格式无效
- `USER_NOT_FOUND`：用户不存在
- `PERMISSION_DENIED`：权限不足
- `EMAIL_REQUIRED`：缺少邮箱参数

## 监控和日志

### 关键指标

1. **邮箱解析成功率**
2. **API响应时间**
3. **错误率统计**
4. **用户活跃度**

### 日志记录

```javascript
// 记录用户操作日志
console.log(`[${new Date().toISOString()}] User operation: ${user.email} - ${operation}`);
```

## 部署和配置

### 环境变量

```bash
# .env 文件
EMAIL_BASED_USER_ENABLED=true
EMAIL_CACHE_TTL=3600
EMAIL_VALIDATION_STRICT=false
```

### 功能开关

```javascript
// 可配置的功能开关
const config = {
    emailBasedUserEnabled: process.env.EMAIL_BASED_USER_ENABLED === 'true',
    strictEmailValidation: process.env.EMAIL_VALIDATION_STRICT === 'true'
};
```

## 测试策略

### 单元测试

- 邮箱格式验证
- 用户解析逻辑
- 权限验证机制

### 集成测试

- 完整API流程测试
- 向后兼容性测试
- 性能压力测试

### 用户验收测试

- 前端集成测试
- 用户体验测试
- 边界情况测试

## 总结

基于邮箱的统一用户标识符系统提供了：

1. **更稳定的用户标识**：邮箱作为天然唯一标识符
2. **更好的用户体验**：用户更容易记住和使用邮箱
3. **更强的系统扩展性**：便于与外部系统集成
4. **更高的安全性**：支持邮箱验证和权限控制
5. **完整的向后兼容**：现有功能不受影响

这个系统设计确保了在提供新功能的同时，保持了系统的稳定性和可维护性。