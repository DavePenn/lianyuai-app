# 恋语AI - 智能恋爱助手

一个支持多平台部署的AI聊天应用，帮助用户提升恋爱沟通技巧。

## 🌟 功能特性

- **智能对话**: 支持多种AI模型（OpenAI、Claude、Gemini等）
- **场景化聊天**: 提供恋爱开场、日常聊天、情感咨询等多种场景
- **多模态交互**: 支持文字、图片等多种输入方式
- **会话管理**: 智能会话分类和历史记录
- **跨平台支持**: Web、小程序、iOS、Android一码多端
- **PWA支持**: 支持离线使用和桌面安装

## 🏗️ 技术架构

### 核心技术栈
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **PWA**: Service Worker + Web App Manifest
- **跨平台**: Capacitor (iOS/Android) + 小程序原生
- **AI集成**: 多模型适配器架构

### 架构设计
```
恋语AI
├── Web端 (PWA)
├── 小程序端
├── iOS App (Capacitor)
├── Android App (Capacitor)
└── 共享核心逻辑
    ├── 平台配置管理
    ├── 存储适配器
    ├── 网络适配器
    └── AI服务层
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd lianyuai

# 安装依赖
npm install
```

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:8080
```

## 📱 平台部署

### Web端部署
```bash
# 构建生产版本
npm run build:web

# 或使用构建脚本
node scripts/build.js web
```

### 小程序部署
```bash
# 构建小程序版本
npm run build:miniprogram

# 或使用构建脚本
node scripts/build.js miniprogram
```

### iOS应用部署
```bash
# 构建iOS版本
npm run build:ios

# 打开Xcode项目
npm run cap:open:ios
```

### Android应用部署
```bash
# 构建Android版本
npm run build:android

# 打开Android Studio项目
npm run cap:open:android
```

### 一键构建所有平台
```bash
# 构建所有平台
node scripts/build.js all
```

## 🔧 配置说明

### API配置
编辑 `config/platform-config.js` 配置不同平台的API地址：

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
    }
    // ...
};
```

### AI模型配置
在 `api/ai-service.js` 中配置支持的AI模型：

```javascript
const AI_MODELS = {
    'openai-gpt4': {
        name: 'GPT-4',
        provider: 'openai',
        model: 'gpt-4'
    },
    'claude-3': {
        name: 'Claude 3',
        provider: 'anthropic',
        model: 'claude-3-sonnet'
    }
    // ...
};
```

## 📁 项目结构

```
lianyuai/
├── index.html              # 主页面
├── manifest.json           # PWA配置
├── service-worker.js       # Service Worker
├── package.json           # 项目配置
├── capacitor.config.ts    # Capacitor配置
├── css/                   # 样式文件
│   └── style.css
├── js/                    # JavaScript文件
│   ├── app.js            # 主应用逻辑
│   └── platform-init.js  # 平台初始化
├── api/                   # API服务层
│   ├── config.js         # API配置
│   ├── ai-service.js     # AI服务
│   └── backend-service.js # 后端服务
├── config/                # 配置文件
│   └── platform-config.js # 平台配置
├── adapters/              # 适配器
│   ├── storage-adapter.js # 存储适配
│   └── network-adapter.js # 网络适配
├── miniprogram/           # 小程序代码
│   ├── app.js
│   ├── app.json
│   └── pages/
├── scripts/               # 构建脚本
│   └── build.js
├── images/                # 图片资源
├── icons/                 # 图标资源
└── docs/                  # 文档
    └── DEPLOYMENT_GUIDE.md
```

## 🔌 API接口

### 用户认证
```javascript
// 用户登录
POST /api/auth/login
{
    "username": "user@example.com",
    "password": "password"
}

// 用户注册
POST /api/auth/register
{
    "username": "user@example.com",
    "password": "password",
    "nickname": "昵称"
}
```

### AI对话
```javascript
// 发送消息
POST /api/ai/chat
{
    "message": "你好",
    "sessionId": "session-123",
    "model": "openai-gpt4",
    "context": "恋爱聊天"
}
```

### 会话管理
```javascript
// 获取会话列表
GET /api/sessions

// 创建新会话
POST /api/sessions
{
    "title": "会话标题",
    "type": "恋爱咨询"
}
```

## 🎨 自定义主题

应用支持亮色和暗色主题，可在 `css/style.css` 中自定义：

```css
:root {
    /* 亮色主题 */
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-color: #ffffff;
    --text-color: #333333;
}

[data-theme="dark"] {
    /* 暗色主题 */
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --background-color: #1a1a1a;
    --text-color: #ffffff;
}
```

## 🧪 测试

```bash
# 运行测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 📦 构建和部署

### 环境变量
创建 `.env` 文件配置环境变量：

```env
# API配置
API_BASE_URL=https://api.lianyuai.com
API_KEY=your-api-key

# 小程序配置
MINIPROGRAM_APP_ID=your-miniprogram-appid

# Capacitor配置
CAPACITOR_APP_ID=com.lianyuai.app
CAPACITOR_APP_NAME=恋语AI
```

### CI/CD
项目支持自动化部署，可配置GitHub Actions或其他CI/CD工具。

## 🔒 安全性

- **数据加密**: 敏感数据本地加密存储
- **API安全**: 支持JWT认证和API密钥
- **隐私保护**: 遵循数据保护法规
- **内容审核**: 集成内容安全检测

## 🌍 国际化

应用支持多语言，可在 `i18n/` 目录添加语言包：

```javascript
// i18n/zh-CN.js
export default {
    'app.title': '恋语AI',
    'chat.placeholder': '输入消息...',
    // ...
};
```

## 📈 性能优化

- **代码分割**: 按需加载模块
- **资源压缩**: CSS/JS自动压缩
- **缓存策略**: Service Worker智能缓存
- **图片优化**: 支持WebP格式

## 🐛 问题排查

### 常见问题

1. **跨域问题**
   - 检查API服务器CORS配置
   - 小程序需配置域名白名单

2. **构建失败**
   - 检查Node.js版本
   - 清理node_modules重新安装

3. **Capacitor问题**
   - 确保Xcode/Android Studio已安装
   - 检查平台SDK版本

### 调试技巧

```bash
# 查看详细日志
npm run dev -- --verbose

# 清理缓存
npm run clean

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

### 代码规范

- 使用ESLint进行代码检查
- 遵循JavaScript Standard Style
- 提交前运行测试

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: support@lianyuai.com
- 官网: https://lianyuai.com

## 🙏 致谢

感谢以下开源项目的支持：

- [Capacitor](https://capacitorjs.com/) - 跨平台应用开发
- [OpenAI](https://openai.com/) - AI模型支持
- [Font Awesome](https://fontawesome.com/) - 图标库

---

**恋语AI** - 让AI成为你的恋爱导师 💕