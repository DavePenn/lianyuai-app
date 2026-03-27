#!/bin/bash

# Google OAuth 部署脚本
# 用于将Google OAuth配置部署到远程服务器

set -e  # 遇到错误立即退出

# 配置变量
REMOTE_HOST="152.32.218.174"
REMOTE_USER="root"
REMOTE_PASSWORD="daiyiping123"
REMOTE_PROJECT_PATH="/var/www/lianyu_ai"
REMOTE_BACKEND_PATH="/var/www/lianyu_ai/backend"

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

# 检查必要工具
check_dependencies() {
    log_info "检查必要工具..."
    
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass 未安装，请先安装: brew install sshpass"
        exit 1
    fi
    
    if ! command -v rsync &> /dev/null; then
        log_error "rsync 未安装，请先安装: brew install rsync"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 检查本地配置
check_local_config() {
    log_info "检查本地配置文件..."
    
    local files_to_check=(
        "config/env-loader.js"
        "config/oauth-config.js"
        "GOOGLE_OAUTH_SETUP.md"
        "test-google-oauth.html"
        "backend/.env.example"
        "backend/.env.production"
    )
    
    for file in "${files_to_check[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "文件不存在: $file"
            exit 1
        fi
    done
    
    log_success "本地配置文件检查完成"
}

# 备份远程配置
backup_remote_config() {
    log_info "备份远程配置..."
    
    local backup_dir="/tmp/lianyu_backup_$(date +%Y%m%d_%H%M%S)"
    
    sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "
        mkdir -p $backup_dir
        if [[ -f $REMOTE_PROJECT_PATH/config/oauth-config.js ]]; then
            cp $REMOTE_PROJECT_PATH/config/oauth-config.js $backup_dir/
        fi
        if [[ -f $REMOTE_BACKEND_PATH/.env ]]; then
            cp $REMOTE_BACKEND_PATH/.env $backup_dir/
        fi
        echo '备份已保存到: $backup_dir'
    "
    
    log_success "远程配置备份完成"
}

# 部署前端配置
deploy_frontend_config() {
    log_info "部署前端配置文件..."
    
    # 上传配置文件
    sshpass -p "$REMOTE_PASSWORD" rsync -avz --progress \
        config/env-loader.js \
        config/oauth-config.js \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_PATH/config/"
    
    # 上传测试页面
    sshpass -p "$REMOTE_PASSWORD" rsync -avz --progress \
        test-google-oauth.html \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_PATH/"
    
    # 上传文档
    sshpass -p "$REMOTE_PASSWORD" rsync -avz --progress \
        GOOGLE_OAUTH_SETUP.md \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_PATH/"
    
    log_success "前端配置部署完成"
}

# 部署后端配置
deploy_backend_config() {
    log_info "部署后端配置文件..."
    
    # 上传后端环境配置模板
    sshpass -p "$REMOTE_PASSWORD" rsync -avz --progress \
        backend/.env.example \
        backend/.env.production \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_BACKEND_PATH/"
    
    # 检查并创建生产环境配置
    sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_BACKEND_PATH
        
        # 如果没有.env文件，从.env.production复制
        if [[ ! -f .env ]]; then
            echo '创建生产环境配置文件...'
            cp .env.production .env
            echo '请记得更新.env文件中的Google OAuth配置！'
        else
            echo '.env文件已存在，请手动更新Google OAuth配置'
        fi
    "
    
    log_success "后端配置部署完成"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    
    sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_BACKEND_PATH
        
        # 重启后端服务
        if command -v pm2 &> /dev/null; then
            echo '使用PM2重启后端服务...'
            pm2 restart lianyu-backend || pm2 start src/index.js --name lianyu-backend
            pm2 status
        else
            echo 'PM2未安装，请手动重启后端服务'
        fi
    "
    
    log_success "服务重启完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署结果..."
    
    # 检查文件是否存在
    sshpass -p "$REMOTE_PASSWORD" ssh "$REMOTE_USER@$REMOTE_HOST" "
        echo '检查部署的文件...'
        
        files_to_check=(
            '$REMOTE_PROJECT_PATH/config/env-loader.js'
            '$REMOTE_PROJECT_PATH/config/oauth-config.js'
            '$REMOTE_PROJECT_PATH/test-google-oauth.html'
            '$REMOTE_PROJECT_PATH/GOOGLE_OAUTH_SETUP.md'
            '$REMOTE_BACKEND_PATH/.env.example'
            '$REMOTE_BACKEND_PATH/.env.production'
        )
        
        for file in \"\${files_to_check[@]}\"; do
            if [[ -f \"\$file\" ]]; then
                echo \"✅ \$file\"
            else
                echo \"❌ \$file\"
            fi
        done
        
        echo ''
        echo '检查服务状态...'
        if command -v pm2 &> /dev/null; then
            pm2 list
        fi
        
        echo ''
        echo '检查端口监听...'
        netstat -tlnp | grep :3000 || echo '后端服务未在3000端口监听'
        netstat -tlnp | grep :3001 || echo '前端服务未在3001端口监听'
    "
    
    log_success "部署验证完成"
}

# 显示后续步骤
show_next_steps() {
    log_info "部署完成！后续步骤："
    
    echo ""
    echo "📋 配置Google OAuth:"
    echo "   1. 访问远程服务器: http://$REMOTE_HOST:3001/GOOGLE_OAUTH_SETUP.md"
    echo "   2. 按照文档获取Google客户端ID"
    echo "   3. 更新远程服务器的配置文件:"
    echo "      - $REMOTE_PROJECT_PATH/config/env-loader.js"
    echo "      - $REMOTE_BACKEND_PATH/.env"
    echo ""
    echo "🧪 测试Google OAuth:"
    echo "   访问测试页面: http://$REMOTE_HOST:3001/test-google-oauth.html"
    echo ""
    echo "🔧 手动配置命令:"
    echo "   ssh root@$REMOTE_HOST"
    echo "   cd $REMOTE_BACKEND_PATH"
    echo "   nano .env  # 编辑环境变量"
    echo "   pm2 restart lianyu-backend  # 重启后端服务"
    echo ""
}

# 主函数
main() {
    echo "🚀 开始部署Google OAuth配置到远程服务器..."
    echo ""
    
    check_dependencies
    check_local_config
    backup_remote_config
    deploy_frontend_config
    deploy_backend_config
    restart_services
    verify_deployment
    
    echo ""
    log_success "Google OAuth配置部署完成！"
    echo ""
    
    show_next_steps
}

# 执行主函数
main "$@"