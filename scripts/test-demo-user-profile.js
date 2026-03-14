#!/usr/bin/env node

const axios = require('axios');

// 配置信息
const API_BASE_URL = 'http://152.32.218.174:3001';

// demo用户信息
const demoUser = {
  username: 'test123',
  email: 'test123@lianyu.ai',
    password: 'test123'
};

let authToken = '';
let userId = '';

/**
 * 测试demo用户登录
 */
async function testDemoUserLogin() {
  console.log('🔍 测试demo用户登录...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: demoUser.username,
      password: demoUser.password
    });
    
    console.log('登录响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.token) {
      console.log('✅ demo用户登录成功');
      if (response.data.data && response.data.data.user) {
        console.log(`   用户ID: ${response.data.data.user.id}`);
        console.log(`   用户名: ${response.data.data.user.username}`);
        userId = response.data.data.user.id;
      } else if (response.data.user) {
        console.log(`   用户ID: ${response.data.user.id}`);
        console.log(`   用户名: ${response.data.user.username}`);
        userId = response.data.user.id;
      }
      authToken = response.data.token;
      return { success: true, token: authToken, userId };
    } else {
      console.log('❌ demo用户登录失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ demo用户登录失败:', error.response?.data?.message || error.message);
    return { success: false };
  }
}

/**
 * 测试获取demo用户当前资料
 */
async function testGetDemoUserProfile() {
  console.log('🔍 测试获取demo用户当前资料...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success && response.data.data.user) {
      const user = response.data.data.user;
      console.log('✅ 获取demo用户资料成功');
      console.log(`   用户ID: ${user.id}`);
      console.log(`   用户名: ${user.username}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   个性签名: ${user.bio || '未设置'}`);
      console.log(`   性别: ${user.gender || '未设置'}`);
      console.log(`   出生日期: ${user.birth_date || '未设置'}`);
      console.log(`   省份: ${user.province || '未设置'}`);
      console.log(`   城市: ${user.city || '未设置'}`);
      console.log(`   恋爱状态: ${user.relationship_status || '未设置'}`);
      console.log(`   兴趣爱好: ${user.interests || '未设置'}`);
      console.log(`   联系方式: ${user.contact || '未设置'}`);
      console.log(`   更新时间: ${user.updated_at || '未更新'}`);
      return { success: true, user };
    } else {
      console.log('❌ 获取demo用户资料失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 获取demo用户资料失败:', error.response?.data?.message || error.message);
    console.log(`   状态码: ${error.response?.status}`);
    return { success: false };
  }
}

/**
 * 测试更新demo用户扩展资料
 */
async function testUpdateDemoUserExtendedProfile() {
  console.log('🔍 测试更新demo用户扩展资料...');
  
  const updateData = {
    bio: '这是我的个性签名，已更新！',
    gender: '男',
    birth_date: '1990-01-01',
    province: '北京市',
    city: '朝阳区',
    relationship_status: '单身',
    interests: '编程,音乐,旅行',
    contact: 'WeChat: demo123'
  };
  
  try {
    const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, updateData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && response.data.data.user) {
      const user = response.data.data.user;
      console.log('✅ 更新demo用户扩展资料成功');
      console.log(`   个性签名: ${user.bio}`);
      console.log(`   性别: ${user.gender}`);
      console.log(`   出生日期: ${user.birth_date}`);
      console.log(`   省份: ${user.province}`);
      console.log(`   城市: ${user.city}`);
      console.log(`   恋爱状态: ${user.relationship_status}`);
      console.log(`   兴趣爱好: ${user.interests}`);
      console.log(`   联系方式: ${user.contact}`);
      console.log(`   更新时间: ${user.updated_at}`);
      return { success: true, user };
    } else {
      console.log('❌ 更新demo用户扩展资料失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 更新demo用户扩展资料失败:', error.response?.data?.message || error.message);
    console.log(`   状态码: ${error.response?.status}`);
    return { success: false };
  }
}

/**
 * 测试重新登录后获取资料
 */
async function testReLoginAndGetProfile() {
  console.log('🔍 测试重新登录后获取资料...');
  
  // 重新登录
  const loginResult = await testDemoUserLogin();
  if (!loginResult.success) {
    return { success: false };
  }
  
  // 获取资料
  const profileResult = await testGetDemoUserProfile();
  return profileResult;
}

/**
 * 主测试函数
 */
async function runDemoUserProfileTest() {
  console.log('🚀 开始 test123 用户个人资料保存测试');
  console.log('============================================================');
  
  let testResults = {
    login: false,
    getProfile: false,
    updateProfile: false,
    reLoginAndGet: false
  };
  
  // 1. 测试登录
  const loginResult = await testDemoUserLogin();
  testResults.login = loginResult.success;
  
  if (!loginResult.success) {
    console.log('❌ demo用户登录失败，终止测试');
    return;
  }
  
  // 2. 获取当前资料
  const getProfileResult = await testGetDemoUserProfile();
  testResults.getProfile = getProfileResult.success;
  
  // 3. 更新扩展资料
  const updateResult = await testUpdateDemoUserExtendedProfile();
  testResults.updateProfile = updateResult.success;
  
  // 4. 重新登录并获取资料验证保存
  const reLoginResult = await testReLoginAndGetProfile();
  testResults.reLoginAndGet = reLoginResult.success;
  
  // 输出测试结果
  console.log('\n============================================================');
  console.log('📊 demo用户个人资料保存测试结果总结:');
  console.log('============================================================');
  console.log(testResults.login ? '✅ 通过 demo用户登录' : '❌ 失败 demo用户登录');
  console.log(testResults.getProfile ? '✅ 通过 获取用户资料' : '❌ 失败 获取用户资料');
  console.log(testResults.updateProfile ? '✅ 通过 更新扩展资料' : '❌ 失败 更新扩展资料');
  console.log(testResults.reLoginAndGet ? '✅ 通过 重新登录验证保存' : '❌ 失败 重新登录验证保存');
  
  const passedTests = Object.values(testResults).filter(result => result).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log('\n============================================================');
  console.log(`🎯 测试完成: ${passedTests}/${totalTests} 项通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！demo用户个人资料保存功能正常工作。');
  } else {
    console.log('⚠️ 部分测试失败，需要检查个人资料保存功能。');
  }
}

// 运行测试
runDemoUserProfileTest().catch(console.error);
