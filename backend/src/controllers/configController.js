/**
 * 配置控制器
 * 处理所有与配置相关的请求
 */

const configController = {
    /**
     * 获取AI配置
     */
    getAIConfig: (req, res) => {
        const aiConfig = require('../config/aiConfig');
        res.json(aiConfig);
    }
};

module.exports = configController;