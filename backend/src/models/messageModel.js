const pool = require('../config/database');

const Message = {};

Message.create = async (sessionId, role, content, model = null) => {
    const result = await pool.query(
        'INSERT INTO messages (session_id, role, content, model) VALUES (?, ?, ?, ?)',
        [sessionId, role, content, model]
    );
    return {
        id: result.insertId,
        session_id: sessionId,
        role,
        content,
        model,
        created_at: new Date()
    };
};

Message.findBySession = async (sessionId) => {
    const result = await pool.query(
        'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
        [sessionId]
    );
    return result;
};

Message.findLastBySession = async (sessionId, limit = 10) => {
    const result = await pool.query(
        'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?',
        [sessionId, limit]
    );
    return result.reverse();
};

// 根据ID查找单条消息
Message.findById = async (messageId) => {
    const result = await pool.query(
        'SELECT * FROM messages WHERE id = ?',
        [messageId]
    );
    return result[0];
};

// 删除单条消息
Message.deleteById = async (messageId) => {
    const result = await pool.query(
        'DELETE FROM messages WHERE id = ?',
        [messageId]
    );
    return result.affectedRows > 0;
};

// 导出会话消息为文本格式
Message.exportBySession = async (sessionId, format = 'txt') => {
    const messages = await Message.findBySession(sessionId);
    
    if (format === 'json') {
        return JSON.stringify(messages, null, 2);
    }
    
    // 默认文本格式
    let exportText = '';
    messages.forEach(msg => {
        const timestamp = new Date(msg.created_at).toLocaleString('zh-CN');
        const roleText = msg.role === 'user' ? '用户' : 'AI助手';
        exportText += `[${timestamp}] ${roleText}: ${msg.content}\n\n`;
    });
    
    return exportText;
};

module.exports = Message;