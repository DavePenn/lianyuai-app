#!/usr/bin/env node

const axios = require('axios');

// 配置信息
const API_BASE_URL = 'http://152.32.218.174:3001';

// 生成随机测试用户
const timestamp = Date.now();
const testUser = {
  username: `profile_test_${timestamp}`,
  email: `profile_test_${timestamp}@test.com`,
  password: 'test123456'
};

let authToken = '';
let userId = '';

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
      console.log(`   用户ID: ${response.data.data.user.id}`);
      authToken = response.data.token;
      userId = response.data.data.user.id;
      return { success: true, token: authToken, userId };
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
 * 测试获取用户资料
 */
async function testGetUserProfile() {
  console.log('🔍 测试获取用户资料...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success && response.data.data.user) {
      const user = response.data.data.user;
      console.log('✅ 获取用户资料成功');
      console.log(`   用户ID: ${user.id}`);
      console.log(`   用户名: ${user.username}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   创建时间: ${user.created_at}`);
      console.log(`   更新时间: ${user.updated_at || '未更新'}`);
      return { success: true, user };
    } else {
      console.log('❌ 获取用户资料失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 获取用户资料失败:', error.response?.data?.message || error.message);
    console.log(`   状态码: ${error.response?.status}`);
    return { success: false };
  }
}

/**
 * 测试更新用户资料
 */
async function testUpdateUserProfile() {
  console.log('🔍 测试更新用户资料...');
  
  const updateData = {
    username: `${testUser.username}_updated`,
    email: `updated_${testUser.email}`
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
      console.log('✅ 更新用户资料成功');
      console.log(`   新用户名: ${user.username}`);
      console.log(`   新邮箱: ${user.email}`);
      console.log(`   更新时间: ${user.updated_at}`);
      return { success: true, user };
    } else {
      console.log('❌ 更新用户资料失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 更新用户资料失败:', error.response?.data?.message || error.message);
    console.log(`   状态码: ${error.response?.status}`);
    return { success: false };
  }
}

/**
 * 测试修改密码
 */
async function testChangePassword() {
  console.log('🔍 测试修改密码...');
  
  const passwordData = {
    currentPassword: testUser.password,
    newPassword: 'newtest123456',
    confirmPassword: 'newtest123456'
  };
  
  try {
    const response = await axios.put(`${API_BASE_URL}/api/auth/password`, passwordData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ 修改密码成功');
      console.log(`   消息: ${response.data.message}`);
      return { success: true };
    } else {
      console.log('❌ 修改密码失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 修改密码失败:', error.response?.data?.message || error.message);
    console.log(`   状态码: ${error.response?.status}`);
    return { success: false };
  }
}

/**
 * 测试用新密码登录
 */
async function testLoginWithNewPassword() {
  console.log('🔍 测试用新密码登录...');
  
  const loginData = {
    username: `${testUser.username}_updated`,
    password: 'newtest123456'
  };
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
    
    if (response.data.success && response.data.token) {
      console.log('✅ 新密码登录成功');
      console.log(`   新Token已获取`);
      console.log(`   用户名: ${response.data.data.user.username}`);
      return { success: true, token: response.data.token };
    } else {
      console.log('❌ 新密码登录失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ 新密码登录失败:', error.response?.data?.message || error.message);
    console.log(`   状态码: ${error.response?.status}`);
    return { success: false };
  }
}

/**
 * 测试Token验证
 */
async function testTokenValidation() {
  console.log('🔍 测试Token验证...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success && response.data.data.user) {
      const user = response.data.data.user;
      console.log('✅ Token验证成功');
      console.log(`   验证用户: ${user.username}`);
      console.log(`   用户ID: ${user.id}`);
      return { success: true, user };
    } else {
      console.log('❌ Token验证失败: 响应格式错误');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Token验证失败:', error.response?.data?.message || error.message);
    console.log(`   状态码: ${error.response?.status}`);
    return { success: false };
  }
}

/**
 * 主测试函数
 */
async function runUserProfileTest() {
  console.log('🚀 开始恋语AI用户资料管理功能测试');
  console.log('============================================================');
  
  const results = {
    userRegistration: false,
    getUserProfile: false,
    updateUserProfile: false,
    changePassword: false,
    loginWithNewPassword: false,
    tokenValidation: false
  };
  
  // 1. 用户注册
  const regResult = await testUserRegistration();
  results.userRegistration = regResult.success;
  
  if (!regResult.success) {
    console.log('\n❌ 用户注册失败，终止测试');
    return;
  }
  
  console.log('');
  
  // 2. 获取用户资料
  const profileResult = await testGetUserProfile();
  results.getUserProfile = profileResult.success;
  
  console.log('');
  
  // 3. 更新用户资料
  const updateResult = await testUpdateUserProfile();
  results.updateUserProfile = updateResult.success;
  
  console.log('');
  
  // 4. 修改密码
  const passwordResult = await testChangePassword();
  results.changePassword = passwordResult.success;
  
  console.log('');
  
  // 5. 用新密码登录
  const newLoginResult = await testLoginWithNewPassword();
  results.loginWithNewPassword = newLoginResult.success;
  
  if (newLoginResult.success) {
    authToken = newLoginResult.token; // 更新token
  }
  
  console.log('');
  
  // 6. Token验证
  const tokenResult = await testTokenValidation();
  results.tokenValidation = tokenResult.success;
  
  // 输出测试结果总结
  console.log('');
  console.log('============================================================');
  console.log('📊 用户资料管理测试结果总结:');
  console.log('============================================================');
  
  const testItems = [
    { name: '用户注册', key: 'userRegistration' },
    { name: '获取用户资料', key: 'getUserProfile' },
    { name: '更新用户资料', key: 'updateUserProfile' },
    { name: '修改密码', key: 'changePassword' },
    { name: '新密码登录', key: 'loginWithNewPassword' },
    { name: 'Token验证', key: 'tokenValidation' }
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
    console.log('🎉 所有用户资料管理功能测试通过！系统完全正常。');
  } else if (passedCount >= testItems.length * 0.8) {
    console.log('⚠️ 大部分功能正常，但存在一些问题需要解决。');
  } else {
    console.log('❌ 系统存在严重问题，需要立即修复。');
  }
}

// 运行测试
runUserProfileTest().catch(error => {
  console.error('测试过程中发生错误:', error.message);
  process.exit(1);
});