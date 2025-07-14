/**
 * 国际化配置文件
 * 支持中英文切换的多语言系统
 */

class I18nManager {
    constructor() {
        // 优先使用存储的语言设置，如果没有才检测浏览器语言
        const storedLanguage = this.getStoredLanguage();
        this.currentLanguage = storedLanguage || this.detectBrowserLanguage();
        console.log('I18nManager初始化 - 存储的语言:', storedLanguage, '最终语言:', this.currentLanguage);
        this.translations = this.loadTranslations();
        this.observers = [];
        
        // 初始化时立即更新文档语言属性
        this.updateDocumentLanguage();
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
        
        // 默认返回中文（中文用户优先）
        return 'zh-CN';
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
            
            // 其他情况返回null，让浏览器语言检测生效
            return null;
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
                
                // 登录页面
                'login.title': '登录',
                'login.welcome': '欢迎回来！请登录以继续',
                'login.username': '用户名',
                'login.username_placeholder': '请输入用户名',
                'login.password': '密码',
                'login.password_placeholder': '请输入密码',
                'login.submit': '登录',
                'login.no_account': '没有账号？立即注册',
                'login.login_success': '登录成功',
                'login.login_failed': '登录失败，请检查用户名和密码',
                
                // 注册页面
                'register.title': '注册',
                'register.username': '用户名',
                'register.username_placeholder': '请输入用户名',
                'register.email': '邮箱',
                'register.email_placeholder': '请输入邮箱地址',
                'register.password': '密码',
                'register.password_placeholder': '请输入密码',
                'register.confirm_password': '确认密码',
                'register.confirm_password_placeholder': '请再次输入密码',
                'register.submit': '注册',
                'register.has_account': '已有账号？立即登录',
                'register.register_success': '注册成功',
                'register.register_failed': '注册失败，请重试',
                'register.password_mismatch': '两次输入的密码不一致',

                // 演示区域
                'demo.title': '💬 AI智能助手体验',
                'demo.subtitle': '立即感受专业恋爱指导',
                'demo.partner_message': 'Hi，今天过得怎么样？',
                'demo.input_placeholder': '输入你的回复...',
                'demo.ai_thinking': 'AI正在生成回复建议...',
                'demo.smart_analysis': '🎯 智能分析',
                'demo.three_styles': '💡 3种风格',
                'demo.try_now': '立即体验',
                'demo.stats.response_time': '平均响应',
                'demo.stats.satisfaction': '满意度',
                'demo.stats.online_service': '在线服务',
                'demo.message_time': '刚刚',

                // 场景解决方案
                'scenarios.solutions_title': '恋爱场景解决方案',
                'scenarios.chat_start.badge': '聊天开场',
                'scenarios.chat_start.title': '不知道如何开启对话？',
                'scenarios.chat_start.description': 'AI定制个性化开场白\n让第一句话就抓住TA的心',
                'scenarios.chat_start.success_rate': '成功率',
                'scenarios.chat_start.templates': '模板',
                'scenarios.chat_start.button': '立即尝试',
                'scenarios.reply_suggest.badge': '回复建议',
                'scenarios.reply_suggest.title': '对方消息不知道怎么回？',
                'scenarios.reply_suggest.description': 'AI分析对话情境\n生成3种风格回复选择',
                'scenarios.reply_suggest.reply_rate': '回复率',
                'scenarios.reply_suggest.generation_time': '生成',
                'scenarios.reply_suggest.button': '获取建议',
                'scenarios.mood_analysis.badge': '情感分析',
                'scenarios.mood_analysis.title': '对方心情不好怎么安慰？',
                'scenarios.mood_analysis.description': 'AI识别情感状态\n推荐最贴心的安慰方式',
                'scenarios.mood_analysis.satisfaction': '满意度',
                'scenarios.mood_analysis.online': '在线',
                'scenarios.mood_analysis.button': '开始分析',
                'scenarios.date_plan.badge': '约会策划',
                'scenarios.date_plan.title': '想邀约但怕被拒绝？',
                'scenarios.date_plan.description': 'AI分析最佳邀约时机\n提供完美约会方案',
                'scenarios.date_plan.acceptance_rate': '接受率',
                'scenarios.date_plan.plans': '方案',
                'scenarios.date_plan.button': '制定方案',
                'scenarios.conflict_resolve.badge': '矛盾化解',
                'scenarios.conflict_resolve.title': '和TA发生争吵了怎么办？',
                'scenarios.conflict_resolve.description': 'AI提供和解策略\n帮你重新修复关系',
                'scenarios.conflict_resolve.resolution_rate': '和解率',
                'scenarios.conflict_resolve.professional': '专业',
                'scenarios.conflict_resolve.guidance': '指导',
                'scenarios.conflict_resolve.button': '寻求帮助',
                'scenarios.long_distance.badge': '异地恋',
                'scenarios.long_distance.title': '异地恋如何保持感情？',
                'scenarios.long_distance.description': 'AI制定专属沟通计划\n让距离不再是问题',
                'scenarios.long_distance.duration': '6个月+',
                'scenarios.long_distance.companionship': '陪伴',
                'scenarios.long_distance.daily': '每日',
                'scenarios.long_distance.reminders': '提醒',
                'scenarios.long_distance.button': '开始计划',

                // 功能特性
                'features.main_title': '核心功能',
                'features.reply_generation.title': '智能回复',
                'features.reply_generation.description': 'AI分析语境，生成个性化回复建议',
                'features.emotion_analysis.title': '情感解读',
                'features.emotion_analysis.description': '深度分析对方情感状态和真实想法',
                'features.chat_training.title': '聊天训练',
                'features.chat_training.description': '模拟真实场景，提升沟通技巧',
                'features.relationship_guidance.title': '恋爱指导',
                'features.relationship_guidance.description': '专业恋爱建议，助你收获幸福',
                'features.dating_guide.title': '约会攻略',
                'features.dating_guide.description': '专业约会指导，助你约会成功',

                // 用户故事
                'user_stories.title': '用户蜕变故事',
                'user_stories.story1.name': '小明',
                'user_stories.story1.status': '已脱单',
                'user_stories.story1.profile': '24岁 · 程序员 · 内向',
                'user_stories.story1.content': '"以前不知道怎么开场白，对话三句就结束了。用了恋语AI后，聊天话题源源不断，成功邀约了暗恋3年的女生！"',
                'user_stories.story1.time_value': '2周',
                'user_stories.story1.time_label': '脱单时间',
                'user_stories.story1.reply_rate': '回复率',
                'user_stories.story1.dates_value': '3次',
                'user_stories.story1.dates_label': '成功约会',

                // 今日助手
                'daily_assistant.title': '今日助手',
                'daily_assistant.suggestions': '今日建议',
                'daily_assistant.description': '已为你生成15条聊天回复',
                'daily_assistant.success_rate': '成功率',
                'daily_assistant.training_count': '训练次数',

                // 常见问题
                'common_problems.title': '常见聊天难题',
                'common_problems.start_conversation.title': '不知道如何开始对话？',
                'common_problems.start_conversation.description': 'AI根据对方资料生成个性化开场白',
                'common_problems.no_reply.title': '对方突然不回复了？',
                'common_problems.no_reply.description': 'AI分析情况，给出专业挽回建议',
                
                // 页脚
                'footer.terms': '服务条款',
                'footer.privacy': '隐私政策',
                'footer.copyright': '© 2024 恋语AI. 保留所有权利.',
                
                // 聊天界面
                'chat.title': '聊天',
                'chat.default_session': '默认会话',
                'chat.input.placeholder': '输入你想说的话...',
                'chat.send': '发送',
                'chat.typing': '正在输入...',
                'chat.ai_thinking': 'AI正在思考...',
                'chat.new_conversation': '新对话',
                'chat.clear_history': '清空历史',
                'chat.response.default': 'AI回复',
                'chat.response.received': '收到，正在分析...',
                
                // AI过渡页面
                'ai_transition.title': 'AI正在思考',
                'ai_transition.subtitle': '正在为你生成最佳回复建议...',
                
                // 聊天相关
                'chat.sessions_title': '会话列表',
                'chat.new_session': '新对话',
                'chat.anytime': '随时',
                'chat.start_new_chat': '开始新的对话...',
                'chat.yesterday': '昨天',
                'chat.crush_chat': '暗恋对象',
                'chat.date_chat': '周末约会',
                'chat.menu.delete_session': '删除会话',
                'chat.menu.quick_reply': '快速回复',
                'chat.menu.chat_assistant': '聊天助手',
                'chat.new_chat_cannot_delete': '新对话不能删除',
                'chat.confirm_delete_session': '确定要删除当前会话吗？删除后无法恢复。',
                'chat.days_ago': '3天前',
                'chat.crush_chat_preview': '最近有什么新电影推荐吗...',
                'chat.date_chat_preview': '那我们就这么说定了...',
                'chat.rename_session': '重命名会话',
                'chat.clear_session': '清空会话',
                'chat.more_actions': '更多操作',
                'chat.welcome_message': '👋 你好！我是恋语AI，粘贴你的聊天内容，我来帮你分析并生成回复建议。',
                'chat.input_placeholder': '输入或粘贴聊天内容...',
                'chat.search_sessions': '搜索会话...',
                
                // 新建会话菜单
                'new_session.new_chat': '新建聊天',
                'new_session.love_scenario': '恋爱场景',
                'new_session.date_scenario': '约会场景',
                'new_session.daily_chat': '日常聊天',
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
                'settings.dark_mode_enabled': '已开启深色模式',
                'settings.dark_mode_disabled': '已关闭深色模式',
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
                'profile.logout': '退出登录',
                
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
                'statistics.count_times': '62次',
                'statistics.count_times_47': '47次',
                'statistics.count_times_23': '23次',
                'statistics.day_1': '一',
                'statistics.day_2': '二',
                'statistics.day_3': '三',
                'statistics.day_4': '四',
                'statistics.day_5': '五',
                'statistics.day_6': '六',
                'statistics.day_7': '日',
                
                // 发现页面
                'discover.learning_center': '学习中心',
                'discover.love_skills': '恋爱技巧',
                'discover.love_skills_desc': '专业的恋爱指导课程',
                'discover.communication_art': '沟通艺术',
                'discover.communication_art_desc': '提升聊天和沟通技巧',
                'discover.psychology_test': '心理测试',
                'discover.psychology_test_desc': '了解你的恋爱风格',
                'discover.hot_topics': '热门话题',
                'discover.start_conversation_title': '如何开始一段对话？',
                'discover.start_conversation_desc': '学会用开放性问题和共同兴趣来打开话题...',
                'discover.start_conversation_views': '2.3万阅读',
                'discover.date_chat_title': '约会时的聊天技巧',
                'discover.date_chat_desc': '在约会中如何保持对话的趣味性和深度...',
                'discover.date_chat_views': '1.8万阅读',
                
                // 消息/通知页面
                'message.system_notifications': '系统通知',
                'message.lianyu_upgrade': '恋语AI 升级',
                'message.new_psychology_test': '新增了心理测试功能，快来测试你的恋爱风格吧！',
                'message.hours_ago': '小时前',
                'message.daily_reminder': '每日提醒',
                'message.practice_reminder': '今天还没有练习聊天呢，去聊天训练看看吧～',
                'message.success_story': '成功案例',
                'message.success_case': '恭喜用户小李成功邀约心仪对象！使用恋语AI建议成功率+50%',
                'message.day_ago': '天前',
                
                // 会员页面
                'vip.title': '升级会员',
                'vip.regular_user': '普通用户',
                'vip.premium_member': '高级会员',
                'vip.monthly_plan': '月度会员',
                'vip.yearly_plan': '年度会员',
                'vip.recommended': '推荐',
                'vip.save_amount': '省￥138',
                'vip.select': '选择',
                'vip.per_month': '/月',
                'vip.per_year': '/年',
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
                'edit_profile.beijing': '北京市',
                'edit_profile.shanghai': '上海市',
                'edit_profile.guangdong': '广东省',
                
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
        
                // AI回复相关
                'ai.reply.recommended': '💬 **推荐回复：**',
                'ai.reply.explanation': '📝 **回复解释：**',
                'ai.reply.stopped': '回复已停止。',
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

                // Login page
                'login.title': 'Login',
                'login.welcome': 'Welcome back! Sign in to continue',
                'login.username': 'Username',
                'login.username_placeholder': 'Please enter username',
                'login.password': 'Password',
                'login.password_placeholder': 'Please enter password',
                'login.submit': 'Login',
                'login.no_account': 'No account? Register now',
                'login.login_success': 'Login successful',
                'login.login_failed': 'Login failed, please check username and password',

                // Register page
                'register.title': 'Register',
                'register.username': 'Username',
                'register.username_placeholder': 'Please enter username',
                'register.email': 'Email',
                'register.email_placeholder': 'Please enter email address',
                'register.password': 'Password',
                'register.password_placeholder': 'Please enter password',
                'register.confirm_password': 'Confirm Password',
                'register.confirm_password_placeholder': 'Please enter password again',
                'register.submit': 'Register',
                'register.has_account': 'Already have an account? Login now',
                'register.register_success': 'Registration successful',
                'register.register_failed': 'Registration failed, please try again',
                'register.password_mismatch': 'Passwords do not match',

                // Demo area
                'demo.title': '💬 AI Smart Assistant Experience',
                'demo.subtitle': 'Experience professional dating guidance instantly',
                'demo.partner_message': 'Hi, how was your day?',
                'demo.input_placeholder': 'Type your reply...',
                'demo.ai_thinking': 'AI is generating reply suggestions...',
                'demo.smart_analysis': '🎯 Smart Analysis',
                'demo.three_styles': '💡 3 Styles',
                'demo.try_now': 'Try Now',
                'demo.stats.response_time': 'Avg Response',
                'demo.stats.satisfaction': 'Satisfaction',
                'demo.stats.online_service': 'Online Service',
                'demo.message_time': 'Just now',

                // Scenario solutions
                'scenarios.solutions_title': 'Love Scenario Solutions',
                'scenarios.chat_start.badge': 'Chat Opener',
                'scenarios.chat_start.title': 'Don\'t know how to start a conversation?',
                'scenarios.chat_start.description': 'AI creates personalized openers\nMake your first words capture their heart',
                'scenarios.chat_start.success_rate': 'Success Rate',
                'scenarios.chat_start.templates': 'Templates',
                'scenarios.chat_start.button': 'Try Now',
                'scenarios.reply_suggest.badge': 'Reply Suggestions',
                'scenarios.reply_suggest.title': 'Don\'t know how to reply to their message?',
                'scenarios.reply_suggest.description': 'AI analyzes conversation context\nGenerates 3 style reply options',
                'scenarios.reply_suggest.reply_rate': 'Reply Rate',
                'scenarios.reply_suggest.generation_time': 'Generation',
                'scenarios.reply_suggest.button': 'Get Suggestions',
                'scenarios.mood_analysis.badge': 'Emotion Analysis',
                'scenarios.mood_analysis.title': 'How to comfort when they\'re feeling down?',
                'scenarios.mood_analysis.description': 'AI identifies emotional states\nRecommends the most caring comfort approaches',
                'scenarios.mood_analysis.satisfaction': 'Satisfaction',
                'scenarios.mood_analysis.online': 'Online',
                'scenarios.mood_analysis.button': 'Start Analysis',
                'scenarios.date_plan.badge': 'Date Planning',
                'scenarios.date_plan.title': 'Want to ask them out but afraid of rejection?',
                'scenarios.date_plan.description': 'AI analyzes the best timing to ask\nProvides perfect date plans',
                'scenarios.date_plan.acceptance_rate': 'Acceptance Rate',
                'scenarios.date_plan.plans': 'Plans',
                'scenarios.date_plan.button': 'Make a Plan',
                'scenarios.conflict_resolve.badge': 'Conflict Resolution',
                'scenarios.conflict_resolve.title': 'Had an argument with them?',
                'scenarios.conflict_resolve.description': 'AI provides reconciliation strategies\nHelp you rebuild the relationship',
                'scenarios.conflict_resolve.resolution_rate': 'Resolution Rate',
                'scenarios.conflict_resolve.professional': 'Professional',
                'scenarios.conflict_resolve.guidance': 'Guidance',
                'scenarios.conflict_resolve.button': 'Get Help',
                'scenarios.long_distance.badge': 'Long Distance',
                'scenarios.long_distance.title': 'How to maintain a long-distance relationship?',
                'scenarios.long_distance.description': 'AI creates exclusive communication plans\nMake distance no longer a problem',
                'scenarios.long_distance.duration': '6+ Months',
                'scenarios.long_distance.companionship': 'Companionship',
                'scenarios.long_distance.daily': 'Daily',
                'scenarios.long_distance.reminders': 'Reminders',
                'scenarios.long_distance.button': 'Start Planning',

                // Features
                'features.main_title': 'Core Features',
                'features.reply_generation.title': 'Smart Reply',
                'features.reply_generation.description': 'AI analyzes context and generates personalized reply suggestions',
                'features.emotion_analysis.title': 'Emotion Reading',
                'features.emotion_analysis.description': 'Deep analysis of their emotional state and true thoughts',
                'features.chat_training.title': 'Chat Training',
                'features.chat_training.description': 'Practice with realistic scenarios to improve communication skills',
                'features.relationship_guidance.title': 'Love Guidance',
                'features.relationship_guidance.description': 'Professional dating advice to help you find happiness',
                'features.dating_guide.title': 'Dating Guide',
                'features.dating_guide.description': 'Professional dating guidance to help you succeed in dating',

                // User stories
                'user_stories.title': 'User Transformation Stories',
                'user_stories.story1.name': 'Alex',
                'user_stories.story1.status': 'In a relationship',
                'user_stories.story1.profile': '24 years old · Developer · Introverted',
                'user_stories.story1.content': '"I used to not know how to start conversations, and chats would end after three sentences. After using LoveChat AI, I have endless conversation topics and successfully asked out the girl I\'ve had a crush on for 3 years!"',
                'user_stories.story1.time_value': '2 weeks',
                'user_stories.story1.time_label': 'Time to relationship',
                'user_stories.story1.reply_rate': 'Reply Rate',
                'user_stories.story1.dates_value': '3 times',
                'user_stories.story1.dates_label': 'Successful dates',

                // Daily assistant
                'daily_assistant.title': 'Daily Assistant',
                'daily_assistant.suggestions': 'Today\'s Suggestions',
                'daily_assistant.description': 'Generated 15 chat replies for you',
                'daily_assistant.success_rate': 'Success Rate',
                'daily_assistant.training_count': 'Training Sessions',

                // Common problems
                'common_problems.title': 'Common Dating Challenges',
                'common_problems.start_conversation.title': 'Don\'t know how to start a conversation?',
                'common_problems.start_conversation.description': 'Get personalized conversation starters based on their interests',
                'common_problems.no_reply.title': 'They suddenly stopped replying?',
                'common_problems.no_reply.description': 'Get expert advice on how to re-engage them naturally',
                
                // Footer
                'footer.terms': 'Terms of Service',
                'footer.privacy': 'Privacy Policy',
                'footer.copyright': '© 2024 LoveChat AI. All rights reserved.',
                
                // Chat interface
                'chat.title': 'Chat',
                'chat.default_session': 'Default Session',
                'chat.input.placeholder': 'Type what you want to say...',
                'chat.send': 'Send',
                'chat.typing': 'Typing...',
                'chat.ai_thinking': 'AI is thinking...',
                'chat.new_conversation': 'New Chat',
                'chat.clear_history': 'Clear History',
                'chat.response.default': 'AI Reply',
                'chat.response.received': 'Received, analyzing...',
                
                // AI Transition Page
                'ai_transition.title': 'AI is thinking',
                'ai_transition.subtitle': 'Generating the best reply suggestions for you...',
                
                // Chat page content
                'chat.sessions_title': 'Chat Sessions',
                'chat.new_session': 'New Chat',
                'chat.search_sessions': 'Search sessions...',
                
                // New session menu
                'new_session.new_chat': 'New Chat',
                'new_session.love_scenario': 'Love Scenario',
                'new_session.date_scenario': 'Date Planning',
                'new_session.daily_chat': 'Daily Chat',
                'chat.anytime': 'Anytime',
                'chat.start_new_chat': 'Start a new conversation...',
                'chat.yesterday': 'Yesterday',
                'chat.days_ago': 'days ago',
                'chat.crush_chat': 'Crush',
                'chat.date_chat': 'Weekend Date',
                'chat.rename_session': 'Rename Session',
                'chat.clear_session': 'Clear Session',
                'chat.more_actions': 'More Actions',
                'chat.welcome_message': '👋 Hi! I\'m Lianyu AI, paste your chat content and I\'ll help you analyze and generate reply suggestions.',
                'chat.input_placeholder': 'Type or paste chat content...',
                'chat.attach': 'Attach',
                'chat.voice': 'Voice',
                'chat.image': 'Image',
                'chat.camera': 'Camera',
                'chat.document': 'Document',
                'chat.chat_log': 'Chat Log',
                
                // Chat related
                'chat.menu.delete_session': 'Delete Session',
                'chat.menu.quick_reply': 'Quick Reply',
                'chat.menu.chat_assistant': 'Chat Assistant',
                'chat.new_chat_cannot_delete': 'New chat cannot be deleted',
                'chat.confirm_delete_session': 'Are you sure you want to delete the current session? This action cannot be undone.',
                'chat.days_ago': '3 days ago',
                'chat.crush_chat_preview': 'Any new movie recommendations...',
                'chat.date_chat_preview': 'So it\'s settled then...',
                'chat.rename_session': 'Rename Session',
                'chat.clear_session': 'Clear Session',
                'chat.more_actions': 'More Actions',
                'chat.search_sessions': 'Search sessions...',
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
                'chat.assistant.title': 'Chat Helper',
                'chat.assistant.ai_helper.title': 'Get Smart Suggestions',
                'chat.assistant.ai_helper.description': 'Tell us what you want to talk about or any challenges you\'re facing, and we\'ll provide helpful reply ideas.',
                'chat.assistant.quick_reply.title': 'Quick Replies',
                'chat.assistant.quick_reply.description': 'Use the "Quick Reply" menu to access ready-made conversation templates.',
                'chat.assistant.multimedia.title': 'Share Media',
                'chat.assistant.multimedia.description': 'Use the "+" button to send photos, take pictures, or upload chat screenshots.',
                'chat.assistant.sessions.title': 'Organize Conversations',
                'chat.assistant.sessions.description': 'Create separate chat sessions for different people or dating scenarios.',
                'chat.session.rename': 'Rename Session',
                'chat.session.delete': 'Delete Session',
                'chat.session.sort': 'Sort Sessions',
                'chat.session.deleted': 'Session deleted',
                'chat.session.sort_coming_soon': 'Session sorting feature coming soon',
                'chat.session.default_cannot_rename': 'Default session cannot be renamed',
                'chat.session.default_cannot_delete': 'Default session cannot be deleted',
                
                // Scenarios module
                'scenarios.title': 'Dating Scenarios',
                'scenarios.dating': 'Dating Conversations',
                'scenarios.daily': 'Everyday Chat',
                'scenarios.comfort': 'Comfort & Support',
                'scenarios.flirt': 'Flirting & Romance',
                'scenarios.relationship': 'Relationship Building',
                
                // Discover page
                'discover.learning_center': 'Learning Center',
                'discover.love_skills': 'Love Skills',
                'discover.love_skills_desc': 'Professional dating guidance courses',
                'discover.communication_art': 'Communication Art',
                'discover.communication_art_desc': 'Improve chat and communication skills',
                'discover.psychology_test': 'Psychology Test',
                'discover.psychology_test_desc': 'Understand your love style',
                'discover.hot_topics': 'Hot Topics',
                'discover.start_conversation_title': 'How to start a conversation?',
                'discover.start_conversation_desc': 'Learn to use open-ended questions and common interests to open topics...',
                'discover.start_conversation_views': '23k views',
                'discover.date_chat_title': 'Chat skills during dates',
                'discover.date_chat_desc': 'How to maintain interesting and deep conversations during dates...',
                'discover.date_chat_views': '18k views',
                
                // Message/Notification page
                'message.system_notifications': 'System Notifications',
                'message.lianyu_upgrade': 'Lianyu AI Upgrade',
                'message.new_psychology_test': 'Added psychology test feature, come test your love style!',
                'message.hours_ago': 'hours ago',
                'message.daily_reminder': 'Daily Reminder',
                'message.practice_reminder': 'You haven\'t practiced chatting today, go check out chat training~',
                'message.success_story': 'Success Story',
                'message.success_case': 'Congratulations to user Xiao Li for successfully asking out their crush! Using Lianyu AI suggestions increased success rate by 50%',
                'message.day_ago': 'day ago',
                
                // Settings page
                'settings.title': 'Settings',
                'settings.save': 'Save',
                'settings.appearance': 'Appearance',
                'settings.dark_mode': 'Dark Mode',
                'settings.dark_mode_desc': 'Protect your eyes and save battery',
                'settings.dark_mode_enabled': 'Dark mode enabled',
                'settings.dark_mode_disabled': 'Dark mode disabled',
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
                
                // Bottom navigation
                'bottom_nav.home': 'Home',
                'bottom_nav.chat': 'Chat',
                'bottom_nav.discover': 'Discover',
                'bottom_nav.message': 'Messages',
                'bottom_nav.profile': 'Profile',
                
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
                'profile.logout': 'Logout',
                
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
                'statistics.count_times': '62 times',
                'statistics.count_times_47': '47 times',
                'statistics.count_times_23': '23 times',
                'statistics.day_1': 'Mon',
                'statistics.day_2': 'Tue',
                'statistics.day_3': 'Wed',
                'statistics.day_4': 'Thu',
                'statistics.day_5': 'Fri',
                'statistics.day_6': 'Sat',
                'statistics.day_7': 'Sun',
                
                // 会员页面
                'vip.title': 'Go Premium',
                'vip.regular_user': 'Free User',
                'vip.premium_member': 'Premium Member',
                'vip.monthly_plan': 'Monthly',
                'vip.yearly_plan': 'Annual',
                'vip.recommended': 'Most Popular',
                'vip.save_amount': 'Save ¥138',
                'vip.select': 'Choose Plan',
                'vip.per_month': '/month',
                'vip.per_year': '/year',
                'vip.unlimited_replies': 'Unlimited Smart Replies',
                'vip.advanced_emotion_analysis': 'Advanced Emotion Insights',
                'vip.date_planning': 'Personalized Date Ideas',
                'vip.all_monthly_benefits': 'Everything in Monthly',
                'vip.priority_ai_response': 'Faster AI Responses',
                'vip.exclusive_courses': 'Premium Dating Courses',
                'vip.personal_advisor': 'Personal Dating Coach',
                'vip.member_benefits': 'Premium Benefits',
                'vip.unlimited_usage': 'Unlimited Access',
                'vip.unlimited_usage_desc': 'Access all features without restrictions',
                'vip.priority_response': 'Priority Support',
                'vip.priority_response_desc': 'Get faster responses from our AI',
                'vip.ad_free': 'Ad-Free Experience',
                'vip.ad_free_desc': 'Enjoy uninterrupted dating assistance',
                'vip.exclusive_courses_title': 'Premium Courses',
                'vip.exclusive_courses_desc': 'Expert dating and relationship guidance',
                
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
                'edit_profile.beijing': 'Beijing',
                'edit_profile.shanghai': 'Shanghai',
                'edit_profile.guangdong': 'Guangdong',
                
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
        
        // AI reply related
        'ai.reply.recommended': '💬 **Recommended Reply:**',
        'ai.reply.explanation': '📝 **Reply Explanation:**',
        'ai.reply.stopped': 'Reply stopped.',
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
        console.log(`[DEBUG] 翻译请求: key=${key}, 当前语言=${this.currentLanguage}`);
        
        // 检查翻译配置是否存在
        if (!this.translations) {
            console.error(`[ERROR] 翻译配置对象不存在`);
            return key;
        }
        
        if (!this.translations[this.currentLanguage]) {
            console.error(`[ERROR] 当前语言(${this.currentLanguage})的翻译配置不存在`);
            console.log(`[DEBUG] 可用语言:`, Object.keys(this.translations));
            return key;
        }
        
        // 获取当前语言的翻译
        let translation = this.translations[this.currentLanguage][key];
        console.log(`[DEBUG] 当前语言翻译查找结果: ${translation}`);
        
        // 如果当前语言没有翻译，只在当前语言是中文时才使用中文fallback
        if (!translation && this.currentLanguage === 'zh-CN' && this.translations['zh-CN']) {
            translation = this.translations['zh-CN'][key];
            console.log(`[DEBUG] 中文fallback查找结果: ${translation}`);
            if (translation) {
                console.log(`[INFO] 使用中文fallback翻译: ${key} -> ${translation}`);
            }
        }
        
        // 如果还是没有翻译，返回key
        if (!translation) {
            console.warn(`[WARN] 翻译未找到: ${key}，显示原始key`);
            return key;
        }

        // 支持参数替换
        const result = this.interpolate(translation, params);
        console.log(`[DEBUG] 最终翻译结果: ${key} -> ${result}`);
        return result;
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
            
            // 更新生日输入框容器的语言属性
            const birthContainer = document.getElementById('birth-date-container');
            if (birthContainer) {
                birthContainer.lang = this.currentLanguage;
            }
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
        
        // 检查翻译配置状态
        if (!this.translations) {
            console.error('翻译配置未加载');
            return;
        }
        
        if (!this.translations[this.currentLanguage]) {
            console.error(`当前语言(${this.currentLanguage})的翻译配置不存在`);
            return;
        }
        
        // 更新所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('找到', elements.length, '个需要翻译的元素');
        
        let successCount = 0;
        let failCount = 0;
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // 检查翻译是否成功
            if (translation === key) {
                failCount++;
                console.warn(`翻译失败: ${key}`);
            } else {
                successCount++;
                console.log(`翻译成功: ${key} -> ${translation}`);
            }
            
            // 更新元素文本
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                // 强制处理HTML实体，特别是<br>标签
                let htmlContent = translation;
                
                // 处理各种可能的HTML实体格式
                htmlContent = htmlContent.replace(/&lt;br&gt;/gi, '<br>')
                                       .replace(/&lt;br\/&gt;/gi, '<br>')
                                       .replace(/&lt;br \/&gt;/gi, '<br>')
                                       .replace(/\\u003cbr\\u003e/gi, '<br>')
                                       .replace(/&lt;/g, '<')
                                       .replace(/&gt;/g, '>')
                                       .replace(/&amp;/g, '&')
                                       .replace(/&quot;/g, '"')
                                       .replace(/&#39;/g, "'");
                
                console.log(`[DEBUG] 元素翻译处理: ${translation} -> ${htmlContent}`);
                element.innerHTML = htmlContent;
            }
        });

        // 更新所有带有 data-i18n-placeholder 属性的元素的 placeholder
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        console.log('找到', placeholderElements.length, '个需要翻译placeholder的元素');
        
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            
            // 检查翻译是否成功
            if (translation === key) {
                console.warn(`Placeholder翻译失败: ${key}`);
            } else {
                console.log(`Placeholder翻译成功: ${key} -> ${translation}`);
                successCount++;
            }
            
            // 设置placeholder
            element.placeholder = translation;
        });

        // 更新所有带有 data-i18n-title 属性的元素的 title
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        console.log('找到', titleElements.length, '个需要翻译title的元素');
        
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            
            // 检查翻译是否成功
            if (translation === key) {
                console.warn(`Title翻译失败: ${key}`);
            } else {
                console.log(`Title翻译成功: ${key} -> ${translation}`);
                successCount++;
            }
            
            // 设置title
            element.title = translation;
        });

        // 更新所有带有 data-i18n-value 属性的元素的 value
        const valueElements = document.querySelectorAll('[data-i18n-value]');
        console.log('找到', valueElements.length, '个需要翻译value的元素');
        
        valueElements.forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            const translation = this.t(key);
            
            // 检查翻译是否成功
            if (translation === key) {
                console.warn(`Value翻译失败: ${key}`);
            } else {
                console.log(`Value翻译成功: ${key} -> ${translation}`);
                successCount++;
            }
            
            // 设置value
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = translation;
            }
        });

        // 更新所有带有 data-i18n-content 属性的元素的内容
        const contentElements = document.querySelectorAll('[data-i18n-content]');
        console.log('找到', contentElements.length, '个需要翻译content的元素');
        
        contentElements.forEach(element => {
            const key = element.getAttribute('data-i18n-content');
            const translation = this.t(key);
            
            // 检查翻译是否成功
            if (translation === key) {
                console.warn(`Content翻译失败: ${key}`);
            } else {
                console.log(`Content翻译成功: ${key} -> ${translation}`);
                successCount++;
            }
            
            // 设置内容
            if (element.tagName === 'TEXTAREA') {
                element.value = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // 输出翻译统计
        console.log(`翻译完成: 成功 ${successCount} 个，失败 ${failCount} 个`);

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
    console.log('正在初始化I18nManager...');
    window.I18nManager = new I18nManager();
    console.log('I18nManager初始化完成，当前语言:', window.I18nManager.getCurrentLanguage());
    
    // 设置window.i18n别名以兼容现有代码
    window.i18n = window.I18nManager;
    console.log('设置window.i18n别名完成');
    
    // 确保默认语言为中文
    const storedLang = window.I18nManager.getStoredLanguage();
    if (!storedLang) {
        console.log('未发现存储的语言设置，设置默认语言为中文');
        window.I18nManager.setLanguage('zh-CN');
    }
    
    // 标记I18nManager已准备就绪
    window.I18nManagerReady = true;
    
    // 触发自定义事件，通知其他模块I18nManager已准备就绪
    if (typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('i18nManagerReady', {
            detail: { manager: window.I18nManager }
        }));
    }
    
    // 页面加载完成后更新文本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM加载完成，开始更新页面文本');
            window.I18nManager.updatePageTexts();
        });
    } else {
        console.log('DOM已加载，立即更新页面文本');
        window.I18nManager.updatePageTexts();
    }
}

// 导出类（用于模块化环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}