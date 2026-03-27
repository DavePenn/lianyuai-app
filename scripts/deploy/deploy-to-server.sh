#!/bin/bash

# 恋语AI - 服务器部署脚本
# 部署到用户自己的服务器: 152.32.218.174

echo "🚀 开始部署恋语AI到您的服务器..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SERVER_IP="152.32.218.174"
SERVER_USER="root"  # 根据实际情况修改
SERVER_PASSWORD="daiyiping123"
FRONTEND_PORT="8081"
BACKEND_PORT="3001"
PROJECT_NAME="lianyu_ai"

# 错误处理函数
handle_error() {
    echo -e "${RED}❌ 错误: $1${NC}"
    exit 1
}

# 成功信息函数
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 警告信息函数
warning_msg() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 信息函数
info_msg() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# 检查当前目录
if [ ! -f "package.json" ]; then
    handle_error "请在恋语AI项目根目录运行此脚本"
fi

echo "📁 当前目录: $(pwd)"
echo "🖥️ 目标服务器: $SERVER_IP"

# 1. 检查本地构建环境
echo ""
info_msg "检查本地构建环境..."

if ! command -v npm &> /dev/null; then
    handle_error "npm 未安装，请先安装 Node.js"
fi

if ! command -v sshpass &> /dev/null; then
    warning_msg "sshpass 未安装，可能需要手动输入密码"
fi

# 2. 构建前端项目
echo ""
info_msg "构建前端项目..."

# 确保依赖已安装
npm install || handle_error "安装前端依赖失败"

# 执行构建
npm run build || {
    warning_msg "npm run build 失败，尝试手动构建..."
    
    # 手动构建
    mkdir -p dist
    cp -r css js index.html manifest.json service-worker.js dist/ || handle_error "手动构建失败"
    cp -r config api adapters dist/ || warning_msg "某些资源文件复制失败"
}

success_msg "前端构建完成"

# 3. 准备后端环境
echo ""
info_msg "准备后端环境..."

cd backend
npm install || handle_error "安装后端依赖失败"

# 确保环境配置正确
if ! grep -q "152.32.218.174" .env; then
    echo "PORT=3001" > .env.server
    echo "DB_HOST=localhost" >> .env.server
    echo "DB_USER=user" >> .env.server
    echo "DB_NAME=lianyu_ai" >> .env.server
    echo "DB_PASSWORD=password" >> .env.server
    echo "DB_PORT=5432" >> .env.server
    cat .env >> .env.server
    success_msg "服务器环境配置已准备"
fi

cd ..

# 4. 上传到服务器
echo ""
info_msg "上传文件到服务器..."

# 创建上传脚本
cat > upload_to_server.sh << EOF
#!/bin/bash

# 服务器连接信息
SERVER="$SERVER_USER@$SERVER_IP"

# 创建项目目录
sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no \$SERVER "mkdir -p /var/www/$PROJECT_NAME"

# 上传前端文件
echo "上传前端文件..."
sshpass -p '$SERVER_PASSWORD' scp -o StrictHostKeyChecking=no -r dist/* \$SERVER:/var/www/$PROJECT_NAME/

# 上传后端文件
echo "上传后端文件..."
sshpass -p '$SERVER_PASSWORD' scp -o StrictHostKeyChecking=no -r backend \$SERVER:/var/www/$PROJECT_NAME/

# 上传配置文件
sshpass -p '$SERVER_PASSWORD' scp -o StrictHostKeyChecking=no backend/.env.server \$SERVER:/var/www/$PROJECT_NAME/backend/.env

echo "文件上传完成"
EOF

chmod +x upload_to_server.sh

if command -v sshpass &> /dev/null; then
    ./upload_to_server.sh || {
        warning_msg "自动上传失败，请手动上传文件"
        echo "手动上传命令："
        echo "scp -r dist/* $SERVER_USER@$SERVER_IP:/var/www/$PROJECT_NAME/"
        echo "scp -r backend $SERVER_USER@$SERVER_IP:/var/www/$PROJECT_NAME/"
    }
else
    warning_msg "请手动上传文件到服务器"
    echo "上传命令："
    echo "scp -r dist/* $SERVER_USER@$SERVER_IP:/var/www/$PROJECT_NAME/"
    echo "scp -r backend $SERVER_USER@$SERVER_IP:/var/www/$PROJECT_NAME/"
fi

# 5. 创建服务器配置脚本
echo ""
info_msg "创建服务器配置脚本..."

cat > server_setup.sh << 'EOF'
#!/bin/bash

# 恋语AI服务器环境配置脚本
# 在服务器上运行此脚本

PROJECT_DIR="/var/www/lianyu_ai"
NGINX_CONF="/etc/nginx/sites-available/lianyu_ai"

echo "🚀 配置恋语AI服务器环境..."

# 1. 安装必要软件
echo "📦 安装必要软件..."
apt update
apt install -y nginx nodejs npm postgresql postgresql-contrib pm2

# 2. 配置Node.js环境
echo "⚙️ 配置Node.js环境..."
cd $PROJECT_DIR/backend
npm install
npm install -g pm2

# 3. 配置数据库
echo "🗄️ 配置PostgreSQL数据库..."
sudo -u postgres psql << PSQL_EOF
CREATE DATABASE lianyu_ai;
CREATE USER user WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE lianyu_ai TO user;
\q
PSQL_EOF

# 初始化数据库
sudo -u postgres psql -d lianyu_ai -f $PROJECT_DIR/backend/src/config/init.sql
sudo -u postgres psql -d lianyu_ai -f $PROJECT_DIR/backend/src/config/migrate_google_oauth.sql

# 4. 配置Nginx
echo "🌐 配置Nginx..."
cat > $NGINX_CONF << 'NGINX_EOF'
server {
    listen 80;
    listen 8081;
    server_name 152.32.218.174;
    
    # 前端文件
    location / {
        root /var/www/lianyu_ai;
        try_files $uri $uri/ /index.html;
        
        # 添加CORS头
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
    }
    
    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS处理
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
        
        # 处理OPTIONS请求
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        root /var/www/lianyu_ai;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# 启用站点
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 5. 启动后端服务
echo "🚀 启动后端服务..."
cd $PROJECT_DIR/backend
pm2 start src/index.js --name "lianyu-ai-backend"
pm2 startup
pm2 save

# 6. 设置防火墙
echo "🔒 配置防火墙..."
ufw allow 80
ufw allow 3001
ufw allow 8081
ufw --force enable

echo "✅ 恋语AI服务器配置完成！"
echo "🌐 访问地址: http://152.32.218.174:8081"
echo "📊 后端API: http://152.32.218.174:3001"

echo ""
echo "📝 后续步骤："
echo "1. 配置域名解析（可选）"
echo "2. 设置SSL证书（推荐）"
echo "3. 配置Google OAuth客户端ID"
echo "4. 测试所有功能"

EOF

success_msg "服务器配置脚本已创建: server_setup.sh"

# 6. 显示部署说明
echo ""
echo "🎉 本地构建完成！"
echo ""
echo "📋 接下来的步骤："
echo ""
echo "1️⃣ 登录到您的服务器："
echo "   ssh root@152.32.218.174"
echo ""
echo "2️⃣ 上传并运行服务器配置脚本："
echo "   scp server_setup.sh root@152.32.218.174:~/"
echo "   ssh root@152.32.218.174 'chmod +x ~/server_setup.sh && ~/server_setup.sh'"
echo ""
echo "3️⃣ 或者手动执行以下步骤："
echo "   - 安装nginx, nodejs, postgresql"
echo "   - 配置数据库和用户"
echo "   - 设置nginx反向代理"
echo "   - 启动后端服务"
echo ""
echo "4️⃣ 访问您的应用："
echo "   🌐 前端: http://152.32.218.174:8081"
echo "   📡 后端: http://152.32.218.174:3001"
echo ""
echo "5️⃣ 配置Google OAuth（如需要）："
echo "   - 更新 config/oauth-config.js 中的客户端ID"
echo "   - 添加 http://152.32.218.174:8081 到Google OAuth重定向URI"
echo ""

# 清理临时文件
rm -f upload_to_server.sh

success_msg "部署脚本执行完成！"

exit 0
