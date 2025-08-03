const express = require('express');
const router = express.Router();
const { chat, getServiceStatus, resetServiceStatus } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// 通用聊天接口，不需要认证
router.post('/chat', chat);

// 以下路由需要认证
router.use(authMiddleware);

// AI聊天接口（需要会话）
router.post('/chat/:sessionId', chat);

// AI服务状态监控接口
router.get('/status', getServiceStatus);
router.post('/status/reset/:provider', resetServiceStatus);

module.exports = router;