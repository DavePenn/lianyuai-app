const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const aiConfig = require('../config/aiConfig');

const aiService = {};

// 创建代理配置
const createProxyConfig = () => {
    const proxyConfig = aiConfig.proxy;
    if (!proxyConfig || !proxyConfig.enabled || !proxyConfig.host) {
        return {};
    }

    let proxyUrl = `${proxyConfig.protocol}://`;
    
    // 添加认证信息
    if (proxyConfig.auth && proxyConfig.auth.username && proxyConfig.auth.password) {
        proxyUrl += `${proxyConfig.auth.username}:${proxyConfig.auth.password}@`;
    }
    
    proxyUrl += `${proxyConfig.host}:${proxyConfig.port}`;
    
    console.log(`Using proxy: ${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}`);
    
    return {
        httpsAgent: new HttpsProxyAgent(proxyUrl),
        proxy: false // 禁用axios内置代理，使用httpsAgent
    };
};

// AI服务可用性缓存
const serviceAvailability = {
    gemini: { available: true, lastCheck: 0, failCount: 0 },
    openai: { available: true, lastCheck: 0, failCount: 0 },
    claude: { available: true, lastCheck: 0, failCount: 0 },
    qmax: { available: true, lastCheck: 0, failCount: 0 }
};

// 检查服务可用性的间隔（5分钟）
const AVAILABILITY_CHECK_INTERVAL = 5 * 60 * 1000;

// 最大失败次数，超过后标记为不可用
const MAX_FAIL_COUNT = 3;

aiService.chat = async (provider, messages) => {
    // 智能服务选择和降级
    const selectedProvider = await selectBestProvider(provider);
    
    const config = aiConfig.providers[selectedProvider];
    if (!config || !config.apiKey) {
        throw new Error(`AI provider '${selectedProvider}' is not configured.`);
    }

    try {
        let result;
        switch (selectedProvider) {
            case 'openai':
                result = await callOpenAI(config, messages);
                break;
            case 'gemini':
                result = await callGemini(config, messages);
                break;
            case 'claude':
                result = await callClaude(config, messages);
                break;
            case 'qmax':
                result = await callQmax(config, messages);
                break;
            default:
                throw new Error(`Unsupported AI provider: ${selectedProvider}`);
        }
        
        // 成功调用，重置失败计数
        markServiceAvailable(selectedProvider);
        return result;
        
    } catch (error) {
        // 标记服务不可用
        markServiceUnavailable(selectedProvider);
        
        // 如果不是原始请求的provider，直接抛出错误
        if (selectedProvider !== provider) {
            throw error;
        }
        
        // 尝试降级到备用服务
        console.log(`Provider ${selectedProvider} failed, attempting fallback...`);
        return await attemptFallback(provider, messages, error);
    }
};

// 选择最佳可用的AI服务提供商
const selectBestProvider = async (requestedProvider) => {
    // 如果请求的服务可用，直接使用
    if (isServiceAvailable(requestedProvider)) {
        return requestedProvider;
    }
    
    // 定义降级优先级
    const fallbackOrder = {
        'gemini': ['qmax', 'openai', 'claude'],
        'openai': ['qmax', 'gemini', 'claude'],
        'claude': ['qmax', 'gemini', 'openai'],
        'qmax': ['gemini', 'openai', 'claude']
    };
    
    const fallbacks = fallbackOrder[requestedProvider] || ['qmax', 'gemini', 'openai', 'claude'];
    
    for (const provider of fallbacks) {
        if (isServiceAvailable(provider) && aiConfig[provider] && aiConfig[provider].apiKey) {
            console.log(`Switching from ${requestedProvider} to ${provider}`);
            return provider;
        }
    }
    
    // 如果所有服务都不可用，返回原始请求的provider（让它失败并显示错误）
    return requestedProvider;
};

// 检查服务是否可用
const isServiceAvailable = (provider) => {
    const service = serviceAvailability[provider];
    if (!service) return true;
    
    const now = Date.now();
    
    // 如果最近检查过且标记为不可用，检查是否需要重新测试
    if (!service.available && (now - service.lastCheck) < AVAILABILITY_CHECK_INTERVAL) {
        return false;
    }
    
    // 如果失败次数过多，标记为不可用
    if (service.failCount >= MAX_FAIL_COUNT) {
        return false;
    }
    
    return true;
};

// 标记服务为可用
const markServiceAvailable = (provider) => {
    if (serviceAvailability[provider]) {
        serviceAvailability[provider].available = true;
        serviceAvailability[provider].failCount = 0;
        serviceAvailability[provider].lastCheck = Date.now();
    }
};

// 标记服务为不可用
const markServiceUnavailable = (provider) => {
    if (serviceAvailability[provider]) {
        serviceAvailability[provider].failCount++;
        serviceAvailability[provider].lastCheck = Date.now();
        
        if (serviceAvailability[provider].failCount >= MAX_FAIL_COUNT) {
            serviceAvailability[provider].available = false;
            console.log(`Service ${provider} marked as unavailable after ${MAX_FAIL_COUNT} failures`);
        }
    }
};

// 尝试降级到备用服务
const attemptFallback = async (originalProvider, messages, originalError) => {
    const fallbackOrder = {
        'gemini': ['qmax', 'openai', 'claude'],
        'openai': ['qmax', 'gemini', 'claude'],
        'claude': ['qmax', 'gemini', 'openai'],
        'qmax': ['gemini', 'openai', 'claude']
    };
    
    const fallbacks = fallbackOrder[originalProvider] || ['qmax'];
    
    for (const fallbackProvider of fallbacks) {
        if (!isServiceAvailable(fallbackProvider)) continue;
        
        const config = aiConfig[fallbackProvider];
        if (!config || !config.apiKey) continue;
        
        try {
            console.log(`Trying fallback provider: ${fallbackProvider}`);
            
            let result;
            switch (fallbackProvider) {
                case 'openai':
                    result = await callOpenAI(config, messages);
                    break;
                case 'gemini':
                    result = await callGemini(config, messages);
                    break;
                case 'claude':
                    result = await callClaude(config, messages);
                    break;
                case 'qmax':
                    result = await callQmax(config, messages);
                    break;
                default:
                    continue;
            }
            
            markServiceAvailable(fallbackProvider);
            console.log(`Successfully used fallback provider: ${fallbackProvider}`);
            return result;
            
        } catch (fallbackError) {
            markServiceUnavailable(fallbackProvider);
            console.log(`Fallback provider ${fallbackProvider} also failed:`, fallbackError.message);
            continue;
        }
    }
    
    // 所有降级选项都失败了，抛出原始错误
    throw new Error(`All AI services are unavailable. Original error: ${originalError.message}`);
};

const callOpenAI = async (config, messages) => {
    try {
        const response = await axios.post(`${config.baseURL}/chat/completions`, {
            model: config.model,
            messages: messages,
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            return {
                content: response.data.choices[0].message.content,
                usage: response.data.usage || {}
            };
        } else {
            throw new Error('Invalid response format from OpenAI API');
        }
    } catch (error) {
        console.error('OpenAI API Error:', error.response?.data || error.message);
        throw new Error(`OpenAI API调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
};

const callGemini = async (config, messages) => {
    try {
        const contents = messages.map(msg => ({
            parts: [{ text: msg.content }],
            role: msg.role === 'assistant' ? 'model' : 'user'
        }));

        const proxyConfig = createProxyConfig();
        
        // 构建请求体，支持JSON模式输出
        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: config.temperature || 0.7,
                maxOutputTokens: config.maxTokens || 2000,
                responseMimeType: "application/json"
            }
        };
        
        const response = await axios.post(
            `${config.baseURL}/models/${config.model}:generateContent?key=${config.apiKey}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000,
                ...proxyConfig
            }
        );
        
        console.log('Gemini API 完整响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.candidates && response.data.candidates[0]) {
            const content = response.data.candidates[0].content.parts[0].text;
            console.log('提取的Gemini内容:', content);
            console.log('内容类型:', typeof content);
            
            return {
                content: content,
                usage: response.data.usageMetadata || {}
            };
        } else {
            console.error('Gemini API 响应格式无效:', response.data);
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        throw new Error(`Gemini API调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
};

const callClaude = async (config, messages) => {
    try {
        // Claude API 通过在消息中明确要求JSON格式来实现结构化输出
        const modifiedMessages = [...messages];
        if (modifiedMessages.length > 0) {
            const lastMessage = modifiedMessages[modifiedMessages.length - 1];
            if (lastMessage.role === 'user' && !lastMessage.content.includes('JSON')) {
                lastMessage.content += '\n\n请以有效的JSON格式回复。';
            }
        }
        
        const response = await axios.post(`${config.baseURL}/v1/messages`, {
            model: config.model,
            messages: modifiedMessages,
            temperature: config.temperature,
            max_tokens: config.maxTokens
        }, {
            headers: {
                'x-api-key': config.apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
        });

        if (response.data && response.data.content && response.data.content[0]) {
            return {
                content: response.data.content[0].text,
                usage: response.data.usage || {}
            };
        } else {
            throw new Error('Invalid response format from Claude API');
        }
    } catch (error) {
        console.error('Claude API Error:', error.response?.data || error.message);
        throw new Error(`Claude API调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
};

const callQmax = async (config, messages) => {
    try {
        const response = await axios.post(
            `${config.baseURL}/chat/completions`,
            {
                model: config.model,
                messages: messages,
                temperature: config.temperature || 0.7,
                max_tokens: config.maxTokens || 1000,
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                timeout: 30000
            }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
            return {
                content: response.data.choices[0].message.content,
                usage: response.data.usage || {}
            };
        } else {
            throw new Error('Invalid response format from Qmax API');
        }
    } catch (error) {
        console.error('Qmax API Error:', error.response?.data || error.message);
        throw new Error(`Qmax API调用失败: ${error.response?.data?.message || error.message}`);
    }
};

// 获取所有AI服务的状态
aiService.getServiceStatus = () => {
    const status = {};
    
    for (const [provider, service] of Object.entries(serviceAvailability)) {
        const config = aiConfig[provider];
        status[provider] = {
            available: service.available,
            configured: !!(config && config.apiKey),
            failCount: service.failCount,
            lastCheck: service.lastCheck,
            lastCheckTime: service.lastCheck ? new Date(service.lastCheck).toISOString() : null
        };
    }
    
    return status;
};

// 重置特定服务的状态
aiService.resetServiceStatus = (provider) => {
    if (serviceAvailability[provider]) {
        serviceAvailability[provider] = {
            available: true,
            lastCheck: 0,
            failCount: 0
        };
        return true;
    }
    return false;
};

// 重置所有服务的状态
aiService.resetAllServiceStatus = () => {
    for (const provider in serviceAvailability) {
        serviceAvailability[provider] = {
            available: true,
            lastCheck: 0,
            failCount: 0
        };
    }
};

module.exports = aiService;