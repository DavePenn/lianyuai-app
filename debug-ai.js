// AI服务调试脚本
console.log('=== AI服务调试信息 ===');

// 检查AI服务是否存在
if (window.aiService) {
    console.log('✓ AI服务已加载');
    
    // 检查AI配置
    if (window.aiService.backendService) {
        console.log('✓ 后端服务已连接');
        
        // 测试获取AI配置
        window.aiService.backendService.getAIConfig()
            .then(config => {
                console.log('✓ AI配置获取成功:', config);
            })
            .catch(error => {
                console.error('✗ AI配置获取失败:', error);
            });
    } else {
        console.error('✗ 后端服务未连接');
    }
    
    // 测试AI聊天功能
    console.log('测试AI聊天功能...');
    window.aiService.generateChatReply('测试消息', '')
        .then(response => {
            console.log('✓ AI聊天测试成功:', response);
        })
        .catch(error => {
            console.error('✗ AI聊天测试失败:', error);
        });
} else {
    console.error('✗ AI服务未加载');
}

// 检查后端服务
if (window.BackendService) {
    console.log('✓ BackendService类已加载');
    
    const testBackend = new BackendService();
    console.log('后端服务baseURL:', testBackend.baseURL);
    
    // 测试后端连接
    testBackend.getAIConfig()
        .then(config => {
            console.log('✓ 直接后端测试成功:', config);
        })
        .catch(error => {
            console.error('✗ 直接后端测试失败:', error);
        });
} else {
    console.error('✗ BackendService类未加载');
}