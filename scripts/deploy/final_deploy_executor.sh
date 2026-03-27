#!/bin/bash

# 恋语AI最终部署执行器
# 一键完成从本地到服务器的完整部署流程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

log_highlight() {
    echo -e "${CYAN}[HIGHLIGHT]${NC} $1"
}

# 显示欢迎信息
show_welcome() {
    clear
    echo -e "${CYAN}"
    echo "=========================================="
    echo "     恋语AI最终部署执行器 v2.0.0"
    echo "=========================================="
    echo -e "${NC}"
    echo
    echo "🎯 部署目标：完整的恋语AI生产环境"
    echo "🔧 适用环境：CentOS 7 + 宝塔面板"
    echo "⚡ 部署方式：自动化 + 手动配置"
    echo
}

# 检查本地环境
check_local_environment() {
    log_step "检查本地环境"
    
    # 检查必要文件
    local required_files=(
        "index.html"
        "js/app.js"
        "css/style.css"
        "backend/src/index.js"
        "package.json"
        "auto_baota_setup.sh"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "缺少必要文件: $file"
            return 1
        fi
    done
    
    # 检查命令
    local required_commands=("scp" "ssh" "tar")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "缺少必要命令: $cmd"
            return 1
        fi
    done
    
    log_success "本地环境检查通过"
}

# 获取服务器信息
get_server_info() {
    log_step "获取服务器信息"
    
    echo
    read -p "请输入服务器IP地址: " SERVER_IP
    read -p "请输入SSH端口 (默认22): " SSH_PORT
    SSH_PORT=${SSH_PORT:-22}
    read -p "请输入SSH用户名 (默认root): " SSH_USER
    SSH_USER=${SSH_USER:-root}
    
    echo
    log_info "服务器信息确认:"
    echo "  IP地址: $SERVER_IP"
    echo "  SSH端口: $SSH_PORT"
    echo "  用户名: $SSH_USER"
    echo
    
    read -p "信息是否正确? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        log_warning "请重新输入服务器信息"
        get_server_info
    fi
}

# 测试服务器连接
test_server_connection() {
    log_step "测试服务器连接"
    
    if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SERVER_IP" "echo 'Connection test successful'" &>/dev/null; then
        log_success "服务器连接测试成功"
    else
        log_error "无法连接到服务器，请检查:"
        echo "  1. IP地址和端口是否正确"
        echo "  2. SSH密钥是否已配置"
        echo "  3. 服务器防火墙设置"
        exit 1
    fi
}

# 创建部署包
create_deployment_package() {
    log_step "创建部署包"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local package_name="lianyu_ai_deploy_${timestamp}.tar.gz"
    
    log_info "正在打包项目文件..."
    
    # 创建临时目录
    local temp_dir="/tmp/lianyu_ai_deploy_$timestamp"
    mkdir -p "$temp_dir"
    
    # 复制项目文件
    cp -r . "$temp_dir/" 2>/dev/null || {
        # 如果直接复制失败，逐个复制重要文件
        mkdir -p "$temp_dir/js" "$temp_dir/css" "$temp_dir/backend/src" "$temp_dir/api"
        
        # 复制前端文件
        cp index.html "$temp_dir/" 2>/dev/null || true
        cp manifest.json "$temp_dir/" 2>/dev/null || true
        cp js/*.js "$temp_dir/js/" 2>/dev/null || true
        cp css/*.css "$temp_dir/css/" 2>/dev/null || true
        
        # 复制后端文件
        cp -r backend/* "$temp_dir/backend/" 2>/dev/null || true
        
        # 复制API文件
        cp api/*.js "$temp_dir/api/" 2>/dev/null || true
        
        # 复制配置文件
        cp package.json "$temp_dir/" 2>/dev/null || true
        cp .env.example "$temp_dir/" 2>/dev/null || true
        
        # 复制部署脚本
        cp auto_baota_setup.sh "$temp_dir/" 2>/dev/null || true
        cp manual_deploy.sh "$temp_dir/" 2>/dev/null || true
    }
    
    # 清理不需要的文件
    rm -rf "$temp_dir/.git" "$temp_dir/node_modules" "$temp_dir/.DS_Store" 2>/dev/null || true
    find "$temp_dir" -name "*.log" -delete 2>/dev/null || true
    
    # 创建压缩包
    cd /tmp
    tar -czf "$package_name" "lianyu_ai_deploy_$timestamp"
    
    # 移动到当前目录
    mv "$package_name" "$(pwd)/"
    
    # 清理临时目录
    rm -rf "$temp_dir"
    
    PACKAGE_FILE="$package_name"
    log_success "部署包创建完成: $PACKAGE_FILE"
}

# 上传部署包
upload_deployment_package() {
    log_step "上传部署包到服务器"
    
    log_info "正在上传 $PACKAGE_FILE..."
    
    if scp -P "$SSH_PORT" "$PACKAGE_FILE" "$SSH_USER@$SERVER_IP:/root/"; then
        log_success "部署包上传成功"
    else
        log_error "部署包上传失败"
        exit 1
    fi
}

# 执行服务器端部署
execute_server_deployment() {
    log_step "执行服务器端部署"
    
    log_info "连接服务器并执行部署脚本..."
    
    # 创建部署脚本
    local deploy_script="/tmp/server_deploy_$(date +%s).sh"
    
    cat > "$deploy_script" << EOF
#!/bin/bash

set -e

echo "开始服务器端部署..."

# 解压部署包
cd /root
tar -xzf "$PACKAGE_FILE"
DEPLOY_DIR=\$(tar -tzf "$PACKAGE_FILE" | head -1 | cut -f1 -d"/")

echo "部署目录: \$DEPLOY_DIR"

# 执行自动化部署脚本
if [[ -f "\$DEPLOY_DIR/auto_baota_setup.sh" ]]; then
    echo "执行自动化部署脚本..."
    chmod +x "\$DEPLOY_DIR/auto_baota_setup.sh"
    bash "\$DEPLOY_DIR/auto_baota_setup.sh"
else
    echo "警告: 未找到自动化部署脚本"
fi

# 复制项目文件到网站目录
echo "复制项目文件..."
mkdir -p /www/wwwroot/lianyu_ai
cp -r "\$DEPLOY_DIR"/* /www/wwwroot/lianyu_ai/

# 设置权限
chown -R www:www /www/wwwroot/lianyu_ai
chmod -R 755 /www/wwwroot/lianyu_ai

echo "服务器端部署完成！"
EOF
    
    # 上传并执行部署脚本
    if scp -P "$SSH_PORT" "$deploy_script" "$SSH_USER@$SERVER_IP:/tmp/"; then
        ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_IP" "chmod +x /tmp/$(basename $deploy_script) && bash /tmp/$(basename $deploy_script)"
        log_success "服务器端部署执行完成"
    else
        log_error "部署脚本上传失败"
        exit 1
    fi
    
    # 清理本地临时文件
    rm -f "$deploy_script"
}

# 配置环境变量
configure_environment() {
    log_step "配置环境变量"
    
    echo
    log_highlight "请配置AI服务的API密钥:"
    echo
    
    read -p "OpenAI API Key (可选): " OPENAI_KEY
    read -p "Claude API Key (可选): " CLAUDE_KEY
    read -p "通义千问 API Key (可选): " QWEN_KEY
    
    if [[ -n "$OPENAI_KEY" ]] || [[ -n "$CLAUDE_KEY" ]] || [[ -n "$QWEN_KEY" ]]; then
        log_info "正在配置环境变量..."
        
        # 创建环境变量配置脚本
        local env_script="/tmp/configure_env_$(date +%s).sh"
        
        cat > "$env_script" << EOF
#!/bin/bash

# 配置环境变量
cd /www/wwwroot/lianyu_ai

# 复制环境变量模板
if [[ -f ".env.example" ]] && [[ ! -f "backend/.env" ]]; then
    cp .env.example backend/.env
fi

# 更新API密钥
if [[ -f "backend/.env" ]]; then
    [[ -n "$OPENAI_KEY" ]] && sed -i "s/your_openai_api_key_here/$OPENAI_KEY/g" backend/.env
    [[ -n "$CLAUDE_KEY" ]] && sed -i "s/your_claude_api_key_here/$CLAUDE_KEY/g" backend/.env
    [[ -n "$QWEN_KEY" ]] && sed -i "s/your_qwen_api_key_here/$QWEN_KEY/g" backend/.env
    
    echo "环境变量配置完成"
    chmod 600 backend/.env
else
    echo "警告: 环境变量文件不存在"
fi
EOF
        
        # 上传并执行环境变量配置
        if scp -P "$SSH_PORT" "$env_script" "$SSH_USER@$SERVER_IP:/tmp/"; then
            ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_IP" "chmod +x /tmp/$(basename $env_script) && bash /tmp/$(basename $env_script)"
            log_success "环境变量配置完成"
        else
            log_warning "环境变量配置失败，请手动配置"
        fi
        
        rm -f "$env_script"
    else
        log_warning "跳过API密钥配置，请稍后手动配置"
    fi
}

# 启动服务
start_services() {
    log_step "启动服务"
    
    log_info "正在启动PM2服务..."
    
    # 创建服务启动脚本
    local start_script="/tmp/start_services_$(date +%s).sh"
    
    cat > "$start_script" << 'EOF'
#!/bin/bash

cd /www/wwwroot/lianyu_ai

# 安装后端依赖
if [[ -f "backend/package.json" ]]; then
    echo "安装后端依赖..."
    cd backend
    npm install --production
    cd ..
fi

# 启动PM2服务
if command -v pm2 &> /dev/null; then
    echo "启动PM2服务..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    echo "PM2服务启动完成"
else
    echo "警告: PM2未安装，请手动启动服务"
fi

# 检查服务状态
echo "检查服务状态..."
pm2 status || echo "PM2状态检查失败"
netstat -tlnp | grep :3000 || echo "端口3000未监听"
EOF
    
    # 上传并执行服务启动脚本
    if scp -P "$SSH_PORT" "$start_script" "$SSH_USER@$SERVER_IP:/tmp/"; then
        ssh -p "$SSH_PORT" "$SSH_USER@$SERVER_IP" "chmod +x /tmp/$(basename $start_script) && bash /tmp/$(basename $start_script)"
        log_success "服务启动完成"
    else
        log_warning "服务启动脚本执行失败"
    fi
    
    rm -f "$start_script"
}

# 验证部署
verify_deployment() {
    log_step "验证部署结果"
    
    log_info "正在验证部署..."
    
    # 测试前端页面
    if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP" | grep -q "200\|301\|302"; then
        log_success "前端页面访问正常"
    else
        log_warning "前端页面访问异常，请检查Nginx配置"
    fi
    
    # 测试API接口
    if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP:3000" | grep -q "200\|404"; then
        log_success "后端服务运行正常"
    else
        log_warning "后端服务异常，请检查PM2状态"
    fi
}

# 显示部署结果
show_deployment_result() {
    echo
    echo -e "${CYAN}"
    echo "=========================================="
    echo "           部署完成！"
    echo "=========================================="
    echo -e "${NC}"
    echo
    
    log_success "恋语AI部署成功完成！"
    echo
    
    log_highlight "访问地址:"
    echo "  🌐 主站: http://$SERVER_IP"
    echo "  🔧 宝塔面板: http://$SERVER_IP:8888"
    echo "  🚀 API服务: http://$SERVER_IP:3000"
    echo
    
    log_highlight "下一步操作:"
    echo "  1. 访问宝塔面板创建网站"
    echo "  2. 配置反向代理: /api -> http://127.0.0.1:3000"
    echo "  3. 申请SSL证书（推荐）"
    echo "  4. 测试AI对话功能"
    echo
    
    log_highlight "重要文件位置:"
    echo "  📁 项目目录: /www/wwwroot/lianyu_ai"
    echo "  ⚙️  环境变量: /www/wwwroot/lianyu_ai/backend/.env"
    echo "  📊 PM2配置: /www/wwwroot/lianyu_ai/ecosystem.config.js"
    echo "  📝 日志目录: /www/wwwroot/lianyu_ai/logs"
    echo
    
    log_highlight "常用命令:"
    echo "  pm2 status                    # 查看服务状态"
    echo "  pm2 logs lianyu-ai-backend    # 查看服务日志"
    echo "  pm2 restart lianyu-ai-backend # 重启服务"
    echo "  bt default                    # 查看宝塔面板信息"
    echo
    
    if [[ -f "$PACKAGE_FILE" ]]; then
        log_info "清理本地部署包: $PACKAGE_FILE"
        rm -f "$PACKAGE_FILE"
    fi
    
    echo -e "${GREEN}🎉 恋语AI部署完成！享受AI对话的乐趣吧！${NC}"
    echo
}

# 主函数
main() {
    show_welcome
    
    # 检查本地环境
    check_local_environment
    
    # 获取服务器信息
    get_server_info
    
    # 测试服务器连接
    test_server_connection
    
    # 创建部署包
    create_deployment_package
    
    # 上传部署包
    upload_deployment_package
    
    # 执行服务器端部署
    execute_server_deployment
    
    # 配置环境变量
    configure_environment
    
    # 启动服务
    start_services
    
    # 验证部署
    verify_deployment
    
    # 显示部署结果
    show_deployment_result
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"