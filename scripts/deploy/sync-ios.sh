#!/bin/bash

# iOS项目文件同步脚本
# 用于确保iOS项目包含所有必要的前端文件

echo "开始同步iOS项目文件..."

# 1. 复制index.html到dist目录
cp index.html dist/index.html

# 2. 执行Capacitor同步
echo "执行Capacitor同步..."
npx cap sync ios

# 3. 复制必要的目录到iOS项目
echo "复制必要的JavaScript模块..."
cp -r api ios/App/App/public/
cp -r config ios/App/App/public/
cp -r adapters ios/App/App/public/

# 4. 验证文件结构
echo "验证iOS项目文件结构..."
if [ -f "ios/App/App/public/api/backend-service.js" ]; then
    echo "✅ backend-service.js 存在"
else
    echo "❌ backend-service.js 缺失"
fi

if [ -f "ios/App/App/public/config/platform-config.js" ]; then
    echo "✅ platform-config.js 存在"
else
    echo "❌ platform-config.js 缺失"
fi

if [ -f "ios/App/App/public/adapters/storage-adapter.js" ]; then
    echo "✅ storage-adapter.js 存在"
else
    echo "❌ storage-adapter.js 缺失"
fi

echo "iOS项目文件同步完成！"
echo "现在可以在Xcode中运行项目进行测试。"