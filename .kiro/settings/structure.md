# 恋语AI - 项目结构指南

## 目录结构
```
LianYu_AI/
├── index.html                 # 主页面（单页应用入口）
├── js/
│   ├── app.js                 # 主应用逻辑（核心，293KB）
│   ├── auth.js                # 认证模块
│   ├── discover.js            # Discover 页面逻辑
│   ├── carousel-enhanced.js   # 轮播增强
│   ├── mobile-keyboard-handler.js  # 移动端键盘处理
│   └── platform-init.js       # 平台初始化
├── css/
│   ├── style.css              # 主样式（265KB）
│   └── i18n.css               # 国际化样式
├── api/                       # 前端 API 服务层
│   ├── config.js              # API 配置
│   ├── ai-service.js          # AI 服务封装（多模型适配）
│   └── backend-service.js     # 后端服务封装
├── config/                    # 前端配置
│   ├── platform-config.js     # 平台配置
│   ├── oauth-config.js        # OAuth 配置
│   ├── app-config.js          # 应用配置
│   ├── env-loader.js          # 环境变量加载
│   └── i18n.js                # 国际化
├── adapters/                  # 跨平台适配器
│   ├── storage-adapter.js     # 存储适配
│   └── network-adapter.js     # 网络适配
├── backend/                   # Node.js 后端
│   └── src/
│       ├── index.js           # Express 入口
│       ├── routes/            # 路由层
│       │   ├── aiRoutes.js    # AI 能力路由（核心）
│       │   ├── userRoutes.js
│       │   ├── emailBasedUserRoutes.js
│       │   ├── unifiedUserRoutes.js
│       │   ├── sessionRoutes.js
│       │   ├── uploadRoutes.js
│       │   ├── paymentRoutes.js
│       │   ├── configRoutes.js
│       │   └── serviceRoutes.js
│       ├── controllers/       # 控制器层
│       │   ├── aiController.js           # 基础 AI 聊天
│       │   ├── aiExtensionController.js  # AI 扩展能力（关系分析等）
│       │   ├── userController.js
│       │   ├── sessionController.js
│       │   ├── uploadController.js
│       │   ├── paymentController.js
│       │   ├── serviceController.js
│       │   └── configController.js
│       ├── services/          # 服务层
│       │   ├── aiService.js              # AI 模型调用
│       │   └── userResolverService.js    # 用户解析
│       ├── models/            # 数据模型
│       │   ├── userModel.js
│       │   ├── sessionModel.js
│       │   └── messageModel.js
│       ├── middleware/        # 中间件
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   ├── emailBasedUserMiddleware.js
│       │   └── userIdentifierMiddleware.js
│       ├── config/            # 后端配置
│       │   ├── database.js
│       │   ├── aiConfig.js
│       │   ├── init.sql
│       │   └── migrate_google_oauth.sql
│       └── utils/
│           ├── dbManager.js
│           ├── queryDatabase.js
│           ├── catchAsync.js
│           └── AppError.js
├── miniprogram/               # 微信小程序
├── ios/                       # iOS (Capacitor)
├── android/                   # Android (Capacitor)
├── scripts/                   # 构建/部署/测试脚本
└── docs/                      # 产品文档
```

## 关键约定
- 前端是纯原生 JS，没有框架，没有构建工具（开发时直接 http-server 启动）
- `js/app.js` 是前端核心，所有主要 UI 逻辑都在这个文件里
- 后端 Express 应用入口在 `backend/src/index.js`
- AI 扩展能力统一放在 `aiExtensionController.js`
- 路由统一挂在 `/api/*` 下
- 数据库操作通过 `dbManager.js` 和 `queryDatabase.js`
- 分支策略：`main` 是唯一主线，所有改动最终必须回到 `main`
