# 恋语AI Codex 与 Main 主线约定

## 目的

本项目当前采用 `main` 作为唯一主线。

Codex 或 automation 在执行时，可能会自动创建临时 `worktree`、临时分支或独立工作目录，但这些都只是执行容器，不是产品主线。

一句话原则：

- 执行可以分叉
- 结果不能分叉
- 最终主线只认 `main`

## 为什么会看到很多 worktree

Codex 在自动执行时，为了降低风险，通常不会直接在你眼前的工作目录上裸改，而是可能：

- 创建临时 worktree
- 在独立目录中运行
- 使用临时分支完成一次任务

这么做的目的：

- 避免把当前目录直接改乱
- 支持并行执行
- 在失败时更容易回退

这属于执行层面的安全机制，不代表仓库应该长期有多个“主版本”。

## 当前项目约定

### 1. `main` 是唯一事实来源

- GitHub 最新可用代码以 `origin/main` 为准
- 当前本地主工作目录默认也应保持在 `main`
- 对外部署、自动推进、日常查看，都默认基于 `main`

### 2. worktree 只是施工现场

- 允许 Codex/automation 创建临时 worktree
- 不要求所有修改都发生在当前肉眼可见目录
- 但每轮结果必须最终回写到 `main`

### 3. 不保留长期漂移分支

以下分支可以短期存在：

- 临时修复分支
- 临时整合分支
- Codex 自动生成的施工分支

但它们不应该长期承载“最新版本”。

如果出现：

- 某个备份分支比 `main` 新
- 自动 worktree 上的代码没有回到 `main`
- 用户已经分不清哪个目录才是最新

就说明主线已经偏了，需要立即收口回 `main`。

## Codex / automation 的正确工作方式

### 推荐模式

1. 从 `main` 作为基线开始
2. 允许在临时 worktree 中执行
3. 每轮完成后：
   - 验证代码
   - 提交改动
   - 合回 `main`
   - 推送 `origin/main`
4. 清理不再需要的临时 worktree 或临时分支

### 不推荐模式

- 长期在 `backup/*` 分支上继续开发
- 自动任务持续提交到临时分支但不回 `main`
- 本地多个目录都像“最新代码”
- 用户需要手动猜哪个目录才是当前版本

## 当前操作建议

### 日常开发

- 默认在当前主目录的 `main` 上查看和继续工作
- 如果 Codex 自动创建了 worktree，不必惊慌
- 关键判断标准不是目录名，而是最终是否已经进入 `main`

### 自动化推进

automation 可以使用临时 worktree，但应遵守：

- 基于 `main`
- 优先实现主线任务
- 完成后同步回 `main`

### 手动确认时只看三件事

```bash
git branch --show-current
git status --short --branch
git rev-parse HEAD
```

如果要确认主线是否最新，再看：

```bash
git rev-parse main
git rev-parse origin/main
```

## 判断是否“乱了”的标准

只要满足下面任一条，就说明需要收口：

- 当前工作目录不在 `main`
- `main` 不是最新功能所在分支
- GitHub 上的 `origin/main` 不是最新版本
- automation 的结果没有稳定回到 `main`

## 最终结论

对本项目来说：

- `main` 是主线
- worktree 是执行机制
- automation 是推进手段

三者关系应该始终是：

`automation/worktree -> 产出结果 -> 回到 main`

而不是：

`automation/worktree -> 形成另一条长期主线`
