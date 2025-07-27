#!/usr/bin/env node
/**
 * 用户个人资料管理脚本
 * 用于查看、导出和管理用户个人资料数据
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 数据库连接配置
const pool = new Pool({
  user: process.env.DB_USER || 'lianyu_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lianyu_ai',
  password: process.env.DB_PASSWORD || 'lianyu_secure_password_2024',
  port: process.env.DB_PORT || 5432,
});

/**
 * 获取用户个人资料列表
 * @param {Object} options - 查询选项
 * @param {number} options.limit - 限制数量
 * @param {number} options.offset - 偏移量
 * @param {string} options.search - 搜索关键词
 * @param {string} options.sortBy - 排序字段
 * @param {string} options.order - 排序方向
 */
async function getUserProfiles(options = {}) {
  const {
    limit = 20,
    offset = 0,
    search = '',
    sortBy = 'created_at',
    order = 'DESC'
  } = options;

  try {
    let query = `
      SELECT 
        id,
        username,
        email,
        created_at,
        updated_at,
        CASE 
          WHEN password_hash IS NOT NULL THEN true
          ELSE false
        END as has_password
      FROM users
    `;
    
    const params = [];
    
    // 添加搜索条件
    if (search) {
      query += ` WHERE (username ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }
    
    // 添加排序
    const validSortFields = ['id', 'username', 'email', 'created_at', 'updated_at'];
    const validOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validOrders.includes(order.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }
    
    // 添加分页
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const countParams = [];
    
    if (search) {
      countQuery += ' WHERE (username ILIKE $1 OR email ILIKE $1)';
      countParams.push(`%${search}%`);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    return {
      users: result.rows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1
      }
    };
    
  } catch (error) {
    console.error('❌ 获取用户资料失败:', error.message);
    throw error;
  }
}

/**
 * 获取用户详细信息
 * @param {number} userId - 用户ID
 */
async function getUserDetail(userId) {
  try {
    // 获取用户基本信息
    const userResult = await pool.query(`
      SELECT 
        id,
        username,
        email,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      return null;
    }
    
    const user = userResult.rows[0];
    
    // 获取用户会话统计
    const sessionStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as session_count,
        MAX(updated_at) as last_session_time
      FROM sessions 
      WHERE user_id = $1
    `, [userId]);
    
    // 获取用户消息统计
    const messageStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN role = 'assistant' THEN 1 END) as ai_messages,
        MAX(m.created_at) as last_message_time
      FROM messages m
      JOIN sessions s ON m.session_id = s.id
      WHERE s.user_id = $1
    `, [userId]);
    
    const sessionStats = sessionStatsResult.rows[0];
    const messageStats = messageStatsResult.rows[0];
    
    return {
      ...user,
      stats: {
        sessions: parseInt(sessionStats.session_count),
        lastSessionTime: sessionStats.last_session_time,
        totalMessages: parseInt(messageStats.total_messages),
        userMessages: parseInt(messageStats.user_messages),
        aiMessages: parseInt(messageStats.ai_messages),
        lastMessageTime: messageStats.last_message_time
      }
    };
    
  } catch (error) {
    console.error('❌ 获取用户详情失败:', error.message);
    throw error;
  }
}

/**
 * 导出用户数据
 * @param {string} format - 导出格式 (json|csv|txt)
 * @param {string} outputPath - 输出路径
 * @param {Object} options - 导出选项
 */
async function exportUserData(format = 'json', outputPath = null, options = {}) {
  try {
    const { users } = await getUserProfiles({ limit: 10000 });
    
    if (!outputPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      outputPath = `./user-export-${timestamp}.${format}`;
    }
    
    let content = '';
    
    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify(users, null, 2);
        break;
        
      case 'csv':
        const headers = ['ID', '用户名', '邮箱', '注册时间', '更新时间', '是否设置密码'];
        content = headers.join(',') + '\n';
        
        users.forEach(user => {
          const row = [
            user.id,
            `"${user.username}"`,
            `"${user.email || ''}"`,
            `"${user.created_at}"`,
            `"${user.updated_at}"`,
            user.has_password ? '是' : '否'
          ];
          content += row.join(',') + '\n';
        });
        break;
        
      case 'txt':
        content = '恋语AI用户数据导出\n';
        content += '=' .repeat(50) + '\n\n';
        
        users.forEach((user, index) => {
          content += `用户 ${index + 1}:\n`;
          content += `  ID: ${user.id}\n`;
          content += `  用户名: ${user.username}\n`;
          content += `  邮箱: ${user.email || '未设置'}\n`;
          content += `  注册时间: ${user.created_at}\n`;
          content += `  更新时间: ${user.updated_at}\n`;
          content += `  密码状态: ${user.has_password ? '已设置' : '未设置'}\n`;
          content += '\n';
        });
        break;
        
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ 用户数据已导出到: ${outputPath}`);
    console.log(`📊 导出用户数量: ${users.length}`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ 导出用户数据失败:', error.message);
    throw error;
  }
}

/**
 * 清理测试用户数据
 * @param {boolean} dryRun - 是否为试运行（不实际删除）
 */
async function cleanupTestUsers(dryRun = true) {
  try {
    const testPatterns = [
      'test%',
      'demo%',
      'admin%',
      'guest%',
      '%test%',
      '%$(date%',
      'user$(date%',
      'email%'
    ];
    
    let query = `
      SELECT id, username, email, created_at
      FROM users 
      WHERE (
    `;
    
    const conditions = testPatterns.map(() => 'username ILIKE ?').join(' OR ');
    query += conditions.replace(/\?/g, (match, offset) => `$${Math.floor(offset / 15) + 1}`);
    query += ')';
    
    // 重新构建查询，因为上面的替换逻辑有问题
    query = `
      SELECT id, username, email, created_at
      FROM users 
      WHERE (
        username ILIKE $1 OR
        username ILIKE $2 OR
        username ILIKE $3 OR
        username ILIKE $4 OR
        username ILIKE $5 OR
        username ILIKE $6 OR
        username ILIKE $7 OR
        username ILIKE $8
      )
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, testPatterns);
    const testUsers = result.rows;
    
    console.log(`🔍 找到 ${testUsers.length} 个疑似测试用户:`);
    
    if (testUsers.length > 0) {
      console.table(testUsers);
      
      if (!dryRun) {
        const userIds = testUsers.map(user => user.id);
        
        // 删除相关的消息（通过会话关联）
        await pool.query(`
          DELETE FROM messages 
          WHERE session_id IN (
            SELECT id FROM sessions WHERE user_id = ANY($1)
          )
        `, [userIds]);
        
        // 删除相关的会话
        await pool.query('DELETE FROM sessions WHERE user_id = ANY($1)', [userIds]);
        
        // 删除用户
        await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
        
        console.log(`✅ 已删除 ${testUsers.length} 个测试用户及其相关数据`);
      } else {
        console.log('\n⚠️  这是试运行模式，没有实际删除数据');
        console.log('如需实际删除，请使用: --cleanup --no-dry-run');
      }
    } else {
      console.log('✅ 没有找到测试用户');
    }
    
    return testUsers;
    
  } catch (error) {
    console.error('❌ 清理测试用户失败:', error.message);
    throw error;
  }
}

/**
 * 显示用户统计信息
 */
async function showUserStats() {
  try {
    // 基本统计
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = parseInt(totalResult.rows[0].total);
    
    // 最近注册统计
    const recentResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 day' THEN 1 END) as today,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as week,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as month
      FROM users
    `);
    
    const recent = recentResult.rows[0];
    
    // 活跃用户统计（有会话的用户）
    const activeResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM sessions
    `);
    
    const activeUsers = parseInt(activeResult.rows[0].active_users);
    
    // 邮箱域名统计
    const domainResult = await pool.query(`
      SELECT 
        SUBSTRING(email FROM '@(.*)$') as domain,
        COUNT(*) as count
      FROM users 
      WHERE email IS NOT NULL
      GROUP BY SUBSTRING(email FROM '@(.*)$')
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('📊 用户统计信息');
    console.log('=' .repeat(50));
    console.log(`总用户数: ${total}`);
    console.log(`活跃用户数: ${activeUsers} (${((activeUsers / total) * 100).toFixed(1)}%)`);
    console.log('');
    console.log('📅 注册趋势:');
    console.log(`  今天: ${recent.today}`);
    console.log(`  本周: ${recent.week}`);
    console.log(`  本月: ${recent.month}`);
    console.log('');
    console.log('📧 邮箱域名分布:');
    domainResult.rows.forEach(row => {
      console.log(`  ${row.domain}: ${row.count} 用户`);
    });
    
  } catch (error) {
    console.error('❌ 获取用户统计失败:', error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'list':
        const limit = parseInt(args[1]) || 20;
        const search = args[2] || '';
        const result = await getUserProfiles({ limit, search });
        
        console.log(`👥 用户列表 (${result.pagination.currentPage}/${result.pagination.pages} 页)`);
        console.log('=' .repeat(50));
        console.table(result.users);
        console.log(`\n📊 总计: ${result.pagination.total} 用户`);
        break;
        
      case 'detail':
        const userId = parseInt(args[1]);
        if (!userId) {
          console.log('请提供用户ID: node user-profile-manager.js detail <user_id>');
          return;
        }
        
        const userDetail = await getUserDetail(userId);
        if (!userDetail) {
          console.log(`用户 ID ${userId} 不存在`);
          return;
        }
        
        console.log(`👤 用户详情 (ID: ${userId})`);
        console.log('=' .repeat(50));
        console.log(`用户名: ${userDetail.username}`);
        console.log(`邮箱: ${userDetail.email || '未设置'}`);
        console.log(`注册时间: ${userDetail.created_at}`);
        console.log(`更新时间: ${userDetail.updated_at}`);
        console.log('');
        console.log('📊 使用统计:');
        console.log(`  会话数量: ${userDetail.stats.sessions}`);
        console.log(`  消息总数: ${userDetail.stats.totalMessages}`);
        console.log(`  用户消息: ${userDetail.stats.userMessages}`);
        console.log(`  AI回复: ${userDetail.stats.aiMessages}`);
        console.log(`  最后会话: ${userDetail.stats.lastSessionTime || '无'}`);
        console.log(`  最后消息: ${userDetail.stats.lastMessageTime || '无'}`);
        break;
        
      case 'export':
        const format = args[1] || 'json';
        const outputPath = args[2];
        await exportUserData(format, outputPath);
        break;
        
      case 'stats':
        await showUserStats();
        break;
        
      case 'cleanup':
        const dryRun = !args.includes('--no-dry-run');
        await cleanupTestUsers(dryRun);
        break;
        
      default:
        console.log('用户个人资料管理工具使用说明:');
        console.log('');
        console.log('命令列表:');
        console.log('  list [limit] [search]     - 查看用户列表');
        console.log('  detail <user_id>          - 查看用户详情');
        console.log('  export [format] [path]    - 导出用户数据 (json|csv|txt)');
        console.log('  stats                     - 显示用户统计');
        console.log('  cleanup [--no-dry-run]   - 清理测试用户');
        console.log('');
        console.log('示例:');
        console.log('  node user-profile-manager.js list 10');
        console.log('  node user-profile-manager.js detail 1');
        console.log('  node user-profile-manager.js export csv');
        console.log('  node user-profile-manager.js cleanup');
        break;
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await pool.end();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = {
  getUserProfiles,
  getUserDetail,
  exportUserData,
  cleanupTestUsers,
  showUserStats
};