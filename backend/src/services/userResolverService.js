const User = require('../models/userModel');
const Session = require('../models/sessionModel');
const Message = require('../models/messageModel');
const AppError = require('../utils/AppError');

/**
 * 用户解析服务
 * 提供统一的用户标识符解析和用户数据获取功能
 */
class UserResolverService {
    /**
     * 根据任意标识符解析用户
     * @param {string|number} identifier - 用户标识符
     * @param {string} type - 标识符类型 ('auto', 'id', 'email', 'username', 'google_id')
     * @returns {Object} 用户对象
     */
    static async resolveUser(identifier, type = 'auto') {
        if (!identifier) {
            throw new AppError('用户标识符不能为空', 400);
        }

        let user = null;

        try {
            switch (type) {
                case 'id':
                    user = await User.findById(identifier);
                    break;
                    
                case 'email':
                    user = await User.findByEmail(identifier);
                    break;
                    
                case 'username':
                    user = await User.findByUsername(identifier);
                    break;
                    
                case 'google_id':
                    user = await this.findByGoogleId(identifier);
                    break;
                    
                case 'auto':
                default:
                    // 自动检测标识符类型
                    user = await this.autoResolveUser(identifier);
                    break;
            }

            if (!user) {
                throw new AppError('用户不存在', 404);
            }

            return user;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('用户解析失败', 500);
        }
    }

    /**
     * 自动检测并解析用户标识符 - 优先使用邮箱作为唯一标识
     * @param {string|number} identifier - 用户标识符
     * @returns {Object} 用户对象
     */
    static async autoResolveUser(identifier) {
        // 优先检查邮箱格式（包含@符号）
        if (identifier.includes('@')) {
            const user = await User.findByEmail(identifier);
            if (user) return user;
            throw new AppError('邮箱用户不存在', 404);
        }

        // 如果是纯数字，按ID查找（向后兼容）
        if (/^\d+$/.test(identifier.toString())) {
            const user = await User.findById(parseInt(identifier));
            if (user) return user;
        }

        // 按用户名查找（向后兼容）
        const userByUsername = await User.findByUsername(identifier);
        if (userByUsername) return userByUsername;

        throw new AppError('用户不存在', 404);
    }

    /**
     * 根据Google ID查找用户
     * @param {string} googleId - Google ID
     * @returns {Object} 用户对象
     */
    static async findByGoogleId(googleId) {
        const pool = require('../config/database');
        const result = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
        return result.rows[0];
    }

    /**
     * 获取用户完整档案信息
     * @param {number} userId - 用户ID
     * @returns {Object} 用户完整信息
     */
    static async getUserFullProfile(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('用户不存在', 404);
        }

        // 排除敏感信息
        const { password_hash, ...userProfile } = user;
        
        return {
            ...userProfile,
            // 可以在这里添加额外的用户统计信息
            stats: await this.getUserStats(userId)
        };
    }

    /**
     * 获取用户统计信息
     * @param {number} userId - 用户ID
     * @returns {Object} 用户统计信息
     */
    static async getUserStats(userId) {
        try {
            const sessions = await Session.findByUserId(userId);
            const sessionCount = sessions.length;
            
            // 计算总消息数
            let totalMessages = 0;
            for (const session of sessions) {
                const messages = await Message.findBySession(session.id);
                totalMessages += messages.length;
            }

            return {
                sessionCount,
                totalMessages,
                lastActiveAt: sessions.length > 0 ? sessions[0].updated_at : null
            };
        } catch (error) {
            console.error('获取用户统计信息失败:', error);
            return {
                sessionCount: 0,
                totalMessages: 0,
                lastActiveAt: null
            };
        }
    }

    /**
     * 获取用户所有会话
     * @param {number} userId - 用户ID
     * @param {Object} options - 查询选项
     * @returns {Array} 会话列表
     */
    static async getUserSessions(userId, options = {}) {
        const { limit = 50, offset = 0, includeMessages = false } = options;
        
        const sessions = await Session.findByUserId(userId);
        
        if (!includeMessages) {
            return sessions.slice(offset, offset + limit);
        }

        // 包含消息的会话列表
        const sessionsWithMessages = [];
        for (const session of sessions.slice(offset, offset + limit)) {
            const messages = await Message.findBySession(session.id);
            sessionsWithMessages.push({
                ...session,
                messages,
                messageCount: messages.length
            });
        }

        return sessionsWithMessages;
    }

    /**
     * 获取用户所有消息
     * @param {number} userId - 用户ID
     * @param {Object} filters - 过滤条件
     * @returns {Array} 消息列表
     */
    static async getUserMessages(userId, filters = {}) {
        const { 
            sessionId = null, 
            role = null, 
            limit = 100, 
            offset = 0,
            startDate = null,
            endDate = null
        } = filters;

        // 首先获取用户的所有会话
        const sessions = await Session.findByUserId(userId);
        const sessionIds = sessions.map(s => s.id);

        if (sessionIds.length === 0) {
            return [];
        }

        // 构建查询条件
        let whereConditions = [`session_id IN (${sessionIds.map(() => '?').join(',')})`];
        let queryParams = [...sessionIds];

        if (sessionId) {
            whereConditions.push('session_id = ?');
            queryParams.push(sessionId);
        }

        if (role) {
            whereConditions.push('role = ?');
            queryParams.push(role);
        }

        if (startDate) {
            whereConditions.push('created_at >= ?');
            queryParams.push(startDate);
        }

        if (endDate) {
            whereConditions.push('created_at <= ?');
            queryParams.push(endDate);
        }

        const query = `
            SELECT m.*, s.title as session_title 
            FROM messages m 
            JOIN sessions s ON m.session_id = s.id 
            WHERE ${whereConditions.join(' AND ')} 
            ORDER BY m.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        queryParams.push(limit, offset);

        const pool = require('../config/database');
        const result = await pool.query(query, queryParams);
        
        return result.rows;
    }

    /**
     * 验证用户权限
     * @param {number} requestUserId - 请求用户ID
     * @param {number} targetUserId - 目标用户ID
     * @param {string} action - 操作类型
     * @returns {boolean} 是否有权限
     */
    static async validateUserPermission(requestUserId, targetUserId, action = 'read') {
        // 用户只能访问自己的数据
        if (requestUserId !== targetUserId) {
            return false;
        }

        // 这里可以根据需要添加更复杂的权限逻辑
        // 比如管理员权限、好友权限等
        
        return true;
    }

    /**
     * 从请求中提取用户标识符
     * @param {Object} req - Express请求对象
     * @returns {Object} 用户标识符信息
     */
    static extractUserIdentifier(req) {
        // 从路径参数中提取
        if (req.params.identifier) {
            return {
                identifier: req.params.identifier,
                source: 'params'
            };
        }

        // 从查询参数中提取
        if (req.query.user_id) {
            return {
                identifier: req.query.user_id,
                type: 'id',
                source: 'query'
            };
        }

        if (req.query.email) {
            return {
                identifier: req.query.email,
                type: 'email',
                source: 'query'
            };
        }

        if (req.query.username) {
            return {
                identifier: req.query.username,
                type: 'username',
                source: 'query'
            };
        }

        // 从请求体中提取
        if (req.body.user_id) {
            return {
                identifier: req.body.user_id,
                type: 'id',
                source: 'body'
            };
        }

        if (req.body.email) {
            return {
                identifier: req.body.email,
                type: 'email',
                source: 'body'
            };
        }

        // 从JWT token中提取（如果已经通过认证中间件）
        if (req.user && req.user.id) {
            return {
                identifier: req.user.id,
                type: 'id',
                source: 'token'
            };
        }

        return null;
    }
}

module.exports = UserResolverService;