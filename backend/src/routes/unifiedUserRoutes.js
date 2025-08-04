const express = require('express');
const router = express.Router();
const UserResolverService = require('../services/userResolverService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { userIdentifierMiddleware, optionalUserIdentifier } = require('../middleware/userIdentifierMiddleware');

/**
 * 统一用户路由
 * 支持通过多种标识符（ID、邮箱、用户名）访问用户数据
 */

// ========== 用户信息相关接口 ==========

/**
 * 获取用户完整档案
 * GET /api/users/:identifier/profile
 * 支持的标识符：用户ID、邮箱、用户名
 */
router.get('/:identifier/profile', 
    userIdentifierMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const fullProfile = await UserResolverService.getUserFullProfile(user.id);
        
        res.status(200).json({
            success: true,
            data: {
                user: fullProfile,
                authMethod: req.authMethod
            }
        });
    })
);

/**
 * 更新用户档案
 * PUT /api/users/:identifier/profile
 */
router.put('/:identifier/profile',
    userIdentifierMiddleware({ required: true, validatePermission: true }),
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

// ========== 会话相关接口 ==========

/**
 * 获取用户所有会话
 * GET /api/users/:identifier/sessions
 */
router.get('/:identifier/sessions',
    userIdentifierMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const { limit = 50, offset = 0, include_messages = false } = req.query;
        
        const options = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            includeMessages: include_messages === 'true'
        };
        
        const sessions = await UserResolverService.getUserSessions(user.id, options);
        
        res.status(200).json({
            success: true,
            data: {
                sessions,
                total: sessions.length,
                user_id: user.id
            }
        });
    })
);

/**
 * 为用户创建新会话
 * POST /api/users/:identifier/sessions
 */
router.post('/:identifier/sessions',
    userIdentifierMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const { title } = req.body;
        
        const Session = require('../models/sessionModel');
        const newSession = await Session.create(user.id, title || '新对话');
        
        res.status(201).json({
            success: true,
            data: {
                session: newSession
            }
        });
    })
);

// ========== 消息相关接口 ==========

/**
 * 获取用户所有消息
 * GET /api/users/:identifier/messages
 */
router.get('/:identifier/messages',
    userIdentifierMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const {
            session_id,
            role,
            limit = 100,
            offset = 0,
            start_date,
            end_date
        } = req.query;
        
        const filters = {
            sessionId: session_id ? parseInt(session_id) : null,
            role,
            limit: parseInt(limit),
            offset: parseInt(offset),
            startDate: start_date,
            endDate: end_date
        };
        
        const messages = await UserResolverService.getUserMessages(user.id, filters);
        
        res.status(200).json({
            success: true,
            data: {
                messages,
                total: messages.length,
                user_id: user.id,
                filters
            }
        });
    })
);

/**
 * 为用户创建消息
 * POST /api/users/:identifier/messages
 */
router.post('/:identifier/messages',
    userIdentifierMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const { session_id, role, content, model } = req.body;
        
        if (!session_id || !role || !content) {
            return next(new AppError('请提供会话ID、角色和内容', 400));
        }
        
        // 验证会话是否属于该用户
        const Session = require('../models/sessionModel');
        const session = await Session.findById(session_id);
        if (!session || session.user_id !== user.id) {
            return next(new AppError('会话不存在或无权限', 404));
        }
        
        const Message = require('../models/messageModel');
        const newMessage = await Message.create(session_id, role, content, model);
        
        res.status(201).json({
            success: true,
            data: {
                message: newMessage
            }
        });
    })
);

// ========== 统计和分析接口 ==========

/**
 * 获取用户统计信息
 * GET /api/users/:identifier/stats
 */
router.get('/:identifier/stats',
    userIdentifierMiddleware({ required: true, validatePermission: true }),
    catchAsync(async (req, res, next) => {
        const user = req.resolvedUser;
        const stats = await UserResolverService.getUserStats(user.id);
        
        res.status(200).json({
            success: true,
            data: {
                stats,
                user_id: user.id
            }
        });
    })
);

// ========== 批量操作接口 ==========

/**
 * 批量获取用户信息
 * POST /api/users/batch/profiles
 */
router.post('/batch/profiles',
    optionalUserIdentifier,
    catchAsync(async (req, res, next) => {
        const { identifiers, type = 'auto' } = req.body;
        
        if (!identifiers || !Array.isArray(identifiers)) {
            return next(new AppError('请提供用户标识符数组', 400));
        }
        
        if (identifiers.length > 100) {
            return next(new AppError('批量查询最多支持100个用户', 400));
        }
        
        const users = [];
        const errors = [];
        
        for (const identifier of identifiers) {
            try {
                const user = await UserResolverService.resolveUser(identifier, type);
                if (user) {
                    const { password_hash, ...userProfile } = user;
                    users.push(userProfile);
                }
            } catch (error) {
                errors.push({
                    identifier,
                    error: error.message
                });
            }
        }
        
        res.status(200).json({
            success: true,
            data: {
                users,
                errors,
                total: users.length
            }
        });
    })
);

// ========== 搜索接口 ==========

/**
 * 搜索用户
 * GET /api/users/search
 */
router.get('/search',
    optionalUserIdentifier,
    catchAsync(async (req, res, next) => {
        const { q, type = 'username', limit = 20, offset = 0 } = req.query;
        
        if (!q) {
            return next(new AppError('请提供搜索关键词', 400));
        }
        
        const pool = require('../config/database');
        let query, params;
        
        switch (type) {
            case 'email':
                query = 'SELECT id, username, email, name, avatar FROM users WHERE email LIKE ? LIMIT ? OFFSET ?';
                params = [`%${q}%`, parseInt(limit), parseInt(offset)];
                break;
            case 'username':
            default:
                query = 'SELECT id, username, email, name, avatar FROM users WHERE username LIKE ? OR name LIKE ? LIMIT ? OFFSET ?';
                params = [`%${q}%`, `%${q}%`, parseInt(limit), parseInt(offset)];
                break;
        }
        
        const result = await pool.query(query, params);
        
        res.status(200).json({
            success: true,
            data: {
                users: result.rows,
                total: result.rows.length,
                query: q,
                type
            }
        });
    })
);

// ========== 用户验证接口 ==========

/**
 * 验证用户标识符是否存在
 * POST /api/users/validate
 */
router.post('/validate',
    catchAsync(async (req, res, next) => {
        const { identifier, type = 'auto' } = req.body;
        
        if (!identifier) {
            return next(new AppError('请提供用户标识符', 400));
        }
        
        try {
            const user = await UserResolverService.resolveUser(identifier, type);
            
            res.status(200).json({
                success: true,
                data: {
                    exists: !!user,
                    user_id: user ? user.id : null,
                    identifier,
                    type
                }
            });
        } catch (error) {
            res.status(200).json({
                success: true,
                data: {
                    exists: false,
                    user_id: null,
                    identifier,
                    type,
                    error: error.message
                }
            });
        }
    })
);

module.exports = router;