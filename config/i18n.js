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
                'nav.scenarios': '发现',
                'nav.history': '通知',
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
                
                // 聊天相关
                'chat.menu.delete_session': '删除会话',
                'chat.menu.quick_reply': '快速回复',
                'chat.menu.chat_assistant': '聊天助手',
                'chat.new_chat_cannot_delete': '新对话不能删除',
                'chat.confirm_delete_session': '确定要删除当前会话吗？删除后无法恢复。',
                'chat.quick_reply.title': '快速回复',
                'chat.quick_reply.opener.title': '开场白',
                'chat.quick_reply.opener.template1': '嗨，看到你喜欢旅行，最近去过什么好玩的地方吗？',
                'chat.quick_reply.opener.template2': '你好，我对你的兴趣很感兴趣，能多聊聊吗？',
                'chat.quick_reply.opener.template3': '今天天气真好，正好适合聊天，你觉得呢？',
                'chat.quick_reply.response.title': '回应消息',
                'chat.quick_reply.response.template1': '你说的这个很有趣，我也有类似的经历...',
                'chat.quick_reply.response.template2': '这个话题真不错，我很想了解更多你的想法',
                'chat.quick_reply.response.template3': '哈哈，你说的太有意思了，让我想到...',
                'chat.quick_reply.date_invite.title': '约会邀请',
                'chat.quick_reply.date_invite.template1': '最近有一家新开的餐厅很不错，周末有空一起去尝尝吗？',
                'chat.quick_reply.date_invite.template2': '我刚买了两张电影票，想邀请你周五一起去看，有兴趣吗？',
                'chat.quick_reply.date_invite.template3': '听说市中心有个新展览，感觉你可能会喜欢，要不要找时间一起去看看？',
                'chat.quick_reply.comfort.title': '安抚情绪',
                'chat.quick_reply.comfort.template1': '我能理解你的感受，这确实不容易，需要我做些什么吗？',
                'chat.quick_reply.comfort.template2': '听你这么说我很心疼，有什么是我能帮到你的吗？',
                'chat.quick_reply.comfort.template3': '这种情况确实令人沮丧，不过我相信你能处理好，我会一直支持你',
                'chat.assistant.title': '聊天助手',
                'chat.assistant.ai_helper.title': '使用AI助手',
                'chat.assistant.ai_helper.description': '输入你想要讨论的话题或者遇到的问题，AI会为你提供有用的回复建议。',
                'chat.assistant.quick_reply.title': '快速回复',
                'chat.assistant.quick_reply.description': '点击右上角菜单中的"快速回复"选项，可以获取常用对话模板。',
                'chat.assistant.multimedia.title': '多媒体支持',
                'chat.assistant.multimedia.description': '点击左下角的"+"按钮可以发送图片、拍照或上传聊天记录。',
                'chat.assistant.sessions.title': '创建多个会话',
                'chat.assistant.sessions.description': '点击会话列表右上角的"+"按钮可以创建新的会话，为不同的对象或场景分类管理。',
                'chat.session.rename': '重命名会话',
                'chat.session.delete': '删除会话',
                'chat.session.sort': '排序会话',
                'chat.session.deleted': '会话已删除',
                'chat.session.sort_coming_soon': '会话排序功能即将上线',
                'chat.session.default_cannot_rename': '默认会话不能重命名',
                'chat.session.default_cannot_delete': '默认会话不能删除',
                
                // 场景模块
                'scenarios.title': '聊天场景',
                'scenarios.dating': '约会聊天',
                'scenarios.daily': '日常聊天',
                'scenarios.comfort': '安慰关怀',
                'scenarios.flirt': '撩妹技巧',
                'scenarios.relationship': '关系维护',
                
                // 设置页面
                'settings.title': '个性化设置',
                'settings.save': '保存',
                'settings.appearance': '外观设置',
                'settings.dark_mode': '深色模式',
                'settings.dark_mode_desc': '保护眼睛，节省电量',
                'settings.theme_color': '主题颜色',
                'settings.theme_color_desc': '选择你喜欢的颜色',
                'settings.notifications': '通知设置',
                'settings.push_notifications': '推送通知',
                'settings.push_notifications_desc': '接收新消息和活动提醒',
                'settings.sound_alerts': '声音提醒',
                'settings.sound_alerts_desc': '新消息声音提示',
                'settings.privacy': '隐私设置',
                'settings.data_collection': '数据收集',
                'settings.data_collection_desc': '允许收集使用数据以改进服务',
                'settings.language': '语言设置',
                'settings.language.chinese': '中文',
                'settings.language.english': 'English',
                
                // 个人页面
                'profile.language_switch': '语言切换',
                'profile.username': '恋语用户',
                'profile.bio': '正在学习恋爱技巧中...',
                'profile.days_used': '使用天数',
                'profile.success_rate': '成功率',
                'profile.courses_learned': '学习课程',
                'profile.edit_profile': '编辑资料',
                'profile.settings': '个性化设置',
                'profile.statistics': '数据统计',
                'profile.vip': '升级会员',
                'profile.help': '帮助中心',
                'profile.about': '关于我们',
                
                // 数据统计页面
                'statistics.title': '数据统计',
                'statistics.days_used': '使用天数',
                'statistics.total_messages': '总消息数',
                'statistics.reply_rate': '回复率',
                'statistics.reply_assistant_usage': '回复助手使用情况',
                'statistics.popular_features': '常用功能排行',
                'statistics.chat_opener': '聊天开场',
                'statistics.reply_suggestion': '回复建议',
                'statistics.emotion_analysis': '情感分析',
                
                // 会员页面
                'vip.title': '升级会员',
                'vip.regular_user': '普通用户',
                'vip.premium_member': '高级会员',
                'vip.monthly_plan': '月度会员',
                'vip.yearly_plan': '年度会员',
                'vip.recommended': '推荐',
                'vip.save_amount': '省￥138',
                'vip.select': '选择',
                'vip.unlimited_replies': '无限回复建议',
                'vip.advanced_emotion_analysis': '高级情感分析',
                'vip.date_planning': '约会策划方案',
                'vip.all_monthly_benefits': '所有月度会员特权',
                'vip.priority_ai_response': '优先AI响应',
                'vip.exclusive_courses': '专属恋爱课程',
                'vip.personal_advisor': '1对1恋爱顾问',
                'vip.member_benefits': '会员特权',
                'vip.unlimited_usage': '无限使用',
                'vip.unlimited_usage_desc': '不限次数使用所有功能',
                'vip.priority_response': '优先响应',
                'vip.priority_response_desc': '更快的AI回复速度',
                'vip.ad_free': '无广告',
                'vip.ad_free_desc': '享受无广告打扰体验',
                'vip.exclusive_courses_title': '专属课程',
                'vip.exclusive_courses_desc': '高级恋爱技巧指导',
                
                // 帮助中心页面
                'help.title': '帮助中心',
                'help.search_placeholder': '搜索问题...',
                'help.faq1_question': '如何使用聊天开场功能？',
                'help.faq1_answer': '点击首页"聊天开场"卡片，输入对方的基本信息（如兴趣爱好、性格特点等），系统将为你生成个性化的开场白。你可以直接使用生成的内容，或根据需要进行修改。',
                'help.faq2_question': '会员费用如何收取？',
                'help.faq2_answer': '会员费用将在您确认订阅后立即从您选择的支付方式中扣除。月度会员每月自动续费，年度会员每年自动续费，除非您在下一个计费周期前取消订阅。',
                'help.faq3_question': '如何保护我的隐私？',
                'help.faq3_answer': '恋语AI高度重视用户隐私。您输入的所有聊天内容和个人信息都经过加密处理，不会被用于训练模型或分享给第三方。您也可以在设置中随时关闭数据收集功能。',
                'help.faq4_question': '如何取消会员订阅？',
                'help.faq4_answer': '您可以在"个人中心"→"会员管理"中找到取消订阅选项。取消后，您仍可以使用会员服务至当前计费周期结束。',
                'help.contact_support': '联系客服',
                'help.contact_description': '如果你的问题没有得到解答，可以通过以下方式联系我们',
                'help.send_email': '发送邮件',
                'help.wechat_support': '微信客服',
                
                // 关于我们页面
                'about.title': '关于我们',
                'about.app_name': '恋语AI',
                'about.version': '版本 1.2.3',
                'about.app_description': '恋语AI是一款专注于解决恋爱沟通难题的智能助手，基于先进的人工智能技术，为用户提供聊天开场、回复建议、情感分析等功能，让恋爱交流不再困难。',
                'about.our_team': '我们的团队',
                'about.team_description': '恋语AI由一群热爱科技、关注情感的年轻人创立，团队成员来自顶尖互联网公司和心理学研究机构，致力于用AI技术解决情感交流问题。',
                'about.our_mission': '我们的使命',
                'about.mission_description': '让每个人都能轻松自信地进行情感交流，建立健康的恋爱关系。',
                'about.follow_us': '关注我们',
                'about.terms_of_service': '服务条款',
                'about.privacy_policy': '隐私政策',
                'about.copyright': '© 2025 恋语AI团队 版权所有',
                
                // 编辑资料页面
                'edit_profile.title': '编辑资料',
                'edit_profile.save': '保存',
                'edit_profile.change_avatar': '更换头像',
                'edit_profile.nickname': '昵称',
                'edit_profile.bio': '个性签名',
                'edit_profile.bio_placeholder': '介绍一下自己...',
                'edit_profile.gender': '性别',
                'edit_profile.gender_male': '男',
                'edit_profile.gender_female': '女',
                'edit_profile.gender_other': '其他',
                'edit_profile.birth_date': '出生日期',
                'edit_profile.location': '所在地区',
                'edit_profile.select_province': '请选择省份',
                'edit_profile.select_city': '请选择城市',
                'edit_profile.relationship_status': '恋爱状态',
                'edit_profile.single': '单身',
                'edit_profile.in_relationship': '恋爱中',
                'edit_profile.complicated': '复杂',
                'edit_profile.interests': '兴趣爱好',
                'edit_profile.interest_movies': '电影',
                'edit_profile.interest_travel': '旅行',
                'edit_profile.interest_food': '美食',
                'edit_profile.add_interest': '添加',
                'edit_profile.contact': '联系方式',
                'edit_profile.contact_placeholder': '微信号/手机号（选填）',
                'edit_profile.contact_note': '仅对恋爱对象可见，可放心填写',
                
                'settings.theme': '主题设置',
                'settings.theme.light': '浅色模式',
                'settings.theme.dark': '深色模式',
                'settings.theme.auto': '跟随系统',
                'settings.ai_model': 'AI模型',
                'settings.notification': '通知设置',
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

                // API相关翻译
                'api.emotion.main_emotion': '主要情感',
                'api.emotion.intensity': '强度(1-10)',
                'api.emotion.detailed_analysis': '详细分析',
                'api.emotion.suggestion1': '建议1',
                'api.emotion.suggestion2': '建议2',
                'api.emotion.neutral': '中性',
                'api.emotion.analysis_unavailable': '情感分析暂时不可用',
                'api.emotion.keep_friendly': '建议保持友好交流',
                'api.chat.default_relationship': '普通朋友',
                'api.chat.default_personality': '内向',
                'api.chat.default_style': '友好',
                'api.chat.gentle_caring': '温柔关怀型',
                'api.chat.humorous_light': '幽默轻松型',
                'api.chat.deep_communication': '深度交流型',
                'api.chat.conversation_analysis': '对话情况分析',
                'api.chat.additional_tips': '额外建议',
                'api.chat.generate_reply_request': '请帮我生成合适的回复建议。',
                'api.chat.ai_reply': 'AI回复',
                'api.chat.ai_generated_suggestion': 'AI生成的回复建议',
                'api.chat.ai_based_analysis': '基于AI分析',
                'api.chat.keep_natural': '保持自然的交流',
                'api.chat.friendly_response': '友好回应',
                'api.chat.greeting_reply': '你好！很高兴收到你的消息',
                'api.chat.greeting_explanation': '友好的回应可以建立良好的对话氛围',
                'api.chat.greeting_analysis': '这是一个友好的打招呼',
                'api.chat.greeting_tips': '保持积极的态度回应',
                'api.chat.open_response': '开放回应',
                'api.chat.question_reply': '这是个有趣的问题，让我想想...',
                'api.chat.question_explanation': '表现出对话题的兴趣',
                'api.chat.question_analysis': '对方询问了一个问题',
                'api.chat.question_tips': '给出真诚的回答',
                'api.chat.general_reply': '通用回复',
                'api.chat.default_reply': '谢谢你分享这个，我很感兴趣听你说更多',
                'api.chat.default_explanation': '表现出倾听和兴趣',
                'api.chat.default_analysis': '一般性的对话内容',
                'api.chat.default_tips': '保持对话的延续性',
                'error.network_request_failed': '网络请求失败',
                'error.request_timeout': '请求超时',
                'error.file_upload_failed': '文件上传失败',
                'platform.exit_confirm': '确定要退出应用吗？',
                'api.sync.success': '数据同步成功',
            },
            
            'en-US': {
                // App basic info
                'app.name': 'LoveChat AI',
                'app.subtitle': 'Smart Dating Assistant',
                'app.description': 'Solve your dating communication challenges',
                
                // Navigation and page titles
                'nav.home': 'Home',
                'nav.chat': 'Chat',
                'nav.scenarios': 'Discover',
                'nav.history': 'Notifications',
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
                
                // Chat related
                'chat.menu.delete_session': 'Delete Session',
                'chat.menu.quick_reply': 'Quick Reply',
                'chat.menu.chat_assistant': 'Chat Assistant',
                'chat.new_chat_cannot_delete': 'New chat cannot be deleted',
                'chat.confirm_delete_session': 'Are you sure you want to delete the current session? This action cannot be undone.',
                'chat.quick_reply.title': 'Quick Reply',
                'chat.quick_reply.opener.title': 'Conversation Starters',
                'chat.quick_reply.opener.template1': 'Hi, I saw you like traveling. Have you been to any interesting places recently?',
                'chat.quick_reply.opener.template2': 'Hello, I\'m interested in your interests. Can we chat more about them?',
                'chat.quick_reply.opener.template3': 'What a beautiful day today, perfect for chatting. Don\'t you think?',
                'chat.quick_reply.response.title': 'Message Responses',
                'chat.quick_reply.response.template1': 'What you said is really interesting, I have similar experiences...',
                'chat.quick_reply.response.template2': 'This is a great topic, I\'d love to know more about your thoughts',
                'chat.quick_reply.response.template3': 'Haha, what you said is so funny, it reminds me of...',
                'chat.quick_reply.date_invite.title': 'Date Invitations',
                'chat.quick_reply.date_invite.template1': 'There\'s a new restaurant that\'s really good. Would you like to try it together this weekend?',
                'chat.quick_reply.date_invite.template2': 'I just bought two movie tickets. Would you like to go see it with me on Friday?',
                'chat.quick_reply.date_invite.template3': 'I heard there\'s a new exhibition downtown that you might like. Want to check it out together?',
                'chat.quick_reply.comfort.title': 'Comfort & Support',
                'chat.quick_reply.comfort.template1': 'I understand how you feel, this is really not easy. Is there anything I can do for you?',
                'chat.quick_reply.comfort.template2': 'It breaks my heart to hear you say that. Is there anything I can help you with?',
                'chat.quick_reply.comfort.template3': 'This situation is indeed frustrating, but I believe you can handle it well. I\'ll always support you',
                'chat.assistant.title': 'Chat Assistant',
                'chat.assistant.ai_helper.title': 'Use AI Assistant',
                'chat.assistant.ai_helper.description': 'Enter the topic you want to discuss or the problem you encounter, and AI will provide useful reply suggestions.',
                'chat.assistant.quick_reply.title': 'Quick Reply',
                'chat.assistant.quick_reply.description': 'Click the "Quick Reply" option in the top right menu to get common conversation templates.',
                'chat.assistant.multimedia.title': 'Multimedia Support',
                'chat.assistant.multimedia.description': 'Click the "+" button in the bottom left to send images, take photos, or upload chat records.',
                'chat.assistant.sessions.title': 'Create Multiple Sessions',
                'chat.assistant.sessions.description': 'Click the "+" button in the top right of the session list to create new sessions for different contacts or scenarios.',
                'chat.session.rename': 'Rename Session',
                'chat.session.delete': 'Delete Session',
                'chat.session.sort': 'Sort Sessions',
                'chat.session.deleted': 'Session deleted',
                'chat.session.sort_coming_soon': 'Session sorting feature coming soon',
                'chat.session.default_cannot_rename': 'Default session cannot be renamed',
                'chat.session.default_cannot_delete': 'Default session cannot be deleted',
                
                // Scenarios module
                'scenarios.title': 'Chat Scenarios',
                'scenarios.dating': 'Dating Chat',
                'scenarios.daily': 'Daily Chat',
                'scenarios.comfort': 'Comfort & Care',
                'scenarios.flirt': 'Flirting Tips',
                'scenarios.relationship': 'Relationship Maintenance',
                
                // Settings page
                'settings.title': 'Settings',
                'settings.save': 'Save',
                'settings.appearance': 'Appearance',
                'settings.dark_mode': 'Dark Mode',
                'settings.dark_mode_desc': 'Protect your eyes and save battery',
                'settings.theme_color': 'Theme Color',
                'settings.theme_color_desc': 'Choose your favorite color',
                'settings.notifications': 'Notifications',
                'settings.push_notifications': 'Push Notifications',
                'settings.push_notifications_desc': 'Receive new messages and activity reminders',
                'settings.sound_alerts': 'Sound Alerts',
                'settings.sound_alerts_desc': 'Sound notifications for new messages',
                'settings.privacy': 'Privacy',
                'settings.data_collection': 'Data Collection',
                'settings.data_collection_desc': 'Allow data collection to improve services',
                'settings.language': 'Language Settings',
                'settings.language.chinese': '中文',
                'settings.language.english': 'English',
                
                // Profile page
                'profile.language_switch': 'Language Switch',
                'profile.username': 'LianYu User',
                'profile.bio': 'Learning love skills...',
                'profile.days_used': 'Days Used',
                'profile.success_rate': 'Success Rate',
                'profile.courses_learned': 'Courses Learned',
                'profile.edit_profile': 'Edit Profile',
                'profile.settings': 'Settings',
                'profile.statistics': 'Statistics',
                'profile.vip': 'Upgrade VIP',
                'profile.help': 'Help Center',
                'profile.about': 'About Us',
                
                // 数据统计页面
                'statistics.title': 'Statistics',
                'statistics.days_used': 'Days Used',
                'statistics.total_messages': 'Total Messages',
                'statistics.reply_rate': 'Reply Rate',
                'statistics.reply_assistant_usage': 'Reply Assistant Usage',
                'statistics.popular_features': 'Popular Features',
                'statistics.chat_opener': 'Chat Opener',
                'statistics.reply_suggestion': 'Reply Suggestion',
                'statistics.emotion_analysis': 'Emotion Analysis',
                
                // 会员页面
                'vip.title': 'Upgrade to Premium',
                'vip.regular_user': 'Regular User',
                'vip.premium_member': 'Premium Member',
                'vip.monthly_plan': 'Monthly Plan',
                'vip.yearly_plan': 'Yearly Plan',
                'vip.recommended': 'Recommended',
                'vip.save_amount': 'Save ¥138',
                'vip.select': 'Select',
                'vip.unlimited_replies': 'Unlimited Reply Suggestions',
                'vip.advanced_emotion_analysis': 'Advanced Emotion Analysis',
                'vip.date_planning': 'Date Planning Solutions',
                'vip.all_monthly_benefits': 'All Monthly Member Benefits',
                'vip.priority_ai_response': 'Priority AI Response',
                'vip.exclusive_courses': 'Exclusive Love Courses',
                'vip.personal_advisor': '1-on-1 Love Advisor',
                'vip.member_benefits': 'Member Benefits',
                'vip.unlimited_usage': 'Unlimited Usage',
                'vip.unlimited_usage_desc': 'Use all features without limits',
                'vip.priority_response': 'Priority Response',
                'vip.priority_response_desc': 'Faster AI reply speed',
                'vip.ad_free': 'Ad-Free',
                'vip.ad_free_desc': 'Enjoy ad-free experience',
                'vip.exclusive_courses_title': 'Exclusive Courses',
                'vip.exclusive_courses_desc': 'Advanced love skills guidance',
                
                // 帮助中心页面
                'help.title': 'Help Center',
                'help.search_placeholder': 'Search questions...',
                'help.faq1_question': 'How to use chat opener feature?',
                'help.faq1_answer': 'Click the "Chat Opener" card on the homepage, enter basic information about the other person (such as interests, personality traits, etc.), and the system will generate personalized opening lines for you. You can use the generated content directly or modify it as needed.',
                'help.faq2_question': 'How are membership fees charged?',
                'help.faq2_answer': 'Membership fees will be deducted immediately from your chosen payment method after you confirm your subscription. Monthly memberships auto-renew monthly, and yearly memberships auto-renew yearly, unless you cancel before the next billing cycle.',
                'help.faq3_question': 'How is my privacy protected?',
                'help.faq3_answer': 'LianYu AI highly values user privacy. All chat content and personal information you input are encrypted and will not be used for model training or shared with third parties. You can also turn off data collection in settings at any time.',
                'help.faq4_question': 'How to cancel membership subscription?',
                'help.faq4_answer': 'You can find the cancel subscription option in "Personal Center" → "Membership Management". After cancellation, you can still use member services until the end of the current billing cycle.',
                'help.contact_support': 'Contact Support',
                'help.contact_description': 'If your question is not answered, you can contact us through the following methods',
                'help.send_email': 'Send Email',
                'help.wechat_support': 'WeChat Support',
                
                // 关于我们页面
                'about.title': 'About Us',
                'about.app_name': 'LianYu AI',
                'about.version': 'Version 1.2.3',
                'about.app_description': 'LianYu AI is an intelligent assistant focused on solving love communication problems. Based on advanced artificial intelligence technology, it provides users with chat openers, reply suggestions, emotion analysis and other functions to make love communication no longer difficult.',
                'about.our_team': 'Our Team',
                'about.team_description': 'LianYu AI was founded by a group of young people who love technology and care about emotions. Team members come from top Internet companies and psychology research institutions, committed to solving emotional communication problems with AI technology.',
                'about.our_mission': 'Our Mission',
                'about.mission_description': 'To enable everyone to communicate emotionally with ease and confidence, and build healthy romantic relationships.',
                'about.follow_us': 'Follow Us',
                'about.terms_of_service': 'Terms of Service',
                'about.privacy_policy': 'Privacy Policy',
                'about.copyright': '© 2025 LianYu AI Team. All rights reserved.',
                
                // Edit Profile page
                'edit_profile.title': 'Edit Profile',
                'edit_profile.save': 'Save',
                'edit_profile.change_avatar': 'Change Avatar',
                'edit_profile.nickname': 'Nickname',
                'edit_profile.bio': 'Bio',
                'edit_profile.bio_placeholder': 'Tell us about yourself...',
                'edit_profile.gender': 'Gender',
                'edit_profile.gender_male': 'Male',
                'edit_profile.gender_female': 'Female',
                'edit_profile.gender_other': 'Other',
                'edit_profile.birth_date': 'Birth Date',
                'edit_profile.location': 'Location',
                'edit_profile.select_province': 'Select Province',
                'edit_profile.select_city': 'Select City',
                'edit_profile.relationship_status': 'Relationship Status',
                'edit_profile.single': 'Single',
                'edit_profile.in_relationship': 'In Relationship',
                'edit_profile.complicated': 'Complicated',
                'edit_profile.interests': 'Interests',
                'edit_profile.interest_movies': 'Movies',
                'edit_profile.interest_travel': 'Travel',
                'edit_profile.interest_food': 'Food',
                'edit_profile.add_interest': 'Add',
                'edit_profile.contact': 'Contact',
                'edit_profile.contact_placeholder': 'WeChat/Phone (Optional)',
                'edit_profile.contact_note': 'Only visible to romantic partners',
                
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

                // API translations
                'api.emotion.main_emotion': 'Main Emotion',
                'api.emotion.intensity': 'Intensity (1-10)',
                'api.emotion.detailed_analysis': 'Detailed Analysis',
                'api.emotion.suggestion1': 'Suggestion 1',
                'api.emotion.suggestion2': 'Suggestion 2',
                'api.emotion.neutral': 'Neutral',
                'api.emotion.analysis_unavailable': 'Emotion analysis temporarily unavailable',
                'api.emotion.keep_friendly': 'Suggest maintaining friendly communication',
                'api.chat.default_relationship': 'Regular Friend',
                'api.chat.default_personality': 'Introverted',
                'api.chat.default_style': 'Friendly',
                'api.chat.gentle_caring': 'Gentle Caring Type',
                'api.chat.humorous_light': 'Humorous Light Type',
                'api.chat.deep_communication': 'Deep Communication Type',
                'api.chat.conversation_analysis': 'Conversation Analysis',
                'api.chat.additional_tips': 'Additional Tips',
                'api.chat.generate_reply_request': 'Please help me generate appropriate reply suggestions.',
                'api.chat.ai_reply': 'AI Reply',
                'api.chat.ai_generated_suggestion': 'AI-generated reply suggestion',
                'api.chat.ai_based_analysis': 'Based on AI analysis',
                'api.chat.keep_natural': 'Keep natural communication',
                'api.chat.friendly_response': 'Friendly Response',
                'api.chat.greeting_reply': 'Hello! Nice to receive your message',
                'api.chat.greeting_explanation': 'Friendly responses can establish a good conversation atmosphere',
                'api.chat.greeting_analysis': 'This is a friendly greeting',
                'api.chat.greeting_tips': 'Maintain a positive attitude in response',
                'api.chat.open_response': 'Open Response',
                'api.chat.question_reply': 'This is an interesting question, let me think...',
                'api.chat.question_explanation': 'Show interest in the topic',
                'api.chat.question_analysis': 'The other party asked a question',
                'api.chat.question_tips': 'Give a sincere answer',
                'api.chat.general_reply': 'General Reply',
                'api.chat.default_reply': "Thank you for sharing this, I'm interested to hear more from you",
                'api.chat.default_explanation': 'Show listening and interest',
                'api.chat.default_analysis': 'General conversation content',
                'api.chat.default_tips': 'Maintain conversation continuity',
                'error.network_request_failed': 'Network request failed',
                'error.request_timeout': 'Request timeout',
                'error.file_upload_failed': 'File upload failed',
                'platform.exit_confirm': 'Are you sure you want to exit the app?',
                'api.sync.success': 'Data synchronization successful',
            }
        };
    }

    /**
     * 获取翻译文本
     */
    t(key, params = {}) {
        const translation =
            this.translations[this.currentLanguage]?.[key] ||
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
            console.log('设置语言为:', language);
            this.currentLanguage = language;
            this.setStoredLanguage(language);
            this.updateDocumentLanguage();
            this.notifyObservers();
            // 立即更新页面文本
            this.updatePageTexts();
        } else {
            console.warn(`Language ${language} not supported`);
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
        console.log('开始更新页面文本，当前语言:', this.currentLanguage);
        // 更新所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('找到', elements.length, '个需要翻译的元素');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            console.log('翻译元素:', key, '->', translation);
            
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