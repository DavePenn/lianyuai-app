#!/usr/bin/env node
/**
 * 配置检查脚本
 * 检查前后端配置是否一致，避免端口不匹配等问题
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 读取后端环境配置
 */
function readBackendConfig() {
    const backendEnvPath = path.join(__dirname, '../backend/.env');
    
    if (!fs.existsSync(backendEnvPath)) {
        log('❌ 后端 .env 文件不存在', 'red');
        return null;
    }
    
    const envContent = fs.readFileSync(backendEnvPath, 'utf8');
    const config = {};
    
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            config[key.trim()] = value.trim();
        }
    });
    
    return config;
}

/**
 * 读取前端API配置
 */
function readFrontendConfig() {
    const frontendConfigPath = path.join(__dirname, '../api/config.js');
    
    if (!fs.existsSync(frontendConfigPath)) {
        log('❌ 前端 config.js 文件不存在', 'red');
        return null;
    }
    
    const configContent = fs.readFileSync(frontendConfigPath, 'utf8');
    
    // 提取 baseURL
    const baseURLMatch = configContent.match(/baseURL:\s*[^'"]*['"](http[^'"]+)['"]/); 
    
    if (!baseURLMatch) {
        log('❌ 无法从前端配置中提取 baseURL', 'red');
        return null;
    }
    
    const baseURL = baseURLMatch[1];
    const urlMatch = baseURL.match(/https?:\/\/([^:]+):(\d+)/);
    
    if (!urlMatch) {
        log(`❌ 前端 baseURL 格式不正确: ${baseURL}`, 'red');
        return null;
    }
    
    return {
        host: urlMatch[1],
        port: urlMatch[2]
    };
}

/**
 * 主检查函数
 */
function checkConfig() {
    log('🔍 开始检查前后端配置...', 'blue');
    
    const backendConfig = readBackendConfig();
    const frontendConfig = readFrontendConfig();
    
    if (!backendConfig || !frontendConfig) {
        log('❌ 配置文件读取失败', 'red');
        process.exit(1);
    }
    
    log('\n📋 配置信息:', 'blue');
    log(`后端端口: ${backendConfig.PORT || '未设置'}`);
    log(`前端API端口: ${frontendConfig.port}`);
    log(`前端API主机: ${frontendConfig.host}`);
    
    // 检查端口是否一致
    const backendPort = backendConfig.PORT || '3000';
    const frontendPort = frontendConfig.port;
    
    if (backendPort !== frontendPort) {
        log('\n❌ 端口配置不一致!', 'red');
        log(`后端配置端口: ${backendPort}`, 'red');
        log(`前端配置端口: ${frontendPort}`, 'red');
        log('\n🔧 修复建议:', 'yellow');
        log(`1. 修改后端 .env 文件中的 PORT=${frontendPort}`, 'yellow');
        log(`2. 或修改前端 config.js 中的端口为 ${backendPort}`, 'yellow');
        log(`3. 修改后重启后端服务: pm2 restart lianyu-backend`, 'yellow');
        process.exit(1);
    }
    
    // 检查数据库配置
    if (!backendConfig.DB_HOST || !backendConfig.DB_NAME) {
        log('\n⚠️  数据库配置不完整', 'yellow');
        log('请检查 DB_HOST, DB_NAME, DB_USER, DB_PASSWORD 配置', 'yellow');
    }
    
    // 检查JWT配置
    if (!backendConfig.JWT_SECRET || backendConfig.JWT_SECRET === 'your-jwt-secret-key') {
        log('\n⚠️  JWT密钥未设置或使用默认值', 'yellow');
        log('建议设置安全的JWT_SECRET', 'yellow');
    }
    
    log('\n✅ 配置检查完成，前后端端口配置一致!', 'green');
}

// 如果直接运行此脚本
if (require.main === module) {
    checkConfig();
}

module.exports = { checkConfig };