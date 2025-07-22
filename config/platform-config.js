/**
 * 跨平台配置管理
 * 支持Web、小程序、iOS、Android等多平台
 */

class PlatformConfig {
    constructor() {
        this.platform = this.detectPlatform();
        this.config = this.loadPlatformConfig();
    }

    /**
     * 检测当前运行平台
     */
    detectPlatform() {
        // 小程序环境检测
        if (typeof wx !== 'undefined' && wx.getSystemInfo) {
            return 'miniprogram';
        }
        
        // App环境检测 (Cordova/Capacitor)
        if (typeof window !== 'undefined') {
            if (window.cordova) {
                return 'cordova';
            }
            if (window.Capacitor) {
                return 'capacitor';
            }
        }
        
        // 浏览器环境
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            return 'web';
        }
        
        return 'unknown';
    }

    /**
     * 加载平台特定配置
     */
    loadPlatformConfig() {
        const baseConfig = {
            appName: '恋语AI',
            version: '1.0.0',
            debug: false
        };

        const platformConfigs = {
            web: {
                ...baseConfig,
                api: {
                    baseURL: 'http://152.32.218.174:3001',
                    timeout: 10000
                },
                storage: {
                    type: 'localStorage',
                    prefix: 'lianyuai_'
                },
                features: {
                    pwa: true,
                    serviceWorker: true,
                    notification: true,
                    fileUpload: true
                }
            },
            miniprogram: {
                ...baseConfig,
                api: {
                    baseURL: 'http://152.32.218.174:3001',
                    timeout: 10000
                },
                storage: {
                    type: 'wxStorage',
                    prefix: 'lianyuai_'
                },
                features: {
                    pwa: false,
                    serviceWorker: false,
                    notification: false,
                    fileUpload: true
                }
            },
            cordova: {
                ...baseConfig,
                api: {
                    baseURL: 'http://152.32.218.174:3001',
                    timeout: 15000
                },
                storage: {
                    type: 'localStorage',
                    prefix: 'lianyuai_'
                },
                features: {
                    pwa: false,
                    serviceWorker: false,
                    notification: true,
                    fileUpload: true
                }
            },
            capacitor: {
                ...baseConfig,
                api: {
                    baseURL: 'http://152.32.218.174:3001',
                    timeout: 15000
                },
                storage: {
                    type: 'capacitorStorage',
                    prefix: 'lianyuai_'
                },
                features: {
                    pwa: false,
                    serviceWorker: false,
                    notification: true,
                    fileUpload: true
                }
            }
        };

        return platformConfigs[this.platform] || platformConfigs.web;
    }

    /**
     * 获取配置项
     */
    get(key) {
        return key.split('.').reduce((obj, k) => obj && obj[k], this.config);
    }

    /**
     * 获取当前平台
     */
    getPlatform() {
        return this.platform;
    }

    /**
     * 是否支持某个功能
     */
    hasFeature(feature) {
        return this.get(`features.${feature}`) === true;
    }
}

// 全局配置实例
window.PlatformConfig = new PlatformConfig();

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlatformConfig;
}