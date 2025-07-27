#!/usr/bin/env node

const axios = require('axios');

// 配置信息
const API_BASE_URL = 'http://152.32.218.174:3000';

// 生成随机测试用户
const timestamp = Date.now();
const testUser = {
  username: `chat_test_${timestamp}`,
  email: `chat_test_${timestamp}@test.com`,
  password: 'test123456'
};

let authToken = '';
let sessionId = '';

/**
 * 测试用户注册
 */
async function testUserRegistration() {
  console.log('🔍 测试用户注册...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    
    if (response.data.success && response.data.token) {
      console.log('✅ 用户注册成功');
      console.log(`   用户名: ${testUser.username}`);
      authToken = response.data.token;
      return { success: true, token: authToken };
    } else {
      console.log('❌ 用户注册失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 用户注册失败:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

/**
 * 测试聊天会话创建
 */
async function testCreateSession() {
  console.log('🔍 测试聊天会话创建...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sessions`, {
      title: '聊天系统测试会话'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.status === 'success' && response.data.data.session) {
      sessionId = response.data.data.session.id;
      console.log('✅ 聊天会话创建成功');
      console.log(`   会话ID: ${sessionId}`);
      console.log(`   会话标题: ${response.data.data.session.title}`);
      return { success: true, sessionId };
    } else {
      console.log('❌ 聊天会话创建失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 聊天会话创建失败:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

/**
 * 测试发送消息
 */
async function testSendMessage(content, role = 'user') {
  console.log(`🔍 测试发送消息 (${role}): ${content}`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
      role,
      content
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.status === 'success' && response.data.data.message) {
      const message = response.data.data.message;
      console.log('✅ 消息发送成功');
      console.log(`   消息ID: ${message.id}`);
      console.log(`   角色: ${message.role}`);
      console.log(`   内容: ${message.content}`);
      return { success: true, messageId: message.id };
    } else {
      console.log('❌ 消息发送失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 消息发送失败:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

/**
 * 测试获取会话列表
 */
async function testGetSessions() {
  console.log('🔍 测试获取会话列表...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/sessions`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.status === 'success' && response.data.data.sessions) {
      const sessions = response.data.data.sessions;
      console.log('✅ 获取会话列表成功');
      console.log(`   会话数量: ${sessions.length}`);
      sessions.forEach((session, index) => {
        console.log(`   会话${index + 1}: ID=${session.id}, 标题="${session.title}", 创建时间=${session.created_at}`);
      });
      return { success: true, sessions };
    } else {
      console.log('❌ 获取会话列表失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 获取会话列表失败:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

/**
 * 测试获取消息历史
 */
async function testGetMessages() {
  console.log('🔍 测试获取消息历史...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.status === 'success' && response.data.data.messages) {
      const messages = response.data.data.messages;
      console.log('✅ 获取消息历史成功');
      console.log(`   消息数量: ${messages.length}`);
      messages.forEach((message, index) => {
        console.log(`   消息${index + 1}: ID=${message.id}, 角色=${message.role}, 内容="${message.content}", 时间=${message.created_at}`);
      });
      return { success: true, messages };
    } else {
      console.log('❌ 获取消息历史失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 获取消息历史失败:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

/**
 * 主测试函数
 */
async function runChatSystemTest() {
  console.log('🚀 开始恋语AI聊天系统完整功能测试');
  console.log('============================================================');
  
  const results = {
    userRegistration: false,
    createSession: false,
    sendUserMessage: false,
    sendAssistantMessage: false,
    getSessions: false,
    getMessages: false
  };
  
  // 1. 用户注册
  const regResult = await testUserRegistration();
  results.userRegistration = regResult.success;
  
  if (!regResult.success) {
    console.log('\n❌ 用户注册失败，终止测试');
    return;
  }
  
  console.log('');
  
  // 2. 创建聊天会话
  const sessionResult = await testCreateSession();
  results.createSession = sessionResult.success;
  
  if (!sessionResult.success) {
    console.log('\n❌ 聊天会话创建失败，终止测试');
    return;
  }
  
  console.log('');
  
  // 3. 发送用户消息
  const userMsgResult = await testSendMessage('你好，我是测试用户，请介绍一下你自己。', 'user');
  results.sendUserMessage = userMsgResult.success;
  
  console.log('');
  
  // 4. 发送助手消息（模拟AI回复）
  const assistantMsgResult = await testSendMessage('你好！我是恋语AI助手，很高兴为您服务。我可以帮助您进行对话、回答问题等。', 'assistant');
  results.sendAssistantMessage = assistantMsgResult.success;
  
  console.log('');
  
  // 5. 再发送一条用户消息
  await testSendMessage('谢谢你的介绍，系统运行正常！', 'user');
  
  console.log('');
  
  // 6. 获取会话列表
  const sessionsResult = await testGetSessions();
  results.getSessions = sessionsResult.success;
  
  console.log('');
  
  // 7. 获取消息历史
  const messagesResult = await testGetMessages();
  results.getMessages = messagesResult.success;
  
  // 输出测试结果总结
  console.log('');
  console.log('============================================================');
  console.log('📊 聊天系统测试结果总结:');
  console.log('============================================================');
  
  const testItems = [
    { name: '用户注册', key: 'userRegistration' },
    { name: '创建聊天会话', key: 'createSession' },
    { name: '发送用户消息', key: 'sendUserMessage' },
    { name: '发送助手消息', key: 'sendAssistantMessage' },
    { name: '获取会话列表', key: 'getSessions' },
    { name: '获取消息历史', key: 'getMessages' }
  ];
  
  let passedCount = 0;
  testItems.forEach(item => {
    const status = results[item.key] ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${item.name}`);
    if (results[item.key]) passedCount++;
  });
  
  console.log('');
  console.log('============================================================');
  console.log(`🎯 测试完成: ${passedCount}/${testItems.length} 项通过`);
  
  if (passedCount === testItems.length) {
    console.log('🎉 所有聊天系统功能测试通过！系统完全正常。');
  } else if (passedCount >= testItems.length * 0.8) {
    console.log('⚠️ 大部分功能正常，但存在一些问题需要解决。');
  } else {
    console.log('❌ 系统存在严重问题，需要立即修复。');
  }
}

// 运行测试
runChatSystemTest().catch(error => {
  console.error('测试过程中发生错误:', error.message);
  process.exit(1);
});