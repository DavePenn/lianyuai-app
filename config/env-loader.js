/**
 * 环境变量加载器
 * 用于在前端安全地加载环境配置
 */

class EnvLoader {
    constructor() {
        this.config = {};
        this.loadConfig();
    }

    /**
     * 加载配置
     */
    loadConfig() {
        // 检测环境
        this.environment = this.detectEnvironment();
        
        // 加载基础配置
        this.config = {
            environment: this.environment,
            isDevelopment: this.environment === 'development',
            isProduction: this.environment === 'production',
            
            // API配置
            apiBaseUrl: this.getApiBaseUrl(),
            frontendUrl: this.getFrontendUrl(),
            
            // OAuth配置
            oauth: {
                google: {
                    clientId: this.getGoogleClientId()
                }
            }
        };
        
        console.log('环境配置加载完成:', this.environment);
    }

    /**
     * 检测当前环境
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.includes('dev')) {
            // 本地开发环境
            if (window.location.port === '8080' || 
                window.location.port === '3000' || 
                window.location.port === '8000') {
                return 'development';
            }
        }
        
        return 'production';
    }

    /**
     * 获取API基础地址
     */
    getApiBaseUrl() {
        if (this.environment === 'development') {
            return 'http://localhost:3001';
        }
        return 'http://152.32.218.174:3000';
    }

    /**
     * 获取前端地址
     */
    getFrontendUrl() {
        if (this.environment === 'development') {
            return 'http://localhost:8080';
        }
        return 'http://152.32.218.174:8000';
    }

    /**
     * 获取Google客户端ID
     * 注意：这里需要根据实际情况配置
     */
    getGoogleClientId() {
        // 开发环境
        if (this.environment === 'development') {
            // 开发环境Google客户端ID
            return '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com';
        }
        
        // 生产环境
        // 生产环境Google客户端ID（需要替换为实际的客户端ID）
        return '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com';
    }

    /**
     * 获取配置
     */
    getConfig() {
        return this.config;
    }

    /**
     * 获取特定配置项
     */
    get(key) {
        return this.config[key];
    }

    /**
     * 验证OAuth配置
     */
    validateOAuthConfig() {
        const googleClientId = this.config.oauth.google.clientId;
        
        if (!googleClientId || googleClientId.includes('your-')) {
            console.warn('⚠️ Google OAuth客户端ID未正确配置');
            return false;
        }
        
        console.log('✅ OAuth配置验证通过');
        return true;
    }
}

// 创建全局实例
window.EnvLoader = new EnvLoader();

// 导出配置
window.AppConfig = window.EnvLoader.getConfig();

console.log('🔧 环境配置已加载:', window.AppConfig);