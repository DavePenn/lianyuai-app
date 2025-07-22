/**
 * 认证模块 - 处理用户登录、注册和Google OAuth
 */

class AuthManager {
    constructor() {
        this.googleInitialized = false;
        this.backendService = null;
        this.currentUser = null;
        
        // Google OAuth 配置 - 将在初始化时从OAuthConfig获取
        this.googleConfig = null;
    }

    /**
     * 初始化认证管理器
     */
    async initialize() {
        console.log('正在初始化认证管理器...');
        
        // 获取后端服务实例
        if (window.backendService) {
            this.backendService = window.backendService;
        } else {
            console.error('后端服务未初始化');
            return;
        }

        // 初始化Google OAuth
        await this.initializeGoogleOAuth();
        
        // 设置表单事件监听器
        this.setupFormListeners();
        
        // 检查现有的认证状态
        await this.checkAuthState();
        
        console.log('认证管理器初始化完成');
    }

    /**
     * 初始化Google OAuth
     */
    async initializeGoogleOAuth() {
        try {
            // 等待OAuth配置加载
            if (!window.OAuthConfig) {
                console.warn('OAuth配置未加载，稍后重试...');
                setTimeout(() => this.initializeGoogleOAuth(), 500);
                return;
            }

            // 获取当前环境的OAuth配置
            const oauthConfig = window.OAuthConfig.getCurrentConfig();
            
            // 设置Google OAuth配置
            this.googleConfig = {
                client_id: oauthConfig.google.clientId,
                callback: this.handleGoogleSignIn.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true
            };

            // 检查客户端ID是否配置
            if (!this.googleConfig.client_id || this.googleConfig.client_id.includes('您的Google客户端ID')) {
                console.warn('Google客户端ID未正确配置，跳过Google OAuth初始化');
                // 隐藏Google登录按钮
                this.hideGoogleButtons();
                return;
            }

            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize(this.googleConfig);
                this.googleInitialized = true;
                console.log('Google OAuth 初始化成功');
                
                // 为Google登录按钮添加事件
                this.setupGoogleButtons();
            } else {
                console.warn('Google OAuth SDK 未加载');
                // 如果Google SDK未加载，添加重试逻辑
                setTimeout(() => this.initializeGoogleOAuth(), 1000);
            }
        } catch (error) {
            console.error('Google OAuth 初始化失败:', error);
            this.hideGoogleButtons();
        }
    }

    /**
     * 设置Google登录按钮
     */
    setupGoogleButtons() {
        const googleButtons = document.querySelectorAll('.google-btn');
        
        googleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateGoogleLogin();
            });
        });
        
        console.log('Google登录按钮事件已设置');
    }

    /**
     * 隐藏Google登录按钮
     */
    hideGoogleButtons() {
        const googleButtons = document.querySelectorAll('.google-btn');
        googleButtons.forEach(button => {
            button.style.display = 'none';
        });
        console.log('Google登录按钮已隐藏（配置未完成）');
    }

    /**
     * 启动Google登录流程
     */
    initiateGoogleLogin() {
        if (!this.googleInitialized) {
            this.showError('Google登录服务未就绪，请稍后重试');
            return;
        }

        try {
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('Google登录提示被跳过或无法显示');
                    // 作为备选方案，使用popup方式
                    this.showGooglePopup();
                }
            });
        } catch (error) {
            console.error('启动Google登录失败:', error);
            this.showError('启动Google登录失败');
        }
    }

    /**
     * 显示Google登录弹窗
     */
    showGooglePopup() {
        try {
            google.accounts.id.renderButton(
                document.createElement('div'), // 临时元素
                {
                    theme: 'outline',
                    size: 'large',
                    width: 300
                }
            );
        } catch (error) {
            console.error('显示Google登录弹窗失败:', error);
            this.showError('Google登录不可用');
        }
    }

    /**
     * 处理Google登录回调
     */
    async handleGoogleSignIn(response) {
        try {
            console.log('收到Google登录回调');
            
            if (!response.credential) {
                throw new Error('未收到有效的Google凭证');
            }

            // 显示加载状态
            this.showLoading('正在验证Google账户...');

            // 发送凭证到后端验证
            const result = await this.backendService.googleAuth(response.credential);
            
            if (result.success) {
                this.currentUser = result.user;
                this.onLoginSuccess(result.user);
            } else {
                throw new Error(result.message || 'Google登录验证失败');
            }
            
        } catch (error) {
            console.error('Google登录处理失败:', error);
            this.showError(error.message || 'Google登录失败');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 设置表单事件监听器
     */
    setupFormListeners() {
        // 登录表单
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // 注册表单
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // 显示注册页面链接
        const showRegisterLink = document.getElementById('show-register');
        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterPage();
            });
        }

        // 显示登录页面链接
        const showLoginLink = document.getElementById('show-login');
        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginPage();
            });
        }

        // 密码显示/隐藏切换
        this.setupPasswordToggles();
        
        console.log('表单事件监听器已设置');
    }

    /**
     * 处理传统登录
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            username: formData.get('email'), // 使用email字段作为用户名
            password: formData.get('password')
        };

        if (!credentials.username || !credentials.password) {
            this.showError('请填写用户名和密码');
            return;
        }

        try {
            this.showLoading('正在登录...');
            
            const result = await this.backendService.login(credentials);
            
            if (result.success) {
                this.currentUser = result.user;
                this.onLoginSuccess(result.user);
            } else {
                throw new Error(result.message || '登录失败');
            }
            
        } catch (error) {
            console.error('登录失败:', error);
            this.showError(error.message || '登录失败，请检查用户名和密码');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 处理用户注册
     */
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        // 验证输入
        if (!this.validateRegistrationData(userData)) {
            return;
        }

        try {
            this.showLoading('正在注册...');
            
            const result = await this.backendService.register(userData);
            
            if (result.success) {
                this.currentUser = result.user;
                this.onLoginSuccess(result.user);
            } else {
                throw new Error(result.message || '注册失败');
            }
            
        } catch (error) {
            console.error('注册失败:', error);
            this.showError(error.message || '注册失败');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 验证注册数据
     */
    validateRegistrationData(userData) {
        if (!userData.username) {
            this.showError('请输入用户名');
            return false;
        }

        if (!userData.email) {
            this.showError('请输入邮箱');
            return false;
        }

        if (!this.isValidEmail(userData.email)) {
            this.showError('请输入有效的邮箱地址');
            return false;
        }

        if (!userData.password) {
            this.showError('请输入密码');
            return false;
        }

        if (userData.password.length < 6) {
            this.showError('密码长度至少6位');
            return false;
        }

        if (userData.password !== userData.confirmPassword) {
            this.showError('两次输入的密码不一致');
            return false;
        }

        return true;
    }

    /**
     * 邮箱格式验证
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 设置密码显示/隐藏切换
     */
    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const target = button.getAttribute('data-target');
                const passwordInput = document.getElementById(target);
                const icon = button.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    /**
     * 登录成功处理
     */
    onLoginSuccess(user) {
        console.log('登录成功:', user);
        
        // 保存用户信息
        this.currentUser = user;
        
        // 显示成功消息
        this.showSuccess('登录成功！正在跳转...');
        
        // 延迟跳转到主页
        setTimeout(() => {
            this.navigateToHome();
        }, 1500);
    }

    /**
     * 跳转到主页
     */
    navigateToHome() {
        // 隐藏登录/注册页面
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        
        if (loginPage) loginPage.classList.remove('active');
        if (registerPage) registerPage.classList.remove('active');
        
        // 显示主页
        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.classList.add('active');
        }
        
        // 显示底部导航栏
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }
        
        // 调用页面的登录成功处理函数
        if (typeof window.onLoginSuccess === 'function') {
            window.onLoginSuccess();
        }
        
        // 更新导航
        const homeTab = document.querySelector('[data-page="home"]');
        if (homeTab) {
            homeTab.click();
        }
    }

    /**
     * 显示注册页面
     */
    showRegisterPage() {
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        
        if (loginPage) loginPage.classList.remove('active');
        if (registerPage) registerPage.classList.add('active');
    }

    /**
     * 显示登录页面
     */
    showLoginPage() {
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        
        if (registerPage) registerPage.classList.remove('active');
        if (loginPage) loginPage.classList.add('active');
    }

    /**
     * 检查认证状态
     */
    async checkAuthState() {
        try {
            const token = this.backendService?.getAuthToken();
            if (token) {
                // 验证token是否有效
                const userProfile = await this.backendService.getUserProfile();
                if (userProfile) {
                    this.currentUser = userProfile;
                    console.log('发现有效的登录状态');
                    // 如果已登录，直接跳转到主页
                    this.navigateToHome();
                }
            }
        } catch (error) {
            console.log('没有有效的登录状态');
            // 清除无效的token
            this.backendService?.setAuthToken(null);
        }
    }

    /**
     * 用户注销
     */
    logout() {
        this.currentUser = null;
        if (this.backendService) {
            this.backendService.logout();
        }
        
        // 跳转到登录页面
        this.showLoginPage();
        
        console.log('用户已注销');
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        const errorElements = document.querySelectorAll('.auth-error');
        errorElements.forEach(element => {
            element.textContent = message;
            element.style.display = 'block';
        });
        
        // 3秒后自动隐藏
        setTimeout(() => {
            errorElements.forEach(element => {
                element.style.display = 'none';
            });
        }, 3000);
    }

    /**
     * 显示成功消息
     */
    showSuccess(message) {
        // 创建成功提示元素
        const successDiv = document.createElement('div');
        successDiv.className = 'auth-success';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            background: #10b981;
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin: 10px 0;
            text-align: center;
        `;
        
        const container = document.querySelector('.auth-form, .login-container, .register-container');
        if (container) {
            container.appendChild(successDiv);
            
            // 3秒后移除
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
    }

    /**
     * 显示加载状态
     */
    showLoading(message) {
        const buttons = document.querySelectorAll('.auth-btn, .google-btn, .apple-btn');
        buttons.forEach(button => {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = message;
        });
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const buttons = document.querySelectorAll('.auth-btn, .google-btn, .apple-btn');
        buttons.forEach(button => {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        });
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// 创建全局认证管理器实例
window.authManager = new AuthManager();

// 确保在DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authManager.initialize();
    });
} else {
    window.authManager.initialize();
}
