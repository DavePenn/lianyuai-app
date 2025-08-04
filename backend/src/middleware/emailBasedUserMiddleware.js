const UserResolverService = require('../services/userResolverService');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

/**
 * 基于邮箱的用户标识符中间件
 * 优先使用邮箱作为用户唯一标识符，支持多种获取方式
 * 
 * @param {Object} options - 配置选项
 * @param {boolean} options.required - 是否必须提供用户标识符，默认true
 * @param {boolean} options.validatePermission - 是否验证用户权限，默认false
 * @param {Array} options.sources - 标识符来源优先级，默认['email', 'token', 'id', 'username']
 * @returns {Function} Express中间件函数
 */
const emailBasedUserMiddleware = (options = {}) => {
    const {
        required = true,
        validatePermission = false,
        sources = ['email', 'token', 'id', 'username']
    } = options;

    return async (req, res, next) => {
        try {
            let resolvedUser = null;
            let identifierInfo = null;

            // 按优先级顺序尝试获取用户标识符
            for (const source of sources) {
                switch (source) {
                    case 'email':
                        // 1. 优先从路径参数获取邮箱
                        if (req.params.email && req.params.email.includes('@')) {
                            identifierInfo = {
                                identifier: req.params.email,
                                type: 'email',
                                source: 'path_params'
                            };
                            break;
                        }
                        
                        // 2. 从请求头获取邮箱
                        if (req.headers['x-user-email'] && req.headers['x-user-email'].includes('@')) {
                            identifierInfo = {
                                identifier: req.headers['x-user-email'],
                                type: 'email',
                                source: 'headers'
                            };
                            break;
                        }
                        
                        // 3. 从查询参数获取邮箱
                        if (req.query.email && req.query.email.includes('@')) {
                            identifierInfo = {
                                identifier: req.query.email,
                                type: 'email',
                                source: 'query_params'
                            };
                            break;
                        }
                        
                        // 4. 从请求体获取邮箱
                        if (req.body.email && req.body.email.includes('@')) {
                            identifierInfo = {
                                identifier: req.body.email,
                                type: 'email',
                                source: 'request_body'
                            };
                            break;
                        }
                        break;

                    case 'token':
                        // JWT Token认证（向后兼容）
                        const authHeader = req.headers.authorization;
                        if (authHeader && authHeader.startsWith('Bearer ')) {
                            try {
                                const token = authHeader.substring(7);
                                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                                const user = await UserResolverService.findById(decoded.id);
                                if (user) {
                                    identifierInfo = {
                                        identifier: user.email, // 转换为邮箱标识
                                        type: 'email',
                                        source: 'jwt_token',
                                        originalUserId: decoded.id
                                    };
                                    break;
                                }
                            } catch (error) {
                                // Token无效，继续尝试其他方式
                            }
                        }
                        break;

                    case 'id':
                        // 用户ID（向后兼容）
                        let userId = req.params.identifier || req.params.id || req.headers['x-user-id'] || req.query.user_id || req.body.user_id;
                        if (userId && /^\d+$/.test(userId.toString())) {
                            const user = await UserResolverService.findById(parseInt(userId));
                            if (user) {
                                identifierInfo = {
                                    identifier: user.email, // 转换为邮箱标识
                                    type: 'email',
                                    source: 'user_id_converted',
                                    originalUserId: parseInt(userId)
                                };
                                break;
                            }
                        }
                        break;

                    case 'username':
                        // 用户名（向后兼容）
                        let username = req.params.username || req.headers['x-username'] || req.query.username || req.body.username;
                        if (username && !username.includes('@') && !/^\d+$/.test(username)) {
                            const user = await UserResolverService.findByUsername(username);
                            if (user) {
                                identifierInfo = {
                                    identifier: user.email, // 转换为邮箱标识
                                    type: 'email',
                                    source: 'username_converted',
                                    originalUsername: username
                                };
                                break;
                            }
                        }
                        break;
                }

                // 如果找到了标识符，跳出循环
                if (identifierInfo) break;
            }

            // 如果没有找到任何标识符
            if (!identifierInfo) {
                if (required) {
                    return next(new AppError('请提供用户邮箱标识符', 400));
                }
                return next();
            }

            // 解析用户（现在所有标识符都已转换为邮箱）
            resolvedUser = await UserResolverService.findByEmail(identifierInfo.identifier);
            
            if (!resolvedUser) {
                return next(new AppError('用户不存在', 404));
            }

            // 权限验证
            if (validatePermission) {
                // 检查当前用户是否有权限访问目标用户的数据
                const currentUser = req.user; // 来自JWT认证
                if (currentUser && currentUser.id !== resolvedUser.id) {
                    return next(new AppError('无权限访问该用户数据', 403));
                }
            }

            // 将解析的用户信息添加到请求对象
            req.resolvedUser = resolvedUser;
            req.userIdentifierInfo = identifierInfo;
            
            // 为了向后兼容，也设置传统的user字段
            if (!req.user) {
                req.user = resolvedUser;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = emailBasedUserMiddleware;