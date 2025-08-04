#!/usr/bin/env node
/**
 * 恋语AI测试账号创建脚本
 * 用于创建和管理测试用户账号
 */

const { Pool } = require('../backend/node_modules/pg');
const bcrypt = require('../backend/node_modules/bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 数据库连接配置
const pool = new Pool({
  user: process.env.DB_USER || 'user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lianyu_ai',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// 预设测试账号数据
const TEST_ACCOUNTS = [
  {
    username: 'test_user',
    email: 'test@lianyu.ai',
    password: 'daiyiping123',
    description: '基础测试账号'
  },
  {
    username: 'demo_user',
    email: 'demo@lianyu.ai',
    password: 'demo123',
    description: '演示账号'
  },
  {
    username: 'admin_test',
    email: 'admin@lianyu.ai',
    password: 'admin123',
    description: '管理员测试账号'
  },
  {
    username: 'guest',
    email: 'guest@lianyu.ai',
    password: 'guest123',
    description: '访客测试账号'
  }
];

/**
 * 创建用户表（如果不存在）
 */
async function createUsersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP
    );
  `;
  
  try {
    await pool.query(createTableQuery);
    console.log('✅ 用户表创建/验证成功');
  } catch (error) {
    console.error('❌ 创建用户表失败:', error.message);
    throw error;
  }
}

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
 * 创建单个测试账号
 * @param {Object} account - 账号信息
 */
async function createTestAccount(account) {
  try {
    // 检查用户是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [account.username, account.email]
    );
    
    if (existingUser.rows.length > 0) {
      console.log(`⚠️  用户 ${account.username} 已存在，跳过创建`);
      return;
    }
    
    // 加密密码
    const passwordHash = await hashPassword(account.password);
    
    // 插入新用户
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [account.username, account.email, passwordHash]
    );
    
    console.log(`✅ 创建测试账号成功:`);
    console.log(`   用户名: ${account.username}`);
    console.log(`   邮箱: ${account.email}`);
    console.log(`   密码: ${account.password}`);
    console.log(`   描述: ${account.description}`);
    console.log(`   ID: ${result.rows[0].id}\n`);
    
  } catch (error) {
    console.error(`❌ 创建账号 ${account.username} 失败:`, error.message);
  }
}

/**
 * 创建所有测试账号
 */
async function createAllTestAccounts() {
  console.log('🚀 开始创建测试账号...\n');
  
  for (const account of TEST_ACCOUNTS) {
    await createTestAccount(account);
  }
  
  console.log('🎉 测试账号创建完成！');
}

/**
 * 列出所有现有用户
 */
async function listAllUsers() {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at, is_active, last_login FROM users ORDER BY created_at DESC'
    );
    
    console.log('\n📋 现有用户列表:');
    console.log('=' .repeat(80));
    console.log('ID\t用户名\t\t邮箱\t\t\t创建时间\t\t状态');
    console.log('-'.repeat(80));
    
    result.rows.forEach(user => {
      console.log(`${user.id}\t${user.username.padEnd(12)}\t${user.email.padEnd(20)}\t${user.created_at.toISOString().slice(0, 19)}\t${user.is_active ? '活跃' : '禁用'}`);
    });
    
    console.log('=' .repeat(80));
    console.log(`总计: ${result.rows.length} 个用户\n`);
    
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error.message);
  }
}

/**
 * 删除测试账号
 * @param {string} username - 要删除的用户名
 */
async function deleteTestAccount(username) {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE username = $1 RETURNING username',
      [username]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ 删除用户 ${username} 成功`);
    } else {
      console.log(`⚠️  用户 ${username} 不存在`);
    }
    
  } catch (error) {
    console.error(`❌ 删除用户 ${username} 失败:`, error.message);
  }
}

/**
 * 清空所有测试账号
 */
async function clearAllTestAccounts() {
  console.log('🗑️  开始清空测试账号...');
  
  for (const account of TEST_ACCOUNTS) {
    await deleteTestAccount(account.username);
  }
  
  console.log('🧹 测试账号清空完成！');
}

/**
 * 显示使用帮助
 */
function showHelp() {
  console.log(`
🔧 恋语AI测试账号管理工具
`);
  console.log('使用方法:');
  console.log('  node scripts/create-test-accounts.js [命令]\n');
  console.log('可用命令:');
  console.log('  create    - 创建所有测试账号（默认）');
  console.log('  list      - 列出所有现有用户');
  console.log('  clear     - 清空所有测试账号');
  console.log('  help      - 显示此帮助信息\n');
  console.log('预设测试账号:');
  TEST_ACCOUNTS.forEach(account => {
    console.log(`  用户名: ${account.username.padEnd(12)} 密码: ${account.password.padEnd(10)} (${account.description})`);
  });
  console.log('');
}

/**
 * 主函数
 */
async function main() {
  const command = process.argv[2] || 'create';
  
  try {
    // 首先确保数据库表存在
    await createUsersTable();
    
    switch (command) {
      case 'create':
        await createAllTestAccounts();
        await listAllUsers();
        break;
        
      case 'list':
        await listAllUsers();
        break;
        
      case 'clear':
        await clearAllTestAccounts();
        await listAllUsers();
        break;
        
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
        
      default:
        console.log(`❌ 未知命令: ${command}`);
        showHelp();
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  createTestAccount,
  createAllTestAccounts,
  listAllUsers,
  deleteTestAccount,
  clearAllTestAccounts,
  TEST_ACCOUNTS
};