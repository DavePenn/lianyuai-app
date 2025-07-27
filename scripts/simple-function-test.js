#!/usr/bin/env node

const axios = require('axios');
const { Client } = require('pg');

// 配置信息
const config = {
  db: {
    host: process.env.DB_HOST || '152.32.218.174',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'lianyu_ai',
    user: process.env.DB_USER || 'lianyu_user',
    password: process.env.DB_PASSWORD || 'lianyu123'
  },
  api: {
    baseURL: process.env.API_BASE_URL || 'http://152.32.218.174:3000'
  }
};

// 测试结果
const results = {
  dbConnection: false,
  apiConnection: false,
  userRegistration: false,
  userLogin: false,
  chatSession: false
};

// 生成随机测试用户
function generateTestUser() {
  const timestamp = Date.now();
  return {
    username: `test_user_${timestamp}`,
    email: `test_${timestamp}@test.com`,
    password: 'test123456'
  };
}

// 测试数据库连接
async function testDatabaseConnection() {
  console.log('\n🔍 测试数据库连接...');
  
  const client = new Client(config.db);
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as current_time, current_user');
    console.log('✅ 数据库连接成功');
    console.log(`   时间: ${result.rows[0].current_time}`);
    console.log(`   用户: ${result.rows[0].current_user}`);
    results.dbConnection = true;
    return true;
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

// 测试API连接
async function testAPIConnection() {
  console.log('\n🔍 测试后端API连接...');
  
  try {
    const response = await axios.get(`${config.api.baseURL}/api/health`, {
      timeout: 5000
    });
    console.log('✅ API连接成功');
    console.log(`   状态: ${response.status}`);
    console.log(`   响应: ${JSON.stringify(response.data)}`);
    results.apiConnection = true;
    return true;
  } catch (error) {
    console.log('❌ API连接失败:', error.message);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// 测试用户注册
async function testUserRegistration() {
  console.log('\n🔍 测试用户注册...');
  
  const testUser = generateTestUser();
  
  try {
    const response = await axios.post(`${config.api.baseURL}/api/auth/register`, testUser, {
      timeout: 10000
    });
    console.log('✅ 用户注册成功');
    console.log(`   用户名: ${testUser.username}`);
    console.log(`   邮箱: ${testUser.email}`);
    results.userRegistration = true;
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
    const response = await axios.post(`${config.api.baseURL}/api/auth/login`, {
      username: testUser.username,
      password: testUser.password
    }, {
      timeout: 10000
    });
    console.log('✅ 用户登录成功');
    console.log(`   用户名: ${testUser.username}`);
    results.userLogin = true;
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
    const response = await axios.post(`${config.api.baseURL}/api/chat/sessions`, {
      title: '测试会话'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });
    console.log('✅ 聊天会话创建成功');
    console.log(`   会话ID: ${response.data.id}`);
    results.chatSession = true;
    return { success: true, sessionId: response.data.id };
  } catch (error) {
    console.log('❌ 聊天会话创建失败:', error.message);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false };
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始恋语AI系统功能验证测试');
  console.log('============================================================');
  
  // 1. 测试数据库连接
  const dbConnected = await testDatabaseConnection();
  
  // 2. 测试API连接
  const apiConnected = await testAPIConnection();
  
  let testUser = null;
  let token = null;
  
  // 3. 测试用户注册
  if (apiConnected) {
    const registrationResult = await testUserRegistration();
    if (registrationResult.success) {
      testUser = registrationResult.user;
      
      // 4. 测试用户登录
      const loginResult = await testUserLogin(testUser);
      if (loginResult.success) {
        token = loginResult.token;
        
        // 5. 测试聊天会话创建
        await testChatSession(token);
      }
    }
  }
  
  // 输出测试结果
  console.log('\n============================================================');
  console.log('📊 测试结果总结:');
  console.log('============================================================');
  
  const testItems = [
    { name: '数据库连接', result: results.dbConnection },
    { name: '后端API连接', result: results.apiConnection },
    { name: '用户注册', result: results.userRegistration },
    { name: '用户登录', result: results.userLogin },
    { name: '聊天会话创建', result: results.chatSession }
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
  } else {
    console.log('⚠️ 部分测试失败，请检查系统配置和服务状态。');
  }
  
  // 清理测试数据
  if (testUser && dbConnected) {
    console.log('\n🧹 清理测试数据...');
    const client = new Client(config.db);
    try {
      await client.connect();
      await client.query('DELETE FROM users WHERE username = $1', [testUser.username]);
      console.log('✅ 测试数据清理完成');
    } catch (error) {
      console.log('⚠️ 测试数据清理失败:', error.message);
    } finally {
      await client.end();
    }
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ 测试过程中发生错误:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };