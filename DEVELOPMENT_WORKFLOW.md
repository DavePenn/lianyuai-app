# 开发流程规范文档

## 概述

本文档旨在建立标准化的开发流程，确保本地开发环境与远程生产环境的一致性，避免因环境不一致导致的部署问题。

## 当前问题分析

### 发现的问题
1. **环境不一致**：本地和远程服务器的配置文件存在差异
2. **CORS配置不统一**：本地使用宽松配置，远程使用严格配置
3. **前端文件缺失**：远程服务器缺少前端文件
4. **缺乏自动化部署**：手动同步容易出错

### 风险评估
- 🔴 **高风险**：环境不一致可能导致功能在本地正常但生产环境失败
- 🟡 **中风险**：手动部署容易遗漏文件或配置
- 🟡 **中风险**：缺乏版本控制可能导致配置丢失

## 标准化开发流程

### 1. 环境配置管理

#### 1.1 环境分离
```bash
# 开发环境
.env.development

# 生产环境
.env.production

# 本地调试环境
.env.local
```

#### 1.2 配置文件统一
- 使用环境变量控制不同环境的配置
- 避免硬编码环境相关的值
- 统一CORS配置策略

### 2. 代码同步流程

#### 2.1 开发阶段
```bash
# 1. 本地开发
git checkout -b feature/new-feature

# 2. 测试功能
npm run dev

# 3. 提交代码
git add .
git commit -m "feat: add new feature"

# 4. 推送到远程仓库
git push origin feature/new-feature
```

#### 2.2 部署阶段
```bash
# 1. 合并到主分支
git checkout main
git merge feature/new-feature

# 2. 同步到生产环境
./deploy-sync.sh

# 3. 验证部署
./sync-env.sh --compare
```

### 3. 环境同步工具使用

#### 3.1 配置对比
```bash
# 对比本地和远程配置差异
./sync-env.sh --compare
```

#### 3.2 配置同步
```bash
# 同步本地配置到远程
./sync-env.sh --sync-to-remote

# 同步远程配置到本地
./sync-env.sh --sync-to-local
```

#### 3.3 统一配置应用
```bash
# 创建并应用统一配置
./sync-env.sh --apply-unified
```

## 部署检查清单

### 部署前检查
- [ ] 本地测试通过
- [ ] 配置文件已更新
- [ ] 环境变量已设置
- [ ] 依赖包已安装
- [ ] 代码已提交到版本控制

### 部署过程
- [ ] 备份远程配置
- [ ] 同步代码文件
- [ ] 安装/更新依赖
- [ ] 重启服务
- [ ] 验证服务状态

### 部署后验证
- [ ] 服务正常启动
- [ ] API接口可访问
- [ ] 前端页面正常
- [ ] 关键功能测试通过
- [ ] 日志无错误信息

## 环境配置最佳实践

### 1. CORS配置策略

```javascript
// 推荐的动态CORS配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' ? [
    "http://localhost:3000",
    "http://localhost:8080", 
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081"
  ] : [
    "http://152.32.218.174:3001",
    "http://152.32.218.174:8080",
    "http://152.32.218.174:8081"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
```

### 2. 环境变量管理

```bash
# .env.development
NODE_ENV=development
LOCAL_DEV=true
PORT=3001
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8081

# .env.production
NODE_ENV=production
LOCAL_DEV=false
PORT=3001
API_BASE_URL=http://152.32.218.174:3001
FRONTEND_URL=http://152.32.218.174:3001
```

### 3. 服务启动脚本

```json
// package.json
{
  "scripts": {
    "dev": "NODE_ENV=development LOCAL_DEV=true node src/index.js",
    "start": "NODE_ENV=production node src/index.js",
    "start:local": "NODE_ENV=development node src/index.js"
  }
}
```

## 故障排查指南

### 1. CORS错误
```bash
# 检查CORS配置
curl -H "Origin: http://localhost:8081" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://152.32.218.174:3001/api/auth/register
```

### 2. 服务连接问题
```bash
# 检查服务状态
curl -I http://152.32.218.174:3001/api/health

# 检查端口占用
ss -tlnp | grep :3001
```

### 3. 配置差异检查
```bash
# 对比配置文件
./sync-env.sh --compare

# 查看服务日志
ssh root@152.32.218.174 'cd /var/www/lianyu_ai/backend && tail -f server.log'
```

## 持续改进建议

### 短期目标（1-2周）
1. ✅ 建立环境同步脚本
2. ✅ 创建统一配置模板
3. 🔄 完善前端部署流程
4. 🔄 建立自动化测试

### 中期目标（1个月）
1. 🔄 集成CI/CD流程
2. 🔄 添加监控和日志系统
3. 🔄 建立回滚机制
4. 🔄 完善文档和培训

### 长期目标（3个月）
1. 🔄 容器化部署
2. 🔄 多环境管理
3. 🔄 性能监控
4. 🔄 安全加固

## 团队协作规范

### 1. 代码提交规范
```bash
# 提交信息格式
feat: 新功能
fix: 修复bug
config: 配置更改
deploy: 部署相关
docs: 文档更新
```

### 2. 分支管理
```bash
# 主分支
main - 生产环境代码

# 开发分支
develop - 开发环境代码

# 功能分支
feature/* - 新功能开发

# 修复分支
hotfix/* - 紧急修复
```

### 3. 代码审查
- 所有代码变更需要经过审查
- 配置文件变更需要特别关注
- 部署前必须进行测试验证

## 总结

通过建立标准化的开发流程和环境管理机制，我们可以：

1. **避免环境不一致问题**：统一配置管理确保各环境一致性
2. **提高部署可靠性**：自动化脚本减少人为错误
3. **加快问题定位**：标准化的故障排查流程
4. **提升开发效率**：清晰的工作流程和工具支持

建议团队逐步实施这些规范，从最关键的环境同步开始，逐步完善整个开发流程。