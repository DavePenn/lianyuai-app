/**
 * 服务路由
 * 处理反馈、统计、数据同步等服务功能的路由
 */

const express = require('express');
const router = express.Router();
const {
    sendFeedback,
    getAppStats,
    syncData,
    healthCheck,
    getAppConfig
} = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// 健康检查（无需认证）
router.get('/health', healthCheck);

// 应用配置（无需认证）
router.get('/config', getAppConfig);

// 发送反馈（可选认证）
router.post('/feedback', (req, res, next) => {
    // 如果有 Authorization 头，则验证 token，否则允许匿名反馈
    if (req.headers.authorization) {
        return authMiddleware(req, res, next);
    }
    next();
}, sendFeedback);

// 需要认证的接口
router.use(authMiddleware);

// 获取统计数据
router.get('/stats', getAppStats);

// 数据同步
router.post('/sync', syncData);

module.exports = router;