# 恋语AI数据库管理工具部署指南

## 📋 项目概览

本项目为恋语AI聊天系统创建了一套完整的数据库管理工具集，包括用户管理、会话分析、数据维护等功能。

### 🗂️ 工具集组成

1. **view-database-data.js** - 基础数据查看器
2. **user-profile-manager.js** - 用户个人资料管理器
3. **chat-session-analyzer.js** - 聊天会话分析器
4. **database-maintenance.js** - 数据库维护工具
5. **README.md** - 详细使用文档

## 🔧 环境配置

### 远程服务器信息
- **服务器地址**: 152.32.218.174
- **用户**: root
- **密码**: daiyiping123
- **项目路径**: /var/www/lianyu_ai/backend

### 数据库配置
- **数据库**: PostgreSQL
- **数据库名**: lianyu_ai
- **主要表**: users, sessions, messages
- **当前数据**: 52个用户，0个会话，0条消息

### Node.js环境
- **远程服务器**: Node.js v12.22.12, npm 6.14.16
- **本地开发**: 需要安装pg模块依赖

## 📊 当前数据库状态

### 数据统计
```sql
-- 用户总数
SELECT COUNT(*) FROM users; -- 结果: 52

-- 会话总数
SELECT COUNT(*) FROM sessions; -- 结果: 0

-- 消息总数
SELECT COUNT(*) FROM messages; -- 结果: 0
```

### 用户数据样本
最新10个用户都是测试数据，用户名格式为 `testuser_xxx`，邮箱格式为 `testuser_xxx@example.com`。

## 🚀 部署状态

### ✅ 已完成
1. **脚本创建**: 所有管理脚本已创建完成
2. **文件上传**: 脚本已上传到远程服务器
3. **数据库连接**: 确认数据库可正常访问
4. **数据分析**: 完成当前数据状态分析

### ⚠️ 待解决问题
1. **用户认证**: lianyu_user用户密码认证失败
2. **Node.js路径**: postgres用户无法找到node命令
3. **依赖安装**: 需要在服务器上安装pg模块

## 🛠️ 下一步操作建议

### 1. 修复数据库认证问题
```bash
# 检查PostgreSQL用户配置
sudo -u postgres psql -c "\du"

# 重置lianyu_user密码
sudo -u postgres psql -c "ALTER USER lianyu_user PASSWORD 'new_password';"

# 更新.env文件中的密码
```

### 2. 安装Node.js依赖
```bash
# 在项目目录安装pg模块
cd /var/www/lianyu_ai/backend
npm install pg

# 或者全局安装
npm install -g pg
```

### 3. 配置环境变量
```bash
# 确保.env文件配置正确
cat /var/www/lianyu_ai/backend/.env

# 测试数据库连接
node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()').then(res => console.log(res.rows[0])).catch(err => console.error(err));"
```

### 4. 测试脚本功能
```bash
# 测试用户管理脚本
node scripts/user-profile-manager.js stats
node scripts/user-profile-manager.js list

# 测试会话分析脚本
node scripts/chat-session-analyzer.js list
node scripts/chat-session-analyzer.js analyze

# 测试数据库维护脚本
node scripts/database-maintenance.js health-check
node scripts/database-maintenance.js backup
```

### 5. 数据清理和优化
```bash
# 清理测试用户数据
node scripts/user-profile-manager.js cleanup-test

# 数据库健康检查
node scripts/database-maintenance.js health-check

# 优化数据库性能
node scripts/database-maintenance.js optimize
```

## 📈 功能演示

### 用户管理功能
- 查看用户列表和统计
- 获取用户详细信息
- 导出用户数据
- 清理测试用户

### 会话分析功能
- 分析聊天模式
- 导出会话数据
- 清理空会话
- 生成使用报告

### 数据库维护功能
- 自动备份数据库
- 健康状态检查
- 性能优化建议
- 旧数据清理

## 🔒 安全注意事项

1. **密码安全**: 避免在命令行中明文显示密码
2. **权限控制**: 确保脚本只能由授权用户执行
3. **数据备份**: 在执行清理操作前务必备份数据
4. **日志记录**: 重要操作应记录详细日志

## 📞 技术支持

如遇到问题，请检查：
1. 数据库连接配置
2. Node.js和npm版本兼容性
3. 文件权限设置
4. 环境变量配置

## 📝 更新日志

- **2024-01-XX**: 创建完整的数据库管理工具集
- **2024-01-XX**: 完成脚本上传和初步测试
- **2024-01-XX**: 分析当前数据库状态和问题

---

**项目状态**: 🟡 部分完成，待解决认证和依赖问题
**下一步**: 修复数据库认证，安装依赖，测试所有功能