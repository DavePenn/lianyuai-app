// chat-sessions.js
// 聊天会话管理：会话列表、创建/删除/重命名会话、消息管理、UI 渲染
// 依赖：showPage, showToast (from app.js)
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
        openAIAssistantTool('opener');
    }

    function escapeAssistantHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function assistantText(key, fallback) {
        if (window.I18nManager && typeof window.I18nManager.t === 'function') {
            return window.I18nManager.t(key);
        }
        return fallback;
    }

    function fillChatInput(text) {
        const chatInput = document.querySelector('.chat-input-field');
        if (!chatInput) {
            return;
        }

        chatInput.value = text;
        chatInput.focus();
        showToast(assistantText('chat.assistant.inserted', 'Inserted into chat input'), 'success');
    }

    function sendTextToChat(text) {
        const chatInput = document.querySelector('.chat-input-field');
        if (!chatInput) {
            showToast(assistantText('chat.assistant.service_unavailable', 'Chat input is not available right now'), 'error');
            return;
        }

        if (window.isAIReplying) {
            showToast(assistantText('chat.assistant.wait_for_reply', 'Wait for the current AI reply to finish first'), 'warning');
            return;
        }

        chatInput.value = text;
        if (typeof window.sendMessage === 'function') {
            window.sendMessage();
            showToast(assistantText('chat.assistant.sent', 'Sent to current chat'), 'success');
        }
    }

    function getCurrentSessionContext() {
        const chatInput = document.querySelector('.chat-input-field');
        const draftMessage = chatInput ? chatInput.value.trim() : '';
        const activeSession = document.querySelector('.session-item.active');
        const sessionName = activeSession ? (activeSession.querySelector('.session-name')?.textContent || '').trim() : '';
        const currentSessionId = window.chatSessionManager?.currentSessionId || 'new-chat';
        const sessionMessages = Array.isArray(window.chatSessionManager?.sessions?.[currentSessionId])
            ? window.chatSessionManager.sessions[currentSessionId]
            : [];
        const recentMessages = sessionMessages.slice(-6);
        const latestHumanMessage = [...recentMessages]
            .reverse()
            .find(message => message.sender === 'user' || message.sender === 'partner')?.content || draftMessage;
        const conversationSnippet = recentMessages
            .map(message => {
                const senderLabel = message.sender === 'ai'
                    ? 'AI'
                    : message.sender === 'partner'
                        ? assistantText('chat.assistant.context.partner', 'Partner')
                        : assistantText('chat.assistant.context.me', 'Me');
                return `${senderLabel}: ${message.content}`;
            })
            .join('\n');
        const dateKeywords = /(date|dating|coffee|movie|dinner|weekend|restaurant|约会|见面|周末|电影|餐厅|咖啡)/i;
        const inferredDateType = dateKeywords.test(`${sessionName}\n${conversationSnippet}`)
            ? assistantText('chat.assistant.form.date_type_default', '第一次约会')
            : '';
        const inferredRelationship = /crush|暗恋|喜欢|暧昧/i.test(sessionName)
            ? assistantText('chat.assistant.context.relationship_crush', '暧昧对象')
            : assistantText('chat.assistant.form.relationship_default', '朋友');
        const inferredMood = /(sad|angry|upset|tired|难过|生气|烦|累|尴尬)/i.test(`${latestHumanMessage}\n${conversationSnippet}`)
            ? assistantText('chat.assistant.context.mood_sensitive', '有点复杂')
            : assistantText('chat.assistant.form.mood_default', '正常');

        return {
            currentSessionId,
            sessionName,
            draftMessage,
            latestHumanMessage,
            recentMessages,
            conversationSnippet,
            inferredDateType,
            inferredRelationship,
            inferredMood
        };
    }

    function getAssistantPrefill(toolId) {
        const context = getCurrentSessionContext();

        switch (toolId) {
            case 'emotion':
                return {
                    message: context.latestHumanMessage || context.conversationSnippet
                };
            case 'opener':
                return {
                    context: context.sessionName && context.sessionName !== 'New Chat' && context.sessionName !== '新对话'
                        ? context.sessionName
                        : assistantText('chat.assistant.form.context_default', '初次聊天'),
                    interests: '',
                    personality: ''
                };
            case 'date-plan':
                return {
                    dateType: context.inferredDateType || assistantText('chat.assistant.form.date_type_default', '第一次约会'),
                    interests: '',
                    location: '',
                    budget: ''
                };
            case 'topics':
            default:
                return {
                    relationship: context.inferredRelationship,
                    mood: context.inferredMood,
                    recentEvents: context.conversationSnippet,
                    commonInterests: ''
                };
        }
    }

    function applyAssistantPrefill(formEl, values) {
        Object.entries(values || {}).forEach(([key, value]) => {
            const field = formEl.querySelector(`[name="${key}"]`);
            if (!field || value === undefined || value === null || value === '') {
                return;
            }

            field.value = value;
        });
    }

    function buildAssistantForm(toolId) {
        switch (toolId) {
            case 'emotion':
                return `
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.message_label', 'Message to analyze')}</span>
                        <textarea name="message" class="assistant-textarea" rows="4" placeholder="${assistantText('chat.assistant.form.message_placeholder', 'Paste the message or chat fragment you want analyzed')}"></textarea>
                    </label>
                `;
            case 'opener':
                return `
                    <div class="assistant-form-grid">
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.target_gender', 'Target gender')}</span>
                            <select name="targetGender" class="assistant-input">
                                <option value="female">${assistantText('chat.assistant.form.gender_female', 'Female')}</option>
                                <option value="male">${assistantText('chat.assistant.form.gender_male', 'Male')}</option>
                                <option value="other">${assistantText('chat.assistant.form.gender_other', 'Other')}</option>
                            </select>
                        </label>
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.target_age', 'Target age')}</span>
                            <input name="targetAge" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.target_age_placeholder', 'e.g. 25')}">
                        </label>
                    </div>
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.interests', 'Interests')}</span>
                        <input name="interests" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.interests_placeholder', 'movies, coffee, hiking')}">
                    </label>
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.personality', 'Personality')}</span>
                        <input name="personality" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.personality_placeholder', 'outgoing, gentle, humorous')}">
                    </label>
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.context', 'Context')}</span>
                        <input name="context" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.context_placeholder', 'first chat, social app, classmate')}" value="${assistantText('chat.assistant.form.context_default', '初次聊天')}">
                    </label>
                `;
            case 'date-plan':
                return `
                    <div class="assistant-form-grid">
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.location', 'Location')}</span>
                            <input name="location" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.location_placeholder', 'Shanghai, Xuhui')}">
                        </label>
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.budget', 'Budget')}</span>
                            <input name="budget" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.budget_placeholder', '200-500 CNY')}">
                        </label>
                    </div>
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.shared_interests', 'Shared interests')}</span>
                        <input name="interests" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.shared_interests_placeholder', 'art, desserts, music')}">
                    </label>
                    <div class="assistant-form-grid">
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.date_type', 'Date type')}</span>
                            <input name="dateType" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.date_type_placeholder', 'First date')}" value="${assistantText('chat.assistant.form.date_type_default', '第一次约会')}">
                        </label>
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.duration', 'Duration')}</span>
                            <input name="duration" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.duration_placeholder', '2-3 hours')}" value="${assistantText('chat.assistant.form.duration_default', '2-3小时')}">
                        </label>
                    </div>
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.weather', 'Weather')}</span>
                        <input name="weather" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.weather_placeholder', 'sunny / rainy')}" value="${assistantText('chat.assistant.form.weather_default', '晴天')}">
                    </label>
                `;
            case 'topics':
            default:
                return `
                    <div class="assistant-form-grid">
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.relationship', 'Relationship')}</span>
                            <input name="relationship" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.relationship_placeholder', 'friend / crush / partner')}" value="${assistantText('chat.assistant.form.relationship_default', '朋友')}">
                        </label>
                        <label class="assistant-field">
                            <span>${assistantText('chat.assistant.form.mood', 'Mood')}</span>
                            <input name="mood" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.mood_placeholder', 'happy / tired / awkward')}" value="${assistantText('chat.assistant.form.mood_default', '正常')}">
                        </label>
                    </div>
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.recent_events', 'Recent events')}</span>
                        <textarea name="recentEvents" class="assistant-textarea" rows="3" placeholder="${assistantText('chat.assistant.form.recent_events_placeholder', 'What happened recently between you two?')}"></textarea>
                    </label>
                    <label class="assistant-field">
                        <span>${assistantText('chat.assistant.form.common_interests', 'Common interests')}</span>
                        <input name="commonInterests" class="assistant-input" type="text" placeholder="${assistantText('chat.assistant.form.common_interests_placeholder', 'travel, games, food')}">
                    </label>
                `;
        }
    }

    function buildAssistantPayload(toolId, formData) {
        const getValue = (key) => (formData.get(key) || '').trim();

        switch (toolId) {
            case 'emotion':
                return { message: getValue('message') };
            case 'opener':
                return {
                    targetGender: getValue('targetGender'),
                    targetAge: getValue('targetAge'),
                    interests: getValue('interests'),
                    personality: getValue('personality'),
                    context: getValue('context')
                };
            case 'date-plan':
                return {
                    location: getValue('location'),
                    budget: getValue('budget'),
                    interests: getValue('interests'),
                    dateType: getValue('dateType'),
                    duration: getValue('duration'),
                    weather: getValue('weather')
                };
            case 'topics':
            default:
                return {
                    relationship: getValue('relationship'),
                    mood: getValue('mood'),
                    recentEvents: getValue('recentEvents'),
                    commonInterests: getValue('commonInterests')
                };
        }
    }

    function renderAssistantResult(toolId, result) {
        if (toolId === 'emotion') {
            return `
                <div class="assistant-result-card">
                    <h4>${assistantText('chat.assistant.result.emotion_title', 'Emotion Analysis')}</h4>
                    <div class="assistant-result-meta">
                        <span>${assistantText('chat.assistant.result.emotion_label', 'Emotion')}: ${escapeAssistantHTML(result.emotion || 'neutral')}</span>
                        <span>${assistantText('chat.assistant.result.intensity_label', 'Intensity')}: ${escapeAssistantHTML(result.intensity || '5')}</span>
                    </div>
                    <p>${escapeAssistantHTML(result.suggestion || result.analysis || 'Stay warm and empathetic in your reply.')}</p>
                    ${Array.isArray(result.keywords) && result.keywords.length ? `<div class="assistant-tags">${result.keywords.map(keyword => `<span>${escapeAssistantHTML(keyword)}</span>`).join('')}</div>` : ''}
                    ${result.suggestion ? `<div class="assistant-result-actions"><button class="assistant-inline-btn" data-insert-text="${escapeAssistantHTML(result.suggestion)}">${assistantText('chat.assistant.actions.use_suggestion', 'Use Suggestion')}</button><button class="assistant-inline-btn assistant-inline-btn-secondary" data-send-text="${escapeAssistantHTML(result.suggestion)}">${assistantText('chat.assistant.actions.send_now', 'Send Now')}</button></div>` : ''}
                </div>
            `;
        }

        if (toolId === 'opener') {
            const items = Array.isArray(result.openers) ? result.openers : [];
            return items.map(item => `
                <div class="assistant-result-card">
                    <h4>${escapeAssistantHTML(item.style || 'Style')}</h4>
                    <p>${escapeAssistantHTML(item.content || '')}</p>
                    <small>${escapeAssistantHTML(item.reason || '')}</small>
                    ${item.content ? `<div class="assistant-result-actions"><button class="assistant-inline-btn" data-insert-text="${escapeAssistantHTML(item.content)}">${assistantText('chat.assistant.actions.use_opener', 'Use This Opener')}</button><button class="assistant-inline-btn assistant-inline-btn-secondary" data-send-text="${escapeAssistantHTML(item.content)}">${assistantText('chat.assistant.actions.send_now', 'Send Now')}</button></div>` : ''}
                </div>
            `).join('');
        }

        if (toolId === 'date-plan') {
            const plan = result.plan || {};
            const activities = Array.isArray(plan.activities) ? plan.activities : [];
            const alternatives = Array.isArray(plan.alternatives) ? plan.alternatives : [];
            return `
                <div class="assistant-result-card">
                    <h4>${escapeAssistantHTML(plan.title || assistantText('chat.assistant.result.date_plan_title', 'Date Plan'))}</h4>
                    ${activities.map(activity => `
                        <div class="assistant-schedule-item">
                            <strong>${escapeAssistantHTML(activity.time || '')}</strong>
                            <p>${escapeAssistantHTML(activity.activity || '')}</p>
                            <small>${escapeAssistantHTML(activity.location || '')} · ${escapeAssistantHTML(activity.cost || '')}</small>
                            ${activity.tips ? `<small>${escapeAssistantHTML(activity.tips)}</small>` : ''}
                        </div>
                    `).join('')}
                    ${plan.totalCost ? `<p><strong>${assistantText('chat.assistant.result.total_cost_label', 'Total Cost')}:</strong> ${escapeAssistantHTML(plan.totalCost)}</p>` : ''}
                    ${alternatives.length ? `<div class="assistant-tags">${alternatives.map(item => `<span>${escapeAssistantHTML(item)}</span>`).join('')}</div>` : ''}
                </div>
            `;
        }

        const topics = Array.isArray(result.topics) ? result.topics : [];
        return topics.map(item => `
                <div class="assistant-result-card">
                    <h4>${escapeAssistantHTML(item.topic || assistantText('chat.assistant.result.topic_title', 'Topic'))}</h4>
                    <p>${escapeAssistantHTML(item.description || '')}</p>
                    ${item.starter ? `<div class="assistant-highlight">${escapeAssistantHTML(item.starter)}</div>` : ''}
                    ${item.starter ? `<div class="assistant-result-actions"><button class="assistant-inline-btn" data-insert-text="${escapeAssistantHTML(item.starter)}">${assistantText('chat.assistant.actions.use_starter', 'Use Starter')}</button><button class="assistant-inline-btn assistant-inline-btn-secondary" data-send-text="${escapeAssistantHTML(item.starter)}">${assistantText('chat.assistant.actions.send_now', 'Send Now')}</button></div>` : ''}
                </div>
        `).join('');
    }

    function bindAssistantResultActions(container) {
        container.querySelectorAll('[data-insert-text]').forEach(button => {
            button.addEventListener('click', () => {
                fillChatInput(button.getAttribute('data-insert-text'));
            });
        });

        container.querySelectorAll('[data-send-text]').forEach(button => {
            button.addEventListener('click', () => {
                sendTextToChat(button.getAttribute('data-send-text'));
            });
        });
    }

    function openAIAssistantTool(defaultTool = 'opener', options = {}) {
        let pendingPrefill = options.prefill || null;
        let pendingAutoSubmit = options.autoSubmit === true;

        const toolMap = {
            emotion: {
                title: assistantText('chat.assistant.tool.emotion.title', 'Emotion Analysis'),
                description: assistantText('chat.assistant.tool.emotion.description', 'Analyze a message and get a supportive reply direction.'),
                icon: 'fas fa-heart-pulse',
                action: (payload) => window.aiService.analyzeEmotion(payload.message)
            },
            opener: {
                title: assistantText('chat.assistant.tool.opener.title', 'Openers'),
                description: assistantText('chat.assistant.tool.opener.description', 'Generate tailored conversation starters.'),
                icon: 'fas fa-comment-dots',
                action: (payload) => window.aiService.generateOpener(payload)
            },
            'date-plan': {
                title: assistantText('chat.assistant.tool.date_plan.title', 'Date Plan'),
                description: assistantText('chat.assistant.tool.date_plan.description', 'Build a practical date itinerary.'),
                icon: 'fas fa-calendar-check',
                action: (payload) => window.aiService.planDate(payload)
            },
            topics: {
                title: assistantText('chat.assistant.tool.topics.title', 'Topic Suggestions'),
                description: assistantText('chat.assistant.tool.topics.description', 'Get topic ideas for the current relationship stage.'),
                icon: 'fas fa-comments',
                action: (payload) => window.aiService.suggestTopics(payload)
            }
        };

        let assistantDialog = document.querySelector('.chat-assistant-dialog');
        if (!assistantDialog) {
            assistantDialog = document.createElement('div');
            assistantDialog.className = 'chat-assistant-dialog';
            assistantDialog.innerHTML = `
                <div class="assistant-dialog-content assistant-dialog-content-wide">
                    <div class="assistant-dialog-header">
                        <h3>${window.I18nManager ? window.I18nManager.t('chat.assistant.title') : 'Chat Assistant'}</h3>
                        <button class="close-dialog-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="assistant-dialog-body">
                        <div class="assistant-tip">
                            <i class="fas fa-sparkles"></i>
                            <div class="tip-content">
                                <h4>${assistantText('chat.assistant.tools.title', 'AI Tools')}</h4>
                                <p>${assistantText('chat.assistant.tools.description', 'Use the tools below to analyze conversations, generate openers, plan dates, and find better topics.')}</p>
                            </div>
                        </div>
                        <div class="assistant-tools-grid"></div>
                        <div class="assistant-tool-panel">
                            <div class="assistant-tool-panel-header">
                                <h4 class="assistant-tool-title"></h4>
                                <p class="assistant-tool-description"></p>
                            </div>
                            <form class="assistant-tool-form"></form>
                            <div class="assistant-tool-results"></div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(assistantDialog);

            const closeButton = assistantDialog.querySelector('.close-dialog-btn');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    assistantDialog.remove();
                });
            }

            assistantDialog.addEventListener('click', (e) => {
                if (e.target === assistantDialog) {
                    assistantDialog.remove();
                }
            });
        }

        const toolsGrid = assistantDialog.querySelector('.assistant-tools-grid');
        const titleEl = assistantDialog.querySelector('.assistant-tool-title');
        const descEl = assistantDialog.querySelector('.assistant-tool-description');
        const formEl = assistantDialog.querySelector('.assistant-tool-form');
        const resultsEl = assistantDialog.querySelector('.assistant-tool-results');

        if (!assistantDialog.dataset.initialized) {
            Object.entries(toolMap).forEach(([toolId, tool]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'assistant-tool-card';
                button.dataset.tool = toolId;
                button.innerHTML = `
                    <i class="${tool.icon}"></i>
                    <span>${tool.title}</span>
                `;
                button.addEventListener('click', () => {
                    renderTool(toolId);
                });
                toolsGrid.appendChild(button);
            });
            assistantDialog.dataset.initialized = 'true';
        }

        async function handleToolSubmit(event, toolId) {
            event.preventDefault();

            if (!window.aiService) {
                showToast(assistantText('chat.assistant.service_unavailable', 'AI service is not available yet'), 'error');
                return;
            }

            const submitButton = formEl.querySelector('.assistant-submit-btn');
            const payload = buildAssistantPayload(toolId, new FormData(formEl));

            if ((toolId === 'emotion' && !payload.message) || (toolId === 'opener' && !payload.targetGender) || (toolId === 'date-plan' && !payload.location)) {
                showToast(assistantText('chat.assistant.fill_required', 'Please fill the required fields first'), 'warning');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = assistantText('chat.assistant.actions.generating', 'Generating...');
            resultsEl.innerHTML = `<div class="assistant-loading">${assistantText('chat.assistant.status.preparing', 'AI is preparing suggestions...')}</div>`;

            try {
                const result = await toolMap[toolId].action(payload);
                const rendered = renderAssistantResult(toolId, result || {});
                resultsEl.innerHTML = rendered || `<div class="assistant-empty-state">${assistantText('chat.assistant.status.no_result', 'No result returned yet.')}</div>`;
                bindAssistantResultActions(resultsEl);
            } catch (error) {
                console.error('Assistant tool error:', error);
                resultsEl.innerHTML = `<div class="assistant-empty-state">${assistantText('chat.assistant.status.request_failed', 'Request failed')}: ${escapeAssistantHTML(error.message || assistantText('chat.assistant.status.unknown_error', 'Unknown error'))}</div>`;
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = assistantText('chat.assistant.actions.run', 'Run AI Tool');
            }
        }

        function renderTool(toolId) {
            const tool = toolMap[toolId] || toolMap.opener;
            const prefill = {
                ...getAssistantPrefill(toolId),
                ...(pendingPrefill || {})
            };
            const autoSubmitNow = pendingAutoSubmit;
            pendingPrefill = null;
            pendingAutoSubmit = false;

            assistantDialog.querySelectorAll('.assistant-tool-card').forEach(card => {
                card.classList.toggle('active', card.dataset.tool === toolId);
            });

            titleEl.textContent = tool.title;
            descEl.textContent = tool.description;
            formEl.innerHTML = `
                ${buildAssistantForm(toolId)}
                <div class="assistant-form-actions">
                    <button type="submit" class="assistant-submit-btn">${assistantText('chat.assistant.actions.run', 'Run AI Tool')}</button>
                </div>
            `;
            applyAssistantPrefill(formEl, prefill);
            resultsEl.innerHTML = `<div class="assistant-empty-state">${assistantText('chat.assistant.status.empty', 'Fill the form and run the tool to get suggestions.')}</div>`;
            formEl.onsubmit = (event) => handleToolSubmit(event, toolId);

            if (autoSubmitNow) {
                setTimeout(() => {
                    const submitButton = formEl.querySelector('.assistant-submit-btn');
                    if (submitButton) {
                        submitButton.click();
                    }
                }, 80);
            }
        }

        renderTool(toolMap[defaultTool] ? defaultTool : 'opener');
    }

    window.openAIAssistantTool = openAIAssistantTool;
    
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

