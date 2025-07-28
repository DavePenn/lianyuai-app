const Session = require('../models/sessionModel');
const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createSession = catchAsync(async (req, res, next) => {
    const { title } = req.body;
    const userId = req.user.id;
    
    const newSession = await Session.create(userId, title || '新对话');
    
    res.status(201).json({
        status: 'success',
        data: {
            session: newSession
        }
    });
});

exports.getSessions = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const sessions = await Session.findByUser(userId);
    
    res.status(200).json({
        status: 'success',
        results: sessions.length,
        data: {
            sessions
        }
    });
});

exports.getMessages = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
        return next(new AppError('请提供会话ID', 400));
    }
    
    const messages = await Message.findBySession(sessionId);
    if (!messages) {
        return next(new AppError('未找到该会话的消息记录', 404));
    }
    
    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
            messages
        }
    });
});

exports.postMessage = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;
    const { role, content, model } = req.body;
    
    if (!sessionId) {
        return next(new AppError('请提供会话ID', 400));
    }
    
    if (!role || !content) {
        return next(new AppError('请提供消息角色和内容', 400));
    }
    
    const newMessage = await Message.create(sessionId, role, content, model);
    
    res.status(201).json({
        status: 'success',
        data: {
            message: newMessage
        }
    });
});

// 删除单条消息
exports.deleteMessage = catchAsync(async (req, res, next) => {
    const { messageId } = req.params;
    const userId = req.user.id;
    
    if (!messageId) {
        return next(new AppError('请提供消息ID', 400));
    }
    
    // 查找消息并验证权限
    const message = await Message.findById(messageId);
    if (!message) {
        return next(new AppError('消息不存在', 404));
    }
    
    // 验证用户是否有权限删除该消息（通过会话验证）
    const session = await Session.findById(message.session_id);
    if (!session || session.user_id !== userId) {
        return next(new AppError('无权限删除该消息', 403));
    }
    
    const deletedMessage = await Message.deleteById(messageId);
    
    res.status(200).json({
        status: 'success',
        message: '消息删除成功',
        data: {
            deletedMessage
        }
    });
});

// 导出会话消息
exports.exportMessages = catchAsync(async (req, res, next) => {
    const { sessionId } = req.params;
    const { format = 'txt' } = req.query;
    const userId = req.user.id;
    
    if (!sessionId) {
        return next(new AppError('请提供会话ID', 400));
    }
    
    // 验证会话权限
    const session = await Session.findById(sessionId);
    if (!session || session.user_id !== userId) {
        return next(new AppError('无权限导出该会话', 403));
    }
    
    const exportData = await Message.exportBySession(sessionId, format);
    
    // 设置响应头
    const filename = `chat_${sessionId}_${new Date().toISOString().split('T')[0]}.${format}`;
    const contentType = format === 'json' ? 'application/json' : 'text/plain';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.status(200).send(exportData);
});