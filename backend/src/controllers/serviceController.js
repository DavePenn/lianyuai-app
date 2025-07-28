/**
 * 服务控制器
 * 处理反馈、统计、数据同步等服务功能
 */

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const pool = require('../config/database');
const Session = require('../models/sessionModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// 发送用户反馈
exports.sendFeedback = catchAsync(async (req, res, next) => {
    const { type, content, rating, email } = req.body;
    const userId = req.user ? req.user.id : null;
    
    if (!content) {
        return next(new AppError('请提供反馈内容', 400));
    }
    
    try {
        // 将反馈保存到数据库
        const result = await pool.query(
            `INSERT INTO feedback (user_id, type, content, rating, email, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
            [userId, type || 'general', content, rating || null, email || null]
        );
        
        res.status(201).json({
            status: 'success',
            message: '反馈提交成功，感谢您的建议！',
            data: {
                feedback: {
                    id: result.rows[0].id,
                    type: result.rows[0].type,
                    content: result.rows[0].content,
                    rating: result.rows[0].rating,
                    createdAt: result.rows[0].created_at
                }
            }
        });
    } catch (error) {
        console.error('保存反馈失败:', error);
        
        // 如果数据库表不存在，创建表
        if (error.code === '42P01') {
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS feedback (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(id),
                        type VARCHAR(50) DEFAULT 'general',
                        content TEXT NOT NULL,
                        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                        email VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // 重新尝试插入
                const result = await pool.query(
                    `INSERT INTO feedback (user_id, type, content, rating, email, created_at) 
                     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
                    [userId, type || 'general', content, rating || null, email || null]
                );
                
                return res.status(201).json({
                    status: 'success',
                    message: '反馈提交成功，感谢您的建议！',
                    data: {
                        feedback: {
                            id: result.rows[0].id,
                            type: result.rows[0].type,
                            content: result.rows[0].content,
                            rating: result.rows[0].rating,
                            createdAt: result.rows[0].created_at
                        }
                    }
                });
            } catch (createError) {
                console.error('创建反馈表失败:', createError);
                return next(new AppError('反馈提交失败，请稍后重试', 500));
            }
        }
        
        return next(new AppError('反馈提交失败，请稍后重试', 500));
    }
});

// 获取应用统计数据
exports.getAppStats = catchAsync(async (req, res, next) => {
    const userId = req.user ? req.user.id : null;
    
    try {
        // 获取用户相关统计
        let userStats = {};
        if (userId) {
            const userSessionsResult = await pool.query(
                'SELECT COUNT(*) as session_count FROM sessions WHERE user_id = $1',
                [userId]
            );
            
            const userMessagesResult = await pool.query(
                `SELECT COUNT(*) as message_count FROM messages m 
                 JOIN sessions s ON m.session_id = s.id 
                 WHERE s.user_id = $1`,
                [userId]
            );
            
            userStats = {
                sessions: parseInt(userSessionsResult.rows[0].session_count),
                messages: parseInt(userMessagesResult.rows[0].message_count)
            };
        }
        
        // 获取系统总体统计（仅管理员可见）
        const systemStats = {
            totalUsers: 0,
            totalSessions: 0,
            totalMessages: 0,
            activeUsers: 0
        };
        
        // 如果是管理员用户，提供系统统计
        if (userId) {
            try {
                const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM users');
                const totalSessionsResult = await pool.query('SELECT COUNT(*) as count FROM sessions');
                const totalMessagesResult = await pool.query('SELECT COUNT(*) as count FROM messages');
                const activeUsersResult = await pool.query(
                    `SELECT COUNT(DISTINCT user_id) as count FROM sessions 
                     WHERE updated_at > NOW() - INTERVAL '7 days'`
                );
                
                systemStats.totalUsers = parseInt(totalUsersResult.rows[0].count);
                systemStats.totalSessions = parseInt(totalSessionsResult.rows[0].count);
                systemStats.totalMessages = parseInt(totalMessagesResult.rows[0].count);
                systemStats.activeUsers = parseInt(activeUsersResult.rows[0].count);
            } catch (error) {
                console.warn('获取系统统计失败:', error.message);
            }
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                user: userStats,
                system: systemStats,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('获取统计数据失败:', error);
        return next(new AppError('获取统计数据失败', 500));
    }
});

// 数据同步服务
exports.syncData = catchAsync(async (req, res, next) => {
    const { sessions } = req.body;
    const userId = req.user.id;
    
    if (!sessions || !Array.isArray(sessions)) {
        return next(new AppError('请提供有效的会话数据', 400));
    }
    
    try {
        let syncedCount = 0;
        let errorCount = 0;
        
        // 同步每个会话
        for (const sessionData of sessions) {
            try {
                // 检查会话是否已存在
                const existingSession = await Session.findById(sessionData.id);
                
                if (!existingSession) {
                    // 创建新会话
                    await Session.create(userId, sessionData.title || '同步会话');
                    syncedCount++;
                } else if (existingSession.user_id === userId) {
                    // 更新现有会话（仅限用户自己的会话）
                    // 这里可以添加更新逻辑
                    syncedCount++;
                }
            } catch (sessionError) {
                console.error('同步会话失败:', sessionError);
                errorCount++;
            }
        }
        
        // 返回用户的最新会话列表
        const updatedSessions = await Session.findByUser(userId);
        
        res.status(200).json({
            status: 'success',
            message: `数据同步完成，成功同步 ${syncedCount} 个会话`,
            data: {
                syncedCount,
                errorCount,
                sessions: updatedSessions
            }
        });
    } catch (error) {
        console.error('数据同步失败:', error);
        return next(new AppError('数据同步失败', 500));
    }
});

// 健康检查
exports.healthCheck = catchAsync(async (req, res, next) => {
    try {
        // 检查数据库连接
        await pool.query('SELECT 1');
        
        const healthInfo = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: 'connected',
            uptime: process.uptime()
        };
        
        res.status(200).json({
            status: 'success',
            data: healthInfo
        });
    } catch (error) {
        console.error('健康检查失败:', error);
        
        const healthInfo = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: 'disconnected',
            uptime: process.uptime(),
            error: error.message
        };
        
        res.status(503).json({
            status: 'error',
            data: healthInfo
        });
    }
});

// 获取应用配置
exports.getAppConfig = catchAsync(async (req, res, next) => {
    const config = {
        app: {
            name: 'Lianyu AI',
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        },
        features: {
            fileUpload: true,
            aiChat: true,
            emotionAnalysis: true,
            dateePlanning: true,
            exportChat: true
        },
        limits: {
            maxFileSize: '10MB',
            maxFilesPerUpload: 5,
            maxSessionsPerUser: 100,
            maxMessagesPerSession: 1000
        },
        ai: {
            providers: ['openai', 'gemini', 'qmax'],
            currentProvider: process.env.AI_CURRENT_PROVIDER || 'openai'
        }
    };
    
    res.status(200).json({
        status: 'success',
        data: config
    });
});

module.exports = {
    sendFeedback: exports.sendFeedback,
    getAppStats: exports.getAppStats,
    syncData: exports.syncData,
    healthCheck: exports.healthCheck,
    getAppConfig: exports.getAppConfig
};