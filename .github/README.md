# GitHub 配置说明

本目录包含了项目的GitHub配置文件，用于设置分支保护、代码审查和项目管理规则。

## 📁 文件说明

### 🛡️ 分支保护配置

#### `workflows/branch-protection.yml`
自动化工作流，用于设置分支保护规则：
- 防止直接推送到main分支
- 要求Pull Request审查
- 防止强制推送和分支删除
- 运行代码质量检查

#### `CODEOWNERS`
定义代码审查者：
- 指定哪些用户或团队需要审查特定文件
- 确保重要文件变更得到适当审查
- **重要**: 请将文件中的 `@your-username` 替换为实际的GitHub用户名

### 📝 模板文件

#### `pull_request_template.md`
Pull Request模板，确保每个PR包含：
- 变更描述
- 测试清单
- 相关Issue链接
- 审查检查项

#### `ISSUE_TEMPLATE/`
Issue模板目录：
- `bug_report.md`: Bug报告模板
- `feature_request.md`: 功能请求模板

## 🚀 使用步骤

### 1. 更新CODEOWNERS文件
```bash
# 编辑 .github/CODEOWNERS 文件
# 将 @your-username 替换为你的GitHub用户名
# 例如: @daniel 或 @myorg/team-name
```

### 2. 推送到GitHub
```bash
git add .github/
git commit -m "feat: 添加GitHub分支保护和项目管理配置"
git push origin main
```

### 3. 手动设置分支保护（推荐）
虽然有自动化工作流，但建议在GitHub网页端手动设置分支保护：

1. 进入GitHub仓库页面
2. 点击 `Settings` → `Branches`
3. 点击 `Add rule` 添加分支保护规则
4. 设置以下规则：
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require approvals (建议设置为1)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict pushes that create files larger than 100MB

### 4. 设置仓库权限
在 `Settings` → `Manage access` 中：
- 确保只有必要的人员有写入权限
- 考虑使用团队来管理权限

## 🔒 安全最佳实践

1. **最小权限原则**: 只给用户必要的权限
2. **代码审查**: 所有代码变更都需要审查
3. **分支保护**: 保护主分支免受意外删除
4. **自动化检查**: 使用CI/CD进行自动化测试
5. **敏感信息**: 使用GitHub Secrets存储敏感信息

## 📋 工作流程

### 标准开发流程
1. 从main分支创建功能分支
2. 在功能分支上开发
3. 创建Pull Request
4. 代码审查和自动化检查
5. 合并到main分支
6. 删除功能分支

### 紧急修复流程
1. 从main分支创建hotfix分支
2. 快速修复问题
3. 创建Pull Request（可以设置紧急标签）
4. 快速审查和合并

## 🛠️ 故障排除

### 常见问题

**Q: 工作流执行失败？**
A: 检查GitHub Actions权限，确保GITHUB_TOKEN有足够权限

**Q: CODEOWNERS不生效？**
A: 确保用户名正确，且用户有仓库访问权限

**Q: 无法推送到main分支？**
A: 这是正常的，请通过Pull Request提交代码

## 📞 支持

如果遇到问题，请：
1. 查看GitHub Actions日志
2. 检查分支保护设置
3. 创建Issue寻求帮助