/**
 * 认证模块 - 处理用户登录、注册和Google OAuth
 */

class AuthManager {
    constructor() {
        this.backendService = null;
        this.currentUser = null;
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

        // 设置表单事件监听器
        this.setupFormListeners();
        
        // 检查现有的认证状态
        await this.checkAuthState();
        
        console.log('认证管理器初始化完成');
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
        
        // 一键填入测试账户
        const fillDemoButton = document.getElementById('fill-demo-account');
        if (fillDemoButton) {
            fillDemoButton.addEventListener('click', this.fillDemoAccount.bind(this));
        }
        
        console.log('表单事件监听器已设置');
    }

    /**
     * 处理传统登录
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email'), // 发送email字段，后端支持email登录
            password: formData.get('password')
        };

        if (!credentials.email || !credentials.password) {
            this.showError('请填写邮箱和密码');
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
            
            // 提供更详细的错误信息和解决建议
            let errorMessage = '登录失败';
            if (error.message) {
                if (error.message.includes('401') || error.message.includes('邮箱') || error.message.includes('密码')) {
                    errorMessage = '邮箱或密码错误，请检查后重试。\n💡 提示：可以使用测试账户 demo@test.com / 123456';
                } else if (error.message.includes('网络') || error.message.includes('连接')) {
                    errorMessage = '网络连接失败，请检查网络后重试';
                } else if (error.message.includes('服务器')) {
                    errorMessage = '服务器暂时不可用，请稍后重试';
                } else {
                    errorMessage = error.message;
                }
            } else {
                errorMessage = '登录失败，请检查邮箱和密码\n💡 提示：可以使用测试账户 demo@test.com / 123456';
            }
            
            this.showError(errorMessage);
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
     * 一键填入测试账户
     */
    fillDemoAccount() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (emailInput && passwordInput) {
            emailInput.value = 'demo@test.com';
            passwordInput.value = '123456';
            
            // 添加视觉反馈
            emailInput.style.background = '#e8f5e8';
            passwordInput.style.background = '#e8f5e8';
            
            setTimeout(() => {
                emailInput.style.background = '';
                passwordInput.style.background = '';
            }, 1000);
            
            console.log('已填入测试账户信息');
        }
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
        
        // 预加载用户资料数据
        if (typeof window.preloadUserProfileData === 'function') {
            window.preloadUserProfileData();
        }
        
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
        
        // 清除body的data-current-page属性
        document.body.removeAttribute('data-current-page');
        
        // 显示主页
        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.classList.add('active');
        }
        
        // 显示底部导航栏
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.cssText = '';
            bottomNav.classList.remove('hidden');
            bottomNav.removeAttribute('data-hidden');
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
        
        // 设置body的data-current-page属性
        document.body.setAttribute('data-current-page', 'register');
        
        // 隐藏底部导航栏
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; box-shadow: none !important; border: none !important; transform: translateY(100%) !important; height: 0 !important; overflow: hidden !important; position: absolute !important; top: -9999px !important;';
            bottomNav.classList.add('hidden');
            bottomNav.setAttribute('data-hidden', 'true');
        }
    }

    /**
     * 显示登录页面
     */
    showLoginPage() {
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        
        if (registerPage) registerPage.classList.remove('active');
        if (loginPage) loginPage.classList.add('active');
        
        // 设置body的data-current-page属性
        document.body.setAttribute('data-current-page', 'login');
        
        // 隐藏底部导航栏
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; box-shadow: none !important; border: none !important; transform: translateY(100%) !important; height: 0 !important; overflow: hidden !important; position: absolute !important; top: -9999px !important;';
            bottomNav.classList.add('hidden');
            bottomNav.setAttribute('data-hidden', 'true');
        }
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
        const buttons = document.querySelectorAll('.auth-btn, .google-btn');
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
        const buttons = document.querySelectorAll('.auth-btn, .google-btn');
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
