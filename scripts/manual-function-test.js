#!/usr/bin/env node

const axios = require('axios');

// 配置信息
const API_BASE_URL = 'http://152.32.218.174:3000';

// 生成随机测试用户
function generateTestUser() {
  const timestamp = Date.now();
  return {
    username: `test_user_${timestamp}`,
    email: `test_${timestamp}@test.com`,
    password: 'test123456'
  };
}

// 测试API连接
async function testAPIConnection() {
  console.log('🔍 测试后端API连接...');
  
  try {
    // 尝试访问根路径
    const response = await axios.get(`${API_BASE_URL}/`, {
      timeout: 5000
    });
    console.log('✅ API根路径连接成功');
    console.log(`   状态: ${response.status}`);
    return true;
  } catch (error) {
    console.log('❌ API根路径连接失败:', error.message);
    
    // 尝试访问健康检查端点
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/api/health`, {
        timeout: 5000
      });
      console.log('✅ API健康检查成功');
      console.log(`   状态: ${healthResponse.status}`);
      return true;
    } catch (healthError) {
      console.log('❌ API健康检查失败:', healthError.message);
      return false;
    }
  }
}

// 测试用户注册
async function testUserRegistration() {
  console.log('\n🔍 测试用户注册...');
  
  const testUser = generateTestUser();
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ 用户注册成功');
    console.log(`   用户名: ${testUser.username}`);
    console.log(`   邮箱: ${testUser.email}`);
    console.log(`   响应: ${JSON.stringify(response.data)}`);
    return { success: true, user: testUser, response: response.data };
  } catch (error) {
    console.log('❌ 用户注册失败:', error.message);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false, user: testUser };
  }
}

// 测试用户登录
async function testUserLogin(testUser) {
  console.log('\n🔍 测试用户登录...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: testUser.username,
      password: testUser.password
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ 用户登录成功');
    console.log(`   用户名: ${testUser.username}`);
    console.log(`   Token: ${response.data.token ? '已获取' : '未获取'}`);
    return { success: true, token: response.data.token };
  } catch (error) {
    console.log('❌ 用户登录失败:', error.message);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false };
  }
}

// 测试聊天会话创建
async function testChatSession(token) {
  console.log('\n🔍 测试聊天会话创建...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sessions`, {
      title: '测试会话'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ 聊天会话创建成功');
    console.log(`   会话ID: ${response.data.data.session.id}`);
    console.log(`   会话标题: ${response.data.data.session.title}`);
    return { success: true, sessionId: response.data.data.session.id };
  } catch (error) {
    console.log('❌ 聊天会话创建失败:', error.message);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false };
  }
}

// 测试发送消息
async function testSendMessage(token, sessionId) {
  console.log('\n🔍 测试发送消息...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
      role: 'user',
      content: '你好，这是一条测试消息'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    console.log('✅ 消息发送成功');
    console.log(`   消息ID: ${response.data.id}`);
    console.log(`   消息内容: ${response.data.content}`);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.log('❌ 消息发送失败:', error.message);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false };
  }
}

// 主测试函数
async function runManualTests() {
  console.log('🚀 开始恋语AI手动功能验证测试');
  console.log('============================================================');
  
  const results = {
    apiConnection: false,
    userRegistration: false,
    userLogin: false,
    chatSession: false,
    sendMessage: false
  };
  
  // 1. 测试API连接
  const apiConnected = await testAPIConnection();
  results.apiConnection = apiConnected;
  
  let testUser = null;
  let token = null;
  let sessionId = null;
  
  // 2. 测试用户注册
  if (apiConnected) {
    const registrationResult = await testUserRegistration();
    results.userRegistration = registrationResult.success;
    
    if (registrationResult.success) {
      testUser = registrationResult.user;
      
      // 3. 测试用户登录
      const loginResult = await testUserLogin(testUser);
      results.userLogin = loginResult.success;
      
      if (loginResult.success) {
        token = loginResult.token;
        
        // 4. 测试聊天会话创建
        const sessionResult = await testChatSession(token);
        results.chatSession = sessionResult.success;
        
        if (sessionResult.success) {
          sessionId = sessionResult.sessionId;
          
          // 5. 测试发送消息
          const messageResult = await testSendMessage(token, sessionId);
          results.sendMessage = messageResult.success;
        }
      }
    }
  }
  
  // 输出测试结果
  console.log('\n============================================================');
  console.log('📊 测试结果总结:');
  console.log('============================================================');
  
  const testItems = [
    { name: '后端API连接', result: results.apiConnection },
    { name: '用户注册', result: results.userRegistration },
    { name: '用户登录', result: results.userLogin },
    { name: '聊天会话创建', result: results.chatSession },
    { name: '发送消息', result: results.sendMessage }
  ];
  
  let passedCount = 0;
  testItems.forEach(item => {
    const status = item.result ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${item.name}`);
    if (item.result) passedCount++;
  });
  
  console.log('\n============================================================');
  console.log(`🎯 测试完成: ${passedCount}/${testItems.length} 项通过`);
  
  if (passedCount === testItems.length) {
    console.log('🎉 所有测试通过！系统功能正常。');
  } else if (passedCount > 0) {
    console.log('⚠️ 部分功能正常，但存在一些问题需要解决。');
  } else {
    console.log('❌ 系统功能存在严重问题，需要检查配置和服务状态。');
  }
  
  return results;
}

// 运行测试
if (require.main === module) {
  runManualTests().catch(error => {
    console.error('❌ 测试过程中发生错误:', error.message);
    process.exit(1);
  });
}

module.exports = { runManualTests };