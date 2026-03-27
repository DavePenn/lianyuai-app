// profile.js
// 个人中心：页面初始化、子页面导航、样式修复、布局
// 依赖：showPage, showToast, centerSubPageTitle (from app.js)

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

