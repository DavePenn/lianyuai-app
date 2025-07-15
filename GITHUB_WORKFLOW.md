# GitHub 工作流程指南

## 🌟 完整的 Git + GitHub + 部署工作流程

### 1. 初始设置

#### 确保 GitHub 仓库已配置
```bash
# 检查远程仓库
git remote -v

# 如果没有配置，添加远程仓库
git remote add origin https://github.com/your-username/lianyu_ai.git

# 推送现有代码到 GitHub
git push -u origin main
```

#### 配置 Git 用户信息
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. 日常开发工作流程

#### 🚀 标准功能开发流程

```bash
# 1. 确保在主分支并拉取最新代码
git checkout main
git pull origin main

# 2. 创建功能分支 (使用快速命令)
gdev user-authentication  # 等同于: git checkout -b feature/1215-user-authentication

# 3. 进行开发工作
# ... 编写代码 ...

# 4. 代码质量检查
qcheck  # 等同于: ./quality-check.sh all

# 5. 提交代码
gcommit "feat: 添加用户认证功能"  # 等同于: git add . && git commit -m "feat: 添加用户认证功能"

# 6. 推送到 GitHub
gpush  # 等同于: git push origin feature/1215-user-authentication

# 7. 在 GitHub 网页创建 Pull Request
# 8. 代码审查通过后合并到 main
# 9. 删除功能分支
git branch -d feature/1215-user-authentication

# 10. 拉取最新的 main 分支
gpull  # 等同于: git pull origin main

# 11. 部署到服务器
deploy  # 等同于: git pull origin main && ./deploy-sync.sh

# 12. 验证部署
checkdeploy  # 等同于: ./deploy-sync.sh --validate-only
```

#### 🔥 紧急修复流程 (Hotfix)

```bash
# 1. 从 main 分支创建 hotfix 分支
git checkout main
git pull origin main
gfix critical-bug  # 等同于: git checkout -b hotfix/1215-critical-bug

# 2. 快速修复
# ... 修复代码 ...

# 3. 快速验证
qsec  # 安全检查

# 4. 提交并推送
gcommit "hotfix: 修复关键安全漏洞"
gpush

# 5. 立即部署 (跳过 PR 流程)
git checkout main
git merge hotfix/1215-critical-bug
git push origin main
deploy

# 6. 后续创建 PR 记录修复
```

### 3. 分支管理策略

#### 分支命名规范
- `feature/MMDD-description` - 新功能分支
- `hotfix/MMDD-description` - 紧急修复分支
- `bugfix/MMDD-description` - 普通错误修复
- `refactor/MMDD-description` - 代码重构
- `docs/MMDD-description` - 文档更新

#### 提交信息规范
```bash
# 格式: <type>(<scope>): <description>

# 类型 (type):
feat:     # 新功能
fix:      # 错误修复
docs:     # 文档更新
style:    # 代码格式化
refactor: # 代码重构
test:     # 测试相关
chore:    # 构建过程或辅助工具的变动

# 示例:
gcommit "feat(auth): 添加JWT认证中间件"
gcommit "fix(api): 修复用户登录接口错误"
gcommit "docs: 更新API文档"
gcommit "refactor(db): 优化数据库连接池"
```

### 4. Pull Request 最佳实践

#### PR 创建清单
- [ ] 功能分支已从最新的 main 分支创建
- [ ] 代码已通过质量检查 (`qcheck`)
- [ ] 提交信息遵循规范
- [ ] PR 标题清晰描述变更内容
- [ ] PR 描述包含:
  - 变更内容概述
  - 测试步骤
  - 相关 Issue 链接
  - 截图 (如有 UI 变更)

#### PR 模板
```markdown
## 变更概述
简要描述此 PR 的主要变更内容

## 变更类型
- [ ] 新功能 (feature)
- [ ] 错误修复 (bugfix)
- [ ] 代码重构 (refactor)
- [ ] 文档更新 (docs)
- [ ] 其他 (请说明)

## 测试
- [ ] 本地测试通过
- [ ] 代码质量检查通过
- [ ] 部署测试通过

## 相关 Issue
关闭 #issue_number

## 截图
(如有 UI 变更，请提供截图)

## 部署说明
(如有特殊部署要求，请说明)
```

### 5. 协作开发

#### 多人协作流程
```bash
# 1. Fork 仓库 (如果是外部贡献者)
# 2. Clone 你的 fork
git clone https://github.com/your-username/lianyu_ai.git

# 3. 添加上游仓库
git remote add upstream https://github.com/original-owner/lianyu_ai.git

# 4. 保持 fork 同步
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 5. 创建功能分支并开发
gdev new-feature
# ... 开发 ...
gcommit "feat: 新功能"
gpush

# 6. 创建 PR 到上游仓库
```

#### 代码审查清单
**审查者检查项:**
- [ ] 代码逻辑正确
- [ ] 代码风格一致
- [ ] 安全性考虑
- [ ] 性能影响
- [ ] 测试覆盖
- [ ] 文档更新

### 6. 自动化工作流程

#### GitHub Actions 配置 (未来规划)
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run quality checks
        run: ./quality-check.sh all
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # 自动部署脚本
          ./deploy-sync.sh
```

### 7. 版本管理

#### 语义化版本控制
```bash
# 创建版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 版本号规则:
# MAJOR.MINOR.PATCH
# 1.0.0 -> 1.0.1 (补丁)
# 1.0.1 -> 1.1.0 (小版本)
# 1.1.0 -> 2.0.0 (大版本)
```

#### 发布流程
```bash
# 1. 确保 main 分支稳定
git checkout main
git pull origin main
qcheck

# 2. 创建发布分支
git checkout -b release/v1.1.0

# 3. 更新版本号和变更日志
# 编辑 package.json, CHANGELOG.md

# 4. 提交发布准备
gcommit "chore: 准备发布 v1.1.0"

# 5. 合并到 main 并创建标签
git checkout main
git merge release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags

# 6. 部署发布版本
deploy
```

### 8. 故障处理

#### 回滚流程
```bash
# 1. 查看提交历史
glog  # 等同于: git log --oneline -10

# 2. 回滚到指定版本
git checkout <commit-hash>
git checkout -b hotfix/rollback-to-stable

# 3. 部署回滚版本
deploy

# 4. 创建 PR 记录回滚
gcommit "hotfix: 回滚到稳定版本 <commit-hash>"
gpush
```

#### 冲突解决
```bash
# 1. 拉取最新代码时遇到冲突
git pull origin main
# Auto-merging file.js
# CONFLICT (content): Merge conflict in file.js

# 2. 手动解决冲突
# 编辑冲突文件，删除冲突标记

# 3. 标记冲突已解决
git add file.js
git commit -m "resolve: 解决合并冲突"

# 4. 推送解决方案
gpush
```

### 9. 快速命令参考

```bash
# 重新加载快速命令
source ~/.bashrc  # 或 source ~/.zshrc

# 查看所有快速命令
lianyuhelp

# 查看工作流程
workflow

# 项目统计
projstats

# 常用组合命令
cdlianyu && gstatus    # 进入项目并查看状态
qcheck && deploy       # 质量检查后部署
gpull && qcheck        # 拉取代码后检查
```

### 10. 最佳实践总结

#### ✅ 推荐做法
- 每次开发前先拉取最新代码
- 使用有意义的分支名和提交信息
- 小而频繁的提交
- 部署前进行质量检查
- 及时删除已合并的分支
- 定期同步 fork (如果适用)

#### ❌ 避免做法
- 直接在 main 分支开发
- 提交信息过于简单或无意义
- 大量代码一次性提交
- 跳过代码审查流程
- 在生产环境直接测试

---

## 📞 获取帮助

- 使用 `lianyuhelp` 查看快速命令
- 使用 `workflow` 查看开发流程
- 查看 [Git 官方文档](https://git-scm.com/docs)
- 查看 [GitHub 官方指南](https://docs.github.com/)

**记住：良好的工作流程是团队协作成功的关键！**