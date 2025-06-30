require('dotenv').config();

module.exports = {
    // 当前使用的AI提供商
    currentProvider: process.env.CURRENT_AI_PROVIDER || 'gemini',
    
    // AI提供商配置
    providers: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000
        },
        qmax: {
            apiKey: process.env.QMAX_API_KEY,
            baseURL: process.env.QMAX_BASE_URL,
            model: process.env.QMAX_MODEL,
            temperature: parseFloat(process.env.QMAX_TEMPERATURE) || 0.7,
            maxTokens: parseInt(process.env.QMAX_MAX_TOKENS) || 2000
        },
        claude: {
            apiKey: process.env.CLAUDE_API_KEY,
            baseURL: process.env.CLAUDE_BASE_URL,
            model: process.env.CLAUDE_MODEL,
            temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7,
            maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 2000
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
            baseURL: process.env.GEMINI_BASE_URL,
            model: process.env.GEMINI_MODEL,
            temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
            maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 2000
        }
    },
    
    // 代理配置
    proxy: {
        enabled: process.env.PROXY_ENABLED === 'true',
        host: process.env.PROXY_HOST,
        port: process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT) : undefined,
        protocol: process.env.PROXY_PROTOCOL || 'http',
        auth: process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD ? {
            username: process.env.PROXY_USERNAME,
            password: process.env.PROXY_PASSWORD
        } : undefined
    }
};