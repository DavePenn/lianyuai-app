const UserResolverService = require('../services/userResolverService');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

/**
 * 统一用户标识符中间件
 * 支持多种用户识别方式：JWT token、用户ID、邮箱、用户名等
 */
const userIdentifierMiddleware = (options = {}) => {
    const {
        required = true,           // 是否必须提供用户标识符
        allowToken = true,         // 是否允许JWT token认证
        allowParams = true,        // 是否允许路径参数
        allowQuery = true,         // 是否允许查询参数
        allowBody = true,          // 是否允许请求体参数
        validatePermission = true  // 是否验证用户权限
    } = options;

    return async (req, res, next) => {
        try {
            let resolvedUser = null;
            let authMethod = null;

            // 1. 尝试JWT token认证
            if (allowToken) {
                const tokenResult = await tryTokenAuth(req);
                if (tokenResult.user) {
                    resolvedUser = tokenResult.user;
                    authMethod = 'token';
                }
            }

            // 2. 如果token认证失败，尝试其他方式
            if (!resolvedUser) {
                const identifierInfo = UserResolverService.extractUserIdentifier(req);
                
                if (identifierInfo) {
                    // 检查是否允许该来源的标识符
                    if (!isSourceAllowed(identifierInfo.source, { allowParams, allowQuery, allowBody })) {
                        if (required) {
                            return next(new AppError('不支持的用户标识符来源', 400));
                        }
                        return next();
                    }

                    // 解析用户
                    resolvedUser = await UserResolverService.resolveUser(
                        identifierInfo.identifier,
                        identifierInfo.type
                    );
                    authMethod = identifierInfo.source;
                }
            }

            // 3. 检查是否必须提供用户标识符
            if (required && !resolvedUser) {
                return next(new AppError('请提供有效的用户标识符', 401));
            }

            // 4. 权限验证
            if (resolvedUser && validatePermission) {
                const hasPermission = await validateUserPermission(req, resolvedUser);
                if (!hasPermission) {
                    return next(new AppError('没有权限访问该用户的数据', 403));
                }
            }

            // 5. 将解析的用户信息添加到请求对象
            if (resolvedUser) {
                req.resolvedUser = resolvedUser;
                req.authMethod = authMethod;
                
                // 为了兼容现有代码，也设置req.user
                if (!req.user) {
                    req.user = resolvedUser;
                }
            }

            next();
        } catch (error) {
            if (error instanceof AppError) {
                return next(error);
            }
            console.error('用户标识符中间件错误:', error);
            return next(new AppError('用户认证失败', 500));
        }
    };
};

/**
 * 尝试JWT token认证
 * @param {Object} req - Express请求对象
 * @returns {Object} 认证结果
 */
async function tryTokenAuth(req) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { user: null, error: 'No token provided' };
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await UserResolverService.resolveUser(decoded.id, 'id');
        return { user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

/**
 * 检查标识符来源是否被允许
 * @param {string} source - 标识符来源
 * @param {Object} allowedSources - 允许的来源配置
 * @returns {boolean} 是否允许
 */
function isSourceAllowed(source, allowedSources) {
    switch (source) {
        case 'params':
            return allowedSources.allowParams;
        case 'query':
            return allowedSources.allowQuery;
        case 'body':
            return allowedSources.allowBody;
        case 'token':
            return true; // token总是允许的
        default:
            return false;
    }
}

/**
 * 验证用户权限
 * @param {Object} req - Express请求对象
 * @param {Object} resolvedUser - 解析的用户对象
 * @returns {boolean} 是否有权限
 */
async function validateUserPermission(req, resolvedUser) {
    // 如果请求中已经有认证用户，检查是否为同一用户
    if (req.user && req.user.id && req.user.id !== resolvedUser.id) {
        // 这里可以添加管理员权限检查
        // if (req.user.role === 'admin') return true;
        return false;
    }

    // 检查特定路由的权限
    const targetUserId = getTargetUserIdFromRequest(req);
    if (targetUserId && targetUserId !== resolvedUser.id) {
        return await UserResolverService.validateUserPermission(
            resolvedUser.id,
            targetUserId,
            getActionFromRequest(req)
        );
    }

    return true;
}

/**
 * 从请求中获取目标用户ID
 * @param {Object} req - Express请求对象
 * @returns {number|null} 目标用户ID
 */
function getTargetUserIdFromRequest(req) {
    // 从路径参数中获取
    if (req.params.userId) {
        return parseInt(req.params.userId);
    }

    // 从查询参数中获取
    if (req.query.target_user_id) {
        return parseInt(req.query.target_user_id);
    }

    // 从请求体中获取
    if (req.body.target_user_id) {
        return parseInt(req.body.target_user_id);
    }

    return null;
}

/**
 * 从请求中获取操作类型
 * @param {Object} req - Express请求对象
 * @returns {string} 操作类型
 */
function getActionFromRequest(req) {
    switch (req.method) {
        case 'GET':
            return 'read';
        case 'POST':
            return 'create';
        case 'PUT':
        case 'PATCH':
            return 'update';
        case 'DELETE':
            return 'delete';
        default:
            return 'unknown';
    }
}

/**
 * 创建可选的用户标识符中间件
 * 不要求必须提供用户标识符
 */
const optionalUserIdentifier = userIdentifierMiddleware({ required: false });

/**
 * 创建严格的用户标识符中间件
 * 要求必须提供用户标识符且验证权限
 */
const strictUserIdentifier = userIdentifierMiddleware({ 
    required: true, 
    validatePermission: true 
});

/**
 * 创建仅支持token认证的中间件
 * 与原有的authMiddleware兼容
 */
const tokenOnlyIdentifier = userIdentifierMiddleware({
    required: true,
    allowParams: false,
    allowQuery: false,
    allowBody: false,
    allowToken: true
});

module.exports = {
    userIdentifierMiddleware,
    optionalUserIdentifier,
    strictUserIdentifier,
    tokenOnlyIdentifier
};