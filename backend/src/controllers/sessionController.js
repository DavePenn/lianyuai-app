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