#!/bin/bash

# 恋语AI宝塔面板自动化部署脚本
# 适用于CentOS 7 + 宝塔面板环境

set -e

echo "=================================="
echo "  恋语AI宝塔面板自动化部署脚本"
echo "=================================="
echo

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi
}

# 检查宝塔面板是否安装
check_baota() {
    if ! command -v bt &> /dev/null; then
        log_error "未检测到宝塔面板，请先安装宝塔面板"
        exit 1
    fi
    log_success "宝塔面板已安装"
}

# 安装Node.js
install_nodejs() {
    log_info "开始安装Node.js..."
    
    # 检查是否已安装
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_warning "Node.js已安装，版本: $node_version"
        read -p "是否重新安装? (y/N): " reinstall
        if [[ ! $reinstall =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    
    # 方法1: 尝试通过宝塔命令安装
    log_info "尝试通过宝塔面板安装Node.js..."
    if bt install nodejs; then
        log_success "通过宝塔面板安装Node.js成功"
        return 0
    fi
    
    # 方法2: 使用NodeSource仓库
    log_info "尝试通过NodeSource仓库安装..."
    curl -fsSL https://rpm.nodesource.com/setup_16.x | bash - 2>/dev/null || {
        log_warning "NodeSource安装失败，尝试二进制安装"
    }
    
    if yum install -y nodejs 2>/dev/null; then
        log_success "通过NodeSource安装Node.js成功"
        return 0
    fi
    
    # 方法3: 二进制安装
    log_info "使用二进制包安装Node.js 16.20.2..."
    
    cd /opt
    wget -q https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-x64.tar.xz
    
    if [[ ! -f "node-v16.20.2-linux-x64.tar.xz" ]]; then
        log_error "Node.js下载失败"
        return 1
    fi
    
    tar -xf node-v16.20.2-linux-x64.tar.xz
    
    # 创建软链接
    ln -sf /opt/node-v16.20.2-linux-x64/bin/node /usr/local/bin/node
    ln -sf /opt/node-v16.20.2-linux-x64/bin/npm /usr/local/bin/npm
    ln -sf /opt/node-v16.20.2-linux-x64/bin/npx /usr/local/bin/npx
    
    # 验证安装
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        local node_version=$(node --version)
        local npm_version=$(npm --version)
        log_success "Node.js安装成功: $node_version"
        log_success "npm版本: $npm_version"
    else
        log_error "Node.js安装失败"
        return 1
    fi
}

# 安装PM2
install_pm2() {
    log_info "开始安装PM2..."
    
    # 检查Node.js
    if ! command -v npm &> /dev/null; then
        log_error "npm未找到，请先安装Node.js"
        return 1
    fi
    
    # 检查是否已安装PM2
    if command -v pm2 &> /dev/null; then
        local pm2_version=$(pm2 --version)
        log_warning "PM2已安装，版本: $pm2_version"
        return 0
    fi
    
    # 安装PM2
    npm install -g pm2
    
    # 创建软链接（如果需要）
    if [[ ! -f "/usr/local/bin/pm2" ]] && [[ -f "/opt/node-v16.20.2-linux-x64/bin/pm2" ]]; then
        ln -sf /opt/node-v16.20.2-linux-x64/bin/pm2 /usr/local/bin/pm2
    fi
    
    # 验证安装
    if command -v pm2 &> /dev/null; then
        local pm2_version=$(pm2 --version)
        log_success "PM2安装成功: $pm2_version"
        
        # 设置开机自启
        pm2 startup
        log_info "PM2开机自启已配置"
    else
        log_error "PM2安装失败"
        return 1
    fi
}

# 创建项目目录结构
setup_project_structure() {
    log_info "创建项目目录结构..."
    
    local project_dir="/www/wwwroot/lianyu_ai"
    
    # 创建主目录
    mkdir -p "$project_dir"
    mkdir -p "$project_dir/backend/src"
    mkdir -p "$project_dir/js"
    mkdir -p "$project_dir/css"
    mkdir -p "$project_dir/api"
    mkdir -p "$project_dir/logs"
    
    # 设置权限
    chown -R www:www "$project_dir"
    chmod -R 755 "$project_dir"
    
    log_success "项目目录结构创建完成: $project_dir"
}

# 创建PM2配置文件
create_pm2_config() {
    log_info "创建PM2配置文件..."
    
    local project_dir="/www/wwwroot/lianyu_ai"
    
    cat > "$project_dir/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'lianyu-ai-backend',
    script: './backend/src/index.js',
    cwd: '/www/wwwroot/lianyu_ai',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/app.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
    
    chown www:www "$project_dir/ecosystem.config.js"
    log_success "PM2配置文件创建完成"
}

# 创建环境变量模板
create_env_template() {
    log_info "创建环境变量模板..."
    
    local project_dir="/www/wwwroot/lianyu_ai"
    
    cat > "$project_dir/.env.example" << 'EOF'
# API配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Claude API配置
CLAUDE_API_KEY=your_claude_api_key_here
CLAUDE_BASE_URL=https://api.anthropic.com

# 通义千问配置
QWEN_API_KEY=your_qwen_api_key_here
QWEN_BASE_URL=https://dashscope.aliyuncs.com/api/v1

# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置（如果需要）
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=lianyu_ai
# DB_USER=root
# DB_PASS=password
EOF
    
    chown www:www "$project_dir/.env.example"
    log_success "环境变量模板创建完成"
}

# 创建Nginx配置模板
create_nginx_config() {
    log_info "创建Nginx配置模板..."
    
    local project_dir="/www/wwwroot/lianyu_ai"
    
    cat > "$project_dir/nginx.conf.example" << 'EOF'
# 恋语AI Nginx配置示例
# 请将此配置添加到宝塔面板的网站配置中

server {
    listen 80;
    server_name your_domain.com;  # 替换为你的域名
    root /www/wwwroot/lianyu_ai;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # API反向代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
    
    chown www:www "$project_dir/nginx.conf.example"
    log_success "Nginx配置模板创建完成"
}

# 创建部署脚本
create_deploy_script() {
    log_info "创建部署脚本..."
    
    local project_dir="/www/wwwroot/lianyu_ai"
    
    cat > "$project_dir/deploy.sh" << 'EOF'
#!/bin/bash

# 恋语AI项目部署脚本

set -e

PROJECT_DIR="/www/wwwroot/lianyu_ai"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "开始部署恋语AI项目..."

# 进入项目目录
cd "$PROJECT_DIR"

# 安装后端依赖
if [[ -f "$BACKEND_DIR/package.json" ]]; then
    echo "安装后端依赖..."
    cd "$BACKEND_DIR"
    npm install --production
    cd "$PROJECT_DIR"
fi

# 复制环境变量文件
if [[ ! -f "$BACKEND_DIR/.env" ]] && [[ -f ".env.example" ]]; then
    echo "创建环境变量文件..."
    cp .env.example "$BACKEND_DIR/.env"
    echo "请编辑 $BACKEND_DIR/.env 文件，填入正确的API密钥"
fi

# 启动PM2服务
if command -v pm2 &> /dev/null; then
    echo "启动PM2服务..."
    pm2 start ecosystem.config.js
    pm2 save
    echo "PM2服务启动完成"
else
    echo "警告: PM2未安装，请手动启动后端服务"
fi

echo "部署完成！"
echo "请访问: http://$(hostname -I | awk '{print $1}')"
EOF
    
    chmod +x "$project_dir/deploy.sh"
    chown www:www "$project_dir/deploy.sh"
    log_success "部署脚本创建完成"
}

# 显示部署信息
show_deployment_info() {
    echo
    echo "=================================="
    echo "       部署完成信息"
    echo "=================================="
    echo
    
    local server_ip=$(hostname -I | awk '{print $1}')
    
    log_success "Node.js版本: $(node --version 2>/dev/null || echo '未安装')"
    log_success "npm版本: $(npm --version 2>/dev/null || echo '未安装')"
    log_success "PM2版本: $(pm2 --version 2>/dev/null || echo '未安装')"
    
    echo
    log_info "项目目录: /www/wwwroot/lianyu_ai"
    log_info "服务器IP: $server_ip"
    log_info "宝塔面板: http://$server_ip:8888"
    
    echo
    echo "下一步操作:"
    echo "1. 上传项目代码到 /www/wwwroot/lianyu_ai"
    echo "2. 在宝塔面板创建网站，域名设置为: $server_ip"
    echo "3. 配置反向代理: /api -> http://127.0.0.1:3000"
    echo "4. 申请SSL证书（可选）"
    echo "5. 运行部署脚本: bash /www/wwwroot/lianyu_ai/deploy.sh"
    
    echo
    log_warning "重要提醒:"
    echo "- 请编辑 /www/wwwroot/lianyu_ai/backend/.env 文件，填入正确的API密钥"
    echo "- 确保防火墙开放80、443、3000端口"
    echo "- 建议定期备份项目文件和数据库"
}

# 主函数
main() {
    log_info "开始执行恋语AI宝塔面板自动化部署..."
    
    check_root
    check_baota
    
    install_nodejs
    install_pm2
    
    setup_project_structure
    create_pm2_config
    create_env_template
    create_nginx_config
    create_deploy_script
    
    show_deployment_info
    
    log_success "自动化部署脚本执行完成！"
}

# 执行主函数
main "$@"