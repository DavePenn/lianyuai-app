#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * API密钥获取工具
 * 从恋语AI项目配置中提取和显示API密钥信息
 */
class APIKeyExtractor {
    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m'
        };
        
        this.apiKeys = {};
        this.configFiles = [
            '.env',
            'backend/.env',
            'ai-config.json'
        ];
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
     * 显示标题
     */
    showHeader() {
        this.colorLog('\n🔑 恋语AI - API密钥获取工具', 'magenta');
        this.colorLog('═'.repeat(60), 'cyan');
        this.colorLog('从项目配置文件中提取API密钥信息', 'cyan');
        this.colorLog('═'.repeat(60), 'cyan');
    }

    /**
     * 掩码显示API密钥
     * @param {string} apiKey - API密钥
     * @param {boolean} showFull - 是否显示完整密钥
     * @returns {string} 掩码后的密钥
     */
    maskAPIKey(apiKey, showFull = false) {
        if (!apiKey || apiKey === '' || apiKey.includes('YOUR_') || apiKey.includes('PLACEHOLDER')) {
            return '未配置';
        }
        
        if (showFull) {
            return apiKey;
        }
        
        if (apiKey.length < 8) {
            return '***';
        }
        
        const start = apiKey.substring(0, 6);
        const end = apiKey.substring(apiKey.length - 4);
        const middle = '*'.repeat(Math.min(apiKey.length - 10, 12));
        
        return `${start}${middle}${end}`;
    }

    /**
     * 解析.env文件
     * @param {string} filePath - 文件路径
     * @returns {Object} 解析后的环境变量
     */
    parseEnvFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                return {};
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const env = {};
            
            content.split('\n').forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#') && line.includes('=')) {
                    const [key, ...valueParts] = line.split('=');
                    const value = valueParts.join('=').trim();
                    env[key.trim()] = value.replace(/^["']|["']$/g, ''); // 移除引号
                }
            });
            
            return env;
        } catch (error) {
            this.colorLog(`⚠️  读取${filePath}失败: ${error.message}`, 'yellow');
            return {};
        }
    }

    /**
     * 解析JSON配置文件
     * @param {string} filePath - 文件路径
     * @returns {Object} 解析后的JSON对象
     */
    parseJSONFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                return {};
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            this.colorLog(`⚠️  读取${filePath}失败: ${error.message}`, 'yellow');
            return {};
        }
    }

    /**
     * 从环境变量中提取API密钥
     * @param {Object} env - 环境变量对象
     * @returns {Object} API密钥对象
     */
    extractAPIKeysFromEnv(env) {
        const keys = {};
        
        // 定义API密钥字段映射
        const keyMappings = {
            'OpenAI': {
                apiKey: env.OPENAI_API_KEY,
                baseURL: env.OPENAI_BASE_URL,
                model: env.OPENAI_MODEL,
                temperature: env.OPENAI_TEMPERATURE,
                maxTokens: env.OPENAI_MAX_TOKENS
            },
            'Claude': {
                apiKey: env.CLAUDE_API_KEY,
                baseURL: env.CLAUDE_BASE_URL,
                model: env.CLAUDE_MODEL,
                temperature: env.CLAUDE_TEMPERATURE,
                maxTokens: env.CLAUDE_MAX_TOKENS
            },
            'Gemini': {
                apiKey: env.GEMINI_API_KEY,
                baseURL: env.GEMINI_BASE_URL,
                model: env.GEMINI_MODEL,
                temperature: env.GEMINI_TEMPERATURE,
                maxTokens: env.GEMINI_MAX_TOKENS
            },
            'Qmax': {
                apiKey: env.QMAX_API_KEY,
                baseURL: env.QMAX_BASE_URL,
                model: env.QMAX_MODEL,
                temperature: env.QMAX_TEMPERATURE,
                maxTokens: env.QMAX_MAX_TOKENS
            }
        };
        
        // 提取每个服务的配置
        Object.keys(keyMappings).forEach(service => {
            const config = keyMappings[service];
            if (config.apiKey) {
                keys[service] = config;
            }
        });
        
        // 添加其他重要配置
        keys.system = {
            currentProvider: env.CURRENT_AI_PROVIDER,
            nodeEnv: env.NODE_ENV,
            port: env.PORT,
            proxyEnabled: env.PROXY_ENABLED,
            proxyHost: env.PROXY_HOST,
            proxyPort: env.PROXY_PORT,
            jwtSecret: env.JWT_SECRET,
            encryptionKey: env.ENCRYPTION_KEY
        };
        
        return keys;
    }

    /**
     * 从JSON配置中提取API密钥
     * @param {Object} config - JSON配置对象
     * @returns {Object} API密钥对象
     */
    extractAPIKeysFromJSON(config) {
        const keys = {};
        
        if (config.providers) {
            Object.keys(config.providers).forEach(provider => {
                const providerConfig = config.providers[provider];
                if (providerConfig.apiKey) {
                    const serviceName = provider.charAt(0).toUpperCase() + provider.slice(1);
                    keys[serviceName] = {
                        apiKey: providerConfig.apiKey,
                        baseURL: providerConfig.baseURL,
                        model: providerConfig.model,
                        temperature: providerConfig.temperature,
                        maxTokens: providerConfig.maxTokens
                    };
                }
            });
        }
        
        keys.system = {
            currentProvider: config.currentProvider,
            proxyEnabled: config.proxy?.enabled,
            proxyHost: config.proxy?.host,
            proxyPort: config.proxy?.port
        };
        
        return keys;
    }

    /**
     * 收集所有配置文件中的API密钥
     */
    collectAPIKeys() {
        this.colorLog('\n📂 扫描配置文件...', 'cyan');
        
        const allKeys = {};
        
        // 扫描.env文件
        ['.env', 'backend/.env'].forEach(envFile => {
            if (fs.existsSync(envFile)) {
                this.colorLog(`   ✅ 找到 ${envFile}`, 'green');
                const env = this.parseEnvFile(envFile);
                const keys = this.extractAPIKeysFromEnv(env);
                
                // 合并配置
                Object.keys(keys).forEach(service => {
                    if (!allKeys[service]) {
                        allKeys[service] = {};
                    }
                    Object.assign(allKeys[service], keys[service]);
                });
            } else {
                this.colorLog(`   ❌ 未找到 ${envFile}`, 'red');
            }
        });
        
        // 扫描JSON配置文件
        if (fs.existsSync('ai-config.json')) {
            this.colorLog(`   ✅ 找到 ai-config.json`, 'green');
            const jsonConfig = this.parseJSONFile('ai-config.json');
            const keys = this.extractAPIKeysFromJSON(jsonConfig);
            
            // 合并配置（JSON配置优先级较低）
            Object.keys(keys).forEach(service => {
                if (!allKeys[service]) {
                    allKeys[service] = keys[service];
                } else {
                    // 只填充缺失的字段
                    Object.keys(keys[service]).forEach(key => {
                        if (!allKeys[service][key]) {
                            allKeys[service][key] = keys[service][key];
                        }
                    });
                }
            });
        } else {
            this.colorLog(`   ❌ 未找到 ai-config.json`, 'red');
        }
        
        this.apiKeys = allKeys;
    }

    /**
     * 显示API密钥信息
     * @param {boolean} showFull - 是否显示完整密钥
     */
    displayAPIKeys(showFull = false) {
        this.colorLog('\n🔑 API密钥配置信息', 'cyan');
        this.colorLog('═'.repeat(60), 'blue');
        
        if (showFull) {
            this.colorLog('⚠️  警告：正在显示完整API密钥，请确保环境安全！', 'red');
            this.colorLog('-'.repeat(60), 'yellow');
        }
        
        // 显示系统配置
        if (this.apiKeys.system) {
            this.colorLog('\n🔧 系统配置:', 'yellow');
            const sys = this.apiKeys.system;
            
            this.colorLog(`   当前AI提供商: ${sys.currentProvider || '未配置'}`, 'white');
            this.colorLog(`   运行环境: ${sys.nodeEnv || '未配置'}`, 'white');
            this.colorLog(`   服务端口: ${sys.port || '未配置'}`, 'white');
            
            if (sys.proxyEnabled === 'true' || sys.proxyEnabled === true) {
                this.colorLog(`   代理状态: 已启用`, 'green');
                this.colorLog(`   代理地址: ${sys.proxyHost}:${sys.proxyPort}`, 'white');
            } else {
                this.colorLog(`   代理状态: 未启用`, 'red');
            }
            
            if (sys.jwtSecret) {
                this.colorLog(`   JWT密钥: ${this.maskAPIKey(sys.jwtSecret, showFull)}`, 'white');
            }
        }
        
        // 显示AI服务配置
        const aiServices = ['OpenAI', 'Claude', 'Gemini', 'Qmax'];
        let hasAnyAPI = false;
        
        aiServices.forEach(service => {
            if (this.apiKeys[service] && this.apiKeys[service].apiKey) {
                hasAnyAPI = true;
                const config = this.apiKeys[service];
                
                this.colorLog(`\n🤖 ${service} 配置:`, 'yellow');
                this.colorLog(`   API密钥: ${this.maskAPIKey(config.apiKey, showFull)}`, 
                    config.apiKey && !config.apiKey.includes('YOUR_') ? 'green' : 'red');
                
                if (config.baseURL) {
                    this.colorLog(`   基础URL: ${config.baseURL}`, 'white');
                }
                if (config.model) {
                    this.colorLog(`   默认模型: ${config.model}`, 'white');
                }
                if (config.temperature) {
                    this.colorLog(`   温度参数: ${config.temperature}`, 'white');
                }
                if (config.maxTokens) {
                    this.colorLog(`   最大令牌: ${config.maxTokens}`, 'white');
                }
            }
        });
        
        if (!hasAnyAPI) {
            this.colorLog('\n❌ 未找到任何有效的API密钥配置', 'red');
            this.colorLog('请运行配置生成器: node scripts/generate-config.js', 'yellow');
        }
    }

    /**
     * 验证API密钥有效性
     */
    validateAPIKeys() {
        this.colorLog('\n🔍 验证API密钥有效性', 'cyan');
        this.colorLog('-'.repeat(40), 'blue');
        
        const aiServices = ['OpenAI', 'Claude', 'Gemini', 'Qmax'];
        let validCount = 0;
        let totalCount = 0;
        
        aiServices.forEach(service => {
            if (this.apiKeys[service]) {
                totalCount++;
                const config = this.apiKeys[service];
                const apiKey = config.apiKey;
                
                if (!apiKey || apiKey === '' || apiKey.includes('YOUR_') || apiKey.includes('PLACEHOLDER')) {
                    this.colorLog(`   ❌ ${service}: 未配置或使用占位符`, 'red');
                } else if (this.isValidAPIKeyFormat(service, apiKey)) {
                    this.colorLog(`   ✅ ${service}: 格式正确`, 'green');
                    validCount++;
                } else {
                    this.colorLog(`   ⚠️  ${service}: 格式可能不正确`, 'yellow');
                }
            }
        });
        
        this.colorLog(`\n📊 验证结果: ${validCount}/${totalCount} 个API密钥格式正确`, 
            validCount === totalCount ? 'green' : 'yellow');
        
        if (validCount === 0) {
            this.colorLog('\n💡 建议:', 'yellow');
            this.colorLog('   1. 运行配置生成器: node scripts/generate-config.js', 'white');
            this.colorLog('   2. 手动编辑.env文件添加API密钥', 'white');
            this.colorLog('   3. 参考API_KEY_CONFIGURATION_GUIDE.md文档', 'white');
        }
    }

    /**
     * 验证API密钥格式
     * @param {string} service - 服务名称
     * @param {string} apiKey - API密钥
     * @returns {boolean} 是否格式正确
     */
    isValidAPIKeyFormat(service, apiKey) {
        const patterns = {
            'OpenAI': /^sk-[a-zA-Z0-9]{48,}$/,
            'Claude': /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
            'Gemini': /^[a-zA-Z0-9\-_]{39}$/,
            'Qmax': /^sk-[a-zA-Z0-9]{32,}$/
        };
        
        const pattern = patterns[service];
        return pattern ? pattern.test(apiKey) : apiKey.length > 10;
    }

    /**
     * 导出API密钥到文件
     * @param {string} format - 导出格式 (json|env|yaml)
     * @param {boolean} includeSecrets - 是否包含敏感信息
     */
    exportAPIKeys(format = 'json', includeSecrets = false) {
        this.colorLog(`\n📤 导出API密钥配置 (${format.toUpperCase()}格式)`, 'cyan');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `api-keys-export-${timestamp}.${format}`;
        
        try {
            let content = '';
            
            if (format === 'json') {
                const exportData = {
                    exportTime: new Date().toISOString(),
                    includeSecrets: includeSecrets,
                    apiKeys: {}
                };
                
                Object.keys(this.apiKeys).forEach(service => {
                    if (service !== 'system') {
                        const config = this.apiKeys[service];
                        exportData.apiKeys[service] = {
                            apiKey: includeSecrets ? config.apiKey : this.maskAPIKey(config.apiKey),
                            baseURL: config.baseURL,
                            model: config.model,
                            temperature: config.temperature,
                            maxTokens: config.maxTokens
                        };
                    }
                });
                
                if (this.apiKeys.system) {
                    exportData.system = {
                        currentProvider: this.apiKeys.system.currentProvider,
                        proxyEnabled: this.apiKeys.system.proxyEnabled,
                        proxyHost: this.apiKeys.system.proxyHost,
                        proxyPort: this.apiKeys.system.proxyPort
                    };
                }
                
                content = JSON.stringify(exportData, null, 2);
                
            } else if (format === 'env') {
                content = `# 恋语AI API密钥配置\n# 导出时间: ${new Date().toISOString()}\n\n`;
                
                Object.keys(this.apiKeys).forEach(service => {
                    if (service !== 'system') {
                        const config = this.apiKeys[service];
                        const serviceUpper = service.toUpperCase();
                        
                        content += `# ${service} 配置\n`;
                        content += `${serviceUpper}_API_KEY=${includeSecrets ? config.apiKey : 'YOUR_' + serviceUpper + '_API_KEY'}\n`;
                        if (config.baseURL) content += `${serviceUpper}_BASE_URL=${config.baseURL}\n`;
                        if (config.model) content += `${serviceUpper}_MODEL=${config.model}\n`;
                        content += '\n';
                    }
                });
            }
            
            fs.writeFileSync(filename, content);
            
            if (includeSecrets) {
                // 设置文件权限为只读
                try {
                    fs.chmodSync(filename, 0o600);
                } catch (error) {
                    // Windows系统忽略权限设置错误
                }
                this.colorLog(`   ⚠️  文件包含敏感信息，已设置为只读权限`, 'yellow');
            }
            
            this.colorLog(`   ✅ 导出成功: ${filename}`, 'green');
            
        } catch (error) {
            this.colorLog(`   ❌ 导出失败: ${error.message}`, 'red');
        }
    }

    /**
     * 显示使用帮助
     */
    showHelp() {
        this.colorLog('\n📖 使用帮助', 'cyan');
        this.colorLog('═'.repeat(50), 'blue');
        
        this.colorLog('\n🔧 命令选项:', 'yellow');
        this.colorLog('   node scripts/get-api-keys.js              - 显示掩码后的API密钥', 'white');
        this.colorLog('   node scripts/get-api-keys.js --show-full  - 显示完整API密钥', 'white');
        this.colorLog('   node scripts/get-api-keys.js --validate   - 验证API密钥格式', 'white');
        this.colorLog('   node scripts/get-api-keys.js --export     - 导出API密钥(JSON)', 'white');
        this.colorLog('   node scripts/get-api-keys.js --export-env - 导出API密钥(ENV)', 'white');
        this.colorLog('   node scripts/get-api-keys.js --export-full- 导出完整API密钥', 'white');
        this.colorLog('   node scripts/get-api-keys.js --help       - 显示帮助信息', 'white');
        
        this.colorLog('\n📁 配置文件位置:', 'yellow');
        this.colorLog('   ./.env                    - 根目录环境变量', 'white');
        this.colorLog('   ./backend/.env            - 后端环境变量', 'white');
        this.colorLog('   ./ai-config.json          - AI配置文件', 'white');
        
        this.colorLog('\n🔗 相关工具:', 'yellow');
        this.colorLog('   node scripts/generate-config.js  - 配置生成器', 'white');
        this.colorLog('   node scripts/validate-config.js  - 配置验证器', 'white');
        
        this.colorLog('\n⚠️  安全提醒:', 'red');
        this.colorLog('   - 请勿在不安全的环境中使用 --show-full 选项', 'white');
        this.colorLog('   - 导出的完整密钥文件请妥善保管', 'white');
        this.colorLog('   - 不要将API密钥提交到版本控制系统', 'white');
    }

    /**
     * 运行API密钥提取器
     * @param {Array} args - 命令行参数
     */
    run(args = []) {
        this.showHeader();
        
        // 解析命令行参数
        const showFull = args.includes('--show-full');
        const validate = args.includes('--validate');
        const exportJSON = args.includes('--export');
        const exportEnv = args.includes('--export-env');
        const exportFull = args.includes('--export-full');
        const showHelp = args.includes('--help') || args.includes('-h');
        
        if (showHelp) {
            this.showHelp();
            return;
        }
        
        // 收集API密钥
        this.collectAPIKeys();
        
        // 根据参数执行相应操作
        if (validate) {
            this.validateAPIKeys();
        } else if (exportJSON) {
            this.exportAPIKeys('json', exportFull);
        } else if (exportEnv) {
            this.exportAPIKeys('env', exportFull);
        } else {
            this.displayAPIKeys(showFull);
            
            if (!showFull) {
                this.colorLog('\n💡 提示: 使用 --show-full 显示完整API密钥', 'blue');
            }
        }
        
        this.colorLog('\n🔗 更多选项请使用 --help 查看', 'cyan');
    }
}

// 运行提取器
if (require.main === module) {
    const extractor = new APIKeyExtractor();
    const args = process.argv.slice(2);
    extractor.run(args);
}

module.exports = APIKeyExtractor;