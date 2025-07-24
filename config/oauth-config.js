/**
 * OAuth配置
 * 包含Google OAuth和其他第三方认证服务的配置
 */

window.OAuthConfig = {
    google: {
        // Google OAuth 2.0 配置
        // 客户端ID将从环境配置中动态获取
        clientId: null, // 将在初始化时设置
        
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
    
    // Apple Sign In 已移除
};

/**
 * 获取当前环境的OAuth配置
 */
window.OAuthConfig.getCurrentConfig = function() {
    // 确保环境配置已加载
    if (!window.AppConfig) {
        console.error('环境配置未加载，请确保env-loader.js已正确引入');
        return null;
    }
    
    // 从环境配置中获取Google客户端ID
    const googleClientId = window.AppConfig.oauth.google.clientId;
    
    return {
        google: {
            ...this.google,
            clientId: googleClientId
        }
    };
};

/**
 * 初始化OAuth配置
 */
window.OAuthConfig.initialize = function() {
    console.log('正在初始化OAuth配置...');
    
    // 等待环境配置加载
    if (!window.AppConfig) {
        console.warn('等待环境配置加载...');
        setTimeout(() => this.initialize(), 100);
        return false;
    }
    
    const config = this.getCurrentConfig();
    
    if (!config) {
        console.error('无法获取OAuth配置');
        return false;
    }
    
    // 验证OAuth配置
    if (window.EnvLoader && !window.EnvLoader.validateOAuthConfig()) {
        return false;
    }
    
    // 检查必要的配置
    if (!config.google.clientId || config.google.clientId.includes('your-')) {
        console.warn('⚠️ Google OAuth客户端ID未正确配置，请在环境变量中设置GOOGLE_CLIENT_ID');
        console.info('📖 获取Google客户端ID的步骤：');
        console.info('1. 访问 https://console.developers.google.com/');
        console.info('2. 创建或选择项目');
        console.info('3. 启用Google+ API');
        console.info('4. 创建OAuth 2.0客户端ID凭据');
        console.info('5. 将客户端ID配置到环境变量中');
        return false;
    }
    
    console.log('✅ OAuth配置初始化完成');
    console.log('🔑 Google客户端ID:', config.google.clientId);
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
