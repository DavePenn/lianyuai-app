// Core functionality for the mobile app - cross-platform compatible version

const AppConstants = {
    LANG_ZH: 'zh-CN',
    LANG_EN: 'en-US',
    LANG_TEXT_ZH: '中文',
    LANG_TEXT_EN: 'English',
};

// Toggles the application language
async function toggleLanguage() {
    console.log('toggleLanguage function called');

    if (!window.I18nManager) {
        console.error('I18nManager not loaded, cannot switch language');
        return;
    }

    try {
        const currentLang = window.I18nManager.getCurrentLanguage();
        const newLang = currentLang === AppConstants.LANG_ZH ? AppConstants.LANG_EN : AppConstants.LANG_ZH;

        console.log(`Switching language from ${currentLang} to ${newLang}`);

        document.body.classList.add('language-switching');

        // Use a promise to handle the delay and reduce nesting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Switch language and let the observer handle UI updates
        window.I18nManager.setLanguage(newLang);

        // The observer in initI18n will call updateUIForLanguage, which handles all UI updates.
        // Fallback mechanisms can be triggered if necessary.

        // Execute smart language fix as a fallback after a delay
        if (window.smartLanguageFix) {
            setTimeout(() => window.smartLanguageFix(), 500);
        }

        // Remove animation class after updates are likely complete
        setTimeout(() => {
            document.body.classList.remove('language-switching');
            console.log(`Language switch complete: ${newLang}`);
        }, 600); // Increased delay to ensure all updates are rendered

    } catch (error) {
        console.error('Error during language switch:', error);
        document.body.classList.remove('language-switching');
    }
}

// Updates the language button display
function updateLanguageButton() {
    if (window.I18nManager) {
        const currentLang = window.I18nManager.getCurrentLanguage();
        
        // Update language display in the profile page using i18n translations
        const profileLangElement = document.getElementById('profile-current-language');
        if (profileLangElement) {
            // Use the appropriate translation key based on current language
            const langKey = currentLang === AppConstants.LANG_ZH ? 'settings.language.chinese' : 'settings.language.english';
            const langText = window.I18nManager.t(langKey);
            profileLangElement.textContent = langText;
        }
    }
}

// Initializes internationalization
function initI18n() {
    if (window.I18nManager) {
        // Add a language change observer
        window.I18nManager.addObserver((language) => {
            console.log('Language changed to:', language);
            updateUIForLanguage(language);
        });

        // Initial UI update for the current language
        updateUIForLanguage(window.I18nManager.getCurrentLanguage());
    }
}

// Updates all UI elements based on the selected language
function updateUIForLanguage(language) {
    updateLanguageButton();
    updateAIResponseLanguage(language);
    updateChatTitle();
    updateDateInputsLanguage(language);
    window.I18nManager.updatePageTexts();

    // Force refresh translations to handle HTML entities correctly after a short delay
    setTimeout(() => {
        console.log('Forcing translation refresh to fix HTML entities');
        forceRefreshTranslations();
    }, 100);
}

// Force-refreshes translations to fix HTML entity issues
function forceRefreshTranslations() {
    console.log('Force-refreshing all translations to fix HTML entity issues');

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (!key || !window.I18nManager) return;

        let translation = window.I18nManager.t(key);

        // Decode HTML entities
        const decodedTranslation = new DOMParser().parseFromString(translation, 'text/html').body.textContent || "";

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.type === 'submit' || element.type === 'button') {
                element.value = decodedTranslation;
            } else {
                element.placeholder = decodedTranslation;
            }
        } else {
            element.innerHTML = decodedTranslation;
        }

        console.log(`Force-updated element: ${key} -> ${decodedTranslation}`);
    });
}

// Updates the chat title
function updateChatTitle() {
    const titleElement = document.getElementById('current-session-title');
    if (titleElement && titleElement.hasAttribute('data-i18n')) {
        const key = titleElement.getAttribute('data-i18n');
        const translation = window.I18nManager ? window.I18nManager.t(key) : key;
        titleElement.textContent = translation;
    }
}

// Updates the AI response language preference
function updateAIResponseLanguage(language) {
    if (!window.AI_CONFIG) {
        console.warn('AI_CONFIG not loaded, cannot update AI response language');
        return;
    }
    window.AI_CONFIG.language = language;
    console.log(`Updated AI response language to: ${language}`);
}

// Updates date input elements language
function updateDateInputsLanguage(language) {
    const dateInputs = document.querySelectorAll('input[type="date"], input[type="datetime-local"], input[type="time"]');
    dateInputs.forEach(input => {
        // 强制设置为英文格式
        input.setAttribute('lang', 'en-US');
        input.style.direction = 'ltr';
        input.style.unicodeBidi = 'embed';
        
        // 强制重新渲染
        const parent = input.parentNode;
        const nextSibling = input.nextSibling;
        parent.removeChild(input);
        parent.insertBefore(input, nextSibling);
    });
    console.log('Forced all date inputs to English format');
}

// 强制日期输入框英文化的专用函数
function forceDateInputsEnglish() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // 设置多重属性强制英文格式
        input.setAttribute('lang', 'en-US');
        input.setAttribute('locale', 'en-US');
        input.style.direction = 'ltr';
        input.style.unicodeBidi = 'embed';
        input.style.fontFamily = '\'Segoe UI\', \'Helvetica Neue\', Arial, sans-serif';
        input.style.webkitLocale = '"en-US"';
        input.style.writingMode = 'horizontal-tb';
        
        // 强制重新创建输入框
        const value = input.value;
        const attributes = {};
        for (let attr of input.attributes) {
            attributes[attr.name] = attr.value;
        }
        
        const newInput = document.createElement('input');
        newInput.type = 'date';
        for (let [name, value] of Object.entries(attributes)) {
            newInput.setAttribute(name, value);
        }
        newInput.setAttribute('lang', 'en-US');
        newInput.setAttribute('locale', 'en-US');
        newInput.style.cssText = input.style.cssText;
        newInput.style.webkitLocale = '"en-US"';
        newInput.value = value;
        
        input.parentNode.replaceChild(newInput, input);
        
        // 添加事件监听器
        newInput.addEventListener('focus', function() {
            this.setAttribute('lang', 'en-US');
            this.style.webkitLocale = '"en-US"';
        });
    });
    
    // 强制设置页面locale
    document.documentElement.setAttribute('lang', 'en-US');
    document.body.setAttribute('lang', 'en-US');
    
    console.log('Force applied English format to all date inputs with enhanced methods');
}


// Initializes platform-specific adapters with fallbacks
function initPlatformAdapters() {
    const defaultConfig = {
        'platform': 'web',
        'storage.prefix': 'lianyuai_',
        'api.baseURL': 'https://api.lianyuai.com',
        'api.timeout': 10000
    };

    // Fallback for PlatformConfig
    if (typeof window.PlatformConfig === 'undefined') {
        console.warn('PlatformConfig not loaded, using default web config');
        window.PlatformConfig = {
            getPlatform: () => defaultConfig.platform,
            get: (key) => defaultConfig[key],
            hasFeature: (feature) => true
        };
    }

    // Fallback for StorageAdapter
    if (typeof window.StorageAdapter === 'undefined') {
        console.warn('StorageAdapter not loaded, using localStorage fallback');
        const prefix = PlatformConfig.get('storage.prefix');
        window.StorageAdapter = {
            setItem: (key, value) => localStorage.setItem(prefix + key, JSON.stringify(value)),
            getItem: (key) => {
                const item = localStorage.getItem(prefix + key);
                try { return JSON.parse(item); } catch { return item; }
            },
            removeItem: (key) => localStorage.removeItem(prefix + key)
        };
    }

    // Fallback for NetworkAdapter
    if (typeof window.NetworkAdapter === 'undefined') {
        console.warn('NetworkAdapter not loaded, using fetch fallback');
        window.NetworkAdapter = {
            request: async (options) => {
                const response = await fetch(options.url, {
                    method: options.method || 'GET',
                    headers: options.headers || {},
                    body: options.data ? JSON.stringify(options.data) : undefined
                });
                return { data: await response.json(), status: response.status };
            },
            get: (url, options) => window.NetworkAdapter.request({ url, method: 'GET', ...options }),
            post: (url, data, options) => window.NetworkAdapter.request({ url, method: 'POST', data, ...options })
        };
    }
}

// Constants for chat functionality
const CHAT_CONFIG = {
    TYPING_DELAY: 1500,
    RESPONSE_KEYS: {
        DEFAULT: 'chat.response.default',
        RECEIVED: 'chat.response.received'
    }
};

// Global function to send chat messages
window.sendChatMessage = function() {
    console.log('DIRECT: Send chat message function called');
    
    const chatInput = document.querySelector('.chat-input-field');
    if (!chatInput) {
        console.log('DIRECT: Chat input not found');
        return;
    }
    
    const message = chatInput.value.trim();
    console.log('DIRECT: Message to send:', message);
    
    if (!message) {
        console.log('DIRECT: Empty message, not sending');
        return;
    }
    
    // Add user message
    addMessage('user', message);
    
    // Clear input field
    chatInput.value = '';
    
    // Show AI typing indicator
    showTypingIndicator();
    
    // Simulate AI response delay
    setTimeout(() => {
        removeTypingIndicator();
        
        const aiReply = generateAIReply(message);
        addMessage('ai', aiReply);
        
        // Scroll to bottom
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            // 调整滚动位置，留出适当的底部空间
        const targetScrollTop = chatMessages.scrollHeight - chatMessages.clientHeight - 50;
        chatMessages.scrollTop = Math.max(0, targetScrollTop);
        }
    }, CHAT_CONFIG.TYPING_DELAY);
}

// Generates AI reply with i18n support
function generateAIReply(userMessage) {
    if (!window.I18nManager) {
        return `收到您的消息: ${userMessage}`;
    }
    
    return `${window.I18nManager.t(CHAT_CONFIG.RESPONSE_KEYS.RECEIVED)}: ${userMessage}`;
};

// 显示AI正在输入指示器
function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.className = 'message ai-message typing';
    
    typingIndicator.innerHTML = `
        <div class="message-avatar ai">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 移除AI正在输入指示器
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Main app initialization logic
function initializeApp() {
    // Initialize cross-platform adapters
    initPlatformAdapters();

    // Detect platform and apply specific configurations
    const platform = window.PlatformConfig.getPlatform();
    console.log('Current platform:', platform);
    document.body.setAttribute('data-platform', platform);

    // Fix 100vh issue on mobile
    function setVhVariable() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setVhVariable();
    window.addEventListener('resize', setVhVariable);

    // Platform-specific initializations
    if (platform === 'capacitor') {
        initCapacitorFeatures();
    } else if (platform === 'miniprogram') {
        initMiniprogramFeatures();
    } else if (platform === 'web' && window.PlatformConfig.hasFeature('pwa')) {
        initPWAFeatures();
    }

    // Initialize core app features
    initAppNavigation();
    initChatFeature();
    initHomeFeatures();
    initMultiModalChat();
    

    
    initChatSessionsManager();
    initScenarioSlider();
    
    // 使用增强版轮播（如果可用）
    if (window.initEnhancedCarousel) {
        window.initEnhancedCarousel();
    } else {
        // 后备到原始轮播
        initHeroCarousel();
    }
    
    initProfilePages();
    initDarkMode();
    initI18n();
    
    // 强制日期输入框显示英文格式
    setTimeout(() => {
        forceDateInputsEnglish();
    }, 500);
    
    // 初始化Google登录
    if (typeof AuthManager !== 'undefined') {
        try {
            window.authManager = new AuthManager();
            window.authManager.initialize();
            console.log('Google登录初始化成功');
        } catch (error) {
            console.error('Google登录初始化失败:', error);
        }
    } else {
        console.error('AuthManager未定义，请检查auth.js是否正确加载');
    }

    // UI fixes and adjustments
    fixSubPageTitles();
    removeAllMainPageHeaders();

    // Bind chat input events
    const chatInput = document.querySelector('.chat-input-field');
    const sendButton = document.getElementById('chat-send-btn');

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (window.sendMessage) window.sendMessage();
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.sendMessage) window.sendMessage();
        });
    }

    // Check login status and set initial page
    setTimeout(() => {
        const token = localStorage.getItem('auth_token');
        const isLoggedIn = token && token !== 'null' && token !== '';
        
        if (isLoggedIn) {
            // User is logged in, show home page
            const homeTab = document.querySelector('.tab-item[data-page="home"]');
            if (homeTab) homeTab.click();
            
            // Show bottom navigation
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = 'flex';
            }
            
            // 预加载用户资料数据，避免点击"我的"tab时等待
            preloadUserProfileData();
        } else {
            // User is not logged in, show login page
            if (typeof showPage === 'function') {
                showPage('login');
            }
            
            // Hide bottom navigation
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = 'none';
            }
        }
    }, 100);

    console.log('LianYu AI - Mobile App version started!');
}

document.addEventListener('DOMContentLoaded', initializeApp);

// 初始化暗黑模式
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // 检查系统是否为深色模式
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 检查本地存储中的暗黑模式设置
        const savedDarkMode = localStorage.getItem('darkMode');
        const isDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : prefersDarkMode;
        
        // 应用初始状态
        darkModeToggle.checked = isDarkMode;
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            // 立即应用暗黑模式样式到关键元素
            applyDarkModeToElements();
        }
        
        // 添加切换事件
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                showToast(window.I18nManager ? window.I18nManager.t('settings.dark_mode_enabled') : '已开启深色模式', 'success');
                // 应用暗黑模式样式到关键元素
                applyDarkModeToElements();
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                showToast(window.I18nManager ? window.I18nManager.t('settings.dark_mode_disabled') : '已关闭深色模式', 'success');
            }
        });
        
        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // 只在用户没有手动设置的情况下跟随系统
            if (localStorage.getItem('darkMode') === null) {
                darkModeToggle.checked = e.matches;
                if (e.matches) {
                    document.body.classList.add('dark-mode');
                    // 应用暗黑模式样式到关键元素
                    applyDarkModeToElements();
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        });
    } else {
        // 如果没有找到切换按钮，也要检查系统设置
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedDarkMode = localStorage.getItem('darkMode');
        const isDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : prefersDarkMode;
        
        // 应用深色模式
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            // 应用暗黑模式样式到关键元素
            applyDarkModeToElements();
        }
    }
}

// 应用暗黑模式样式到关键元素
function applyDarkModeToElements() {
    // 帮助中心页面暗黑模式适配
    const helpPage = document.getElementById('help-page');
    if (helpPage) {
        const searchInput = helpPage.querySelector('.search-box input');
        if (searchInput) {
            searchInput.style.backgroundColor = '#2c2c2c';
            searchInput.style.borderColor = 'rgba(255,255,255,0.1)';
            searchInput.style.color = '#f1f1f1';
        }
        
        const faqItems = helpPage.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.style.backgroundColor = '#2c2c2c';
            item.style.borderColor = 'rgba(255,255,255,0.1)';
            item.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            
            const question = item.querySelector('.faq-question');
            if (question) {
                question.style.backgroundColor = '#2c2c2c';
                question.style.borderColor = 'rgba(255,255,255,0.1)';
                question.style.color = '#f1f1f1';
            }
            
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.style.backgroundColor = 'rgba(255,255,255,0.05)';
                answer.style.color = '#f1f1f1';
            }
        });
        
        const contactSection = helpPage.querySelector('.contact-section');
        if (contactSection) {
            contactSection.style.backgroundColor = '#2c2c2c';
            contactSection.style.borderColor = 'rgba(255,255,255,0.1)';
            contactSection.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            
            const texts = contactSection.querySelectorAll('h4, p');
            texts.forEach(text => {
                text.style.color = '#f1f1f1';
            });
        }
    }
    
    // 关于我们页面暗黑模式适配
    const aboutPage = document.getElementById('about-page');
    if (aboutPage) {
        const sections = aboutPage.querySelectorAll('.app-info, .team-section, .mission-section, .social-section');
        sections.forEach(section => {
            section.style.backgroundColor = '#2c2c2c';
            section.style.borderColor = 'rgba(255,255,255,0.1)';
            section.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            
            // 修改文本颜色
            const texts = section.querySelectorAll('p, h2, h4');
            texts.forEach(text => {
                if (!text.classList.contains('app-version') && !text.style.color) {
                    text.style.color = '#f1f1f1';
                }
            });
        });
        
        const appVersion = aboutPage.querySelector('.app-version');
        if (appVersion) {
            appVersion.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }
        
        const termsSection = aboutPage.querySelector('.terms-section');
        if (termsSection) {
            termsSection.style.borderColor = 'rgba(255,255,255,0.1)';
            
            const links = termsSection.querySelectorAll('a');
            links.forEach(link => {
                link.style.backgroundColor = 'rgba(255, 62, 121, 0.2)';
            });
        }
    }
}

// 初始化个人中心子页面
function initProfilePages() {
    // 获取个人中心菜单项
    const profileMenuItems = document.querySelectorAll('.profile-menu .menu-item');
    
    // 获取所有子页面
    const subPages = [
        document.getElementById('edit-profile-page'),
        document.getElementById('settings-page'),
        document.getElementById('statistics-page'),
        document.getElementById('vip-page'),
        document.getElementById('help-page'),
        document.getElementById('about-page')
    ];
    
    // 所有返回按钮
    const backButtons = document.querySelectorAll('.back-btn');
    
    // 新增：个人中心顶部折叠交互（Large Title 稳定状态机）
    const profilePage = document.getElementById('profile-page');
    const profileHeader = profilePage ? profilePage.querySelector('.profile-header') : null;
    if (profilePage && profileHeader) {
        let lastY = profilePage.scrollTop || 0;
        let lastTs = performance.now();
        let state = profileHeader.classList.contains('collapsed') ? 'collapsed' : 'expanded';
        let pending = false;
        const DISPLACEMENT_THRESHOLD = 32; // px
        const VELOCITY_THRESHOLD = 0.6; // px/ms

        const applyState = (next) => {
            if (next === state) return;
            state = next;
            if (state === 'collapsed') {
                profileHeader.classList.add('collapsed');
            } else {
                profileHeader.classList.remove('collapsed');
            }
        };

        const onScroll = () => {
            const now = performance.now();
            const y = profilePage.scrollTop;
            const dy = y - lastY;
            const dt = Math.max(1, now - lastTs);
            const v = dy / dt; // px/ms
            const directionDown = dy > 0;

            if (!pending) {
                pending = true;
                window.requestAnimationFrame(() => {
                    // 只有当位移或速度超过阈值时才切换，避免抖动
                    if (directionDown) {
                        if ((y > DISPLACEMENT_THRESHOLD && Math.abs(v) >= VELOCITY_THRESHOLD) || y > 80) {
                            applyState('collapsed');
                        }
                    } else {
                        if ((Math.abs(dy) > DISPLACEMENT_THRESHOLD || Math.abs(v) >= VELOCITY_THRESHOLD) || y <= 10) {
                            applyState('expanded');
                        }
                    }
                    lastY = y;
                    lastTs = now;
                    pending = false;
                });
            } else {
                lastY = y;
                lastTs = now;
            }
        };

        profilePage.addEventListener('scroll', onScroll, { passive: true });

        // 松手/停止滚动后的吸附（简化：基于位置阈值）
        let snapTimer;
        profilePage.addEventListener('scroll', () => {
            clearTimeout(snapTimer);
            snapTimer = setTimeout(() => {
                const y = profilePage.scrollTop;
                if (y < 40) {
                    applyState('expanded');
                } else if (y > 80) {
                    applyState('collapsed');
                }
            }, 120);
        }, { passive: true });
    }
    
    // 为每个菜单项添加点击事件
    profileMenuItems.forEach((item) => {
        item.addEventListener('click', async () => {
            const targetPage = item.getAttribute('data-page');
            const page = document.getElementById(`${targetPage}-page`);
            
            if (page) {
                // 如果是编辑资料页面，先加载用户数据再切换页面
                if (targetPage === 'edit-profile') {
                    await loadUserProfileData();
                }
                
                // 隐藏主页面
                document.getElementById('profile-page').classList.remove('active');
                
                // 显示目标子页面
                page.classList.add('active');
                
                // 确保二级页面标题居中
                centerSubPageTitle(page);
                
                // 如果是About页面，重新应用样式
                if (targetPage === 'about') {
                    setTimeout(() => {
                        fixSubPagesLayout();
                        forceApplyAboutPageStyles();
                    }, 100);
                }
                
                // 确保页面内容在顶部
                page.scrollTop = 0;
                
                // 隐藏底部导航栏，并确保没有黑色边框
                const bottomNav = document.querySelector('.bottom-nav');
                bottomNav.style.display = 'none';
                bottomNav.style.borderTop = 'none';
            }
        });
    });
    
    // 为所有返回按钮添加点击事件
    backButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // 检查当前按钮是否在登录或注册页面
            const loginPage = document.getElementById('login-page');
            const registerPage = document.getElementById('register-page');
            const isInLoginPage = loginPage && loginPage.classList.contains('active');
            const isInRegisterPage = registerPage && registerPage.classList.contains('active');
            
            if (isInLoginPage || isInRegisterPage) {
                // 如果在登录或注册页面，隐藏这些页面但不跳转到个人中心
                if (isInLoginPage) {
                    loginPage.classList.remove('active');
                }
                if (isInRegisterPage) {
                    registerPage.classList.remove('active');
                }
                // 不做其他操作，让用户停留在当前状态
                return;
            }
            
            // 对于其他页面，执行原有的返回逻辑
            // 隐藏所有子页面
            subPages.forEach(page => {
                if (page) page.classList.remove('active');
            });
            
            // 显示个人中心主页面
            document.getElementById('profile-page').classList.add('active');
            
            // 显示底部导航栏，并确保没有内联样式覆盖
            const bottomNav = document.querySelector('.bottom-nav');
            bottomNav.style.display = 'flex';
            bottomNav.style.backgroundColor = '';
            bottomNav.style.borderTop = '';
        });
    });
    
    // 为保存按钮添加点击事件
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            // 检查是否在编辑资料页面
            const editProfilePage = document.getElementById('edit-profile-page');
            if (editProfilePage && editProfilePage.classList.contains('active')) {
                await handleSaveProfile();
            } else {
                // 其他页面只显示保存成功的提示
                showToast('保存成功', 'success');
            }
        });
    });
    
    // FAQ展开/收起功能
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            // 获取父元素
            const faqItem = question.closest('.faq-item');
            
            // 切换active类
            faqItem.classList.toggle('active');
            question.classList.toggle('active');
            
            // 获取回答元素
            const answer = faqItem.querySelector('.faq-answer');
            if (answer) {
                // 检查回答的当前显示状态
                if (answer.style.display === 'none' || !answer.style.display) {
                    answer.style.display = 'block';
                    question.querySelector('i').className = 'fas fa-chevron-up';
                } else {
                    answer.style.display = 'none';
                    question.querySelector('i').className = 'fas fa-chevron-down';
                }
            }
        });
    });
    
    // 会员选择按钮 - 移除toast提示
    const vipSelectButtons = document.querySelectorAll('.vip-select-btn');
    vipSelectButtons.forEach(btn => {
        // 清除之前的事件监听器
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // 不显示任何toast提示
        });
    });
    
    // 联系客服按钮 - 允许mailto链接正常工作
    const contactButtons = document.querySelectorAll('.contact-btn');
    contactButtons.forEach(btn => {
        // 清除之前的事件监听器
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // 不添加任何点击事件处理，让mailto链接正常工作
    });
    

    
    // 主题颜色选择 - 移除toast提示
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除所有active类
            colorOptions.forEach(o => o.classList.remove('active'));
            
            // 添加active类到当前选项
            option.classList.add('active');
            
            // 获取颜色
            const color = window.getComputedStyle(option).backgroundColor;
            
            // 不显示toast提示
        });
    });
    
    // 数据统计导出按钮 - 移除toast提示
    const statsExportButton = document.querySelector('.stats-action-btn:first-child');
    if (statsExportButton) {
        // 清除之前的事件监听器
        const newButton = statsExportButton.cloneNode(true);
        statsExportButton.parentNode.replaceChild(newButton, statsExportButton);
        
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            // 不显示任何toast提示
        });
    }
    
    // 数据统计分享按钮 - 移除toast提示
    const statsShareButton = document.querySelector('.stats-action-btn:last-child');
    if (statsShareButton) {
        // 清除之前的事件监听器
        const newButton = statsShareButton.cloneNode(true);
        statsShareButton.parentNode.replaceChild(newButton, statsShareButton);
        
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            // 不显示任何toast提示
        });
    }
    
    // 初始化时修复子页面布局
    fixSubPagesLayout();
    
    // 修复所有二级页面的标题居中
    fixSubPageTitles();
}

// 修复二级页面标题
function fixSubPageTitles() {
    const helpPage = document.getElementById('help-page');
    const aboutPage = document.getElementById('about-page');
    const statsPage = document.getElementById('statistics-page');
    
    // 帮助中心页面浅色模式文本颜色修复
    if (helpPage) {
        if (!document.body.classList.contains('dark-mode')) {
            const faqItems = helpPage.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                item.style.color = 'var(--primary-color)';
                
                const question = item.querySelector('.faq-question');
                if (question) {
                    question.style.color = 'var(--primary-color)';
                    question.style.fontWeight = '600';
                }
                
                const answer = item.querySelector('.faq-answer');
                if (answer) {
                    answer.style.color = 'var(--primary-color)';
                    answer.style.fontWeight = '500';
                }
            });
            
            const contactSection = helpPage.querySelector('.contact-section');
            if (contactSection) {
                const texts = contactSection.querySelectorAll('h4, p');
                texts.forEach(text => {
                    text.style.color = 'var(--primary-color)';
                    if (text.tagName === 'H4') {
                        text.style.fontWeight = '600';
                    } else {
                        text.style.fontWeight = '500';
                    }
                });
            }
        }
    }
    
    // 关于我们页面浅色模式文本颜色修复
    if (aboutPage) {
        if (!document.body.classList.contains('dark-mode')) {
            const appInfo = aboutPage.querySelector('.app-info');
            if (appInfo) {
                const appDescription = appInfo.querySelector('.app-description');
                if (appDescription) {
                    appDescription.style.color = 'var(--primary-color)';
                    appDescription.style.fontWeight = '500';
                }
            }
            
            const sections = aboutPage.querySelectorAll('.team-section, .mission-section, .social-section');
            sections.forEach(section => {
                const texts = section.querySelectorAll('p, h4');
                texts.forEach(text => {
                    text.style.color = 'var(--primary-color)';
                    if (text.tagName === 'H4') {
                        text.style.fontWeight = '600';
                    } else {
                        text.style.fontWeight = '500';
                    }
                });
            });
            
            const copyright = aboutPage.querySelector('.copyright');
            if (copyright) {
                copyright.style.color = 'var(--primary-color)';
                copyright.style.fontWeight = '500';
            }
        }
    }
    
    // 数据统计页面图标颜色修复
    if (statsPage) {
        if (!document.body.classList.contains('dark-mode')) {
            const statsIcons = statsPage.querySelectorAll('.stats-feature i');
            statsIcons.forEach(icon => {
                icon.style.color = 'var(--primary-color)';
            });
        }
    }
}

// 修复子页面标题居中
function centerSubPageTitle(page) {
    if (!page) return;
    
    // 找到页面标题元素
    const titleElement = page.querySelector('.page-title');
    if (titleElement) {
        // 确保标题居中
        titleElement.style.textAlign = 'center';
    }
}

// 强制应用About页面样式
function forceApplyAboutPageStyles() {
    const aboutPage = document.getElementById('about-page');
    if (!aboutPage) return;
    
    const aboutContactSection = aboutPage.querySelector('.contact-section');
    if (aboutContactSection) {
        // 强制清除所有可能的内联样式
        aboutContactSection.removeAttribute('style');
        
        // 重新应用样式
        setTimeout(() => {
            aboutContactSection.style.cssText = `
                background-color: rgba(255, 255, 255, 0.3) !important;
                border: 1px solid rgba(255, 255, 255, 0.5) !important;
                backdrop-filter: blur(5px) !important;
                -webkit-backdrop-filter: blur(5px) !important;
                border-radius: var(--border-radius) !important;
                padding: 20px !important;
                margin-bottom: 20px !important;
                box-shadow: var(--shadow-sm) !important;
                text-align: center !important;
            `;
            
            // 如果是暗黑模式，覆盖样式
            if (document.body.classList.contains('dark-mode')) {
                aboutContactSection.style.cssText = `
                    background-color: #2c2c2c !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
                    border-radius: var(--border-radius) !important;
                    padding: 20px !important;
                    margin-bottom: 20px !important;
                    text-align: center !important;
                `;
            }
        }, 50);
    }
}

// 修复子页面布局问题
function fixSubPagesLayout() {
    // 修复会员页面
    const vipPage = document.getElementById('vip-page');
    if (vipPage) {
        // 确保标题居中
        const vipTitle = vipPage.querySelector('.page-title');
        if (vipTitle) {
            vipTitle.style.textAlign = 'center';
            vipTitle.style.flex = '1';
        }
        
        // 修复会员计划卡片布局
        const vipPlanCards = vipPage.querySelectorAll('.vip-plan-card');
        vipPlanCards.forEach(card => {
            // 确保卡片有适当的样式
            card.style.boxShadow = 'var(--shadow)';
            card.style.borderRadius = 'var(--border-radius)';
            card.style.padding = '20px';
            card.style.marginBottom = '15px';
            
            // 给推荐卡片添加突出显示
            if (card.classList.contains('recommended')) {
                card.style.border = '2px solid var(--primary-color)';
                card.style.boxShadow = '0 8px 24px rgba(255, 62, 121, 0.2)';
            }
        });
        
        // 确保选择按钮样式
        const selectButtons = vipPage.querySelectorAll('.vip-select-btn');
        selectButtons.forEach(btn => {
            btn.style.width = '100%';
            btn.style.padding = '10px';
            btn.style.borderRadius = '20px';
            btn.style.background = 'var(--gradient-primary)';
            btn.style.color = 'white';
            btn.style.fontWeight = '500';
            btn.style.cursor = 'pointer';
        });
    }
    
    // 修复帮助中心页面
    const helpPage = document.getElementById('help-page');
    if (helpPage) {
        // 确保标题居中
        const helpTitle = helpPage.querySelector('.page-title');
        if (helpTitle) {
            helpTitle.style.textAlign = 'center';
            helpTitle.style.flex = '1';
        }
        
        // 修复FAQ布局
        const faqSection = helpPage.querySelector('.faq-section');
        if (faqSection) {
            faqSection.style.marginBottom = '30px';
            faqSection.style.padding = '0 5px';
            faqSection.style.display = 'flex';
            faqSection.style.flexDirection = 'column';
            faqSection.style.gap = '15px';
        }
        
        const faqItems = helpPage.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            // 设置FAQ项样式
            item.style.marginBottom = '15px';
            item.style.borderRadius = 'var(--border-radius)';
            item.style.boxShadow = 'var(--shadow-sm)';
            item.style.overflow = 'hidden';
            
            // 根据模式设置背景和边框
            if (document.body.classList.contains('dark-mode')) {
                item.style.backgroundColor = '#2c2c2c';
                item.style.border = '1px solid rgba(255,255,255,0.1)';
                item.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            } else {
                // 浅色模式下使用透明背景，避免黑色区域
                item.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                item.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                item.style.backdropFilter = 'blur(5px)';
                item.style.webkitBackdropFilter = 'blur(5px)';
            }
            
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.style.padding = '15px';
                answer.style.fontSize = '14px';
                answer.style.lineHeight = '1.6';
                answer.style.display = 'none'; // 默认隐藏回答
                
                // 根据模式设置背景
                if (document.body.classList.contains('dark-mode')) {
                    answer.style.backgroundColor = 'rgba(255,255,255,0.05)';
                } else {
                    // 浅色模式下使用透明背景
                    answer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }
            }
            
            // 为问题添加点击事件来切换回答的显示状态
            const question = item.querySelector('.faq-question');
            if (question) {
                question.style.cursor = 'pointer';
                question.style.display = 'flex';
                question.style.justifyContent = 'space-between';
                question.style.alignItems = 'center';
                question.style.padding = '15px';
                question.style.borderBottom = '1px solid var(--border-color)';
                
                // 根据模式设置背景和颜色
                if (document.body.classList.contains('dark-mode')) {
                    question.style.backgroundColor = '#2c2c2c';
                    question.style.borderColor = 'rgba(255,255,255,0.1)';
                    question.style.color = '#f1f1f1';
                } else {
                    // 浅色模式下使用透明背景
                    question.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                    question.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    question.style.color = 'var(--text-color)';
                }
                
                // 清除之前的事件监听器
                const newQuestion = question.cloneNode(true);
                question.parentNode.replaceChild(newQuestion, question);
                
                newQuestion.addEventListener('click', () => {
                    if (answer.style.display === 'none') {
                        answer.style.display = 'block';
                        newQuestion.querySelector('i').className = 'fas fa-chevron-up';
                    } else {
                        answer.style.display = 'none';
                        newQuestion.querySelector('i').className = 'fas fa-chevron-down';
                    }
                });
            }
        });
        
        // 美化搜索框
        const searchBox = helpPage.querySelector('.search-box');
        if (searchBox) {
            searchBox.style.position = 'relative';
            searchBox.style.marginBottom = '25px';
            
            const searchInput = searchBox.querySelector('input');
            if (searchInput) {
                searchInput.style.width = '100%';
                searchInput.style.padding = '12px 15px 12px 40px';
                searchInput.style.borderRadius = '25px';
                searchInput.style.border = '1px solid var(--border-color)';
                searchInput.style.fontSize = '14px';
                
                // 暗黑模式适配
                if (document.body.classList.contains('dark-mode')) {
                    searchInput.style.backgroundColor = '#2c2c2c';
                    searchInput.style.borderColor = 'rgba(255,255,255,0.1)';
                    searchInput.style.color = '#f1f1f1';
                }
            }
            
            const searchIcon = searchBox.querySelector('i');
            if (searchIcon) {
                searchIcon.style.position = 'absolute';
                searchIcon.style.left = '15px';
                searchIcon.style.top = '50%';
                searchIcon.style.transform = 'translateY(-50%)';
                searchIcon.style.color = 'var(--text-light)';
            }
        }
        
        // 美化联系客服区域
        const contactSection = helpPage.querySelector('.contact-section');
        if (contactSection) {
            contactSection.style.borderRadius = 'var(--border-radius)';
            contactSection.style.padding = '20px';
            contactSection.style.marginTop = '25px';
            contactSection.style.boxShadow = 'var(--shadow)';
            contactSection.style.textAlign = 'center';
            
            // 根据模式设置背景和边框
            if (document.body.classList.contains('dark-mode')) {
                contactSection.style.backgroundColor = '#2c2c2c';
                contactSection.style.border = '1px solid rgba(255,255,255,0.1)';
                contactSection.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                
                // 确保文本颜色正确
                const headings = contactSection.querySelectorAll('h4, p');
                headings.forEach(heading => {
                    heading.style.color = '#f1f1f1';
                });
            } else {
                // 浅色模式下使用透明背景
                contactSection.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                contactSection.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                contactSection.style.backdropFilter = 'blur(5px)';
                contactSection.style.webkitBackdropFilter = 'blur(5px)';
            }
            
            // 美化联系按钮
            const contactButtons = contactSection.querySelectorAll('.contact-btn');
            contactButtons.forEach(btn => {
                btn.style.backgroundColor = 'var(--primary-color)';
                btn.style.color = 'white';
                btn.style.padding = '12px';
                btn.style.borderRadius = 'var(--border-radius)';
                btn.style.display = 'flex';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'center';
                btn.style.gap = '8px';
                btn.style.textDecoration = 'none';
                btn.style.boxShadow = '0 4px 8px rgba(255, 62, 121, 0.2)';
            });
        }
    }
    
    // 修复关于我们页面
    const aboutPage = document.getElementById('about-page');
    if (aboutPage) {
        // 确保标题居中
        const aboutTitle = aboutPage.querySelector('.page-title');
        if (aboutTitle) {
            aboutTitle.style.textAlign = 'center';
            aboutTitle.style.flex = '1';
        }
        
        // 美化应用信息区域
        const appInfo = aboutPage.querySelector('.app-info');
        if (appInfo) {
            // 创建背景卡片样式
            appInfo.style.textAlign = 'center';
            appInfo.style.marginBottom = '30px';
            appInfo.style.borderRadius = 'var(--border-radius)';
            appInfo.style.padding = '30px 20px';
            appInfo.style.boxShadow = 'var(--shadow)';
            
            // 根据模式设置背景和边框
            if (document.body.classList.contains('dark-mode')) {
                appInfo.style.backgroundColor = '#2c2c2c';
                appInfo.style.border = '1px solid rgba(255,255,255,0.1)';
                appInfo.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            } else {
                // 浅色模式下使用透明背景
                appInfo.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                appInfo.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                appInfo.style.backdropFilter = 'blur(5px)';
                appInfo.style.webkitBackdropFilter = 'blur(5px)';
            }
            
            const appLogo = appInfo.querySelector('.app-logo');
            if (appLogo) {
                appLogo.style.marginBottom = '15px';
                
                // 美化应用logo图标
                const logoIcon = appLogo.querySelector('i');
                if (logoIcon) {
                    logoIcon.style.fontSize = '50px';
                    logoIcon.style.color = 'var(--primary-color)';
                    logoIcon.style.display = 'block';
                    logoIcon.style.marginBottom = '10px';
                }
                
                // 美化应用名称
                const logoTitle = appLogo.querySelector('h2');
                if (logoTitle) {
                    logoTitle.style.fontSize = '24px';
                    logoTitle.style.fontWeight = '700';
                    logoTitle.style.margin = '0';
                }
            }
            
            const appVersion = appInfo.querySelector('.app-version');
            if (appVersion) {
                appVersion.style.color = 'var(--text-light)';
                appVersion.style.fontSize = '14px';
                appVersion.style.marginBottom = '20px';
                appVersion.style.padding = '4px 12px';
                appVersion.style.backgroundColor = 'rgba(0,0,0,0.05)';
                appVersion.style.borderRadius = '12px';
                appVersion.style.display = 'inline-block';
                
                // 暗黑模式适配
                if (document.body.classList.contains('dark-mode')) {
                    appVersion.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
            }
            
            const appDescription = appInfo.querySelector('.app-description');
            if (appDescription) {
                appDescription.style.lineHeight = '1.6';
                appDescription.style.fontSize = '15px';
                appDescription.style.margin = '0';
                appDescription.style.padding = '0 15px';
            }
        }
        
        // 美化团队和使命部分
        const sections = aboutPage.querySelectorAll('.team-section, .mission-section');
        sections.forEach(section => {
            // 创建卡片样式
            section.style.borderRadius = 'var(--border-radius)';
            section.style.padding = '20px';
            section.style.marginBottom = '20px';
            section.style.boxShadow = 'var(--shadow-sm)';
            
            // 根据模式设置背景和边框
            if (document.body.classList.contains('dark-mode')) {
                section.style.backgroundColor = '#2c2c2c';
                section.style.border = '1px solid rgba(255,255,255,0.1)';
                section.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            } else {
                // 浅色模式下使用透明背景
                section.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                section.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                section.style.backdropFilter = 'blur(5px)';
                section.style.webkitBackdropFilter = 'blur(5px)';
            }
            
            const title = section.querySelector('h4');
            if (title) {
                title.style.fontSize = '18px';
                title.style.marginBottom = '15px';
                title.style.color = 'var(--primary-color)';
                title.style.position = 'relative';
                title.style.paddingBottom = '10px';
                title.style.borderBottom = '2px solid var(--primary-color)';
                title.style.display = 'inline-block';
            }
            
            const content = section.querySelector('p');
            if (content) {
                content.style.lineHeight = '1.7';
                content.style.fontSize = '15px';
                content.style.margin = '0';
            }
        });
        
        // 美化联系我们区域
        const aboutContactSection = aboutPage.querySelector('.contact-section');
        if (aboutContactSection) {
            aboutContactSection.style.borderRadius = 'var(--border-radius)';
            aboutContactSection.style.padding = '20px';
            aboutContactSection.style.marginBottom = '20px';
            aboutContactSection.style.boxShadow = 'var(--shadow-sm)';
            aboutContactSection.style.textAlign = 'center';
            
            // 根据模式设置背景和边框
            if (document.body.classList.contains('dark-mode')) {
                aboutContactSection.style.backgroundColor = '#2c2c2c';
                aboutContactSection.style.border = '1px solid rgba(255,255,255,0.1)';
                aboutContactSection.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            } else {
                // 浅色模式下使用透明背景
                aboutContactSection.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                aboutContactSection.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                aboutContactSection.style.backdropFilter = 'blur(5px)';
                aboutContactSection.style.webkitBackdropFilter = 'blur(5px)';
            }
            
            const title = aboutContactSection.querySelector('h4');
            if (title) {
                title.style.fontSize = '18px';
                title.style.marginBottom = '15px';
                title.style.color = 'var(--primary-color)';
                title.style.display = 'inline-block';
            }
            
            // 美化联系按钮
            const contactButtons = aboutContactSection.querySelectorAll('.contact-btn');
            contactButtons.forEach(btn => {
                btn.style.backgroundColor = 'var(--primary-color)';
                btn.style.color = 'white';
                btn.style.padding = '12px';
                btn.style.borderRadius = 'var(--border-radius)';
                btn.style.display = 'flex';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'center';
                btn.style.gap = '8px';
                btn.style.textDecoration = 'none';
                btn.style.boxShadow = '0 4px 8px rgba(255, 62, 121, 0.2)';
            });
        }
        

        
        // 美化条款区域
        const termsSection = aboutPage.querySelector('.terms-section');
        if (termsSection) {
            termsSection.style.display = 'flex';
            termsSection.style.justifyContent = 'center';
            termsSection.style.gap = '20px';
            termsSection.style.margin = '20px 0';
            termsSection.style.padding = '15px 0';
            termsSection.style.borderTop = '1px solid var(--border-color)';
            termsSection.style.borderBottom = '1px solid var(--border-color)';
            
            // 暗黑模式适配
            if (document.body.classList.contains('dark-mode')) {
                termsSection.style.borderColor = 'rgba(255,255,255,0.1)';
            }
            
            const links = termsSection.querySelectorAll('a');
            links.forEach(link => {
                link.style.color = 'var(--primary-color)';
                link.style.textDecoration = 'none';
                link.style.fontSize = '15px';
                link.style.fontWeight = '500';
                link.style.padding = '5px 15px';
                link.style.borderRadius = '15px';
                link.style.backgroundColor = 'rgba(255, 62, 121, 0.1)';
                
                // 暗黑模式适配
                if (document.body.classList.contains('dark-mode')) {
                    link.style.backgroundColor = 'rgba(255, 62, 121, 0.2)';
                }
            });
        }
        
        // 美化版权信息
        const copyright = aboutPage.querySelector('.copyright');
        if (copyright) {
            copyright.style.textAlign = 'center';
            copyright.style.fontSize = '12px';
            copyright.style.color = 'var(--text-light)';
            copyright.style.marginTop = '20px';
            copyright.style.padding = '10px 0';
        }
    }
}

// 初始化首页大卡片轮播功能
function initHeroCarousel() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const paginationDots = document.querySelectorAll('.carousel-pagination .pagination-dot');
    const paginationContainer = document.querySelector('.carousel-pagination');
    
    if (!heroSlides.length) return;
    
    console.log("初始化轮播，找到 " + heroSlides.length + " 个幻灯片");
    
    let currentIndex = 0;
    const slideCount = heroSlides.length;
    let autoSlideInterval;
    let lastScrollPosition = 0;
    let scrollDirection = 'none';
    
    // 强制显示第一个幻灯片
    if (heroSlides[0]) {
        heroSlides[0].classList.add('active');
        console.log("初始激活第一个幻灯片");
    }
    
    // 设置激活状态
    function setActiveSlide(index) {
        // 确保索引在有效范围内
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;
        
        currentIndex = index;
        console.log("切换到幻灯片: " + currentIndex);
        
        // 更新幻灯片状态
        heroSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === currentIndex) {
                slide.classList.add('active');
            }
        });
        
        // 更新分页点状态
        paginationDots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === currentIndex) {
                dot.classList.add('active');
            }
        });
    }
    
    // 下一张幻灯片
    function nextSlide() {
        setActiveSlide(currentIndex + 1);
    }
    
    // 上一张幻灯片
    function prevSlide() {
        setActiveSlide(currentIndex - 1);
    }
    
    // 设置自动播放
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000); // 每5秒切换一次
    }
    
    // 停止自动播放
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    // 分页点点击事件
    paginationDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActiveSlide(index);
            // 点击后重置自动播放计时器
            startAutoSlide();
        });
    });
    
    // 添加触摸滑动支持
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            // 暂停自动播放
            stopAutoSlide();
        }, { passive: true });
        
        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            touchEndY = e.changedTouches[0].clientY;
            handleSwipe();
            // 恢复自动播放
            startAutoSlide();
        }, { passive: true });
        
        function handleSwipe() {
            const SWIPE_THRESHOLD = 50;
            const xDiff = touchStartX - touchEndX;
            const yDiff = touchStartY - touchEndY;
            
            // 只处理水平方向的滑动，忽略垂直方向
            if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > SWIPE_THRESHOLD) {
                if (xDiff > 0) {
                    // 向左滑动，下一张
                    nextSlide();
                } else {
                    // 向右滑动，上一张
                    prevSlide();
                }
            }
        }
    }
    
    // 添加页面滚动监听，隐藏/显示分页指示器
    if (paginationContainer) {
        // 获取首页内容区域，用于监听滚动
        const homePage = document.getElementById('home-page');
        
        if (homePage) {
            homePage.addEventListener('scroll', () => {
                const currentScrollPosition = homePage.scrollTop;
                
                // 判断滚动方向
                if (currentScrollPosition > lastScrollPosition) {
                    scrollDirection = 'down';
                } else if (currentScrollPosition < lastScrollPosition) {
                    scrollDirection = 'up';
                }
                
                // 根据滚动方向隐藏或显示分页指示器
                if (scrollDirection === 'down') {
                    paginationContainer.classList.add('hidden');
                } else if (scrollDirection === 'up') {
                    paginationContainer.classList.remove('hidden');
                }
                
                // 更新上次滚动位置
                lastScrollPosition = currentScrollPosition;
            });
        }
    }
    
    // 开始自动播放
    startAutoSlide();
    
    // 当用户离开页面时暂停自动播放，返回时恢复
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });
}

// 初始化场景卡片滑动功能
function initScenarioSlider() {
    const scenariosContainer = document.querySelector('.scenarios-container');
    const scenarioCards = document.querySelectorAll('.scenario-card');
    const indicatorDots = document.querySelectorAll('.indicator-dot');
    const prevBtn = document.querySelector('.scenario-nav-btn.prev-btn');
    const nextBtn = document.querySelector('.scenario-nav-btn.next-btn');
    const indicatorsContainer = document.querySelector('.scenario-indicators');
    
    if (!scenariosContainer || scenarioCards.length === 0) return;
    
    let currentIndex = 0;
    const cardCount = scenarioCards.length;
    let lastScrollPosition = 0;
    let scrollDirection = 'none';
    
    // 设置活动状态
    function setActiveCard(index) {
        // 确保索引在范围内
        if (index < 0) index = 0;
        if (index >= cardCount) index = cardCount - 1;
        
        currentIndex = index;
        
        // 使用requestAnimationFrame确保DOM更新的流畅性
        requestAnimationFrame(() => {
            // 更新卡片状态
            scenarioCards.forEach((card, i) => {
                if (i === currentIndex) {
                    card.classList.add('active-scenario');
                } else {
                    card.classList.remove('active-scenario');
                }
            });
            
            // 更新指示器状态
            indicatorDots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        });
        
        // 使用smooth scrolling，但避免在已经滚动时重复触发
        if (!isScrolling) {
            scenarioCards[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    // 滚动监听 - 使用防抖优化性能
    let isScrolling = false;
    let scrollTimeout;
    let rafId = null;
    
    function handleScroll() {
        // 取消之前的requestAnimationFrame和timeout
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        clearTimeout(scrollTimeout);
        
        // 立即更新状态，不等待
        rafId = requestAnimationFrame(() => {
            // 使用getBoundingClientRect获取实时位置
            const containerRect = scenariosContainer.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;
            
            let closestCardIndex = 0;
            let minDistance = Infinity;
            
            scenarioCards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - containerCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCardIndex = index;
                }
            });
            
            // 立即更新活动卡片，不等待防抖
            if (closestCardIndex !== currentIndex) {
                currentIndex = closestCardIndex;
                
                // 直接更新类名，不使用setActiveCard避免嵌套的requestAnimationFrame
                scenarioCards.forEach((card, i) => {
                    if (i === currentIndex) {
                        card.classList.add('active-scenario');
                    } else {
                        card.classList.remove('active-scenario');
                    }
                });
                
                // 更新指示器
                indicatorDots.forEach((dot, i) => {
                    if (i === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
        
        // 设置滚动结束标志
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 100);
    }
    
    // 使用passive: true优化滚动性能
    scenariosContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // 按钮点击事件
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            setActiveCard(currentIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            setActiveCard(currentIndex + 1);
        });
    }
    
    // 指示器点击事件
    indicatorDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActiveCard(index);
        });
    });
    
    // 卡片点击事件
    scenarioCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            setActiveCard(index);
        });
    });
    
    // 场景卡片按钮点击事件
    const scenarioBtns = document.querySelectorAll('.scenario-btn');
    scenarioBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            
            // 获取所属场景
            const scenarioCard = btn.closest('.scenario-card');
            const scenarioType = scenarioCard.getAttribute('data-scenario');
            
            // 直接切换到聊天页面，不显示任何toast
            setTimeout(() => {
                document.querySelector('.tab-item[data-page="chat"]').click();
            }, 100);
        });
    });
    
    // 初始设置活动卡片
    setActiveCard(0);
    
    // 添加触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    scenariosContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    scenariosContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const SWIPE_THRESHOLD = 50;
        
        if (touchStartX - touchEndX > SWIPE_THRESHOLD) {
            // 向左滑动
            setActiveCard(currentIndex + 1);
        } else if (touchEndX - touchStartX > SWIPE_THRESHOLD) {
            // 向右滑动
            setActiveCard(currentIndex - 1);
        }
    }
    
    // 添加页面滚动监听，隐藏/显示指示器
    if (indicatorsContainer) {
        // 获取首页内容区域，用于监听滚动
        const homePage = document.getElementById('home-page');
        
        if (homePage) {
            homePage.addEventListener('scroll', () => {
                const currentScrollPosition = homePage.scrollTop;
                
                // 判断滚动方向
                if (currentScrollPosition > lastScrollPosition) {
                    scrollDirection = 'down';
                } else if (currentScrollPosition < lastScrollPosition) {
                    scrollDirection = 'up';
                }
                
                // 根据滚动方向隐藏或显示指示器
                if (scrollDirection === 'down') {
                    indicatorsContainer.classList.add('hidden');
                } else if (scrollDirection === 'up') {
                    indicatorsContainer.classList.remove('hidden');
                }
                
                // 更新上次滚动位置
                lastScrollPosition = currentScrollPosition;
            });
        }
    }
}
// 底部导航栏和页面切换
function initAppNavigation() {
    const tabItems = document.querySelectorAll('.tab-item');
    const appPages = document.querySelectorAll('.app-page');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // 获取目标页面
            const targetPageId = tab.getAttribute('data-page') + '-page';
            const targetPage = document.getElementById(targetPageId);
            
            // 更新底部导航状态
            tabItems.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新页面显示状态
            appPages.forEach(page => page.classList.remove('active'));
            targetPage.classList.add('active');
            
            // 更新页面标题
            updatePageTitle(tab.getAttribute('data-page'));
            
            // 如果是聊天页面，自动聚焦输入框
            if (targetPageId === 'chat-page') {
                const chatInput = document.querySelector('.chat-input-field');
                if (chatInput) {
                    setTimeout(() => chatInput.focus(), 300);
                }
            }
        });
    });
    
    // 首页功能项点击跳转
    const featureItems = document.querySelectorAll('.feature-item[data-feature]');
    featureItems.forEach(item => {
        item.addEventListener('click', () => {
            const feature = item.getAttribute('data-feature');
            
            // 主要功能导航 - 所有功能直接跳转到聊天页面，不显示toast
            // 切换到聊天页面
            tabItems.forEach(tab => tab.classList.remove('active'));
            document.querySelector('.tab-item[data-page="chat"]').classList.add('active');
            
            appPages.forEach(page => page.classList.remove('active'));
            document.getElementById('chat-page').classList.add('active');
        });
    });
}// 显示Toast消息
function showToast(message, type = 'info') {
    // 立即关闭已有toast - 修复二级页面点击产生多个toast问题
    const existingToasts = document.querySelectorAll('.app-toast');
    existingToasts.forEach(toast => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    });
    
    const toast = document.createElement('div');
    toast.className = `app-toast ${type}-toast`;
    toast.textContent = message;
    
    // 添加样式
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: type === 'success' ? '#ff3e79' : // 使用主色调代替绿色
                         type === 'error' ? '#f44336' : 
                         type === 'warning' ? '#ff9800' : '#6c5ce7',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '1000',
        fontSize: '14px',
        fontWeight: '500',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2000); // 缩短显示时间，避免toast堆积
}

// 聊天功能初始化
function initChatFeature() {
    console.log('Initializing chat feature...');
    if (window.chatSessionManager) return; // 防止重复初始化
    
    const chatInput = document.querySelector('.chat-input-field');
    const sendButton = document.querySelector('.chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    
    // 创建简单的会话管理器
    window.chatSessionManager = {
        currentSessionId: 'new-chat',
        sessions: {},
        
        addMessage: function(sessionId, sender, content) {
            if (!this.sessions[sessionId]) {
                this.sessions[sessionId] = [];
            }
            this.sessions[sessionId].push({
                sender: sender,
                content: content,
                timestamp: Date.now()
            });
        },
        
        addMessageToUI: function(sender, content) {
            console.log('Adding message to UI:', sender, content);
            
            const chatMessagesContainer = document.getElementById('chat-messages');
            console.log('Chat messages container found:', chatMessagesContainer);
            
            if (!chatMessagesContainer) {
                console.error('Chat messages container not found!');
                return;
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            
            let avatarHTML = '';
            if (sender === 'ai') {
                avatarHTML = `
                    <div class="message-avatar ai">
                        <i class="fas fa-robot"></i>
                    </div>
                `;
            } else if (sender === 'partner') {
                avatarHTML = `
                    <div class="message-avatar partner">
                        <i class="fas fa-heart" style="font-size: 20px; color: #ff6b9d;"></i>
                    </div>
                `;
            } else {
                avatarHTML = `
                    <div class="message-avatar">
                        <i class="fas fa-user" style="font-size: 20px; color: #aaa;"></i>
                    </div>
                `;
            }
            
            messageDiv.innerHTML = `
                ${avatarHTML}
                <div class="message-content">
                    <p>${content}</p>
                </div>
            `;
            
            messageDiv.style.marginBottom = "5px";
            
            console.log('Appending message div to container');
            chatMessagesContainer.appendChild(messageDiv);
            
            // 优化滚动逻辑，减少跳变
            if (window.scrollToBottom) {
                window.scrollToBottom();
            }
            
            console.log('Message added successfully, container now has', chatMessagesContainer.children.length, 'children');
            
            // 更新会话预览
            if (window.updateSessionPreview) {
                window.updateSessionPreview(content);
            }
        },
        
        showTypingIndicator: function() {
            if (window.showTypingIndicator) {
                window.showTypingIndicator();
            }
        },
        
        removeTypingIndicator: function() {
            if (window.removeTypingIndicator) {
                window.removeTypingIndicator();
            }
        }
    };
    
    console.log('Send button found:', sendButton);
    console.log('Chat input found:', chatInput);
    
    if (!sendButton || !chatInput) {
        console.log('Send button or chat input not found, retrying...');
        setTimeout(() => {
            initChatFeature();
        }, 1000);
        return;
    }
    
    // 发送消息 - 暴露为全局函数
    window.sendMessage = function sendMessage() {
        console.log('Send message function called');
        const message = chatInput.value.trim();
        console.log('Message to send:', message);
        if (!message) {
            console.log('Empty message, returning');
            return;
        }
        
        // 获取当前会话ID
        let currentSessionId = 'new-chat';
        if (window.chatSessionManager && window.chatSessionManager.currentSessionId) {
            currentSessionId = window.chatSessionManager.currentSessionId;
        }
        console.log('Current session ID:', currentSessionId);
        
        // 如果是"新对话"，自动创建新会话
        if (currentSessionId === 'new-chat') {
            console.log('*** 检测到新对话，自动创建新会话 ***');
            
            // 生成会话名称
            let sessionName = message.length > 15 ? message.substring(0, 15) + '...' : message;
            console.log('生成会话名称:', sessionName);
            
            // 使用现有的createSessionWithName函数创建新会话
            if (window.createSessionWithName) {
                const newSessionId = window.createSessionWithName(sessionName, '普通', true);
                console.log('创建新会话ID:', newSessionId);
                
                // 直接在新会话中发送消息
                if (window.chatSessionManager) {
                    window.chatSessionManager.addMessage(newSessionId, 'user', message);
                    window.chatSessionManager.addMessageToUI('user', message);
                } else {
                    addMessage('user', message);
                }
                
                // 继续处理AI回复
                continueWithAIReply(message, newSessionId);
                
                // 清空输入框
                chatInput.value = '';
                return;
            }
        }
        
        // 添加用户消息到会话和UI
        if (window.chatSessionManager) {
            window.chatSessionManager.addMessage(currentSessionId, 'user', message);
            window.chatSessionManager.addMessageToUI('user', message);
        } else {
            // 备用方案
            addMessage('user', message);
        }
        
        // 清空输入框
        chatInput.value = '';
        
        // 继续处理AI回复
        continueWithAIReply(message, currentSessionId);
    };
    
    // 处理AI回复的函数
    function continueWithAIReply(message, sessionId) {
        console.log('Processing AI reply for message:', message, 'in session:', sessionId);
        
        // 设置AI回复状态并切换按钮
        window.isAIReplying = true;
        toggleSendButtonState(true);
        
        // 异步处理AI回复
        generateAIReply(message).then(aiReply => {
            // 添加AI消息到会话数据
            if (window.chatSessionManager) {
                window.chatSessionManager.addMessage(sessionId, 'ai', aiReply);
            }
            
            // 先创建AI消息容器
             const aiMessageDiv = addMessage('ai', '', true);
             
             // 立即开始打字效果，不需要准备状态
             startTypingEffect(aiReply, sessionId, aiMessageDiv);
            
        }).catch(error => {
            console.error('AI回复生成失败:', error);
            
            // 恢复发送按钮状态
            window.isAIReplying = false;
            toggleSendButtonState(false);
            
            const errorMessage = `抱歉，AI服务当前不可用，请稍后再试。`;
            if (window.chatSessionManager) {
                window.chatSessionManager.addMessage(sessionId, 'ai', errorMessage);
                window.chatSessionManager.addMessageToUI('ai', errorMessage);
            } else {
                addMessage('ai', errorMessage);
            }
        });
    }

    // 添加全局变量跟踪AI回复状态
    window.isAIReplying = false;
    
    // 切换发送按钮状态的函数
    function toggleSendButtonState(isReplying) {
        const sendIcon = sendButton.querySelector('i');
        if (isReplying) {
            // 切换为停止图标
            sendIcon.className = 'fas fa-stop';
            sendButton.setAttribute('data-state', 'stop');
        } else {
            // 切换为发送图标
            sendIcon.className = 'fas fa-paper-plane';
            sendButton.setAttribute('data-state', 'send');
        }
    }
    
    // 停止AI回复的函数
    function stopAIReply() {
        window.isAIReplying = false;
        toggleSendButtonState(false);
        
        // AI过渡页面已移除
        
        // 停止当前的打字效果
        if (window.currentTypingEffect) {
            clearTimeout(window.currentTypingEffect);
            window.currentTypingEffect = null;
        }
        
        // 移除正在打字的光标
        const typingCursors = document.querySelectorAll('.typing-cursor');
        typingCursors.forEach(cursor => cursor.remove());
        
        // 添加停止消息
        const stopMessage = window.i18n ? window.i18n.t('ai.reply.stopped') : '回复已停止。';
        if (window.chatSessionManager) {
            const currentSessionId = window.chatSessionManager.currentSessionId || 'new-chat';
            window.chatSessionManager.addMessage(currentSessionId, 'ai', stopMessage);
            window.chatSessionManager.addMessageToUI('ai', stopMessage);
        } else {
            addMessage('ai', stopMessage);
        }
    }
    
    // 绑定发送消息事件
    console.log('Binding send button click event...');
    sendButton.addEventListener('click', function(e) {
        console.log('Send button clicked!');
        e.preventDefault();
        
        // 检查当前按钮状态
        const currentState = sendButton.getAttribute('data-state') || 'send';
        
        if (currentState === 'stop' && window.isAIReplying) {
            // 如果是停止状态且AI正在回复，则停止AI回复
            stopAIReply();
        } else {
            // 否则发送消息
            sendMessage();
        }
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    console.log('Chat feature initialized successfully');
    
    // 添加消息到聊天界面（备用方案，现在应该使用 chatSessionManager.addMessageToUI）
    function addMessage(sender, text, isTyping = false) {
        const chatMessagesContainer = document.getElementById('chat-messages');
        if (!chatMessagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        let avatarHTML = '';
        if (sender === 'ai') {
            avatarHTML = `
                <div class="message-avatar ai">
                    <i class="fas fa-robot"></i>
                </div>
            `;
        } else {
            avatarHTML = `
                <div class="message-avatar">
                    <i class="fas fa-user" style="font-size: 20px; color: #aaa;"></i>
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            ${avatarHTML}
            <div class="message-content">
                <p class="${isTyping ? 'typing-text' : ''}">${text}</p>
            </div>
        `;
        
        // 如果是打字效果，添加特殊标识
        if (isTyping && sender === 'ai') {
            messageDiv.setAttribute('data-typing', 'true');
        }
        
        // 更新会话预览（副标题）
        if (window.updateSessionPreview && text) {
            window.updateSessionPreview(text);
        }
        
        // 确保消息有足够的间距
        messageDiv.style.marginBottom = "5px";
        
        chatMessagesContainer.appendChild(messageDiv);
        
        // 滚动到底部
        if (window.scrollToBottom) {
            window.scrollToBottom();
        } else {
            // 调整滚动位置，留出适当的底部空间
        const targetScrollTop = chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight - 50;
        chatMessagesContainer.scrollTop = Math.max(0, targetScrollTop);
        }
        
        return messageDiv;
    }
    
    // 显示AI正在输入的指示器
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message ai-message typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar ai">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p><span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span></p>
            </div>
        `;
        
        chatMessages.appendChild(indicator);
        
        // 滚动到底部显示输入指示器
        scrollToBottom();
    }
    
    // 移除输入指示器
    function removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // 生成AI回复 - 使用AI服务
    async function generateAIReply(userMessage) {
        try {
            // 检查是否有AI服务可用
            if (window.aiService) {
                console.log('开始生成AI回复，用户消息:', userMessage);
                
                // 确保AI服务已初始化
                await window.aiService.initializeConfig();
                console.log('AI服务配置初始化完成');
                
                // 调用AI服务生成回复
                const response = await window.aiService.generateChatReply(userMessage, '');
                console.log('AI服务响应:', response);
                
                // 检查响应是否为错误消息
                if (typeof response === 'string' && response.includes('抱歉，AI服务当前不可用')) {
                    console.error('AI服务返回错误消息:', response);
                    return response;
                }
                
                // 使用AI服务的格式化方法来处理响应
                if (response) {
                    // 检查响应是否包含content字段（后台返回格式）
                    let contentToProcess = response;
                    if (response.content) {
                        contentToProcess = response.content;
                        console.log('从response.content提取内容:', contentToProcess);
                    }
                    
                    // 如果AI服务有parseAIResponse方法，使用它来格式化响应
                    if (window.aiService.parseAIResponse) {
                        return window.aiService.parseAIResponse(typeof contentToProcess === 'string' ? contentToProcess : JSON.stringify(contentToProcess));
                    }
                    
                    // 如果响应是字符串，尝试解析JSON
                    if (typeof contentToProcess === 'string') {
                        try {
                            const parsed = JSON.parse(contentToProcess);
                            if (parsed.reply) {
                                return parsed.reply;
                            }
                            return contentToProcess;
                        } catch (e) {
                            return contentToProcess;
                        }
                    }
                    
                    // 如果是对象，尝试格式化
                    if (typeof contentToProcess === 'object') {
                        if (contentToProcess.reply) {
                            return contentToProcess.reply;
                        }
                        return formatAIResponse(contentToProcess);
                    }
                }
                
                return '收到了空的AI响应';
            } else {
                console.error('window.aiService 不存在');
            }
        } catch (error) {
            console.error('AI回复生成错误:', error);
            return `AI服务调用失败: ${error.message}`;
        }
        
        // 如果AI服务失败，返回错误信息
        return '抱歉，AI服务当前不可用，请稍后再试。';
    }
    
    // 格式化AI响应为易读的文本
    function formatAIResponse(response) {
        // 如果响应已经是字符串，直接返回
        if (typeof response === 'string') return response;
        
        try {
            let formattedText = '';
            
            // 添加建议部分
            if (response.suggestions && response.suggestions.length > 0) {
                formattedText += '以下是几种可能的回复方式：\n\n';
                
                response.suggestions.forEach((suggestion, index) => {
                    formattedText += `${index + 1}. ${suggestion.type}：\n"${suggestion.reply}"\n\n`;
                    if (suggestion.explanation) {
                        formattedText += `解释：${suggestion.explanation}\n\n`;
                    }
                });
            }
            
            // 添加分析部分
            if (response.analysis) {
                formattedText += `分析：${response.analysis}\n\n`;
            }
            
            // 添加提示部分
            if (response.tips) {
                formattedText += `提示：${response.tips}`;
            }
            
            return formattedText.trim();
        } catch (error) {
            console.error('格式化AI响应错误:', error);
            throw error; // 抛出错误让上层函数处理
        }
    }
    

    
    // 开始打字效果
    function startTypingEffect(text, sessionId, aiMessageDiv = null) {
        // 使用传入的消息元素，或者查找最新的AI消息元素
        let latestMessage = aiMessageDiv;
        if (!latestMessage) {
            const aiMessages = document.querySelectorAll('.ai-message[data-typing="true"]');
            latestMessage = aiMessages[aiMessages.length - 1];
        }
        
        if (!latestMessage) {
            console.error('找不到打字效果的目标消息元素');
            return;
        }
        
        const textElement = latestMessage.querySelector('.typing-text');
        if (!textElement) {
            console.error('找不到打字效果的文本元素');
            return;
        }
        
        // 清空文本内容并创建光标
        textElement.textContent = '';
        
        // 添加光标
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor typing';
        textElement.appendChild(cursor);
        
        let currentIndex = 0;
        const typingSpeed = 50; // 每个字符的显示间隔（毫秒）
        
        function typeNextCharacter() {
            // 检查是否被停止
            if (!window.isAIReplying) {
                return;
            }
            
            if (currentIndex < text.length) {
                // 插入下一个字符（在光标前面）
                const char = text[currentIndex];
                const textNode = document.createTextNode(char);
                textElement.insertBefore(textNode, cursor);
                
                currentIndex++;
                
                // 每5个字符滚动一次，确保用户能看到最新内容
                if (currentIndex % 5 === 0) {
                    scrollToBottom();
                }
                
                // 继续下一个字符
                window.currentTypingEffect = setTimeout(typeNextCharacter, typingSpeed);
            } else {
                // 打字完成，直接移除光标，不使用动画
                cursor.remove();
                latestMessage.removeAttribute('data-typing');
                textElement.classList.remove('typing-text');
                
                // 恢复发送按钮状态
                window.isAIReplying = false;
                if (typeof toggleSendButtonState === 'function') {
                    toggleSendButtonState(false);
                }
                
                // 更新会话预览
                if (window.updateSessionPreview) {
                    window.updateSessionPreview(text);
                }
                
                // 打字完成后最终滚动到底部
                scrollToBottom();
            }
        }
        
        // 立即开始打字效果，减少延迟
        window.currentTypingEffect = setTimeout(typeNextCharacter, 100);
    }
    
    // 滚动到聊天窗口底部 - 优化版本，减少跳变
    function scrollToBottom() {
        const chatContainer = document.querySelector('.chat-container');
        
        if (chatContainer) {
            // 使用requestAnimationFrame确保DOM更新完成后再滚动
            requestAnimationFrame(() => {
                // 直接滚动到底部，不留空间
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        }
    }
}

// 首页功能初始化
function initHomeFeatures() {
    // 菜单项点击事件 - 只针对首页的功能项
    const featureItems = document.querySelectorAll('.feature-item[data-feature]');
    featureItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除所有已存在的toast，不显示提示
            const existingToasts = document.querySelectorAll('.app-toast');
            existingToasts.forEach(toast => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            });
            
            // 直接切换到聊天页面
            setTimeout(() => {
                document.querySelector('.tab-item[data-page="chat"]').click();
            }, 100);
        });
    });
    
    // 场景卡片按钮也应该直接切换到聊天页面
    const scenarioBtns = document.querySelectorAll('.hero-cta-btn');
    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有已存在的toast，不显示提示
            const existingToasts = document.querySelectorAll('.app-toast');
            existingToasts.forEach(toast => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            });
            
            // 直接切换到聊天页面
            setTimeout(() => {
                document.querySelector('.tab-item[data-page="chat"]').click();
            }, 100);
        });
    });
}// 多模态聊天功能
function initMultiModalChat() {
    // 附件面板切换
    const attachBtn = document.getElementById('chat-attach-btn');
    const attachmentsPanel = document.getElementById('chat-attachments-panel');
    
    if(attachBtn && attachmentsPanel) {
        // 使用点击事件监听代替默认的click事件，确保事件触发
        attachBtn.addEventListener('mousedown', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            e.preventDefault(); // 阻止默认行为
            
            // 检查是否有其他toast，先移除它们
            const existingToasts = document.querySelectorAll('.app-toast');
            existingToasts.forEach(toast => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            });
            
            setTimeout(() => {
                attachmentsPanel.classList.toggle('active');
            }, 10);
        });
        
        // 使用触摸事件确保在移动设备上也能正常工作
        attachBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            e.preventDefault(); // 阻止默认行为
            
            // 检查是否有其他toast，先移除它们
            const existingToasts = document.querySelectorAll('.app-toast');
            existingToasts.forEach(toast => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            });
            
            setTimeout(() => {
                attachmentsPanel.classList.toggle('active');
            }, 10);
        }, { passive: false });
        
        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (attachmentsPanel.classList.contains('active') && 
                !attachmentsPanel.contains(e.target) && 
                e.target !== attachBtn &&
                !attachBtn.contains(e.target)) {
                attachmentsPanel.classList.remove('active');
            }
        });
    }

    // 图片上传
    const imageUploadInput = document.getElementById('image-upload');
    const imageOption = document.querySelector('.attachment-option:nth-child(1)');
    if(imageUploadInput && imageOption) {
        // 点击图片选项时触发文件选择
        imageOption.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            imageUploadInput.click();
        });
        
        // 使用触摸事件确保移动端兼容性
        imageOption.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            imageUploadInput.click();
        }, { passive: false });
        
        // 处理图片上传
        imageUploadInput.addEventListener('change', handleImageUpload);
    }
    
    // 拍照上传
    const cameraUploadInput = document.getElementById('camera-upload');
    const cameraOption = document.querySelector('.attachment-option:nth-child(2)');
    if(cameraUploadInput && cameraOption) {
        // 点击拍照选项时触发相机
        cameraOption.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            cameraUploadInput.click();
        });
        
        // 使用触摸事件确保移动端兼容性
        cameraOption.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            cameraUploadInput.click();
        }, { passive: false });
        
        // 处理拍照上传
        cameraUploadInput.addEventListener('change', handleImageUpload);
    }
    
    // 文档和聊天记录上传功能已移除，只保留图片上传功能
    

}// 处理图片上传
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
        // 不显示toast提示
        return;
    }
    
    // 关闭附件面板
    document.getElementById('chat-attachments-panel').classList.remove('active');
    
    // 读取文件并预览
    const reader = new FileReader();
    reader.onload = function(e) {
        // 获取当前会话
        if (window.chatSessionManager) {
            // 添加用户图片消息
            const imageMessage = `<div class="message-image">
                <img src="${e.target.result}" alt="上传的图片">
            </div>`;
            
            window.chatSessionManager.addMessage(
                window.chatSessionManager.currentSessionId, 
                'user', 
                imageMessage
            );
            
            // 添加到UI
            const messageEl = document.createElement('div');
            messageEl.className = `message user-message`;
            messageEl.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-user" style="font-size: 20px; color: #aaa;"></i>
                </div>
                <div class="message-content">
                    ${imageMessage}
                </div>
            `;
            
            document.getElementById('chat-messages').appendChild(messageEl);
            
            // 滚动到底部
            const chatContainer = document.querySelector('.chat-container');
            // 调整滚动位置，留出适当的底部空间
            const targetScrollTop = chatContainer.scrollHeight - chatContainer.clientHeight - 50;
            chatContainer.scrollTop = Math.max(0, targetScrollTop);
            
            // 显示AI正在输入
            window.chatSessionManager.showTypingIndicator();
            
            // 处理图片和生成AI回复
            setTimeout(async () => {
                // 移除输入指示器
                window.chatSessionManager.removeTypingIndicator();
                
                // AI分析图片并回复
                let aiReply = '我看到你发送了一张图片。';
                
                // 如果有图像识别能力，调用AI服务
                try {
                    if (window.aiService) {
                        const imageBase64 = e.target.result.split(',')[1];
                        const analyzeResult = await analyzeImage(imageBase64);
                        
                        if (analyzeResult) {
                            aiReply = analyzeResult;
                        } else {
                            aiReply = '我已经收到你发送的图片了。需要我针对这张图片提供什么样的建议吗？';
                        }
                    }
                } catch (error) {
                    console.error('图片分析错误:', error);
                    aiReply = '我收到了你的图片，但在分析过程中遇到了一些问题。你可以告诉我这张图片的内容，我会尽力提供帮助。';
                }
                
                // 添加AI回复
                window.chatSessionManager.addMessage(
                    window.chatSessionManager.currentSessionId, 
                    'ai', 
                    aiReply
                );
                window.chatSessionManager.addMessageToUI('ai', aiReply);
                
                // 确保滚动到底部
                setTimeout(() => {
                    const chatMessagesContainer = document.getElementById('chat-messages');
                    if (chatMessagesContainer) {
                        // 调整滚动位置，留出适当的底部空间
                        const targetScrollTop = chatMessagesContainer.scrollHeight - chatMessagesContainer.clientHeight - 50;
                        chatMessagesContainer.scrollTop = Math.max(0, targetScrollTop);
                    }
                }, 100);
            }, 1500);
}

// 生成AI回复（支持多语言）
function generateAIReply(userMessage) {
    if (!window.I18nManager) {
        return "我已收到您的消息：" + userMessage;
    }
    
    const currentLang = window.I18nManager.getCurrentLanguage();
    
    if (currentLang === 'en-US') {
        return "I have received your message: " + userMessage;
    } else {
        return "我已收到您的消息：" + userMessage;
    }
        }
    };
    
    reader.readAsDataURL(file);
    
    // 重置input，允许选择相同文件
    event.target.value = '';
}

// handleDocumentUpload函数已移除，只保留图片上传功能

// 生成AI回复（支持多语言）
function generateAIReply(userMessage) {
    if (!window.I18nManager) {
        return "我已收到您的消息：" + userMessage;
    }
    
    const currentLang = window.I18nManager.getCurrentLanguage();
    
    if (currentLang === 'en-US') {
        return "I have received your message: " + userMessage;
    } else {
        return "我已收到您的消息：" + userMessage;
    }
}

// handleChatLogUpload函数已移除，只保留图片上传功能

// 增强的图片分析功能
async function analyzeImage(imageBase64) {
    console.log('开始图片分析');
    
    try {
        // 检查是否有AI服务配置
        if (window.aiService) {
            // 调用AI服务进行图片分析
            const result = await window.aiService.analyzeImage(imageBase64);
            return result;
        }
        
        // 模拟智能图片分析（在没有AI服务时）
        const mockAnalysis = await simulateImageAnalysis(imageBase64);
        return mockAnalysis;
        
    } catch (error) {
        console.error('图片分析错误:', error);
        
        // 返回友好的错误提示
        const language = window.I18nManager ? window.I18nManager.getCurrentLanguage() : 'en-US';
        if (language.includes('zh')) {
            return '抱歉，图片分析遇到了问题。不过我已经收到了你的图片，请告诉我你想了解图片中的什么内容，我会尽力帮助你。';
        } else {
            return "I received your image but encountered an issue with analysis. Could you tell me what you'd like to know about the image? I'll do my best to help.";
        }
    }
}

// 模拟图片分析（增强版）
async function simulateImageAnalysis(imageBase64) {
    // 模拟分析延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const language = window.I18nManager ? window.I18nManager.getCurrentLanguage() : 'en-US';
    
    // 基于图片大小和格式的基础分析
    const imageSize = imageBase64.length;
    const isLargeImage = imageSize > 100000; // 大于100KB
    
    // 随机选择分析结果以模拟智能分析
    const responses = {
        'zh-CN': [
            '我看到了你发送的图片！这看起来是一张很有趣的照片。你想让我分析图片中的什么内容呢？比如人物、场景、物品或者情感氛围？',
            '图片已收到！我注意到这是一张' + (isLargeImage ? '高清' : '清晰') + '的图片。请告诉我你最想了解图片中的哪个方面，我可以帮你分析内容、给出建议或者讨论相关话题。',
            '很棒的图片！我可以看出这张照片很用心。你是希望我帮你分析图片内容、给出恋爱建议，还是想聊聊图片背后的故事？',
            '图片分析完成！看起来这是一个很棒的瞬间。你想要我从恋爱的角度分析这张图片吗？或者你有什么特别想知道的？'
        ],
        'en-US': [
            'I can see your image! This looks like an interesting photo. What would you like me to analyze - people, scenes, objects, or the emotional atmosphere?',
            'Image received! I notice this is a ' + (isLargeImage ? 'high-quality' : 'clear') + ' picture. Please tell me what aspect you\'d like me to focus on - I can analyze content, give suggestions, or discuss related topics.',
            'Great image! I can tell this photo has meaning to you. Would you like me to analyze the content, give relationship advice, or talk about the story behind it?',
            'Image analysis complete! This looks like a wonderful moment. Would you like me to analyze this from a relationship perspective, or is there something specific you\'d like to know?'
        ]
    };
    
    const currentLang = language.includes('zh') ? 'zh-CN' : 'en-US';
    const responseList = responses[currentLang];
    const randomResponse = responseList[Math.floor(Math.random() * responseList.length)];
    
    return randomResponse;
}

// formatFileSize和getFileIcon函数已移除，只保留图片上传功能

// 简化的菜单处理函数 - 直接创建菜单而不依赖复杂的逻辑
window.handleSessionMenuClick = function(event, sessionItem, menuTrigger) {
    console.log("=== 菜单点击开始 ===");
    console.log("sessionItem:", sessionItem);
    console.log("menuTrigger:", menuTrigger);
    
    // 修复参数问题：如果menuTrigger未传递，从sessionItem中获取
    if (!menuTrigger && sessionItem) {
        menuTrigger = sessionItem.querySelector('.session-menu-trigger');
    }
    
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
    
    // 删除所有现有菜单，包括新建会话菜单
    document.querySelectorAll('.session-dropdown-menu').forEach(menu => menu.remove());
    const newSessionMenu = document.getElementById('new-session-menu');
    if (newSessionMenu) {
        newSessionMenu.remove();
    }
    
    // 获取会话ID
    const sessionId = sessionItem.getAttribute('data-session-id');
    const isDefaultSession = sessionId === 'new-chat';
    
    console.log("会话ID:", sessionId, "是否为默认会话:", isDefaultSession);
    
    // 直接创建菜单HTML - 使用翻译后的文本
    const menuHTML = `
        <div class="session-dropdown-menu">
            <div class="session-menu-item ${isDefaultSession ? 'disabled' : ''}" onclick="window.handleRename('${sessionId}', event); return false;">
                <i class="fas fa-edit"></i>
                <span data-i18n="chat.rename_session">重命名会话</span>
            </div>
            <div class="session-menu-item ${isDefaultSession ? 'disabled' : ''}" onclick="window.handleDelete('${sessionId}', event); return false;">
                <i class="fas fa-trash"></i>
                <span data-i18n="chat.menu.delete_session">删除会话</span>
            </div>
        </div>
    `;
    
    // 直接插入HTML
    sessionItem.insertAdjacentHTML('beforeend', menuHTML);
    
    // 立即更新新插入菜单的翻译
    const newMenu = sessionItem.querySelector('.session-dropdown-menu');
    if (newMenu && window.I18nManager) {
        const translateElements = newMenu.querySelectorAll('[data-i18n]');
        translateElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = window.I18nManager.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
    }
    
    console.log("菜单HTML已插入并翻译完成");
    
    // 点击页面任何位置关闭菜单
    document.addEventListener('click', function closeMenu(e) {
        // 如果点击的不是菜单，也不是菜单触发器
        if (!e.target.closest('.session-dropdown-menu') && !e.target.closest('.session-menu-trigger')) {
            const menu = sessionItem.querySelector('.session-dropdown-menu');
            if (menu) {
                menu.remove();
                console.log("菜单已关闭 - 点击了其他区域");
            }
            // 移除事件监听器，避免重复监听
            document.removeEventListener('click', closeMenu);
        }
    });
    
    return false;
};

// 处理重命名
window.handleRename = function(sessionId, event) {
    console.log("重命名会话:", sessionId);
    
    // 阻止事件冒泡
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (sessionId === 'new-chat') {
        // 使用Toast提示而不是alert
        window.showToast ? window.showToast('默认会话不能重命名', 'warning') : alert('默认会话不能重命名');
    } else {
        const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
        const nameEl = sessionItem ? sessionItem.querySelector('.session-name') : null;
        const currentName = nameEl ? nameEl.textContent : '新会话';
        
        const newName = prompt('请输入新的会话名称:', currentName);
        if (newName && newName.trim() && newName.trim() !== currentName) {
            if (nameEl) {
                nameEl.textContent = newName.trim();
                
                // 如果是当前活动会话，同时更新标题
                if (sessionItem && sessionItem.classList.contains('active')) {
                    const titleElement = document.getElementById('current-session-title');
                    if (titleElement) {
                        titleElement.removeAttribute('data-i18n');
                        titleElement.textContent = newName.trim();
                    }
                }
                
                // 使用Toast提示而不是alert
                window.showToast ? window.showToast('会话重命名成功', 'success') : alert('重命名成功');
            }
        }
    }
    // 关闭菜单
    document.querySelectorAll('.session-dropdown-menu').forEach(menu => menu.remove());
};

// 处理删除
window.handleDelete = function(sessionId, event) {
    console.log("删除会话:", sessionId);
    
    // 阻止事件冒泡
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (sessionId === 'new-chat') {
        // 使用Toast提示而不是alert
        window.showToast ? window.showToast('默认会话不能删除', 'warning') : alert('默认会话不能删除');
    } else {
        if (confirm('确定要删除这个会话吗？删除后无法恢复。')) {
            const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
            if (sessionItem) {
                // 检查当前会话是否处于活动状态
                if (sessionItem.classList.contains('active')) {
                    // 如果是当前活动会话，先切换到新对话
                    if (window.switchToSession) {
                        window.switchToSession('new-chat', 'New Chat');
                    }
                }
                
                // 删除会话
                sessionItem.remove();
                
                // 使用Toast提示而不是alert
                window.showToast ? window.showToast('会话已删除', 'success') : alert('会话已删除');
            }
        }
    }
    // 关闭菜单
    document.querySelectorAll('.session-dropdown-menu').forEach(menu => menu.remove());
};

// 聊天会话管理器
function initChatSessionsManager() {
    // 添加会话导航按钮
    const chatContent = document.querySelector('.chat-content');
    const chatPage = document.querySelector('.chat-page');
    const chatSessions = document.querySelector('.chat-sessions');
    
    // 添加后退按钮
    const backButton = document.createElement('button');
    backButton.className = 'chat-back-btn';
    backButton.id = 'toggle-sessions-btn';
    backButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    // 添加选项按钮
    const optionsButton = document.createElement('button');
    optionsButton.className = 'chat-option-btn';
    optionsButton.id = 'chat-options-btn';
    optionsButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
    
    // 创建标题元素
    const titleElement = document.createElement('div');
    titleElement.className = 'chat-title';
    titleElement.innerHTML = '<span id="current-session-title" data-i18n="chat.default_session">默认会话</span>';
    
    // 创建头部容器
    const headerContainer = document.createElement('div');
    headerContainer.className = 'chat-header-container';
    headerContainer.appendChild(backButton);
    headerContainer.appendChild(titleElement);
    headerContainer.appendChild(optionsButton);  // 添加选项按钮
    
    // 添加到聊天内容区域前面
    if (chatContent) {
        chatContent.insertBefore(headerContainer, chatContent.firstChild);
        // 设置标题文本
        const titleElement = document.getElementById('current-session-title');
        if (titleElement) {
            titleElement.setAttribute('data-i18n', 'chat.title');
            titleElement.textContent = window.I18nManager ? window.I18nManager.t('chat.title') : '聊天';
        }
    }
    
    // 获取创建的按钮
    const toggleSessionsBtn = document.getElementById('toggle-sessions-btn');
    const chatOptionsBtn = document.getElementById('chat-options-btn');
    
    if (toggleSessionsBtn) {
        toggleSessionsBtn.addEventListener('click', function() {
            // 显示会话列表
            if (chatSessions) {
                chatSessions.style.left = '0';
                chatSessions.style.transform = 'translateX(0)';
                
                // 添加显示动画效果
                chatSessions.classList.add('showing');
                setTimeout(() => {
                    chatSessions.classList.remove('showing');
                }, 300);
            }
        });
    }
    
    // 聊天选项按钮点击处理
    if (chatOptionsBtn) {
        chatOptionsBtn.addEventListener('click', function() {
            // 显示聊天选项菜单
            showChatOptionsMenu();
        });
    }
    
    // 新建会话按钮功能 - 改为显示创建菜单
    const newSessionBtn = document.querySelector('.new-session-btn');
    if (newSessionBtn) {
        newSessionBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showNewSessionMenu(newSessionBtn);
        });
    }
    
    // 创建新会话功能
    function createNewSession() {
        const sessionName = '新会话';
        if (sessionName && sessionName.trim()) {
            // 创建新的会话项
            const newSessionId = 'session_' + Date.now();
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.setAttribute('data-session-id', newSessionId);
            sessionItem.innerHTML = `
                <div class="session-avatar">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="session-time">Just now</div>
                <div class="session-info">
                    <div class="session-name">${sessionName.trim()}</div>
                    <div class="session-preview">Click to start conversation...</div>
                </div>
                <div class="session-menu-trigger">
                    <i class="fas fa-ellipsis-v"></i>
                </div>
            `;
            
            // 添加到会话列表
            const sessionsList = document.querySelector('.sessions-list');
            if (sessionsList) {
                // 插入到列表第二个位置（默认会话之后）
                const defaultSession = sessionsList.querySelector('.session-item[data-session-id="default"]');
                if (defaultSession && defaultSession.nextElementSibling) {
                    sessionsList.insertBefore(sessionItem, defaultSession.nextElementSibling);
                } else {
                    sessionsList.appendChild(sessionItem);
                }
            }
            
            // 为新会话添加点击事件 - 但要排除菜单触发器区域
            sessionItem.addEventListener('click', function(e) {
                // 如果点击的是菜单触发器或其子元素，不执行会话切换
                if (e.target.closest('.session-menu-trigger')) {
                    return;
                }
                switchToSession(newSessionId, sessionName.trim());
            });
            
            // 为新会话添加菜单按钮点击事件 - 使用内联方式绑定
            const menuTrigger = sessionItem.querySelector('.session-menu-trigger');
            if (menuTrigger) {
                // 移除所有已有的事件监听器，改用内联事件
                const newMenuTrigger = menuTrigger.cloneNode(true);
                menuTrigger.parentNode.replaceChild(newMenuTrigger, menuTrigger);
                
                // 添加内联事件处理函数
                newMenuTrigger.setAttribute('onclick', 
                    "window.handleSessionMenuClick(event, this.parentNode, this);");
                
                // 为确保事件不会冒泡，添加捕获阶段的事件监听器
                newMenuTrigger.addEventListener('click', function(e) {
                    console.log('Menu trigger clicked (via capture) for new session');
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }, true); // true表示在捕获阶段处理事件
            }
            
            // 自动切换到新创建的会话
            switchToSession(newSessionId, sessionName.trim());
        }
    }
    
    // 切换到指定会话
    window.switchToSession = function switchToSession(sessionId, sessionName, skipClearMessages = false) {
        console.log('切换到会话:', sessionId, sessionName, '跳过清空消息:', skipClearMessages);
        
        // 关闭所有打开的菜单
        document.querySelectorAll('.session-dropdown-menu').forEach(menu => menu.remove());
        const newSessionMenu = document.getElementById('new-session-menu');
        if (newSessionMenu) {
            newSessionMenu.remove();
        }
        
        // 更新活动状态
        const allSessions = document.querySelectorAll('.session-item');
        allSessions.forEach(item => item.classList.remove('active'));
        
        const targetSession = document.querySelector(`[data-session-id="${sessionId}"]`);
        if (targetSession) {
            targetSession.classList.add('active');
        }
        
        // 更新标题
        const titleElement = document.getElementById('current-session-title');
        if (titleElement) {
            // 如果是新对话，使用翻译；否则使用会话名称
            if (sessionId === 'new-chat') {
                titleElement.setAttribute('data-i18n', 'chat.new_conversation');
                titleElement.textContent = window.I18nManager ? window.I18nManager.t('chat.new_conversation') : sessionName;
            } else {
                titleElement.removeAttribute('data-i18n');
                titleElement.textContent = sessionName;
            }
        }
        
        // 更新chatSessionManager的当前会话ID
        if (window.chatSessionManager) {
            window.chatSessionManager.currentSessionId = sessionId;
        }
        
        // 只有在不跳过清空消息时才清空聊天内容
        if (!skipClearMessages) {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                
                // 如果是"新对话"或新创建的会话（没有历史记录），显示欢迎消息
                const hasHistory = window.chatSessionManager && window.chatSessionManager.sessions[sessionId] && window.chatSessionManager.sessions[sessionId].length > 0;
                if (sessionId === 'new-chat' || !hasHistory) {
                    const welcomeMessage = document.createElement('div');
                    welcomeMessage.className = 'message ai-message welcome-message';
                    welcomeMessage.innerHTML = `
                        <div class="message-avatar ai">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>👋 Hi! I'm LoveAI, ready to start a brand new conversation! How can I help you?</p>
                        </div>
                    `;
                    chatMessages.appendChild(welcomeMessage);
                }
                
                // 加载会话历史记录
                if (window.chatSessionManager && window.chatSessionManager.sessions[sessionId]) {
                    console.log('加载会话历史记录:', sessionId, window.chatSessionManager.sessions[sessionId].length, '条消息');
                    
                    // 遍历会话消息，添加到UI
                    window.chatSessionManager.sessions[sessionId].forEach(message => {
                        window.chatSessionManager.addMessageToUI(message.sender, message.content);
                    });
                } else {
                    console.log('没有找到会话历史记录或会话为空:', sessionId);
                }
            }
        }
        
        // 隐藏会话列表
        if (chatSessions) {
            chatSessions.style.left = '-100%';
            chatSessions.style.transform = 'translateX(-100%)';
        }
    }

    // 创建和显示聊天选项菜单
    function showChatOptionsMenu() {
        // 检查是否已经存在菜单
        let chatOptionsMenu = document.getElementById('chat-options-menu');
        
        // 如果菜单已存在，切换显示/隐藏状态
        if (chatOptionsMenu) {
            if (chatOptionsMenu.style.display === 'block') {
                chatOptionsMenu.style.display = 'none';
            } else {
                chatOptionsMenu.style.display = 'block';
            }
            return;
        }
        
        // 创建菜单元素
        chatOptionsMenu = document.createElement('div');
        chatOptionsMenu.id = 'chat-options-menu';
        chatOptionsMenu.className = 'chat-options-menu';
        
        // 添加菜单项 - 新设计的菜单选项
        const menuItems = [
            { icon: 'fas fa-trash-alt', text: window.I18nManager ? window.I18nManager.t('chat.menu.delete_session') : 'Delete Session', action: clearChat },
            { icon: 'fas fa-comment-dots', text: window.I18nManager ? window.I18nManager.t('chat.menu.quick_reply') : 'Quick Reply', action: showQuickReplies },
            { icon: 'fas fa-question-circle', text: window.I18nManager ? window.I18nManager.t('chat.menu.chat_assistant') : 'Chat Assistant', action: showChatAssistant }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-option';
            menuItem.innerHTML = `
                <div class="menu-icon"><i class="${item.icon}"></i></div>
                <div class="menu-text">${item.text}</div>
            `;
            menuItem.addEventListener('click', () => {
                chatOptionsMenu.style.display = 'none';
                item.action();
            });
            chatOptionsMenu.appendChild(menuItem);
        });
        
        // 将菜单添加到页面
        const chatHeaderContainer = document.querySelector('.chat-header-container');
        if (chatHeaderContainer) {
            chatHeaderContainer.appendChild(chatOptionsMenu);
        }
        
        // 点击页面其他地方时关闭菜单
        document.addEventListener('click', (e) => {
            if (chatOptionsMenu && 
                !chatOptionsMenu.contains(e.target) && 
                e.target !== chatOptionsBtn &&
                !chatOptionsBtn.contains(e.target)) {
                chatOptionsMenu.style.display = 'none';
            }
        });
        
        // 显示菜单
        chatOptionsMenu.style.display = 'block';
    }
    
    // 菜单功能实现 - 删除会话
    function clearChat() {
        const currentSessionId = getCurrentSessionId();
        
        // "新对话"不能删除
        if (currentSessionId === 'new-chat') {
            showToast(window.I18nManager ? window.I18nManager.t('chat.new_chat_cannot_delete') : 'New chat cannot be deleted', 'error');
            return;
        }
        
        if (window.confirm(window.I18nManager ? window.I18nManager.t('chat.confirm_delete_session') : 'Are you sure you want to delete the current session?')) {
            // 从会话列表中删除会话项
            const sessionItem = document.querySelector(`.session-item[data-session-id="${currentSessionId}"]`);
            if (sessionItem && sessionItem.parentNode) {
                sessionItem.parentNode.removeChild(sessionItem);
            }
            
            // 切换到"新对话"
            switchToSession('new-chat', window.I18nManager ? window.I18nManager.t('chat.new_conversation') : 'New Conversation');
        }
    }
    
    // 显示快速回复面板
    function showQuickReplies() {
        // 检查是否已经存在快速回复面板
        let quickRepliesPanel = document.getElementById('quick-replies-panel');
        
        // 如果面板已存在，直接显示
        if (quickRepliesPanel) {
            quickRepliesPanel.classList.add('active');
            return;
        }
        
        // 创建快速回复面板
        quickRepliesPanel = document.createElement('div');
        quickRepliesPanel.id = 'quick-replies-panel';
        quickRepliesPanel.className = 'quick-replies-panel';
        
        // 添加标题和关闭按钮
        const panelHeader = document.createElement('div');
        panelHeader.className = 'panel-header';
        panelHeader.innerHTML = `
            <h3>${window.I18nManager ? window.I18nManager.t('chat.quick_reply.title') : 'Quick Reply'}</h3>
            <button class="close-panel-btn"><i class="fas fa-times"></i></button>
        `;
        quickRepliesPanel.appendChild(panelHeader);
        
        // 添加快速回复选项
        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'quick-replies-container';
        
        // 预设的快速回复模板
        const quickReplies = [
            {
                title: window.I18nManager ? window.I18nManager.t('chat.quick_reply.opener.title') : 'Conversation Openers',
                templates: [
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.opener.template1') : 'Hello, how are you?',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.opener.template2') : 'What are you up to today?',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.opener.template3') : 'Good morning! How did you sleep?'
                ]
            },
            {
                title: window.I18nManager ? window.I18nManager.t('chat.quick_reply.response.title') : 'Response Templates',
                templates: [
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.response.template1') : 'That sounds great!',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.response.template2') : 'I understand how you feel',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.response.template3') : 'Tell me more about it'
                ]
            },
            {
                title: window.I18nManager ? window.I18nManager.t('chat.quick_reply.date_invite.title') : 'Date Invitations',
                templates: [
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.date_invite.template1') : 'Would you like to go for coffee this weekend?',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.date_invite.template2') : 'There\'s a great movie playing, want to see it together?',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.date_invite.template3') : 'I found a nice restaurant, shall we try it?'
                ]
            },
            {
                title: window.I18nManager ? window.I18nManager.t('chat.quick_reply.comfort.title') : 'Comfort & Support',
                templates: [
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.comfort.template1') : 'I\'m here for you',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.comfort.template2') : 'Everything will be okay',
                    window.I18nManager ? window.I18nManager.t('chat.quick_reply.comfort.template3') : 'You\'re stronger than you think'
                ]
            }
        ];
        
        // 为每个分类创建卡片
        quickReplies.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'reply-category-card';
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category.title;
            categoryCard.appendChild(categoryTitle);
            
            // 添加模板
            category.templates.forEach(template => {
                const templateBtn = document.createElement('div');
                templateBtn.className = 'template-item';
                templateBtn.textContent = template;
                
                // 点击模板直接发送
                templateBtn.addEventListener('click', () => {
                    // 关闭面板
                    quickRepliesPanel.classList.remove('active');
                    
                    // 填充到输入框
                    const chatInput = document.querySelector('.chat-input-field');
                    if (chatInput) {
                        chatInput.value = template;
                        
                        // 自动聚焦输入框
                        chatInput.focus();
                        
                        // 可选：自动发送消息
                        // 找到发送按钮并模拟点击
                        // const sendButton = document.querySelector('.chat-send-btn');
                        // if (sendButton) sendButton.click();
                    }
                });
                
                categoryCard.appendChild(templateBtn);
            });
            
            repliesContainer.appendChild(categoryCard);
        });
        
        quickRepliesPanel.appendChild(repliesContainer);
        
        // 将面板添加到页面
        document.body.appendChild(quickRepliesPanel);
        
        // 添加关闭按钮事件
        const closeButton = quickRepliesPanel.querySelector('.close-panel-btn');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                quickRepliesPanel.classList.remove('active');
            });
        }
        
        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (quickRepliesPanel.classList.contains('active') && 
                !quickRepliesPanel.contains(e.target) && 
                e.target.closest('.menu-option') === null) {
                quickRepliesPanel.classList.remove('active');
            }
        });
        
        // 激活面板
        setTimeout(() => {
            quickRepliesPanel.classList.add('active');
        }, 10);
    }
    
    // 显示聊天助手
    function showChatAssistant() {
        // 创建聊天助手对话框
        const assistantDialog = document.createElement('div');
        assistantDialog.className = 'chat-assistant-dialog';
        assistantDialog.innerHTML = `
            <div class="assistant-dialog-content">
                <div class="assistant-dialog-header">
                    <h3>${window.I18nManager ? window.I18nManager.t('chat.assistant.title') : 'Chat Assistant'}</h3>
                    <button class="close-dialog-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="assistant-dialog-body">
                    <div class="assistant-tip">
                        <i class="fas fa-lightbulb"></i>
                        <div class="tip-content">
                            <h4>${window.I18nManager ? window.I18nManager.t('chat.assistant.ai_helper.title') : 'AI Assistant'}</h4>
                            <p>${window.I18nManager ? window.I18nManager.t('chat.assistant.ai_helper.description') : 'Get intelligent suggestions and responses for your conversations.'}</p>
                        </div>
                    </div>
                    <div class="assistant-tip">
                        <i class="fas fa-comment-dots"></i>
                        <div class="tip-content">
                            <h4>${window.I18nManager ? window.I18nManager.t('chat.assistant.quick_reply.title') : 'Quick Replies'}</h4>
                            <p>${window.I18nManager ? window.I18nManager.t('chat.assistant.quick_reply.description') : 'Use pre-written templates for common conversation scenarios.'}</p>
                        </div>
                    </div>
                    <div class="assistant-tip">
                        <i class="fas fa-image"></i>
                        <div class="tip-content">
                            <h4>${window.I18nManager ? window.I18nManager.t('chat.assistant.multimedia.title') : 'Multimedia Support'}</h4>
                            <p>${window.I18nManager ? window.I18nManager.t('chat.assistant.multimedia.description') : 'Send images, take photos, or upload chat logs using the "+" button.'}</p>
                        </div>
                    </div>
                    <div class="assistant-tip">
                        <i class="fas fa-comments"></i>
                        <div class="tip-content">
                            <h4>${window.I18nManager ? window.I18nManager.t('chat.assistant.sessions.title') : 'Multiple Sessions'}</h4>
                            <p>${window.I18nManager ? window.I18nManager.t('chat.assistant.sessions.description') : 'Create new sessions using the "+" button in the session list for different conversation contexts.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(assistantDialog);
        
        // 添加关闭按钮事件
        const closeButton = assistantDialog.querySelector('.close-dialog-btn');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                assistantDialog.remove();
            });
        }
        
        // 点击对话框外部关闭
        assistantDialog.addEventListener('click', (e) => {
            if (e.target === assistantDialog) {
                assistantDialog.remove();
            }
        });
    }
    
    // 会话列表关闭按钮
    const sessionsBackBtn = document.getElementById('sessions-back-btn');
    if (sessionsBackBtn) {
        sessionsBackBtn.addEventListener('click', function() {
            if (chatSessions) {
                closeSessionsList();
            }
        });
    }
    
    // 会话重命名按钮
    const renameSessionBtn = document.getElementById('rename-session-btn');
    if (renameSessionBtn) {
        renameSessionBtn.addEventListener('click', function() {
            renameCurrentSession();
        });
    }
    
    // 清空会话按钮
    const clearSessionBtn = document.getElementById('clear-session-btn');
    if (clearSessionBtn) {
        clearSessionBtn.addEventListener('click', function() {
            clearCurrentSession();
        });
    }
    
    // 会话更多操作按钮
    const manageSessionBtn = document.getElementById('manage-session-btn');
    if (manageSessionBtn) {
        manageSessionBtn.addEventListener('click', function() {
            showSessionActions();
        });
    }
    
    // 关闭会话列表的函数，方便复用
    function closeSessionsList() {
        if (chatSessions) {
            chatSessions.style.left = '-100%';
            chatSessions.style.transform = 'translateX(-100%)';
            
            // 添加关闭动画效果
            chatSessions.classList.add('hiding');
            setTimeout(() => {
                chatSessions.classList.remove('hiding');
            }, 300);
        }
    }
    
    // 立即体验按钮功能（改为全局函数，供HTML直接调用）
    window.tryNowDemoFunction = function() {
        console.log('立即体验功能被调用');
        
        // 创建一个新的聊天会话
        const sessionId = window.createSessionWithName('New Chat', 'chat', true);
        
        // 确保菜单事件正确绑定
        setTimeout(() => {
            const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
            if (sessionItem) {
                const menuTrigger = sessionItem.querySelector('.session-menu-trigger');
                if (menuTrigger && !menuTrigger.hasAttribute('onclick')) {
                    console.log('手动绑定菜单事件给新创建的会话');
                    menuTrigger.setAttribute('onclick', 'window.handleSessionMenuClick(event, this.parentNode, this);');
                }
            }
        }, 100);
        
        // 不需要再次调用switchToSession，因为createSessionWithName已经处理了
        // 只需要确保聊天输入框获得焦点
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
    };

    // 获取当前活动会话ID
    function getCurrentSessionId() {
        const activeSession = document.querySelector('.session-item.active');
        return activeSession ? activeSession.getAttribute('data-session-id') : 'new-chat';
    }
    
    // 获取当前活动会话名称
    function getCurrentSessionName() {
        const activeSession = document.querySelector('.session-item.active');
        if (activeSession) {
            const sessionName = activeSession.querySelector('.session-name');
            return sessionName ? sessionName.textContent : '默认会话';
        }
        return '默认会话';
    }
    
    // 重命名当前会话
    function renameCurrentSession() {
        const sessionId = getCurrentSessionId();
        const currentName = getCurrentSessionName();
        
        // 默认会话不允许重命名
        if (sessionId === 'default') {
            showToast('默认会话不能重命名', 'warning');
            return;
        }
        
        const newName = prompt('请输入新的会话名称:', currentName);
        if (newName && newName.trim() && newName.trim() !== currentName) {
            // 更新会话项的名称
            const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
            if (sessionItem) {
                const sessionNameEl = sessionItem.querySelector('.session-name');
                if (sessionNameEl) {
                    sessionNameEl.textContent = newName.trim();
                }
                
                // 如果是当前活动会话，同时更新标题
                if (sessionItem.classList.contains('active')) {
                    const titleElement = document.getElementById('current-session-title');
                    if (titleElement) {
                        titleElement.removeAttribute('data-i18n');
                        titleElement.textContent = newName.trim();
                    }
                }
                
                showToast('会话已重命名', 'success');
            }
        }
    }
    
    // 清空当前会话
    function clearCurrentSession() {
        const sessionId = getCurrentSessionId();
        
        if (window.confirm('确定要清空当前会话的聊天记录吗？')) {
            // 清空聊天内容
            if (sessionId === getCurrentSessionId()) {
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    // 保留欢迎消息
                    const welcomeMessage = chatMessages.querySelector('.message.ai-message');
                    chatMessages.innerHTML = '';
                    if (welcomeMessage) {
                        chatMessages.appendChild(welcomeMessage);
                    }
                }
            }
            
            // 更新会话列表中的预览文本
            const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
            if (sessionItem) {
                const previewEl = sessionItem.querySelector('.session-preview');
                if (previewEl) {
                    previewEl.textContent = '聊天记录已清空';
                }
            }
            
            showToast('会话记录已清空', 'success');
        }
    }
    
    // 显示会话更多操作
    function showSessionActions() {
        // 创建会话操作菜单
        let sessionActionsMenu = document.getElementById('session-actions-menu');
        
        // 如果菜单已存在，切换显示/隐藏状态
        if (sessionActionsMenu) {
            sessionActionsMenu.remove();
            return;
        }
        
        // 创建菜单元素
        sessionActionsMenu = document.createElement('div');
        sessionActionsMenu.id = 'session-actions-menu';
        sessionActionsMenu.className = 'session-actions-menu';
        
        const sessionId = getCurrentSessionId();
        const isDefaultSession = sessionId === 'new-chat';
        
        // 添加菜单项
        const menuItems = [
            { 
                icon: 'fas fa-file', 
                text: '新建会话', 
                action: createNewSession 
            },
            { 
                icon: 'fas fa-edit', 
                text: window.I18nManager ? window.I18nManager.t('chat.session.rename') : 'Rename Session', 
                action: renameCurrentSession,
                disabled: isDefaultSession 
            },
            { 
                icon: 'fas fa-trash-alt', 
                text: window.I18nManager ? window.I18nManager.t('chat.session.delete') : 'Delete Session', 
                action: deleteCurrentSession,
                disabled: isDefaultSession 
            },
            { 
                icon: 'fas fa-sort', 
                text: window.I18nManager ? window.I18nManager.t('chat.session.sort') : 'Sort Sessions', 
                action: sortSessions 
            }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = `session-menu-option ${item.disabled ? 'disabled' : ''}`;
            menuItem.innerHTML = `
                <div class="menu-icon"><i class="${item.icon}"></i></div>
                <div class="menu-text">${item.text}</div>
            `;
            
            if (!item.disabled) {
                menuItem.addEventListener('click', () => {
                    sessionActionsMenu.remove();
                    item.action();
                });
            }
            
            sessionActionsMenu.appendChild(menuItem);
        });
        
        // 将菜单添加到页面
        document.querySelector('.session-actions').appendChild(sessionActionsMenu);
        
        // 点击页面其他地方时关闭菜单
        document.addEventListener('click', (e) => {
            if (sessionActionsMenu && 
                !sessionActionsMenu.contains(e.target) && 
                e.target !== manageSessionBtn &&
                !manageSessionBtn.contains(e.target)) {
                sessionActionsMenu.remove();
            }
        }, { once: true });
    }
    
    // 删除当前会话
    function deleteCurrentSession() {
        const sessionId = getCurrentSessionId();
        
        // "新对话"不允许删除
        if (sessionId === 'new-chat') {
            showToast('New chat cannot be deleted', 'warning');
            return;
        }
        
        if (window.confirm('确定要删除当前会话吗？删除后无法恢复。')) {
            // 获取要删除的会话元素
            const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
            
            // 切换到"新对话"
            switchToSession('new-chat', 'New Chat');
            
            // 删除会话元素
            if (sessionItem) {
                sessionItem.remove();
            }
            
            showToast(window.I18nManager ? window.I18nManager.t('chat.session.deleted') : 'Session deleted', 'success');
        }
    }
    
    // 排序会话
    function sortSessions() {
        showToast(window.I18nManager ? window.I18nManager.t('chat.session.sort_coming_soon') : 'Session sorting feature coming soon', 'info');
    }
    
    // 显示/隐藏会话下拉菜单
    window.toggleSessionDropdownMenu = function toggleSessionDropdownMenu(sessionItem, menuTrigger) {
        console.log('Toggling dropdown menu for session', sessionItem);
        
        // 确保参数是正确的DOM元素
        if (!(sessionItem instanceof Element)) {
            console.error('sessionItem is not a DOM element:', sessionItem);
            // 尝试修复 - 如果传入的是字符串或CSS选择器，尝试找到匹配的元素
            if (typeof sessionItem === 'string') {
                sessionItem = document.querySelector(sessionItem) || document.querySelector(`[data-session-id="${sessionItem}"]`);
                if (!sessionItem) {
                    console.error('Cannot find session element');
                    return;
                }
            } else {
                return; // 无法处理
            }
        }
        
        const sessionId = sessionItem.getAttribute('data-session-id');
        console.log('Session ID:', sessionId);
        const isDefaultSession = sessionId === 'new-chat';
        
        // 删除已存在的所有菜单
        const existingMenus = document.querySelectorAll('.session-dropdown-menu');
        existingMenus.forEach(menu => menu.remove());
        
        console.log("创建新的下拉菜单...");
        
        // 创建下拉菜单
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'session-dropdown-menu';
        
        // 添加菜单项
        const menuItems = [
            {
                icon: 'fas fa-edit',
                text: window.I18nManager ? window.I18nManager.t('chat.session.rename') : 'Rename Session',
                action: function() {
                    console.log('Rename clicked for session', sessionId);
                    renameSession(sessionId);
                },
                disabled: isDefaultSession
            },
            {
                icon: 'fas fa-times',
                text: window.I18nManager ? window.I18nManager.t('chat.session.delete') : 'Delete Session',
                action: function() {
                    console.log('Delete clicked for session', sessionId);
                    deleteSession(sessionId);
                },
                disabled: isDefaultSession
            }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = `session-menu-item ${item.disabled ? 'disabled' : ''}`;
            menuItem.innerHTML = `
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            `;
            
            // 为所有菜单项添加点击事件，包括禁用的
            menuItem.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
                dropdownMenu.remove();
                
                if (item.disabled) {
                    // 如果是禁用的选项，显示提示信息
                    if (item.text === (window.I18nManager ? window.I18nManager.t('chat.session.rename') : 'Rename Session')) {
                        showToast(window.I18nManager ? window.I18nManager.t('chat.session.default_cannot_rename') : 'Default session cannot be renamed', 'warning');
                    } else if (item.text === (window.I18nManager ? window.I18nManager.t('chat.session.delete') : 'Delete Session')) {
                        showToast(window.I18nManager ? window.I18nManager.t('chat.session.default_cannot_delete') : 'Default session cannot be deleted', 'warning');
                    }
                } else {
                    // 执行正常操作
                    item.action();
                }
            });
            
            dropdownMenu.appendChild(menuItem);
        });
        
        // 将菜单添加到会话项中
        sessionItem.appendChild(dropdownMenu);
        console.log("菜单已添加到DOM中", dropdownMenu);
        
        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!dropdownMenu.contains(e.target) && e.target !== menuTrigger) {
                    dropdownMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }
    
    // 重命名指定会话
    function renameSession(sessionId) {
        console.log('Renaming session with ID:', sessionId);
        const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
        if (!sessionItem) {
            console.log('Session item not found');
            return;
        }
        
        const currentName = sessionItem.querySelector('.session-name').textContent;
        const newName = prompt('请输入新的会话名称:', currentName);
        
        if (newName && newName.trim() && newName.trim() !== currentName) {
            const sessionNameEl = sessionItem.querySelector('.session-name');
            if (sessionNameEl) {
                sessionNameEl.textContent = newName.trim();
            }
            
            // 如果是当前活动会话，同时更新标题
            if (sessionItem.classList.contains('active')) {
                const titleElement = document.getElementById('current-session-title');
                if (titleElement) {
                    titleElement.removeAttribute('data-i18n');
                    titleElement.textContent = newName.trim();
                }
            }
            
            showToast('会话已重命名', 'success');
        } else {
            console.log('Rename canceled or same name provided');
        }
    }
    
    // 清空指定会话
    function clearSession(sessionId) {
        console.log('Clearing session with ID:', sessionId);
        if (window.confirm('确定要清空这个会话的聊天记录吗？')) {
            // 如果是当前活动会话，清空聊天内容
            const currentSessionId = getCurrentSessionId();
            if (sessionId === currentSessionId) {
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    const welcomeMessage = chatMessages.querySelector('.message.ai-message');
                    chatMessages.innerHTML = '';
                    if (welcomeMessage) {
                        chatMessages.appendChild(welcomeMessage);
                    }
                }
            }
            
            // 更新会话列表中的预览文本
            const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
            if (sessionItem) {
                const previewEl = sessionItem.querySelector('.session-preview');
                if (previewEl) {
                    previewEl.textContent = '聊天记录已清空';
                }
            }
            
            showToast('会话记录已清空', 'success');
        } else {
            console.log('Clear canceled');
        }
    }
    
    // 删除指定会话
    function deleteSession(sessionId) {
        console.log('Deleting session with ID:', sessionId);
        if (sessionId === 'default') {
            showToast('默认会话不能删除', 'warning');
            return;
        }
        
        if (window.confirm('确定要删除这个会话吗？删除后无法恢复。')) {
            const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
            
            // 如果删除的是当前活动会话，切换到默认会话
            if (sessionItem && sessionItem.classList.contains('active')) {
                switchToSession('default', '默认会话');
            }
            
            // 删除会话元素
            if (sessionItem) {
                sessionItem.remove();
            }
            
            showToast('会话已删除', 'success');
        } else {
            console.log('Delete canceled');
        }
    }
    
    // 为现有会话项添加菜单点击事件和会话切换事件
    const existingSessions = document.querySelectorAll('.session-item');
    existingSessions.forEach(sessionItem => {
        // 先清除可能已存在的事件监听器
        const newSessionItem = sessionItem.cloneNode(true);
        sessionItem.parentNode.replaceChild(newSessionItem, sessionItem);
        
        // 添加会话项点击事件（切换会话）- 但要排除菜单触发器区域
        newSessionItem.addEventListener('click', function(e) {
            // 如果点击的是菜单触发器或其子元素，不执行会话切换
            if (e.target.closest('.session-menu-trigger')) {
                return;
            }
            
            const sessionId = newSessionItem.getAttribute('data-session-id');
            const sessionName = newSessionItem.querySelector('.session-name').textContent;
            console.log('Session clicked:', sessionId, sessionName);
            switchToSession(sessionId, sessionName);
        });
        
        // 添加菜单按钮点击事件 - 使用内联方式绑定
        const menuTrigger = newSessionItem.querySelector('.session-menu-trigger');
        if (menuTrigger) {
            console.log('Setting up menu trigger for session', newSessionItem.getAttribute('data-session-id'));
            
            // 移除所有已有的事件监听器，改用内联事件
            const newMenuTrigger = menuTrigger.cloneNode(true);
            menuTrigger.parentNode.replaceChild(newMenuTrigger, menuTrigger);
            
            // 添加内联事件处理函数
            newMenuTrigger.setAttribute('onclick', 
                "event.preventDefault(); event.stopPropagation(); if(window.toggleSessionDropdownMenu) window.toggleSessionDropdownMenu(this.parentNode, this);");
            
            // 为确保事件不会冒泡，添加捕获阶段的事件监听器
            newMenuTrigger.addEventListener('click', function(e) {
                console.log('Menu trigger clicked (via capture) for session', newSessionItem.getAttribute('data-session-id'));
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }, true); // true表示在捕获阶段处理事件
        } else {
            console.log('Menu trigger not found for session', newSessionItem.getAttribute('data-session-id'));
        }
    });
    
    // 显示新会话创建菜单
    function showNewSessionMenu(trigger) {
        // 删除已存在的所有菜单
        document.querySelectorAll('.session-dropdown-menu').forEach(menu => menu.remove());
        const existingMenu = document.getElementById('new-session-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        // 创建菜单
        const menu = document.createElement('div');
        menu.id = 'new-session-menu';
        menu.className = 'new-session-menu';
        
        const menuItems = [
            {
                icon: 'fas fa-plus',
                textKey: 'new_session.new_chat',
                action: createNewSession
            },
            {
                icon: 'fas fa-heart',
                textKey: 'new_session.love_scenario',
                action: () => createScenarioSession('恋爱')
            },
            {
                icon: 'fas fa-calendar-alt',
                textKey: 'new_session.date_scenario',
                action: () => createScenarioSession('约会')
            },
            {
                icon: 'fas fa-comments',
                textKey: 'new_session.daily_chat',
                action: () => createScenarioSession('日常')
            }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'new-session-menu-item';
            
            // 获取翻译文本
            const translatedText = window.I18nManager ? window.I18nManager.t(item.textKey) : item.textKey;
            
            menuItem.innerHTML = `
                <i class="${item.icon}"></i>
                <span data-i18n="${item.textKey}">${translatedText}</span>
            `;
            
            menuItem.addEventListener('click', () => {
                menu.remove();
                item.action();
            });
            
            menu.appendChild(menuItem);
        });
        
        // 添加到页面
        const sessionsHeader = document.querySelector('.sessions-header');
        if (sessionsHeader) {
            sessionsHeader.appendChild(menu);
        }
        
        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== trigger) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }
    
    // 创建场景会话
    function createScenarioSession(scenario) {
        const scenarioNames = {
            '恋爱': '恋爱聊天',
            '约会': '约会计划',
            '日常': '日常闲聊'
        };
        
        const sessionName = scenarioNames[scenario] || '新会话';
        if (sessionName && sessionName.trim()) {
            createSessionWithName(sessionName.trim(), scenario);
        }
    }
    
    // 导入聊天记录功能
    function importChatHistory() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.json';
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const content = e.target.result;
                    const sessionName = prompt('请为导入的聊天记录命名:', file.name.replace(/\.[^/.]+$/, ""));
                    if (sessionName && sessionName.trim()) {
                        createSessionWithName(sessionName.trim(), '导入');
                        showToast('聊天记录导入成功', 'success');
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }
    
    // 使用指定名称和类型创建会话
    window.createSessionWithName = function createSessionWithName(sessionName, type = '普通', autoCreated = false) {
        console.log('创建会话:', sessionName, type, '自动创建:', autoCreated);
        // 创建新的会话项
        const newSessionId = 'session_' + Date.now();
        const sessionItem = document.createElement('div');
        sessionItem.className = 'session-item';
        sessionItem.setAttribute('data-session-id', newSessionId);
        
        // 根据类型选择图标
        const icons = {
            '恋爱': 'fas fa-heart',
            '约会': 'fas fa-calendar-alt',
            '日常': 'fas fa-comments',
            '导入': 'fas fa-file-import',
            '普通': 'fas fa-comment'
        };
        
        const categories = {
            '恋爱': 'category-crush',
            '约会': 'category-date',
            '日常': 'category-friend',
            '导入': 'category-other',
            '普通': ''
        };
        
        sessionItem.innerHTML = `
            <div class="session-avatar ${categories[type] || ''}">
                <i class="${icons[type] || icons['普通']}"></i>
            </div>
            <div class="session-time">Just now</div>
            <div class="session-info">
                <div class="session-name">${sessionName}</div>
                <div class="session-preview">Click to start conversation...</div>
            </div>
            <div class="session-menu-trigger" onclick="window.handleSessionMenuClick(event, this.parentNode, this);">
                <i class="fas fa-ellipsis-v"></i>
            </div>
        `;
        
        // 添加到会话列表（在"新对话"后面）
        const sessionsList = document.querySelector('.sessions-list');
        if (sessionsList) {
            const newChatSession = sessionsList.querySelector('.session-item[data-session-id="new-chat"]');
            if (newChatSession && newChatSession.nextElementSibling) {
                sessionsList.insertBefore(sessionItem, newChatSession.nextElementSibling);
            } else {
                sessionsList.appendChild(sessionItem);
            }
        }
        
        // 为新会话添加点击事件 - 但要排除菜单触发器区域
        sessionItem.addEventListener('click', function(e) {
            // 如果点击的是菜单触发器或其子元素，不执行会话切换
            if (e.target.closest('.session-menu-trigger')) {
                return;
            }
            switchToSession(newSessionId, sessionName);
        });
        
        // 菜单事件已在HTML中直接绑定，这里不需要额外处理
        console.log('Menu trigger setup completed for createSessionWithName session', newSessionId);
        
        // 如果是自动创建的会话，立即切换到它（不清空消息）
        if (autoCreated) {
            setTimeout(() => {
                switchToSession(newSessionId, sessionName, true); // 跳过清空消息
            }, 50);
        } else {
            // 自动切换到新创建的会话
            switchToSession(newSessionId, sessionName);
        }
        
        // 返回新创建的会话ID
        return newSessionId;
    }
    
    // 更新会话预览
    window.updateSessionPreview = function updateSessionPreview(message) {
        const activeSession = document.querySelector('.session-item.active');
        if (activeSession) {
            const previewEl = activeSession.querySelector('.session-preview');
            if (previewEl) {
                // 截取消息的前20个字符作为预览
                const previewText = message.length > 20 ? message.substring(0, 20) + '...' : message;
                previewEl.textContent = previewText;
            }
        }
    }
    
    // 输出初始化完成信息
    console.log('Chat sessions manager initialized with menu functionality');
    
    // 点击页面空白处关闭会话列表（仅在聊天页面有效）
    document.addEventListener('click', function(event) {
        // 只有在聊天页面激活时才处理
        const chatPage = document.getElementById('chat-page');
        if (!chatPage || !chatPage.classList.contains('active')) return;
        
        // 如果点击的不是会话列表内的元素，也不是切换按钮
        if (chatSessions && 
            !chatSessions.contains(event.target) && 
            event.target !== toggleSessionsBtn &&
            !toggleSessionsBtn.contains(event.target)) {
            closeSessionsList();
        }
    });
}

// 移除主页面标题栏函数 - 不再需要
// 保留修复二级页面标题的函数

// 移除添加页面标题栏函数 - 不再需要

// 更新页面标题
function updatePageTitle(pageName) {
    // 为不同页面设置对应的标题
    let title = '';
    switch(pageName) {
        case 'home':
            title = '首页';
            break;
        case 'chat':
            // 聊天页面标题在会话管理中处理
            return;
        case 'discover':
            title = '发现';
            break;

        case 'profile':
            title = '个人中心';
            break;
        default:
            title = '';
    }
    
    // 查找并更新对应页面的标题
    const pageId = pageName + '-page';
    const page = document.getElementById(pageId);
    if (page) {
        const titleElement = page.querySelector('.page-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

// 修复二级页面标题居中
function fixSubPageTitles() {
    // 获取所有二级页面
    const subPages = [
        document.getElementById('edit-profile-page'),
        document.getElementById('settings-page'),
        document.getElementById('statistics-page'),
        document.getElementById('vip-page'),
        document.getElementById('help-page'),
        document.getElementById('about-page')
    ];
    
    // 确保每个二级页面的标题居中显示
    subPages.forEach(page => {
        if (page) {
            const titleElement = page.querySelector('.page-title');
            if (titleElement) {
                titleElement.style.textAlign = 'center';
                titleElement.style.flex = '1';
            }
            
            // 确保页面标题栏布局正确
            const header = page.querySelector('.page-header');
            if (header) {
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';
            }
        }
    });
}

// 删除页面上所有主页面添加的标题栏
function removeAllMainPageHeaders() {
    const mainPages = [
        'home-page', 
        'chat-page', 
        'discover-page', 
        'profile-page'
    ];
    
    mainPages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            const header = page.querySelector('.page-header');
            if (header) {
                header.remove();
            }
        }
    });
}

// 绑定语言切换按钮事件
function bindLanguageSwitchEvent() {
    console.log('尝试绑定语言切换事件');
    
    // 检查I18nManager是否已加载
    if (!window.I18nManager) {
        console.warn('I18nManager未加载，延迟绑定语言切换事件');
        setTimeout(bindLanguageSwitchEvent, 500);
        return;
    }
    
    const languageSwitchBtn = document.getElementById('language-switch-btn');
    console.log('语言切换按钮元素:', languageSwitchBtn);
    
    if (languageSwitchBtn) {
        console.log('找到语言切换按钮，开始绑定事件');
        
        // 移除可能存在的旧事件监听器
        languageSwitchBtn.removeEventListener('click', handleLanguageSwitch);
        languageSwitchBtn.removeEventListener('touchend', handleLanguageSwitch);
        
        // 添加新的事件监听器
        languageSwitchBtn.addEventListener('click', handleLanguageSwitch);
        languageSwitchBtn.addEventListener('touchend', handleLanguageSwitch);
        
        // 标记事件已绑定
        languageSwitchBtn.setAttribute('data-event-bound', 'true');
        
        console.log('语言切换事件绑定完成');
        
        // 初始化语言按钮显示
        updateLanguageButton();
    } else {
        console.warn('未找到语言切换按钮元素，将在500ms后重试');
        setTimeout(bindLanguageSwitchEvent, 500);
    }
}

// 语言切换处理函数
function handleLanguageSwitch(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('语言切换按钮被触发 - 事件类型:', e.type);
    toggleLanguage();
}

// 确保I18nManager初始化
function ensureI18nManagerInitialized() {
    if (window.I18nManager && window.I18nManagerReady) {
        console.log('I18nManager已加载，开始初始化');
        // 初始化国际化
        initI18n();
        // 绑定语言切换事件
        bindLanguageSwitchEvent();
    } else {
        console.log('等待I18nManager加载...');
        setTimeout(ensureI18nManagerInitialized, 100);
    }
}

// 监听I18nManager准备就绪事件
if (typeof window !== 'undefined') {
    window.addEventListener('i18nManagerReady', function(event) {
        console.log('收到I18nManager准备就绪事件');
        ensureI18nManagerInitialized();
    });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureI18nManagerInitialized);
} else {
    // 如果页面已经加载完成，立即执行
    ensureI18nManagerInitialized();
}

// 延迟绑定，确保页面元素完全加载
setTimeout(() => {
    console.log('延迟检查语言切换按钮绑定状态');
    const btn = document.getElementById('language-switch-btn');
    if (btn && !btn.hasAttribute('data-event-bound')) {
        console.log('延迟重试绑定语言切换事件');
        bindLanguageSwitchEvent();
    }
}, 1000);

/* ========== 多模态交互功能增强 ========== */

// 增强的拖拽上传功能
class DragUploadManager {
    constructor() {
        this.isDragging = false;
        this.uploadQueue = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.allowedFileTypes = ['application/pdf', 'text/plain', '.doc', '.docx', '.txt'];
        this.init();
    }
    
    init() {
        this.createDragOverlay();
        this.bindDragEvents();
        this.bindProgressEvents();
    }
    
    createDragOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'drag-upload-overlay';
        overlay.innerHTML = `
            <div class="drag-upload-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <div>释放文件以上传</div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }
    
    bindDragEvents() {
        const chatPage = document.getElementById('chat-page');
        if (!chatPage) return;
        
        // 防止默认的拖拽行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            chatPage.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // 高亮拖拽区域
        ['dragenter', 'dragover'].forEach(eventName => {
            chatPage.addEventListener(eventName, () => this.highlight(), false);
        });
        
        // 移除高亮
        ['dragleave', 'drop'].forEach(eventName => {
            chatPage.addEventListener(eventName, () => this.unhighlight(), false);
        });
        
        // 处理文件放置
        chatPage.addEventListener('drop', (e) => this.handleDrop(e), false);
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    highlight() {
        if (!this.isDragging) {
            this.isDragging = true;
            this.overlay.style.display = 'flex';
            document.body.classList.add('dragging');
        }
    }
    
    unhighlight() {
        this.isDragging = false;
        this.overlay.style.display = 'none';
        document.body.classList.remove('dragging');
    }
    
    async handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length === 0) return;
        
        // 阐门附件面板
        const attachPanel = document.getElementById('chat-attachments-panel');
        if (attachPanel) attachPanel.classList.remove('active');
        
        // 处理多个文件
        for (let i = 0; i < files.length; i++) {
            await this.processFile(files[i]);
        }
    }
    
    async processFile(file) {
        // 验证文件
        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showError(validation.message);
            return;
        }
        
        // 添加到上传队列
        const uploadItem = {
            id: Date.now() + Math.random(),
            file: file,
            progress: 0,
            status: 'pending' // pending, uploading, completed, error
        };
        
        this.uploadQueue.push(uploadItem);
        this.showUploadProgress(uploadItem);
        
        // 开始上传
        await this.uploadFile(uploadItem);
    }
    
    validateFile(file) {
        // 文件大小检查
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                message: `文件大小超过限制（${this.formatFileSize(this.maxFileSize)}）`
            };
        }
        
        // 文件类型检查
        const isImage = this.allowedImageTypes.includes(file.type);
        const isFile = this.allowedFileTypes.some(type => 
            file.type === type || file.name.toLowerCase().endsWith(type)
        );
        
        if (!isImage && !isFile) {
            return {
                valid: false,
                message: '不支持的文件类型'
            };
        }
        
        return { valid: true };
    }
    
    showUploadProgress(uploadItem) {
        let progressContainer = document.querySelector('.upload-progress');
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'upload-progress';
            document.body.appendChild(progressContainer);
        }
        
        const progressElement = document.createElement('div');
        progressElement.className = 'upload-item';
        progressElement.dataset.uploadId = uploadItem.id;
        progressElement.innerHTML = `
            <div class="upload-icon">
                <i class="fas ${this.getFileIcon(uploadItem.file.name)}"></i>
            </div>
            <div class="upload-details">
                <div class="upload-filename">${uploadItem.file.name}</div>
                <div class="upload-progress-bar">
                    <div class="upload-progress-fill" style="width: 0%"></div>
                </div>
                <div class="upload-status">等待上传...</div>
            </div>
            <button class="upload-cancel" onclick="window.dragUploadManager.cancelUpload('${uploadItem.id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        progressContainer.appendChild(progressElement);
        progressContainer.classList.add('visible');
        
        // 自动隐藏（如果上传完成）
        setTimeout(() => {
            if (uploadItem.status === 'completed') {
                this.hideUploadProgress(uploadItem.id);
            }
        }, 3000);
    }
    
    async uploadFile(uploadItem) {
        const file = uploadItem.file;
        const progressElement = document.querySelector(`[data-upload-id="${uploadItem.id}"]`);
        const progressFill = progressElement?.querySelector('.upload-progress-fill');
        const statusElement = progressElement?.querySelector('.upload-status');
        
        try {
            uploadItem.status = 'uploading';
            if (statusElement) statusElement.textContent = '上传中...';
            
            // 模拟上传进度
            for (let progress = 0; progress <= 100; progress += 10) {
                uploadItem.progress = progress;
                if (progressFill) progressFill.style.width = progress + '%';
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // 处理文件
            if (file.type.startsWith('image/')) {
                await this.handleImageFile(file);
            } else {
                await this.handleDocumentFile(file);
            }
            
            uploadItem.status = 'completed';
            if (statusElement) statusElement.textContent = '上传完成';
            
            // 延迟隐藏进度条
            setTimeout(() => this.hideUploadProgress(uploadItem.id), 2000);
            
        } catch (error) {
            console.error('上传错误:', error);
            uploadItem.status = 'error';
            if (statusElement) statusElement.textContent = '上传失败';
            if (progressFill) progressFill.style.backgroundColor = 'var(--danger-color)';
        }
    }
    
    async handleImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const imageBase64 = e.target.result;
                    
                    // 添加用户消息（图片）
                    addMessage('user', '', 'image', imageBase64);
                    
                    // 显示分析指示器
                    showTypingIndicator('正在分析图片...');
                    
                    // 分析图片
                    const analyzeResult = await analyzeImage(imageBase64);
                    
                    // 移除分析指示器
                    removeTypingIndicator();
                    
                    if (analyzeResult) {
                        // 添加AI回复
                        addMessage('ai', analyzeResult);
                        

                    }
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    async handleDocumentFile(file) {
        const fileSize = this.formatFileSize(file.size);
        const fileIcon = this.getFileIcon(file.name);
        
        // 创建文档消息
        const docMessage = `<div class="message-file">
            <div class="file-icon">
                <i class="fas ${fileIcon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize}</div>
            </div>
        </div>`;
        
        // 添加用户消息
        addMessage('user', docMessage, 'file');
        
        // 生成AI回复
        const language = window.I18nManager ? window.I18nManager.getCurrentLanguage() : 'en-US';
        let aiReply;
        if (language.includes('zh')) {
            aiReply = `我已收到您上传的文件「${file.name}」。请告诉我您希望我如何帮助您处理这个文件，或者您有什么相关问题需要讨论。`;
        } else {
            aiReply = `I've received your file "${file.name}". Please let me know how you'd like me to help with this file or if you have any related questions to discuss.`;
        }
        
        // 显示打字指示器，然后添加AI回复
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addMessage('ai', aiReply);
            

        }, 1000);
    }
    
    cancelUpload(uploadId) {
        const index = this.uploadQueue.findIndex(item => item.id == uploadId);
        if (index !== -1) {
            this.uploadQueue.splice(index, 1);
        }
        this.hideUploadProgress(uploadId);
    }
    
    hideUploadProgress(uploadId) {
        const progressElement = document.querySelector(`[data-upload-id="${uploadId}"]`);
        if (progressElement) {
            progressElement.remove();
        }
        
        const progressContainer = document.querySelector('.upload-progress');
        if (progressContainer && progressContainer.children.length === 0) {
            progressContainer.classList.remove('visible');
        }
    }
    
    showError(message) {
        // 显示错误消息
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            alert(message);
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        
        switch(extension) {
            case 'pdf': return 'fa-file-pdf';
            case 'doc':
            case 'docx': return 'fa-file-word';
            case 'txt': return 'fa-file-alt';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp': return 'fa-file-image';
            default: return 'fa-file';
        }
    }
    
    bindProgressEvents() {
        // 监听进度点击事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.upload-progress')) {
                // 点击进度区域时不关闭
                return;
            }
        });
    }
}





// 初始化多模态交互增强功能
function initEnhancedMultiModal() {
    // 初始化拖拽上传管理器
    window.dragUploadManager = new DragUploadManager();
    
    
    // 添加全局事件监听
    document.addEventListener('paste', handlePasteEvent);
    
    console.log('🎉 多模态交互增强功能初始化完成！');
}

// 处理粘贴事件
function handlePasteEvent(e) {
    const chatPage = document.getElementById('chat-page');
    if (!chatPage || !chatPage.classList.contains('active')) return;
    
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file && window.dragUploadManager) {
                window.dragUploadManager.processFile(file);
            }
            break;
        }
    }
}



// 粘贴事件增强处理
function showPasteIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'paste-upload-indicator';
    indicator.textContent = '📸 图片已粘贴并上传';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        if (document.body.contains(indicator)) {
            document.body.removeChild(indicator);
        }
    }, 3000);
}

// 增强的粘贴事件处理
function handlePasteEvent(e) {
    const chatPage = document.getElementById('chat-page');
    if (!chatPage || !chatPage.classList.contains('active')) return;
    
    const items = e.clipboardData.items;
    let hasImage = false;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            hasImage = true;
            const file = item.getAsFile();
            if (file && window.dragUploadManager) {
                showPasteIndicator();
                window.dragUploadManager.processFile(file);
            }
            break;
        }
    }
    
    return hasImage;
}



// 确保在DOM加载完成后初始化
function ensureEnhancedMultiModalInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedMultiModal);
    } else {
        initEnhancedMultiModal();
    }
}

// 立即尝试初始化
ensureEnhancedMultiModalInit();

/**
 * 初始化地区选择联动功能
 */
function initLocationSelector() {
    const countrySelect = document.getElementById('user-country');
    const citySelect = document.getElementById('user-city');
    
    if (!countrySelect || !citySelect) return;
    
    // 定义国家对应的城市数据
    const countryCities = {
        'us': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
        'uk': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff'],
        'ca': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
        'au': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
        'de': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
        'fr': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
        'jp': ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
        'kr': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang'],
        'sg': ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
        'hk': ['Central and Western', 'Eastern', 'Southern', 'Wan Chai', 'Kowloon City', 'Kwun Tong', 'Sham Shui Po', 'Wong Tai Sin', 'Yau Tsim Mong'],
        'tw': ['Taipei', 'New Taipei', 'Taoyuan', 'Taichung', 'Tainan', 'Kaohsiung', 'Keelung', 'Hsinchu', 'Chiayi', 'Changhua'],
        'other': ['Other City']
    };
    
    // 监听国家选择变化
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        
        // 清空城市选项
        citySelect.innerHTML = '<option value="" data-i18n="edit_profile.select_city">请选择城市</option>';
        
        // 如果选择了国家，添加对应的城市选项
        if (selectedCountry && countryCities[selectedCountry]) {
            const cities = countryCities[selectedCountry];
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.toLowerCase().replace(/\s+/g, '-');
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
        
        // 更新国际化文本
        if (window.I18nManager) {
            window.I18nManager.updatePageTexts();
        }
    });
}

// 在页面加载完成后初始化地区选择器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocationSelector);
} else {
    initLocationSelector();
}

/**
 * 处理用户资料保存
 */
async function handleSaveProfile() {
    try {
        // 显示保存中提示
        showToast('正在保存...', 'info');
        
        // 获取表单数据
        const nickname = document.getElementById('user-nickname')?.value || '';
        const bio = document.getElementById('user-bio')?.value || '';
        const contact = document.getElementById('user-contact')?.value || '';
        
        // 获取性别选择
        const genderRadio = document.querySelector('input[name="user-gender"]:checked');
        const gender = genderRadio ? genderRadio.value : '';
        
        // 获取出生日期
        const birthDate = document.getElementById('user-birth')?.value || '';
        
        // 获取地区选择
        const province = document.getElementById('user-province')?.value || '';
        const city = document.getElementById('user-city')?.value || '';
        
        // 获取恋爱状态
        const relationshipRadio = document.querySelector('input[name="user-relationship"]:checked');
        const relationshipStatus = relationshipRadio ? relationshipRadio.value : '';
        
        // 获取兴趣爱好
        const interestTags = document.querySelectorAll('.interest-tag.active:not(.add-tag)');
        const interests = Array.from(interestTags).map(tag => tag.querySelector('span').textContent);
        
        // 构建更新数据
        const updateData = {};
        
        // 只添加有值的字段，避免传递空字符串或undefined
        if (nickname) updateData.username = nickname;
        if (bio) updateData.bio = bio;
        if (gender) updateData.gender = gender;
        if (birthDate) updateData.birth_date = birthDate;
        if (province) updateData.province = province;
        if (city) updateData.city = city;
        if (relationshipStatus) updateData.relationship_status = relationshipStatus;
        if (interests.length > 0) updateData.interests = interests.join(',');
        if (contact) updateData.contact = contact;
        
        // 调用后端API保存数据
        const backendService = window.backendService;
        if (!backendService) {
            throw new Error('后端服务未初始化');
        }
        
        const response = await backendService.updateUserProfile(updateData);
        
        if (response.success) {
            showToast('资料保存成功', 'success');
            
            // 更新本地存储的用户信息
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            Object.assign(currentUser, updateData);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // 更新预加载缓存数据
            if (window.cachedUserProfile) {
                Object.assign(window.cachedUserProfile, updateData);
                localStorage.setItem('cachedUserProfile', JSON.stringify(window.cachedUserProfile));
            }
            
            // 更新authManager中的用户信息
            if (window.authManager && window.authManager.currentUser) {
                Object.assign(window.authManager.currentUser, updateData);
            }
            
            console.log('用户资料更新成功:', response.data);
            
            // 保存成功后立即返回上一页
            // 隐藏编辑资料页面
            const editProfilePage = document.getElementById('edit-profile-page');
            if (editProfilePage) {
                editProfilePage.classList.remove('active');
            }
            
            // 显示个人中心主页面
            const profilePage = document.getElementById('profile-page');
            if (profilePage) {
                profilePage.classList.add('active');
            }
            
            // 显示底部导航栏
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = 'flex';
                bottomNav.style.backgroundColor = '';
                bottomNav.style.borderTop = '';
            }
        } else {
            throw new Error(response.message || '保存失败');
        }
        
    } catch (error) {
        console.error('保存用户资料失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    }
}

/**
 * 填充用户资料表单
 * @param {Object} userData - 用户数据
 */
function fillUserProfileForm(userData) {
    if (!userData) return;
    
    // 填充表单数据
    const nicknameInput = document.getElementById('user-nickname');
    if (nicknameInput && userData.username) {
        nicknameInput.value = userData.username;
    }
    
    const bioTextarea = document.getElementById('user-bio');
    if (bioTextarea && userData.bio) {
        bioTextarea.value = userData.bio;
    }
    
    const contactInput = document.getElementById('user-contact');
    if (contactInput && userData.contact) {
        contactInput.value = userData.contact;
    }
    
    // 设置性别选择
    if (userData.gender) {
        const genderRadio = document.querySelector(`input[name="user-gender"][value="${userData.gender}"]`);
        if (genderRadio) {
            genderRadio.checked = true;
        }
    }
    
    // 设置出生日期
    const birthInput = document.getElementById('user-birth');
    if (birthInput && userData.birth_date) {
        birthInput.value = userData.birth_date;
    }
    
    // 设置地区
    const provinceSelect = document.getElementById('user-province');
    if (provinceSelect && userData.province) {
        provinceSelect.value = userData.province;
    }
    
    const citySelect = document.getElementById('user-city');
    if (citySelect && userData.city) {
        citySelect.value = userData.city;
    }
    
    // 设置恋爱状态
    if (userData.relationship_status) {
        const relationshipRadio = document.querySelector(`input[name="user-relationship"][value="${userData.relationship_status}"]`);
        if (relationshipRadio) {
            relationshipRadio.checked = true;
        }
    }
    
    // 设置兴趣爱好
    if (userData.interests) {
        const interests = userData.interests.split(',').filter(interest => interest.trim());
        const interestContainer = document.querySelector('.interest-tags');
        if (interestContainer && interests.length > 0) {
            // 清除现有的兴趣标签（除了添加按钮）
            const existingTags = interestContainer.querySelectorAll('.interest-tag:not(.add-tag)');
            existingTags.forEach(tag => tag.remove());
            
            // 添加用户的兴趣标签
            const addButton = interestContainer.querySelector('.add-tag');
            interests.forEach(interest => {
                const tag = document.createElement('div');
                tag.className = 'interest-tag active';
                tag.innerHTML = `
                    <span>${interest.trim()}</span>
                    <i class="fas fa-times"></i>
                `;
                interestContainer.insertBefore(tag, addButton);
            });
        }
    }
}

/**
 * 预加载用户资料数据（应用启动时调用）
 */
async function preloadUserProfileData() {
    try {
        const backendService = window.backendService;
        if (!backendService) {
            console.log('后端服务未初始化，跳过预加载用户资料');
            return;
        }
        
        // 设置较短的超时时间，避免影响应用启动速度
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('预加载超时')), 3000);
        });
        
        // 获取用户资料并缓存
        const response = await Promise.race([
            backendService.getUserProfile(),
            timeoutPromise
        ]);
        
        if (response && response.success && response.data) {
            // 将用户资料数据缓存到全局变量和本地存储
            window.cachedUserProfile = response.data;
            localStorage.setItem('cachedUserProfile', JSON.stringify(response.data));
            console.log('用户资料数据预加载成功');
        } else {
            console.log('预加载用户资料失败或数据为空');
        }
        
    } catch (error) {
        console.log('预加载用户资料数据失败:', error.message);
    }
}

/**
 * 加载用户资料数据到编辑表单
 */
async function loadUserProfileData() {
    try {
        // 首先尝试使用预加载的缓存数据
        let userData = window.cachedUserProfile;
        if (!userData) {
            // 尝试从本地存储获取缓存数据
            const cachedData = localStorage.getItem('cachedUserProfile');
            if (cachedData) {
                try {
                    userData = JSON.parse(cachedData);
                    console.log('使用本地缓存的用户资料数据');
                } catch (e) {
                    console.error('解析缓存数据失败:', e);
                }
            }
        }
        
        // 如果有缓存数据，直接使用
        if (userData) {
            fillUserProfileForm(userData);
            console.log('用户资料数据已从缓存加载到表单');
            return;
        }
        
        // 如果没有缓存数据，则实时获取
        const backendService = window.backendService;
        if (!backendService) {
            console.error('后端服务未初始化');
            // 尝试从本地存储获取用户数据作为备用
            const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (localUser.username) {
                fillUserProfileForm(localUser);
            }
            return;
        }
        
        // 设置超时时间，避免长时间等待
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('请求超时')), 5000);
        });
        
        // 获取用户资料
        const response = await Promise.race([
            backendService.getUserProfile(),
            timeoutPromise
        ]);
        
        if (response && response.success && response.data) {
            // 更新缓存
            window.cachedUserProfile = response.data;
            localStorage.setItem('cachedUserProfile', JSON.stringify(response.data));
            
            fillUserProfileForm(response.data);
            console.log('用户资料数据已加载到表单');
        } else {
            console.log('获取用户资料失败或数据为空');
            // 尝试从本地存储获取数据作为备用
            const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (localUser.username) {
                fillUserProfileForm(localUser);
                console.log('使用本地缓存的用户数据');
            }
        }
        
    } catch (error) {
        console.error('加载用户资料数据失败:', error);
    }
}

/* 🎉 恋语 AI 多模态交互功能完整实现完成！ 🎉 */