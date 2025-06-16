/**
 * 跨平台网络请求适配器
 * 统一不同平台的HTTP请求接口
 */

class NetworkAdapter {
    constructor() {
        this.platform = window.PlatformConfig?.getPlatform() || 'web';
        this.baseURL = window.PlatformConfig?.get('api.baseURL') || 'https://api.lianyuai.com';
        this.timeout = window.PlatformConfig?.get('api.timeout') || 10000;
    }

    /**
     * 通用请求方法
     */
    async request(options) {
        const {
            url,
            method = 'GET',
            data = null,
            headers = {},
            timeout = this.timeout
        } = options;

        const fullUrl = url.startsWith('http') ? url : this.baseURL + url;
        
        // 添加默认headers
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...headers
        };

        try {
            switch (this.platform) {
                case 'miniprogram':
                    return await this.wxRequest(fullUrl, method, data, defaultHeaders, timeout);
                    
                case 'cordova':
                case 'capacitor':
                case 'web':
                default:
                    return await this.fetchRequest(fullUrl, method, data, defaultHeaders, timeout);
            }
        } catch (error) {
            console.error('Network request error:', error);
            throw this.normalizeError(error);
        }
    }

    /**
     * 微信小程序请求
     */
    async wxRequest(url, method, data, headers, timeout) {
        return new Promise((resolve, reject) => {
            if (typeof wx === 'undefined') {
                reject(new Error('微信小程序环境不可用'));
                return;
            }

            wx.request({
                url,
                method: method.toUpperCase(),
                data,
                header: headers,
                timeout,
                success: (res) => {
                    resolve({
                        data: res.data,
                        status: res.statusCode,
                        statusText: res.statusCode === 200 ? 'OK' : 'Error',
                        headers: res.header
                    });
                },
                fail: (error) => {
                    reject(new Error(error.errMsg || (window.i18n ? window.i18n.t('error.network_request_failed') : '网络请求失败')));
                }
            });
        });
    }

    /**
     * Fetch API请求
     */
    async fetchRequest(url, method, data, headers, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const config = {
                method: method.toUpperCase(),
                headers,
                signal: controller.signal
            };

            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                config.body = typeof data === 'string' ? data : JSON.stringify(data);
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            };
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * 标准化错误信息
     */
    normalizeError(error) {
        if (error.name === 'AbortError') {
            return new Error(window.i18n ? window.i18n.t('error.request_timeout') : '请求超时');
        }
        
        if (error.message.includes('Failed to fetch')) {
            return new Error(window.i18n ? window.i18n.t('error.network') : '网络连接失败');
        }
        
        return error;
    }

    /**
     * GET请求
     */
    async get(url, options = {}) {
        return this.request({
            url,
            method: 'GET',
            ...options
        });
    }

    /**
     * POST请求
     */
    async post(url, data, options = {}) {
        return this.request({
            url,
            method: 'POST',
            data,
            ...options
        });
    }

    /**
     * PUT请求
     */
    async put(url, data, options = {}) {
        return this.request({
            url,
            method: 'PUT',
            data,
            ...options
        });
    }

    /**
     * DELETE请求
     */
    async delete(url, options = {}) {
        return this.request({
            url,
            method: 'DELETE',
            ...options
        });
    }

    /**
     * 文件上传
     */
    async uploadFile(url, filePath, options = {}) {
        const { name = 'file', formData = {}, headers = {} } = options;

        try {
            switch (this.platform) {
                case 'miniprogram':
                    return await this.wxUploadFile(url, filePath, name, formData, headers);
                    
                case 'cordova':
                case 'capacitor':
                case 'web':
                default:
                    return await this.fetchUploadFile(url, filePath, name, formData, headers);
            }
        } catch (error) {
            console.error('File upload error:', error);
            throw this.normalizeError(error);
        }
    }

    /**
     * 微信小程序文件上传
     */
    async wxUploadFile(url, filePath, name, formData, headers) {
        return new Promise((resolve, reject) => {
            if (typeof wx === 'undefined') {
                reject(new Error('微信小程序环境不可用'));
                return;
            }

            wx.uploadFile({
                url: url.startsWith('http') ? url : this.baseURL + url,
                filePath,
                name,
                formData,
                header: headers,
                success: (res) => {
                    resolve({
                        data: res.data,
                        status: res.statusCode,
                        statusText: res.statusCode === 200 ? 'OK' : 'Error'
                    });
                },
                fail: (error) => {
                    reject(new Error(error.errMsg || (window.i18n ? window.i18n.t('error.file_upload_failed') : '文件上传失败')));
                }
            });
        });
    }

    /**
     * Fetch API文件上传
     */
    async fetchUploadFile(url, file, name, formData, headers) {
        const fullUrl = url.startsWith('http') ? url : this.baseURL + url;
        const form = new FormData();
        
        // 添加文件
        form.append(name, file);
        
        // 添加其他表单数据
        Object.keys(formData).forEach(key => {
            form.append(key, formData[key]);
        });

        const response = await fetch(fullUrl, {
            method: 'POST',
            body: form,
            headers: {
                ...headers
                // 不要设置Content-Type，让浏览器自动设置
            }
        });

        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        };
    }
}

// 全局网络实例
window.NetworkAdapter = new NetworkAdapter();

// 导出适配器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkAdapter;
}