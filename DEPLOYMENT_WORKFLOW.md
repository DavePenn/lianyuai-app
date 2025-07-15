# 开发部署工作流程指南

## 🚀 完整的开发到部署流程

### 1. 开发阶段

#### 本地开发
```bash
# 1. 创建功能分支
git checkout -b feature/your-feature-name

# 2. 进行开发和测试
npm run dev  # 本地开发服务器

# 3. 代码质量检查
./quality-check.sh all

# 4. 提交代码
git add .
git commit -m "feat: 添加新功能描述"
```

#### 推送到GitHub
```bash
# 推送到远程分支
git push origin feature/your-feature-name

# 创建Pull Request (在GitHub网页操作)
# 代码审查通过后合并到main分支
```

### 2. 部署阶段

#### 方案一：手动部署 (当前方案)
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 同步到服务器
./deploy-sync.sh --sync-only

# 3. 重启服务
./deploy-sync.sh --restart-only

# 4. 验证部署
./deploy-sync.sh --validate-only
```

#### 方案二：一键部署 (推荐)
```bash
# 完整部署流程
./deploy-sync.sh
```

#### 方案三：GitHub Actions自动部署 (未来规划)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Server
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          # 自动部署脚本
```

### 3. 快速修复流程

#### 紧急修复 (Hotfix)
```bash
# 1. 创建hotfix分支
git checkout -b hotfix/urgent-fix

# 2. 快速修复
# 进行必要的代码修改

# 3. 快速部署
git add .
git commit -m "hotfix: 紧急修复描述"
git push origin hotfix/urgent-fix

# 4. 立即部署到服务器
./deploy-sync.sh

# 5. 后续合并到main分支
```

### 4. 环境管理

#### 环境配置同步
```bash
# 同步环境配置
./sync-env.sh production

# 检查环境差异
./sync-env.sh --check
```

#### 数据库迁移
```bash
# 如果有数据库变更
ssh root@152.32.218.174 'cd /var/www/lianyu_ai/backend && npm run migrate'
```

### 5. 监控和回滚

#### 部署后检查
```bash
# 检查服务状态
curl http://152.32.218.174:3001/health

# 查看服务日志
ssh root@152.32.218.174 'cd /var/www/lianyu_ai && tail -f logs/app.log'
```

#### 快速回滚
```bash
# 如果部署出现问题，快速回滚到上一个版本
git log --oneline -5  # 查看最近5次提交
git checkout <previous-commit-hash>
./deploy-sync.sh
```

### 6. 自动化脚本

#### 创建快速部署别名
```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
alias deploy='git pull origin main && ./deploy-sync.sh'
alias quick-deploy='./deploy-sync.sh --sync-only && ./deploy-sync.sh --restart-only'
alias check-deploy='./deploy-sync.sh --validate-only'
```

### 7. 最佳实践

#### 开发规范
- ✅ 每次修改前先拉取最新代码
- ✅ 使用有意义的提交信息
- ✅ 部署前进行代码质量检查
- ✅ 部署后验证功能正常

#### 安全考虑
- 🔒 敏感信息使用环境变量
- 🔒 定期更新依赖包
- 🔒 监控服务器资源使用

#### 性能优化
- ⚡ 使用增量部署减少传输时间
- ⚡ 启用gzip压缩
- ⚡ 配置CDN加速静态资源

### 8. 故障排除

#### 常见问题
1. **部署失败**
   ```bash
   # 检查网络连接
   ping 152.32.218.174
   
   # 检查SSH连接
   ssh root@152.32.218.174 'echo "连接正常"'
   ```

2. **服务启动失败**
   ```bash
   # 查看错误日志
   ssh root@152.32.218.174 'cd /var/www/lianyu_ai && npm run logs'
   
   # 检查端口占用
   ssh root@152.32.218.174 'netstat -tlnp | grep :3001'
   ```

3. **环境配置问题**
   ```bash
   # 重新生成配置
   ./scripts/generate-config.js
   ./sync-env.sh production
   ```

### 9. 未来改进计划

#### 短期目标 (1-2周)
- [ ] 添加自动化测试
- [ ] 完善错误监控
- [ ] 优化部署脚本

#### 中期目标 (1个月)
- [ ] 实施CI/CD流水线
- [ ] 添加性能监控
- [ ] 配置负载均衡

#### 长期目标 (3个月)
- [ ] 容器化部署 (Docker)
- [ ] 多环境管理 (dev/staging/prod)
- [ ] 自动扩缩容

---

## 📞 支持和帮助

如果在部署过程中遇到问题：
1. 查看本文档的故障排除部分
2. 运行 `./quality-check.sh all` 进行全面检查
3. 查看服务器日志获取详细错误信息

**记住：每次修改后都要同步到服务器，保持本地和远程环境一致！**