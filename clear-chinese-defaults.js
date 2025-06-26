// 国际化系统强制更新脚本
console.log('开始强制更新翻译...');

function forceUpdateTranslations() {
    if (!window.I18nManager) {
        console.log('I18nManager未就绪，等待...');
        return;
    }

    console.log('强制设置中文并更新翻译');
    
    // 强制设置为中文
    window.I18nManager.setLanguage('zh-CN');
    
    // 更新所有翻译
    window.I18nManager.updatePageTexts();
    
    // 特别处理可能遗漏的元素
    setTimeout(() => {
        const elements = document.querySelectorAll('[data-i18n]');
        console.log(`检查 ${elements.length} 个翻译元素`);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = window.I18nManager.t(key);
            
            if (translation && translation !== key) {
                element.textContent = translation;
                console.log(`更新元素: ${key} -> ${translation}`);
            } else {
                console.warn(`翻译缺失: ${key}`);
            }
        });
        
        // 更新placeholder
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = window.I18nManager.t(key);
            
            if (translation && translation !== key) {
                element.placeholder = translation;
                console.log(`更新placeholder: ${key} -> ${translation}`);
            }
        });
        
        // 特别处理动态创建的会话元素
        console.log('检查动态创建的会话元素...');
        const sessionItems = document.querySelectorAll('.session-item');
        sessionItems.forEach(item => {
            const nameElement = item.querySelector('.session-name[data-i18n]');
            const previewElement = item.querySelector('.session-preview[data-i18n]');
            const timeElement = item.querySelector('.session-time[data-i18n]');
            
            if (nameElement) {
                const key = nameElement.getAttribute('data-i18n');
                const translation = window.I18nManager.t(key);
                if (translation && translation !== key) {
                    nameElement.textContent = translation;
                    console.log(`更新会话名称: ${key} -> ${translation}`);
                }
            }
            
            if (previewElement) {
                const key = previewElement.getAttribute('data-i18n');
                const translation = window.I18nManager.t(key);
                if (translation && translation !== key) {
                    previewElement.textContent = translation;
                    console.log(`更新会话预览: ${key} -> ${translation}`);
                }
            }
            
            if (timeElement) {
                const key = timeElement.getAttribute('data-i18n');
                const translation = window.I18nManager.t(key);
                if (translation && translation !== key) {
                    timeElement.textContent = translation;
                    console.log(`更新会话时间: ${key} -> ${translation}`);
                }
            }
        });
        
        console.log('强制翻译更新完成');
    }, 200);
}

// 立即尝试更新
forceUpdateTranslations();

// 监听I18n加载完成事件
window.addEventListener('i18nManagerReady', function() {
    console.log('I18n管理器就绪事件触发，重新更新翻译');
    setTimeout(forceUpdateTranslations, 100);
});

// 页面加载完成后再次确保
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，最终检查翻译');
    setTimeout(forceUpdateTranslations, 500);
});