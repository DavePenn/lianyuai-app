#!/usr/bin/env node
/**
 * 恋语AI MySQL测试账号创建脚本
 * 用于创建和管理测试用户账号
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env.development') });

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'lianyu_user',
  password: process.env.DB_PASSWORD || 'lianyu123',
  database: process.env.DB_NAME || 'lianyu_ai'
};

// 测试账号数据
const TEST_ACCOUNT = {
  username: 'LianYu',
  email: 'daiyiping821@gmail.com',
  password: 'daiyiping123',
  description: '主要测试账号'
};

/**
 * 加密密码
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 加密后的密码哈希
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * 创建或更新测试账号
 */
async function createOrUpdateTestAccount() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    console.log('数据库配置:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查用户是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id, email, username FROM users WHERE email = ? OR username = ?',
      [TEST_ACCOUNT.email, TEST_ACCOUNT.username]
    );
    
    // 加密密码
    const passwordHash = await hashPassword(TEST_ACCOUNT.password);
    
    if (existingUsers.length > 0) {
      // 更新现有用户的密码
      console.log(`⚠️  用户已存在，更新密码...`);
      await connection.execute(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
        [passwordHash, TEST_ACCOUNT.email]
      );
      console.log(`✅ 更新测试账号密码成功`);
    } else {
      // 创建新用户
      console.log('🆕 创建新测试账号...');
      await connection.execute(
        'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
        [TEST_ACCOUNT.username, TEST_ACCOUNT.email, passwordHash]
      );
      console.log(`✅ 创建测试账号成功`);
    }
    
    console.log(`\n📋 测试账号信息:`);
    console.log(`   用户名: ${TEST_ACCOUNT.username}`);
    console.log(`   邮箱: ${TEST_ACCOUNT.email}`);
    console.log(`   密码: ${TEST_ACCOUNT.password}`);
    console.log(`   描述: ${TEST_ACCOUNT.description}\n`);
    
    // 验证账号
    const [verifyUsers] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE email = ?',
      [TEST_ACCOUNT.email]
    );
    
    if (verifyUsers.length > 0) {
      console.log('✅ 账号验证成功:', verifyUsers[0]);
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 数据库连接已关闭');
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始创建/更新MySQL测试账号...\n');
  await createOrUpdateTestAccount();
  console.log('🎉 操作完成！');
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createOrUpdateTestAccount };