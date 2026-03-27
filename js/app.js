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
        const profileLanguagePill = document.getElementById('profile-language-pill');
        if (profileLangElement) {
            // Use the appropriate translation key based on current language
            const langKey = currentLang === AppConstants.LANG_ZH ? 'settings.language.chinese' : 'settings.language.english';
            const langText = window.I18nManager.t(langKey);
            profileLangElement.textContent = langText;
            if (profileLanguagePill) {
                profileLanguagePill.textContent = langText;
            }
        }
    }
}

function getBestAvailableProfileData(preferredUserData) {
    if (preferredUserData && typeof preferredUserData === 'object') {
        return preferredUserData;
    }

    if (window.cachedUserProfile && typeof window.cachedUserProfile === 'object') {
        return window.cachedUserProfile;
    }

    if (window.authManager && window.authManager.currentUser) {
        return window.authManager.currentUser;
    }

    try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (storedUser && Object.keys(storedUser).length > 0) {
            return storedUser;
        }
    } catch (error) {
        console.warn('读取本地用户信息失败:', error);
    }

    return null;
}

function syncProfileIdentityCard(preferredUserData) {
    const profileData = getBestAvailableProfileData(preferredUserData);
    const nameElement = document.getElementById('profile-display-name');
    const bioElement = document.getElementById('profile-display-bio');
    const membershipElement = document.getElementById('profile-membership-pill');

    if (!nameElement || !bioElement || !membershipElement) {
        return;
    }

    const displayName = profileData && profileData.username
        ? profileData.username
        : 'LoveChat User';
    const displayBio = profileData && profileData.bio
        ? profileData.bio
        : 'Your AI-assisted dating practice hub for guided openers, reply coaching, and Discover content drills.';
    const isDemoAccount = displayName.toLowerCase() === 'test123'
        || (profileData && profileData.email === 'test123@lianyu.ai');

    nameElement.textContent = displayName;
    bioElement.textContent = displayBio;
    membershipElement.textContent = isDemoAccount ? 'Demo Account' : 'Standard Preview';
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

function normalizeInteractiveButtonTypes() {
    document.querySelectorAll('button.back-btn, button[data-demo-nav], button[data-demo-action], button[data-secondary-target], button[data-legal-target], button[data-discover-action], button.notice-link, button.profile-quick-card, button.menu-item, button.settings-nav-link').forEach((button) => {
        if (!button.getAttribute('type')) {
            button.setAttribute('type', 'button');
        }
    });
}

function installGlobalBackButtonFallbacks() {
    document.querySelectorAll('.back-btn').forEach((button) => {
        button.type = 'button';
        button.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
            }
            handleBackButtonInteraction(button);
            return false;
        };
    });
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
    if (window.__lianyuMainAppInitialized) {
        return;
    }
    window.__lianyuMainAppInitialized = true;

    // Initialize cross-platform adapters
    initPlatformAdapters();
    normalizeInteractiveButtonTypes();
    installGlobalBackButtonFallbacks();

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
    initDiscoverFeatures();
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
    initSupportAndLegalPages();
    initDemoShortcutButtons();
    initRelationshipAnalysis();
    initUnifiedInteractionLayer();
    initChallengeArticles();
    initDarkMode();
    initI18n();
    syncProfileIdentityCard();
    
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
        
        // 移动端键盘适配增强
        chatInput.addEventListener('focus', () => {
            // 延迟滚动到聊天底部，确保键盘弹出后正确定位
            setTimeout(() => {
                const chatContainer = document.querySelector('.chat-messages-container');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }, 300);
        });
        
        // 输入时自动调整高度（如果需要）
        chatInput.addEventListener('input', () => {
            // 可以在这里添加自动调整输入框高度的逻辑
            if (window.mobileKeyboardHandler && window.mobileKeyboardHandler.isKeyboardVisible) {
                // 键盘显示时的特殊处理
                setTimeout(() => {
                    window.mobileKeyboardHandler.scrollInputIntoView(chatInput);
                }, 100);
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
        const isDemoMode = window.DEMO_SKIP_LOGIN === true;
        const token = localStorage.getItem('auth_token');
        const isLoggedIn = isDemoMode || (token && token !== 'null' && token !== '');
        
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
            syncProfileIdentityCard();
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

// Common Chat Challenges: article-like detail pages
function initChallengeArticles() {
    const cards = document.querySelectorAll('.problem-card');
    cards.forEach(card => {
        if (!card.hasAttribute('data-article-id')) {
            const titleEl = card.querySelector('h4');
            const autoId = titleEl ? titleEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'article';
            card.setAttribute('data-article-id', autoId);
        }
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-article-id');
            showArticleById(id, card);
        });
    });

    const backBtn = document.getElementById('article-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            goBackFromSecondaryPage(document.getElementById('article-page'));
        });
    }
}

function showArticleById(articleId, sourceCard) {
    const page = document.getElementById('article-page');
    const titleEl = document.getElementById('article-title');
    const bodyEl = document.getElementById('article-body');
    if (!page || !titleEl || !bodyEl) return;

    const tmpl = document.getElementById(`article-content-${articleId}`);
    const fallbackTitle = (sourceCard && sourceCard.querySelector('h4') && sourceCard.querySelector('h4').textContent) ? sourceCard.querySelector('h4').textContent.trim() : 'Article';
    titleEl.textContent = (tmpl && tmpl.getAttribute('data-title')) ? tmpl.getAttribute('data-title') : fallbackTitle;
    bodyEl.innerHTML = tmpl ? tmpl.innerHTML : `<p class="article-note">No content yet. Edit the hidden block with id="article-content-${articleId}" in index.html.</p>`;

    openSecondaryPage('article', getCurrentActivePageId());
}

function getCurrentActivePageId() {
    const activePage = document.querySelector('.app-page.active');
    if (activePage && activePage.id) {
        return activePage.id.replace(/-page$/, '');
    }

    return document.body.getAttribute('data-current-page') || 'home';
}

function openSecondaryPage(pageId, returnPageId) {
    const page = document.getElementById(`${pageId}-page`);
    if (!page || typeof showPage !== 'function') {
        return false;
    }

    const sourcePage = returnPageId || getCurrentActivePageId();
    page.dataset.returnPage = sourcePage;

    showPage(pageId);
    centerSubPageTitle(page);

    if (page.querySelector('.page-content')) {
        page.querySelector('.page-content').scrollTop = 0;
    }
    page.scrollTop = 0;

    return true;
}

function goBackFromSecondaryPage(page) {
    if (!page || typeof showPage !== 'function') {
        return false;
    }

    const returnPageId = page.dataset.returnPage || 'profile';
    page.removeAttribute('data-return-page');
    showPage(returnPageId);

    if (typeof updateNavigation === 'function' && ['home', 'chat', 'discover', 'profile'].includes(returnPageId)) {
        updateNavigation(returnPageId);
    }

    return true;
}

function initSupportAndLegalPages() {
    const secondaryTriggers = document.querySelectorAll('[data-secondary-target], [data-legal-target]');
    secondaryTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => {
            event.preventDefault();

            const targetPage = trigger.dataset.secondaryTarget || trigger.dataset.legalTarget;
            const sourcePage = getCurrentActivePageId();

            if (targetPage) {
                openSecondaryPage(targetPage, sourcePage);
            }
        });
    });
}

function navigateToMainPage(targetPage) {
    if (!targetPage || typeof showPage !== 'function') {
        return;
    }

    showPage(targetPage);
    if (typeof updateNavigation === 'function') {
        updateNavigation(targetPage);
    }

    if (targetPage === 'chat') {
        window.setTimeout(() => {
            const input = document.getElementById('chat-input') || document.querySelector('.chat-input-field');
            if (input) {
                input.focus();
            }
        }, 120);
    }
}

function startRelationshipAnalysisDemo(prefill = null) {
    if (typeof window.openRelationshipAnalysisExperience !== 'function') {
        return;
    }

    window.openRelationshipAnalysisExperience(prefill || {
        concern: 'how_to_reply',
        currentGoal: 'keep_chatting',
        customQuestion: 'I want to know what this current rhythm suggests before I reply.',
        extraNotes: 'Focus on whether the conversation still feels warm and what kind of next move fits the current tone.'
    });
}

function handleBackButtonInteraction(button) {
    const currentPage = button ? button.closest('.app-page') : null;
    if (!currentPage) {
        return false;
    }

    if (currentPage.dataset.returnPage) {
        return goBackFromSecondaryPage(currentPage);
    }

    const pageId = currentPage.id ? currentPage.id.replace(/-page$/, '') : '';
    const profileFallbackPages = new Set([
        'edit-profile',
        'settings',
        'statistics',
        'vip',
        'help',
        'about',
        'terms',
        'privacy',
        'ai-disclaimer',
        'support'
    ]);

    if (pageId === 'relationship-analysis-result') {
        openRelationshipAnalysisInput();
        return true;
    }

    if (pageId === 'content-detail') {
        showPage('discover');
        if (typeof updateNavigation === 'function') {
            updateNavigation('discover');
        }
        return true;
    }

    if (profileFallbackPages.has(pageId)) {
        showPage('profile');
        if (typeof updateNavigation === 'function') {
            updateNavigation('profile');
        }
        return true;
    }

    showPage('home');
    if (typeof updateNavigation === 'function') {
        updateNavigation('home');
    }
    return true;
}

function initUnifiedInteractionLayer() {
    if (document.body.dataset.unifiedInteractionLayer === 'true') {
        return;
    }

    document.body.dataset.unifiedInteractionLayer = 'true';
    document.addEventListener('click', (event) => {
        const backTrigger = event.target.closest('.back-btn');
        if (backTrigger) {
            event.preventDefault();
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
            }
            handleBackButtonInteraction(backTrigger);
            return;
        }

        const secondaryTrigger = event.target.closest('[data-secondary-target], [data-legal-target]');
        if (secondaryTrigger) {
            const targetPage = secondaryTrigger.dataset.secondaryTarget || secondaryTrigger.dataset.legalTarget;
            if (!targetPage) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
            }
            openSecondaryPage(targetPage, getCurrentActivePageId());
            return;
        }

        const demoNavTrigger = event.target.closest('[data-demo-nav]');
        if (demoNavTrigger) {
            const targetPage = demoNavTrigger.dataset.demoNav;
            if (!targetPage) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === 'function') {
                event.stopImmediatePropagation();
            }
            navigateToMainPage(targetPage);
            return;
        }

        const demoActionTrigger = event.target.closest('[data-demo-action]');
        if (!demoActionTrigger) {
            return;
        }

        const action = demoActionTrigger.dataset.demoAction;
        if (!action) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
        }

        if (action === 'start-chat') {
            navigateToMainPage('chat');
            window.setTimeout(() => {
                if (typeof window.tryNowDemoFunction === 'function') {
                    window.tryNowDemoFunction();
                }
            }, 200);
            return;
        }

        if (action === 'start-analysis') {
            startRelationshipAnalysisDemo();
        }
    }, true);
}

function initDemoShortcutButtons() {
    document.querySelectorAll('[data-demo-nav]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            navigateToMainPage(trigger.dataset.demoNav);
        });
    });

    document.querySelectorAll('[data-demo-action="start-chat"]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            navigateToMainPage('chat');

            window.setTimeout(() => {
                if (typeof window.tryNowDemoFunction === 'function') {
                    window.tryNowDemoFunction();
                }
            }, 200);
        });
    });

    document.querySelectorAll('[data-demo-action="start-analysis"]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            startRelationshipAnalysisDemo();
        });
    });
}


// --- Relationship Analysis module moved to js/relationship-analysis.js ---

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
                // 重置为浅色模式样式
                removeDarkModeStyles();
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
                    // 重置为浅色模式样式
                    removeDarkModeStyles();
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

// 重置深色模式样式，恢复浅色模式
function removeDarkModeStyles() {
    // 帮助中心页面样式重置
    const helpPage = document.getElementById('help-page');
    if (helpPage) {
        const searchInput = helpPage.querySelector('.search-box input');
        if (searchInput) {
            searchInput.style.backgroundColor = '';
            searchInput.style.borderColor = '';
            searchInput.style.color = '';
        }
        
        const faqItems = helpPage.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.style.backgroundColor = '';
            item.style.borderColor = '';
            item.style.boxShadow = '';
            
            const question = item.querySelector('.faq-question');
            if (question) {
                question.style.backgroundColor = '';
                question.style.borderColor = '';
                question.style.color = '';
            }
            
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.style.backgroundColor = '';
                answer.style.color = '';
            }
        });
        
        const contactSection = helpPage.querySelector('.contact-section');
        if (contactSection) {
            contactSection.style.backgroundColor = '';
            contactSection.style.borderColor = '';
            contactSection.style.boxShadow = '';
            
            const texts = contactSection.querySelectorAll('h4, p');
            texts.forEach(text => {
                text.style.color = '';
            });
        }
    }
    
    // 关于我们页面样式重置
    const aboutPage = document.getElementById('about-page');
    if (aboutPage) {
        const sections = aboutPage.querySelectorAll('.app-info, .team-section, .mission-section, .social-section');
        sections.forEach(section => {
            section.style.backgroundColor = '';
            section.style.borderColor = '';
            section.style.boxShadow = '';
            
            // 重置文本颜色
            const texts = section.querySelectorAll('p, h2, h4');
            texts.forEach(text => {
                if (!text.classList.contains('app-version')) {
                    text.style.color = '';
                }
            });
        });
        
        const appVersion = aboutPage.querySelector('.app-version');
        if (appVersion) {
            appVersion.style.backgroundColor = '';
        }
        
        const termsSection = aboutPage.querySelector('.terms-section');
        if (termsSection) {
            termsSection.style.borderColor = '';
            
            const links = termsSection.querySelectorAll('a');
            links.forEach(link => {
                link.style.backgroundColor = '';
            });
        }
    }
}

// 初始化个人中心子页面
function initProfilePages() {
    // 获取个人中心菜单项
    const profileMenuItems = document.querySelectorAll('#profile-page .menu-item[data-page]');
    const logoutButton = document.getElementById('logout-btn');
    
    // 获取所有子页面
    const subPages = [
        document.getElementById('edit-profile-page'),
        document.getElementById('settings-page'),
        document.getElementById('statistics-page'),
        document.getElementById('vip-page'),
        document.getElementById('help-page'),
        document.getElementById('about-page'),
        document.getElementById('terms-page'),
        document.getElementById('privacy-page'),
        document.getElementById('ai-disclaimer-page'),
        document.getElementById('support-page')
    ];
    
    // 仅绑定个人中心子页面自己的返回按钮，避免污染其他模块
    const backButtons = subPages
        .filter(Boolean)
        .reduce((allButtons, page) => allButtons.concat(Array.from(page.querySelectorAll('.back-btn'))), []);
    
    // 新增：个人中心顶部折叠交互（Large Title 稳定状态机）
    // 移除profile-header滚动吸顶逻辑，采用固定透明渐变设计
    const profilePage = document.getElementById('profile-page');
    if (profilePage) {
        // 保持简洁，无需复杂的滚动状态管理
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

                openSecondaryPage(targetPage, 'profile');
                
                // 如果是About页面，重新应用样式
                if (targetPage === 'about') {
                    setTimeout(() => {
                        fixSubPagesLayout();
                        forceApplyAboutPageStyles();
                    }, 100);
                }
                
                // 确保页面内容在顶部
                page.scrollTop = 0;
            }
        });
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (window.authManager && typeof window.authManager.logout === 'function') {
                window.authManager.logout();
            }
        });
    }
    
    // 为个人中心子页面返回按钮添加点击事件
    backButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const currentPage = button.closest('.app-page');
            if (currentPage && currentPage.dataset.returnPage) {
                goBackFromSecondaryPage(currentPage);
                return;
            }

            // 对于其他页面，执行原有的返回逻辑
            subPages.forEach(page => {
                if (page) page.classList.remove('active');
            });

            document.getElementById('profile-page').classList.add('active');

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
                showToast((window.i18n && window.i18n.t) ? window.i18n.t('common.save_success') : 'Save successful', 'success');
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
    
}

// 显示Toast消息
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


// --- Chat feature module moved to js/chat-feature.js ---

// --- Chat sessions module moved to js/chat-sessions.js ---

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
        const progressFill = progressElement ? progressElement.querySelector('.upload-progress-fill') : null;
        const statusElement = progressElement ? progressElement.querySelector('.upload-status') : null;
        
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
                    const imageDataUrl = e.target.result;

                    // 获取/创建会话
                    let sessionId = window.chatSessionManager?.currentSessionId || 'new-chat';
                    if (sessionId === 'new-chat' && window.createSessionWithName) {
                        sessionId = window.createSessionWithName('图片分析', '普通', true);
                    }

                    // 显示用户图片消息
                    const imageHtml = `<div class="message-image"><img src="${imageDataUrl}" alt="上传的图片"></div>`;
                    if (window.chatSessionManager) {
                        window.chatSessionManager.addMessage(sessionId, 'user', imageHtml);
                        window.chatSessionManager.addMessageToUI('user', imageHtml);
                    }

                    // OCR 提取文字
                    let contextMessage = '用户发送了一张图片。';
                    const bs = window.backendService;
                    if (bs && typeof bs.extractTextFromImage === 'function') {
                        try {
                            const ocrResult = await bs.extractTextFromImage(file);
                            const extractedText = ocrResult?.data?.extractedText || '';
                            if (extractedText.trim()) {
                                contextMessage = `用户发送了一张图片，其中包含以下文字内容：\n${extractedText}\n\n请基于图片中的文字内容，提供恋爱沟通方面的分析和建议。`;
                            } else {
                                contextMessage = '用户发送了一张图片，但无法识别其中的文字。请友好地告知用户，并询问他们想讨论什么。';
                            }
                        } catch (ocrError) {
                            console.error('OCR 提取失败:', ocrError);
                        }
                    }

                    // AI 回复
                    if (window.continueWithAIReply) {
                        window.continueWithAIReply(contextMessage, sessionId);
                    } else if (window.chatSessionManager) {
                        window.chatSessionManager.addMessage(sessionId, 'ai', contextMessage);
                        window.chatSessionManager.addMessageToUI('ai', contextMessage);
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
        showToast((window.i18n && window.i18n.t) ? window.i18n.t('common.saving') : 'Saving...', 'info');
        
        // 获取表单数据
        const nickname = document.getElementById('user-nickname') ? document.getElementById('user-nickname').value : '';
        const bio = document.getElementById('user-bio') ? document.getElementById('user-bio').value : '';
        const contact = document.getElementById('user-contact') ? document.getElementById('user-contact').value : '';
        
        // 获取性别选择
        const genderRadio = document.querySelector('input[name="user-gender"]:checked');
        const gender = genderRadio ? genderRadio.value : '';
        
        // 获取出生日期
        const birthDate = document.getElementById('user-birth') ? document.getElementById('user-birth').value : '';
        
        // 获取地区选择
        const province = document.getElementById('user-province') ? document.getElementById('user-province').value : '';
        const city = document.getElementById('user-city') ? document.getElementById('user-city').value : '';
        
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
            showToast((window.i18n && window.i18n.t) ? window.i18n.t('common.save_success') : 'Saved successfully', 'success');
            
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

            syncProfileIdentityCard({
                ...(window.authManager && window.authManager.currentUser ? window.authManager.currentUser : {}),
                ...currentUser,
                ...updateData
            });
            
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
            throw new Error(response.message || ((window.i18n && window.i18n.t) ? window.i18n.t('common.save_failed') : 'Save failed'));
        }
        
    } catch (error) {
        console.error('保存用户资料失败:', error);
        showToast(((window.i18n && window.i18n.t) ? window.i18n.t('common.save_failed') : 'Save failed') + ': ' + error.message, 'error');
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
            syncProfileIdentityCard(response.data);
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
            syncProfileIdentityCard(userData);
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
                syncProfileIdentityCard(localUser);
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
            syncProfileIdentityCard(response.data);
            console.log('用户资料数据已加载到表单');
        } else {
            console.log('获取用户资料失败或数据为空');
            // 尝试从本地存储获取数据作为备用
            const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (localUser.username) {
                fillUserProfileForm(localUser);
                syncProfileIdentityCard(localUser);
                console.log('使用本地缓存的用户数据');
            }
        }
        
    } catch (error) {
        console.error('加载用户资料数据失败:', error);
    }
}

/* 🎉 恋语 AI 多模态交互功能完整实现完成！ 🎉 */
