const axios = require('axios');

// 配置信息
const API_BASE_URL = 'http://152.32.218.174:3000';

// 生成随机测试用户
const generateTestUser = () => {
  const timestamp = Date.now();
  return {
    username: `system_test_${timestamp}`,
    password: 'test123456',
    email: `system_test_${timestamp}@test.com`
  };
};

// 测试结果统计
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// 记录测试结果
function recordTest(testName, passed, message = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ 通过 ${testName}`);
    if (message) console.log(`   ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ 失败 ${testName}`);
    if (message) console.log(`   ${message}`);
  }
  testResults.details.push({ testName, passed, message });
}

// 主测试函数
async function runCompleteSystemTest() {
  console.log('🚀 开始恋语AI完整系统功能测试');
  console.log('============================================================');
  
  let userToken = null;
  let sessionId = null;
  const testUser = generateTestUser();
  
  try {
    // 1. 测试用户注册
    console.log('🔍 测试用户注册...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
      if (registerResponse.status === 201 && registerResponse.data.success) {
        userToken = registerResponse.data.token;
        recordTest('用户注册', true, `用户名: ${testUser.username}`);
      } else {
        recordTest('用户注册', false, '注册响应格式错误');
        return;
      }
    } catch (error) {
      recordTest('用户注册', false, error.message);
      return;
    }

    // 2. 测试用户登录
    console.log('🔍 测试用户登录...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: testUser.username,
        password: testUser.password
      });
      if (loginResponse.status === 200 && loginResponse.data.success) {
        recordTest('用户登录', true, '登录成功');
      } else {
        recordTest('用户登录', false, '登录响应格式错误');
      }
    } catch (error) {
      recordTest('用户登录', false, error.message);
    }

    // 3. 测试获取用户资料
    console.log('🔍 测试获取用户资料...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (profileResponse.status === 200 && profileResponse.data.success) {
        recordTest('获取用户资料', true, `用户ID: ${profileResponse.data.data.user.id}`);
      } else {
        recordTest('获取用户资料', false, '资料响应格式错误');
      }
    } catch (error) {
      recordTest('获取用户资料', false, error.message);
    }

    // 4. 测试创建聊天会话
    console.log('🔍 测试创建聊天会话...');
    try {
      const sessionResponse = await axios.post(`${API_BASE_URL}/api/sessions`, {
        title: '系统测试会话'
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (sessionResponse.status === 201 && sessionResponse.data.status === 'success') {
        sessionId = sessionResponse.data.data.session.id;
        recordTest('创建聊天会话', true, `会话ID: ${sessionId}`);
      } else {
        console.log('会话响应:', JSON.stringify(sessionResponse.data, null, 2));
        recordTest('创建聊天会话', false, '会话创建响应格式错误');
      }
    } catch (error) {
      recordTest('创建聊天会话', false, error.message);
    }

    // 5. 测试发送消息
    if (sessionId) {
      console.log('🔍 测试发送消息...');
      try {
        const messageResponse = await axios.post(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
          role: 'user',
          content: '这是一条系统测试消息'
        }, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        if (messageResponse.status === 201 && messageResponse.data.status === 'success') {
          recordTest('发送消息', true, '消息发送成功');
        } else {
          recordTest('发送消息', false, '消息发送响应格式错误');
        }
      } catch (error) {
        recordTest('发送消息', false, error.message);
      }
    }

    // 6. 测试获取会话列表
    console.log('🔍 测试获取会话列表...');
    try {
      const sessionsResponse = await axios.get(`${API_BASE_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (sessionsResponse.status === 200 && sessionsResponse.data.status === 'success') {
        const sessions = sessionsResponse.data.data.sessions;
        recordTest('获取会话列表', true, `找到 ${sessions.length} 个会话`);
      } else {
        console.log('会话列表响应:', JSON.stringify(sessionsResponse.data, null, 2));
        recordTest('获取会话列表', false, '会话列表响应格式错误');
      }
    } catch (error) {
      recordTest('获取会话列表', false, error.message);
    }

    // 7. 测试获取消息历史
    if (sessionId) {
      console.log('🔍 测试获取消息历史...');
      try {
        const messagesResponse = await axios.get(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        if (messagesResponse.status === 200 && messagesResponse.data.status === 'success') {
          const messages = messagesResponse.data.data.messages;
          recordTest('获取消息历史', true, `找到 ${messages.length} 条消息`);
        } else {
          recordTest('获取消息历史', false, '消息历史响应格式错误');
        }
      } catch (error) {
        recordTest('获取消息历史', false, error.message);
      }
    }

    // 8. 测试更新用户资料
    console.log('🔍 测试更新用户资料...');
    try {
      const updateResponse = await axios.put(`${API_BASE_URL}/api/auth/profile`, {
        username: `${testUser.username}_updated`,
        email: `updated_${testUser.email}`
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (updateResponse.status === 200 && updateResponse.data.success) {
        recordTest('更新用户资料', true, '资料更新成功');
      } else {
        recordTest('更新用户资料', false, '资料更新响应格式错误');
      }
    } catch (error) {
      recordTest('更新用户资料', false, error.message);
    }

    // 9. 测试Token验证
    console.log('🔍 测试Token验证...');
    try {
      const verifyResponse = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      if (verifyResponse.status === 200 && verifyResponse.data.success) {
        recordTest('Token验证', true, 'Token验证成功');
      } else {
        recordTest('Token验证', false, 'Token验证响应格式错误');
      }
    } catch (error) {
      recordTest('Token验证', false, error.message);
    }

  } catch (error) {
    console.error('❌ 系统测试过程中发生错误:', error.message);
  }

  // 输出测试结果总结
  console.log('\n============================================================');
  console.log('📊 完整系统测试结果总结:');
  console.log('============================================================');
  
  testResults.details.forEach(result => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${result.testName}`);
  });
  
  console.log('\n============================================================');
  console.log(`🎯 测试完成: ${testResults.passed}/${testResults.total} 项通过`);
  
  if (testResults.passed === testResults.total) {
    console.log('🎉 所有功能测试通过！系统运行正常。');
  } else if (testResults.passed >= testResults.total * 0.8) {
    console.log('⚠️ 大部分功能正常，但存在一些问题需要解决。');
  } else {
    console.log('🚨 系统存在较多问题，需要进一步调试。');
  }
}

// 运行测试
runCompleteSystemTest().catch(console.error);