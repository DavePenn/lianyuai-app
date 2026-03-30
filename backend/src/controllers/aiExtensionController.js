/**
 * AI扩展服务控制器
 * 处理情感分析、开场白生成、约会规划等AI扩展功能
 */

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const aiService = require('../services/aiService');
const aiConfig = require('../config/aiConfig');
const RelationshipAnalysis = require('../models/relationshipAnalysisModel');

const parseStructuredAIResponse = (content, fallbackData) => {
    if (!content || typeof content !== 'string') {
        return fallbackData;
    }

    const trimmed = content.trim();
    const candidates = [
        trimmed,
        trimmed.replace(/^```json\s*/i, '').replace(/\s*```$/, ''),
        trimmed.replace(/^```\s*/i, '').replace(/\s*```$/, '')
    ];

    for (const candidate of candidates) {
        try {
            return JSON.parse(candidate);
        } catch (error) {
            // Try the next candidate format.
        }
    }

    return fallbackData;
};

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

        const analysis = parseStructuredAIResponse(aiResponse.content, {
            emotion: 'neutral',
            intensity: 5,
            keywords: [],
            suggestion: '建议以友善和理解的态度回复'
        });
        
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

        const openers = parseStructuredAIResponse(aiResponse.content, {
            openers: [
                {
                    style: '友善型',
                    content: '你好！很高兴认识你，希望我们能成为朋友。',
                    reason: '简单友善，适合初次交流'
                }
            ]
        });
        
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

        const datePlan = parseStructuredAIResponse(aiResponse.content, {
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
        });
        
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

        const topics = parseStructuredAIResponse(aiResponse.content, {
            topics: [
                {
                    topic: '兴趣爱好',
                    description: '了解对方的兴趣和爱好',
                    starter: '你平时喜欢做什么呢？',
                    category: '个人兴趣'
                }
            ]
        });
        
        res.status(200).json({
            status: 'success',
            data: topics
        });
    } catch (error) {
        console.error('话题推荐失败:', error);
        return next(new AppError('话题推荐服务暂时不可用', 500));
    }
});

// 关系分析
exports.analyzeRelationship = catchAsync(async (req, res, next) => {
    const {
        chatContext = {},
        concern = {},
        background = {},
        options = {},
        extraNotes = ''
    } = req.body;

    const rawText = typeof chatContext.rawText === 'string' ? chatContext.rawText.trim() : '';
    if (!rawText) {
        return next(new AppError('请提供聊天内容用于关系分析', 400));
    }

    const systemPrompt = `你是一个冷静、克制、懂节奏的恋爱关系判断助手。

你的任务不是安慰用户，也不是鼓励操控，而是根据聊天上下文和关系背景，帮助用户看懂局势、减少误判，并给出当前最合适的下一步建议。

请严格按以下规则工作：
1. 不要假装读心，不要给出绝对结论。
2. 不要使用PUA、打压、失真、操控性的建议。
3. 输出必须具体、可执行、像一个懂节奏的军师。
4. 结果必须是 JSON，不要输出多余解释。
5. 每个判断必须标注证据：引用聊天原文中支撑该判断的关键句子或片段。如果找不到直接证据，写"基于整体互动节奏推断"。

当前阶段 stage.label 只允许以下值，请根据判断规则选择：

- 初识：刚开始接触，对话内容浅，彼此信息交换有限，互动更多是试探和建立基础印象
- 轻互动：已有一定来回，对话能持续但情绪温度不高，没有明显推进信号，更像建立熟悉感阶段
- 稳定互动：对话承接稳定，回复质量和频率相对平衡，开始有一定舒适感，不再是纯陌生人
- 升温窗口：出现更明显的兴趣信号，情绪互动增强，对方更愿意暴露个人信息或配合互动，具备轻度推进条件
- 暧昧确认：双方互动有明显暧昧感，情绪回应明显增多，关系已不只是普通聊天，可以考虑更明确的推进
- 降温风险：互动质量下降，节奏变慢或失衡，情绪承接减少，需要判断是暂时波动还是关系降温
- 需要更多上下文：聊天内容太少，无法做出可靠判断

兴趣信号（positiveSignals）重点关注：
- 对方会主动延续话题（不只是回答问题，还会把话题抛回来）
- 回复不只是礼貌，而是有内容（愿意展开、补充细节）
- 对方愿意暴露个人信息或生活细节（说明舒适度在上升）
- 对方能接住玩笑、情绪或互动节奏
- 对方对未来互动或见面不排斥
注意：兴趣信号不是"喜欢你的证明"，只是值得重视的正向迹象。文案必须克制，不能误导用户上头。

风险信号（riskSignals）重点关注：
- 回复明显变短
- 承接减少，只做礼貌回应
- 对具体安排或推进动作持续回避
- 用户投入明显高于对方
- 互动还在但情绪温度下降
注意：风险信号不等于关系失败，只是提示当前要更谨慎。语气冷静克制，不制造焦虑。

主动度对比（initiativeBalance）判断维度：谁更常开新话题、谁更常延续话题、谁更常结束对话、谁更常重新发起互动

initiativeBalance.label 只允许以下值：
- 你更主动
- 基本均衡
- 对方更主动
- 暂时不清楚

推进窗口（pushWindow）判断规则：
- 暂不建议推进：关系基础不够稳，风险信号较明显，贸然推进容易打断节奏
- 可以轻试探：已有一定舒适度，可以测试对方是否愿意接受更进一步互动，但不适合太重的表达
- 适合推进：当前信号显示对方接得住更明确动作，关系阶段和互动质量支持推进

pushWindow.label 只允许以下值：
- 暂不建议推进
- 可以轻试探
- 适合推进

nextBestAction.label 只允许以下值，按当前局势选择：
- 继续自然聊天：阶段较早，节奏正常，保持当前互动即可
- 深化话题：互动稳定但停留在表面，适合把对话拉向更真实的情绪交流
- 轻度暧昧测试：已有舒适度，适合测试对方对暧昧的接受度
- 轻邀约：互动质量支持把关系从线上带到线下，但用低压力方式
- 放缓观察：节奏不稳定或风险信号偏多，先不加压，观察对方是否重新投入
- 修复节奏：近期有明显降温或误会，需要先修复互动感再考虑推进
- 补充上下文：信息不足以做出可靠判断
必须解释"为什么是这个动作，而不是别的动作"。

输出表达原则：
- 阶段判断用"更像""更接近""从最近互动看，偏向"，不做绝对预测
- 不要把一次热情回复直接解读成稳定兴趣
- summary 必须点出主要正向信号和主要风险点，不能只说好话
- 建议必须具体、可执行，像一个懂节奏的军师，不是心理鸡汤
- 不鼓励操控、打压、失真表达

请返回以下 JSON 结构：
{
  "stage": {
    "label": "阶段名",
    "reason": "一句解释",
    "evidence": "聊天中支撑阶段判断的关键原文"
  },
  "summary": "2到4句的局势总结",
  "positiveSignals": [
    {"text": "信号描述", "evidence": "聊天中的原文依据"},
    {"text": "信号描述", "evidence": "聊天中的原文依据"}
  ],
  "riskSignals": [
    {"text": "风险描述", "evidence": "聊天中的原文依据"},
    {"text": "风险描述", "evidence": "聊天中的原文依据"}
  ],
  "initiativeBalance": {
    "label": "主动度结论",
    "reason": "一句解释"
  },
  "pushWindow": {
    "label": "推进窗口结论",
    "reason": "一句解释"
  },
  "nextBestAction": {
    "label": "当前最优动作",
    "reason": "一句解释",
    "tip": "一句执行提醒"
  },
  "avoidActions": ["避免动作1", "避免动作2"],
  "suggestedReplies": [
    {
      "style": "风格标签",
      "content": "可直接发送的话术",
      "reason": "为什么这条适合当前局势"
    },
    {
      "style": "风格标签",
      "content": "可直接发送的话术",
      "reason": "为什么这条适合当前局势"
    },
    {
      "style": "风格标签",
      "content": "可直接发送的话术",
      "reason": "为什么这条适合当前局势"
    }
  ]
}`;

    const concernInfo = [
        concern.type ? `用户当前问题类型: ${concern.type}` : '',
        concern.customNote ? `用户补充问题: ${concern.customNote}` : ''
    ].filter(Boolean).join('\n');

    const backgroundInfo = [
        background.knownDuration ? `认识时长: ${background.knownDuration}` : '',
        background.seenOffline ? `是否见过面: ${background.seenOffline}` : '',
        background.subjectiveStage ? `用户主观关系状态: ${background.subjectiveStage}` : '',
        background.initiativeSide ? `最近谁更主动: ${background.initiativeSide}` : '',
        background.currentGoal ? `当前目标: ${background.currentGoal}` : '',
        background.temperatureChange ? `最近关系温度变化: ${background.temperatureChange}` : '',
        background.hasInviteHistory !== undefined ? `是否有邀约历史: ${background.hasInviteHistory}` : '',
        background.hasConflict !== undefined ? `是否有冲突或误会: ${background.hasConflict}` : ''
    ].filter(Boolean).join('\n');

    const userPrompt = [
        '请根据以下信息完成一次关系分析。',
        concernInfo ? `【用户当前困惑】\n${concernInfo}` : '',
        backgroundInfo ? `【关系背景】\n${backgroundInfo}` : '',
        extraNotes ? `【补充说明】\n${extraNotes}` : '',
        `【聊天内容】\n${rawText}`,
        options.responseLanguage ? `【输出语言】\n请尽量使用 ${options.responseLanguage} 输出。` : ''
    ].filter(Boolean).join('\n\n');

    try {
        const aiResponse = await aiService.chat(aiConfig.currentProvider, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], { maxTokens: 4000, jsonMode: true });

        const fallbackData = {
            stage: {
                label: '需要更多上下文',
                reason: '当前聊天内容还不足以支撑稳定的关系阶段判断。',
                evidence: ''
            },
            summary: '现有信息还不足以做出更可靠的关系雷达。建议补充最近更关键的聊天片段、一次邀约节点或最近一次明显变冷的互动。',
            positiveSignals: [
                { text: '当前可确认的稳定正向信号仍然偏少', evidence: '' },
                { text: '需要更多上下文来判断对方是否在持续接住互动', evidence: '' }
            ],
            riskSignals: [
                { text: '在上下文不足的情况下，最容易把单次回复误判成整体趋势', evidence: '' },
                { text: '现在更需要补充信息，而不是直接提高推进力度', evidence: '' }
            ],
            initiativeBalance: {
                label: '暂时不清楚',
                reason: '需要更多连续互动内容，才能判断谁在主导当前节奏。'
            },
            pushWindow: {
                label: '暂不建议推进',
                reason: '在缺少足够上下文时，更适合先补充信息再判断是否推进。'
            },
            nextBestAction: {
                label: '补充上下文',
                reason: '先把最近最关键的聊天片段、一次邀约或最近的节奏变化补充完整。',
                tip: '优先补最近 1 到 2 周最能代表当前局势的聊天。'
            },
            avoidActions: [
                '不要因为焦虑立刻升级关系动作',
                '不要只凭一小段聊天就下最终结论'
            ],
            suggestedReplies: [
                {
                    style: '稳住节奏',
                    content: '我先把最近的互动整理清楚，再决定下一步怎么推进。',
                    reason: '先看懂局势，比立刻出手更重要。'
                },
                {
                    style: '轻观察',
                    content: '先别急着上强度，看看接下来几轮互动有没有自然承接。',
                    reason: '在信息不足时，观察通常比强推进更稳。'
                },
                {
                    style: '补全信息',
                    content: '把最近最关键的聊天内容补完整，再来分析会更靠谱。',
                    reason: '更完整的上下文能显著提升判断质量。'
                }
            ]
        };

        const analysis = parseStructuredAIResponse(aiResponse.content, fallbackData);

        // 持久化分析结果（异步，不阻塞响应）
        const userId = req.resolvedUser ? req.resolvedUser.id : (req.user ? req.user.id : null);
        if (userId) {
            RelationshipAnalysis.create(userId, req.body, analysis).catch(err => {
                console.error('保存关系分析记录失败:', err.message);
            });
        }

        res.status(200).json({
            status: 'success',
            data: analysis
        });
    } catch (error) {
        console.error('关系分析失败:', error);
        return next(new AppError('关系分析服务暂时不可用', 500));
    }
});

// 截图文字提取
exports.extractTextFromImage = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('请上传一张图片', 400));
    }

    const { buffer, mimetype } = req.file;
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64}`;

    // Use Qwen VL for vision (Minimax v1 API doesn't support vision models)
    const qmaxConfig = aiConfig.providers.qmax;
    if (!qmaxConfig || !qmaxConfig.apiKey) {
        return next(new AppError('AI vision service is not configured', 500));
    }

    const visionModel = process.env.QMAX_VISION_MODEL || 'qwen-vl-plus';

    const messages = [{
        role: 'user',
        content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            {
                type: 'text',
                text: '请提取这张聊天截图中的所有对话文字。保留每条消息的发送者标识（如"我"/"对方"或昵称），按时间顺序逐条输出。只输出提取的文字内容，不要添加任何分析或解释。'
            }
        ]
    }];

    try {
        const axios = require('axios');
        const response = await axios.post(
            `${qmaxConfig.baseURL}/chat/completions`,
            {
                model: visionModel,
                messages: messages,
                max_tokens: 2000
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${qmaxConfig.apiKey}`
                },
                timeout: 60000
            }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
            const extractedText = response.data.choices[0].message.content;
            res.status(200).json({
                success: true,
                data: { extractedText }
            });
        } else {
            throw new Error('Invalid response from vision API');
        }
    } catch (error) {
        console.error('截图文字提取失败:', error.response?.data || error.message);
        return next(new AppError('截图文字提取服务暂时不可用', 500));
    }
});

// 聊天页图片分析（通用 vision）
exports.analyzeChatImage = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('请上传一张图片', 400));
    }

    const { buffer, mimetype } = req.file;
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64}`;
    const userNote = req.body.note || '';

    const qmaxConfig = aiConfig.providers.qmax;
    if (!qmaxConfig || !qmaxConfig.apiKey) {
        return next(new AppError('AI vision service is not configured', 500));
    }

    const visionModel = process.env.QMAX_VISION_MODEL || 'qwen-vl-plus';
    const textPrompt = userNote
        ? `用户发送了一张图片并附言："${userNote}"。请结合图片内容和用户的话，从恋爱沟通的角度给出具体、实用的建议。回复要自然简洁。`
        : '用户在恋爱聊天助手中发送了一张图片。请描述图片内容，并从恋爱沟通的角度给出具体、实用的建议。回复要自然简洁。';

    try {
        const axios = require('axios');
        const response = await axios.post(
            `${qmaxConfig.baseURL}/chat/completions`,
            {
                model: visionModel,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: dataUrl } },
                        { type: 'text', text: textPrompt }
                    ]
                }],
                max_tokens: 1500
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${qmaxConfig.apiKey}`
                },
                timeout: 60000
            }
        );

        if (response.data && response.data.choices && response.data.choices[0]) {
            res.status(200).json({
                success: true,
                data: { reply: response.data.choices[0].message.content }
            });
        } else {
            throw new Error('Invalid response from vision API');
        }
    } catch (error) {
        console.error('聊天图片分析失败:', error.response?.data || error.message);
        return next(new AppError('图片分析服务暂时不可用', 500));
    }
});

// 获取关系分析历史列表
exports.getRelationshipHistory = catchAsync(async (req, res, next) => {
    const userId = req.resolvedUser ? req.resolvedUser.id : (req.user ? req.user.id : null);
    if (!userId) {
        return next(new AppError('请提供用户标识符', 400));
    }
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;
    const records = await RelationshipAnalysis.findByUserId(userId, limit, offset);
    res.status(200).json({ status: 'success', data: { records } });
});

// 获取单条关系分析详情
exports.getRelationshipDetail = catchAsync(async (req, res, next) => {
    const record = await RelationshipAnalysis.findById(req.params.id);
    if (!record) {
        return next(new AppError('分析记录不存在', 404));
    }
    res.status(200).json({ status: 'success', data: record });
});

module.exports = {
    analyzeEmotion: exports.analyzeEmotion,
    generateOpener: exports.generateOpener,
    planDate: exports.planDate,
    suggestTopics: exports.suggestTopics,
    analyzeRelationship: exports.analyzeRelationship,
    extractTextFromImage: exports.extractTextFromImage,
    analyzeChatImage: exports.analyzeChatImage,
    getRelationshipHistory: exports.getRelationshipHistory,
    getRelationshipDetail: exports.getRelationshipDetail
};
