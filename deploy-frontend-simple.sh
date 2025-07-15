#!/bin/bash

# =============================================================================
# 简化前端部署脚本（无需sshpass依赖）
# 用途：将前端代码部署到远程服务器
# =============================================================================

set -e

# 配置变量
REMOTE_HOST="152.32.218.174"
REMOTE_USER="root"
REMOTE_PATH="/var/www/lianyu_ai"
LOCAL_PATH="$(pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查本地前端文件
check_frontend_files() {
    log_info "检查本地前端文件..."
    
    local required_files=(
        "index.html"
        "js/app.js"
        "css/style.css"
        "manifest.json"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$LOCAL_PATH/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "缺少以下前端文件:"
        printf '%s\n' "${missing_files[@]}"
        return 1
    fi
    
    log_success "前端文件检查完成"
}

# 备份远程前端文件
backup_remote_frontend() {
    log_info "备份远程前端文件..."
    
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        if [[ -f index.html ]]; then
            tar -czf frontend_backup_\$(date +%Y%m%d_%H%M%S).tar.gz \
                index.html manifest.json service-worker.js js/ css/ api/ config/ adapters/ scripts/ 2>/dev/null || true
            echo '远程前端文件已备份'
        else
            echo '远程无前端文件，跳过备份'
        fi
    "
    
    log_success "远程前端备份完成"
}

# 同步前端核心文件
sync_core_files() {
    log_info "同步前端核心文件..."
    
    # 同步HTML文件
    if [[ -f "index.html" ]]; then
        scp "index.html" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
        log_success "index.html 已同步"
    fi
    
    # 同步manifest和service worker
    if [[ -f "manifest.json" ]]; then
        scp "manifest.json" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
        log_success "manifest.json 已同步"
    fi
    
    if [[ -f "service-worker.js" ]]; then
        scp "service-worker.js" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
        log_success "service-worker.js 已同步"
    fi
}

# 同步目录
sync_directories() {
    log_info "同步前端目录..."
    
    local directories=("js" "css" "api" "config" "adapters")
    
    for dir in "${directories[@]}"; do
        if [[ -d "$dir" ]]; then
            scp -r "$dir" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
            log_success "$dir/ 目录已同步"
        else
            log_warning "$dir/ 目录不存在，跳过"
        fi
    done
}

# 同步环境配置
sync_env_config() {
    log_info "同步环境配置文件..."
    
    if [[ -f ".env.production" ]]; then
        scp ".env.production" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/.env"
        log_success "生产环境配置已同步"
    else
        log_warning "生产环境配置文件不存在"
    fi
}

# 设置远程文件权限
set_remote_permissions() {
    log_info "设置远程文件权限..."
    
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        find . -type f -name '*.html' -exec chmod 644 {} \; 2>/dev/null || true
        find . -type f -name '*.js' -exec chmod 644 {} \; 2>/dev/null || true
        find . -type f -name '*.css' -exec chmod 644 {} \; 2>/dev/null || true
        find . -type f -name '*.json' -exec chmod 644 {} \; 2>/dev/null || true
        find . -type d -exec chmod 755 {} \; 2>/dev/null || true
        echo '文件权限设置完成'
    "
    
    log_success "远程文件权限设置完成"
}

# 验证前端部署
verify_deployment() {
    log_info "验证前端部署..."
    
    # 检查远程文件
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        echo '=== 前端文件检查 ==='
        ls -la index.html manifest.json 2>/dev/null || echo '部分核心文件缺失'
        echo '=== 目录结构检查 ==='
        ls -la js/ css/ api/ 2>/dev/null || echo '部分目录缺失'
    "
    
    # 测试前端访问
    log_info "测试前端页面访问..."
    
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$REMOTE_HOST:3001/" 2>/dev/null || echo "000")
    
    if [[ "$http_code" =~ ^(200|301|302)$ ]]; then
        log_success "前端页面访问正常 (HTTP $http_code)"
    else
        log_warning "前端页面访问异常 (HTTP $http_code)"
    fi
    
    # 测试API访问
    local api_code
    api_code=$(curl -s -o /dev/null -w "%{http_code}" "http://$REMOTE_HOST:3001/api/health" 2>/dev/null || echo "000")
    
    if [[ "$api_code" == "200" ]]; then
        log_success "API接口访问正常 (HTTP $api_code)"
    else
        log_warning "API接口访问异常 (HTTP $api_code)"
    fi
}

# 生成部署报告
generate_report() {
    log_info "生成部署报告..."
    
    local report_file="frontend_deployment_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
=== 前端部署报告 ===
部署时间: $(date)
本地路径: $LOCAL_PATH
远程服务器: $REMOTE_HOST:$REMOTE_PATH

=== 部署状态 ===
前端页面: $(curl -s -o /dev/null -w "%{http_code}" "http://$REMOTE_HOST:3001/" 2>/dev/null || echo "连接失败")
API接口: $(curl -s -o /dev/null -w "%{http_code}" "http://$REMOTE_HOST:3001/api/health" 2>/dev/null || echo "连接失败")

=== 访问地址 ===
前端: http://$REMOTE_HOST:3001/
API: http://$REMOTE_HOST:3001/api/
健康检查: http://$REMOTE_HOST:3001/api/health

=== 后续建议 ===
1. 配置域名和SSL证书
2. 设置Nginx反向代理
3. 建立监控和日志系统
4. 定期备份重要文件
EOF

    log_success "部署报告已生成: $report_file"
    cat "$report_file"
}

# 完整部署流程
full_deployment() {
    log_info "开始前端完整部署..."
    
    check_frontend_files
    backup_remote_frontend
    sync_core_files
    sync_directories
    sync_env_config
    set_remote_permissions
    verify_deployment
    generate_report
    
    echo ""
    echo "🎉 前端部署完成！"
    echo "📱 访问地址: http://$REMOTE_HOST:3001/"
    echo "🔗 API地址: http://$REMOTE_HOST:3001/api/"
}

# 快速同步
quick_sync() {
    log_info "快速同步前端文件..."
    sync_core_files
    sync_directories
    log_success "快速同步完成"
}

# 显示帮助
show_help() {
    echo "简化前端部署脚本"
    echo ""
    echo "用法:"
    echo "  $0 --full              # 完整部署流程"
    echo "  $0 --sync              # 快速同步文件"
    echo "  $0 --verify            # 验证部署状态"
    echo "  $0 --report            # 生成部署报告"
    echo "  $0 --help              # 显示帮助"
    echo ""
    echo "注意: 请确保已配置SSH密钥认证到远程服务器"
}

# 参数处理
case "${1:-}" in
    --full)
        full_deployment
        ;;
    --sync)
        quick_sync
        ;;
    --verify)
        verify_deployment
        ;;
    --report)
        generate_report
        ;;
    --help|-h)
        show_help
        ;;
    "")
        log_info "请指定操作参数，使用 --help 查看帮助"
        show_help
        ;;
    *)
        log_error "未知参数: $1"
        show_help
        exit 1
        ;;
esac