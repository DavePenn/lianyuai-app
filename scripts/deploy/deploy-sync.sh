#!/bin/bash

# =============================================================================
# Lianyu AI 项目部署同步脚本
# 用途：确保本地开发环境与远程生产环境代码一致
# =============================================================================

set -e  # 遇到错误立即退出

# 配置变量
REMOTE_HOST="152.32.218.174"
REMOTE_USER="root"
REMOTE_PATH="/var/www/lianyu_ai"
LOCAL_PATH="$(pwd)"
BACKUP_DIR="/tmp/lianyu_ai_backup_$(date +%Y%m%d_%H%M%S)"

# 颜色输出
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

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v rsync &> /dev/null; then
        log_error "rsync 未安装，请先安装: brew install rsync"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        log_error "ssh 未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 备份远程文件
backup_remote() {
    log_info "备份远程文件到 $BACKUP_DIR..."
    
    ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $BACKUP_DIR"
    ssh $REMOTE_USER@$REMOTE_HOST "cp -r $REMOTE_PATH $BACKUP_DIR/"
    
    log_success "远程文件已备份"
}

# 同步代码到远程服务器
sync_to_remote() {
    log_info "同步本地代码到远程服务器..."
    
    # 排除不需要同步的文件和目录
    rsync -avz --delete \
        --exclude 'node_modules/' \
        --exclude '.git/' \
        --exclude '.env' \
        --exclude '*.log' \
        --exclude 'debug-network.html' \
        --exclude 'test-backend.html' \
        --exclude 'android/' \
        --exclude 'ios/' \
        --exclude 'miniprogram/' \
        --exclude '.github/' \
        "$LOCAL_PATH/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    
    log_success "代码同步完成"
}

# 安装依赖
install_dependencies() {
    log_info "安装远程服务器依赖..."
    
    ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH/backend && npm install --production"
    
    log_success "依赖安装完成"
}

# 重启服务
restart_service() {
    log_info "重启远程服务..."
    
    # 停止现有进程
    ssh $REMOTE_USER@$REMOTE_HOST "pkill -f 'node src/index.js' || true"
    
    # 等待进程完全停止
    sleep 2
    
    # 启动新进程
    ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH/backend && nohup PORT=3001 node src/index.js > server.log 2>&1 &"
    
    # 等待服务启动
    sleep 3
    
    # 检查服务状态
    if ssh $REMOTE_USER@$REMOTE_HOST "curl -s http://localhost:3001/api/health" > /dev/null; then
        log_success "服务重启成功"
    else
        log_error "服务启动失败，请检查日志"
        ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH/backend && tail -20 server.log"
        exit 1
    fi
}

# 验证部署
validate_deployment() {
    log_info "验证部署..."
    
    # 检查API健康状态
    if curl -s "http://$REMOTE_HOST:3001/api/health" | grep -q "healthy\|UP"; then
        log_success "API服务正常"
    else
        log_error "API服务异常"
        exit 1
    fi
    
    # 检查前端文件
    if ssh $REMOTE_USER@$REMOTE_HOST "test -f $REMOTE_PATH/index.html"; then
        log_success "前端文件部署成功"
    else
        log_error "前端文件缺失"
        exit 1
    fi
    
    log_success "部署验证完成"
}

# 显示部署信息
show_deployment_info() {
    log_info "部署信息:"
    echo "  - 前端访问地址: http://$REMOTE_HOST:3001"
    echo "  - API地址: http://$REMOTE_HOST:3001/api"
    echo "  - 健康检查: http://$REMOTE_HOST:3001/api/health"
    echo "  - 服务器日志: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH/backend && tail -f server.log'"
}

# 主函数
main() {
    log_info "开始部署 Lianyu AI 项目..."
    
    check_dependencies
    backup_remote
    sync_to_remote
    install_dependencies
    restart_service
    validate_deployment
    show_deployment_info
    
    log_success "🎉 部署完成！"
}

# 帮助信息
show_help() {
    echo "Lianyu AI 部署同步脚本"
    echo ""
    echo "用法:"
    echo "  $0                    # 完整部署"
    echo "  $0 --sync-only        # 仅同步代码"
    echo "  $0 --restart-only     # 仅重启服务"
    echo "  $0 --validate-only    # 仅验证部署"
    echo "  $0 --help             # 显示帮助"
    echo ""
    echo "环境要求:"
    echo "  - rsync"
    echo "  - ssh (配置免密登录)"
    echo "  - curl"
}

# 参数处理
case "${1:-}" in
    --sync-only)
        check_dependencies
        backup_remote
        sync_to_remote
        ;;
    --restart-only)
        restart_service
        ;;
    --validate-only)
        validate_deployment
        ;;
    --help|-h)
        show_help
        ;;
    "")
        main
        ;;
    *)
        log_error "未知参数: $1"
        show_help
        exit 1
        ;;
esac