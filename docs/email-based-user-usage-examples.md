# 基于邮箱的用户标识符系统使用示例

## 快速开始

### 1. 基本用户操作

#### 获取用户资料
```bash
# 方式1：通过URL路径参数
curl -X GET "http://152.32.218.174:3000/api/email-users/email/daiyiping821@gmail.com/profile"

# 方式2：通过请求头
curl -X GET "http://152.32.218.174:3000/api/email-users/email/any/profile" \
  -H "X-User-Email: daiyiping821@gmail.com"

# 方式3：通过查询参数
curl -X GET "http://152.32.218.174:3000/api/email-users/email/any/profile?email=daiyiping821@gmail.com"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "username": "LianYu",
      "email": "daiyiping821@gmail.com",
      "name": null,
      "avatar": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "identifier_info": {
      "identifier": "daiyiping821@gmail.com",
      "type": "email",
      "source": "path_params"
    }
  }
}
```

#### 更新用户资料
```bash
curl -X PUT "http://152.32.218.174:3000/api/email-users/email/daiyiping821@gmail.com/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "username": "NewUsername",
    "bio": "Updated bio information",
    "city": "Beijing"
  }'
```

### 2. 会话管理

#### 获取用户所有会话
```bash
curl -X GET "http://152.32.218.174:3000/api/email-users/email/daiyiping821@gmail.com/sessions?limit=10&offset=0"
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 1,
        "user_id": 5,
        "title": "AI助手对话",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T11:45:00Z"
      }
    ],
    "total": 1,
    "user_email": "daiyiping821@gmail.com",
    "pagination": {
      "limit": 10,
      "offset": 0
    }
  }
}
```

#### 创建新会话
```bash
# 方式1：通过邮箱路径
curl -X POST "http://152.32.218.174:3000/api/email-users/email/daiyiping821@gmail.com/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "新的AI对话"
  }'

# 方式2：通过现有接口（向后兼容）
curl -X POST "http://152.32.218.174:3000/api/sessions" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "daiyiping821@gmail.com",
    "title": "新的AI对话"
  }'
```

### 3. 消息管理

#### 获取用户消息
```bash
# 获取特定会话的消息
curl -X GET "http://152.32.218.174:3000/api/email-users/email/daiyiping821@gmail.com/messages?session_id=1&limit=20"

# 获取用户所有消息
curl -X GET "http://152.32.218.174:3000/api/email-users/email/daiyiping821@gmail.com/messages?limit=50&offset=0"
```

#### 发送消息
```bash
curl -X POST "http://152.32.218.174:3000/api/email-users/email/daiyiping821@gmail.com/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "session_id": 1,
    "role": "user",
    "content": "你好，AI助手！",
    "model": "gpt-3.5-turbo"
  }'
```

### 4. AI聊天集成

#### 发送AI消息（新方式）
```bash
curl -X POST "http://152.32.218.174:3000/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "daiyiping821@gmail.com",
    "message": "请帮我写一个Python函数",
    "session_id": 1,
    "model": "gpt-3.5-turbo"
  }'
```

## 工具和验证接口

### 1. 邮箱验证
```bash
# 检查邮箱是否存在
curl -X POST "http://152.32.218.174:3000/api/email-users/email/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "daiyiping821@gmail.com"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "exists": true,
    "email": "daiyiping821@gmail.com",
    "user_id": 5,
    "username": "LianYu"
  }
}
```

### 2. 批量获取用户资料
```bash
curl -X POST "http://152.32.218.174:3000/api/email-users/email/batch/profiles" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      "daiyiping821@gmail.com",
      "demo@example.com",
      "test@example.com"
    ]
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 5,
        "username": "LianYu",
        "email": "daiyiping821@gmail.com",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "errors": [
      {
        "email": "demo@example.com",
        "error": "用户不存在"
      },
      {
        "email": "test@example.com",
        "error": "用户不存在"
      }
    ],
    "total": 1,
    "requested": 3
  }
}
```

### 3. 邮箱搜索
```bash
# 搜索包含特定域名的用户
curl -X GET "http://152.32.218.174:3000/api/email-users/email/search?q=gmail.com&limit=5"

# 搜索特定邮箱前缀
curl -X GET "http://152.32.218.174:3000/api/email-users/email/search?q=daiyiping&limit=10"
```

## 前端集成示例

### JavaScript/Fetch API

```javascript
// 用户服务类
class EmailBasedUserService {
    constructor(baseUrl = 'http://152.32.218.174:3000') {
        this.baseUrl = baseUrl;
    }

    // 获取用户资料
    async getUserProfile(email) {
        const response = await fetch(`${this.baseUrl}/api/email-users/email/${encodeURIComponent(email)}/profile`);
        return await response.json();
    }

    // 更新用户资料
    async updateUserProfile(email, profileData, token) {
        const response = await fetch(`${this.baseUrl}/api/email-users/email/${encodeURIComponent(email)}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        return await response.json();
    }

    // 获取用户会话
    async getUserSessions(email, options = {}) {
        const { limit = 20, offset = 0, includeMessages = false } = options;
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            include_messages: includeMessages.toString()
        });
        
        const response = await fetch(`${this.baseUrl}/api/email-users/email/${encodeURIComponent(email)}/sessions?${params}`);
        return await response.json();
    }

    // 创建新会话
    async createSession(email, title, token) {
        const response = await fetch(`${this.baseUrl}/api/email-users/email/${encodeURIComponent(email)}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title })
        });
        return await response.json();
    }

    // 发送消息
    async sendMessage(email, messageData, token) {
        const response = await fetch(`${this.baseUrl}/api/email-users/email/${encodeURIComponent(email)}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(messageData)
        });
        return await response.json();
    }

    // AI聊天
    async sendAIMessage(email, message, sessionId) {
        const response = await fetch(`${this.baseUrl}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_email: email,
                message,
                session_id: sessionId
            })
        });
        return await response.json();
    }

    // 验证邮箱
    async validateEmail(email) {
        const response = await fetch(`${this.baseUrl}/api/email-users/email/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        return await response.json();
    }
}

// 使用示例
const userService = new EmailBasedUserService();

// 获取用户资料
userService.getUserProfile('daiyiping821@gmail.com')
    .then(result => {
        if (result.success) {
            console.log('用户资料:', result.data.user);
        } else {
            console.error('获取失败:', result.error);
        }
    });

// 创建新会话
userService.createSession('daiyiping821@gmail.com', '新对话', 'your_jwt_token')
    .then(result => {
        if (result.success) {
            console.log('会话创建成功:', result.data.session);
        }
    });

// 发送AI消息
userService.sendAIMessage('daiyiping821@gmail.com', '你好AI', 1)
    .then(result => {
        if (result.status === 'success') {
            console.log('AI回复:', result.content);
        }
    });
```

### React Hook示例

```javascript
import { useState, useEffect } from 'react';

// 自定义Hook：基于邮箱的用户管理
function useEmailBasedUser(email) {
    const [user, setUser] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const userService = new EmailBasedUserService();

    // 加载用户资料
    const loadUserProfile = async () => {
        if (!email) return;
        
        setLoading(true);
        try {
            const result = await userService.getUserProfile(email);
            if (result.success) {
                setUser(result.data.user);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 加载用户会话
    const loadUserSessions = async () => {
        if (!email) return;
        
        try {
            const result = await userService.getUserSessions(email);
            if (result.success) {
                setSessions(result.data.sessions);
            }
        } catch (err) {
            console.error('加载会话失败:', err);
        }
    };

    // 创建新会话
    const createNewSession = async (title, token) => {
        try {
            const result = await userService.createSession(email, title, token);
            if (result.success) {
                setSessions(prev => [result.data.session, ...prev]);
                return result.data.session;
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadUserProfile();
        loadUserSessions();
    }, [email]);

    return {
        user,
        sessions,
        loading,
        error,
        loadUserProfile,
        loadUserSessions,
        createNewSession
    };
}

// 使用示例组件
function UserDashboard({ userEmail }) {
    const { user, sessions, loading, error, createNewSession } = useEmailBasedUser(userEmail);

    if (loading) return <div>加载中...</div>;
    if (error) return <div>错误: {error}</div>;
    if (!user) return <div>用户不存在</div>;

    return (
        <div>
            <h1>用户仪表板</h1>
            <div>
                <h2>用户信息</h2>
                <p>邮箱: {user.email}</p>
                <p>用户名: {user.username}</p>
                <p>注册时间: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            
            <div>
                <h2>会话列表</h2>
                <button onClick={() => createNewSession('新对话', localStorage.getItem('token'))}>
                    创建新会话
                </button>
                <ul>
                    {sessions.map(session => (
                        <li key={session.id}>
                            {session.title} - {new Date(session.created_at).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
```

## 向后兼容性示例

### 现有代码无需修改

```javascript
// 这些现有的API调用仍然有效

// 1. JWT Token认证方式
fetch('/api/users/profile', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});

// 2. 用户ID方式
fetch('/api/users/123/profile');

// 3. 会话创建（旧方式）
fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        user_id: 123,
        title: '新对话'
    })
});
```

### 渐进式迁移

```javascript
// 第一步：在现有代码中添加邮箱支持
function createSession(userIdentifier, title, token) {
    const payload = {};
    
    // 检测标识符类型
    if (userIdentifier.includes('@')) {
        payload.user_email = userIdentifier;
    } else {
        payload.user_id = userIdentifier;
    }
    
    payload.title = title;
    
    return fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
}

// 第二步：逐步迁移到新的邮箱接口
function createSessionNew(email, title, token) {
    return fetch(`/api/email-users/email/${encodeURIComponent(email)}/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
    });
}
```

## 错误处理最佳实践

```javascript
class EmailBasedUserService {
    async handleApiCall(apiCall) {
        try {
            const response = await apiCall();
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error?.message || '请求失败');
            }
            
            return result;
        } catch (error) {
            console.error('API调用失败:', error);
            throw error;
        }
    }

    async getUserProfileSafe(email) {
        return this.handleApiCall(async () => {
            return fetch(`${this.baseUrl}/api/email-users/email/${encodeURIComponent(email)}/profile`);
        });
    }
}

// 使用示例
const userService = new EmailBasedUserService();

userService.getUserProfileSafe('daiyiping821@gmail.com')
    .then(result => {
        console.log('用户资料:', result.data.user);
    })
    .catch(error => {
        console.error('获取用户资料失败:', error.message);
        // 处理错误，如显示错误提示
    });
```

## 性能优化建议

### 1. 缓存用户信息

```javascript
class CachedEmailUserService extends EmailBasedUserService {
    constructor(baseUrl) {
        super(baseUrl);
        this.userCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
    }

    async getUserProfile(email) {
        const cacheKey = `user_${email}`;
        const cached = this.userCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        const result = await super.getUserProfile(email);
        
        if (result.success) {
            this.userCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
        }
        
        return result;
    }
}
```

### 2. 批量操作

```javascript
// 批量获取多个用户的会话
async function getBatchUserSessions(emails) {
    const promises = emails.map(email => 
        userService.getUserSessions(email, { limit: 10 })
    );
    
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => ({
        email: emails[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
    }));
}
```

这个基于邮箱的用户标识符系统提供了完整的API接口和前端集成方案，确保了系统的稳定性、可扩展性和用户友好性。