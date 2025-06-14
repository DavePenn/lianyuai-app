/**
 * 应用配置文件
 * 包含应用全局配置、API端点和环境设置
 */

// API端点配置
const API_ENDPOINTS = {
    // 后端服务地址
    baseURL: process.env.API_BASE_URL || 'https://api.lianyuai.com',
    
    // AI模型服务
    aiService: {
        // 默认接口
        default: '/api/ai/chat',
        
        // OpenAI接口
        openai: {
            baseURL: 'https://api.openai.com/v1',
            completions: '/chat/completions'
        },
        
        // 阿里云QMax接口
        qmax: {
            baseURL: 'https://api.aliyun.com/v1',
            completions: '/chat/completions'
        },
        
        // 其他AI服务接口可以在这里添加
    },
    
    // 用户服务接口
    userService: {
        login: '/api/users/login',
        register: '/api/users/register',
        profile: '/api/users/profile',
        updateProfile: '/api/users/profile/update',
        resetPassword: '/api/users/password/reset'
    },
    
    // 消息服务接口
    messageService: {
        getMessages: '/api/messages',
        sendMessage: '/api/messages/send',
        deleteMessage: '/api/messages/delete',
        exportMessages: '/api/messages/export'
    },
    
    // 会话服务接口
    sessionService: {
        getSessions: '/api/sessions',
        createSession: '/api/sessions/create',
        updateSession: '/api/sessions/update',
        deleteSession: '/api/sessions/delete'
    },
    
    // 支付服务接口
    paymentService: {
        getPlans: '/api/payments/plans',
        createOrder: '/api/payments/orders/create',
        checkOrder: '/api/payments/orders/check'
    }
};

// 应用配置
const APP_CONFIG = {
    // 应用名称
    appName: '恋语AI',
    
    // 应用版本
    version: '1.0.0',
    
    // 是否启用调试模式
    debug: process.env.NODE_ENV !== 'production',
    
    // 默认语言
    defaultLanguage: 'zh-CN',
    
    // 是否启用离线模式
    offlineMode: false,
    
    // 当前环境
    environment: process.env.NODE_ENV || 'development',
    
    // 缓存设置
    cache: {
        // 缓存有效期（毫秒）
        ttl: 24 * 60 * 60 * 1000, // 24小时
        
        // 缓存前缀
        prefix: 'lianyuai_'
    },
    
    // 消息设置
    message: {
        // 最大消息长度
        maxLength: 2000,
        
        // 每页消息数量
        pageSize: 20
    },
    
    // AI设置
    ai: {
        // 默认使用的AI提供商
        defaultProvider: 'openai',
        
        // AI模型参数
        parameters: {
            temperature: 0.7,
            maxTokens: 2000
        }
    },
    
    // 用户设置
    user: {
        // 免费用户每日请求限制
        freeRequestLimit: 20,
        
        // 会员等级配置
        membershipLevels: {
            free: {
                name: '免费会员',
                dailyLimit: 20,
                features: ['基础聊天', '单一场景']
            },
            premium: {
                name: '高级会员',
                dailyLimit: 100,
                features: ['全部聊天功能', '多场景保存', '高级AI模型']
            },
            pro: {
                name: '专业会员',
                dailyLimit: 500,
                features: ['全部功能', '无限场景', '专属模型', '优先响应']
            }
        }
    }
};

// 导出配置
const AppConfig = {
    api: API_ENDPOINTS,
    app: APP_CONFIG
};

// 在浏览器环境中挂载到window
if (typeof window !== 'undefined') {
    window.AppConfig = AppConfig;
}

// 在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}