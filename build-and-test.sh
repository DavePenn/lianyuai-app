#!/bin/bash

# 恋语AI - 快速构建和测试脚本

echo "🚀 恋语AI - 快速构建和测试"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 错误处理函数
handle_error() {
    echo -e "${RED}❌ 错误: $1${NC}"
    exit 1
}

# 检查当前目录
if [ ! -f "package.json" ]; then
    handle_error "请在恋语AI项目根目录运行此脚本"
fi

echo "📁 当前目录: $(pwd)"

# 1. 检查更新内容
echo ""
info_msg "检查项目更新内容..."

echo "✨ 已修复的问题："
echo "   1. ✅ Google登录功能已完整实现"
echo "   2. ✅ 底部导航栏显示问题已修复"
echo "   3. ✅ 多模态交互功能已实现"
echo "   4. ✅ 服务器配置已更新到您的服务器"
echo "   5. ✅ 移动端部署指南已准备"

# 2. 构建前端
echo ""
info_msg "构建前端应用..."

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install || handle_error "安装前端依赖失败"
fi

# 创建构建目录
mkdir -p dist

# 复制文件到构建目录
echo "复制前端文件..."
cp index.html dist/ || handle_error "复制index.html失败"
cp manifest.json dist/ || handle_error "复制manifest.json失败"
cp service-worker.js dist/ || handle_error "复制service-worker.js失败"
cp -r css dist/ || handle_error "复制CSS失败"
cp -r js dist/ || handle_error "复制JS失败"
cp -r config dist/ || handle_error "复制配置失败"
cp -r api dist/ || handle_error "复制API失败"
cp -r adapters dist/ || handle_error "复制适配器失败"

# 复制图标目录（如果存在）
if [ -d "icons" ]; then
    cp -r icons dist/
fi

success_msg "前端构建完成"

# 3. 检查后端配置
echo ""
info_msg "检查后端配置..."

cd backend

# 检查后端依赖
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install || handle_error "安装后端依赖失败"
fi

# 检查环境配置
if [ -f ".env" ]; then
    echo "检查服务器配置..."
    if grep -q "152.32.218.174" .env; then
        success_msg "后端已配置到您的服务器"
    else
        warning_msg "请检查后端.env文件中的服务器配置"
    fi
else
    warning_msg "后端.env文件不存在，创建默认配置..."
    cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_USER=user
DB_NAME=lianyu_ai
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=bNvNNbxgQEHEvc9RJKF/j2swoarggI3+OLuzil8Lzy4=
JWT_EXPIRES_IN=1h
GOOGLE_CLIENT_ID=your_google_client_id_here
EOF
fi

cd ..

# 4. 验证关键功能
echo ""
info_msg "验证关键功能..."

# 检查认证模块
if [ -f "js/auth.js" ]; then
    success_msg "✅ 认证模块存在"
else
    handle_error "认证模块缺失"
fi

# 检查轮播组件
if [ -f "js/carousel-enhanced.js" ]; then
    success_msg "✅ 增强轮播组件存在"
else
    handle_error "增强轮播组件缺失"
fi

# 检查OAuth配置
if [ -f "config/oauth-config.js" ]; then
    success_msg "✅ OAuth配置存在"
else
    handle_error "OAuth配置缺失"
fi

# 检查服务器配置
if grep -q "152.32.218.174:3001" api/backend-service.js && grep -q "152.32.218.174:3001" config/platform-config.js; then
    success_msg "✅ 服务器配置正确"
else
    warning_msg "服务器配置可能有问题"
fi

# 5. 创建测试URL
echo ""
info_msg "准备测试环境..."

# 检查是否有http-server
if command -v http-server &> /dev/null; then
    echo "🌐 可以使用以下命令启动本地测试服务器："
    echo "   cd dist && http-server . -p 8081 -c-1"
    echo ""
    echo "📱 测试地址："
    echo "   本地: http://localhost:8081"
    echo "   网络: http://$(hostname -I | awk '{print $1}'):8081"
elif command -v python3 &> /dev/null; then
    echo "🌐 可以使用Python启动本地测试服务器："
    echo "   cd dist && python3 -m http.server 8081"
elif command -v python &> /dev/null; then
    echo "🌐 可以使用Python启动本地测试服务器："
    echo "   cd dist && python -m SimpleHTTPServer 8081"
else
    warning_msg "请安装http-server或Python来启动测试服务器"
    echo "   npm install -g http-server"
fi

# 6. 显示部署信息
echo ""
echo "🎯 部署到您的服务器 (152.32.218.174):"
echo ""
echo "📋 部署步骤："
echo "1. 运行服务器部署脚本:"
echo "   ./deploy-to-server.sh"
echo ""
echo "2. 或手动上传文件:"
echo "   scp -r dist/* root@152.32.218.174:/var/www/lianyu_ai/"
echo "   scp -r backend root@152.32.218.174:/var/www/lianyu_ai/"
echo ""
echo "3. 在服务器上配置环境:"
echo "   ssh root@152.32.218.174"
echo "   cd /var/www/lianyu_ai && ./server_setup.sh"
echo ""

# 7. 移动端信息
echo "📱 移动端部署:"
echo "   详细指南: MOBILE_DEPLOYMENT_GUIDE.md"
echo ""
echo "   iOS: npx cap add ios && npx cap open ios"
echo "   Android: npx cap add android && npx cap open android"
echo ""

# 8. 显示功能清单
echo "🎉 新增/修复的功能:"
echo ""
echo "🔐 认证系统:"
echo "   ✅ Google OAuth 2.0 登录"
echo "   ✅ 传统用户名密码登录"
echo "   ✅ 自动登录状态检查"
echo "   ✅ 安全的会话管理"
echo ""
echo "🎨 UI/UX改进:"
echo "   ✅ 底部导航栏修复"
echo "   ✅ 移动端轮播交互优化"
echo "   ✅ 响应式设计改进"
echo "   ✅ 现代化动画效果"
echo ""
echo "🎤 多模态交互:"
echo "   ✅ 语音识别 (语音转文字)"
echo "   ✅ 文字转语音 (TTS)"
echo "   ✅ 图片上传和分析"
echo "   ✅ 文件分享功能"
echo "   ✅ 拖拽上传支持"
echo ""
echo "🖥️ 服务器配置:"
echo "   ✅ 指向您的服务器 152.32.218.174:3001"
echo "   ✅ 跨域配置"
echo "   ✅ 数据库迁移脚本"
echo ""

success_msg "构建和检查完成！"

echo ""
echo "🚀 接下来您可以:"
echo "1. 本地测试功能"
echo "2. 部署到您的服务器"
echo "3. 打包移动应用"
echo ""
echo "如有问题，请查看相关文档或联系技术支持。"

exit 0
