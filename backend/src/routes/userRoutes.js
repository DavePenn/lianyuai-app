const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { optionalUserIdentifier } = require('../middleware/userIdentifierMiddleware');

// 公开路由（无需认证）
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/google', userController.googleAuth);
router.get('/profile/:email', userController.getProfileByEmail);

// 受保护的路由（需要认证），支持统一用户标识符
router.use(optionalUserIdentifier);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.get('/verify', userController.verifyToken);

module.exports = router;