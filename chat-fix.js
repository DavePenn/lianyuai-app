// 获取当前会话ID
function getCurrentSessionId() {
    const activeSession = document.querySelector('.session-item.active');
    return activeSession ? activeSession.getAttribute('data-session-id') : 'default';
}

// 生成会话名称（基于用户消息内容）
function generateSessionName(message) {
    // 去除特殊字符，取前20个字符作为会话名
    const cleanMessage = message.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim();
    if (cleanMessage.length <= 15) {
        return cleanMessage;
    }
    return cleanMessage.substring(0, 15) + '...';
}

// 创建新会话
function createAutoSession(sessionName, firstMessage) {
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
            <div class="session-name">${sessionName}</div>
            <div class="session-preview">${firstMessage.length > 20 ? firstMessage.substring(0, 20) + '...' : firstMessage}</div>
        </div>
        <div class="session-menu-trigger">
            <i class="fas fa-ellipsis-v"></i>
        </div>
    `;
    
    // 添加到会话列表
    const sessionsList = document.querySelector('.sessions-list');
    if (sessionsList) {
        const defaultSession = sessionsList.querySelector('.session-item[data-session-id="default"]');
        if (defaultSession && defaultSession.nextElementSibling) {
            sessionsList.insertBefore(sessionItem, defaultSession.nextElementSibling);
        } else {
            sessionsList.appendChild(sessionItem);
        }
    }
    
    // 为新会话添加点击事件
    sessionItem.addEventListener('click', function() {
        if (window.switchToSession) {
            window.switchToSession(newSessionId, sessionName);
        }
    });
    
    // 为新会话添加菜单按钮点击事件
    const menuTrigger = sessionItem.querySelector('.session-menu-trigger');
    if (menuTrigger) {
        menuTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (window.toggleSessionDropdownMenu) {
                window.toggleSessionDropdownMenu(sessionItem, menuTrigger);
            }
        });
    }
    
    return newSessionId;
}

// 切换会话
function switchToSession(sessionId, sessionName) {
    console.log("执行切换会话:", sessionId, sessionName);
    
    if (window.switchToSession) {
        console.log("使用app.js中的switchToSession");
        window.switchToSession(sessionId, sessionName);
        return;
    }
    
    // 作为备份，如果全局函数不可用，自己实现
    console.log("使用本地switchToSession实现");
    
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
}

// 简单的消息处理函数
function handleSendMessage() {
    console.log("====== handleSendMessage 开始执行 ======");
    
    // 获取输入框
    const inputField = document.querySelector('.chat-input-field');
    if (!inputField) {
        console.error("找不到输入框");
        return;
    }
    
    // 获取消息内容
    const message = inputField.value.trim();
    console.log("获取到的消息内容:", message);
    if (!message) {
        console.log("消息为空，不发送");
        return;
    }
    
    // 获取消息容器
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) {
        console.error("找不到消息容器");
        return;
    }
    
    // 检查当前会话
    const activeSession = document.querySelector('.session-item.active');
    console.log("当前活动会话元素:", activeSession);
    
    const currentSessionId = activeSession ? activeSession.getAttribute('data-session-id') : 'default';
    console.log("当前会话ID:", currentSessionId);
    
    const isDefaultSession = currentSessionId === 'new-chat';
    console.log("是否为默认会话:", isDefaultSession);
    
    // 注释掉自动创建会话的逻辑，因为现在由 app.js 中的 sendMessage 函数统一处理
    if (isDefaultSession) {
        console.log("*** 检测到新对话，但会话创建由 app.js 处理，这里跳过创建逻辑 ***");
        // 不在这里创建会话，让 app.js 的 sendMessage 函数处理
        return;
    }
    
    // 发送消息到当前会话
    console.log("发送消息到当前会话");
    sendMessageToCurrentSession(message);
    
    console.log("====== handleSendMessage 执行完成 ======");
}

// 发送消息到当前会话的函数
function sendMessageToCurrentSession(message) {
    const inputField = document.querySelector('.chat-input-field');
    const messagesContainer = document.getElementById('chat-messages');
    
    // 创建用户消息元素
    const userMessageElement = document.createElement('div');
    userMessageElement.className = 'message user-message';
    userMessageElement.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    // 添加到容器
    messagesContainer.appendChild(userMessageElement);
    
    // 清空输入框
    if (inputField) {
        inputField.value = '';
    }
    
    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 更新会话预览
    const activeSession = document.querySelector('.session-item.active');
    if (activeSession) {
        const previewEl = activeSession.querySelector('.session-preview');
        if (previewEl) {
            const previewText = message.length > 20 ? message.substring(0, 20) + '...' : message;
            previewEl.textContent = previewText;
        }
    }
    
    // 更新会话预览
    if (window.updateSessionPreview) {
        window.updateSessionPreview(message);
    }
    
    // 模拟AI回复
    setTimeout(() => {
        // 获取当前聊天容器（以防已切换会话）
        const currentMessagesContainer = document.getElementById('chat-messages');
        if (!currentMessagesContainer) return;
        
        // 创建AI消息元素
        const aiMessageElement = document.createElement('div');
        aiMessageElement.className = 'message ai-message';
        aiMessageElement.innerHTML = `
            <div class="message-avatar ai">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>我收到了您的消息: "${message}"</p>
            </div>
        `;
        
        // 添加到容器
        currentMessagesContainer.appendChild(aiMessageElement);
        
        // 滚动到底部
        currentMessagesContainer.scrollTop = currentMessagesContainer.scrollHeight;
        
        // 更新会话预览
        const activeSession = document.querySelector('.session-item.active');
        if (activeSession) {
            const previewEl = activeSession.querySelector('.session-preview');
            if (previewEl) {
                const previewText = `我收到了您的消息: "${message.substring(0, 10)}${message.length > 10 ? '...' : ''}"`;
                previewEl.textContent = previewText.length > 20 ? previewText.substring(0, 20) + '...' : previewText;
            }
        }
    }, 1000);
}

// 注释掉重复的事件绑定，让 app.js 统一处理消息发送
// 避免重复绑定导致的多次处理问题

console.log('chat-fix.js: 跳过事件绑定，由 app.js 统一处理');

// 如果需要特殊处理，可以通过 window 对象暴露函数给 app.js 调用
window.chatFixHandleSendMessage = handleSendMessage;