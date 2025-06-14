// 小程序首页逻辑
Page({
  data: {
    version: '1.0.0',
    heroCards: [
      {
        id: 1,
        badge: '聊天开场',
        title: '不知道如何开启对话？',
        description: 'AI定制个性化开场白\n让第一句话就抓住TA的心',
        background: 'linear-gradient(135deg, #ff3e79 0%, #9c27b0 100%)',
        stats: [
          { number: '92%', label: '成功率' },
          { number: '1000+', label: '模板' }
        ],
        buttonText: '立即尝试',
        action: 'chat_opening'
      },
      {
        id: 2,
        badge: '约会建议',
        title: '约会不知道去哪里？',
        description: '根据你们的兴趣爱好\n推荐最适合的约会地点',
        background: 'linear-gradient(135deg, #6c5ce7 0%, #00cec9 100%)',
        stats: [
          { number: '500+', label: '地点' },
          { number: '95%', label: '满意度' }
        ],
        buttonText: '获取建议',
        action: 'date_suggestion'
      },
      {
        id: 3,
        badge: '情感分析',
        title: 'TA的心思你懂吗？',
        description: '分析聊天记录\n洞察TA的真实想法',
        background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
        stats: [
          { number: '98%', label: '准确率' },
          { number: '24h', label: '响应' }
        ],
        buttonText: '开始分析',
        action: 'emotion_analysis'
      }
    ],
    scenarios: [
      {
        id: 1,
        title: '初次见面',
        description: '破冰聊天技巧',
        icon: 'icon-handshake',
        tag: '热门',
        type: 'first_meeting'
      },
      {
        id: 2,
        title: '深度交流',
        description: '增进了解话题',
        icon: 'icon-heart',
        tag: '推荐',
        type: 'deep_talk'
      },
      {
        id: 3,
        title: '约会邀请',
        description: '自然发出邀请',
        icon: 'icon-calendar',
        tag: '实用',
        type: 'date_invite'
      },
      {
        id: 4,
        title: '情感表达',
        description: '表达真实感受',
        icon: 'icon-message',
        tag: '进阶',
        type: 'emotion_express'
      },
      {
        id: 5,
        title: '矛盾处理',
        description: '化解小误会',
        icon: 'icon-peace',
        tag: '必备',
        type: 'conflict_resolve'
      }
    ],
    features: [
      {
        id: 1,
        title: '智能聊天',
        description: '24小时AI陪聊',
        icon: 'icon-chat',
        type: 'chat'
      },
      {
        id: 2,
        title: '话题推荐',
        description: '永不冷场',
        icon: 'icon-lightbulb',
        type: 'topics'
      },
      {
        id: 3,
        title: '情感测试',
        description: '了解恋爱类型',
        icon: 'icon-test',
        type: 'test'
      },
      {
        id: 4,
        title: '专家指导',
        description: '专业恋爱建议',
        icon: 'icon-expert',
        type: 'expert'
      }
    ]
  },

  onLoad: function(options) {
    console.log('首页加载', options);
    this.initPage();
  },

  onShow: function() {
    console.log('首页显示');
  },

  onReady: function() {
    console.log('首页渲染完成');
  },

  onPullDownRefresh: function() {
    console.log('下拉刷新');
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 初始化页面
   */
  initPage: function() {
    const app = getApp();
    this.setData({
      version: app.globalData.version
    });
  },

  /**
   * 英雄卡片操作
   */
  onHeroAction: function(e) {
    const action = e.currentTarget.dataset.action;
    console.log('英雄卡片操作:', action);
    
    switch (action) {
      case 'chat_opening':
        this.navigateToChat('opening');
        break;
      case 'date_suggestion':
        this.navigateToChat('date');
        break;
      case 'emotion_analysis':
        this.navigateToChat('analysis');
        break;
      default:
        this.navigateToChat();
    }
  },

  /**
   * 场景卡片点击
   */
  onScenarioTap: function(e) {
    const scenario = e.currentTarget.dataset.scenario;
    console.log('场景选择:', scenario);
    
    this.navigateToChat(scenario.type, {
      scenarioTitle: scenario.title,
      scenarioDescription: scenario.description
    });
  },

  /**
   * 功能点击
   */
  onFeatureTap: function(e) {
    const feature = e.currentTarget.dataset.feature;
    console.log('功能选择:', feature);
    
    switch (feature.type) {
      case 'chat':
        this.navigateToChat();
        break;
      case 'topics':
        this.navigateToScenarios();
        break;
      case 'test':
        this.showComingSoon('情感测试');
        break;
      case 'expert':
        this.showComingSoon('专家指导');
        break;
    }
  },

  /**
   * 开始聊天
   */
  onStartChat: function() {
    this.navigateToChat();
  },

  /**
   * 跳转到聊天页面
   */
  navigateToChat: function(type = 'general', params = {}) {
    const url = `/pages/chat/chat?type=${type}&${this.objectToQuery(params)}`;
    wx.navigateTo({
      url: url,
      success: () => {
        console.log('跳转到聊天页面成功');
      },
      fail: (error) => {
        console.error('跳转到聊天页面失败:', error);
        getApp().showToast('页面跳转失败');
      }
    });
  },

  /**
   * 跳转到场景页面
   */
  navigateToScenarios: function() {
    wx.switchTab({
      url: '/pages/scenarios/scenarios',
      success: () => {
        console.log('跳转到场景页面成功');
      },
      fail: (error) => {
        console.error('跳转到场景页面失败:', error);
        getApp().showToast('页面跳转失败');
      }
    });
  },

  /**
   * 显示即将推出提示
   */
  showComingSoon: function(feature) {
    wx.showModal({
      title: '即将推出',
      content: `${feature}功能正在开发中，敬请期待！`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 对象转查询字符串
   */
  objectToQuery: function(obj) {
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },

  /**
   * 分享功能
   */
  onShareAppMessage: function() {
    return {
      title: '恋语AI - 智能恋爱助手',
      desc: '让AI成为你的恋爱导师，解决恋爱沟通难题',
      path: '/pages/index/index'
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function() {
    return {
      title: '恋语AI - 智能恋爱助手',
      query: '',
      imageUrl: ''
    };
  }
});