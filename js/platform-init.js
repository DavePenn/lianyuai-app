/**
 * 平台特定初始化功能
 * 为不同平台提供专门的初始化逻辑
 */

/**
 * Capacitor平台初始化
 */
function initCapacitorFeatures() {
    console.log('初始化Capacitor平台功能');
    
    // 等待Capacitor准备就绪
    document.addEventListener('deviceready', () => {
        console.log('Capacitor设备准备就绪');
        
        // 初始化状态栏
        if (window.Capacitor?.Plugins?.StatusBar) {
            window.Capacitor.Plugins.StatusBar.setStyle({ style: 'LIGHT' });
            window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: '#ff3e79' });
        }
        
        // 初始化启动屏幕
        if (window.Capacitor?.Plugins?.SplashScreen) {
            setTimeout(() => {
                window.Capacitor.Plugins.SplashScreen.hide();
            }, 2000);
        }
        
        // 初始化键盘处理
        if (window.Capacitor?.Plugins?.Keyboard) {
            window.Capacitor.Plugins.Keyboard.addListener('keyboardWillShow', (info) => {
                document.body.style.paddingBottom = info.keyboardHeight + 'px';
            });
            
            window.Capacitor.Plugins.Keyboard.addListener('keyboardWillHide', () => {
                document.body.style.paddingBottom = '0px';
            });
        }
        
        // 初始化返回按钮处理
        if (window.Capacitor?.Plugins?.App) {
            window.Capacitor.Plugins.App.addListener('backButton', (data) => {
                if (data.canGoBack) {
                    window.history.back();
                } else {
                    // 显示退出确认
                    showExitConfirmation();
                }
            });
        }
        
        // 初始化网络状态监听
        if (window.Capacitor?.Plugins?.Network) {
            window.Capacitor.Plugins.Network.addListener('networkStatusChange', (status) => {
                handleNetworkChange(status.connected);
            });
        }
        
        // 初始化推送通知
        initPushNotifications();
    });
}

/**
 * 小程序平台初始化
 */
function initMiniprogramFeatures() {
    console.log('初始化小程序平台功能');
    
    // 小程序特定的功能在小程序环境中不需要额外初始化
    // 因为小程序有自己的生命周期管理
    
    // 禁用不支持的功能
    disableUnsupportedFeatures(['pwa', 'serviceWorker', 'notification']);
    
    // 适配小程序的UI
    document.body.classList.add('miniprogram-mode');
}

/**
 * PWA功能初始化
 */
function initPWAFeatures() {
    console.log('初始化PWA功能');
    
    // 注册Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker注册成功:', registration);
                
                // 检查更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateAvailable();
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker注册失败:', error);
            });
    }
    
    // 监听安装提示
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
    
    // 监听应用安装
    window.addEventListener('appinstalled', () => {
        console.log('PWA已安装');
        hideInstallPrompt();
    });
}

/**
 * 推送通知初始化
 */
function initPushNotifications() {
    if (window.Capacitor?.Plugins?.PushNotifications) {
        const PushNotifications = window.Capacitor.Plugins.PushNotifications;
        
        // 请求权限
        PushNotifications.requestPermissions().then((result) => {
            if (result.receive === 'granted') {
                PushNotifications.register();
            }
        });
        
        // 监听注册成功
        PushNotifications.addListener('registration', (token) => {
            console.log('推送通知注册成功:', token.value);
            // 将token发送到服务器
            sendTokenToServer(token.value);
        });
        
        // 监听推送消息
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('收到推送通知:', notification);
            showNotification(notification);
        });
        
        // 监听通知点击
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('点击推送通知:', notification);
            handleNotificationClick(notification);
        });
    }
}

/**
 * 禁用不支持的功能
 */
function disableUnsupportedFeatures(features) {
    features.forEach(feature => {
        const elements = document.querySelectorAll(`[data-feature="${feature}"]`);
        elements.forEach(element => {
            element.style.display = 'none';
        });
    });
}

/**
 * 显示退出确认
 */
function showExitConfirmation() {
    if (window.Capacitor?.Plugins?.App) {
        // 使用原生对话框
        window.Capacitor.Plugins.App.exitApp();
    } else {
        // Web环境下的确认
        if (confirm('确定要退出应用吗？')) {
            window.close();
        }
    }
}

/**
 * 处理网络状态变化
 */
function handleNetworkChange(isConnected) {
    const networkStatus = document.getElementById('network-status');
    if (networkStatus) {
        if (isConnected) {
            networkStatus.style.display = 'none';
        } else {
            networkStatus.style.display = 'block';
            networkStatus.textContent = '网络连接已断开';
        }
    }
    
    // 更新全局网络状态
    window.isOnline = isConnected;
}

/**
 * 显示更新可用提示
 */
function showUpdateAvailable() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
        <div class="update-content">
            <span>新版本可用</span>
            <button onclick="reloadApp()">更新</button>
            <button onclick="dismissUpdate()">稍后</button>
        </div>
    `;
    document.body.appendChild(updateBanner);
}

/**
 * 显示安装提示
 */
function showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
        <div class="install-content">
            <span>安装恋语AI到桌面</span>
            <button onclick="installApp()">安装</button>
            <button onclick="dismissInstall()">取消</button>
        </div>
    `;
    document.body.appendChild(installBanner);
}

/**
 * 隐藏安装提示
 */
function hideInstallPrompt() {
    const installBanner = document.getElementById('install-banner');
    if (installBanner) {
        installBanner.remove();
    }
}

/**
 * 安装应用
 */
function installApp() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('用户接受了安装提示');
            }
            window.deferredPrompt = null;
        });
    }
    hideInstallPrompt();
}

/**
 * 取消安装
 */
function dismissInstall() {
    hideInstallPrompt();
}

/**
 * 重新加载应用
 */
function reloadApp() {
    window.location.reload();
}

/**
 * 取消更新
 */
function dismissUpdate() {
    const updateBanner = document.querySelector('.update-banner');
    if (updateBanner) {
        updateBanner.remove();
    }
}

/**
 * 发送推送token到服务器
 */
function sendTokenToServer(token) {
    if (window.NetworkAdapter) {
        window.NetworkAdapter.post('/api/push/register', {
            token: token,
            platform: window.PlatformConfig.getPlatform()
        }).catch(error => {
            console.error('发送推送token失败:', error);
        });
    }
}

/**
 * 显示通知
 */
function showNotification(notification) {
    // 在应用内显示通知
    const notificationElement = document.createElement('div');
    notificationElement.className = 'in-app-notification';
    notificationElement.innerHTML = `
        <div class="notification-content">
            <h4>${notification.title}</h4>
            <p>${notification.body}</p>
        </div>
    `;
    document.body.appendChild(notificationElement);
    
    // 3秒后自动消失
    setTimeout(() => {
        notificationElement.remove();
    }, 3000);
}

/**
 * 处理通知点击
 */
function handleNotificationClick(notification) {
    // 根据通知数据执行相应操作
    if (notification.data && notification.data.action) {
        switch (notification.data.action) {
            case 'open_chat':
                // 打开聊天页面
                window.location.hash = '#chat';
                break;
            case 'open_profile':
                // 打开个人资料页面
                window.location.hash = '#profile';
                break;
            default:
                // 默认打开首页
                window.location.hash = '#home';
        }
    }
}