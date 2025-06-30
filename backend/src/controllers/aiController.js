const Message = require('../models/messageModel');
const Session = require('../models/sessionModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const aiService = require('../services/aiService');
const aiConfig = require('../config/aiConfig');

exports.chat = catchAsync(async (req, res, next) => {
    console.log('AI Chat Request:', {
        params: req.params,
        body: req.body,
        headers: req.headers
    });
    
    const { sessionId } = req.params;
    const { message, messages, provider = aiConfig.currentProvider, data } = req.body;

    // 如果没有sessionId，则为简单的AI调用
    if (!sessionId) {
        let messagesToSend = messages;
        
        // 检查是否是前端发送的格式（包含data对象）
        if (data && data.messages && Array.isArray(data.messages)) {
            messagesToSend = data.messages;
        } else if (!messages || !Array.isArray(messages)) {
            console.error('Missing messages in request:', req.body);
            return next(new AppError('请提供消息数组', 400));
        }

        console.log('Calling AI service with:', {
            provider: provider,
            messages: messagesToSend
        });

        const aiResponse = await aiService.chat(provider, messagesToSend);
        
        console.log('AI service response:', aiResponse);

        return res.status(200).json({
            status: 'success',
            content: aiResponse.content,
            usage: aiResponse.usage
        });
    }

    // 原有的会话聊天逻辑
    if (!message) {
        return next(new AppError('请输入消息内容', 400));
    }

    const session = await Session.findById(sessionId);
    if (!session || session.user_id !== req.user.id) {
        return next(new AppError('未找到会话', 404));
    }

    const history = await Message.findLastBySession(sessionId, 10);
    const historyMessages = history.map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    historyMessages.push({ role: 'user', content: message });

    await Message.create(sessionId, 'user', message);

    console.log('Calling AI service with session:', {
        provider: provider,
        messages: historyMessages
    });

    const aiResponse = await aiService.chat(provider, historyMessages);
    
    console.log('AI service response for session:', aiResponse);

    const savedResponse = await Message.create(sessionId, 'assistant', aiResponse.content, provider);

    res.status(200).json({
        status: 'success',
        data: {
            message: savedResponse
        }
    });
});

// 获取AI服务状态
exports.getServiceStatus = catchAsync(async (req, res, next) => {
    const status = aiService.getServiceStatus();
    
    res.status(200).json({
        status: 'success',
        data: {
            services: status,
            timestamp: new Date().toISOString()
        }
    });
});

// 重置AI服务状态
exports.resetServiceStatus = catchAsync(async (req, res, next) => {
    const { provider } = req.params;
    
    if (provider === 'all') {
        aiService.resetAllServiceStatus();
        res.status(200).json({
            status: 'success',
            message: 'All AI service statuses have been reset'
        });
    } else {
        const result = aiService.resetServiceStatus(provider);
        if (result) {
            res.status(200).json({
                status: 'success',
                message: `AI service status for ${provider} has been reset`
            });
        } else {
            return next(new AppError(`Unknown AI provider: ${provider}`, 400));
        }
    }
});