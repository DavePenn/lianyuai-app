# Skill: 部署到生产环境

## Description
将代码部署到生产服务器（152.32.218.174）。

## Steps

### 1. 预检查
- 确认当前在 `main` 分支
- 运行 `node scripts/validate-config.js` 验证配置
- 确认 `.env.production` 配置正确

### 2. 构建
```bash
npm run build:web
```

### 3. 部署
```bash
# 标准部署
npm run deploy:prod
# 或
./scripts/deploy-standard.sh production
```

### 4. 验证
- 访问生产环境确认页面正常
- 测试核心 API（`/api/health`）
- 测试 AI 能力接口

## 注意事项
- 部署前确保所有改动已提交到 `main`
- 不要在生产环境使用开发配置
- 部署后检查 CORS 配置是否正确
