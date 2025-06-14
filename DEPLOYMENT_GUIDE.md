# 恋语AI 跨平台部署指南

本指南将帮助您将恋语AI项目部署到Web、小程序、iOS和Android等多个平台。

## 项目架构概述

恋语AI采用跨平台架构设计，通过适配器模式统一不同平台的API差异：

- **配置管理**: `config/platform-config.js` - 统一管理不同平台的配置
- **存储适配**: `adapters/storage-adapter.js` - 统一存储接口
- **网络适配**: `adapters/network-adapter.js` - 统一网络请求
- **平台初始化**: `js/platform-init.js` - 平台特定功能初始化

## 环境准备

### 基础要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

## Web端部署

### 开发环境
```bash
# 启动开发服务器
npm run dev
# 访问 http://localhost:8080
```

### 生产环境
```bash
# 构建生产版本
npm run build:web

# 部署到服务器
# 将 dist/ 目录上传到Web服务器
```

### PWA功能
- 自动注册Service Worker
- 支持离线使用
- 可安装到桌面

## 小程序部署

### 1. 准备工作
- 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册小程序账号并获取AppID

### 2. 配置小程序
```bash
# 小程序代码位于 miniprogram/ 目录
cd miniprogram/
```

### 3. 修改配置
编辑 `miniprogram/app.js`，更新API地址：
```javascript
globalData: {
    apiBaseUrl: 'https://your-api-domain.com', // 替换为您的API地址
    // ...
}
```

### 4. 开发和发布
1. 用微信开发者工具打开 `miniprogram/` 目录
2. 填入您的AppID
3. 预览和调试
4. 上传代码并提交审核

### 小程序特殊配置
- 需要在小程序后台配置服务器域名
- 所有网络请求必须使用HTTPS
- 需要配置业务域名（如果使用webview）

## iOS应用部署

### 1. 环境准备
- macOS系统
- Xcode 14+
- iOS Developer账号

### 2. 安装Capacitor
```bash
# 添加iOS平台
npm run cap:add:ios
```

### 3. 构建和同步
```bash
# 构建Web版本
npm run build:web

# 同步到iOS
npm run cap:sync

# 打开Xcode项目
npm run cap:open:ios
```

### 4. Xcode配置
1. 设置Bundle Identifier
2. 配置签名证书
3. 设置应用图标和启动屏幕
4. 配置权限（相机、位置等）

### 5. 发布到App Store
1. 在Xcode中Archive
2. 上传到App Store Connect
3. 填写应用信息
4. 提交审核

## Android应用部署

### 1. 环境准备
- Android Studio
- Android SDK
- Java 11+

### 2. 添加Android平台
```bash
# 添加Android平台
npm run cap:add:android
```

### 3. 构建和同步
```bash
# 构建Web版本
npm run build:web

# 同步到Android
npm run cap:sync

# 打开Android Studio项目
npm run cap:open:android
```

### 4. Android Studio配置
1. 设置应用ID和版本
2. 配置签名密钥
3. 设置应用图标和启动屏幕
4. 配置权限

### 5. 发布到Google Play
1. 生成签名APK/AAB
2. 上传到Google Play Console
3. 填写应用信息
4. 提交审核

## 配置说明

### API配置
不同平台可能需要不同的API地址，在 `config/platform-config.js` 中配置：

```javascript
const platformConfigs = {
    web: {
        api: {
            baseURL: 'https://api.lianyuai.com'
        }
    },
    miniprogram: {
        api: {
            baseURL: 'https://api.lianyuai.com'
        }
    },
    // ...
};
```

### 存储配置
不同平台使用不同的存储机制：
- Web: localStorage
- 小程序: wx.storage
- App: Capacitor Storage

### 功能特性
某些功能在不同平台上的支持情况：

| 功能 | Web | 小程序 | iOS App | Android App |
|------|-----|--------|---------|-------------|
| PWA | ✅ | ❌ | ❌ | ❌ |
| 推送通知 | ✅ | ❌ | ✅ | ✅ |
| 文件上传 | ✅ | ✅ | ✅ | ✅ |
| 相机访问 | ✅ | ✅ | ✅ | ✅ |
| 地理位置 | ✅ | ✅ | ✅ | ✅ |

## 常见问题

### 1. 跨域问题
- Web端需要配置CORS
- 小程序需要在后台配置域名白名单
- App端通过Capacitor自动处理

### 2. 图标和启动屏幕
```bash
# 生成不同尺寸的图标
# 建议使用在线工具或设计软件生成
```

### 3. 权限配置
不同平台需要在相应的配置文件中声明权限：
- iOS: Info.plist
- Android: AndroidManifest.xml
- 小程序: app.json

### 4. 调试技巧
```bash
# Web端调试
npm run dev

# iOS模拟器调试
npm run cap:run:ios

# Android模拟器调试
npm run cap:run:android
```

## 部署检查清单

### Web端
- [ ] 配置正确的API地址
- [ ] 测试PWA功能
- [ ] 检查Service Worker缓存
- [ ] 验证响应式设计

### 小程序
- [ ] 配置AppID
- [ ] 设置服务器域名
- [ ] 测试所有页面功能
- [ ] 检查审核规范合规性

### iOS应用
- [ ] 配置Bundle Identifier
- [ ] 设置签名证书
- [ ] 测试真机运行
- [ ] 检查App Store审核指南

### Android应用
- [ ] 配置应用ID
- [ ] 生成签名密钥
- [ ] 测试不同设备
- [ ] 检查Google Play政策

## 技术支持

如果在部署过程中遇到问题，请：

1. 查看控制台错误信息
2. 检查网络请求是否正常
3. 验证平台特定配置
4. 参考官方文档

## 更新维护

### 版本更新流程
1. 更新版本号
2. 构建新版本
3. 测试所有平台
4. 发布更新

### 监控和分析
- 集成错误监控
- 添加用户行为分析
- 监控性能指标

---

通过以上步骤，您可以成功将恋语AI部署到多个平台。每个平台都有其特定的要求和限制，请仔细阅读相关文档并进行充分测试。