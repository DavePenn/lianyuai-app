/**
 * 移动端虚拟键盘处理模块
 * 处理输入框聚焦时的界面调整，确保输入框不被虚拟键盘遮挡
 */

class MobileKeyboardHandler {
    constructor() {
        this.isKeyboardVisible = false;
        this.originalViewportHeight = window.innerHeight;
        this.activeInput = null;
        this.scrollTimeout = null;
        
        this.init();
    }

    init() {
        // 监听输入框聚焦事件
        this.bindInputEvents();
        
        // 监听视口变化
        this.bindViewportEvents();
        
        // 监听Visual Viewport API（如果支持）
        this.bindVisualViewportEvents();
        
        // 监听Capacitor键盘事件（如果在Capacitor环境中）
        this.bindCapacitorKeyboardEvents();
    }

    bindInputEvents() {
        // 为所有输入框添加事件监听
        const inputSelectors = [
            'input[type="text"]',
            'input[type="email"]', 
            'input[type="password"]',
            'input[type="search"]',
            'textarea',
            '.chat-input-field'
        ];

        inputSelectors.forEach(selector => {
            document.addEventListener('focusin', (e) => {
                if (e.target.matches(selector)) {
                    this.handleInputFocus(e.target);
                }
            });

            document.addEventListener('focusout', (e) => {
                if (e.target.matches(selector)) {
                    this.handleInputBlur(e.target);
                }
            });
        });
    }

    bindViewportEvents() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.handleViewportChange();
        });

        // 监听方向变化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 500); // 延迟处理，等待方向变化完成
        });
    }

    bindVisualViewportEvents() {
        // 使用Visual Viewport API（现代浏览器支持）
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                this.handleVisualViewportResize();
            });
        }
    }

    bindCapacitorKeyboardEvents() {
        // 如果在Capacitor环境中，使用Capacitor键盘插件
        if (window.Capacitor && window.Capacitor.Plugins.Keyboard) {
            const { Keyboard } = window.Capacitor.Plugins;
            
            Keyboard.addListener('keyboardWillShow', (info) => {
                this.handleKeyboardShow(info.keyboardHeight);
            });

            Keyboard.addListener('keyboardWillHide', () => {
                this.handleKeyboardHide();
            });
        }
    }

    handleInputFocus(input) {
        this.activeInput = input;
        
        // 添加聚焦样式
        input.classList.add('keyboard-focused');
        
        // 延迟滚动，等待键盘弹出
        setTimeout(() => {
            this.scrollInputIntoView(input);
        }, 300);
        
        // 为聊天输入框特殊处理
        if (input.classList.contains('chat-input-field')) {
            this.handleChatInputFocus(input);
        }
    }

    handleInputBlur(input) {
        this.activeInput = null;
        
        // 移除聚焦样式
        input.classList.remove('keyboard-focused');
        
        // 清除滚动超时
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
    }

    handleViewportChange() {
        const currentHeight = window.innerHeight;
        const heightDifference = this.originalViewportHeight - currentHeight;
        
        // 如果高度减少超过150px，认为键盘弹出
        if (heightDifference > 150) {
            this.isKeyboardVisible = true;
            this.adjustLayoutForKeyboard(heightDifference);
        } else {
            this.isKeyboardVisible = false;
            this.resetLayoutAfterKeyboard();
        }
    }

    handleVisualViewportResize() {
        if (window.visualViewport) {
            const keyboardHeight = window.innerHeight - window.visualViewport.height;
            
            if (keyboardHeight > 150) {
                this.isKeyboardVisible = true;
                this.adjustLayoutForKeyboard(keyboardHeight);
            } else {
                this.isKeyboardVisible = false;
                this.resetLayoutAfterKeyboard();
            }
        }
    }

    handleKeyboardShow(keyboardHeight) {
        this.isKeyboardVisible = true;
        this.adjustLayoutForKeyboard(keyboardHeight);
        
        if (this.activeInput) {
            this.scrollInputIntoView(this.activeInput);
        }
    }

    handleKeyboardHide() {
        this.isKeyboardVisible = false;
        this.resetLayoutAfterKeyboard();
    }

    handleOrientationChange() {
        // 更新原始视口高度
        this.originalViewportHeight = window.innerHeight;
        
        // 如果有活跃输入框，重新调整
        if (this.activeInput) {
            setTimeout(() => {
                this.scrollInputIntoView(this.activeInput);
            }, 100);
        }
    }

    handleChatInputFocus(input) {
        // 聊天输入框特殊处理
        const chatContainer = document.querySelector('.chat-messages-container');
        if (chatContainer) {
            // 滚动到最新消息
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 350);
        }
    }

    scrollInputIntoView(input) {
        if (!input) return;
        
        // 清除之前的滚动超时
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        this.scrollTimeout = setTimeout(() => {
            const rect = input.getBoundingClientRect();
            const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            
            // 计算输入框是否被遮挡
            const inputBottom = rect.bottom;
            const availableSpace = viewportHeight - 50; // 留50px缓冲
            
            if (inputBottom > availableSpace) {
                // 计算需要滚动的距离
                const scrollDistance = inputBottom - availableSpace + 20;
                
                // 平滑滚动
                window.scrollBy({
                    top: scrollDistance,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    adjustLayoutForKeyboard(keyboardHeight) {
        // 为body添加键盘显示类
        document.body.classList.add('keyboard-visible');
        
        // 设置CSS变量
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
        
        // 调整聊天容器高度
        const chatContainer = document.querySelector('.chat-messages-container');
        if (chatContainer && this.activeInput && this.activeInput.classList.contains('chat-input-field')) {
            chatContainer.style.paddingBottom = `${keyboardHeight + 20}px`;
        }
    }

    resetLayoutAfterKeyboard() {
        // 移除键盘显示类
        document.body.classList.remove('keyboard-visible');
        
        // 重置CSS变量
        document.documentElement.style.removeProperty('--keyboard-height');
        
        // 重置聊天容器
        const chatContainer = document.querySelector('.chat-messages-container');
        if (chatContainer) {
            chatContainer.style.paddingBottom = '';
        }
    }

    // 公共方法：手动触发输入框滚动
    focusAndScrollToInput(selector) {
        const input = document.querySelector(selector);
        if (input) {
            input.focus();
            setTimeout(() => {
                this.scrollInputIntoView(input);
            }, 300);
        }
    }
}

// 自动初始化
if (typeof window !== 'undefined') {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.mobileKeyboardHandler = new MobileKeyboardHandler();
        });
    } else {
        window.mobileKeyboardHandler = new MobileKeyboardHandler();
    }
}

// 导出类（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileKeyboardHandler;
}