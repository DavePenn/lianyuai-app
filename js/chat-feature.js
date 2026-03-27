// chat-feature.js
// 聊天功能：初始化、发送消息、AI 回复、打字效果、图片上传、多模态
// 依赖：window.aiService, window.backendService, window.chatSessionManager
// 依赖：showToast, addMessage, buildRelationshipChatContext (from app.js / relationship-analysis.js)
// 聊天功能初始化
function initChatFeature() {
    console.log('Initializing chat feature...');
    if (window.chatSessionManager) return; // 防止重复初始化
    
    const chatInput = document.querySelector('.chat-input-field');
    const sendButton = document.querySelector('.chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    let chatSelectionAction = null;
    
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

            appendMessageQuickActions(messageDiv, sender, content);
            
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

    // 暴露 continueWithAIReply 供全局调用（图片上传等场景）
    window.continueWithAIReply = continueWithAIReply;

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

        if (!isTyping) {
            appendMessageQuickActions(messageDiv, sender, text);
        }
        
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

    function appendMessageQuickActions(messageDiv, sender, text) {
        if (!messageDiv || !text || sender === 'ai') {
            return;
        }

        const messageContent = messageDiv.querySelector('.message-content');
        if (!messageContent) {
            return;
        }

        const actions = document.createElement('div');
        actions.className = 'message-quick-actions';

        const analyzeBtn = document.createElement('button');
        analyzeBtn.type = 'button';
        analyzeBtn.className = 'message-quick-action-btn';
        analyzeBtn.innerHTML = `<i class="fas fa-heart-pulse"></i><span>${window.I18nManager ? window.I18nManager.t('chat.message.analyze') : 'Analyze'}</span>`;
        analyzeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (window.openAIAssistantTool) {
                window.openAIAssistantTool('emotion', {
                    prefill: { message: text },
                    autoSubmit: true
                });
            }
        });

        actions.appendChild(analyzeBtn);
        messageContent.appendChild(actions);
    }

    function getSelectedChatText() {
        if (!chatMessages || typeof window.getSelection !== 'function') {
            return '';
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            return '';
        }

        const selectedText = selection.toString().replace(/\s+/g, ' ').trim();
        if (!selectedText) {
            return '';
        }

        const range = selection.getRangeAt(0);
        const commonNode = range.commonAncestorContainer;
        const commonElement = commonNode && commonNode.nodeType === Node.ELEMENT_NODE
            ? commonNode
            : commonNode?.parentElement;

        if (!commonElement || !chatMessages.contains(commonElement)) {
            return '';
        }

        return selectedText.length > 500 ? `${selectedText.slice(0, 500)}...` : selectedText;
    }

    function ensureChatSelectionAction() {
        if (chatSelectionAction) {
            return chatSelectionAction;
        }

        chatSelectionAction = document.createElement('button');
        chatSelectionAction.type = 'button';
        chatSelectionAction.className = 'chat-selection-action';
        chatSelectionAction.innerHTML = `
            <i class="fas fa-wand-magic-sparkles"></i>
            <span>${window.I18nManager ? window.I18nManager.t('chat.message.analyze_selection') : 'Analyze Selection'}</span>
        `;
        chatSelectionAction.addEventListener('pointerdown', (event) => {
            event.preventDefault();
        });
        chatSelectionAction.addEventListener('click', () => {
            const selectedText = chatSelectionAction?.dataset.selectedText || getSelectedChatText();
            if (!selectedText || !window.openAIAssistantTool) {
                return;
            }

            window.openAIAssistantTool('emotion', {
                prefill: { message: selectedText },
                autoSubmit: true
            });
            hideChatSelectionAction();

            const selection = window.getSelection ? window.getSelection() : null;
            if (selection && typeof selection.removeAllRanges === 'function') {
                selection.removeAllRanges();
            }
        });

        document.body.appendChild(chatSelectionAction);
        return chatSelectionAction;
    }

    function hideChatSelectionAction() {
        if (!chatSelectionAction) {
            return;
        }

        chatSelectionAction.classList.remove('visible');
        delete chatSelectionAction.dataset.selectedText;
    }

    function updateChatSelectionAction() {
        const selectedText = getSelectedChatText();
        if (!selectedText) {
            hideChatSelectionAction();
            return;
        }

        const action = ensureChatSelectionAction();
        action.dataset.selectedText = selectedText;
        action.classList.add('visible');
    }

    function bindChatSelectionActions() {
        if (!chatMessages) {
            return;
        }

        const queueSelectionCheck = () => {
            window.requestAnimationFrame(updateChatSelectionAction);
        };

        chatMessages.addEventListener('mouseup', queueSelectionCheck);
        chatMessages.addEventListener('touchend', queueSelectionCheck);
        chatMessages.addEventListener('keyup', queueSelectionCheck);
        document.addEventListener('selectionchange', queueSelectionCheck);
        document.addEventListener('click', (event) => {
            if (!chatSelectionAction || !chatSelectionAction.classList.contains('visible')) {
                return;
            }

            if (chatSelectionAction.contains(event.target)) {
                return;
            }

            window.requestAnimationFrame(() => {
                if (!getSelectedChatText()) {
                    hideChatSelectionAction();
                }
            });
        });
    }

    bindChatSelectionActions();
    
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
                
                // 构建上下文：如果来自关系分析，注入分析结果
                let chatContext = '';
                // 优先从 window.chatReturnContext 取（页面级），其次从会话元数据取（持久化）
                let analysisResult = null;
                const returnCtx = window.chatReturnContext;
                if (returnCtx && returnCtx.kind === 'relationship-analysis' && returnCtx.analysisResult) {
                    analysisResult = returnCtx.analysisResult;
                } else if (window.chatSessionManager?.sessionMeta) {
                    const currentSid = window.chatSessionManager.currentSessionId;
                    const meta = window.chatSessionManager.sessionMeta[currentSid];
                    if (meta && meta.kind === 'relationship-analysis' && meta.analysisResult) {
                        analysisResult = meta.analysisResult;
                    }
                }
                if (analysisResult) {
                    chatContext = buildRelationshipChatContext(analysisResult);
                }
                
                // 调用AI服务生成回复
                const response = await window.aiService.generateChatReply(userMessage, chatContext);
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
    function clearExistingToasts() {
        const existingToasts = document.querySelectorAll('.app-toast');
        existingToasts.forEach(toast => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        });
    }

    function focusChatInput() {
        const chatInput = document.querySelector('.chat-input-field');
        if (chatInput) {
            chatInput.focus();
        }
    }

    function openChatExperience(toolId = null) {
        clearExistingToasts();

        setTimeout(() => {
            const chatTab = document.querySelector('.tab-item[data-page="chat"]');
            if (chatTab) {
                chatTab.click();
            }

            setTimeout(() => {
                if (toolId && window.openAIAssistantTool) {
                    window.openAIAssistantTool(toolId);
                    return;
                }

                focusChatInput();
            }, 250);
        }, 100);
    }

    function openRelationshipExperience(prefill = {}) {
        clearExistingToasts();
        if (typeof window.openRelationshipAnalysisExperience === 'function') {
            window.openRelationshipAnalysisExperience(prefill);
        }
    }

    // 菜单项点击事件 - 只针对首页的功能项
    const featureItems = document.querySelectorAll('.feature-item[data-feature]');
    featureItems.forEach(item => {
        item.addEventListener('click', () => {
            const featureToAnalysisMap = {
                chat: {
                    concern: 'how_to_reply',
                    currentGoal: 'keep_chatting',
                    customQuestion: 'I want to know what to say next without making the conversation feel forced.',
                    extraNotes: 'Focus on reply quality, conversation flow, and whether the rhythm still feels natural.'
                },
                analysis: {
                    concern: 'interest_level',
                    currentGoal: 'test_interest',
                    customQuestion: 'I want to know how interested the other person actually seems right now.',
                    extraNotes: 'Focus on emotional tone, responsiveness, and whether the signals are genuine or just polite.'
                },
                training: {
                    concern: 'what_next',
                    currentGoal: 'build_flirt',
                    customQuestion: 'I want to know how to move the conversation forward without getting stuck.',
                    extraNotes: 'Focus on topic depth, momentum, and the best next move to keep things progressing.'
                },
                guidance: {
                    concern: 'should_i_push',
                    currentGoal: 'test_interest',
                    customQuestion: 'I want to know whether this is a good moment to push the relationship forward.',
                    extraNotes: 'Focus on timing, comfort level, and whether now is a real push window or still too early.'
                },
                dating: {
                    concern: 'should_i_push',
                    currentGoal: 'light_invite',
                    customQuestion: 'I want to know whether it is the right time to make a light invite.',
                    extraNotes: 'Focus on invite timing, comfort level, and whether the other person seems ready for a low-pressure date suggestion.',
                    hasInviteHistory: true
                }
            };

            openRelationshipExperience(featureToAnalysisMap[item.dataset.feature] || {});
        });
    });
    
    // Learning Center功能项点击处理函数 - 确保在DOM加载后定义
    function initLearningCenterToast() {
        window.showLearningCenterToast = function(title) {
            console.log('Learning Center item clicked:', title);
            
            let message = '';
            
            switch(title) {
                case 'Dating Skills':
                    message = 'Dating Skills courses are coming soon! Stay tuned for professional guidance.';
                    break;
                case 'Communication Art':
                    message = 'Communication Art training is coming soon! Improve your chat skills with AI.';
                    break;
                case 'Psychology Test':
                    message = 'Psychology Test feature is coming soon! Discover your dating personality.';
                    break;
                default:
                    message = 'This feature is coming soon! We\'re working hard to bring it to you.';
            }
            
            console.log('About to show toast:', message);
            
            // 直接调用showToast函数
            try {
                showToast(message, 'info');
                console.log('Toast function called successfully');
            } catch (error) {
                console.error('Error calling showToast:', error);
                alert(message); // 备用方案
            }
        };
        
        console.log('showLearningCenterToast function initialized');
    }
    
    // 立即初始化函数
    initLearningCenterToast();
    
    // 场景卡片按钮也应该直接切换到聊天页面
    const scenarioBtns = document.querySelectorAll('.hero-cta-btn');
    scenarioBtns.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const slide = event.currentTarget.closest('.hero-slide');
            const scenarioId = slide ? slide.dataset.analysisScenario : '';
            const scenarioToAnalysisMap = {
                opener: {
                    concern: 'how_to_reply',
                    currentGoal: 'keep_chatting',
                    customQuestion: 'I want to know the best opener or next reply for this stage.',
                    extraNotes: 'Focus on whether the conversation is warm enough for a natural opener that keeps momentum.'
                },
                reply: {
                    concern: 'how_to_reply',
                    currentGoal: 'keep_chatting',
                    customQuestion: 'I need a reply that fits the current rhythm and does not make me look overeager.'
                },
                interest: {
                    concern: 'interest_level',
                    currentGoal: 'test_interest',
                    customQuestion: 'I want to know what the current emotional signals actually suggest.'
                },
                invite: {
                    concern: 'should_i_push',
                    currentGoal: 'light_invite',
                    customQuestion: 'Is this a good moment to move toward a date plan or invite?',
                    hasInviteHistory: true
                },
                repair: {
                    concern: 'why_cold_down',
                    currentGoal: 'repair_rhythm',
                    customQuestion: 'Things feel tense. I want to know whether I should repair the rhythm before pushing anything.',
                    hasConflict: true
                },
                distance: {
                    concern: 'what_next',
                    currentGoal: 'keep_chatting',
                    customQuestion: 'I want to know how to keep the relationship moving when most of the connection is online.',
                    extraNotes: 'Focus on maintaining connection and reading consistency over distance.'
                }
            };

            openRelationshipExperience(scenarioToAnalysisMap[scenarioId] || {});
        });
    });
}

// 多模态聊天功能
function initMultiModalChat() {
    // 附件面板切换
    const attachBtn = document.getElementById('chat-attach-btn');
    const attachmentsPanel = document.getElementById('chat-attachments-panel');
    
    if(attachBtn && attachmentsPanel) {
        let justToggled = false;

        attachBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            // 清除残留 toast
            const existingToasts = document.querySelectorAll('.app-toast');
            existingToasts.forEach(toast => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            });

            attachmentsPanel.classList.toggle('active');
            justToggled = true;
            setTimeout(() => { justToggled = false; }, 0);
        });

        // 点击面板外部关闭
        document.addEventListener('click', (e) => {
            if (justToggled) return;
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
    

}

// 处理图片上传（OCR 提取文字 → AI 分析回复）
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.match('image.*')) return;

    // 关闭附件面板 + 重置 input（允许重复上传同一张图片）
    const panel = document.getElementById('chat-attachments-panel');
    if (panel) panel.classList.remove('active');
    event.target.value = '';

    // 读取文件显示预览
    const reader = new FileReader();
    reader.onload = async function(e) {
        const imageDataUrl = e.target.result;

        // 自动创建会话（如果是 new-chat）
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

        // OCR 提取文字 → 组合为上下文 → AI 回复
        try {
            let contextMessage = '用户发送了一张图片。';

            // 尝试 OCR 提取文字
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
                    contextMessage = '用户发送了一张图片，但图片文字提取失败。请友好地告知用户，并询问他们想讨论什么。';
                }
            }

            // 使用 continueWithAIReply（包含打字效果）
            if (window.continueWithAIReply) {
                window.continueWithAIReply(contextMessage, sessionId);
            } else {
                // 降级方案：直接调用 aiService
                let aiReply = '我已经收到了你的图片。请告诉我你想了解什么，我会尽力帮助你。';
                if (window.aiService) {
                    await window.aiService.initializeConfig();
                    const response = await window.aiService.generateChatReply(contextMessage);
                    if (response) {
                        const content = response.content || response;
                        aiReply = typeof content === 'string' ? content : JSON.stringify(content);
                    }
                }
                if (window.chatSessionManager) {
                    window.chatSessionManager.addMessage(sessionId, 'ai', aiReply);
                    window.chatSessionManager.addMessageToUI('ai', aiReply);
                }
            }
        } catch (error) {
            console.error('图片处理失败:', error);
            const errorMsg = '抱歉，图片处理遇到了问题。请告诉我你想讨论什么，我会尽力帮助你。';
            if (window.chatSessionManager) {
                window.chatSessionManager.addMessage(sessionId, 'ai', errorMsg);
                window.chatSessionManager.addMessageToUI('ai', errorMsg);
            }
        }
    };
    reader.readAsDataURL(file);
}

// Discover / Learning Center 点击提示
function initDiscoverFeatures() {
    const discoverItems = document.querySelectorAll('#discover-page .feature-item');
    if (!discoverItems.length) return;

    discoverItems.forEach(item => {
        item.style.cursor = 'pointer';

        // 防重复绑定：克隆替换
        const cloned = item.cloneNode(true);
        if (item.parentNode) item.parentNode.replaceChild(cloned, item);

        const title = (cloned.querySelector('.feature-content h3') && cloned.querySelector('.feature-content h3').textContent) ? cloned.querySelector('.feature-content h3').textContent.trim() : '';
        cloned.addEventListener('click', () => {
            if (typeof window.showLearningCenterToast === 'function') {
                window.showLearningCenterToast(title);
            } else if (typeof showToast === 'function') {
                showToast('This feature is coming soon!', 'info');
            }
        });
    });
}

