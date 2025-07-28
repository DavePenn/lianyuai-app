/**
 * 支付控制器
 * 处理会员套餐、支付订单等支付相关功能
 */

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const pool = require('../config/database');

// 获取会员套餐列表
exports.getMembershipPlans = catchAsync(async (req, res, next) => {
    try {
        // 从数据库获取套餐信息
        const result = await pool.query(
            `SELECT * FROM membership_plans WHERE is_active = true ORDER BY price ASC`
        );
        
        let plans = result.rows;
        
        // 如果数据库中没有套餐，返回默认套餐
        if (plans.length === 0) {
            plans = [
                {
                    id: 'basic',
                    name: '基础套餐',
                    description: '适合轻度使用的用户',
                    price: 29.9,
                    currency: 'CNY',
                    duration: 30,
                    features: [
                        '每日100次AI对话',
                        '基础情感分析',
                        '标准客服支持'
                    ],
                    isPopular: false
                },
                {
                    id: 'premium',
                    name: '高级套餐',
                    description: '适合重度使用的用户',
                    price: 59.9,
                    currency: 'CNY',
                    duration: 30,
                    features: [
                        '无限次AI对话',
                        '高级情感分析',
                        '约会规划功能',
                        '优先客服支持',
                        '聊天记录导出'
                    ],
                    isPopular: true
                },
                {
                    id: 'vip',
                    name: 'VIP套餐',
                    description: '享受全部功能的尊贵体验',
                    price: 99.9,
                    currency: 'CNY',
                    duration: 30,
                    features: [
                        '无限次AI对话',
                        '全功能情感分析',
                        '个性化约会规划',
                        '专属客服支持',
                        '高级数据分析',
                        '优先新功能体验'
                    ],
                    isPopular: false
                }
            ];
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                plans
            }
        });
    } catch (error) {
        console.error('获取会员套餐失败:', error);
        
        // 如果数据库表不存在，创建表并返回默认套餐
        if (error.code === '42P01') {
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS membership_plans (
                        id VARCHAR(50) PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        price DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(10) DEFAULT 'CNY',
                        duration INTEGER DEFAULT 30,
                        features JSONB,
                        is_popular BOOLEAN DEFAULT false,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // 插入默认套餐
                const defaultPlans = [
                    {
                        id: 'basic',
                        name: '基础套餐',
                        description: '适合轻度使用的用户',
                        price: 29.9,
                        features: JSON.stringify(['每日100次AI对话', '基础情感分析', '标准客服支持'])
                    },
                    {
                        id: 'premium',
                        name: '高级套餐',
                        description: '适合重度使用的用户',
                        price: 59.9,
                        features: JSON.stringify(['无限次AI对话', '高级情感分析', '约会规划功能', '优先客服支持', '聊天记录导出']),
                        is_popular: true
                    },
                    {
                        id: 'vip',
                        name: 'VIP套餐',
                        description: '享受全部功能的尊贵体验',
                        price: 99.9,
                        features: JSON.stringify(['无限次AI对话', '全功能情感分析', '个性化约会规划', '专属客服支持', '高级数据分析', '优先新功能体验'])
                    }
                ];
                
                for (const plan of defaultPlans) {
                    await pool.query(
                        `INSERT INTO membership_plans (id, name, description, price, features, is_popular) 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [plan.id, plan.name, plan.description, plan.price, plan.features, plan.is_popular || false]
                    );
                }
                
                // 重新获取套餐
                const newResult = await pool.query(
                    `SELECT * FROM membership_plans WHERE is_active = true ORDER BY price ASC`
                );
                
                return res.status(200).json({
                    status: 'success',
                    data: {
                        plans: newResult.rows.map(plan => ({
                            ...plan,
                            features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
                        }))
                    }
                });
            } catch (createError) {
                console.error('创建套餐表失败:', createError);
                return next(new AppError('获取会员套餐失败', 500));
            }
        }
        
        return next(new AppError('获取会员套餐失败', 500));
    }
});

// 创建支付订单
exports.createPaymentOrder = catchAsync(async (req, res, next) => {
    const { planId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    if (!planId) {
        return next(new AppError('请选择会员套餐', 400));
    }
    
    try {
        // 获取套餐信息
        const planResult = await pool.query(
            'SELECT * FROM membership_plans WHERE id = $1 AND is_active = true',
            [planId]
        );
        
        if (planResult.rows.length === 0) {
            return next(new AppError('套餐不存在或已下架', 404));
        }
        
        const plan = planResult.rows[0];
        
        // 生成订单号
        const orderNo = `LY${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // 创建订单
        const orderResult = await pool.query(
            `INSERT INTO payment_orders 
             (order_no, user_id, plan_id, plan_name, amount, currency, payment_method, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
            [
                orderNo,
                userId,
                plan.id,
                plan.name,
                plan.price,
                plan.currency || 'CNY',
                paymentMethod || 'alipay',
                'pending'
            ]
        );
        
        const order = orderResult.rows[0];
        
        // 模拟支付链接生成（实际应用中需要调用支付平台API）
        const paymentUrl = `https://payment.example.com/pay?order=${orderNo}&amount=${plan.price}`;
        
        res.status(201).json({
            status: 'success',
            message: '订单创建成功',
            data: {
                order: {
                    orderNo: order.order_no,
                    planName: order.plan_name,
                    amount: order.amount,
                    currency: order.currency,
                    status: order.status,
                    paymentUrl,
                    createdAt: order.created_at
                }
            }
        });
    } catch (error) {
        console.error('创建支付订单失败:', error);
        
        // 如果订单表不存在，创建表
        if (error.code === '42P01') {
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS payment_orders (
                        id SERIAL PRIMARY KEY,
                        order_no VARCHAR(50) UNIQUE NOT NULL,
                        user_id INTEGER REFERENCES users(id),
                        plan_id VARCHAR(50),
                        plan_name VARCHAR(100),
                        amount DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(10) DEFAULT 'CNY',
                        payment_method VARCHAR(50),
                        status VARCHAR(20) DEFAULT 'pending',
                        paid_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // 重新尝试创建订单
                return exports.createPaymentOrder(req, res, next);
            } catch (createError) {
                console.error('创建订单表失败:', createError);
                return next(new AppError('创建支付订单失败', 500));
            }
        }
        
        return next(new AppError('创建支付订单失败', 500));
    }
});

// 检查订单状态
exports.checkOrderStatus = catchAsync(async (req, res, next) => {
    const { orderNo } = req.params;
    const userId = req.user.id;
    
    if (!orderNo) {
        return next(new AppError('请提供订单号', 400));
    }
    
    try {
        const result = await pool.query(
            'SELECT * FROM payment_orders WHERE order_no = $1 AND user_id = $2',
            [orderNo, userId]
        );
        
        if (result.rows.length === 0) {
            return next(new AppError('订单不存在', 404));
        }
        
        const order = result.rows[0];
        
        // 模拟订单状态检查（实际应用中需要调用支付平台API）
        // 这里简单模拟：如果订单创建超过1分钟且状态为pending，则标记为已支付
        if (order.status === 'pending' && 
            new Date() - new Date(order.created_at) > 60000) {
            
            // 更新订单状态
            await pool.query(
                'UPDATE payment_orders SET status = $1, paid_at = NOW() WHERE id = $2',
                ['paid', order.id]
            );
            
            order.status = 'paid';
            order.paid_at = new Date();
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                order: {
                    orderNo: order.order_no,
                    planName: order.plan_name,
                    amount: order.amount,
                    currency: order.currency,
                    status: order.status,
                    paidAt: order.paid_at,
                    createdAt: order.created_at
                }
            }
        });
    } catch (error) {
        console.error('检查订单状态失败:', error);
        return next(new AppError('检查订单状态失败', 500));
    }
});

// 获取用户订单历史
exports.getUserOrders = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    try {
        const offset = (page - 1) * limit;
        
        const result = await pool.query(
            `SELECT * FROM payment_orders 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        
        const countResult = await pool.query(
            'SELECT COUNT(*) as total FROM payment_orders WHERE user_id = $1',
            [userId]
        );
        
        const orders = result.rows.map(order => ({
            orderNo: order.order_no,
            planName: order.plan_name,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
            paidAt: order.paid_at,
            createdAt: order.created_at
        }));
        
        res.status(200).json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: parseInt(countResult.rows[0].total),
                    pages: Math.ceil(countResult.rows[0].total / limit)
                }
            }
        });
    } catch (error) {
        console.error('获取订单历史失败:', error);
        return next(new AppError('获取订单历史失败', 500));
    }
});

module.exports = {
    getMembershipPlans: exports.getMembershipPlans,
    createPaymentOrder: exports.createPaymentOrder,
    checkOrderStatus: exports.checkOrderStatus,
    getUserOrders: exports.getUserOrders
};