#!/usr/bin/env node
/**
 * 配置自动修复脚本
 * 自动修复前后端配置不一致的问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
    
    return { config, content: envContent, path: backendEnvPath };
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
    const baseURLMatch = configContent.match(/baseURL:\s*['"`]([^'"` ]+)['"`]/);
    
    if (!baseURLMatch) {
        log('❌ 无法从前端配置中提取 baseURL', 'red');
        return null;
    }
    
    const baseURL = baseURLMatch[1];
    const urlMatch = baseURL.match(/https?:\/\/([^:]+):(\d+)/);
    
    if (!urlMatch) {
        log('❌ 前端 baseURL 格式不正确', 'red');
        return null;
    }
    
    return {
        host: urlMatch[1],
        port: urlMatch[2],
        content: configContent,
        path: frontendConfigPath
    };
}

/**
 * 修复后端端口配置
 */
function fixBackendPort(backendData, targetPort) {
    log(`🔧 修复后端端口配置: ${targetPort}`, 'yellow');
    
    let newContent = backendData.content;
    
    // 替换或添加PORT配置
    if (newContent.includes('PORT=')) {
        newContent = newContent.replace(/PORT=\d+/, `PORT=${targetPort}`);
    } else {
        // 在服务器配置部分添加PORT
        const serverConfigMatch = newContent.match(/(# 服务器配置[\s\S]*?)\n\n/);
        if (serverConfigMatch) {
            const serverConfig = serverConfigMatch[1];
            const newServerConfig = serverConfig + `\nPORT=${targetPort}`;
            newContent = newContent.replace(serverConfigMatch[1], newServerConfig);
        } else {
            newContent += `\n# 服务器配置\nPORT=${targetPort}\n`;
        }
    }
    
    // 备份原文件
    const backupPath = backendData.path + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, backendData.content);
    log(`📁 已备份原配置文件: ${backupPath}`, 'blue');
    
    // 写入新配置
    fs.writeFileSync(backendData.path, newContent);
    log('✅ 后端配置已更新', 'green');
}

/**
 * 修复前端API配置
 */
function fixFrontendPort(frontendData, targetPort) {
    log(`🔧 修复前端API端口配置: ${targetPort}`, 'yellow');
    
    let newContent = frontendData.content;
    
    // 替换baseURL中的端口
    const currentBaseURL = `http://${frontendData.host}:${frontendData.port}`;
    const newBaseURL = `http://${frontendData.host}:${targetPort}`;
    
    newContent = newContent.replace(currentBaseURL, newBaseURL);
    
    // 备份原文件
    const backupPath = frontendData.path + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, frontendData.content);
    log(`📁 已备份原配置文件: ${backupPath}`, 'blue');
    
    // 写入新配置
    fs.writeFileSync(frontendData.path, newContent);
    log('✅ 前端配置已更新', 'green');
}

/**
 * 重启后端服务
 */
function restartBackendService() {
    log('🔄 重启后端服务...', 'yellow');
    
    try {
        // 检查是否有SSH配置
        const sshCommand = 'sshpass -p "daiyiping123" ssh -o StrictHostKeyChecking=no root@152.32.218.174';
        const restartCommand = `${sshCommand} 'cd /www/wwwroot/lianyu_ai/backend && pm2 restart lianyu-backend'`;
        
        execSync(restartCommand, { stdio: 'inherit' });
        log('✅ 后端服务重启成功', 'green');
    } catch (error) {
        log('❌ 后端服务重启失败，请手动重启', 'red');
        log('手动重启命令: pm2 restart lianyu-backend', 'yellow');
    }
}

/**
 * 主修复函数
 */
function fixConfig(options = {}) {
    log('🔧 开始自动修复配置...', 'blue');
    
    const backendData = readBackendConfig();
    const frontendData = readFrontendConfig();
    
    if (!backendData || !frontendData) {
        log('❌ 配置文件读取失败', 'red');
        process.exit(1);
    }
    
    const backendPort = backendData.config.PORT || '3000';
    const frontendPort = frontendData.port;
    
    if (backendPort === frontendPort) {
        log('✅ 配置已经一致，无需修复', 'green');
        return;
    }
    
    log('\n📋 当前配置:', 'blue');
    log(`后端端口: ${backendPort}`);
    log(`前端API端口: ${frontendPort}`);
    
    // 确定目标端口
    let targetPort;
    if (options.useBackendPort) {
        targetPort = backendPort;
        fixFrontendPort(frontendData, targetPort);
    } else {
        // 默认使用前端配置的端口
        targetPort = frontendPort;
        fixBackendPort(backendData, targetPort);
        
        // 重启后端服务
        if (!options.skipRestart) {
            restartBackendService();
        }
    }
    
    log(`\n✅ 配置修复完成! 统一端口: ${targetPort}`, 'green');
    
    if (options.skipRestart) {
        log('⚠️  请手动重启后端服务以使配置生效', 'yellow');
    }
}

// 命令行参数处理
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        useBackendPort: args.includes('--use-backend-port'),
        skipRestart: args.includes('--skip-restart')
    };
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
使用方法: node fix-config.js [选项]

选项:
  --use-backend-port    使用后端端口作为目标端口（默认使用前端端口）
  --skip-restart        跳过后端服务重启
  --help, -h            显示帮助信息
`);
        process.exit(0);
    }
    
    fixConfig(options);
}

module.exports = { fixConfig };