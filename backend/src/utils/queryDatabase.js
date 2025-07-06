const pool = require('../config/database');

/**
 * 查询数据库中所有表的数据
 * @returns {Object} 包含所有表数据的对象
 */
async function queryAllData() {
    try {
        console.log('🔍 正在查询数据库数据...');
        
        // 查询用户表
        const usersResult = await pool.query('SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC');
        console.log('\n👥 用户表 (users):');
        console.log(`总计 ${usersResult.rows.length} 条记录`);
        if (usersResult.rows.length > 0) {
            console.table(usersResult.rows);
        } else {
            console.log('暂无用户数据');
        }
        
        // 查询用户详细信息（包括密码哈希）
        const usersWithHashResult = await pool.query('SELECT id, username, email, password_hash FROM users ORDER BY created_at DESC');
        console.log('\n🔐 用户登录信息:');
        if (usersWithHashResult.rows.length > 0) {
            usersWithHashResult.rows.forEach((user, index) => {
                console.log(`\n用户 ${index + 1}:`);
                console.log(`  ID: ${user.id}`);
                console.log(`  用户名: ${user.username}`);
                console.log(`  邮箱: ${user.email}`);
                console.log(`  密码哈希: ${user.password_hash ? user.password_hash.substring(0, 30) + '...' : '无'}`);
            });
        }
        
        // 查询会话表
        const sessionsResult = await pool.query('SELECT * FROM sessions ORDER BY updated_at DESC');
        console.log('\n💬 会话表 (sessions):');
        console.log(`总计 ${sessionsResult.rows.length} 条记录`);
        if (sessionsResult.rows.length > 0) {
            console.table(sessionsResult.rows);
        } else {
            console.log('暂无会话数据');
        }
        
        // 查询消息表
        const messagesResult = await pool.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 20');
        console.log('\n📝 消息表 (messages) - 最近20条:');
        console.log(`总计 ${messagesResult.rows.length} 条记录`);
        if (messagesResult.rows.length > 0) {
            console.table(messagesResult.rows);
        } else {
            console.log('暂无消息数据');
        }
        
        // 统计信息
        console.log('\n📊 数据库统计:');
        console.log(`- 用户数量: ${usersResult.rows.length}`);
        console.log(`- 会话数量: ${sessionsResult.rows.length}`);
        
        const totalMessagesResult = await pool.query('SELECT COUNT(*) as total FROM messages');
        console.log(`- 消息总数: ${totalMessagesResult.rows[0].total}`);
        
        return {
            users: usersResult.rows,
            sessions: sessionsResult.rows,
            messages: messagesResult.rows,
            stats: {
                userCount: usersResult.rows.length,
                sessionCount: sessionsResult.rows.length,
                messageCount: parseInt(totalMessagesResult.rows[0].total)
            }
        };
        
    } catch (error) {
        console.error('❌ 查询数据库失败:', error.message);
        throw error;
    }
}

/**
 * 查询特定用户的详细信息
 * @param {number} userId - 用户ID
 * @returns {Object} 用户详细信息
 */
async function queryUserDetails(userId) {
    try {
        // 查询用户基本信息
        const userResult = await pool.query('SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1', [userId]);
        
        if (userResult.rows.length === 0) {
            console.log(`用户 ID ${userId} 不存在`);
            return null;
        }
        
        const user = userResult.rows[0];
        
        // 查询用户的会话
        const sessionsResult = await pool.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
        
        // 查询用户的消息数量
        const messageCountResult = await pool.query(
            'SELECT COUNT(*) as total FROM messages m JOIN sessions s ON m.session_id = s.id WHERE s.user_id = $1',
            [userId]
        );
        
        console.log(`\n👤 用户详情 (ID: ${userId}):`);
        console.table([user]);
        
        console.log(`\n💬 用户会话 (${sessionsResult.rows.length} 个):`);
        if (sessionsResult.rows.length > 0) {
            console.table(sessionsResult.rows);
        } else {
            console.log('该用户暂无会话');
        }
        
        console.log(`\n📊 用户统计:`);
        console.log(`- 会话数量: ${sessionsResult.rows.length}`);
        console.log(`- 消息数量: ${messageCountResult.rows[0].total}`);
        
        return {
            user,
            sessions: sessionsResult.rows,
            messageCount: parseInt(messageCountResult.rows[0].total)
        };
        
    } catch (error) {
        console.error('❌ 查询用户详情失败:', error.message);
        throw error;
    }
}

module.exports = {
    queryAllData,
    queryUserDetails
};

// 如果直接运行此文件，则执行查询
if (require.main === module) {
    queryAllData()
        .then(() => {
            console.log('\n✅ 数据库查询完成');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 查询失败:', error.message);
            process.exit(1);
        });
}