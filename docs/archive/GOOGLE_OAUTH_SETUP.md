# Google OAuth 设置指南

本指南将帮助您为恋语AI项目配置Google OAuth登录功能。

## 📋 前置要求

- Google账号
- 项目已部署到可访问的域名或IP地址

## 🚀 步骤1：创建Google Cloud项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击项目选择器，然后点击「新建项目」
3. 输入项目名称（例如："恋语AI"）
4. 点击「创建」

## 🔧 步骤2：启用Google+ API

1. 在Google Cloud Console中，导航到「API和服务」>「库」
2. 搜索「Google+ API」
3. 点击「Google+ API」
4. 点击「启用」

## 🔑 步骤3：创建OAuth 2.0凭据

1. 导航到「API和服务」>「凭据」
2. 点击「创建凭据」>「OAuth客户端ID」
3. 如果首次创建，需要先配置OAuth同意屏幕：
   - 选择「外部」用户类型
   - 填写应用名称："恋语AI"
   - 填写用户支持电子邮件
   - 填写开发者联系信息
   - 点击「保存并继续」
4. 选择应用类型：「Web应用"
5. 输入名称："恋语AI Web客户端"
6. 添加已获授权的JavaScript来源：
   - 开发环境：`http://localhost:8080`
   - 生产环境：`http://152.32.218.174:3001`
7. 添加已获授权的重定向URI：
   - 开发环境：`http://localhost:8080`
   - 生产环境：`http://152.32.218.174:3001`
8. 点击「创建」

## 📝 步骤4：获取客户端ID

创建完成后，您将看到一个弹窗显示：
- **客户端ID**：类似 `123456789-abcdefg.apps.googleusercontent.com`
- **客户端密钥**：用于服务端验证

**重要**：复制并保存这些信息！

## ⚙️ 步骤5：配置环境变量

### 开发环境配置

编辑 `.env.development` 文件：

```bash
# OAuth配置
GOOGLE_CLIENT_ID=你的开发环境客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的开发环境客户端密钥
```

### 生产环境配置

编辑 `.env.production` 文件：

```bash
# OAuth配置
GOOGLE_CLIENT_ID=你的生产环境客户端ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=你的生产环境客户端密钥
```

### 更新环境加载器

编辑 `config/env-loader.js` 文件，将占位符替换为实际的客户端ID：

```javascript
/**
 * 获取Google客户端ID
 */
getGoogleClientId() {
    // 开发环境
    if (this.environment === 'development') {
        return '你的开发环境客户端ID.apps.googleusercontent.com';
    }
    
    // 生产环境
    return '你的生产环境客户端ID.apps.googleusercontent.com';
}
```

## 🧪 步骤6：测试配置

1. 重新加载应用
2. 打开浏览器开发者工具
3. 查看控制台输出，应该看到：
   ```
   ✅ OAuth配置初始化完成
   🔑 Google客户端ID: 你的客户端ID.apps.googleusercontent.com
   ```
4. 点击Google登录按钮测试功能

## 🔒 安全注意事项

1. **客户端ID是公开的**：可以在前端代码中使用
2. **客户端密钥是私密的**：只能在后端使用，不要暴露在前端
3. **域名限制**：确保在Google Console中正确配置了授权域名
4. **HTTPS要求**：生产环境建议使用HTTPS

## 🐛 常见问题

### 问题1："redirect_uri_mismatch" 错误

**解决方案**：检查Google Console中配置的重定向URI是否与当前访问地址完全匹配。

### 问题2："origin_mismatch" 错误

**解决方案**：检查Google Console中配置的JavaScript来源是否包含当前域名。

### 问题3：Google登录按钮不显示

**解决方案**：
1. 检查客户端ID是否正确配置
2. 检查网络连接
3. 查看浏览器控制台错误信息

### 问题4：登录后没有响应

**解决方案**：
1. 检查后端API是否正常运行
2. 检查网络请求是否成功
3. 查看后端日志

## 📞 技术支持

如果遇到问题，请：
1. 检查浏览器控制台错误信息
2. 查看后端服务日志
3. 确认所有配置步骤都已正确完成

## 🔄 更新配置

如果需要更新Google OAuth配置：
1. 在Google Cloud Console中修改凭据设置
2. 更新环境变量文件
3. 重新部署应用

---

**恭喜！** 您已成功配置Google OAuth登录功能。用户现在可以使用Google账号快速登录恋语AI。