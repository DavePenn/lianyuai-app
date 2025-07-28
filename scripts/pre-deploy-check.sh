#!/bin/bash

# 部署前检查脚本
# 确保配置正确，避免部署后出现问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始部署前检查...${NC}"

# 检查Node.js环境
echo -e "\n${BLUE}📦 检查Node.js环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"

# 检查npm依赖
echo -e "\n${BLUE}📦 检查npm依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules 不存在，正在安装依赖...${NC}"
    npm install
fi
echo -e "${GREEN}✅ npm依赖检查完成${NC}"

# 检查后端依赖
echo -e "\n${BLUE}📦 检查后端依赖...${NC}"
if [ -d "backend" ] && [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  后端node_modules 不存在，正在安装依赖...${NC}"
    cd backend && npm install && cd ..
fi
echo -e "${GREEN}✅ 后端依赖检查完成${NC}"

# 运行配置检查
echo -e "\n${BLUE}🔍 检查前后端配置一致性...${NC}"
if ! node scripts/check-config.js; then
    echo -e "${RED}❌ 配置检查失败${NC}"
    echo -e "${YELLOW}💡 尝试自动修复配置...${NC}"
    
    if node scripts/fix-config.js --skip-restart; then
        echo -e "${GREEN}✅ 配置已自动修复${NC}"
        echo -e "${YELLOW}⚠️  请确保远程服务器配置也已更新${NC}"
    else
        echo -e "${RED}❌ 自动修复失败，请手动检查配置${NC}"
        exit 1
    fi
fi

# 检查环境变量文件
echo -e "\n${BLUE}🔍 检查环境变量文件...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ 后端 .env 文件不存在${NC}"
    if [ -f "backend/.env.example" ]; then
        echo -e "${YELLOW}💡 复制 .env.example 到 .env${NC}"
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}⚠️  请编辑 backend/.env 文件设置正确的配置${NC}"
    else
        echo -e "${RED}❌ .env.example 文件也不存在${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ 环境变量文件检查完成${NC}"

# 检查关键配置项
echo -e "\n${BLUE}🔍 检查关键配置项...${NC}"
if grep -q "your-jwt-secret-key" backend/.env; then
    echo -e "${YELLOW}⚠️  JWT密钥使用默认值，建议修改${NC}"
fi

if grep -q "password" backend/.env; then
    echo -e "${YELLOW}⚠️  数据库密码可能使用默认值，请确认${NC}"
fi

# 检查文件权限
echo -e "\n${BLUE}🔍 检查文件权限...${NC}"
if [ -f "scripts/check-config.js" ]; then
    chmod +x scripts/check-config.js
fi
if [ -f "scripts/fix-config.js" ]; then
    chmod +x scripts/fix-config.js
fi
echo -e "${GREEN}✅ 文件权限检查完成${NC}"

# 检查远程服务器连接（可选）
echo -e "\n${BLUE}🔍 检查远程服务器连接...${NC}"
if command -v sshpass &> /dev/null; then
    if sshpass -p 'daiyiping123' ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@152.32.218.174 'echo "连接成功"' &> /dev/null; then
        echo -e "${GREEN}✅ 远程服务器连接正常${NC}"
        
        # 检查远程服务器上的服务状态
        echo -e "${BLUE}🔍 检查远程服务器服务状态...${NC}"
        REMOTE_STATUS=$(sshpass -p 'daiyiping123' ssh -o StrictHostKeyChecking=no root@152.32.218.174 'cd /www/wwwroot/lianyu_ai/backend && pm2 status lianyu-backend | grep online || echo "offline"')
        if echo "$REMOTE_STATUS" | grep -q "online"; then
            echo -e "${GREEN}✅ 远程后端服务运行正常${NC}"
        else
            echo -e "${YELLOW}⚠️  远程后端服务可能未运行${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  无法连接到远程服务器${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  sshpass 未安装，跳过远程服务器检查${NC}"
fi

echo -e "\n${GREEN}🎉 部署前检查完成！${NC}"
echo -e "${BLUE}📋 检查摘要:${NC}"
echo -e "  ✅ Node.js环境正常"
echo -e "  ✅ 依赖安装完成"
echo -e "  ✅ 配置文件一致"
echo -e "  ✅ 环境变量配置"
echo -e "  ✅ 文件权限正确"
echo -e "\n${GREEN}🚀 可以开始部署！${NC}"