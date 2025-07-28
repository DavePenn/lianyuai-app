/**
 * AI扩展服务控制器
 * 处理情感分析、开场白生成、约会规划等AI扩展功能
 */

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const aiService = require('../services/aiService');
const aiConfig = require('../config/aiConfig');

// 情感分析
exports.analyzeEmotion = catchAsync(async (req, res, next) => {
    const { message } = req.body;
    
    if (!message) {
        return next(new AppError('请提供要分析的消息内容', 400));
    }
    
    const systemPrompt = `你是一个专业的情感分析师。请分析用户消息的情感倾向，返回JSON格式：
    {
        "emotion": "情感类型(positive/negative/neutral)",
        "intensity": "强度(1-10)",
        "keywords": ["关键词1", "关键词2"],
        "suggestion": "回复建议"
    }`;
    
    const userPrompt = `请分析这条消息的情感："${message}"`;
    
    try {
        const aiResponse = await aiService.chat(aiConfig.currentProvider, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
        
        let analysis;
        try {
            analysis = JSON.parse(aiResponse.content);
        } catch (parseError) {
            // 如果AI返回的不是有效JSON，提供默认分析
            analysis = {
                emotion: 'neutral',
                intensity: 5,
                keywords: [],
                suggestion: '建议以友善和理解的态度回复'
            };
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                analysis,
                originalMessage: message
            }
        });
    } catch (error) {
        console.error('情感分析失败:', error);
        return next(new AppError('情感分析服务暂时不可用', 500));
    }
});

// 生成开场白
exports.generateOpener = catchAsync(async (req, res, next) => {
    const { 
        targetGender, 
        targetAge, 
        interests, 
        personality, 
        context = '初次聊天' 
    } = req.body;
    
    if (!targetGender) {
        return next(new AppError('请提供目标对象的性别信息', 400));
    }
    
    const systemPrompt = `你是一个专业的恋爱聊天顾问。请根据用户提供的信息生成3个不同风格的开场白，返回JSON格式：
    {
        "openers": [
            {
                "style": "风格类型",
                "content": "开场白内容",
                "reason": "推荐理由"
            }
        ]
    }`;
    
    const profileInfo = [
        `目标性别: ${targetGender}`,
        targetAge ? `年龄: ${targetAge}` : '',
        interests ? `兴趣爱好: ${interests}` : '',
        personality ? `性格特点: ${personality}` : '',
        `聊天场景: ${context}`
    ].filter(Boolean).join('\n');
    
    const userPrompt = `请为以下情况生成开场白：\n${profileInfo}`;
    
    try {
        const aiResponse = await aiService.chat(aiConfig.currentProvider, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
        
        let openers;
        try {
            openers = JSON.parse(aiResponse.content);
        } catch (parseError) {
            // 提供默认开场白
            openers = {
                openers: [
                    {
                        style: '友善型',
                        content: '你好！很高兴认识你，希望我们能成为朋友。',
                        reason: '简单友善，适合初次交流'
                    }
                ]
            };
        }
        
        res.status(200).json({
            status: 'success',
            data: openers
        });
    } catch (error) {
        console.error('开场白生成失败:', error);
        return next(new AppError('开场白生成服务暂时不可用', 500));
    }
});

// 约会规划
exports.planDate = catchAsync(async (req, res, next) => {
    const { 
        location, 
        budget, 
        interests, 
        dateType = '第一次约会',
        duration = '2-3小时',
        weather = '晴天'
    } = req.body;
    
    if (!location) {
        return next(new AppError('请提供约会地点信息', 400));
    }
    
    const systemPrompt = `你是一个专业的约会规划师。请根据用户提供的信息制定详细的约会计划，返回JSON格式：
    {
        "plan": {
            "title": "约会主题",
            "activities": [
                {
                    "time": "时间段",
                    "activity": "活动内容",
                    "location": "具体地点",
                    "cost": "预估费用",
                    "tips": "注意事项"
                }
            ],
            "totalCost": "总预算",
            "alternatives": ["备选方案1", "备选方案2"]
        }
    }`;
    
    const planInfo = [
        `地点: ${location}`,
        budget ? `预算: ${budget}` : '',
        interests ? `共同兴趣: ${interests}` : '',
        `约会类型: ${dateType}`,
        `时长: ${duration}`,
        `天气: ${weather}`
    ].filter(Boolean).join('\n');
    
    const userPrompt = `请为以下条件制定约会计划：\n${planInfo}`;
    
    try {
        const aiResponse = await aiService.chat(aiConfig.currentProvider, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
        
        let datePlan;
        try {
            datePlan = JSON.parse(aiResponse.content);
        } catch (parseError) {
            // 提供默认约会计划
            datePlan = {
                plan: {
                    title: '轻松愉快的约会',
                    activities: [
                        {
                            time: '下午2:00-4:00',
                            activity: '咖啡厅聊天',
                            location: location,
                            cost: '50-100元',
                            tips: '选择安静舒适的环境'
                        }
                    ],
                    totalCost: budget || '100-200元',
                    alternatives: ['公园散步', '电影院看电影']
                }
            };
        }
        
        res.status(200).json({
            status: 'success',
            data: datePlan
        });
    } catch (error) {
        console.error('约会规划失败:', error);
        return next(new AppError('约会规划服务暂时不可用', 500));
    }
});

// 聊天话题推荐
exports.suggestTopics = catchAsync(async (req, res, next) => {
    const { 
        relationship = '朋友',
        mood = '正常',
        recentEvents = '',
        commonInterests = ''
    } = req.body;
    
    const systemPrompt = `你是一个聊天话题专家。请根据用户情况推荐5个合适的聊天话题，返回JSON格式：
    {
        "topics": [
            {
                "topic": "话题标题",
                "description": "话题描述",
                "starter": "开场问题",
                "category": "话题分类"
            }
        ]
    }`;
    
    const contextInfo = [
        `关系状态: ${relationship}`,
        `当前心情: ${mood}`,
        recentEvents ? `最近发生的事: ${recentEvents}` : '',
        commonInterests ? `共同兴趣: ${commonInterests}` : ''
    ].filter(Boolean).join('\n');
    
    const userPrompt = `请为以下情况推荐聊天话题：\n${contextInfo}`;
    
    try {
        const aiResponse = await aiService.chat(aiConfig.currentProvider, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
        
        let topics;
        try {
            topics = JSON.parse(aiResponse.content);
        } catch (parseError) {
            // 提供默认话题
            topics = {
                topics: [
                    {
                        topic: '兴趣爱好',
                        description: '了解对方的兴趣和爱好',
                        starter: '你平时喜欢做什么呢？',
                        category: '个人兴趣'
                    }
                ]
            };
        }
        
        res.status(200).json({
            status: 'success',
            data: topics
        });
    } catch (error) {
        console.error('话题推荐失败:', error);
        return next(new AppError('话题推荐服务暂时不可用', 500));
    }
});

module.exports = {
    analyzeEmotion: exports.analyzeEmotion,
    generateOpener: exports.generateOpener,
    planDate: exports.planDate,
    suggestTopics: exports.suggestTopics
};