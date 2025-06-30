/**
 * AI服务接口层
 * 支持多种大模型接入，包括OpenAI、QMAx、Claude等
 * 配置文件驱动的模型切换
 */

// AI服务配置
let AI_CONFIG = null;

class AIService {
    constructor() {
        this.currentProvider = 'openai';
        // 延迟初始化BackendService，避免依赖问题
        this.backendService = null;
        this.configInitialized = false;
        this.initPromise = null;
        
        // 安全地初始化BackendService
        try {
            this.backendService = new BackendService();
        } catch (error) {
            console.warn('BackendService初始化失败，将在需要时重试:', error);
        }
    }

    /**
     * 确保BackendService可用
     */
    ensureBackendService() {
        if (!this.backendService) {
            try {
                this.backendService = new BackendService();
            } catch (error) {
                console.error('无法初始化BackendService:', error);
                throw new Error('BackendService不可用');
            }
        }
        return this.backendService;
    }

    /**
     * 初始化AI配置
     */
    async initializeConfig() {
        if (this.configInitialized) {
            return AI_CONFIG;
        }
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._doInitialize();
        return this.initPromise;
    }
    
    async _doInitialize() {
        try {
            const backendService = this.ensureBackendService();
            AI_CONFIG = await backendService.getAIConfig();
            this.currentProvider = AI_CONFIG.currentProvider;
            this.configInitialized = true;
            console.log('AI配置初始化成功，当前提供商:', this.currentProvider);
            return AI_CONFIG;
        } catch (error) {
            console.error('Failed to initialize AI config:', error.message);
            // 使用默认配置作为备选
            AI_CONFIG = {
                currentProvider: 'gemini',
                providers: {
                    gemini: { enabled: true }
                }
            };
            this.currentProvider = 'gemini';
            this.configInitialized = true;
            console.log('使用默认AI配置');
            return AI_CONFIG;
        }
    }

    /**
     * 设置当前使用的AI提供商
     * @param {string} provider - 提供商名称
     */
    setProvider(provider) {
        if (this.config.providers[provider]) {
            this.currentProvider = provider;
            console.log(`AI provider switched to: ${provider}`);
        } else {
            throw new Error(`Unknown AI provider: ${provider}`);
        }
    }

    /**
     * 获取当前提供商配置
     */
    async getCurrentConfig() {
        if (!this.configInitialized) {
            await this.initializeConfig();
        }
        return AI_CONFIG.providers[this.currentProvider];
    }
    
    /**
     * 健康检查
     */
    async healthCheck() {
        try {
            await this.initializeConfig();
            const config = await this.getCurrentConfig();
            return {
                status: 'healthy',
                provider: this.currentProvider,
                configLoaded: this.configInitialized,
                backendService: (() => {
                try {
                    return !!this.ensureBackendService();
                } catch {
                    return false;
                }
            })()
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                provider: this.currentProvider,
                configLoaded: this.configInitialized,
                backendService: (() => {
                    try {
                        return !!this.ensureBackendService();
                    } catch {
                        return false;
                    }
                })()
            };
        }
    }

    /**
     * 生成恋爱聊天回复
     * @param {string} userMessage - 用户消息
     * @param {string} context - 对话上下文
     * @param {Object} options - 额外选项
     */
    async generateChatReply(userMessage, context = '', options = {}) {
        try {
            console.log('开始生成聊天回复，用户消息:', userMessage);
            
            // 检查配置初始化状态
            if (!this.configInitialized) {
                console.log('配置未初始化，正在初始化...');
                await this.initializeConfig();
            }
            
            const config = await this.getCurrentConfig();
            console.log('获取到AI配置:', { provider: this.currentProvider, hasApiKey: !!config?.apiKey });
            
            if (!config || !config.apiKey) {
                throw new Error(`AI提供商 '${this.currentProvider}' 配置不完整或缺少API密钥`);
            }
            
            // 构建专门的恋爱聊天提示词
            const systemPrompt = this.buildChatSystemPrompt(options);
            const userPrompt = this.buildChatUserPrompt(userMessage, context, options);
            console.log('构建提示词完成');

            const response = await this.callAIAPI(systemPrompt, userPrompt, config);
            console.log('AI API调用成功，响应:', response);
            
            const parsedResponse = this.parseAIResponse(response);
            console.log('响应解析完成:', parsedResponse);
            
            return parsedResponse;
        } catch (error) {
            console.error('AI service error:', error);
            console.error('错误堆栈:', error.stack);
            return `抱歉，AI服务当前不可用，请稍后再试。错误详情: ${error.message}`;
        }
    }

    /**
     * 情感分析
     * @param {string} message - 要分析的消息
     */
    async analyzeEmotion(message) {
        const config = await this.getCurrentConfig();
        
        const systemPrompt = `你是一个专业的情感分析专家，擅长分析恋爱关系中的情感状态。
请分析以下消息中的情感倾向，并给出详细的分析结果。
返回JSON格式：{
    "emotion": "${window.i18n ? window.i18n.t('api.emotion.main_emotion') : '主要情感'}",
    "intensity": "${window.i18n ? window.i18n.t('api.emotion.intensity') : '强度(1-10)'}",
    "analysis": "${window.i18n ? window.i18n.t('api.emotion.detailed_analysis') : '详细分析'}",
    "suggestions": ["${window.i18n ? window.i18n.t('api.emotion.suggestion1') : '建议1'}", "${window.i18n ? window.i18n.t('api.emotion.suggestion2') : '建议2'}"]
}`;

        const userPrompt = `请分析这条消息的情感：\n"${message}"`;

        try {
            const response = await this.callAIAPI(systemPrompt, userPrompt, config);
            return JSON.parse(response);
        } catch (error) {
            console.error('Emotion analysis error:', error);
            return {
                emotion: window.i18n ? window.i18n.t('api.emotion.neutral') : "中性",
                intensity: 5,
                analysis: window.i18n ? window.i18n.t('api.emotion.analysis_unavailable') : "情感分析暂时不可用",
                suggestions: [window.i18n ? window.i18n.t('api.emotion.keep_friendly') : "建议保持友好交流"]
            };
        }
    }

    /**
     * 构建聊天系统提示词
     */
    buildChatSystemPrompt(options = {}) {
        const relationshipType = options.relationshipType || (window.i18n ? window.i18n.t('api.chat.default_relationship') : '普通朋友');
        const userPersonality = options.userPersonality || (window.i18n ? window.i18n.t('api.chat.default_personality') : '内向');
        const chatStyle = options.chatStyle || (window.i18n ? window.i18n.t('api.chat.default_style') : '友好');

        return `你是一个专业的恋爱沟通顾问，拥有丰富的情感交流经验。

用户情况：
- 关系类型：${relationshipType}
- 性格特点：${userPersonality}
- 期望聊天风格：${chatStyle}

请根据用户的消息和对话情况，提供3种不同风格的回复建议：
1. ${window.i18n ? window.i18n.t('api.chat.gentle_caring') : '温柔关怀型'} - 体现关心和理解
2. ${window.i18n ? window.i18n.t('api.chat.humorous_light') : '幽默轻松型'} - 保持对话趣味性
3. ${window.i18n ? window.i18n.t('api.chat.deep_communication') : '深度交流型'} - 促进更深层次的了解

每个回复都应该：
- 自然真诚，不做作
- 适合当前关系阶段
- 能够延续话题
- 体现个人魅力

请以JSON格式返回：
{
    "suggestions": [
        {
            "type": "${window.i18n ? window.i18n.t('api.chat.gentle_caring') : '温柔关怀型'}",
            "reply": "具体回复内容",
            "explanation": "为什么这样回复"
        },
        {
            "type": "${window.i18n ? window.i18n.t('api.chat.humorous_light') : '幽默轻松型'}", 
            "reply": "具体回复内容",
            "explanation": "为什么这样回复"
        },
        {
            "type": "${window.i18n ? window.i18n.t('api.chat.deep_communication') : '深度交流型'}",
            "reply": "具体回复内容", 
            "explanation": "为什么这样回复"
        }
    ],
    "analysis": "${window.i18n ? window.i18n.t('api.chat.conversation_analysis') : '对话情况分析'}",
    "tips": "${window.i18n ? window.i18n.t('api.chat.additional_tips') : '额外建议'}"
}`;
    }

    /**
     * 构建用户提示词
     */
    buildChatUserPrompt(userMessage, context, options) {
        let prompt = `我收到了这样一条消息：\n"${userMessage}"\n\n`;
        
        if (context) {
            prompt += `对话背景：\n${context}\n\n`;
        }
        
        if (options.targetMessage) {
            prompt += `对方原话是：\n"${options.targetMessage}"\n\n`;
        }

        prompt += window.i18n ? window.i18n.t('api.chat.generate_reply_request') : '请帮我生成合适的回复建议。';
        
        return prompt;
    }

    /**
     * 调用AI API - 通过后端服务
     */
    async callAIAPI(systemPrompt, userPrompt, config) {
        try {
            // 确保后端服务可用
            const backendService = this.ensureBackendService();
            if (!backendService) {
                throw new Error('Backend service not available');
            }
            
            // 通过后端服务调用AI
            const response = await backendService.callAI(this.currentProvider, {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            });
            
            if (response && response.content) {
                return response.content;
            } else {
                throw new Error('Invalid response from backend AI service');
            }
        } catch (error) {
            console.error('Backend AI service error:', error);
            throw new Error(`AI服务调用失败: ${error.message}`);
        }
    }

    /**
     * OpenAI API调用
     */
    async callOpenAI(systemPrompt, userPrompt, config) {
        const response = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: config.maxTokens,
                temperature: config.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * 阿里QMax API调用
     */
    async callQMax(systemPrompt, userPrompt, config) {
        const response = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: config.maxTokens,
                temperature: config.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`QMax API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * Claude API调用
     */
    async callClaude(systemPrompt, userPrompt, config) {
        const response = await fetch(`${config.baseURL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: config.model,
                max_tokens: config.maxTokens,
                temperature: config.temperature,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    /**
     * Gemini API调用
     */
    async callGemini(systemPrompt, userPrompt, config) {
        const response = await fetch(`${config.baseURL}/models/${config.model}:generateContent?key=${config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser: ${userPrompt}`
                    }]
                }],
                generationConfig: {
                    temperature: config.temperature,
                    maxOutputTokens: config.maxTokens
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    /**
     * 自定义API调用
     */
    async callCustomAPI(systemPrompt, userPrompt, config) {
        // 可以根据自定义API的格式进行调整
        const response = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: config.maxTokens,
                temperature: config.temperature
            })
        });

        if (!response.ok) {
            throw new Error(`Custom API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * 解析AI响应
     */
    parseAIResponse(response) {
        try {
            // 尝试解析JSON响应
            const parsed = JSON.parse(response);
            console.log('解析到JSON响应:', parsed);
            
            // 如果是包含suggestions的JSON格式，需要格式化为用户友好的文本
            if (parsed && parsed.suggestions && Array.isArray(parsed.suggestions)) {
                console.log('检测到suggestions格式，正在格式化为文本...');
                const formattedText = this.formatAIResponseToText(parsed);
                console.log('格式化后的文本:', formattedText);
                return formattedText;
            }
            
            // 如果是其他JSON格式，也尝试格式化
            if (parsed && typeof parsed === 'object') {
                console.log('检测到其他JSON格式，尝试格式化...');
                // 检查是否有其他可能的结构
                if (parsed.content) {
                    return parsed.content;
                }
                if (parsed.message) {
                    return parsed.message;
                }
                if (parsed.text) {
                    return parsed.text;
                }
                // 如果没有找到预期的字段，尝试用formatAIResponseToText处理
                try {
                    return this.formatAIResponseToText(parsed);
                } catch (formatError) {
                    console.warn('无法格式化JSON响应，返回字符串形式:', formatError);
                    return JSON.stringify(parsed, null, 2);
                }
            }
            
            return parsed;
        } catch (error) {
            // 如果不是JSON，返回纯文本
            console.log('响应不是JSON格式，返回纯文本:', response);
            return response;
        }
    }
    
    /**
     * 将AI的JSON响应格式化为用户友好的文本
     */
    formatAIResponseToText(response) {
        try {
            // 如果有建议，直接返回第一个建议的回复内容
            if (response.suggestions && response.suggestions.length > 0) {
                return response.suggestions[0].reply || '收到您的消息';
            }
            
            // 如果响应是字符串，直接返回
            if (typeof response === 'string') {
                return response;
            }
            
            // 其他情况返回默认消息
            return '收到您的消息';
        } catch (error) {
            console.error('格式化AI响应错误:', error);
            return '收到您的消息';
        }
    }

    /**
     * 获取备用回复（当AI服务不可用时）
     */
    getFallbackResponse(userMessage) {
        const fallbackReplies = {
            greeting: {
                suggestions: [{
                    type: window.i18n ? window.i18n.t('api.chat.friendly_response') : "友好回应",
                    reply: window.i18n ? window.i18n.t('api.chat.greeting_reply') : "你好！很高兴收到你的消息",
                    explanation: window.i18n ? window.i18n.t('api.chat.greeting_explanation') : "友好的回应可以建立良好的对话氛围"
                }],
                analysis: window.i18n ? window.i18n.t('api.chat.greeting_analysis') : "这是一个友好的打招呼",
                tips: window.i18n ? window.i18n.t('api.chat.greeting_tips') : "保持积极的态度回应"
            },
            question: {
                suggestions: [{
                    type: window.i18n ? window.i18n.t('api.chat.open_response') : "开放回应",
                    reply: window.i18n ? window.i18n.t('api.chat.question_reply') : "这是个有趣的问题，让我想想...",
                    explanation: window.i18n ? window.i18n.t('api.chat.question_explanation') : "表现出对话题的兴趣"
                }],
                analysis: window.i18n ? window.i18n.t('api.chat.question_analysis') : "对方询问了一个问题",
                tips: window.i18n ? window.i18n.t('api.chat.question_tips') : "给出真诚的回答"
            },
            default: {
                suggestions: [{
                    type: window.i18n ? window.i18n.t('api.chat.general_reply') : "通用回复",
                    reply: window.i18n ? window.i18n.t('api.chat.default_reply') : "谢谢你分享这个，我很感兴趣听你说更多",
                    explanation: window.i18n ? window.i18n.t('api.chat.default_explanation') : "表现出倾听和兴趣"
                }],
                analysis: window.i18n ? window.i18n.t('api.chat.default_analysis') : "一般性的对话内容",
                tips: window.i18n ? window.i18n.t('api.chat.default_tips') : "保持对话的延续性"
            }
        };

        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('你好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
            return fallbackReplies.greeting;
        } else if (lowerMessage.includes('?') || lowerMessage.includes('？') || lowerMessage.includes('什么') || lowerMessage.includes('怎么')) {
            return fallbackReplies.question;
        } else {
            return fallbackReplies.default;
        }
    }

    /**
     * 健康检查 - 测试AI服务是否可用
     */
    async healthCheck() {
        try {
            const testResponse = await this.generateChatReply('测试消息', '', { test: true });
            return {
                status: 'healthy',
                provider: this.currentProvider,
                response: testResponse
            };
        } catch (error) {
            return {
                status: 'error',
                provider: this.currentProvider,
                error: error.message
            };
        }
    }
}

// 导出AI服务实例
const aiService = new AIService();

// 在浏览器环境中挂载到window
if (typeof window !== 'undefined') {
    window.AIService = AIService;
    window.aiService = aiService;
}

// 在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = aiService;
}