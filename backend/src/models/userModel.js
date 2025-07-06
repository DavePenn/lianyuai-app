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

module.exports = User;