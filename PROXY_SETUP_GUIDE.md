# 代理配置指南

本指南说明如何为服务器配置代理以访问Gemini API等国外服务。

## 问题背景

由于网络限制，服务器可能无法直接访问Google的Gemini API服务器。通过配置代理，可以解决这个连接问题。

## 配置步骤

### 1. 环境变量配置

在项目根目录的 `.env` 文件中添加以下代理配置：

```bash
# 代理配置（用于访问国外API）
# 是否启用代理
PROXY_ENABLED=true

# 代理服务器地址
PROXY_HOST=127.0.0.1

# 代理服务器端口
PROXY_PORT=7890

# 代理协议 (http, https, socks4, socks5)
PROXY_PROTOCOL=http

# 代理认证（如果需要）
PROXY_USERNAME=
PROXY_PASSWORD=
```

### 2. 常见代理配置示例

#### HTTP代理
```bash
PROXY_ENABLED=true
PROXY_HOST=127.0.0.1
PROXY_PORT=8080
PROXY_PROTOCOL=http
```

#### SOCKS5代理
```bash
PROXY_ENABLED=true
PROXY_HOST=127.0.0.1
PROXY_PORT=1080
PROXY_PROTOCOL=socks5
```

#### 带认证的代理
```bash
PROXY_ENABLED=true
PROXY_HOST=proxy.example.com
PROXY_PORT=8080
PROXY_PROTOCOL=http
PROXY_USERNAME=your_username
PROXY_PASSWORD=your_password
```

### 3. 测试代理配置

运行测试脚本验证代理配置是否正常工作：

```bash
cd backend
node test-proxy-gemini.js
```

### 4. 重启服务

配置完成后，重启后端服务使配置生效：

```bash
cd backend
npm start
```

## 代理服务器获取

### 本地代理软件

1. **Clash**: 支持多种协议，配置简单
2. **V2Ray**: 功能强大，支持多种传输协议
3. **Shadowsocks**: 轻量级代理工具

### 云服务代理

1. **VPS + 代理软件**: 在海外VPS上搭建代理服务
2. **商业代理服务**: 购买专业的代理服务

## 注意事项

1. **安全性**: 确保代理服务器的安全性和可信度
2. **稳定性**: 选择稳定的代理服务，避免频繁断线
3. **速度**: 代理会增加延迟，选择速度较快的代理服务器
4. **合规性**: 确保代理使用符合相关法律法规

## 故障排除

### 常见错误

1. **连接超时**
   - 检查代理服务器地址和端口是否正确
   - 确认代理服务器是否正常运行

2. **认证失败**
   - 检查用户名和密码是否正确
   - 确认代理服务器是否需要认证

3. **协议不支持**
   - 确认代理服务器支持的协议类型
   - 尝试不同的协议配置

### 调试方法

1. **查看日志**: 检查控制台输出的代理连接日志
2. **测试连接**: 使用测试脚本验证代理配置
3. **网络诊断**: 使用网络工具检查连接状态

## 备选方案

如果代理配置仍然无法解决问题，可以考虑：

1. **使用Qmax API**: 项目已配置的国内可访问的AI服务
2. **API网关**: 通过API网关转发请求
3. **服务器迁移**: 将服务器迁移到可以直接访问的地区

## 技术实现

项目使用 `https-proxy-agent` 库实现代理支持：

- 自动检测代理配置
- 支持多种代理协议
- 支持代理认证
- 与现有代码无缝集成

配置生效后，所有Gemini API请求将自动通过代理服务器转发。