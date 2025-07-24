# Google OAuth 配置指南

## 问题解决状态

✅ **已完成的修复：**
1. 移除了苹果登录功能
2. 修复了Google登录无响应问题
3. 添加了调试日志
4. 优化了Google OAuth初始化流程

## 当前配置状态

⚠️ **需要配置真实的Google客户端ID**

当前使用的是测试ID：`1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com`

## 获取Google OAuth客户端ID步骤

### 1. 创建Google Cloud项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 项目名称建议：`lianyu-ai-oauth`

### 2. 启用Google+ API

1. 在左侧菜单中选择「API和服务」→「库」
2. 搜索「Google+ API」或「People API」
3. 点击启用

### 3. 创建OAuth 2.0客户端ID

1. 在左侧菜单中选择「API和服务」→「凭据」
2. 点击「创建凭据」→「OAuth 2.0客户端ID」
3. 应用类型选择「Web应用」
4. 名称：`恋语AI Web客户端`

### 4. 配置授权域名

**已授权的JavaScript来源：**
```
http://localhost:3001
http://152.32.218.174:3001
http://your-domain.com
https://your-domain.com
```

**已授权的重定向URI：**
```
http://localhost:3001
http://152.32.218.174:3001
http://your-domain.com
https://your-domain.com
```

### 5. 获取客户端ID

创建完成后，您将获得：
- **客户端ID**：类似 `123456789-abcdefg.apps.googleusercontent.com`
- **客户端密钥**：用于后端验证

## 配置系统

### 前端配置

编辑 `/var/www/lianyu_ai/config/env-loader.js`：

```javascript
getGoogleClientId() {
    // 开发环境
    if (this.environment === 'development') {
        return 'YOUR_DEV_CLIENT_ID.apps.googleusercontent.com';
    }
    
    // 生产环境
    return 'YOUR_PROD_CLIENT_ID.apps.googleusercontent.com';
}
```

### 后端配置

编辑 `/var/www/lianyu_ai/backend/.env`：

```bash
# Google OAuth 配置
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

### 重启服务

```bash
ssh root@152.32.218.174
cd /var/www/lianyu_ai/backend
pm2 restart lianyu-backend
```

## 测试Google登录

1. 访问：http://152.32.218.174:3001
2. 点击「Google登录」按钮
3. 检查浏览器控制台的调试信息
4. 如果仍有问题，访问测试页面：http://152.32.218.174:3001/test-google-oauth.html

## 调试信息

打开浏览器开发者工具（F12），在控制台中查看：

- `找到 X 个Google登录按钮`
- `Google登录按钮被点击，启动登录流程`
- `启动Google登录流程...`
- `显示Google登录弹窗...`

## 常见问题

### Q: Google登录按钮无响应
**A:** 检查控制台是否有错误信息，确保Google OAuth SDK正确加载

### Q: "Google客户端ID未正确配置"
**A:** 按照上述步骤获取真实的客户端ID并更新配置

### Q: "redirect_uri_mismatch" 错误
**A:** 确保在Google Cloud Console中正确配置了重定向URI

## 技术支持

如果遇到问题，请检查：
1. 浏览器控制台错误信息
2. 后端服务日志：`pm2 logs lianyu-backend`
3. Google Cloud Console中的配置

---

**部署时间：** 2025-01-23
**状态：** 等待Google OAuth配置完成
**下一步：** 获取真实的Google客户端ID并配置系统