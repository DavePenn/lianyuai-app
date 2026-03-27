#!/bin/bash

# 恋语AI认证功能更新部署脚本

echo "🚀 开始部署恋语AI认证功能更新..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# 检查当前目录
if [ ! -f "package.json" ]; then
    handle_error "请在恋语AI项目根目录运行此脚本"
fi

echo "📁 当前目录: $(pwd)"

# 1. 备份前端文件
echo "📦 备份原始文件..."
if [ ! -d "backup" ]; then
    mkdir backup
fi

# 备份关键文件
cp index.html backup/index.html.bak 2>/dev/null || true
cp js/app.js backup/app.js.bak 2>/dev/null || true
cp api/backend-service.js backup/backend-service.js.bak 2>/dev/null || true

success_msg "前端文件备份完成"

# 2. 安装后端依赖
echo "📦 安装后端依赖..."
cd backend

if [ ! -f "package.json" ]; then
    handle_error "后端package.json文件不存在"
fi

# 安装Google Auth Library
npm install google-auth-library || handle_error "安装google-auth-library失败"

success_msg "后端依赖安装完成"

# 3. 数据库迁移
echo "🗄️ 执行数据库迁移..."

# 检查环境变量
if [ -f ".env" ]; then
    source .env
else
    warning_msg ".env文件不存在，使用默认数据库配置"
fi

# 检查PostgreSQL连接
echo "🔍 检查数据库连接..."

# 尝试连接数据库
PGPASSWORD=${DB_PASSWORD:-password} psql -h ${DB_HOST:-localhost} -U ${DB_USER:-user} -d ${DB_NAME:-lianyu_ai} -p ${DB_PORT:-5432} -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    success_msg "数据库连接成功"
    
    # 执行迁移脚本
    echo "🔄 执行Google OAuth迁移..."
    PGPASSWORD=${DB_PASSWORD:-password} psql -h ${DB_HOST:-localhost} -U ${DB_USER:-user} -d ${DB_NAME:-lianyu_ai} -p ${DB_PORT:-5432} -f src/config/migrate_google_oauth.sql
    
    if [ $? -eq 0 ]; then
        success_msg "数据库迁移完成"
    else
        warning_msg "数据库迁移可能失败，请手动检查"
    fi
else
    warning_msg "无法连接到数据库，请手动执行迁移脚本: src/config/migrate_google_oauth.sql"
fi

# 4. 环境配置检查
echo "⚙️ 检查环境配置..."

if grep -q "your_google_client_id_here" .env; then
    warning_msg "请在 .env 文件中配置正确的 GOOGLE_CLIENT_ID"
    echo "   获取方式: https://console.developers.google.com/"
fi

if grep -q "您的Google客户端ID" ../config/oauth-config.js; then
    warning_msg "请在 config/oauth-config.js 中配置正确的 Google 客户端ID"
fi

# 回到根目录
cd ..

# 5. 前端文件检查
echo "🔍 验证前端更新..."

if [ -f "js/auth.js" ]; then
    success_msg "认证模块已添加"
else
    handle_error "认证模块文件缺失"
fi

if [ -f "js/carousel-enhanced.js" ]; then
    success_msg "增强轮播组件已添加"
else
    handle_error "增强轮播组件文件缺失"
fi

if [ -f "config/oauth-config.js" ]; then
    success_msg "OAuth配置文件已添加"
else
    handle_error "OAuth配置文件缺失"
fi

# 6. 启动服务提示
echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 接下来需要完成的配置："
echo "   1. 在Google Cloud Console创建OAuth 2.0凭据"
echo "   2. 在 backend/.env 中设置 GOOGLE_CLIENT_ID"
echo "   3. 在 config/oauth-config.js 中更新客户端ID"
echo "   4. 重启后端服务"
echo ""
echo "🚀 启动命令:"
echo "   后端: cd backend && npm run dev"
echo "   前端: npm run dev"
echo ""
echo "🔧 Google OAuth设置指南:"
echo "   1. 访问 https://console.developers.google.com/"
echo "   2. 创建新项目或选择现有项目"
echo "   3. 启用 Google+ API"
echo "   4. 创建OAuth 2.0客户端ID"
echo "   5. 添加授权的重定向URI: http://localhost:8081, http://152.32.218.174:8081"
echo ""

success_msg "恋语AI认证功能更新部署完成！"

exit 0
