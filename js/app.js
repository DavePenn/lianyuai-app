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

// --- Dark mode module moved to js/dark-mode.js ---
// --- Profile pages module moved to js/profile.js ---
// --- Home UI module moved to js/home-ui.js ---

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






// --- Profile data & enhanced multimodal moved to js/profile-data.js ---
