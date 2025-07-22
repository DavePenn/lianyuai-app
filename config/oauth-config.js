/**
 * OAuth配置
 * 包含Google OAuth和其他第三方认证服务的配置
 */

window.OAuthConfig = {
    google: {
        // Google OAuth 2.0 配置
        // 注意：这是客户端ID，可以公开
        // 正式环境需要替换为实际的Google客户端ID
        clientId: '您的Google客户端ID.apps.googleusercontent.com',
        
        // OAuth配置选项
        scope: 'email profile',
        
        // 回调配置
        callback: null, // 将在AuthManager中设置
        
        // UI配置
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left'
    },
    
    apple: {
        // Apple Sign In 配置（未来扩展）
        clientId: 'com.lianyuai.app',
        scope: 'email name',
        redirectURI: window.location.origin,
        state: 'apple_auth'
    },
    
    // 开发环境配置
    development: {
        google: {
            // 开发环境的Google客户端ID
            clientId: 'dev-google-client-id.apps.googleusercontent.com'
        }
    },
    
    // 生产环境配置
    production: {
        google: {
            // 生产环境的Google客户端ID
            clientId: 'prod-google-client-id.apps.googleusercontent.com'
        }
    }
};

/**
 * 获取当前环境的OAuth配置
 */
window.OAuthConfig.getCurrentConfig = function() {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('dev');
    
    const envConfig = isDevelopment ? this.development : this.production;
    
    return {
        google: {
            ...this.google,
            ...envConfig.google
        },
        apple: this.apple
    };
};

/**
 * 初始化OAuth配置
 */
window.OAuthConfig.initialize = function() {
    console.log('正在初始化OAuth配置...');
    
    const config = this.getCurrentConfig();
    
    // 检查必要的配置
    if (!config.google.clientId || config.google.clientId.includes('您的Google客户端ID')) {
        console.warn('Google OAuth客户端ID未正确配置');
        return false;
    }
    
    console.log('OAuth配置初始化完成');
    return true;
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.OAuthConfig.initialize();
    });
} else {
    window.OAuthConfig.initialize();
}
