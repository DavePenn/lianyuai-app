# 部署报告

**部署时间**: 2025年 8月 3日 星期日 14时04分08秒 CST
**环境**: production
**部署版本**: f09bf49

## 部署步骤

- [x] 配置文件生成
- [x] 配置验证
- [x] 代码同步
- [x] 服务重启
- [x] 部署验证

## 服务状态

### 前端服务
- **端口**: 80
- **地址**: http://152.32.218.174

### 后端服务
- **端口**: 3000
- **API地址**: http://152.32.218.174:3000/api

### 数据库
- **主机**: localhost
- **端口**: 3306
- **数据库**: lianyu_ai

## 配置文件

- config/app-config.json (主配置)
- config/env-loader.js (自动生成)
- config/app-config.js (自动生成)
- backend/.env (自动生成)

## 注意事项

1. 所有配置文件已自动生成，请勿手动修改
2. 如需修改配置，请编辑 config/app-config.json 后重新运行部署脚本
3. 生产环境服务已启动，可通过以下命令检查状态：
   ```bash
   # 检查进程
   ps aux | grep node
   
   # 检查端口
   netstat -tlnp | grep -E ':(80|3000)'
   
   # 检查日志
   tail -f backend.log
   tail -f frontend.log
   ```

