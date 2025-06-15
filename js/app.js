// 移动APP核心功能 - 跨平台适配版本

// 语言切换功能
function toggleLanguage() {
    if (!window.I18nManager) {
        console.warn('I18nManager not loaded');
        return;
    }
    
    const currentLang = window.I18nManager.getCurrentLanguage();
    const newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    
    // 添加切换动画
    document.body.classList.add('language-switching');
    
    // 切换语言并立即刷新页面文本
    window.I18nManager.setLanguage(newLang);
    if (window.I18nManager.updatePageTexts) {
        window.I18nManager.updatePageTexts();
    }

    // 更新语言按钮文本
    updateLanguageButton();
    
    // 移除动画类
    setTimeout(() => {
        document.body.classList.remove('language-switching');
    }, 300);
}

// 更新语言按钮显示
function updateLanguageButton() {
    const currentLangElement = document.getElementById('current-language');
    if (currentLangElement && window.I18nManager) {
        const currentLang = window.I18nManager.getCurrentLanguage();
        currentLangElement.textContent = currentLang === 'zh-CN' ? '中文' : 'English';
    }
}

// 初始化国际化
function initI18n() {
    if (window.I18nManager) {
        // 添加语言变化监听器
        window.I18nManager.addObserver((language) => {
            console.log('Language changed to:', language);
            updateLanguageButton();
            updateAIResponseLanguage(language);
        });
        
        // 初始化语言按钮
        updateLanguageButton();
        
        // 更新页面文本
        window.I18nManager.updatePageTexts();
    }
}

// 更新AI回复语言
function updateAIResponseLanguage(language) {
    // 这里可以设置AI回复的语言偏好
    if (window.AI_CONFIG) {
        window.AI_CONFIG.language = language;
    }
}

// 初始化跨平台适配器
function initPlatformAdapters() {
    // 确保配置和适配器已加载
    if (typeof window.PlatformConfig === 'undefined') {
        console.warn('PlatformConfig not loaded, using default web config');
        window.PlatformConfig = {
            getPlatform: () => 'web',
            get: (key) => {
                const config = {
                    'storage.prefix': 'lianyuai_',
                    'api.baseURL': 'https://api.lianyuai.com',
                    'api.timeout': 10000
                };
                return config[key];
            },
            hasFeature: (feature) => true
        };
    }
    
    if (typeof window.StorageAdapter === 'undefined') {
        console.warn('StorageAdapter not loaded, using localStorage fallback');
        window.StorageAdapter = {
            setItem: (key, value) => localStorage.setItem('lianyuai_' + key, JSON.stringify(value)),
            getItem: (key) => {
                const item = localStorage.getItem('lianyuai_' + key);
                try { return JSON.parse(item); } catch { return item; }
            },
            removeItem: (key) => localStorage.removeItem('lianyuai_' + key)
        };
    }
    
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

// 全局发送消息函数
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
    
    // 添加用户消息
    addMessage('user', message);
    
    // 清空输入框
    chatInput.value = '';
    
    // 模拟AI正在输入
    showTypingIndicator();
    
    // 模拟AI回复延迟
    setTimeout(() => {
        // 移除输入指示器
        removeTypingIndicator();
        
        // 生成AI回复（支持多语言）
        const aiReply = generateAIReply(message);
        
        // 添加AI回复
        addMessage('ai', aiReply);
        
        // 滚动到底部
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
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

document.addEventListener('DOMContentLoaded', () => {
    // 初始化跨平台适配器
    initPlatformAdapters();
    
    // 检测平台并应用特定配置
    const platform = window.PlatformConfig.getPlatform();
    console.log('当前运行平台:', platform);
    document.body.setAttribute('data-platform', platform);
    
    // 修复移动端100vh问题
    function setVhVariable() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // 初始设置vh变量并在窗口调整大小时更新
    setVhVariable();
    window.addEventListener('resize', setVhVariable);
    
    // 平台特定初始化
    if (platform === 'capacitor') {
        initCapacitorFeatures();
    } else if (platform === 'miniprogram') {
        initMiniprogramFeatures();
    } else if (platform === 'web' && window.PlatformConfig.hasFeature('pwa')) {
        initPWAFeatures();
    }
    
    // 初始化应用
    initAppNavigation();
    initChatFeature();
    initHomeFeatures();
    initMultiModalChat();
    initChatSessionsManager();
    initScenarioSlider(); // 初始化场景卡片滑动功能
    initHeroCarousel(); // 初始化首页大卡片轮播
    initProfilePages(); // 初始化个人中心子页面
    initDarkMode(); // 初始化暗黑模式
    initI18n(); // 初始化国际化
    // 不再初始化页面标题，改为仅修复二级页面
    fixSubPageTitles();
    // 删除主页面上已添加的标题栏
    removeAllMainPageHeaders();
    
    // 绑定输入框回车事件和发送按钮点击事件
    const chatInput = document.querySelector('.chat-input-field');
    const sendButton = document.getElementById('chat-send-btn');
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // 调用具有完整会话管理逻辑的 sendMessage 函数
                if (window.sendMessage) {
                    window.sendMessage();
                }
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            // 调用具有完整会话管理逻辑的 sendMessage 函数
            if (window.sendMessage) {
                window.sendMessage();
            }
        });
    }
    
    // 触发首页选项卡的点击事件
    setTimeout(() => {
        document.querySelector('.tab-item[data-page="home"]').click();
    }, 100);
    
    console.log('恋语AI - 移动APP版已启动！');
});

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
                showToast('已开启深色模式', 'success');
                // 应用暗黑模式样式到关键元素
                applyDarkModeToElements();
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                showToast('已关闭深色模式', 'success');
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
    
    // 为每个菜单项添加点击事件
    profileMenuItems.forEach((item) => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            const page = document.getElementById(`${targetPage}-page`);
            
            if (page) {
                // 隐藏主页面
                document.getElementById('profile-page').classList.remove('active');
                
                // 显示目标子页面
                page.classList.add('active');
                
                // 确保二级页面标题居中
                centerSubPageTitle(page);
                
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
        button.addEventListener('click', () => {
            // 显示保存成功的提示
            showToast('保存成功', 'success');
            
            // 不再自动返回上一页，只显示成功提示
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
    
    // 联系客服按钮 - 不显示toast提示
    const contactButtons = document.querySelectorAll('.contact-btn');
    contactButtons.forEach(btn => {
        // 清除之前的事件监听器
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // 不显示任何toast提示
        });
    });
    
    // 社交媒体链接 - 不显示toast提示
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        // 清除之前的事件监听器
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            // 不显示任何toast提示
        });
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
            item.style.backgroundColor = 'white';
            item.style.borderRadius = 'var(--border-radius)';
            item.style.boxShadow = 'var(--shadow-sm)';
            item.style.overflow = 'hidden';
            item.style.border = '1px solid rgba(0,0,0,0.05)';
            
            // 暗黑模式适配
            if (document.body.classList.contains('dark-mode')) {
                item.style.backgroundColor = '#2c2c2c';
                item.style.borderColor = 'rgba(255,255,255,0.1)';
                item.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }
            
            const answer = item.querySelector('.faq-answer');
            if (answer) {
                answer.style.padding = '15px';
                answer.style.backgroundColor = 'rgba(0,0,0,0.03)';
                answer.style.fontSize = '14px';
                answer.style.lineHeight = '1.6';
                answer.style.display = 'none'; // 默认隐藏回答
                
                // 暗黑模式适配
                if (document.body.classList.contains('dark-mode')) {
                    answer.style.backgroundColor = 'rgba(255,255,255,0.05)';
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
                question.style.backgroundColor = 'white';
                question.style.borderBottom = '1px solid var(--border-color)';
                
                // 暗黑模式适配
                if (document.body.classList.contains('dark-mode')) {
                    question.style.backgroundColor = '#2c2c2c';
                    question.style.borderColor = 'rgba(255,255,255,0.1)';
                    question.style.color = '#f1f1f1';
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
            contactSection.style.backgroundColor = 'white';
            contactSection.style.borderRadius = 'var(--border-radius)';
            contactSection.style.padding = '20px';
            contactSection.style.marginTop = '25px';
            contactSection.style.boxShadow = 'var(--shadow)';
            contactSection.style.textAlign = 'center';
            contactSection.style.border = '1px solid rgba(0,0,0,0.05)';
            
            // 暗黑模式适配
            if (document.body.classList.contains('dark-mode')) {
                contactSection.style.backgroundColor = '#2c2c2c';
                contactSection.style.borderColor = 'rgba(255,255,255,0.1)';
                contactSection.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                
                // 确保文本颜色正确
                const headings = contactSection.querySelectorAll('h4, p');
                headings.forEach(heading => {
                    heading.style.color = '#f1f1f1';
                });
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
            appInfo.style.backgroundColor = 'white';
            appInfo.style.borderRadius = 'var(--border-radius)';
            appInfo.style.padding = '30px 20px';
            appInfo.style.boxShadow = 'var(--shadow)';
            appInfo.style.border = '1px solid rgba(0,0,0,0.05)';
            
            // 暗黑模式适配
            if (document.body.classList.contains('dark-mode')) {
                appInfo.style.backgroundColor = '#2c2c2c';
                appInfo.style.borderColor = 'rgba(255,255,255,0.1)';
                appInfo.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
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
            section.style.backgroundColor = 'white';
            section.style.borderRadius = 'var(--border-radius)';
            section.style.padding = '20px';
            section.style.marginBottom = '20px';
            section.style.boxShadow = 'var(--shadow-sm)';
            section.style.border = '1px solid rgba(0,0,0,0.05)';
            
            // 暗黑模式适配
            if (document.body.classList.contains('dark-mode')) {
                section.style.backgroundColor = '#2c2c2c';
                section.style.borderColor = 'rgba(255,255,255,0.1)';
                section.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
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
        
        // 美化社交链接区域
        const socialSection = aboutPage.querySelector('.social-section');
        if (socialSection) {
            socialSection.style.backgroundColor = 'white';
            socialSection.style.borderRadius = 'var(--border-radius)';
            socialSection.style.padding = '20px';
            socialSection.style.marginBottom = '20px';
            socialSection.style.boxShadow = 'var(--shadow-sm)';
            socialSection.style.textAlign = 'center';
            socialSection.style.border = '1px solid rgba(0,0,0,0.05)';
            
            // 暗黑模式适配
            if (document.body.classList.contains('dark-mode')) {
                socialSection.style.backgroundColor = '#2c2c2c';
                socialSection.style.borderColor = 'rgba(255,255,255,0.1)';
                socialSection.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }
            
            const title = socialSection.querySelector('h4');
            if (title) {
                title.style.fontSize = '18px';
                title.style.marginBottom = '15px';
                title.style.color = 'var(--primary-color)';
                title.style.display = 'inline-block';
            }
        }
        
        // 美化社交链接
        const socialLinks = aboutPage.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.style.width = '45px';
            link.style.height = '45px';
            link.style.backgroundColor = 'var(--primary-color)';
            link.style.color = 'white';
            link.style.borderRadius = '50%';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
            link.style.justifyContent = 'center';
            link.style.fontSize = '20px';
            link.style.margin = '0 10px';
            link.style.boxShadow = '0 4px 8px rgba(255, 62, 121, 0.2)';
            link.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            
            // 添加悬停效果
            link.addEventListener('mouseover', () => {
                link.style.transform = 'translateY(-3px)';
                link.style.boxShadow = '0 6px 12px rgba(255, 62, 121, 0.3)';
            });
            
            link.addEventListener('mouseout', () => {
                link.style.transform = 'translateY(0)';
                link.style.boxShadow = '0 4px 8px rgba(255, 62, 121, 0.2)';
            });
        });
        
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
        
        // 更新卡片状态
        scenarioCards.forEach((card, i) => {
            card.classList.remove('active-scenario');
            if (i === currentIndex) {
                card.classList.add('active-scenario');
            }
        });
        
        // 更新指示器状态
        indicatorDots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === currentIndex) {
                dot.classList.add('active');
            }
        });
        
        // 滚动到当前卡片
        scenarioCards[currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
    
    // 滚动监听
    let isScrolling = false;
    let scrollTimeout;
    
    scenariosContainer.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
        }
        
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            
            // 计算当前可视区域中心点
            const containerWidth = scenariosContainer.offsetWidth;
            const scrollLeft = scenariosContainer.scrollLeft;
            const centerPoint = scrollLeft + (containerWidth / 2);
            
            // 找到中心点对应的卡片
            let minDistance = Infinity;
            let closestCardIndex = 0;
            
            scenarioCards.forEach((card, index) => {
                const cardLeft = card.offsetLeft;
                const cardCenter = cardLeft + (card.offsetWidth / 2);
                const distance = Math.abs(cardCenter - centerPoint);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCardIndex = index;
                }
            });
            
            // 更新活动卡片
            if (closestCardIndex !== currentIndex) {
                setActiveCard(closestCardIndex);
            }
        }, 100);
    });
    
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
            
            // 强制滚动到底部，使用 setTimeout + requestAnimationFrame 确保DOM已完全更新
            setTimeout(() => {
                requestAnimationFrame(() => {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 1000; // 添加额外距离确保滚动到底部
                    
                    // 再次滚动以确保可靠性
                    setTimeout(() => {
                        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 1000;
                    }, 50);
                });
            }, 50);
            
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
        const currentSessionId = window.chatSessionManager?.currentSessionId || 'new-chat';
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
        
        // 清空输入框（已经在主函数中清空了，这里删除重复操作）
        // chatInput.value = '';
        
        // 显示AI正在输入
        if (window.chatSessionManager) {
            window.chatSessionManager.showTypingIndicator();
        } else {
            showTypingIndicator();
        }
        
        // 模拟AI回复延迟
        setTimeout(async () => {
            // 移除输入指示器
            if (window.chatSessionManager) {
                window.chatSessionManager.removeTypingIndicator();
            } else {
                removeTypingIndicator();
            }
            
            // 生成AI回复
            const aiReply = await generateAIReply(message);
            
            // 添加AI回复到会话和UI
            if (window.chatSessionManager) {
                window.chatSessionManager.addMessage(sessionId, 'ai', aiReply);
                window.chatSessionManager.addMessageToUI('ai', aiReply);
            } else {
                addMessage('ai', aiReply);
                scrollToBottom();
            }
            
            // 确保滚动到底部 - 多次尝试以确保滚动成功
            setTimeout(() => {
                const chatMessagesContainer = document.getElementById('chat-messages');
                if (chatMessagesContainer) {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 1000; // 添加额外距离确保滚动到底部
                    
                    // 再次尝试滚动
                    setTimeout(() => {
                        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 1000;
                        
                        // 第三次尝试
                        setTimeout(() => {
                            const container = document.querySelector('.chat-container');
                            if (container) {
                                container.scrollTop = container.scrollHeight + 1000;
                            }
                            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 1000;
                        }, 100);
                    }, 100);
                }
            }, 100);
            
            // 更新会话预览
            if (window.updateSessionPreview) {
                window.updateSessionPreview(aiReply);
            }
            
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
    
    // 绑定发送消息事件
    console.log('Binding send button click event...');
    sendButton.addEventListener('click', function(e) {
        console.log('Send button clicked!');
        e.preventDefault();
        sendMessage();
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    console.log('Chat feature initialized successfully');
    
    // 添加消息到聊天界面（备用方案，现在应该使用 chatSessionManager.addMessageToUI）
    function addMessage(sender, text) {
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
                <p>${text}</p>
            </div>
        `;
        
        // 更新会话预览（副标题）
        if (window.updateSessionPreview) {
            window.updateSessionPreview(text);
        }
        
        // 确保消息有足够的间距
        messageDiv.style.marginBottom = "5px";
        
        chatMessagesContainer.appendChild(messageDiv);
        
        // 滚动到底部
        if (window.scrollToBottom) {
            window.scrollToBottom();
        } else {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
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
        
        // 确保滚动到底部
        scrollToBottom();
        
        // 多次尝试滚动确保显示输入指示器
        setTimeout(() => {
            scrollToBottom();
            
            setTimeout(() => {
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight + 1000;
                }
            }, 100);
        }, 50);
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
                // 调用AI服务生成回复
                const response = await window.aiService.generateChatReply(userMessage, '');
                
                // 检查是否有JSON格式的响应
                if (response && response.suggestions && response.suggestions.length > 0) {
                    // 返回第一个建议作为默认回复
                    return formatAIResponse(response);
                }
                
                // 如果没有正确格式的响应，返回原始文本
                return response.suggestions?.[0]?.reply || response.toString();
            }
        } catch (error) {
            console.error('AI回复生成错误:', error);
            // 出错时使用本地回复逻辑作为备选
        }
        
        // 本地回复逻辑作为备选
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('你好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
            return '你好！很高兴为你提供恋爱沟通建议。可以告诉我你遇到了什么问题吗？';
        } else if (lowerMessage.includes('怎么开场') || lowerMessage.includes('开场白')) {
            return '好的开场白应该自然、有趣且能引起对方的兴趣。根据对方的资料，你可以这样说：\n\n"看到你喜欢旅行，最近去过什么有趣的地方吗？我一直想去XXX，不知道你有没有去过？"';
        } else if (lowerMessage.includes('不回复') || lowerMessage.includes('不回我')) {
            return '对方不回复可能有多种原因，不要着急。你可以：\n\n1. 给对方一些空间和时间\n2. 下次发送更有价值的内容\n3. 用开放性问题重新引起对话\n\n避免连续发送多条消息或显得太急切。';
        } else if (lowerMessage.includes('约会') || lowerMessage.includes('邀约')) {
            return '邀约应该自然且有具体计划。你可以这样说：\n\n"最近新开了一家日料店，评价很不错。周末有空一起去尝尝吗？"';
        } else {
            return '我理解你想提升沟通技巧。基于你的描述，我建议：\n\n1. 保持真实自然的态度\n2. 多提开放性问题\n3. 认真倾听对方的回应\n4. 适当分享自己的经历和感受\n\n你想了解哪方面的具体技巧呢？';
        }
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
            return '我理解你想提升沟通技巧。建议保持自然真诚的态度，多提开放性问题，认真倾听对方的回应。';
        }
    }
    
    // 滚动到聊天窗口底部 - 优化版本，确保可靠滚动
    function scrollToBottom() {
        const chatContainer = document.querySelector('.chat-container');
        const chatMessages = document.getElementById('chat-messages');
        
        if (chatContainer) {
            // 立即滚动
            chatContainer.scrollTop = chatContainer.scrollHeight + 1000;
            
            // 延迟滚动确保内容已经渲染
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight + 1000;
                
                // 还要确保 chat-messages 也滚动到底部
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight + 1000;
                }
                
                // 第三次尝试，确保滚动生效
                setTimeout(() => {
                    chatContainer.scrollTop = chatContainer.scrollHeight + 1000;
                    if (chatMessages) {
                        chatMessages.scrollTop = chatMessages.scrollHeight + 1000;
                    }
                }, 100);
            }, 50);
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
    
    // 文档上传
    const documentUploadInput = document.getElementById('document-upload');
    const documentOption = document.querySelector('.attachment-option:nth-child(3)');
    if(documentUploadInput && documentOption) {
        // 点击文档选项时触发文件选择
        documentOption.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            documentUploadInput.click();
        });
        
        // 使用触摸事件确保移动端兼容性
        documentOption.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            documentUploadInput.click();
        }, { passive: false });
        
        // 处理文档上传
        documentUploadInput.addEventListener('change', handleDocumentUpload);
    }
    
    // 聊天记录上传
    const chatLogUploadInput = document.getElementById('chat-log-upload');
    const chatLogOption = document.querySelector('.attachment-option:nth-child(4)');
    if(chatLogUploadInput && chatLogOption) {
        // 点击聊天记录选项时触发文件选择
        chatLogOption.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            chatLogUploadInput.click();
        });
        
        // 使用触摸事件确保移动端兼容性
        chatLogOption.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            chatLogUploadInput.click();
        }, { passive: false });
        
        // 处理聊天记录上传
        chatLogUploadInput.addEventListener('change', handleChatLogUpload);
    }
    
    // 语音输入
    const voiceBtn = document.getElementById('chat-voice-btn');
    if(voiceBtn && 'webkitSpeechRecognition' in window) {
        voiceBtn.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleVoiceInput();
        });
        
        voiceBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleVoiceInput();
        }, { passive: false });
    } else if(voiceBtn) {
        voiceBtn.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            e.preventDefault();
            showToast('您的浏览器不支持语音输入功能', 'warning');
        });
        
        voiceBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            showToast('您的浏览器不支持语音输入功能', 'warning');
        }, { passive: false });
    }
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
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
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
                        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
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

// 处理文档上传
function handleDocumentUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 关闭附件面板
    document.getElementById('chat-attachments-panel').classList.remove('active');
    
    // 获取文件大小
    const fileSize = formatFileSize(file.size);
    
    // 获取文件图标
    const fileIcon = getFileIcon(file.name);
    
    // 创建文档消息
    const docMessage = `<div class="message-file">
        <div class="file-icon">
            <i class="${fileIcon}"></i>
        </div>
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${fileSize}</div>
        </div>
    </div>`;
    
    // 获取当前会话
    if (window.chatSessionManager) {
        // 添加用户文档消息
        window.chatSessionManager.addMessage(
            window.chatSessionManager.currentSessionId, 
            'user', 
            docMessage
        );
        
        // 添加到UI
        const messageEl = document.createElement('div');
        messageEl.className = `message user-message`;
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user" style="font-size: 20px; color: #aaa;"></i>
            </div>
            <div class="message-content">
                ${docMessage}
            </div>
        `;
        
        document.getElementById('chat-messages').appendChild(messageEl);
        
        // 滚动到底部
        const chatContainer = document.querySelector('.chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // 显示AI正在输入
        window.chatSessionManager.showTypingIndicator();
        
        // 读取文件内容并生成AI回复
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            // 移除输入指示器
            window.chatSessionManager.removeTypingIndicator();
            
            // 获取文件内容（对于文本文件）
            let fileContent = '';
            let aiReply = '';
            
            if (file.type === 'text/plain') {
                fileContent = e.target.result;
                
                // 限制文本长度
                if (fileContent.length > 500) {
                    fileContent = fileContent.substring(0, 500) + '...（内容已截断）';
                }
                
                // 尝试使用AI服务分析文档
                try {
                    if (window.aiService) {
                        // 使用AI服务分析文档
                        const analyzeResult = await window.aiService.generateChatReply(
                            '请分析这个文档内容: ' + fileContent, 
                            '', 
                            { documentAnalysis: true }
                        );
                        
                        if (analyzeResult) {
                            aiReply = analyzeResult;
                        } else {
                            aiReply = `我已经收到了你上传的文档 "${file.name}"。这是一个文本文件，我看到了其中的一些内容。你希望我如何帮助你分析这个文档？`;
                        }
                    } else {
                        aiReply = `我已经收到了你上传的文档 "${file.name}"。这是一个文本文件，但我目前无法深入分析其内容。你可以告诉我你希望从这个文档中获取什么信息？`;
                    }
                } catch (error) {
                    console.error('文档分析错误:', error);
                    aiReply = `我已经收到了你上传的文档 "${file.name}"，但在分析过程中遇到了一些问题。你可以直接告诉我你想了解的内容。`;
                }
            } else if (file.type === 'application/pdf') {
                aiReply = `我收到了你上传的PDF文档 "${file.name}"。如果你有特定的问题或需要我对文档内容进行分析，请告诉我你感兴趣的部分。`;
            } else {
                aiReply = `我收到了你上传的文档 "${file.name}"。如果你有特定的问题或需要我对文档内容进行分析，请告诉我你感兴趣的部分。`;
            }
            
            // 添加AI回复
            window.chatSessionManager.addMessage(
                window.chatSessionManager.currentSessionId, 
                'ai', 
                aiReply
            );
            window.chatSessionManager.addMessageToUI('ai', aiReply);
        };
        
        if (file.type === 'text/plain') {
            reader.readAsText(file);
        } else {
            // 对于非文本文件，不需要读取内容
            setTimeout(() => {
                // 移除输入指示器
                window.chatSessionManager.removeTypingIndicator();
                
                // 添加AI回复
                const aiReply = `我收到了你上传的文档 "${file.name}"。如果你有特定的问题或需要我对文档内容进行分析，请告诉我你感兴趣的部分。`;
                
                window.chatSessionManager.addMessage(
                    window.chatSessionManager.currentSessionId, 
                    'ai', 
                    aiReply
                );
                window.chatSessionManager.addMessageToUI('ai', aiReply);
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
    }
    
    // 重置input，允许选择相同文件
    event.target.value = '';
}// 处理聊天记录上传
function handleChatLogUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 关闭附件面板
    document.getElementById('chat-attachments-panel').classList.remove('active');
    
    // 图片或文本文件处理
    if (file.type.match('image.*')) {
        // 作为图片处理
        handleImageUpload(event);
    } else {
        // 作为文本处理
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            
            // 限制长度，防止内容过长
            const maxLength = 2000;
            const displayContent = content.length > maxLength 
                ? content.substring(0, maxLength) + '...(内容已截断)' 
                : content;
            
            // 添加用户消息
            if (window.chatSessionManager) {
                // 显示截断的内容
                window.chatSessionManager.addMessage(
                    window.chatSessionManager.currentSessionId, 
                    'user', 
                    `<div class="uploaded-chat-log">聊天记录：</div><pre style="font-size:13px;white-space:pre-wrap;overflow:auto;max-height:200px;">${displayContent}</pre>`
                );
                
                // 添加到UI
                const messageEl = document.createElement('div');
                messageEl.className = `message user-message`;
                messageEl.innerHTML = `
                    <div class="message-avatar">
                        <i class="fas fa-user" style="font-size: 20px; color: #aaa;"></i>
                    </div>
                    <div class="message-content">
                        <div class="uploaded-chat-log">聊天记录：</div>
                        <pre style="font-size:13px;white-space:pre-wrap;overflow:auto;max-height:200px;">${displayContent}</pre>
                    </div>
                `;
                
                document.getElementById('chat-messages').appendChild(messageEl);
                
                // 滚动到底部
                const chatContainer = document.querySelector('.chat-container');
                chatContainer.scrollTop = chatContainer.scrollHeight;
                
                // 显示AI正在输入
                window.chatSessionManager.showTypingIndicator();
                
                // 使用全部内容生成AI回复
                setTimeout(async () => {
                    // 移除输入指示器
                    window.chatSessionManager.removeTypingIndicator();
                    
                    // 生成AI回复
                    let aiReply = '';
                    
                    try {
                        if (window.aiService) {
                            // 使用AI服务分析聊天记录
                            const analyzeResult = await window.aiService.generateChatReply(
                                '请分析这段聊天记录并给出建议: ' + content, 
                                '', 
                                { chatLogAnalysis: true }
                            );
                            
                            if (analyzeResult) {
                                aiReply = analyzeResult;
                            } else {
                                aiReply = '我已经收到了你分享的聊天记录。根据内容分析，以下是我的一些建议：\n\n1. 保持对话的自然流畅\n2. 适当表达自己的情感和想法\n3. 提出开放性问题，延续话题\n\n需要我针对某个特定部分提供更详细的建议吗？';
                            }
                        } else {
                            aiReply = '我已经收到了你分享的聊天记录。如果你想要我分析其中的特定部分或者提供回复建议，请告诉我你最关心的问题。';
                        }
                    } catch (error) {
                        console.error('聊天记录分析错误:', error);
                        aiReply = '我已经收到了你分享的聊天记录，但在分析过程中遇到了一些问题。你可以告诉我你最关心的是哪个部分，我会尽力提供帮助。';
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
                            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                        }
                    }, 100);
                }, 2000);
            }
        };
        
        reader.readAsText(file);
    }
    
    // 重置input，允许选择相同文件
    event.target.value = '';
}

// 语音输入功能
function toggleVoiceInput() {
    const voiceBtn = document.getElementById('chat-voice-btn');
    const chatInput = document.querySelector('.chat-input-field');
    
    // 检查是否已在录音
    if (voiceBtn.classList.contains('recording')) {
        // 停止录音
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        
        if (window.recognition) {
            window.recognition.stop();
        }
    } else {
        // 开始录音
        if ('webkitSpeechRecognition' in window) {
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            
            const recognition = new webkitSpeechRecognition();
            window.recognition = recognition;
            
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'zh-CN';
            
            recognition.onstart = () => {
                // 不显示toast提示
            };
            
            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // 更新输入框
                chatInput.value = finalTranscript || interimTranscript;
            };
            
            recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                // 不显示toast提示
            };
            
            recognition.onend = () => {
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            };
            
            recognition.start();
        } else {
            // 不显示toast提示
        }
    }
}

// 图片分析功能
async function analyzeImage(imageBase64) {
    // 模拟图像分析，实际项目中应调用AI服务
    if (window.aiService) {
        try {
            // 此处应调用支持图像分析的AI模型
            // 以下代码仅为示例，实际应通过API调用支持图像理解的模型
            return '我看到了你发送的图片。这似乎是一张照片，你想让我分析其中的内容还是希望得到关于图片中情景的建议？';
        } catch (error) {
            console.error('图片分析错误:', error);
            return null;
        }
    }
    return null;
}

// 文件大小格式化
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取文件图标
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    switch(extension) {
        case 'pdf':
            return 'fas fa-file-pdf';
        case 'doc':
        case 'docx':
            return 'fas fa-file-word';
        case 'xls':
        case 'xlsx':
            return 'fas fa-file-excel';
        case 'ppt':
        case 'pptx':
            return 'fas fa-file-powerpoint';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'fas fa-file-image';
        case 'txt':
            return 'fas fa-file-alt';
        default:
            return 'fas fa-file';
    }
}

// 简化的菜单处理函数 - 直接创建菜单而不依赖复杂的逻辑
window.handleSessionMenuClick = function(event, sessionItem, menuTrigger) {
    console.log("=== 菜单点击开始 ===");
    console.log("sessionItem:", sessionItem);
    console.log("menuTrigger:", menuTrigger);
    
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
    
    // 删除所有现有菜单
    document.querySelectorAll('.session-dropdown-menu').forEach(menu => menu.remove());
    
    // 获取会话ID
    const sessionId = sessionItem.getAttribute('data-session-id');
    const isDefaultSession = sessionId === 'new-chat';
    
    console.log("会话ID:", sessionId, "是否为默认会话:", isDefaultSession);
    
    // 直接创建菜单HTML - 使用原有样式
    const menuHTML = `
        <div class="session-dropdown-menu">
            <div class="session-menu-item ${isDefaultSession ? 'disabled' : ''}" onclick="handleRename('${sessionId}')">
                <i class="fas fa-edit"></i>
                <span>重命名</span>
            </div>
            <div class="session-menu-item ${isDefaultSession ? 'disabled' : ''}" onclick="handleDelete('${sessionId}')">
                <i class="fas fa-trash"></i>
                <span>删除</span>
            </div>
        </div>
    `;
    
    // 直接插入HTML
    sessionItem.insertAdjacentHTML('beforeend', menuHTML);
    
    console.log("菜单HTML已插入");
    
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
window.handleRename = function(sessionId) {
    console.log("重命名会话:", sessionId);
    
    // 阻止事件冒泡
    event.stopPropagation();
    
    if (sessionId === 'new-chat') {
        // 使用Toast提示而不是alert
        window.showToast ? window.showToast('默认会话不能重命名', 'warning') : alert('默认会话不能重命名');
    } else {
        const newName = prompt('请输入新的会话名称:');
        if (newName && newName.trim()) {
            const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
            const nameEl = sessionItem.querySelector('.session-name');
            if (nameEl) {
                nameEl.textContent = newName.trim();
                // 使用Toast提示而不是alert
                window.showToast ? window.showToast('会话重命名成功', 'success') : alert('重命名成功');
            }
        }
    }
    // 关闭菜单
    document.querySelectorAll('.session-dropdown-menu').forEach(menu => menu.remove());
};

// 处理删除
window.handleDelete = function(sessionId) {
    console.log("删除会话:", sessionId);
    
    // 阻止事件冒泡
    event.stopPropagation();
    
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
                        window.switchToSession('new-chat', '新对话');
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
    titleElement.innerHTML = '<span id="current-session-title">默认会话</span>';
    
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
            titleElement.textContent = '聊天';
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
                <div class="session-time">刚刚</div>
                <div class="session-info">
                    <div class="session-name">${sessionName.trim()}</div>
                    <div class="session-preview">点击开始对话...</div>
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
            titleElement.textContent = sessionName;
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
                
                // 如果是"新对话"，显示欢迎消息
                if (sessionId === 'new-chat') {
                    const welcomeMessage = document.createElement('div');
                    welcomeMessage.className = 'message ai-message';
                    welcomeMessage.innerHTML = `
                        <div class="message-avatar ai">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>👋 嗨！我是恋语AI，准备好开始一个全新的对话了！有什么我可以帮助你的吗？</p>
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
            { icon: 'fas fa-trash-alt', text: '删除会话', action: clearChat },
            { icon: 'fas fa-comment-dots', text: '快速回复', action: showQuickReplies },
            { icon: 'fas fa-question-circle', text: '聊天助手', action: showChatAssistant }
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
            showToast('新对话不能删除', 'error');
            return;
        }
        
        if (window.confirm('确定要删除当前会话吗？')) {
            // 从会话列表中删除会话项
            const sessionItem = document.querySelector(`.session-item[data-session-id="${currentSessionId}"]`);
            if (sessionItem && sessionItem.parentNode) {
                sessionItem.parentNode.removeChild(sessionItem);
            }
            
            // 切换到"新对话"
            switchToSession('new-chat', '新对话');
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
            <h3>快速回复</h3>
            <button class="close-panel-btn"><i class="fas fa-times"></i></button>
        `;
        quickRepliesPanel.appendChild(panelHeader);
        
        // 添加快速回复选项
        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'quick-replies-container';
        
        // 预设的快速回复模板
        const quickReplies = [
            {
                title: '开场白',
                templates: [
                    '嗨，看到你喜欢旅行，最近去过什么好玩的地方吗？',
                    '你好，我对你的兴趣很感兴趣，能多聊聊吗？',
                    '今天天气真好，正好适合聊天，你觉得呢？'
                ]
            },
            {
                title: '回应消息',
                templates: [
                    '你说的这个很有趣，我也有类似的经历...',
                    '这个话题真不错，我很想了解更多你的想法',
                    '哈哈，你说的太有意思了，让我想到...'
                ]
            },
            {
                title: '约会邀请',
                templates: [
                    '最近有一家新开的餐厅很不错，周末有空一起去尝尝吗？',
                    '我刚买了两张电影票，想邀请你周五一起去看，有兴趣吗？',
                    '听说市中心有个新展览，感觉你可能会喜欢，要不要找时间一起去看看？'
                ]
            },
            {
                title: '安抚情绪',
                templates: [
                    '我能理解你的感受，这确实不容易，需要我做些什么吗？',
                    '听你这么说我很心疼，有什么是我能帮到你的吗？',
                    '这种情况确实令人沮丧，不过我相信你能处理好，我会一直支持你'
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
                    <h3>聊天助手</h3>
                    <button class="close-dialog-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="assistant-dialog-body">
                    <div class="assistant-tip">
                        <i class="fas fa-lightbulb"></i>
                        <div class="tip-content">
                            <h4>使用AI助手</h4>
                            <p>输入你想要讨论的话题或者遇到的问题，AI会为你提供有用的回复建议。</p>
                        </div>
                    </div>
                    <div class="assistant-tip">
                        <i class="fas fa-comment-dots"></i>
                        <div class="tip-content">
                            <h4>快速回复</h4>
                            <p>点击右上角菜单中的"快速回复"选项，可以获取常用对话模板。</p>
                        </div>
                    </div>
                    <div class="assistant-tip">
                        <i class="fas fa-image"></i>
                        <div class="tip-content">
                            <h4>多媒体支持</h4>
                            <p>点击左下角的"+"按钮可以发送图片、拍照或上传聊天记录。</p>
                        </div>
                    </div>
                    <div class="assistant-tip">
                        <i class="fas fa-comments"></i>
                        <div class="tip-content">
                            <h4>创建多个会话</h4>
                            <p>点击会话列表右上角的"+"按钮可以创建新的会话，为不同的对象或场景分类管理。</p>
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
        console.log('立即体验演示功能被调用');
        
        // 创建一个"回复建议"类型的会话
        const sessionId = window.createSessionWithName('回复建议', 'reply-suggest', true);
        
        // 确保菜单事件正确绑定
        setTimeout(() => {
            const sessionItem = document.querySelector(`[data-session-id="${sessionId}"]`);
            if (sessionItem) {
                const menuTrigger = sessionItem.querySelector('.session-menu-trigger');
                if (menuTrigger && !menuTrigger.hasAttribute('onclick')) {
                    console.log('手动绑定菜单事件给tryNowDemoFunction创建的会话');
                    menuTrigger.setAttribute('onclick', 'window.handleSessionMenuClick(event, this.parentNode, this);');
                }
            }
        }, 100);
        
        // 切换到该会话
        window.switchToSession(sessionId, '回复建议');
        
        // 添加示例消息
        if (window.chatSessionManager) {
            // 添加对方的消息
            window.chatSessionManager.addMessage(sessionId, 'partner', 'Hi，今天过得怎么样？');
            window.chatSessionManager.addMessageToUI('partner', 'Hi，今天过得怎么样？');
            
            // 延迟显示AI建议
            setTimeout(() => {
                const aiSuggestion = `我为你生成了3种回复风格：
                
🌟 **温暖亲近**
"今天还不错呢！刚好想起你了，你那边怎么样？"

💼 **稳重礼貌** 
"今天过得挺充实的，谢谢关心。你今天有什么有趣的事情吗？"

😊 **轻松幽默**
"哈哈，被你这么一问突然觉得今天特别美好！你是不是有什么好事要分享？"

选择最适合你们关系的回复风格吧！`;
                
                window.chatSessionManager.addMessage(sessionId, 'ai', aiSuggestion);
                window.chatSessionManager.addMessageToUI('ai', aiSuggestion);
                
                // 确保滚动到底部
                setTimeout(() => {
                    const chatMessagesContainer = document.getElementById('chat-messages');
                    if (chatMessagesContainer) {
                        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                    }
                }, 100);
            }, 1000);
        }
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
                text: '重命名会话', 
                action: renameCurrentSession,
                disabled: isDefaultSession 
            },
            { 
                icon: 'fas fa-trash-alt', 
                text: '删除会话', 
                action: deleteCurrentSession,
                disabled: isDefaultSession 
            },
            { 
                icon: 'fas fa-sort', 
                text: '排序会话', 
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
            showToast('新对话不能删除', 'warning');
            return;
        }
        
        if (window.confirm('确定要删除当前会话吗？删除后无法恢复。')) {
            // 获取要删除的会话元素
            const sessionItem = document.querySelector(`.session-item[data-session-id="${sessionId}"]`);
            
            // 切换到"新对话"
            switchToSession('new-chat', '新对话');
            
            // 删除会话元素
            if (sessionItem) {
                sessionItem.remove();
            }
            
            showToast('会话已删除', 'success');
        }
    }
    
    // 排序会话
    function sortSessions() {
        showToast('会话排序功能即将上线', 'info');
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
                text: '重命名',
                action: function() {
                    console.log('Rename clicked for session', sessionId);
                    renameSession(sessionId);
                },
                disabled: isDefaultSession
            },
            {
                icon: 'fas fa-times',
                text: '删除',
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
                    if (item.text === '重命名') {
                        showToast('默认会话不能重命名', 'warning');
                    } else if (item.text === '删除') {
                        showToast('默认会话不能删除', 'warning');
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
        // 删除已存在的菜单
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
                text: '新建聊天',
                action: createNewSession
            },
            {
                icon: 'fas fa-heart',
                text: '恋爱场景',
                action: () => createScenarioSession('恋爱')
            },
            {
                icon: 'fas fa-calendar-alt',
                text: '约会场景',
                action: () => createScenarioSession('约会')
            },
            {
                icon: 'fas fa-comments',
                text: '日常聊天',
                action: () => createScenarioSession('日常')
            }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'new-session-menu-item';
            menuItem.innerHTML = `
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
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
            <div class="session-time">刚刚</div>
            <div class="session-info">
                <div class="session-name">${sessionName}</div>
                <div class="session-preview">点击开始对话...</div>
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
        case 'message':
            title = '消息';
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
        'message-page', 
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