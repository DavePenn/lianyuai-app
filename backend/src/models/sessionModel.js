const pool = require('../config/database');

const Session = {};

Session.create = async (userId, title) => {
    const result = await pool.query(
        'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
        [userId, title]
    );
    return {
        id: result.insertId,
        user_id: userId,
        title,
        created_at: new Date(),
        updated_at: new Date()
    };
};

Session.findByUserId = async (userId) => {
    const result = await pool.query('SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    return result.rows;
};

Session.findById = async (sessionId) => {
    const result = await pool.query('SELECT * FROM chat_sessions WHERE id = ?', [sessionId]);
    return result.rows[0];
};

module.exports = Session;