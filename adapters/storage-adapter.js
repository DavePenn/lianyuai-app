/**
 * 跨平台存储适配器
 * 统一不同平台的存储接口
 */

class StorageAdapter {
    constructor() {
        this.platform = window.PlatformConfig?.getPlatform() || 'web';
        this.prefix = window.PlatformConfig?.get('storage.prefix') || 'lianyuai_';
        this.storageType = window.PlatformConfig?.get('storage.type') || 'localStorage';
    }

    /**
     * 存储数据
     */
    async setItem(key, value) {
        const fullKey = this.prefix + key;
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        try {
            switch (this.storageType) {
                case 'localStorage':
                    localStorage.setItem(fullKey, stringValue);
                    break;
                    
                case 'wxStorage':
                    if (typeof wx !== 'undefined') {
                        wx.setStorageSync(fullKey, stringValue);
                    }
                    break;
                    
                case 'capacitorStorage':
                    if (window.Capacitor && window.Capacitor.Plugins.Storage) {
                        await window.Capacitor.Plugins.Storage.set({
                            key: fullKey,
                            value: stringValue
                        });
                    }
                    break;
                    
                default:
                    localStorage.setItem(fullKey, stringValue);
            }
            return true;
        } catch (error) {
            console.error('Storage setItem error:', error);
            return false;
        }
    }

    /**
     * 获取数据
     */
    async getItem(key) {
        const fullKey = this.prefix + key;

        try {
            let value = null;
            
            switch (this.storageType) {
                case 'localStorage':
                    value = localStorage.getItem(fullKey);
                    break;
                    
                case 'wxStorage':
                    if (typeof wx !== 'undefined') {
                        value = wx.getStorageSync(fullKey);
                    }
                    break;
                    
                case 'capacitorStorage':
                    if (window.Capacitor && window.Capacitor.Plugins.Storage) {
                        const result = await window.Capacitor.Plugins.Storage.get({ key: fullKey });
                        value = result.value;
                    }
                    break;
                    
                default:
                    value = localStorage.getItem(fullKey);
            }

            // 尝试解析JSON
            if (value && typeof value === 'string') {
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            }
            
            return value;
        } catch (error) {
            console.error('Storage getItem error:', error);
            return null;
        }
    }

    /**
     * 删除数据
     */
    async removeItem(key) {
        const fullKey = this.prefix + key;

        try {
            switch (this.storageType) {
                case 'localStorage':
                    localStorage.removeItem(fullKey);
                    break;
                    
                case 'wxStorage':
                    if (typeof wx !== 'undefined') {
                        wx.removeStorageSync(fullKey);
                    }
                    break;
                    
                case 'capacitorStorage':
                    if (window.Capacitor && window.Capacitor.Plugins.Storage) {
                        await window.Capacitor.Plugins.Storage.remove({ key: fullKey });
                    }
                    break;
                    
                default:
                    localStorage.removeItem(fullKey);
            }
            return true;
        } catch (error) {
            console.error('Storage removeItem error:', error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    async clear() {
        try {
            switch (this.storageType) {
                case 'localStorage':
                    // 只清除带前缀的数据
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith(this.prefix)) {
                            localStorage.removeItem(key);
                        }
                    });
                    break;
                    
                case 'wxStorage':
                    if (typeof wx !== 'undefined') {
                        const info = wx.getStorageInfoSync();
                        info.keys.forEach(key => {
                            if (key.startsWith(this.prefix)) {
                                wx.removeStorageSync(key);
                            }
                        });
                    }
                    break;
                    
                case 'capacitorStorage':
                    if (window.Capacitor && window.Capacitor.Plugins.Storage) {
                        const keys = await window.Capacitor.Plugins.Storage.keys();
                        for (const key of keys.keys) {
                            if (key.startsWith(this.prefix)) {
                                await window.Capacitor.Plugins.Storage.remove({ key });
                            }
                        }
                    }
                    break;
                    
                default:
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith(this.prefix)) {
                            localStorage.removeItem(key);
                        }
                    });
            }
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    /**
     * 获取所有键
     */
    async keys() {
        try {
            let keys = [];
            
            switch (this.storageType) {
                case 'localStorage':
                    keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
                    break;
                    
                case 'wxStorage':
                    if (typeof wx !== 'undefined') {
                        const info = wx.getStorageInfoSync();
                        keys = info.keys.filter(key => key.startsWith(this.prefix));
                    }
                    break;
                    
                case 'capacitorStorage':
                    if (window.Capacitor && window.Capacitor.Plugins.Storage) {
                        const result = await window.Capacitor.Plugins.Storage.keys();
                        keys = result.keys.filter(key => key.startsWith(this.prefix));
                    }
                    break;
                    
                default:
                    keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
            }
            
            // 移除前缀
            return keys.map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('Storage keys error:', error);
            return [];
        }
    }
}

// 全局存储实例
window.StorageAdapter = new StorageAdapter();

// 导出适配器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageAdapter;
}