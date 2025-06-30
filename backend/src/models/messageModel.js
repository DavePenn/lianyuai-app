const pool = require('../config/database');

const Message = {};

Message.create = async (sessionId, role, content, model = null) => {
    const result = await pool.query(
        'INSERT INTO messages (session_id, role, content, model) VALUES ($1, $2, $3, $4) RETURNING *',
        [sessionId, role, content, model]
    );
    return result.rows[0];
};

Message.findBySession = async (sessionId) => {
    const result = await pool.query(
        'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
        [sessionId]
    );
    return result.rows;
};

Message.findLastBySession = async (sessionId, limit = 10) => {
    const result = await pool.query(
        'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2',
        [sessionId, limit]
    );
    return result.rows.reverse();
};

module.exports = Message;