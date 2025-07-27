/**
 * 后端服务接口层
 * 处理与后端API的所有通信
 */

class BackendService {
    constructor() {
        // 优先使用平台配置的API地址
        if (window.PlatformConfig && window.PlatformConfig.get) {
            this.baseURL = window.PlatformConfig.get('api.baseURL') || 'http://152.32.218.174:3001';
        } else if (window.AppConfig && window.AppConfig.api) {
            // 使用AppConfig中的配置
            this.baseURL = window.AppConfig.api.baseURL;
        } else {
            console.warn('配置未正确加载，使用默认配置');
            this.baseURL = 'http://152.32.218.174:3001';
        }
        this.token = this.getAuthToken();
    }

    /**
     * 获取认证令牌
     */
    getAuthToken() {
        try {
            return (typeof localStorage !== 'undefined') 
                ? localStorage.getItem('auth_token') 
                : null;
        } catch (error) {
            console.warn('localStorage不可用:', error.message);
            return null;
        }
    }

    /**
     * 设置认证令牌
     */
    setAuthToken(token) {
        this.token = token;
        try {
            if (typeof localStorage !== 'undefined') {
                if (token) {
                    localStorage.setItem('auth_token', token);
                } else {
                    localStorage.removeItem('auth_token');
                }
            }
        } catch (error) {
            console.warn('localStorage不可用:', error.message);
        }
    }

    /**
     * 通用HTTP请求方法
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            credentials: 'include',
            mode: 'cors',
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
                const errorMessage = errorData?.message || response.statusText;
                throw new Error(`${errorMessage}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error(`Backend request failed: ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * 获取AI配置
     */
    async getAIConfig() {
        return await this.request('/api/config/ai');
    }

    /**
     * 调用AI服务
     */
    async callAI(provider, data) {
        return await this.request('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                provider: provider,
                messages: data.messages,
                data: data  // 添加完整的data对象以兼容后端
            })
        });
    }

    // ========== 用户服务 ==========

    /**
     * 用户登录
     */
    async login(credentials) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            this.setAuthToken(response.token);
        }
        
        return response;
    }

    /**
     * 用户注册
     */
    async register(userData) {
        const response = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.token) {
            this.setAuthToken(response.token);
        }
        
        return response;
    }



    /**
     * 获取用户信息
     */
    async getUserProfile() {
        return await this.request('/api/users/profile');
    }

    /**
     * 更新用户信息
     */
    async updateUserProfile(profileData) {
        return await this.request('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    /**
     * 用户退出登录
     */
    logout() {
        this.setAuthToken(null);
        // 清除本地存储的用户数据
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('chatSessions');
                localStorage.removeItem('currentSessionId');
            }
        } catch (error) {
            console.warn('localStorage不可用:', error.message);
        }
    }

    // ========== 会话服务 ==========

    /**
     * 获取用户的聊天会话列表
     */
    async getSessions() {
        return await this.request('/api/sessions');
    }

    /**
     * 创建新的聊天会话
     */
    async createSession(sessionData) {
        return await this.request('/api/sessions', {
            method: 'POST',
            body: JSON.stringify(sessionData)
        });
    }

    /**
     * 更新聊天会话
     */
    async updateSession(sessionId, updateData) {
        return await this.request(`/api/sessions/${sessionId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
    }

    /**
     * 删除聊天会话
     */
    async deleteSession(sessionId) {
        return await this.request(`/api/sessions/${sessionId}`, {
            method: 'DELETE'
        });
    }

    // ========== 消息服务 ==========

    /**
     * 获取会话中的消息
     */
    async getMessages(sessionId, page = 1, limit = 20) {
        return await this.request(`/api/messages/${sessionId}?page=${page}&limit=${limit}`);
    }

    /**
     * 发送消息
     */
    async sendMessage(sessionId, messageData) {
        return await this.request(`/api/messages/${sessionId}`, {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    /**
     * 获取AI回复
     */
    async getAIReply(sessionId, userMessage, context = {}) {
        return await this.request('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                sessionId,
                message: userMessage,
                context
            })
        });
    }

    /**
     * 删除消息
     */
    async deleteMessage(messageId) {
        return await this.request(`/api/messages/single/${messageId}`, {
            method: 'DELETE'
        });
    }

    /**
     * 导出聊天记录
     */
    async exportMessages(sessionId, format = 'txt') {
        return await this.request(`/api/messages/${sessionId}/export?format=${format}`);
    }

    // ========== AI服务 ==========

    /**
     * 情感分析
     */
    async analyzeEmotion(message) {
        return await this.request('/api/ai/emotion', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }

    /**
     * 生成开场白
     */
    async generateOpener(profileData) {
        return await this.request('/api/ai/opener', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    }

    /**
     * 约会规划
     */
    async planDate(preferences) {
        return await this.request('/api/ai/date-plan', {
            method: 'POST',
            body: JSON.stringify(preferences)
        });
    }

    // ========== 支付服务 ==========

    /**
     * 获取会员套餐
     */
    async getMembershipPlans() {
        return await this.request('/api/payments/plans');
    }

    /**
     * 创建支付订单
     */
    async createPaymentOrder(planId, paymentMethod) {
        return await this.request('/api/payments/orders', {
            method: 'POST',
            body: JSON.stringify({
                planId,
                paymentMethod
            })
        });
    }

    /**
     * 检查订单状态
     */
    async checkOrderStatus(orderId) {
        return await this.request(`/api/payments/orders/${orderId}/status`);
    }

    // ========== 数据同步 ==========

    /**
     * 同步本地数据到服务器
     */
    async syncLocalData() {
        try {
            // 同步聊天会话
            let localSessions = [];
            try {
                if (typeof localStorage !== 'undefined') {
                    localSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
                }
            } catch (error) {
                console.warn('localStorage读取失败:', error.message);
            }
            
            if (localSessions.length > 0) {
                await this.request('/api/sync/sessions', {
                    method: 'POST',
                    body: JSON.stringify({ sessions: localSessions })
                });
            }

            // 获取服务器端数据
            const serverSessions = await this.getSessions();
            if (serverSessions) {
                try {
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('chatSessions', JSON.stringify(serverSessions));
                    }
                } catch (error) {
                    console.warn('localStorage写入失败:', error.message);
                }
            }

            return { success: true, message: window.i18n ? window.i18n.t('api.sync.success') : '数据同步成功' };
        } catch (error) {
            console.error('数据同步失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 检查网络连接状态
     */
    async checkConnection() {
        try {
            await this.request('/api/health');
            return true;
        } catch (error) {
            return false;
        }
    }

    // ========== 工具方法 ==========

    /**
     * 上传文件
     */
    async uploadFile(file, type = 'image') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        return await this.request('/api/upload', {
            method: 'POST',
            body: formData,
            headers: {
                // 不设置Content-Type，让浏览器自动设置multipart/form-data
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        });
    }

    /**
     * 获取应用统计数据
     */
    async getAppStats() {
        return await this.request('/api/stats');
    }

    /**
     * 发送反馈
     */
    async sendFeedback(feedbackData) {
        return await this.request('/api/feedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    }

    /**
     * 获取应用配置
     */
    async getAppConfig() {
        return await this.request('/api/config');
    }
}

// 创建服务实例
const backendService = new BackendService();

// 在浏览器环境中挂载到window
if (typeof window !== 'undefined') {
    window.BackendService = BackendService;
    window.backendService = backendService;
}

// 在Node.js环境中导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = backendService;
}