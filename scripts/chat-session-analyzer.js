#!/usr/bin/env node
/**
 * 聊天会话分析脚本
 * 用于分析聊天会话数据、消息统计和用户行为模式
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
 * 获取会话列表
 * @param {Object} options - 查询选项
 */
async function getSessionList(options = {}) {
  const {
    limit = 20,
    offset = 0,
    userId = null,
    sortBy = 'updated_at',
    order = 'DESC'
  } = options;

  try {
    let query = `
      SELECT 
        s.id,
        s.user_id,
        s.title,
        s.created_at,
        s.updated_at,
        u.username,
        u.email,
        COUNT(m.id) as message_count,
        COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as ai_messages,
        MAX(m.created_at) as last_message_time
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN messages m ON s.id = m.session_id
    `;
    
    const params = [];
    
    // 添加用户过滤
    if (userId) {
      query += ` WHERE s.user_id = $1`;
      params.push(userId);
    }
    
    query += ` GROUP BY s.id, s.user_id, s.title, s.created_at, s.updated_at, u.username, u.email`;
    
    // 添加排序
    const validSortFields = ['id', 'title', 'created_at', 'updated_at', 'message_count'];
    const validOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validOrders.includes(order.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`;
    } else {
      query += ` ORDER BY s.updated_at DESC`;
    }
    
    // 添加分页
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM sessions s';
    const countParams = [];
    
    if (userId) {
      countQuery += ' WHERE s.user_id = $1';
      countParams.push(userId);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    return {
      sessions: result.rows,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1
      }
    };
    
  } catch (error) {
    console.error('❌ 获取会话列表失败:', error.message);
    throw error;
  }
}

/**
 * 获取会话详情
 * @param {number} sessionId - 会话ID
 */
async function getSessionDetail(sessionId) {
  try {
    // 获取会话基本信息
    const sessionResult = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        s.title,
        s.created_at,
        s.updated_at,
        u.username,
        u.email
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [sessionId]);
    
    if (sessionResult.rows.length === 0) {
      return null;
    }
    
    const session = sessionResult.rows[0];
    
    // 获取消息列表
    const messagesResult = await pool.query(`
      SELECT 
        id,
        role,
        content,
        created_at,
        LENGTH(content) as content_length
      FROM messages 
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [sessionId]);
    
    const messages = messagesResult.rows;
    
    // 计算统计信息
    const stats = {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      aiMessages: messages.filter(m => m.role === 'assistant').length,
      totalCharacters: messages.reduce((sum, m) => sum + m.content_length, 0),
      averageMessageLength: messages.length > 0 ? Math.round(messages.reduce((sum, m) => sum + m.content_length, 0) / messages.length) : 0,
      firstMessageTime: messages.length > 0 ? messages[0].created_at : null,
      lastMessageTime: messages.length > 0 ? messages[messages.length - 1].created_at : null,
      sessionDuration: null
    };
    
    // 计算会话持续时间
    if (stats.firstMessageTime && stats.lastMessageTime) {
      const duration = new Date(stats.lastMessageTime) - new Date(stats.firstMessageTime);
      stats.sessionDuration = Math.round(duration / 1000 / 60); // 分钟
    }
    
    return {
      ...session,
      messages,
      stats
    };
    
  } catch (error) {
    console.error('❌ 获取会话详情失败:', error.message);
    throw error;
  }
}

/**
 * 分析用户聊天模式
 * @param {number} userId - 用户ID（可选）
 */
async function analyzeChatPatterns(userId = null) {
  try {
    console.log('🔍 分析聊天模式...');
    
    // 基础统计
    let baseQuery = `
      SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(m.id) as total_messages,
        COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
        COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as ai_messages,
        AVG(LENGTH(m.content)) as avg_message_length,
        COUNT(DISTINCT s.user_id) as unique_users
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
    `;
    
    const baseParams = [];
    if (userId) {
      baseQuery += ' WHERE s.user_id = $1';
      baseParams.push(userId);
    }
    
    const baseResult = await pool.query(baseQuery, baseParams);
    const baseStats = baseResult.rows[0];
    
    // 每日活动模式
    let dailyQuery = `
      SELECT 
        EXTRACT(hour FROM m.created_at) as hour,
        COUNT(*) as message_count
      FROM messages m
      JOIN sessions s ON m.session_id = s.id
    `;
    
    if (userId) {
      dailyQuery += ' WHERE s.user_id = $1';
    }
    
    dailyQuery += `
      GROUP BY EXTRACT(hour FROM m.created_at)
      ORDER BY hour
    `;
    
    const dailyResult = await pool.query(dailyQuery, userId ? [userId] : []);
    
    // 会话长度分布
    let sessionLengthQuery = `
      SELECT 
        CASE 
          WHEN message_count = 0 THEN '0 消息'
          WHEN message_count BETWEEN 1 AND 5 THEN '1-5 消息'
          WHEN message_count BETWEEN 6 AND 10 THEN '6-10 消息'
          WHEN message_count BETWEEN 11 AND 20 THEN '11-20 消息'
          WHEN message_count BETWEEN 21 AND 50 THEN '21-50 消息'
          ELSE '50+ 消息'
        END as length_range,
        COUNT(*) as session_count
      FROM (
        SELECT 
          s.id,
          COUNT(m.id) as message_count
        FROM sessions s
        LEFT JOIN messages m ON s.id = m.session_id
    `;
    
    if (userId) {
      sessionLengthQuery += ' WHERE s.user_id = $1';
    }
    
    sessionLengthQuery += `
        GROUP BY s.id
      ) session_stats
      GROUP BY 
        CASE 
          WHEN message_count = 0 THEN '0 消息'
          WHEN message_count BETWEEN 1 AND 5 THEN '1-5 消息'
          WHEN message_count BETWEEN 6 AND 10 THEN '6-10 消息'
          WHEN message_count BETWEEN 11 AND 20 THEN '11-20 消息'
          WHEN message_count BETWEEN 21 AND 50 THEN '21-50 消息'
          ELSE '50+ 消息'
        END
      ORDER BY 
        CASE 
          WHEN length_range = '0 消息' THEN 1
          WHEN length_range = '1-5 消息' THEN 2
          WHEN length_range = '6-10 消息' THEN 3
          WHEN length_range = '11-20 消息' THEN 4
          WHEN length_range = '21-50 消息' THEN 5
          ELSE 6
        END
    `;
    
    const sessionLengthResult = await pool.query(sessionLengthQuery, userId ? [userId] : []);
    
    // 最活跃用户（如果不是单用户分析）
    let topUsersResult = { rows: [] };
    if (!userId) {
      const topUsersQuery = `
        SELECT 
          u.id,
          u.username,
          u.email,
          COUNT(DISTINCT s.id) as session_count,
          COUNT(m.id) as message_count,
          MAX(m.created_at) as last_activity
        FROM users u
        LEFT JOIN sessions s ON u.id = s.user_id
        LEFT JOIN messages m ON s.id = m.session_id
        GROUP BY u.id, u.username, u.email
        HAVING COUNT(m.id) > 0
        ORDER BY message_count DESC
        LIMIT 10
      `;
      
      topUsersResult = await pool.query(topUsersQuery);
    }
    
    return {
      baseStats: {
        totalSessions: parseInt(baseStats.total_sessions),
        totalMessages: parseInt(baseStats.total_messages),
        userMessages: parseInt(baseStats.user_messages),
        aiMessages: parseInt(baseStats.ai_messages),
        avgMessageLength: Math.round(parseFloat(baseStats.avg_message_length) || 0),
        uniqueUsers: parseInt(baseStats.unique_users)
      },
      dailyPattern: dailyResult.rows,
      sessionLengthDistribution: sessionLengthResult.rows,
      topUsers: topUsersResult.rows
    };
    
  } catch (error) {
    console.error('❌ 分析聊天模式失败:', error.message);
    throw error;
  }
}

/**
 * 导出会话数据
 * @param {string} format - 导出格式
 * @param {string} outputPath - 输出路径
 * @param {Object} options - 导出选项
 */
async function exportSessionData(format = 'json', outputPath = null, options = {}) {
  try {
    const { userId = null, includeMessages = false } = options;
    
    console.log('📤 导出会话数据...');
    
    let query = `
      SELECT 
        s.id,
        s.user_id,
        s.title,
        s.created_at,
        s.updated_at,
        u.username,
        u.email
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
    `;
    
    const params = [];
    if (userId) {
      query += ' WHERE s.user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY s.updated_at DESC';
    
    const sessionsResult = await pool.query(query, params);
    let sessions = sessionsResult.rows;
    
    // 如果需要包含消息
    if (includeMessages) {
      console.log('📝 包含消息数据...');
      
      for (let session of sessions) {
        const messagesResult = await pool.query(`
          SELECT id, role, content, created_at
          FROM messages 
          WHERE session_id = $1
          ORDER BY created_at ASC
        `, [session.id]);
        
        session.messages = messagesResult.rows;
      }
    }
    
    if (!outputPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const suffix = userId ? `-user-${userId}` : '';
      outputPath = `./sessions-export${suffix}-${timestamp}.${format}`;
    }
    
    let content = '';
    
    switch (format.toLowerCase()) {
      case 'json':
        content = JSON.stringify(sessions, null, 2);
        break;
        
      case 'csv':
        const headers = ['会话ID', '用户ID', '用户名', '邮箱', '标题', '创建时间', '更新时间'];
        content = headers.join(',') + '\n';
        
        sessions.forEach(session => {
          const row = [
            session.id,
            session.user_id || '',
            `"${session.username || ''}"`,
            `"${session.email || ''}"`,
            `"${session.title || ''}"`,
            `"${session.created_at}"`,
            `"${session.updated_at}"`
          ];
          content += row.join(',') + '\n';
        });
        break;
        
      case 'txt':
        content = '恋语AI会话数据导出\n';
        content += '=' .repeat(50) + '\n\n';
        
        sessions.forEach((session, index) => {
          content += `会话 ${index + 1}:\n`;
          content += `  ID: ${session.id}\n`;
          content += `  用户: ${session.username || '未知'} (${session.user_id})\n`;
          content += `  邮箱: ${session.email || '未设置'}\n`;
          content += `  标题: ${session.title || '无标题'}\n`;
          content += `  创建时间: ${session.created_at}\n`;
          content += `  更新时间: ${session.updated_at}\n`;
          
          if (session.messages) {
            content += `  消息数量: ${session.messages.length}\n`;
            content += `  消息内容:\n`;
            session.messages.forEach((msg, msgIndex) => {
              content += `    ${msgIndex + 1}. [${msg.role}] ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
            });
          }
          
          content += '\n';
        });
        break;
        
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
    
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✅ 会话数据已导出到: ${outputPath}`);
    console.log(`📊 导出会话数量: ${sessions.length}`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ 导出会话数据失败:', error.message);
    throw error;
  }
}

/**
 * 清理空会话
 * @param {boolean} dryRun - 是否为试运行
 */
async function cleanupEmptySessions(dryRun = true) {
  try {
    console.log('🧹 查找空会话...');
    
    const emptySessionsResult = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        s.title,
        s.created_at,
        u.username
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE m.id IS NULL
      ORDER BY s.created_at DESC
    `);
    
    const emptySessions = emptySessionsResult.rows;
    
    console.log(`🔍 找到 ${emptySessions.length} 个空会话:`);
    
    if (emptySessions.length > 0) {
      console.table(emptySessions);
      
      if (!dryRun) {
        const sessionIds = emptySessions.map(session => session.id);
        
        await pool.query('DELETE FROM sessions WHERE id = ANY($1)', [sessionIds]);
        
        console.log(`✅ 已删除 ${emptySessions.length} 个空会话`);
      } else {
        console.log('\n⚠️  这是试运行模式，没有实际删除数据');
        console.log('如需实际删除，请使用: --cleanup-empty --no-dry-run');
      }
    } else {
      console.log('✅ 没有找到空会话');
    }
    
    return emptySessions;
    
  } catch (error) {
    console.error('❌ 清理空会话失败:', error.message);
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
        const userId = args[2] ? parseInt(args[2]) : null;
        const result = await getSessionList({ limit, userId });
        
        console.log(`💬 会话列表 (${result.pagination.currentPage}/${result.pagination.pages} 页)`);
        if (userId) console.log(`👤 用户ID: ${userId}`);
        console.log('=' .repeat(80));
        
        result.sessions.forEach(session => {
          console.log(`ID: ${session.id} | 用户: ${session.username || '未知'} | 标题: ${session.title || '无标题'}`);
          console.log(`消息: ${session.message_count} (用户: ${session.user_messages}, AI: ${session.ai_messages})`);
          console.log(`时间: ${session.created_at} ~ ${session.updated_at}`);
          console.log('-'.repeat(80));
        });
        
        console.log(`\n📊 总计: ${result.pagination.total} 会话`);
        break;
        
      case 'detail':
        const sessionId = parseInt(args[1]);
        if (!sessionId) {
          console.log('请提供会话ID: node chat-session-analyzer.js detail <session_id>');
          return;
        }
        
        const sessionDetail = await getSessionDetail(sessionId);
        if (!sessionDetail) {
          console.log(`会话 ID ${sessionId} 不存在`);
          return;
        }
        
        console.log(`💬 会话详情 (ID: ${sessionId})`);
        console.log('=' .repeat(50));
        console.log(`标题: ${sessionDetail.title || '无标题'}`);
        console.log(`用户: ${sessionDetail.username || '未知'} (ID: ${sessionDetail.user_id})`);
        console.log(`邮箱: ${sessionDetail.email || '未设置'}`);
        console.log(`创建时间: ${sessionDetail.created_at}`);
        console.log(`更新时间: ${sessionDetail.updated_at}`);
        console.log('');
        console.log('📊 统计信息:');
        console.log(`  消息总数: ${sessionDetail.stats.totalMessages}`);
        console.log(`  用户消息: ${sessionDetail.stats.userMessages}`);
        console.log(`  AI回复: ${sessionDetail.stats.aiMessages}`);
        console.log(`  总字符数: ${sessionDetail.stats.totalCharacters}`);
        console.log(`  平均消息长度: ${sessionDetail.stats.averageMessageLength} 字符`);
        console.log(`  会话持续时间: ${sessionDetail.stats.sessionDuration || 0} 分钟`);
        
        if (sessionDetail.messages.length > 0) {
          console.log('\n📝 消息列表:');
          sessionDetail.messages.forEach((msg, index) => {
            const preview = msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
            console.log(`  ${index + 1}. [${msg.role}] ${preview}`);
            console.log(`     时间: ${msg.created_at} | 长度: ${msg.content_length} 字符`);
          });
        }
        break;
        
      case 'analyze':
        const analyzeUserId = args[1] ? parseInt(args[1]) : null;
        const analysis = await analyzeChatPatterns(analyzeUserId);
        
        console.log('📊 聊天模式分析');
        if (analyzeUserId) console.log(`👤 用户ID: ${analyzeUserId}`);
        console.log('=' .repeat(50));
        
        console.log('📈 基础统计:');
        console.log(`  总会话数: ${analysis.baseStats.totalSessions}`);
        console.log(`  总消息数: ${analysis.baseStats.totalMessages}`);
        console.log(`  用户消息: ${analysis.baseStats.userMessages}`);
        console.log(`  AI回复: ${analysis.baseStats.aiMessages}`);
        console.log(`  平均消息长度: ${analysis.baseStats.avgMessageLength} 字符`);
        if (!analyzeUserId) {
          console.log(`  活跃用户数: ${analysis.baseStats.uniqueUsers}`);
        }
        
        console.log('\n🕐 每日活动模式:');
        analysis.dailyPattern.forEach(hour => {
          const bar = '█'.repeat(Math.ceil(hour.message_count / 10));
          console.log(`  ${hour.hour.toString().padStart(2, '0')}:00 ${bar} (${hour.message_count})`);
        });
        
        console.log('\n📏 会话长度分布:');
        analysis.sessionLengthDistribution.forEach(dist => {
          console.log(`  ${dist.length_range}: ${dist.session_count} 会话`);
        });
        
        if (!analyzeUserId && analysis.topUsers.length > 0) {
          console.log('\n🏆 最活跃用户:');
          analysis.topUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.username} - ${user.message_count} 消息, ${user.session_count} 会话`);
          });
        }
        break;
        
      case 'export':
        const format = args[1] || 'json';
        const outputPath = args[2];
        const exportUserId = args[3] ? parseInt(args[3]) : null;
        const includeMessages = args.includes('--include-messages');
        
        await exportSessionData(format, outputPath, { userId: exportUserId, includeMessages });
        break;
        
      case 'cleanup-empty':
        const dryRun = !args.includes('--no-dry-run');
        await cleanupEmptySessions(dryRun);
        break;
        
      default:
        console.log('聊天会话分析工具使用说明:');
        console.log('');
        console.log('命令列表:');
        console.log('  list [limit] [user_id]              - 查看会话列表');
        console.log('  detail <session_id>                 - 查看会话详情');
        console.log('  analyze [user_id]                   - 分析聊天模式');
        console.log('  export [format] [path] [user_id]    - 导出会话数据');
        console.log('  cleanup-empty [--no-dry-run]       - 清理空会话');
        console.log('');
        console.log('选项:');
        console.log('  --include-messages                  - 导出时包含消息内容');
        console.log('  --no-dry-run                       - 实际执行删除操作');
        console.log('');
        console.log('示例:');
        console.log('  node chat-session-analyzer.js list 10');
        console.log('  node chat-session-analyzer.js detail 1');
        console.log('  node chat-session-analyzer.js analyze');
        console.log('  node chat-session-analyzer.js export json ./sessions.json --include-messages');
        console.log('  node chat-session-analyzer.js cleanup-empty');
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
  getSessionList,
  getSessionDetail,
  analyzeChatPatterns,
  exportSessionData,
  cleanupEmptySessions
};