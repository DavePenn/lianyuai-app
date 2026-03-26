const express = require('express');
const router = express.Router();
const { chat, getServiceStatus, resetServiceStatus, getAIConfig } = require('../controllers/aiController');
const multer = require('multer');
const {
    analyzeEmotion,
    generateOpener,
    planDate,
    suggestTopics,
    analyzeRelationship,
    extractTextFromImage
} = require('../controllers/aiExtensionController');

const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});
const { optionalUserIdentifier } = require('../middleware/userIdentifierMiddleware');

// 通用聊天接口，不需要认证
router.post('/chat', chat);

// 获取AI配置接口，不需要认证
router.get('/config', getAIConfig);

// AI扩展能力接口，不需要认证
router.post('/emotion', analyzeEmotion);
router.post('/opener', generateOpener);
router.post('/date-plan', planDate);
router.post('/topics', suggestTopics);
router.post('/relationship-analysis', analyzeRelationship);
router.post('/extract-text', imageUpload.single('image'), extractTextFromImage);

// 以下路由需要认证，并支持统一用户标识符
router.use(optionalUserIdentifier);

// AI聊天接口（需要会话）
router.post('/chat/:sessionId', chat);

// AI服务状态监控接口
router.get('/status', getServiceStatus);
router.post('/status/reset/:provider', resetServiceStatus);

module.exports = router;
