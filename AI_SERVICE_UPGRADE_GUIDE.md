# AI服务升级指南

本文档介绍了AI服务的最新升级功能，包括代理支持、智能降级和服务监控。

## 🚀 新功能概览

### 1. 代理支持
- 支持HTTP、HTTPS、SOCKS4、SOCKS5代理
- 支持代理认证
- 解决Gemini API网络连接问题

### 2. 智能服务选择和降级
- 自动检测服务可用性
- 智能选择最佳可用服务
- 自动降级到备用服务
- 服务状态缓存和恢复机制

### 3. 服务状态监控
- 实时监控各AI服务状态
- 提供状态查询API
- 支持手动重置服务状态

## 📋 配置说明

### 代理配置

在 `.env` 文件中添加以下配置：

```bash
# 代理配置（用于访问国外API）
PROXY_ENABLED=true
PROXY_HOST=127.0.0.1
PROXY_PORT=7890
PROXY_PROTOCOL=http
PROXY_USERNAME=
PROXY_PASSWORD=
```

### AI服务配置

确保在 `.env` 文件中配置了所需的AI服务：

```bash
# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# Gemini 配置
GEMINI_API_KEY=your-gemini-api-key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com

# Claude 配置
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_BASE_URL=https://api.anthropic.com

# Qmax 配置
QMAX_API_KEY=your-qmax-api-key
QMAX_BASE_URL=your-qmax-base-url
```

## 🔄 智能降级机制

### 降级优先级

系统会根据以下优先级进行服务降级：

1. **Gemini** → Qmax → OpenAI → Claude
2. **OpenAI** → Qmax → Gemini → Claude
3. **Claude** → Qmax → Gemini → OpenAI
4. **Qmax** → Gemini → OpenAI → Claude

### 可用性检测

- **失败阈值**: 连续3次失败后标记为不可用
- **恢复检测**: 每5分钟重新检测不可用的服务
- **自动恢复**: 成功调用后自动恢复服务状态

## 📊 API接口

### 1. 聊天接口（已升级）

```http
POST /api/ai/chat/:sessionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "你好",
  "provider": "gemini"
}
```

**功能增强**：
- 自动选择最佳可用服务
- 失败时自动降级到备用服务
- 透明的代理支持

### 2. 服务状态查询（新增）

```http
GET /api/ai/status
Authorization: Bearer <token>
```

**响应示例**：
```json
{
  "status": "success",
  "data": {
    "services": {
      "gemini": {
        "available": false,
        "configured": true,
        "failCount": 3,
        "lastCheck": 1703123456789,
        "lastCheckTime": "2023-12-21T10:30:56.789Z"
      },
      "qmax": {
        "available": true,
        "configured": true,
        "failCount": 0,
        "lastCheck": 1703123456789,
        "lastCheckTime": "2023-12-21T10:30:56.789Z"
      },
      "openai": {
        "available": true,
        "configured": false,
        "failCount": 0,
        "lastCheck": 0,
        "lastCheckTime": null
      },
      "claude": {
        "available": true,
        "configured": false,
        "failCount": 0,
        "lastCheck": 0,
        "lastCheckTime": null
      }
    },
    "timestamp": "2023-12-21T10:30:56.789Z"
  }
}
```

### 3. 重置服务状态（新增）

```http
POST /api/ai/status/reset/:provider
Authorization: Bearer <token>
```

**参数**：
- `provider`: 服务提供商名称（gemini, openai, claude, qmax）或 `all`

**示例**：
```http
# 重置Gemini服务状态
POST /api/ai/status/reset/gemini

# 重置所有服务状态
POST /api/ai/status/reset/all
```

## 🛠️ 使用场景

### 场景1：Gemini API网络问题

1. **问题**: 服务器无法访问Gemini API
2. **解决**: 配置代理或自动降级到Qmax
3. **结果**: 用户无感知的服务切换

### 场景2：服务临时不可用

1. **检测**: 系统自动检测服务失败
2. **降级**: 自动切换到备用服务
3. **恢复**: 服务恢复后自动重新启用

### 场景3：多服务负载均衡

1. **配置**: 配置多个AI服务
2. **智能选择**: 系统根据可用性选择最佳服务
3. **故障转移**: 主服务故障时无缝切换

## 🔧 故障排除

### 代理问题

1. **检查代理配置**：
   ```bash
   # 测试代理连接
   curl --proxy http://127.0.0.1:7890 https://www.google.com
   ```

2. **查看日志**：
   ```bash
   # 查看服务器日志
   tail -f backend/logs/app.log
   ```

### 服务状态问题

1. **查询服务状态**：
   ```bash
   curl -H "Authorization: Bearer <token>" \
        http://localhost:3000/api/ai/status
   ```

2. **重置服务状态**：
   ```bash
   curl -X POST -H "Authorization: Bearer <token>" \
        http://localhost:3000/api/ai/status/reset/all
   ```

### 常见错误

1. **"All AI services are unavailable"**
   - 检查网络连接
   - 验证API密钥
   - 检查代理配置

2. **代理连接失败**
   - 确认代理服务器运行状态
   - 检查代理地址和端口
   - 验证代理认证信息

## 📈 监控和维护

### 日志监控

系统会记录以下关键信息：
- 服务切换事件
- 代理使用状态
- 服务失败和恢复
- 性能指标

### 定期维护

1. **检查服务状态**：定期查询 `/api/ai/status`
2. **更新API密钥**：及时更新过期的API密钥
3. **代理维护**：确保代理服务稳定运行
4. **日志清理**：定期清理过期日志文件

## 🎯 最佳实践

1. **多服务配置**：配置多个AI服务提供商以提高可用性
2. **代理备份**：配置多个代理服务器以防单点故障
3. **监控告警**：设置服务状态监控和告警机制
4. **定期测试**：定期测试各服务的可用性
5. **文档更新**：及时更新配置文档和操作手册

## 🔄 升级步骤

1. **安装依赖**：
   ```bash
   cd backend
   npm install
   ```

2. **更新配置**：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，添加代理和AI服务配置
   ```

3. **重启服务**：
   ```bash
   npm start
   ```

4. **验证功能**：
   ```bash
   # 测试聊天功能
   # 查询服务状态
   # 验证代理连接
   ```

通过这次升级，AI服务的稳定性和可用性得到了显著提升，为用户提供了更好的体验。