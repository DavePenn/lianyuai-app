#!/usr/bin/env node
/**
 * 数据库数据查看脚本
 * 用于查看用户个人资料和聊天历史数据
 */

const { Pool } = require('pg');
const path = require('path');

// 数据库连接配置
const pool = new Pool({
  user: process.env.DB_USER || 'lianyu_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lianyu_ai',
  password: process.env.DB_PASSWORD || 'lianyu_password',
  port: process.env.DB_PORT || 5432,
});

/**
 * 查看数据库概览
 */
async function viewDatabaseOverview() {
  try {
    console.log('🔍 数据库概览');
    console.log('=' .repeat(50));
    
    // 统计各表数据量
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const sessionCount = await pool.query('SELECT COUNT(*) as count FROM sessions');
    const messageCount = await pool.query('SELECT COUNT(*) as count FROM messages');
    
    console.log(`👥 用户总数: ${userCount.rows[0].count}`);
    console.log(`💬 会话总数: ${sessionCount.rows[0].count}`);
    console.log(`📝 消息总数: ${messageCount.rows[0].count}`);
    
    return {
      users: parseInt(userCount.rows[0].count),
      sessions: parseInt(sessionCount.rows[0].count),
      messages: parseInt(messageCount.rows[0].count)
    };
  } catch (error) {
    console.error('❌ 查询数据库概览失败:', error.message);
    throw error;
  }
}

/**
 * 查看用户个人资料数据
 */
async function viewUserProfiles(limit = 10) {
  try {
    console.log('\n👥 用户个人资料数据');
    console.log('=' .repeat(50));
    
    const result = await pool.query(`
      SELECT 
        id,
        username,
        email,
        created_at,
        updated_at,
        CASE 
          WHEN password_hash IS NOT NULL THEN '已设置密码'
          ELSE '未设置密码'
        END as password_status
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);
    
    if (result.rows.length === 0) {
      console.log('暂无用户数据');
      return [];
    }
    
    console.table(result.rows);
    return result.rows;
  } catch (error) {
    console.error('❌ 查询用户资料失败:', error.message);
    throw error;
  }
}

/**
 * 查看聊天历史数据
 */
async function viewChatHistory(limit = 20) {
  try {
    console.log('\n💬 聊天历史数据');
    console.log('=' .repeat(50));
    
    // 查询会话数据
    const sessionsResult = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        s.title,
        s.created_at,
        s.updated_at,
        u.username,
        COUNT(m.id) as message_count
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN messages m ON s.id = m.session_id
      GROUP BY s.id, s.user_id, s.title, s.created_at, s.updated_at, u.username
      ORDER BY s.updated_at DESC
      LIMIT $1
    `, [limit]);
    
    if (sessionsResult.rows.length === 0) {
      console.log('暂无会话数据');
      return { sessions: [], messages: [] };
    }
    
    console.log('\n📋 会话列表:');
    console.table(sessionsResult.rows);
    
    // 查询最近的消息
    const messagesResult = await pool.query(`
      SELECT 
        m.id,
        m.session_id,
        m.role,
        LEFT(m.content, 100) as content_preview,
        m.model,
        m.created_at,
        s.title as session_title,
        u.username
      FROM messages m
      LEFT JOIN sessions s ON m.session_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT $1
    `, [limit]);
    
    if (messagesResult.rows.length > 0) {
      console.log('\n📝 最近消息:');
      console.table(messagesResult.rows);
    } else {
      console.log('\n📝 暂无消息数据');
    }
    
    return {
      sessions: sessionsResult.rows,
      messages: messagesResult.rows
    };
  } catch (error) {
    console.error('❌ 查询聊天历史失败:', error.message);
    throw error;
  }
}

/**
 * 查看特定用户的详细数据
 */
async function viewUserDetails(userId) {
  try {
    console.log(`\n🔍 用户详细数据 (ID: ${userId})`);
    console.log('=' .repeat(50));
    
    // 查询用户基本信息
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
      console.log(`用户 ID ${userId} 不存在`);
      return null;
    }
    
    const user = userResult.rows[0];
    console.log('\n👤 用户信息:');
    console.table([user]);
    
    // 查询用户的会话
    const sessionsResult = await pool.query(`
      SELECT 
        id,
        title,
        created_at,
        updated_at
      FROM sessions 
      WHERE user_id = $1 
      ORDER BY updated_at DESC
    `, [userId]);
    
    console.log(`\n💬 用户会话 (${sessionsResult.rows.length} 个):`);
    if (sessionsResult.rows.length > 0) {
      console.table(sessionsResult.rows);
    } else {
      console.log('该用户暂无会话');
    }
    
    // 查询用户的消息统计
    const messageStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN role = 'assistant' THEN 1 END) as ai_messages
      FROM messages m
      JOIN sessions s ON m.session_id = s.id
      WHERE s.user_id = $1
    `, [userId]);
    
    const stats = messageStatsResult.rows[0];
    console.log('\n📊 消息统计:');
    console.log(`- 总消息数: ${stats.total_messages}`);
    console.log(`- 用户消息: ${stats.user_messages}`);
    console.log(`- AI回复: ${stats.ai_messages}`);
    
    return {
      user,
      sessions: sessionsResult.rows,
      messageStats: stats
    };
  } catch (error) {
    console.error('❌ 查询用户详情失败:', error.message);
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
      case 'overview':
        await viewDatabaseOverview();
        break;
        
      case 'users':
        const userLimit = parseInt(args[1]) || 10;
        await viewUserProfiles(userLimit);
        break;
        
      case 'chat':
        const chatLimit = parseInt(args[1]) || 20;
        await viewChatHistory(chatLimit);
        break;
        
      case 'user':
        const userId = parseInt(args[1]);
        if (!userId) {
          console.log('请提供用户ID: node view-database-data.js user <user_id>');
          return;
        }
        await viewUserDetails(userId);
        break;
        
      case 'all':
      default:
        await viewDatabaseOverview();
        await viewUserProfiles(5);
        await viewChatHistory(10);
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
  viewDatabaseOverview,
  viewUserProfiles,
  viewChatHistory,
  viewUserDetails
};