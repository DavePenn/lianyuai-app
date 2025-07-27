#!/usr/bin/env node

/**
 * 恋语AI系统功能验证测试脚本
 * 用于验证用户注册、登录、聊天会话等核心功能
 */

const { Pool } = require('pg');
const axios = require('axios');
const crypto = require('crypto');

// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'lianyu_ai',
  user: process.env.DB_USER || 'lianyu_user',
  password: process.env.DB_PASSWORD || 'lianyu123'
});

// 后端API基础URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://152.32.218.174:3000';

/**
 * 生成随机测试用户数据
 * @returns {Object} 包含用户名、邮箱、密码的对象
 */
function generateTestUser() {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(4).toString('hex');
  return {
    username: `test_user_${timestamp}_${randomId}`,
    email: `test_${timestamp}_${randomId}@lianyu.ai`,
    password: 'TestPassword123!'
  };
}

/**
 * 测试数据库连接
 * @returns {Promise<boolean>} 连接是否成功
 */
async function testDatabaseConnection() {
  try {
    console.log('🔍 测试数据库连接...');
    const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✅ 数据库连接成功');
    console.log(`   时间: ${result.rows[0].current_time}`);
    console.log(`   数据库: ${result.rows[0].db_name}`);
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

/**
 * 测试后端API连接
 * @returns {Promise<boolean>} API是否可访问
 */
async function testBackendAPI() {
  try {
    console.log('\n🔍 测试后端API连接...');
    const response = await axios.get(`${API_BASE_URL}/api/health`, {
      timeout: 5000
    });
    console.log('✅ 后端API连接成功');
    console.log(`   状态: ${response.status}`);
    console.log(`   响应: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.error('❌ 后端API连接失败:', error.message);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   响应: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

/**
 * 测试用户注册功能
 * @param {Object} userData 用户数据
 * @returns {Promise<Object|null>} 注册结果或null
 */
async function testUserRegistration(userData) {
  try {
    console.log('\n🔍 测试用户注册功能...');
    console.log(`   用户名: ${userData.username}`);
    console.log(`   邮箱: ${userData.email}`);
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 用户注册成功');
    console.log(`   用户ID: ${response.data.user?.id}`);
    console.log(`   Token: ${response.data.token ? '已生成' : '未生成'}`);
    return response.data;
  } catch (error) {
    console.error('❌ 用户注册失败:', error.message);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误信息: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

/**
 * 测试用户登录功能
 * @param {Object} credentials 登录凭据
 * @returns {Promise<Object|null>} 登录结果或null
 */
async function testUserLogin(credentials) {
  try {
    console.log('\n🔍 测试用户登录功能...');
    console.log(`   用户名: ${credentials.username}`);
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: credentials.username,
      password: credentials.password
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 用户登录成功');
    console.log(`   用户ID: ${response.data.user?.id}`);
    console.log(`   Token: ${response.data.token ? '已生成' : '未生成'}`);
    return response.data;
  } catch (error) {
    console.error('❌ 用户登录失败:', error.message);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误信息: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

/**
 * 测试聊天会话创建
 * @param {string} token 用户认证token
 * @returns {Promise<Object|null>} 会话创建结果或null
 */
async function testChatSessionCreation(token) {
  try {
    console.log('\n🔍 测试聊天会话创建...');
    
    const response = await axios.post(`${API_BASE_URL}/api/chat/sessions`, {
      title: '测试聊天会话'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 聊天会话创建成功');
    console.log(`   会话ID: ${response.data.session?.id}`);
    console.log(`   会话标题: ${response.data.session?.title}`);
    return response.data;
  } catch (error) {
    console.error('❌ 聊天会话创建失败:', error.message);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误信息: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

/**
 * 测试发送消息功能
 * @param {string} token 用户认证token
 * @param {string} sessionId 会话ID
 * @returns {Promise<Object|null>} 消息发送结果或null
 */
async function testSendMessage(token, sessionId) {
  try {
    console.log('\n🔍 测试发送消息功能...');
    
    const testMessage = '你好，这是一条测试消息！';
    console.log(`   消息内容: ${testMessage}`);
    
    const response = await axios.post(`${API_BASE_URL}/api/chat/messages`, {
      sessionId: sessionId,
      content: testMessage,
      type: 'text'
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 消息发送成功');
    console.log(`   消息ID: ${response.data.message?.id}`);
    console.log(`   AI回复: ${response.data.aiResponse ? '已生成' : '未生成'}`);
    return response.data;
  } catch (error) {
    console.error('❌ 消息发送失败:', error.message);
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误信息: ${JSON.stringify(error.response.data)}`);
    }
    return null;
  }
}

/**
 * 验证数据库中的数据
 * @param {string} userId 用户ID
 * @returns {Promise<Object>} 数据库验证结果
 */
async function verifyDatabaseData(userId) {
  try {
    console.log('\n🔍 验证数据库中的数据...');
    
    // 检查用户数据
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    // 检查会话数据
    const sessionResult = await pool.query('SELECT * FROM sessions WHERE user_id = $1', [userId]);
    const sessions = sessionResult.rows;
    
    // 检查消息数据
    const messageResult = await pool.query(`
      SELECT m.* FROM messages m 
      JOIN sessions s ON m.session_id = s.id 
      WHERE s.user_id = $1
    `, [userId]);
    const messages = messageResult.rows;
    
    console.log('✅ 数据库数据验证完成');
    console.log(`   用户记录: ${user ? '存在' : '不存在'}`);
    console.log(`   会话数量: ${sessions.length}`);
    console.log(`   消息数量: ${messages.length}`);
    
    return {
      user: user,
      sessions: sessions,
      messages: messages
    };
  } catch (error) {
    console.error('❌ 数据库数据验证失败:', error.message);
    return null;
  }
}

/**
 * 清理测试数据
 * @param {string} userId 用户ID
 * @returns {Promise<boolean>} 清理是否成功
 */
async function cleanupTestData(userId) {
  try {
    console.log('\n🧹 清理测试数据...');
    
    // 删除消息
    await pool.query(`
      DELETE FROM messages 
      WHERE session_id IN (
        SELECT id FROM sessions WHERE user_id = $1
      )
    `, [userId]);
    
    // 删除会话
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    
    // 删除用户
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    console.log('✅ 测试数据清理完成');
    return true;
  } catch (error) {
    console.error('❌ 测试数据清理失败:', error.message);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runSystemTest() {
  console.log('🚀 开始恋语AI系统功能验证测试');
  console.log('=' .repeat(60));
  
  let testResults = {
    databaseConnection: false,
    backendAPI: false,
    userRegistration: false,
    userLogin: false,
    chatSession: false,
    sendMessage: false,
    databaseVerification: false,
    cleanup: false
  };
  
  let userId = null;
  let token = null;
  let sessionId = null;
  
  try {
    // 1. 测试数据库连接
    testResults.databaseConnection = await testDatabaseConnection();
    if (!testResults.databaseConnection) {
      throw new Error('数据库连接失败，无法继续测试');
    }
    
    // 2. 测试后端API连接
    testResults.backendAPI = await testBackendAPI();
    if (!testResults.backendAPI) {
      console.log('⚠️ 后端API连接失败，跳过API相关测试');
    } else {
      // 生成测试用户数据
      const testUser = generateTestUser();
      
      // 3. 测试用户注册
      const registerResult = await testUserRegistration(testUser);
      if (registerResult && registerResult.user) {
        testResults.userRegistration = true;
        userId = registerResult.user.id;
        token = registerResult.token;
      }
      
      // 4. 测试用户登录
      if (testResults.userRegistration) {
        const loginResult = await testUserLogin(testUser);
        if (loginResult && loginResult.token) {
          testResults.userLogin = true;
          token = loginResult.token;
        }
      }
      
      // 5. 测试聊天会话创建
      if (testResults.userLogin && token) {
        const sessionResult = await testChatSessionCreation(token);
        if (sessionResult && sessionResult.session) {
          testResults.chatSession = true;
          sessionId = sessionResult.session.id;
        }
      }
      
      // 6. 测试发送消息
      if (testResults.chatSession && token && sessionId) {
        const messageResult = await testSendMessage(token, sessionId);
        if (messageResult) {
          testResults.sendMessage = true;
        }
      }
    }
    
    // 7. 验证数据库数据
    if (userId) {
      const dbData = await verifyDatabaseData(userId);
      if (dbData) {
        testResults.databaseVerification = true;
      }
    }
    
    // 8. 清理测试数据
    if (userId) {
      testResults.cleanup = await cleanupTestData(userId);
    }
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
  
  // 输出测试结果总结
  console.log('\n' + '=' .repeat(60));
  console.log('📊 测试结果总结:');
  console.log('=' .repeat(60));
  
  const results = [
    ['数据库连接', testResults.databaseConnection],
    ['后端API连接', testResults.backendAPI],
    ['用户注册', testResults.userRegistration],
    ['用户登录', testResults.userLogin],
    ['聊天会话创建', testResults.chatSession],
    ['发送消息', testResults.sendMessage],
    ['数据库验证', testResults.databaseVerification],
    ['数据清理', testResults.cleanup]
  ];
  
  let passedTests = 0;
  results.forEach(([testName, passed]) => {
    const status = passed ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${testName}`);
    if (passed) passedTests++;
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 测试完成: ${passedTests}/${results.length} 项通过`);
  
  if (passedTests === results.length) {
    console.log('🎉 所有测试通过！恋语AI系统功能正常。');
  } else {
    console.log('⚠️ 部分测试失败，请检查系统配置和服务状态。');
  }
  
  // 关闭数据库连接
  await pool.end();
}

// 处理命令行参数
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
恋语AI系统功能验证测试工具

使用方法:
  node system-function-test.js [选项]

选项:
  --help, -h     显示帮助信息

环境变量:
  DB_HOST        数据库主机 (默认: localhost)
  DB_PORT        数据库端口 (默认: 5432)
  DB_NAME        数据库名称 (默认: lianyu_ai)
  DB_USER        数据库用户 (默认: lianyu_user)
  DB_PASSWORD    数据库密码 (默认: lianyu123)
  API_BASE_URL   后端API地址 (默认: http://152.32.218.174:3000)

示例:
  # 使用默认配置运行测试
  node system-function-test.js
  
  # 使用自定义数据库配置
  DB_HOST=localhost DB_PASSWORD=mypass node system-function-test.js
`);
    process.exit(0);
  }
  
  runSystemTest().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  runSystemTest,
  testDatabaseConnection,
  testBackendAPI,
  testUserRegistration,
  testUserLogin,
  testChatSessionCreation,
  testSendMessage
};