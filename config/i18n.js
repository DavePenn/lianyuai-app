/**
 * 国际化配置文件
 * 支持中英文切换的多语言系统
 */

class I18nManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.detectBrowserLanguage();
        this.translations = this.loadTranslations();
        this.observers = [];
    }

    /**
     * 检测浏览器语言和地理位置
     */
    detectBrowserLanguage() {
        // 首先尝试地理位置检测
        const geoLanguage = this.detectLanguageByGeo();
        if (geoLanguage) {
            return geoLanguage;
        }
        
        const browserLang = navigator.language || navigator.userLanguage;
        // 支持的语言列表
        const supportedLanguages = ['zh-CN', 'en-US'];
        
        // 精确匹配
        if (supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
        
        // 模糊匹配（只匹配语言代码）
        const langCode = browserLang.split('-')[0];
        if (langCode === 'zh') return 'zh-CN';
        if (langCode === 'en') return 'en-US';
        
        // 默认返回英文（国际化优先）
        return 'en-US';
    }

    /**
     * 通过地理位置检测语言
     */
    detectLanguageByGeo() {
        try {
            // 检测时区
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            // 中国大陆时区
            const chineseTimezones = [
                'Asia/Shanghai',
                'Asia/Beijing',
                'Asia/Chongqing',
                'Asia/Harbin',
                'Asia/Kashgar',
                'Asia/Urumqi'
            ];
            
            if (chineseTimezones.includes(timezone)) {
                return 'zh-CN';
            }
            
            // 检测语言环境
            const locale = navigator.language || navigator.userLanguage;
            if (locale && locale.startsWith('zh')) {
                return 'zh-CN';
            }
            
            // 其他情况默认英文
            return 'en-US';
        } catch (error) {
            console.warn('Geo detection failed:', error);
            return null;
        }
    }

    /**
     * 获取存储的语言设置
     */
    getStoredLanguage() {
        try {
            if (window.StorageAdapter) {
                return window.StorageAdapter.getItem('language');
            }
            return localStorage.getItem('lianyuai_language');
        } catch (error) {
            console.warn('Failed to get stored language:', error);
            return null;
        }
    }

    /**
     * 存储语言设置
     */
    setStoredLanguage(language) {
        try {
            if (window.StorageAdapter) {
                window.StorageAdapter.setItem('language', language);
            } else {
                localStorage.setItem('lianyuai_language', language);
            }
        } catch (error) {
            console.warn('Failed to store language:', error);
        }
    }

    /**
     * 加载翻译资源
     */
    loadTranslations() {
        return {
            'zh-CN': {
                // 应用基础信息
                'app.name': '恋语AI',
                'app.subtitle': '智能恋爱助手',
                'app.description': '帮你解决恋爱沟通难题',
                
                // 导航和页面标题
                'nav.home': '首页',
                'nav.chat': '聊天',
                'nav.scenarios': '场景',
                'nav.history': '历史',
                'nav.settings': '设置',
                'nav.profile': '个人',
                
                // 首页轮播内容
                'hero.chat_opener.badge': '聊天开场',
                'hero.chat_opener.title': '不知道如何开启对话？',
                'hero.chat_opener.description': 'AI定制个性化开场白\n让第一句话就抓住TA的心',
                'hero.chat_opener.success_rate': '成功率',
                'hero.chat_opener.templates': '模板',
                'hero.chat_opener.cta': '立即尝试',
                
                'hero.reply_suggestion.badge': '回复建议',
                'hero.reply_suggestion.title': '对方消息不知道怎么回？',
                'hero.reply_suggestion.description': 'AI分析对话情境\n生成3种风格回复选择',
                'hero.reply_suggestion.reply_rate': '回复率',
                'hero.reply_suggestion.generation_time': '生成',
                'hero.reply_suggestion.cta': '获取建议',
                
                'hero.emotion_analysis.badge': '情感分析',
                'hero.emotion_analysis.title': '对方心情不好怎么安慰？',
                'hero.emotion_analysis.description': 'AI识别情感状态\n推荐最贴心的安慰方式',
                'hero.emotion_analysis.satisfaction': '满意度',
                'hero.emotion_analysis.availability': '24小时',
                'hero.emotion_analysis.online': '在线',
                'hero.emotion_analysis.cta': '开始分析',
                
                'hero.date_planning.badge': '约会策划',
                'hero.date_planning.title': '想要策划完美约会？',
                'hero.date_planning.description': 'AI推荐个性化约会方案\n打造难忘浪漫时光',
                'hero.date_planning.success_rate': '成功率',
                'hero.date_planning.plans': '方案',
                'hero.date_planning.cta': '立即策划',
                
                'hero.conflict_resolution.badge': '矛盾化解',
                'hero.conflict_resolution.title': '吵架了不知道怎么和好？',
                'hero.conflict_resolution.description': 'AI分析矛盾原因\n提供逐步和解策略',
                'hero.conflict_resolution.resolution_rate': '和解率',
                'hero.conflict_resolution.response_time': '响应',
                'hero.conflict_resolution.cta': '立即化解',
                
                'hero.long_distance.badge': '异地恋',
                'hero.long_distance.title': '异地恋感情变淡了？',
                'hero.long_distance.description': 'AI建议创意互动方式\n让爱情跨越距离保持新鲜',
                'hero.long_distance.satisfaction': '满意度',
                'hero.long_distance.couples': '情侣',
                'hero.long_distance.cta': '获取建议',
                
                // 底部导航
                'bottom_nav.home': '首页',
                'bottom_nav.chat': '聊天',
                'bottom_nav.discover': '发现',
                'bottom_nav.message': '消息',
                'bottom_nav.profile': '我的',
                
                // 页脚
                'footer.terms': '服务条款',
                'footer.privacy': '隐私政策',
                'footer.copyright': '© 2024 恋语AI. 保留所有权利.',
                
                // 聊天界面
                'chat.input.placeholder': '输入你想说的话...',
                'chat.send': '发送',
                'chat.typing': '正在输入...',
                'chat.ai_thinking': 'AI正在思考...',
                'chat.new_conversation': '新对话',
                'chat.clear_history': '清空历史',
                
                // 场景模块
                'scenarios.title': '聊天场景',
                'scenarios.dating': '约会聊天',
                'scenarios.daily': '日常聊天',
                'scenarios.comfort': '安慰关怀',
                'scenarios.flirt': '撩妹技巧',
                'scenarios.relationship': '关系维护',
                
                // 设置页面
                'settings.title': '设置',
                'settings.language': '语言设置',
                'settings.language.chinese': '中文',
                'settings.language.english': 'English',
                'settings.theme': '主题设置',
                'settings.theme.light': '浅色模式',
                'settings.theme.dark': '深色模式',
                'settings.theme.auto': '跟随系统',
                'settings.ai_model': 'AI模型',
                'settings.notification': '通知设置',
                'settings.privacy': '隐私设置',
                'settings.about': '关于我们',
                
                // 通用按钮和操作
                'common.confirm': '确认',
                'common.cancel': '取消',
                'common.save': '保存',
                'common.delete': '删除',
                'common.edit': '编辑',
                'common.copy': '复制',
                'common.share': '分享',
                'common.retry': '重试',
                'common.loading': '加载中...',
                'common.error': '出错了',
                'common.success': '成功',
                
                // 错误信息
                'error.network': '网络连接失败，请检查网络设置',
                'error.ai_service': 'AI服务暂时不可用，请稍后重试',
                'error.invalid_input': '输入内容无效，请重新输入',
                'error.rate_limit': '请求过于频繁，请稍后再试',
            },
            
            'en-US': {
                // App basic info
                'app.name': 'LoveChat AI',
                'app.subtitle': 'Smart Dating Assistant',
                'app.description': 'Solve your dating communication challenges',
                
                // Navigation and page titles
                'nav.home': 'Home',
                'nav.chat': 'Chat',
                'nav.scenarios': 'Scenarios',
                'nav.history': 'History',
                'nav.settings': 'Settings',
                'nav.profile': 'Profile',
                
                // Hero carousel content
                'hero.chat_opener.badge': 'Chat Opener',
                'hero.chat_opener.title': 'Don\'t know how to start a conversation?',
                'hero.chat_opener.description': 'AI-customized personalized openers\nMake your first words capture their heart',
                'hero.chat_opener.success_rate': 'Success Rate',
                'hero.chat_opener.templates': 'Templates',
                'hero.chat_opener.cta': 'Try Now',
                
                'hero.reply_suggestion.badge': 'Reply Suggestions',
                'hero.reply_suggestion.title': 'Don\'t know how to reply to their message?',
                'hero.reply_suggestion.description': 'AI analyzes conversation context\nGenerates 3 style reply options',
                'hero.reply_suggestion.reply_rate': 'Reply Rate',
                'hero.reply_suggestion.generation_time': 'Generation',
                'hero.reply_suggestion.cta': 'Get Suggestions',
                
                'hero.emotion_analysis.badge': 'Emotion Analysis',
                'hero.emotion_analysis.title': 'How to comfort when they\'re feeling down?',
                'hero.emotion_analysis.description': 'AI identifies emotional states\nRecommends the most caring comfort approaches',
                'hero.emotion_analysis.satisfaction': 'Satisfaction',
                'hero.emotion_analysis.availability': '24 Hours',
                'hero.emotion_analysis.online': 'Online',
                'hero.emotion_analysis.cta': 'Start Analysis',
                
                'hero.date_planning.badge': 'Date Planning',
                'hero.date_planning.title': 'Planning the perfect date?',
                'hero.date_planning.description': 'AI recommends personalized date plans\nCreate unforgettable romantic moments',
                'hero.date_planning.success_rate': 'Success Rate',
                'hero.date_planning.plans': 'Plans',
                'hero.date_planning.cta': 'Plan Now',
                
                'hero.conflict_resolution.badge': 'Conflict Resolution',
                'hero.conflict_resolution.title': 'Had an argument and don\'t know how to make up?',
                'hero.conflict_resolution.description': 'AI analyzes conflict causes\nProvides step-by-step reconciliation strategies',
                'hero.conflict_resolution.resolution_rate': 'Resolution Rate',
                'hero.conflict_resolution.response_time': 'Response',
                'hero.conflict_resolution.cta': 'Resolve Now',
                
                'hero.long_distance.badge': 'Long Distance',
                'hero.long_distance.title': 'Long-distance relationship feeling distant?',
                'hero.long_distance.description': 'AI suggests creative interaction ideas\nKeep love fresh across the distance',
                'hero.long_distance.satisfaction': 'Satisfaction',
                'hero.long_distance.couples': 'Couples',
                'hero.long_distance.cta': 'Get Ideas',
                
                // Bottom navigation
                'bottom_nav.home': 'Home',
                'bottom_nav.chat': 'Chat',
                'bottom_nav.discover': 'Discover',
                'bottom_nav.message': 'Messages',
                'bottom_nav.profile': 'Profile',
                
                // Footer
                'footer.terms': 'Terms of Service',
                'footer.privacy': 'Privacy Policy',
                'footer.copyright': '© 2024 LoveChat AI. All rights reserved.',
                
                // Chat interface
                'chat.input.placeholder': 'Type what you want to say...',
                'chat.send': 'Send',
                'chat.typing': 'Typing...',
                'chat.ai_thinking': 'AI is thinking...',
                'chat.new_conversation': 'New Chat',
                'chat.clear_history': 'Clear History',
                
                // Scenarios module
                'scenarios.title': 'Chat Scenarios',
                'scenarios.dating': 'Dating Chat',
                'scenarios.daily': 'Daily Chat',
                'scenarios.comfort': 'Comfort & Care',
                'scenarios.flirt': 'Flirting Tips',
                'scenarios.relationship': 'Relationship Maintenance',
                
                // Settings page
                'settings.title': 'Settings',
                'settings.language': 'Language',
                'settings.language.chinese': '中文',
                'settings.language.english': 'English',
                'settings.theme': 'Theme',
                'settings.theme.light': 'Light Mode',
                'settings.theme.dark': 'Dark Mode',
                'settings.theme.auto': 'Follow System',
                'settings.ai_model': 'AI Model',
                'settings.notification': 'Notifications',
                'settings.privacy': 'Privacy',
                'settings.about': 'About Us',
                
                // Common buttons and actions
                'common.confirm': 'Confirm',
                'common.cancel': 'Cancel',
                'common.save': 'Save',
                'common.delete': 'Delete',
                'common.edit': 'Edit',
                'common.copy': 'Copy',
                'common.share': 'Share',
                'common.retry': 'Retry',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                
                // Error messages
                'error.network': 'Network connection failed, please check your network settings',
                'error.ai_service': 'AI service is temporarily unavailable, please try again later',
                'error.invalid_input': 'Invalid input, please try again',
                'error.rate_limit': 'Too many requests, please try again later',
            }
        };
    }

    /**
     * 获取翻译文本
     */
    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['zh-CN']?.[key] || 
                          key;
        
        // 支持参数替换
        return this.interpolate(translation, params);
    }

    /**
     * 参数插值
     */
    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * 切换语言
     */
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            this.setStoredLanguage(language);
            this.notifyObservers();
            this.updateDocumentLanguage();
        }
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 获取支持的语言列表
     */
    getSupportedLanguages() {
        return [
            { code: 'zh-CN', name: '中文', nativeName: '中文' },
            { code: 'en-US', name: 'English', nativeName: 'English' }
        ];
    }

    /**
     * 更新文档语言属性
     */
    updateDocumentLanguage() {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = this.currentLanguage;
        }
    }

    /**
     * 添加语言变化观察者
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * 移除观察者
     */
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }

    /**
     * 通知所有观察者
     */
    notifyObservers() {
        this.observers.forEach(callback => {
            try {
                callback(this.currentLanguage);
            } catch (error) {
                console.error('Error in i18n observer:', error);
            }
        });
    }

    /**
     * 更新页面所有文本
     */
    updatePageTexts() {
        // 更新所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // 根据元素类型更新文本
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });

        // 更新页面标题
        const titleKey = document.querySelector('meta[name="title-key"]')?.content;
        if (titleKey) {
            document.title = this.t(titleKey);
        }

        // 更新meta描述
        const descKey = document.querySelector('meta[name="desc-key"]')?.content;
        if (descKey) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.content = this.t(descKey);
            }
        }
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.I18nManager = new I18nManager();
    
    // 页面加载完成后更新文本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.I18nManager.updatePageTexts();
        });
    } else {
        window.I18nManager.updatePageTexts();
    }
}

// 导出类（用于模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}