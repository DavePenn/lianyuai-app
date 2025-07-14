#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * 配置验证脚本
 * 验证恋语AI项目的环境变量和配置文件
 */
class ConfigValidator {
    constructor() {
        this.requiredEnvVars = [
            'OPENAI_API_KEY',
            'CLAUDE_API_KEY', 
            'GEMINI_API_KEY',
            'QMAX_API_KEY'
        ];
        
        this.optionalEnvVars = [
            'PROXY_ENABLED',
            'PROXY_HOST',
            'PROXY_PORT',
            'CURRENT_AI_PROVIDER',
            'NODE_ENV',
            'PORT'
        ];
        
        this.configFiles = [
            '.env.example',
            'ai-config.json',
            'backend/src/config/aiConfig.js',
            'backend/src/controllers/configController.js',
            'backend/src/routes/configRoutes.js'
        ];
    }

    /**
     * 打印彩色输出
     * @param {string} message - 消息内容
     * @param {string} color - 颜色代码
     */
    colorLog(message, color = 'reset') {
        const colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
        };
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    /**
     * 验证环境变量
     * @returns {boolean} 验证是否通过
     */
    validateEnvironmentVariables() {
        this.colorLog('\n🔍 验证环境变量...', 'cyan');
        
        const missing = [];
        const present = [];
        const invalid = [];
        
        // 检查必需的环境变量
        this.requiredEnvVars.forEach(varName => {
            const value = process.env[varName];
            if (value) {
                if (this.validateAPIKeyFormat(varName, value)) {
                    present.push(varName);
                } else {
                    invalid.push(varName);
                }
            } else {
                missing.push(varName);
            }
        });
        
        // 检查可选的环境变量
        const optionalPresent = [];
        this.optionalEnvVars.forEach(varName => {
            if (process.env[varName]) {
                optionalPresent.push(varName);
            }
        });
        
        // 输出结果
        if (present.length > 0) {
            this.colorLog('✅ 已正确配置的API密钥:', 'green');
            present.forEach(key => {
                const maskedKey = this.maskAPIKey(process.env[key]);
                this.colorLog(`   ${key}: ${maskedKey}`, 'green');
            });
        }
        
        if (optionalPresent.length > 0) {
            this.colorLog('\n📋 已配置的可选项:', 'blue');
            optionalPresent.forEach(key => {
                this.colorLog(`   ${key}: ${process.env[key]}`, 'blue');
            });
        }
        
        if (invalid.length > 0) {
            this.colorLog('\n⚠️  格式无效的API密钥:', 'yellow');
            invalid.forEach(key => {
                this.colorLog(`   ${key}: 格式不正确`, 'yellow');
            });
        }
        
        if (missing.length > 0) {
            this.colorLog('\n❌ 缺失的API密钥:', 'red');
            missing.forEach(key => {
                this.colorLog(`   ${key}: 未配置`, 'red');
            });
            this.colorLog('\n💡 请在.env文件中配置这些API密钥', 'yellow');
        }
        
        return missing.length === 0 && invalid.length === 0;
    }

    /**
     * 验证API密钥格式
     * @param {string} keyName - 密钥名称
     * @param {string} keyValue - 密钥值
     * @returns {boolean} 格式是否正确
     */
    validateAPIKeyFormat(keyName, keyValue) {
        if (!keyValue || keyValue.trim() === '') {
            return false;
        }
        
        // 检查是否是占位符
        const placeholders = [
            'your-api-key',
            'your-openai-api-key',
            'your-claude-api-key',
            'your-gemini-api-key',
            'your-qwen-api-key',
            'YOUR_OPENAI_API_KEY',
            'YOUR_CLAUDE_API_KEY',
            'YOUR_GEMINI_API_KEY',
            'YOUR_QMAX_API_KEY'
        ];
        
        if (placeholders.some(placeholder => keyValue.includes(placeholder))) {
            return false;
        }
        
        // 基本格式验证
        switch (keyName) {
            case 'OPENAI_API_KEY':
                return keyValue.startsWith('sk-') && keyValue.length > 20;
            case 'CLAUDE_API_KEY':
                return keyValue.startsWith('sk-ant-') && keyValue.length > 30;
            case 'GEMINI_API_KEY':
                return keyValue.length > 20; // Gemini密钥格式较灵活
            case 'QMAX_API_KEY':
                return keyValue.startsWith('sk-') && keyValue.length > 20;
            default:
                return keyValue.length > 10;
        }
    }

    /**
     * 掩码显示API密钥
     * @param {string} apiKey - API密钥
     * @returns {string} 掩码后的密钥
     */
    maskAPIKey(apiKey) {
        if (!apiKey || apiKey.length < 8) {
            return '***';
        }
        
        const start = apiKey.substring(0, 6);
        const end = apiKey.substring(apiKey.length - 4);
        const middle = '*'.repeat(Math.min(apiKey.length - 10, 20));
        
        return `${start}${middle}${end}`;
    }

    /**
     * 验证配置文件
     * @returns {boolean} 验证是否通过
     */
    validateConfigFiles() {
        this.colorLog('\n🔍 验证配置文件...', 'cyan');
        
        const missing = [];
        const present = [];
        const invalid = [];
        
        this.configFiles.forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    // 验证文件内容
                    if (this.validateConfigFileContent(file)) {
                        present.push(file);
                    } else {
                        invalid.push(file);
                    }
                } catch (error) {
                    invalid.push(file);
                }
            } else {
                missing.push(file);
            }
        });
        
        if (present.length > 0) {
            this.colorLog('✅ 存在且有效的配置文件:', 'green');
            present.forEach(file => {
                this.colorLog(`   ${file}`, 'green');
            });
        }
        
        if (invalid.length > 0) {
            this.colorLog('\n⚠️  存在但格式无效的配置文件:', 'yellow');
            invalid.forEach(file => {
                this.colorLog(`   ${file}`, 'yellow');
            });
        }
        
        if (missing.length > 0) {
            this.colorLog('\n❌ 缺失的配置文件:', 'red');
            missing.forEach(file => {
                this.colorLog(`   ${file}`, 'red');
            });
        }
        
        return missing.length === 0 && invalid.length === 0;
    }

    /**
     * 验证配置文件内容
     * @param {string} filePath - 文件路径
     * @returns {boolean} 内容是否有效
     */
    validateConfigFileContent(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            switch (path.extname(filePath)) {
                case '.json':
                    JSON.parse(content);
                    return true;
                case '.js':
                    // 简单检查是否包含关键字
                    return content.includes('module.exports') || content.includes('export');
                default:
                    return content.length > 0;
            }
        } catch (error) {
            return false;
        }
    }

    /**
     * 验证网络连接
     * @returns {Promise<boolean>} 网络是否可用
     */
    async validateNetworkConnectivity() {
        this.colorLog('\n🌐 验证网络连接...', 'cyan');
        
        const testUrls = [
            'https://api.openai.com',
            'https://api.anthropic.com',
            'https://generativelanguage.googleapis.com',
            'https://dashscope.aliyuncs.com'
        ];
        
        const results = [];
        
        for (const url of testUrls) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(url, {
                    method: 'HEAD',
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                results.push({
                    url,
                    status: response.status,
                    success: response.status < 500
                });
            } catch (error) {
                results.push({
                    url,
                    status: 'timeout/error',
                    success: false,
                    error: error.message
                });
            }
        }
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        if (successful.length > 0) {
            this.colorLog('✅ 可访问的API服务:', 'green');
            successful.forEach(result => {
                this.colorLog(`   ${result.url} (${result.status})`, 'green');
            });
        }
        
        if (failed.length > 0) {
            this.colorLog('\n⚠️  无法访问的API服务:', 'yellow');
            failed.forEach(result => {
                this.colorLog(`   ${result.url} (${result.status})`, 'yellow');
                if (result.error) {
                    this.colorLog(`     错误: ${result.error}`, 'red');
                }
            });
            
            if (process.env.PROXY_ENABLED !== 'true') {
                this.colorLog('\n💡 如果无法访问国外API，请考虑配置代理', 'yellow');
            }
        }
        
        return successful.length > 0;
    }

    /**
     * 验证代理配置
     * @returns {boolean} 代理配置是否有效
     */
    validateProxyConfiguration() {
        if (process.env.PROXY_ENABLED !== 'true') {
            return true; // 未启用代理，跳过验证
        }
        
        this.colorLog('\n🔧 验证代理配置...', 'cyan');
        
        const proxyHost = process.env.PROXY_HOST;
        const proxyPort = process.env.PROXY_PORT;
        const proxyProtocol = process.env.PROXY_PROTOCOL;
        
        const issues = [];
        
        if (!proxyHost) {
            issues.push('PROXY_HOST 未配置');
        }
        
        if (!proxyPort || isNaN(parseInt(proxyPort))) {
            issues.push('PROXY_PORT 未配置或格式无效');
        }
        
        if (!proxyProtocol || !['http', 'https', 'socks4', 'socks5'].includes(proxyProtocol)) {
            issues.push('PROXY_PROTOCOL 未配置或值无效');
        }
        
        if (issues.length === 0) {
            this.colorLog('✅ 代理配置有效:', 'green');
            this.colorLog(`   协议: ${proxyProtocol}`, 'green');
            this.colorLog(`   地址: ${proxyHost}:${proxyPort}`, 'green');
            return true;
        } else {
            this.colorLog('❌ 代理配置问题:', 'red');
            issues.forEach(issue => {
                this.colorLog(`   ${issue}`, 'red');
            });
            return false;
        }
    }

    /**
     * 生成配置报告
     */
    generateReport() {
        this.colorLog('\n📊 生成配置报告...', 'cyan');
        
        const report = {
            timestamp: new Date().toISOString(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            },
            configuration: {
                envVarsConfigured: this.requiredEnvVars.filter(key => process.env[key]).length,
                totalEnvVars: this.requiredEnvVars.length,
                configFilesPresent: this.configFiles.filter(file => fs.existsSync(file)).length,
                totalConfigFiles: this.configFiles.length,
                proxyEnabled: process.env.PROXY_ENABLED === 'true',
                currentProvider: process.env.CURRENT_AI_PROVIDER || 'not set'
            }
        };
        
        const reportPath = 'config-validation-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.colorLog(`✅ 配置报告已保存: ${reportPath}`, 'green');
    }

    /**
     * 提供修复建议
     */
    provideSuggestions() {
        this.colorLog('\n💡 修复建议:', 'yellow');
        
        const suggestions = [];
        
        // 检查是否有.env文件
        if (!fs.existsSync('.env')) {
            suggestions.push('创建.env文件: cp .env.example .env');
        }
        
        // 检查API密钥
        const missingKeys = this.requiredEnvVars.filter(key => !process.env[key]);
        if (missingKeys.length > 0) {
            suggestions.push('配置缺失的API密钥，运行: node scripts/generate-config.js');
        }
        
        // 检查文件权限
        if (fs.existsSync('.env')) {
            try {
                const stats = fs.statSync('.env');
                const mode = stats.mode & parseInt('777', 8);
                if (mode !== parseInt('600', 8)) {
                    suggestions.push('修复.env文件权限: chmod 600 .env');
                }
            } catch (error) {
                // 忽略权限检查错误
            }
        }
        
        // 网络连接建议
        if (process.env.PROXY_ENABLED !== 'true') {
            suggestions.push('如果无法访问国外API，配置代理: PROXY_ENABLED=true');
        }
        
        if (suggestions.length > 0) {
            suggestions.forEach((suggestion, index) => {
                this.colorLog(`${index + 1}. ${suggestion}`, 'yellow');
            });
        } else {
            this.colorLog('配置看起来不错！', 'green');
        }
    }

    /**
     * 运行完整验证
     */
    async run() {
        this.colorLog('🚀 恋语AI配置验证器', 'magenta');
        this.colorLog('正在验证项目配置...\n', 'cyan');
        
        const results = {
            envVars: false,
            configFiles: false,
            proxy: false,
            network: false
        };
        
        try {
            // 验证环境变量
            results.envVars = this.validateEnvironmentVariables();
            
            // 验证配置文件
            results.configFiles = this.validateConfigFiles();
            
            // 验证代理配置
            results.proxy = this.validateProxyConfiguration();
            
            // 验证网络连接
            results.network = await this.validateNetworkConnectivity();
            
            // 生成报告
            this.generateReport();
            
            // 提供建议
            this.provideSuggestions();
            
            // 总结
            this.colorLog('\n📋 验证总结:', 'cyan');
            const passed = Object.values(results).filter(Boolean).length;
            const total = Object.keys(results).length;
            
            if (passed === total) {
                this.colorLog('🎉 所有验证项目都通过了！', 'green');
                this.colorLog('您的配置已准备就绪，可以启动应用了。', 'green');
                process.exit(0);
            } else {
                this.colorLog(`⚠️  ${passed}/${total} 个验证项目通过`, 'yellow');
                this.colorLog('请根据上述建议修复配置问题。', 'yellow');
                process.exit(1);
            }
            
        } catch (error) {
            this.colorLog(`❌ 验证过程中发生错误: ${error.message}`, 'red');
            process.exit(1);
        }
    }
}

// 运行验证
if (require.main === module) {
    const validator = new ConfigValidator();
    validator.run();
}

module.exports = ConfigValidator;