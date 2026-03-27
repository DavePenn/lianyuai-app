// dark-mode.js
// 暗色/亮色主题切换：初始化、应用样式、重置样式

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
