// 小程序主入口文件
App({
  globalData: {
    userInfo: null,
    token: null,
    apiBaseUrl: 'https://api.lianyuai.com',
    version: '1.0.0'
  },

  onLaunch: function(options) {
    console.log('恋语AI小程序启动', options);
    
    // 初始化平台配置
    this.initPlatformConfig();
    
    // 检查更新
    this.checkForUpdate();
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 初始化用户信息
    this.initUserInfo();
  },

  onShow: function(options) {
    console.log('恋语AI小程序显示', options);
  },

  onHide: function() {
    console.log('恋语AI小程序隐藏');
  },

  onError: function(msg) {
    console.error('恋语AI小程序错误:', msg);
  },

  /**
   * 初始化平台配置
   */
  initPlatformConfig: function() {
    // 设置全局配置
    getApp().globalData.platformConfig = {
      platform: 'miniprogram',
      api: {
        baseURL: this.globalData.apiBaseUrl,
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
    };
  },

  /**
   * 检查小程序更新
   */
  checkForUpdate: function() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate(function(res) {
        console.log('检查更新结果:', res.hasUpdate);
      });
      
      updateManager.onUpdateReady(function() {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
      
      updateManager.onUpdateFailed(function() {
        console.error('新版本下载失败');
      });
    }
  },

  /**
   * 获取系统信息
   */
  getSystemInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('系统信息:', res);
      },
      fail: (error) => {
        console.error('获取系统信息失败:', error);
      }
    });
  },

  /**
   * 初始化用户信息
   */
  initUserInfo: function() {
    // 从本地存储获取token
    const token = wx.getStorageSync('lianyuai_token');
    if (token) {
      this.globalData.token = token;
      // 验证token有效性
      this.validateToken(token);
    }
  },

  /**
   * 验证token有效性
   */
  validateToken: function(token) {
    wx.request({
      url: this.globalData.apiBaseUrl + '/api/users/profile',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.userInfo = res.data;
        } else {
          // token无效，清除本地存储
          this.clearUserData();
        }
      },
      fail: (error) => {
        console.error('验证token失败:', error);
        this.clearUserData();
      }
    });
  },

  /**
   * 清除用户数据
   */
  clearUserData: function() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    wx.removeStorageSync('lianyuai_token');
    wx.removeStorageSync('lianyuai_userInfo');
  },

  /**
   * 设置用户信息
   */
  setUserInfo: function(userInfo, token) {
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    
    // 保存到本地存储
    if (token) {
      wx.setStorageSync('lianyuai_token', token);
    }
    if (userInfo) {
      wx.setStorageSync('lianyuai_userInfo', userInfo);
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function() {
    return this.globalData.userInfo;
  },

  /**
   * 获取token
   */
  getToken: function() {
    return this.globalData.token;
  },

  /**
   * 显示加载提示
   */
  showLoading: function(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  /**
   * 隐藏加载提示
   */
  hideLoading: function() {
    wx.hideLoading();
  },

  /**
   * 显示提示信息
   */
  showToast: function(title, icon = 'none', duration = 2000) {
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration
    });
  },

  /**
   * 显示确认对话框
   */
  showModal: function(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: function(res) {
          resolve(res.confirm);
        }
      });
    });
  },

  /**
   * 网络请求封装
   */
  request: function(options) {
    const { url, method = 'GET', data = {}, header = {} } = options;
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: url.startsWith('http') ? url : this.globalData.apiBaseUrl + url,
        method: method,
        data: data,
        header: {
          'Content-Type': 'application/json',
          ...(this.globalData.token && { 'Authorization': 'Bearer ' + this.globalData.token }),
          ...header
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.data.message || '请求失败'}`));
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '网络请求失败'));
        }
      });
    });
  }
});