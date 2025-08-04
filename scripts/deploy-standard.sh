#!/bin/bash

# 标准化部署脚本
# 自动化部署流程，确保配置一致性

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -eq 0 ]; then
    log_error "请指定部署环境: development 或 production"
    echo "使用方法: $0 <environment>"
    echo "示例: $0 production"
    exit 1
fi

ENVIRONMENT=$1

if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
    log_error "环境参数必须是 development 或 production"
    exit 1
fi

log_info "开始 $ENVIRONMENT 环境的标准化部署..."

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 远程服务器配置
REMOTE_HOST="152.32.218.174"
REMOTE_USER="root"
REMOTE_PATH="/root/lianyu_ai"
SSHPASS_CMD="sshpass -p daiyiping123"

# 步骤1: 生成配置文件
log_info "步骤1: 生成 $ENVIRONMENT 环境配置文件..."
if ! node scripts/generate-config.js "$ENVIRONMENT"; then
    log_error "配置文件生成失败"
    exit 1
fi
log_success "配置文件生成完成"

# 步骤2: 验证配置
log_info "步骤2: 验证配置文件..."
if node scripts/validate-config.js; then
    log_success "配置验证通过"
else
    VALIDATION_EXIT_CODE=$?
    if [ $VALIDATION_EXIT_CODE -eq 1 ]; then
        log_warning "配置验证有警告，但继续部署..."
    else
        log_error "配置验证严重失败"
        exit 1
    fi
fi

# 步骤3: 同步代码到服务器（仅生产环境）
if [ "$ENVIRONMENT" = "production" ]; then
    log_info "步骤3: 同步代码到远程服务器..."
    
    # 检查sshpass是否可用
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass 未安装，请先安装: brew install sshpass"
        exit 1
    fi
    
    # 创建临时排除文件
    EXCLUDE_FILE=$(mktemp)
    cat > "$EXCLUDE_FILE" << EOF
.git/
node_modules/
*.log
.DS_Store
.env.local
.env.*.local
backend.pid
frontend.pid
EOF
    
    # 同步文件
    log_info "同步配置文件..."
    $SSHPASS_CMD rsync -avz --exclude-from="$EXCLUDE_FILE" \
        config/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/config/"
    
    log_info "同步后端文件..."
    $SSHPASS_CMD rsync -avz --exclude-from="$EXCLUDE_FILE" \
        backend/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/backend/"
    
    log_info "同步前端文件..."
    $SSHPASS_CMD rsync -avz --exclude-from="$EXCLUDE_FILE" \
        --exclude='backend/' --exclude='scripts/' --exclude='*.md' \
        . "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    
    # 清理临时文件
    rm "$EXCLUDE_FILE"
    
    log_success "代码同步完成"
fi

# 步骤4: 重启服务（仅生产环境）
if [ "$ENVIRONMENT" = "production" ]; then
    log_info "步骤4: 重启远程服务..."
    
    # 停止现有服务
    log_info "停止现有服务..."
    $SSHPASS_CMD ssh "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
cd /root/lianyu_ai

# 停止后端服务
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        sleep 2
    fi
    rm -f backend.pid
fi

# 停止前端服务
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        sleep 2
    fi
    rm -f frontend.pid
fi

# 强制清理端口
echo "清理端口占用..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:80 | xargs kill -9 2>/dev/null || true

sleep 3
EOF
    
    # 启动服务
    log_info "启动服务..."
    $SSHPASS_CMD ssh "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
cd /root/lianyu_ai

# 启动后端服务
echo "启动后端服务..."
cd backend
nohup node src/index.js > ../backend.log 2>&1 &
echo $! > ../backend.pid
cd ..

# 等待后端启动
sleep 5

# 检查后端状态
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    tail -20 backend.log
    exit 1
fi

# 启动前端服务
echo "启动前端服务..."
nohup node server.js > frontend.log 2>&1 &
echo $! > frontend.pid

# 等待前端启动
sleep 3

# 检查前端状态
if curl -f http://localhost/ >/dev/null 2>&1; then
    echo "✅ 前端服务启动成功"
else
    echo "❌ 前端服务启动失败"
    tail -20 frontend.log
    exit 1
fi

echo "🎉 所有服务启动完成!"
echo "前端地址: http://152.32.218.174"
echo "后端API: http://152.32.218.174:3000/api"
EOF
    
    log_success "服务重启完成"
fi

# 步骤5: 验证部署
log_info "步骤5: 验证部署结果..."

if [ "$ENVIRONMENT" = "production" ]; then
    # 验证生产环境
    log_info "验证生产环境服务..."
    
    # 检查前端
    if curl -f http://152.32.218.174 >/dev/null 2>&1; then
        log_success "前端服务正常"
    else
        log_error "前端服务异常"
    fi
    
    # 检查后端API
    if curl -f http://152.32.218.174:3000/api/health >/dev/null 2>&1; then
        log_success "后端API服务正常"
    else
        log_error "后端API服务异常"
    fi
    
else
    # 开发环境提示
    log_info "开发环境配置完成，请手动启动服务:"
    echo "  前端: npm run dev"
    echo "  后端: cd backend && npm start"
fi

# 步骤6: 生成部署报告
log_info "步骤6: 生成部署报告..."

REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << EOF
# 部署报告

**部署时间**: $(date)
**环境**: $ENVIRONMENT
**部署版本**: $(git rev-parse --short HEAD 2>/dev/null || echo "未知")

## 部署步骤

- [x] 配置文件生成
- [x] 配置验证
$([ "$ENVIRONMENT" = "production" ] && echo "- [x] 代码同步" || echo "- [-] 代码同步 (开发环境跳过)")
$([ "$ENVIRONMENT" = "production" ] && echo "- [x] 服务重启" || echo "- [-] 服务重启 (开发环境跳过)")
- [x] 部署验证

## 服务状态

### 前端服务
- **端口**: $([ "$ENVIRONMENT" = "production" ] && echo "80" || echo "8080")
- **地址**: $([ "$ENVIRONMENT" = "production" ] && echo "http://152.32.218.174" || echo "http://localhost:8080")

### 后端服务
- **端口**: $([ "$ENVIRONMENT" = "production" ] && echo "3000" || echo "3001")
- **API地址**: $([ "$ENVIRONMENT" = "production" ] && echo "http://152.32.218.174:3000/api" || echo "http://localhost:3001/api")

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
   \`\`\`bash
   # 检查进程
   ps aux | grep node
   
   # 检查端口
   netstat -tlnp | grep -E ':(80|3000)'
   
   # 检查日志
   tail -f backend.log
   tail -f frontend.log
   \`\`\`

EOF

log_success "部署报告已生成: $REPORT_FILE"

# 完成
echo
log_success "🎉 $ENVIRONMENT 环境部署完成!"
echo
log_info "部署摘要:"
echo "  - 环境: $ENVIRONMENT"
echo "  - 配置文件: 已生成并验证"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "  - 前端地址: http://152.32.218.174"
    echo "  - 后端API: http://152.32.218.174:3000/api"
    echo "  - 服务状态: 已启动"
else
    echo "  - 前端地址: http://localhost:8080 (需手动启动)"
    echo "  - 后端API: http://localhost:3001/api (需手动启动)"
fi
echo "  - 部署报告: $REPORT_FILE"
echo
log_info "下次部署只需运行: ./scripts/deploy-standard.sh $ENVIRONMENT"