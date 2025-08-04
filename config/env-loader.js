// 自动生成的配置文件 - 请勿手动修改
// 生成时间: 2025-08-03T06:03:35.312Z
// 环境: production

class EnvironmentLoader {
    constructor() {
        this.environment = 'production';
    }

    getEnvironment() {
        return this.environment;
    }

    getApiBaseUrl() {
        return 'http://152.32.218.174:3000';
    }

    getFrontendUrl() {
        return 'http://152.32.218.174';
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
