const express = require('express');
const router = express.Router();
const UserResolverService = require('../services/userResolverService');
const emailBasedUserMiddleware = require('../middleware/emailBasedUserMiddleware');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * 基于邮箱的统一用户路由系统
 * 所有接口都使用邮箱作为主要用户标识符
 * 路径格式: /api/users/email/:email/*
 */

/**
 * 获取用户资料
 * GET /api/users/email/:email/profile
 */
router.get('/email/:email/profile',
    emailBasedUserMiddleware({ required: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        
        // 排除敏感信息
        const { password_hash, ...userProfile } = user;
        
        res.status(200).json({
            success: true,
            data: {
                user: userProfile,
                identifier_info: req.userIdentifierInfo
            }
        });
    })
);

/**
 * 更新用户资料
 * PUT /api/users/email/:email/profile
 */
router.put('/email/:email/profile',
    emailBasedUserMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        
        const User = require('../models/userModel');
        const updatedUser = await User.updateProfile(user.id, req.body);
        if (!updatedUser) {
            return next(new AppError('用户更新失败', 400));
        }
        
        // 排除敏感信息
        const { password_hash, ...userProfile } = updatedUser;
        
        res.status(200).json({
            success: true,
            data: {
                user: userProfile
            }
        });
    })
);

/**
 * 获取用户会话列表
 * GET /api/users/email/:email/sessions
 */
router.get('/email/:email/sessions',
    emailBasedUserMiddleware({ required: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const { limit = 50, offset = 0, include_messages = false } = req.query;
        
        const sessions = await UserResolverService.getUserSessions(user.id, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            includeMessages: include_messages === 'true'
        });
        
        res.status(200).json({
            success: true,
            data: {
                sessions,
                total: sessions.length,
                user_email: user.email,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        });
    })
);

/**
 * 为用户创建新会话
 * POST /api/users/email/:email/sessions
 */
router.post('/email/:email/sessions',
    emailBasedUserMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const { title } = req.body;
        
        const Session = require('../models/sessionModel');
        const newSession = await Session.create(user.id, title || '新对话');
        
        res.status(201).json({
            success: true,
            data: {
                session: newSession,
                user_email: user.email
            }
        });
    })
);

/**
 * 获取用户消息列表
 * GET /api/users/email/:email/messages
 */
router.get('/email/:email/messages',
    emailBasedUserMiddleware({ required: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const filters = {
            sessionId: req.query.session_id,
            role: req.query.role,
            limit: parseInt(req.query.limit) || 100,
            offset: parseInt(req.query.offset) || 0
        };
        
        const messages = await UserResolverService.getUserMessages(user.id, filters);
        
        res.status(200).json({
            success: true,
            data: {
                messages,
                total: messages.length,
                user_email: user.email,
                filters
            }
        });
    })
);

/**
 * 为用户创建消息
 * POST /api/users/email/:email/messages
 */
router.post('/email/:email/messages',
    emailBasedUserMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const { session_id, role, content, model } = req.body;
        
        if (!session_id || !role || !content) {
            return next(new AppError('请提供会话ID、角色和消息内容', 400));
        }
        
        // 验证会话是否属于该用户
        const Session = require('../models/sessionModel');
        const session = await Session.findById(session_id);
        if (!session || session.user_id !== user.id) {
            return next(new AppError('会话不存在或无权限访问', 403));
        }
        
        const Message = require('../models/messageModel');
        const newMessage = await Message.create(session_id, role, content, model);
        
        res.status(201).json({
            success: true,
            data: {
                message: newMessage,
                user_email: user.email,
                session_id
            }
        });
    })
);

/**
 * 邮箱验证和用户查找
 * POST /api/users/email/validate
 */
router.post('/email/validate',
    catchAsync(async (req, res, next) => {
        const { email } = req.body;
        
        if (!email || !email.includes('@')) {
            return next(new AppError('请提供有效的邮箱地址', 400));
        }
        
        const user = await UserResolverService.findByEmail(email);
        
        res.status(200).json({
            success: true,
            data: {
                exists: !!user,
                email,
                user_id: user ? user.id : null,
                username: user ? user.username : null
            }
        });
    })
);

/**
 * 批量获取用户资料（通过邮箱列表）
 * POST /api/users/email/batch/profiles
 */
router.post('/email/batch/profiles',
    catchAsync(async (req, res, next) => {
        const { emails } = req.body;
        
        if (!Array.isArray(emails) || emails.length === 0) {
            return next(new AppError('请提供邮箱列表', 400));
        }
        
        const users = [];
        const errors = [];
        
        for (const email of emails) {
            try {
                if (!email.includes('@')) {
                    errors.push({ email, error: '无效的邮箱格式' });
                    continue;
                }
                
                const user = await UserResolverService.findByEmail(email);
                if (user) {
                    const { password_hash, ...userProfile } = user;
                    users.push(userProfile);
                } else {
                    errors.push({ email, error: '用户不存在' });
                }
            } catch (error) {
                errors.push({ email, error: error.message });
            }
        }
        
        res.status(200).json({
            success: true,
            data: {
                users,
                errors,
                total: users.length,
                requested: emails.length
            }
        });
    })
);

/**
 * 邮箱搜索用户
 * GET /api/users/email/search
 */
router.get('/email/search',
    catchAsync(async (req, res, next) => {
        const { q, limit = 10 } = req.query;
        
        if (!q) {
            return next(new AppError('请提供搜索关键词', 400));
        }
        
        // 简单的邮箱域名搜索
        const pool = require('../config/database');
        const result = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE email LIKE ? LIMIT ?',
            [`%${q}%`, parseInt(limit)]
        );
        
        res.status(200).json({
            success: true,
            data: {
                users: result.rows,
                query: q,
                total: result.rows.length
            }
        });
    })
);

module.exports = router;