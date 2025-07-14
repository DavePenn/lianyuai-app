#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * 交互式配置生成器
 * 帮助用户生成恋语AI项目的配置文件
 */
class ConfigGenerator {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.config = {};
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
        };
    }

    /**
     * 彩色输出
     * @param {string} message - 消息内容
     * @param {string} color - 颜色
     */
    colorLog(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }

    /**
     * 询问用户输入
     * @param {string} question - 问题
     * @param {string} defaultValue - 默认值
     * @param {boolean} isPassword - 是否是密码（隐藏输入）
     * @returns {Promise<string>} 用户输入
     */
    async ask(question, defaultValue = '', isPassword = false) {
        return new Promise((resolve) => {
            const prompt = defaultValue ? 
                `${question} (默认: ${defaultValue}): ` : 
                `${question}: `;
                
            if (isPassword) {
                // 对于密码输入，我们简化处理
                this.rl.question(prompt, (answer) => {
                    resolve(answer.trim() || defaultValue);
                });
            } else {
                this.rl.question(prompt, (answer) => {
                    resolve(answer.trim() || defaultValue);
                });
            }
        });
    }

    /**
     * 显示欢迎信息
     */
    showWelcome() {
        this.colorLog('\n🚀 恋语AI配置生成器', 'magenta');
        this.colorLog('═'.repeat(50), 'cyan');
        this.colorLog('这个工具将帮助您生成项目配置文件', 'cyan');
        this.colorLog('请按照提示输入相关信息，如果暂时没有某项配置，可以留空稍后再填', 'yellow');
        this.colorLog('═'.repeat(50), 'cyan');
    }

    /**
     * 收集基本配置
     */
    async collectBasicConfig() {
        this.colorLog('\n📋 基本配置', 'cyan');
        this.colorLog('-'.repeat(30), 'blue');
        
        this.config.NODE_ENV = await this.ask(
            '运行环境 (development/production)', 
            'production'
        );
        
        this.config.PORT = await this.ask(
            '服务器端口', 
            '3000'
        );
        
        this.config.CURRENT_AI_PROVIDER = await this.ask(
            '默认AI提供商 (openai/claude/gemini/qmax)', 
            'gemini'
        );
    }

    /**
     * 收集API密钥配置
     */
    async collectAPIKeys() {
        this.colorLog('\n🔑 AI服务API密钥配置', 'cyan');
        this.colorLog('-'.repeat(30), 'blue');
        this.colorLog('提示：如果暂时没有某个服务的API密钥，可以留空，稍后再配置', 'yellow');
        
        // OpenAI配置
        this.colorLog('\n🤖 OpenAI配置:', 'green');
        this.config.OPENAI_API_KEY = await this.ask('OpenAI API密钥 (sk-...)');
        if (this.config.OPENAI_API_KEY) {
            this.config.OPENAI_BASE_URL = await this.ask(
                'OpenAI API基础URL', 
                'https://api.openai.com/v1'
            );
            this.config.OPENAI_MODEL = await this.ask(
                'OpenAI默认模型', 
                'gpt-3.5-turbo'
            );
        }
        
        // Claude配置
        this.colorLog('\n🧠 Claude配置:', 'green');
        this.config.CLAUDE_API_KEY = await this.ask('Claude API密钥 (sk-ant-...)');
        if (this.config.CLAUDE_API_KEY) {
            this.config.CLAUDE_BASE_URL = await this.ask(
                'Claude API基础URL', 
                'https://api.anthropic.com'
            );
            this.config.CLAUDE_MODEL = await this.ask(
                'Claude默认模型', 
                'claude-3-sonnet-20240229'
            );
        }
        
        // Gemini配置
        this.colorLog('\n💎 Gemini配置:', 'green');
        this.config.GEMINI_API_KEY = await this.ask('Gemini API密钥');
        if (this.config.GEMINI_API_KEY) {
            this.config.GEMINI_BASE_URL = await this.ask(
                'Gemini API基础URL', 
                'https://generativelanguage.googleapis.com/v1beta'
            );
            this.config.GEMINI_MODEL = await this.ask(
                'Gemini默认模型', 
                'gemini-1.5-flash'
            );
        }
        
        // 通义千问配置
        this.colorLog('\n🇨🇳 通义千问配置:', 'green');
        this.config.QMAX_API_KEY = await this.ask('通义千问API密钥 (sk-...)');
        if (this.config.QMAX_API_KEY) {
            this.config.QMAX_BASE_URL = await this.ask(
                '通义千问API基础URL', 
                'https://dashscope.aliyuncs.com/compatible-mode/v1'
            );
            this.config.QMAX_MODEL = await this.ask(
                '通义千问默认模型', 
                'qwen-plus'
            );
        }
        
        // 通用AI参数
        this.colorLog('\n⚙️  AI参数配置:', 'blue');
        this.config.AI_TEMPERATURE = await this.ask(
            'AI温度参数 (0.0-2.0)', 
            '0.7'
        );
        this.config.AI_MAX_TOKENS = await this.ask(
            'AI最大令牌数', 
            '2000'
        );
    }

    /**
     * 收集代理配置
     */
    async collectProxyConfig() {
        this.colorLog('\n🌐 代理配置（用于访问国外API）', 'cyan');
        this.colorLog('-'.repeat(30), 'blue');
        
        const useProxy = await this.ask('是否使用代理？(y/n)', 'n');
        
        if (useProxy.toLowerCase() === 'y' || useProxy.toLowerCase() === 'yes') {
            this.config.PROXY_ENABLED = 'true';
            
            this.config.PROXY_HOST = await this.ask('代理主机地址', '127.0.0.1');
            this.config.PROXY_PORT = await this.ask('代理端口', '7890');
            this.config.PROXY_PROTOCOL = await this.ask(
                '代理协议 (http/https/socks4/socks5)', 
                'http'
            );
            
            const needAuth = await this.ask('代理是否需要认证？(y/n)', 'n');
            if (needAuth.toLowerCase() === 'y' || needAuth.toLowerCase() === 'yes') {
                this.config.PROXY_USERNAME = await this.ask('代理用户名');
                this.config.PROXY_PASSWORD = await this.ask('代理密码', '', true);
            }
            
            this.colorLog('✅ 代理配置完成', 'green');
        } else {
            this.config.PROXY_ENABLED = 'false';
            this.colorLog('ℹ️  跳过代理配置', 'blue');
        }
    }

    /**
     * 收集其他配置
     */
    async collectOtherConfig() {
        this.colorLog('\n🔧 其他配置', 'cyan');
        this.colorLog('-'.repeat(30), 'blue');
        
        // 日志配置
        this.config.LOG_LEVEL = await this.ask(
            '日志级别 (error/warn/info/debug)', 
            'info'
        );
        
        // CORS配置
        this.config.CORS_ORIGINS = await this.ask(
            'CORS允许的域名 (用逗号分隔)', 
            'http://localhost:3000,http://127.0.0.1:3000'
        );
        
        // JWT密钥
        this.config.JWT_SECRET = await this.ask(
            'JWT密钥 (留空将自动生成)', 
            this.generateRandomSecret()
        );
        
        // 加密密钥
        this.config.ENCRYPTION_KEY = await this.ask(
            '加密密钥 (留空将自动生成)', 
            this.generateRandomSecret()
        );
    }

    /**
     * 生成随机密钥
     * @param {number} length - 密钥长度
     * @returns {string} 随机密钥
     */
    generateRandomSecret(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 显示配置预览
     */
    showConfigPreview() {
        this.colorLog('\n📋 配置预览', 'cyan');
        this.colorLog('═'.repeat(50), 'blue');
        
        // 基本配置
        this.colorLog('\n🔧 基本配置:', 'yellow');
        this.colorLog(`   环境: ${this.config.NODE_ENV}`, 'white');
        this.colorLog(`   端口: ${this.config.PORT}`, 'white');
        this.colorLog(`   默认AI: ${this.config.CURRENT_AI_PROVIDER}`, 'white');
        
        // API密钥配置
        this.colorLog('\n🔑 API密钥配置:', 'yellow');
        const apiKeys = [
            'OPENAI_API_KEY',
            'CLAUDE_API_KEY',
            'GEMINI_API_KEY',
            'QMAX_API_KEY'
        ];
        
        apiKeys.forEach(key => {
            const value = this.config[key];
            if (value) {
                const masked = this.maskAPIKey(value);
                this.colorLog(`   ${key}: ${masked}`, 'green');
            } else {
                this.colorLog(`   ${key}: 未配置`, 'red');
            }
        });
        
        // 代理配置
        this.colorLog('\n🌐 代理配置:', 'yellow');
        if (this.config.PROXY_ENABLED === 'true') {
            this.colorLog(`   启用: 是`, 'green');
            this.colorLog(`   地址: ${this.config.PROXY_HOST}:${this.config.PROXY_PORT}`, 'white');
            this.colorLog(`   协议: ${this.config.PROXY_PROTOCOL}`, 'white');
        } else {
            this.colorLog(`   启用: 否`, 'red');
        }
        
        this.colorLog('═'.repeat(50), 'blue');
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
        const middle = '*'.repeat(Math.min(apiKey.length - 10, 12));
        
        return `${start}${middle}${end}`;
    }

    /**
     * 确认配置
     * @returns {Promise<boolean>} 是否确认
     */
    async confirmConfig() {
        const confirm = await this.ask('\n确认生成配置文件？(y/n)', 'y');
        return confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes';
    }

    /**
     * 生成.env文件内容
     * @returns {string} .env文件内容
     */
    generateEnvContent() {
        const timestamp = new Date().toISOString();
        
        return `# 恋语AI 环境配置文件
# 自动生成于 ${timestamp}
# 配置生成器版本: 1.0.0

# ===================
# 基本配置
# ===================

# 运行环境
NODE_ENV=${this.config.NODE_ENV || 'production'}

# 服务器端口
PORT=${this.config.PORT || '3000'}

# 当前使用的AI提供商
CURRENT_AI_PROVIDER=${this.config.CURRENT_AI_PROVIDER || 'gemini'}

# ===================
# AI 模型配置
# ===================

# OpenAI 配置
OPENAI_API_KEY=${this.config.OPENAI_API_KEY || ''}
OPENAI_BASE_URL=${this.config.OPENAI_BASE_URL || 'https://api.openai.com/v1'}
OPENAI_MODEL=${this.config.OPENAI_MODEL || 'gpt-3.5-turbo'}
OPENAI_TEMPERATURE=${this.config.AI_TEMPERATURE || '0.7'}
OPENAI_MAX_TOKENS=${this.config.AI_MAX_TOKENS || '2000'}

# Claude 配置
CLAUDE_API_KEY=${this.config.CLAUDE_API_KEY || ''}
CLAUDE_BASE_URL=${this.config.CLAUDE_BASE_URL || 'https://api.anthropic.com'}
CLAUDE_MODEL=${this.config.CLAUDE_MODEL || 'claude-3-sonnet-20240229'}
CLAUDE_TEMPERATURE=${this.config.AI_TEMPERATURE || '0.7'}
CLAUDE_MAX_TOKENS=${this.config.AI_MAX_TOKENS || '2000'}

# Gemini 配置
GEMINI_API_KEY=${this.config.GEMINI_API_KEY || ''}
GEMINI_BASE_URL=${this.config.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'}
GEMINI_MODEL=${this.config.GEMINI_MODEL || 'gemini-1.5-flash'}
GEMINI_TEMPERATURE=${this.config.AI_TEMPERATURE || '0.7'}
GEMINI_MAX_TOKENS=${this.config.AI_MAX_TOKENS || '2000'}

# 通义千问配置
QMAX_API_KEY=${this.config.QMAX_API_KEY || ''}
QMAX_BASE_URL=${this.config.QMAX_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'}
QMAX_MODEL=${this.config.QMAX_MODEL || 'qwen-plus'}
QMAX_TEMPERATURE=${this.config.AI_TEMPERATURE || '0.7'}
QMAX_MAX_TOKENS=${this.config.AI_MAX_TOKENS || '2000'}

# ===================
# 代理配置
# ===================

# 是否启用代理
PROXY_ENABLED=${this.config.PROXY_ENABLED || 'false'}

# 代理服务器配置
PROXY_HOST=${this.config.PROXY_HOST || ''}
PROXY_PORT=${this.config.PROXY_PORT || ''}
PROXY_PROTOCOL=${this.config.PROXY_PROTOCOL || 'http'}

# 代理认证
PROXY_USERNAME=${this.config.PROXY_USERNAME || ''}
PROXY_PASSWORD=${this.config.PROXY_PASSWORD || ''}

# ===================
# 安全配置
# ===================

# JWT 密钥
JWT_SECRET=${this.config.JWT_SECRET || this.generateRandomSecret()}

# 加密密钥
ENCRYPTION_KEY=${this.config.ENCRYPTION_KEY || this.generateRandomSecret()}

# CORS 允许的域名
CORS_ORIGINS=${this.config.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000'}

# ===================
# 日志配置
# ===================

# 日志级别
LOG_LEVEL=${this.config.LOG_LEVEL || 'info'}

# 调试模式
DEBUG=${this.config.NODE_ENV === 'development' ? 'true' : 'false'}

# ===================
# 其他配置
# ===================

# 应用名称
APP_NAME=恋语AI

# 应用版本
APP_VERSION=2.0.0

# 应用官网
APP_WEBSITE=https://lianyuai.com

# 客服邮箱
CUSTOMER_SERVICE_EMAIL=support@lianyuai.com
`;
    }

    /**
     * 生成ai-config.json文件内容
     * @returns {Object} AI配置对象
     */
    generateAIConfigContent() {
        return {
            currentProvider: this.config.CURRENT_AI_PROVIDER || 'gemini',
            providers: {
                openai: {
                    apiKey: this.config.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY',
                    baseURL: this.config.OPENAI_BASE_URL || 'https://api.openai.com/v1',
                    model: this.config.OPENAI_MODEL || 'gpt-3.5-turbo',
                    temperature: parseFloat(this.config.AI_TEMPERATURE || '0.7'),
                    maxTokens: parseInt(this.config.AI_MAX_TOKENS || '2000')
                },
                claude: {
                    apiKey: this.config.CLAUDE_API_KEY || 'YOUR_CLAUDE_API_KEY',
                    baseURL: this.config.CLAUDE_BASE_URL || 'https://api.anthropic.com',
                    model: this.config.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
                    temperature: parseFloat(this.config.AI_TEMPERATURE || '0.7'),
                    maxTokens: parseInt(this.config.AI_MAX_TOKENS || '2000')
                },
                gemini: {
                    apiKey: this.config.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
                    baseURL: this.config.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
                    model: this.config.GEMINI_MODEL || 'gemini-1.5-flash',
                    temperature: parseFloat(this.config.AI_TEMPERATURE || '0.7'),
                    maxTokens: parseInt(this.config.AI_MAX_TOKENS || '2000')
                },
                qmax: {
                    apiKey: this.config.QMAX_API_KEY || 'YOUR_QMAX_API_KEY',
                    baseURL: this.config.QMAX_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
                    model: this.config.QMAX_MODEL || 'qwen-plus',
                    temperature: parseFloat(this.config.AI_TEMPERATURE || '0.7'),
                    maxTokens: parseInt(this.config.AI_MAX_TOKENS || '2000')
                }
            },
            proxy: {
                enabled: this.config.PROXY_ENABLED === 'true',
                host: this.config.PROXY_HOST || '127.0.0.1',
                port: parseInt(this.config.PROXY_PORT || '7890'),
                protocol: this.config.PROXY_PROTOCOL || 'http'
            }
        };
    }

    /**
     * 写入配置文件
     */
    writeConfigFiles() {
        this.colorLog('\n📝 生成配置文件...', 'cyan');
        
        try {
            // 创建必要的目录
            if (!fs.existsSync('backend')) {
                fs.mkdirSync('backend', { recursive: true });
                this.colorLog('✅ 创建backend目录', 'green');
            }
            
            if (!fs.existsSync('scripts')) {
                fs.mkdirSync('scripts', { recursive: true });
                this.colorLog('✅ 创建scripts目录', 'green');
            }
            
            // 生成.env文件
            const envContent = this.generateEnvContent();
            
            // 写入根目录
            fs.writeFileSync('.env', envContent);
            this.colorLog('✅ 生成 ./.env', 'green');
            
            // 写入后端目录
            fs.writeFileSync('backend/.env', envContent);
            this.colorLog('✅ 生成 ./backend/.env', 'green');
            
            // 生成ai-config.json
            const aiConfig = this.generateAIConfigContent();
            fs.writeFileSync('ai-config.json', JSON.stringify(aiConfig, null, 2));
            this.colorLog('✅ 生成 ./ai-config.json', 'green');
            
            // 设置文件权限
            try {
                fs.chmodSync('.env', 0o600);
                fs.chmodSync('backend/.env', 0o600);
                this.colorLog('✅ 设置文件权限', 'green');
            } catch (error) {
                this.colorLog('⚠️  无法设置文件权限（Windows系统忽略）', 'yellow');
            }
            
            // 更新.gitignore
            this.updateGitignore();
            
            return true;
        } catch (error) {
            this.colorLog(`❌ 生成配置文件失败: ${error.message}`, 'red');
            return false;
        }
    }

    /**
     * 更新.gitignore文件
     */
    updateGitignore() {
        try {
            const gitignoreEntries = [
                '.env',
                'backend/.env',
                '*.env',
                'node_modules/',
                'logs/',
                '*.log',
                'config-validation-report.json'
            ];
            
            let gitignoreContent = '';
            
            // 读取现有.gitignore
            if (fs.existsSync('.gitignore')) {
                gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
            }
            
            // 添加缺失的条目
            let updated = false;
            gitignoreEntries.forEach(entry => {
                if (!gitignoreContent.includes(entry)) {
                    gitignoreContent += `\n${entry}`;
                    updated = true;
                }
            });
            
            if (updated) {
                fs.writeFileSync('.gitignore', gitignoreContent);
                this.colorLog('✅ 更新 .gitignore', 'green');
            }
        } catch (error) {
            this.colorLog('⚠️  更新.gitignore失败', 'yellow');
        }
    }

    /**
     * 显示完成信息
     */
    showCompletionInfo() {
        this.colorLog('\n🎉 配置生成完成！', 'green');
        this.colorLog('═'.repeat(50), 'cyan');
        
        this.colorLog('\n📁 生成的文件:', 'yellow');
        this.colorLog('   ./.env                    - 环境变量配置', 'white');
        this.colorLog('   ./backend/.env            - 后端环境变量配置', 'white');
        this.colorLog('   ./ai-config.json          - AI配置文件', 'white');
        
        this.colorLog('\n📝 下一步操作:', 'yellow');
        this.colorLog('   1. 验证配置: node scripts/validate-config.js', 'white');
        this.colorLog('   2. 安装依赖: npm install', 'white');
        this.colorLog('   3. 启动后端: cd backend && npm start', 'white');
        this.colorLog('   4. 访问应用: http://localhost:' + (this.config.PORT || '3000'), 'white');
        
        this.colorLog('\n💡 提示:', 'yellow');
        this.colorLog('   - 配置文件已设置为只读权限，保护您的API密钥', 'white');
        this.colorLog('   - 如需修改配置，可以重新运行此脚本或手动编辑.env文件', 'white');
        this.colorLog('   - 请妥善保管您的API密钥，不要提交到版本控制系统', 'white');
        
        this.colorLog('\n🔗 相关文档:', 'yellow');
        this.colorLog('   - API密钥配置指南: ./API_KEY_CONFIGURATION_GUIDE.md', 'white');
        this.colorLog('   - 快速部署指南: ./QUICK_DEPLOY_GUIDE.md', 'white');
        this.colorLog('   - 项目完成总结: ./PROJECT_COMPLETION_SUMMARY.md', 'white');
        
        this.colorLog('\n═'.repeat(50), 'cyan');
    }

    /**
     * 运行配置生成器
     */
    async run() {
        try {
            this.showWelcome();
            
            await this.collectBasicConfig();
            await this.collectAPIKeys();
            await this.collectProxyConfig();
            await this.collectOtherConfig();
            
            this.showConfigPreview();
            
            const confirmed = await this.confirmConfig();
            if (!confirmed) {
                this.colorLog('\n❌ 配置生成已取消', 'red');
                return;
            }
            
            const success = this.writeConfigFiles();
            if (success) {
                this.showCompletionInfo();
            }
            
        } catch (error) {
            this.colorLog(`\n❌ 配置生成失败: ${error.message}`, 'red');
            this.colorLog('请检查错误信息并重试', 'yellow');
        } finally {
            this.rl.close();
        }
    }
}

// 运行生成器
if (require.main === module) {
    const generator = new ConfigGenerator();
    generator.run();
}

module.exports = ConfigGenerator;