#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 获取环境参数
const environment = process.argv[2] || 'development';

if (!['development', 'production'].includes(environment)) {
  console.error('错误: 环境参数必须是 development 或 production');
  process.exit(1);
}

console.log(`正在为 ${environment} 环境生成配置文件...`);

// 读取主配置文件
const configPath = path.join(__dirname, '../config/app-config.json');
if (!fs.existsSync(configPath)) {
  console.error('错误: 主配置文件不存在:', configPath);
  process.exit(1);
}

const appConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const envConfig = appConfig[environment];

if (!envConfig) {
  console.error(`错误: 配置文件中不存在 ${environment} 环境配置`);
  process.exit(1);
}

// 生成 env-loader.js
const envLoaderContent = `// 自动生成的配置文件 - 请勿手动修改
// 生成时间: ${new Date().toISOString()}
// 环境: ${environment}

class EnvironmentLoader {
    constructor() {
        this.environment = '${environment}';
    }

    getEnvironment() {
        return this.environment;
    }

    getApiBaseUrl() {
        return '${envConfig.backend.url}';
    }

    getFrontendUrl() {
        return '${envConfig.frontend.url}';
    }

    isDevelopment() {
        return this.environment === 'development';
    }

    isProduction() {
        return this.environment === 'production';
    }
}

// 全局实例
window.EnvLoader = new EnvironmentLoader();

// 兼容旧版本
window.getApiBaseUrl = () => window.EnvLoader.getApiBaseUrl();
window.getFrontendUrl = () => window.EnvLoader.getFrontendUrl();
`;

fs.writeFileSync(path.join(__dirname, '../config/env-loader.js'), envLoaderContent);
console.log('✅ 生成 env-loader.js');

// 生成 app-config.js
const appConfigContent = `// 自动生成的配置文件 - 请勿手动修改
// 生成时间: ${new Date().toISOString()}
// 环境: ${environment}

window.AppConfig = {
    environment: '${environment}',
    frontend: {
        port: ${envConfig.frontend.port},
        host: '${envConfig.frontend.host}',
        url: '${envConfig.frontend.url}'
    },
    backend: {
        port: ${envConfig.backend.port},
        host: '${envConfig.backend.host}',
        url: '${envConfig.backend.url}',
        apiPrefix: '${envConfig.backend.apiPrefix}'
    },
    database: {
        host: '${envConfig.database.host}',
        port: ${envConfig.database.port},
        name: '${envConfig.database.name}',
        user: '${envConfig.database.user}'
    },
    oauth: ${JSON.stringify(envConfig.oauth, null, 8)}
};

// 兼容性函数
window.getConfig = () => window.AppConfig;
`;

fs.writeFileSync(path.join(__dirname, '../config/app-config.js'), appConfigContent);
console.log('✅ 生成 app-config.js');

// 生成后端环境配置文件
const backendEnvContent = `# 自动生成的环境配置文件 - 请勿手动修改
# 生成时间: ${new Date().toISOString()}
# 环境: ${environment}

NODE_ENV=${environment}
PORT=${envConfig.backend.port}
HOST=${envConfig.backend.host}

# 数据库配置
DB_HOST=${envConfig.database.host}
DB_PORT=${envConfig.database.port}
DB_NAME=${envConfig.database.name}
DB_USER=${envConfig.database.user}
DB_PASSWORD=${envConfig.database.password}

# API配置
API_PREFIX=${envConfig.backend.apiPrefix}

# CORS配置
CORS_ORIGIN=${envConfig.frontend.url}
`;

fs.writeFileSync(path.join(__dirname, '../backend/.env'), backendEnvContent);
console.log('✅ 生成 backend/.env');

console.log('\n🎉 配置文件生成完成!');
console.log('\n生成的文件:');
console.log('- config/env-loader.js');
console.log('- config/app-config.js');
console.log('- backend/.env');
console.log('\n使用方法:');
console.log('- 验证配置: npm run config:validate');
console.log(`- 启动${environment}环境: npm run start:${environment}`);

// 退出程序
process.exit(0);