const pool = require('../config/database');

const Session = {};

Session.create = async (userId, title) => {
    const result = await pool.query(
        'INSERT INTO sessions (user_id, title) VALUES ($1, $2) RETURNING *',
        [userId, title]
    );
    return result.rows[0];
};

Session.findByUser = async (userId) => {
    const result = await pool.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    return result.rows;
};

Session.findById = async (sessionId) => {
    const result = await pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    return result.rows[0];
};

module.exports = Session;