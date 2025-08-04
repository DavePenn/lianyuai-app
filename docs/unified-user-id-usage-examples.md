# 统一用户ID参数使用示例

本文档展示了如何使用新实现的统一用户ID参数系统，该系统允许所有API接口通过多种方式识别用户身份。

## 支持的用户标识符类型

1. **用户ID** - 数字ID（如：123）
2. **邮箱地址** - 电子邮件（如：user@example.com）
3. **用户名** - 用户名（如：john_doe）
4. **Google ID** - Google OAuth ID
5. **JWT Token** - 传统的认证令牌

## API端点示例

### 1. 统一用户路由 (`/api/users`)

#### 获取用户资料
```bash
# 通过用户ID
GET /api/users/123/profile

# 通过邮箱
GET /api/users/user@example.com/profile

# 通过用户名
GET /api/users/john_doe/profile
```

#### 获取用户会话
```bash
# 通过用户ID
GET /api/users/123/sessions

# 通过邮箱
GET /api/users/user@example.com/sessions

# 创建新会话
POST /api/users/123/sessions
{
  "title": "新的聊天会话"
}
```

#### 获取用户消息
```bash
# 获取用户所有消息
GET /api/users/123/messages

# 发送消息到特定会话
POST /api/users/123/messages
{
  "session_id": "session_123",
  "content": "Hello, AI!",
  "role": "user"
}
```

#### 获取用户统计信息
```bash
GET /api/users/123/stats
```

### 2. 会话路由 (`/api/sessions`) - 支持用户ID参数

#### 创建会话时指定用户ID
```bash
POST /api/sessions
{
  "title": "新会话",
  "user_id": 123  # 可选，支持用户ID参数
}
```

#### 获取会话时使用用户ID查询
```bash
GET /api/sessions?user_id=123
```

#### 发送消息时验证用户权限
```bash
POST /api/sessions/session_123/messages
{
  "content": "Hello",
  "user_id": 123  # 可选，用于验证会话所有权
}
```

### 3. AI聊天路由 (`/api/ai`) - 支持用户标识符

#### 通用AI聊天（支持用户标识符）
```bash
POST /api/ai/chat
Headers:
  Authorization: Bearer <token>  # 或
  X-User-ID: 123               # 或
  X-User-Email: user@example.com
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}
```

#### 会话AI聊天
```bash
POST /api/ai/chat/session_123
{
  "message": "Hello, AI!"
}
```

### 4. 用户管理路由 (`/api/auth`) - 增强支持

#### 获取用户资料（支持多种身份验证）
```bash
GET /api/auth/profile
Headers:
  Authorization: Bearer <token>  # 传统方式
  # 或
  X-User-ID: 123               # 新的用户ID方式
  # 或
  X-User-Email: user@example.com # 邮箱方式
```

## 请求参数支持

### 1. Header参数
```bash
X-User-ID: 123
X-User-Email: user@example.com
X-User-Name: john_doe
Authorization: Bearer <jwt_token>
```

### 2. 查询参数
```bash
?user_id=123
?user_email=user@example.com
?user_name=john_doe
```

### 3. 请求体参数
```json
{
  "user_id": 123,
  "user_email": "user@example.com",
  "user_name": "john_doe"
}
```

### 4. URL路径参数
```bash
/api/users/{identifier}/profile
# identifier 可以是 ID、邮箱或用户名
```

## 批量操作示例

### 批量获取用户资料
```bash
POST /api/users/batch/profiles
{
  "identifiers": ["123", "user@example.com", "john_doe"]
}
```

### 用户搜索
```bash
GET /api/users/search?q=john&type=username
GET /api/users/search?q=example.com&type=email
```

### 验证用户标识符
```bash
POST /api/users/validate
{
  "identifier": "user@example.com",
  "type": "email"
}
```

## 响应格式

所有API响应都包含解析后的用户信息：

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 123,
      "username": "john_doe",
      "email": "user@example.com"
    },
    "resolvedBy": "email",  // 标识符解析方式
    "// ... 其他数据": ""
  }
}
```

## 错误处理

### 用户不存在
```json
{
  "status": "error",
  "message": "用户不存在",
  "code": 404
}
```

### 权限不足
```json
{
  "status": "error",
  "message": "权限不足",
  "code": 403
}
```

### 无效标识符
```json
{
  "status": "error",
  "message": "无效的用户标识符",
  "code": 400
}
```

## 兼容性说明

1. **向后兼容** - 所有现有的JWT token认证方式继续有效
2. **渐进式采用** - 可以逐步迁移到新的统一标识符系统
3. **多重验证** - 支持同时使用多种标识符进行验证
4. **安全性** - 保持原有的权限验证和安全机制

## 最佳实践

1. **优先级顺序**：JWT Token > 用户ID > 邮箱 > 用户名
2. **性能考虑**：用户ID查询最快，邮箱和用户名需要额外查询
3. **安全建议**：敏感操作建议使用JWT token认证
4. **错误处理**：始终检查API响应状态和错误信息

## 前端集成示例

### JavaScript/Fetch
```javascript
// 使用用户ID
fetch('/api/users/123/profile', {
  headers: {
    'X-User-ID': '123'
  }
})

// 使用邮箱
fetch('/api/users/user@example.com/sessions', {
  headers: {
    'X-User-Email': 'user@example.com'
  }
})

// 传统JWT方式（仍然支持）
fetch('/api/auth/profile', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

### Axios
```javascript
// 配置默认用户标识符
axios.defaults.headers.common['X-User-ID'] = '123';

// 或在请求中指定
axios.get('/api/users/123/stats', {
  headers: {
    'X-User-Email': 'user@example.com'
  }
});
```

这个统一的用户ID参数系统为所有API接口提供了灵活、一致的用户身份识别机制，大大简化了前端开发和API调用的复杂性。