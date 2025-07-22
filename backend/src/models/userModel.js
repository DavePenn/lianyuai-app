const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {};

User.create = async (username, password, email) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const result = await pool.query(
        'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
        [username, password_hash, email]
    );
    return result.rows[0];
};

User.findByUsername = async (username) => {
    // 支持通过用户名或邮箱登录
    const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $1', 
        [username]
    );
    return result.rows[0];
};

User.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

User.findByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

User.createWithGoogle = async (userData) => {
    const { username, email, name, googleId, avatar } = userData;
    
    const result = await pool.query(
        `INSERT INTO users (username, email, name, google_id, avatar, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         RETURNING id, username, email, name, google_id, avatar, created_at`,
        [username, email, name, googleId, avatar]
    );
    
    return result.rows[0];
};

User.updateGoogleId = async (userId, googleId) => {
    const result = await pool.query(
        'UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *',
        [googleId, userId]
    );
    return result.rows[0];
};

module.exports = User;