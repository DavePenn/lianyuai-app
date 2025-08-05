const express = require('express');
const router = express.Router();
const { chat, getServiceStatus, resetServiceStatus, getAIConfig } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { optionalUserIdentifier } = require('../middleware/userIdentifierMiddleware');

// 通用聊天接口，不需要认证
router.post('/chat', chat);

// 获取AI配置接口，不需要认证
router.get('/config', getAIConfig);

// 以下路由需要认证，并支持统一用户标识符
router.use(optionalUserIdentifier);

// AI聊天接口（需要会话）
router.post('/chat/:sessionId', chat);

// AI服务状态监控接口
router.get('/status', getServiceStatus);
router.post('/status/reset/:provider', resetServiceStatus);

module.exports = router;