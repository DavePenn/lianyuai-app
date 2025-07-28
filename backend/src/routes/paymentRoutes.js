/**
 * 支付路由
 * 处理会员套餐、支付订单等支付相关功能的路由
 */

const express = require('express');
const router = express.Router();
const {
    getMembershipPlans,
    createPaymentOrder,
    checkOrderStatus,
    getUserOrders
} = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// 获取会员套餐（无需认证）
router.get('/plans', getMembershipPlans);

// 需要认证的接口
router.use(authMiddleware);

// 创建支付订单
router.post('/orders', createPaymentOrder);

// 检查订单状态
router.get('/orders/:orderNo/status', checkOrderStatus);

// 获取用户订单历史
router.get('/orders', getUserOrders);

module.exports = router;