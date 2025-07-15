#!/bin/bash

# =============================================================================
# 前端部署脚本
# 用途：将前端代码部署到远程服务器，确保前后端完整部署
# =============================================================================

set -e

# 配置变量
REMOTE_HOST="152.32.218.174"
REMOTE_USER="root"
REMOTE_PATH="/var/www/lianyu_ai"
LOCAL_PATH="$(pwd)"
PASSWORD="daiyiping123"

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
        "service-worker.js"
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

# 创建前端文件列表
create_file_list() {
    log_info "创建前端文件列表..."
    
    cat > "$LOCAL_PATH/.frontend-files" << 'EOF'
index.html
manifest.json
service-worker.js
js/
css/
api/
config/
adapters/
scripts/
.env.production
EOF

    log_success "前端文件列表已创建"
}

# 备份远程前端文件
backup_remote_frontend() {
    log_info "备份远程前端文件..."
    
    sshpass -p "$PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "
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

# 同步前端文件到远程
sync_frontend_files() {
    log_info "同步前端文件到远程服务器..."
    
    # 使用rsync同步文件，排除不需要的文件
    sshpass -p "$PASSWORD" rsync -avz --delete \
        --exclude='node_modules/' \
        --exclude='backend/' \
        --exclude='android/' \
        --exclude='ios/' \
        --exclude='miniprogram/' \
        --exclude='.git/' \
        --exclude='.github/' \
        --exclude='*.log' \
        --exclude='*.tmp' \
        --exclude='.DS_Store' \
        --exclude='debug-network.html' \
        --exclude='test-backend.html' \
        --exclude='*.sh' \
        --exclude='.env.development' \
        --exclude='.env.example' \
        --exclude='*.md' \
        "$LOCAL_PATH/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    
    log_success "前端文件同步完成"
}

# 设置远程文件权限
set_remote_permissions() {
    log_info "设置远程文件权限..."
    
    sshpass -p "$PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        find . -type f -name '*.html' -exec chmod 644 {} \;
        find . -type f -name '*.js' -exec chmod 644 {} \;
        find . -type f -name '*.css' -exec chmod 644 {} \;
        find . -type f -name '*.json' -exec chmod 644 {} \;
        find . -type d -exec chmod 755 {} \;
        echo '文件权限设置完成'
    "
    
    log_success "远程文件权限设置完成"
}

# 验证前端部署
verify_frontend_deployment() {
    log_info "验证前端部署..."
    
    # 检查关键文件是否存在
    sshpass -p "$PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        echo '=== 检查前端文件 ==='
        ls -la index.html manifest.json service-worker.js 2>/dev/null || echo '部分文件缺失'
        echo '=== 检查目录结构 ==='
        ls -la js/ css/ api/ 2>/dev/null || echo '部分目录缺失'
        echo '=== 文件大小统计 ==='
        du -sh . 2>/dev/null || echo '无法获取大小信息'
    "
    
    # 测试前端页面访问
    log_info "测试前端页面访问..."
    
    if curl -s -o /dev/null -w "%{http_code}" "http://$REMOTE_HOST:3001/" | grep -q "200\|301\|302"; then
        log_success "前端页面访问正常"
    else
        log_warning "前端页面访问可能存在问题"
    fi
}

# 创建Nginx配置（可选）
create_nginx_config() {
    log_info "创建Nginx配置模板..."
    
    cat > "$LOCAL_PATH/nginx.conf.template" << 'EOF'
server {
    listen 80;
    server_name 152.32.218.174;
    root /var/www/lianyu_ai;
    index index.html;
    
    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

    log_success "Nginx配置模板已创建: nginx.conf.template"
}

# 部署状态报告
generate_deployment_report() {
    log_info "生成部署状态报告..."
    
    local report_file="deployment_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
=== 前端部署报告 ===
部署时间: $(date)
本地路径: $LOCAL_PATH
远程路径: $REMOTE_HOST:$REMOTE_PATH

=== 部署文件清单 ===
$(cat .frontend-files 2>/dev/null || echo "文件清单不存在")

=== 远程文件状态 ===
$(sshpass -p "$PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_PATH && ls -la" 2>/dev/null || echo "无法获取远程文件状态")

=== 服务状态 ===
后端服务: $(curl -s -o /dev/null -w "%{http_code}" "http://$REMOTE_HOST:3001/api/health" 2>/dev/null || echo "无法连接")
前端页面: $(curl -s -o /dev/null -w "%{http_code}" "http://$REMOTE_HOST:3001/" 2>/dev/null || echo "无法连接")

=== 建议 ===
1. 定期备份前端文件
2. 监控服务状态
3. 配置Nginx反向代理（可选）
4. 设置SSL证书（推荐）
EOF

    log_success "部署报告已生成: $report_file"
}

# 完整部署流程
full_deployment() {
    log_info "开始完整前端部署流程..."
    
    check_frontend_files
    create_file_list
    backup_remote_frontend
    sync_frontend_files
    set_remote_permissions
    verify_frontend_deployment
    create_nginx_config
    generate_deployment_report
    
    log_success "前端部署流程完成！"
    echo ""
    echo "🎉 部署成功！"
    echo "📱 前端访问地址: http://$REMOTE_HOST:3001/"
    echo "🔗 API接口地址: http://$REMOTE_HOST:3001/api/"
    echo "📊 健康检查: http://$REMOTE_HOST:3001/api/health"
}

# 快速同步（仅同步文件）
quick_sync() {
    log_info "快速同步前端文件..."
    sync_frontend_files
    log_success "快速同步完成"
}

# 仅验证部署
verify_only() {
    log_info "仅验证当前部署状态..."
    verify_frontend_deployment
}

# 显示帮助信息
show_help() {
    echo "前端部署脚本"
    echo ""
    echo "用法:"
    echo "  $0 --full              # 完整部署流程"
    echo "  $0 --sync              # 快速同步文件"
    echo "  $0 --verify            # 验证部署状态"
    echo "  $0 --nginx             # 创建Nginx配置"
    echo "  $0 --report            # 生成部署报告"
    echo "  $0 --help              # 显示帮助"
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
        verify_only
        ;;
    --nginx)
        create_nginx_config
        ;;
    --report)
        generate_deployment_report
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