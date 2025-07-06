const pool = require('../config/database');
const { queryAllData, queryUserDetails } = require('./queryDatabase');

/**
 * 数据库管理工具类
 */
class DatabaseManager {
    
    /**
     * 清空指定表的数据
     * @param {string} tableName - 表名
     * @returns {boolean} 操作是否成功
     */
    static async clearTable(tableName) {
        try {
            const validTables = ['users', 'sessions', 'messages'];
            if (!validTables.includes(tableName)) {
                throw new Error(`无效的表名: ${tableName}`);
            }
            
            await pool.query(`DELETE FROM ${tableName}`);
            console.log(`✅ 已清空表: ${tableName}`);
            return true;
        } catch (error) {
            console.error(`❌ 清空表失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 重置数据库（清空所有数据）
     * @returns {boolean} 操作是否成功
     */
    static async resetDatabase() {
        try {
            console.log('🔄 正在重置数据库...');
            
            // 按依赖关系顺序删除
            await pool.query('DELETE FROM messages');
            await pool.query('DELETE FROM sessions');
            await pool.query('DELETE FROM users');
            
            // 重置序列
            await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
            await pool.query('ALTER SEQUENCE sessions_id_seq RESTART WITH 1');
            await pool.query('ALTER SEQUENCE messages_id_seq RESTART WITH 1');
            
            console.log('✅ 数据库重置完成');
            return true;
        } catch (error) {
            console.error(`❌ 数据库重置失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 创建测试数据
     * @returns {boolean} 操作是否成功
     */
    static async createTestData() {
        try {
            console.log('🔧 正在创建测试数据...');
            
            // 创建测试用户
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);
            
            const userResult = await pool.query(
                'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id',
                ['测试用户', hashedPassword, 'test@lianyuai.com']
            );
            const userId = userResult.rows[0].id;
            
            // 创建测试会话
            const sessionResult = await pool.query(
                'INSERT INTO sessions (user_id, title) VALUES ($1, $2) RETURNING id',
                [userId, '测试对话']
            );
            const sessionId = sessionResult.rows[0].id;
            
            // 创建测试消息
            await pool.query(
                'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
                [sessionId, 'user', '你好，我想咨询一下恋爱问题']
            );
            
            await pool.query(
                'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
                [sessionId, 'assistant', '你好！我是恋语AI，很高兴为你提供恋爱建议。请告诉我你遇到的具体问题，我会尽力帮助你。']
            );
            
            console.log('✅ 测试数据创建完成');
            console.log(`- 创建用户: 测试用户 (ID: ${userId})`);
            console.log(`- 创建会话: 测试对话 (ID: ${sessionId})`);
            console.log('- 创建消息: 2条测试消息');
            
            return true;
        } catch (error) {
            console.error(`❌ 创建测试数据失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 导出数据库数据为JSON
     * @returns {Object} 数据库数据
     */
    static async exportData() {
        try {
            console.log('📤 正在导出数据库数据...');
            
            const data = await queryAllData();
            
            const fs = require('fs');
            const path = require('path');
            const exportPath = path.join(__dirname, '../../exports');
            
            // 确保导出目录存在
            if (!fs.existsSync(exportPath)) {
                fs.mkdirSync(exportPath, { recursive: true });
            }
            
            const filename = `database_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            const filepath = path.join(exportPath, filename);
            
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
            
            console.log(`✅ 数据导出完成: ${filepath}`);
            return data;
        } catch (error) {
            console.error(`❌ 数据导出失败: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 获取数据库连接状态
     * @returns {boolean} 连接是否正常
     */
    static async checkConnection() {
        try {
            await pool.query('SELECT 1');
            console.log('✅ 数据库连接正常');
            return true;
        } catch (error) {
            console.error(`❌ 数据库连接失败: ${error.message}`);
            return false;
        }
    }
}

// 命令行工具
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'query':
        case 'show':
            queryAllData()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        case 'user':
            const userId = parseInt(args[1]);
            if (!userId) {
                console.error('请提供用户ID: node dbManager.js user <user_id>');
                process.exit(1);
            }
            queryUserDetails(userId)
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        case 'reset':
            DatabaseManager.resetDatabase()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        case 'test':
            DatabaseManager.createTestData()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        case 'export':
            DatabaseManager.exportData()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        case 'check':
            DatabaseManager.checkConnection()
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
            
        default:
            console.log('数据库管理工具使用说明:');
            console.log('node dbManager.js query     - 查看所有数据');
            console.log('node dbManager.js user <id> - 查看指定用户详情');
            console.log('node dbManager.js reset     - 重置数据库（清空所有数据）');
            console.log('node dbManager.js test      - 创建测试数据');
            console.log('node dbManager.js export    - 导出数据库数据');
            console.log('node dbManager.js check     - 检查数据库连接');
            break;
    }
}

module.exports = DatabaseManager;