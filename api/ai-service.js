/**
 * AI服务接口层
 * 支持多种大模型接入，包括OpenAI、QMAx、Claude等
 * 配置文件驱动的模型切换
 */

// AI服务配置
const AI_CONFIG = {
    // 当前使用的AI模型
    currentProvider: 'openai', // 'openai', 'qmax', 'claude', 'gemini', 'custom'
    
    // 各模型配置
    providers: {
        openai: {
            apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
            baseURL: 'https://api.openai.com/v1',
            model: 'gpt-3.5-turbo',
            maxTokens: 2000,
            temperature: 0.7
        },
        qmax: {
            apiKey: process.env.QMAX_API_KEY || 'your-qmax-api-key',
            baseURL: 'https://api.aliyun.com/v1',
            model: 'qwen-max',
            maxTokens: 2000,
            temperature: 0.7
        },
        claude: {
            apiKey: process.env.CLAUDE_API_KEY || 'your-claude-api-key',
            baseURL: 'https://api.anthropic.com/v1',
            model: 'claude-3-sonnet-20240229',
            maxTokens: 2000,
            temperature: 0.7
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
            baseURL: 'https://generativelanguage.googleapis.com/v1',
            model: 'gemini-pro',
            maxTokens: 2000,
            temperature: 0.7
        },
        custom: {
            apiKey: process.env.CUSTOM_API_KEY || 'your-custom-api-key',
            baseURL: process.env.CUSTOM_API_URL || 'https://your-custom-api.com/v1',
            model: process.env.CUSTOM_MODEL || 'custom-model',
            maxTokens: 2000,
            temperature: 0.7
        }
    }
};

class AIService {
    constructor() {
        this.config = AI_CONFIG;
        this.currentProvider = this.config.currentProvider;
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
    getCurrentConfig() {
        return this.config.providers[this.currentProvider];
    }

    /**
     * 生成恋爱聊天回复
     * @param {string} userMessage - 用户消息
     * @param {string} context - 对话上下文
     * @param {Object} options - 额外选项
     */
    async generateChatReply(userMessage, context = '', options = {}) {
        const config = this.getCurrentConfig();
        
        // 构建专门的恋爱聊天提示词
        const systemPrompt = this.buildChatSystemPrompt(options);
        const userPrompt = this.buildChatUserPrompt(userMessage, context, options);

        try {
            const response = await this.callAIAPI(systemPrompt, userPrompt, config);
            return this.parseAIResponse(response);
        } catch (error) {
            console.error('AI service error:', error);
            return this.getFallbackResponse(userMessage);
        }
    }

    /**
     * 情感分析
     * @param {string} message - 要分析的消息
     */
    async analyzeEmotion(message) {
        const config = this.getCurrentConfig();
        
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
     * 调用AI API
     */
    async callAIAPI(systemPrompt, userPrompt, config) {
        switch (this.currentProvider) {
            case 'openai':
                return await this.callOpenAI(systemPrompt, userPrompt, config);
            case 'qmax':
                return await this.callQMax(systemPrompt, userPrompt, config);
            case 'claude':
                return await this.callClaude(systemPrompt, userPrompt, config);
            case 'gemini':
                return await this.callGemini(systemPrompt, userPrompt, config);
            case 'custom':
                return await this.callCustomAPI(systemPrompt, userPrompt, config);
            default:
                throw new Error(`Unsupported provider: ${this.currentProvider}`);
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
            return parsed;
        } catch (error) {
            // 如果不是JSON，返回纯文本
            return {
                suggestions: [{
                    type: window.i18n ? window.i18n.t('api.chat.ai_reply') : "AI回复",
                    reply: response,
                    explanation: window.i18n ? window.i18n.t('api.chat.ai_generated_suggestion') : "AI生成的回复建议"
                }],
                analysis: window.i18n ? window.i18n.t('api.chat.ai_based_analysis') : "基于AI分析",
                tips: window.i18n ? window.i18n.t('api.chat.keep_natural') : "保持自然的交流"
            };
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
    window.aiService = aiService;
}

// 在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = aiService;
}