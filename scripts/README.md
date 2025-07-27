# 恋语AI数据库管理脚本集合

本目录包含了一系列用于管理恋语AI数据库的专业脚本工具，涵盖数据查看、用户管理、会话分析、数据库维护等功能。

## 📁 脚本文件列表

### 1. `view-database-data.js` - 数据库数据查看器
基础的数据库数据查看工具，用于快速浏览数据库内容。

**主要功能：**
- 查看数据库概览
- 浏览用户资料
- 查看聊天历史
- 用户详情查询

**使用示例：**
```bash
# 查看数据库概览
node view-database-data.js overview

# 查看用户资料
node view-database-data.js users

# 查看聊天历史
node view-database-data.js chat

# 查看特定用户详情
node view-database-data.js user-details 1
```

### 2. `user-profile-manager.js` - 用户个人资料管理器
专业的用户数据管理工具，提供完整的用户信息管理功能。

**主要功能：**
- 用户列表查看（支持分页和搜索）
- 用户详情查看（包含使用统计）
- 用户数据导出（JSON/CSV/TXT格式）
- 用户统计分析
- 测试用户清理

**使用示例：**
```bash
# 查看用户列表（前20个）
node user-profile-manager.js list

# 查看用户列表（前10个，搜索关键词"test"）
node user-profile-manager.js list 10 test

# 查看用户详情
node user-profile-manager.js detail 1

# 导出用户数据为JSON格式
node user-profile-manager.js export json

# 导出用户数据为CSV格式
node user-profile-manager.js export csv ./users.csv

# 显示用户统计信息
node user-profile-manager.js stats

# 清理测试用户（试运行）
node user-profile-manager.js cleanup

# 实际清理测试用户
node user-profile-manager.js cleanup --no-dry-run
```

### 3. `chat-session-analyzer.js` - 聊天会话分析器
专业的聊天会话数据分析工具，提供深入的会话和消息分析。

**主要功能：**
- 会话列表查看（支持用户过滤）
- 会话详情分析（包含消息统计）
- 聊天模式分析（活动时间、会话长度分布等）
- 会话数据导出
- 空会话清理

**使用示例：**
```bash
# 查看会话列表
node chat-session-analyzer.js list

# 查看特定用户的会话（用户ID为1）
node chat-session-analyzer.js list 20 1

# 查看会话详情
node chat-session-analyzer.js detail 1

# 分析整体聊天模式
node chat-session-analyzer.js analyze

# 分析特定用户的聊天模式
node chat-session-analyzer.js analyze 1

# 导出会话数据（包含消息内容）
node chat-session-analyzer.js export json ./sessions.json --include-messages

# 导出特定用户的会话数据
node chat-session-analyzer.js export json ./user-sessions.json 1

# 清理空会话（试运行）
node chat-session-analyzer.js cleanup-empty

# 实际清理空会话
node chat-session-analyzer.js cleanup-empty --no-dry-run
```

### 4. `database-maintenance.js` - 数据库维护工具
专业的数据库维护和管理工具，提供备份、恢复、优化等功能。

**主要功能：**
- 数据库备份（多种格式）
- 数据库恢复
- 数据库健康检查
- 数据库优化
- 旧数据清理

**使用示例：**
```bash
# 创建数据库备份（默认custom格式）
node database-maintenance.js backup

# 创建SQL格式备份
node database-maintenance.js backup ./backup.sql plain

# 仅备份数据（不包含结构）
node database-maintenance.js backup ./data-only.backup custom --data-only

# 恢复数据库备份
node database-maintenance.js restore ./backup.backup

# 恢复时清理现有数据
node database-maintenance.js restore ./backup.backup --clean

# 数据库健康检查
node database-maintenance.js health

# 数据库优化
node database-maintenance.js optimize

# 清理90天前的旧数据（试运行）
node database-maintenance.js cleanup-old 90

# 实际清理30天前的旧数据
node database-maintenance.js cleanup-old 30 --no-dry-run
```

## 🔧 环境配置

### 数据库连接配置
所有脚本都支持通过环境变量配置数据库连接：

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=lianyu_ai
export DB_USER=lianyu_user
export DB_PASSWORD=your_password
```

或者在运行脚本时设置：
```bash
DB_PASSWORD=your_password node user-profile-manager.js list
```

### 依赖安装
确保安装了必要的Node.js依赖：
```bash
npm install pg
```

对于数据库维护脚本，还需要确保系统安装了PostgreSQL客户端工具：
- `pg_dump` - 用于数据库备份
- `pg_restore` - 用于数据库恢复
- `psql` - 用于SQL文件恢复

## 📊 功能特性

### 🔍 数据查看和分析
- **多维度数据查看**：支持用户、会话、消息等多个维度的数据查看
- **统计分析**：提供详细的使用统计和行为模式分析
- **搜索和过滤**：支持关键词搜索和条件过滤
- **分页支持**：大数据量时的分页显示

### 📤 数据导出
- **多种格式**：支持JSON、CSV、TXT等多种导出格式
- **灵活配置**：可选择导出内容和范围
- **批量操作**：支持批量数据导出

### 🧹 数据清理
- **安全模式**：默认试运行模式，避免误删除
- **智能识别**：自动识别测试数据和无效数据
- **批量清理**：支持批量清理操作

### 🔧 数据库维护
- **自动备份**：支持定时和手动备份
- **健康检查**：全面的数据库健康状态检查
- **性能优化**：自动数据库优化和维护
- **恢复功能**：安全的数据库恢复机制

## 🚀 最佳实践

### 1. 定期备份
建议每天自动备份数据库：
```bash
# 创建定时任务
crontab -e

# 添加每日凌晨2点备份
0 2 * * * cd /path/to/scripts && node database-maintenance.js backup
```

### 2. 定期健康检查
建议每周进行数据库健康检查：
```bash
# 每周一上午9点检查
0 9 * * 1 cd /path/to/scripts && node database-maintenance.js health
```

### 3. 定期数据清理
建议每月清理旧数据：
```bash
# 每月1号清理90天前的数据
0 3 1 * * cd /path/to/scripts && node database-maintenance.js cleanup-old 90 --no-dry-run
```

### 4. 性能监控
定期查看用户活动和系统使用情况：
```bash
# 每周生成用户活动报告
node user-profile-manager.js stats > weekly-user-stats.txt
node chat-session-analyzer.js analyze > weekly-chat-analysis.txt
```

## ⚠️ 注意事项

### 安全提醒
1. **备份重要性**：在执行任何清理或维护操作前，请确保已创建数据库备份
2. **试运行模式**：首次使用清理功能时，请使用试运行模式查看影响范围
3. **权限控制**：确保脚本运行用户具有适当的数据库权限
4. **密码安全**：避免在命令行中直接暴露数据库密码

### 性能考虑
1. **大数据量**：处理大量数据时，建议使用分页和限制功能
2. **并发访问**：避免在高并发时期运行维护脚本
3. **资源占用**：备份和优化操作可能占用较多系统资源

### 兼容性
- **Node.js版本**：建议使用Node.js 14+
- **PostgreSQL版本**：支持PostgreSQL 10+
- **操作系统**：支持Linux、macOS、Windows

## 📞 技术支持

如果在使用过程中遇到问题，请检查：

1. **数据库连接**：确认数据库服务正常运行
2. **权限设置**：确认用户具有必要的数据库权限
3. **依赖安装**：确认所有依赖包已正确安装
4. **环境变量**：确认数据库连接参数正确设置

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 完整的用户管理功能
- ✅ 会话分析和统计
- ✅ 数据库维护工具
- ✅ 多格式数据导出
- ✅ 安全的数据清理
- ✅ 健康检查和优化

---

**恋语AI数据库管理脚本集合** - 让数据库管理变得简单高效！