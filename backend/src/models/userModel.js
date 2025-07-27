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

// 根据ID查找用户
User.findById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

// 更新用户资料
User.updateProfile = async (userId, updateData) => {
    const { username, email, bio, gender, birth_date, province, city, relationship_status, interests, contact } = updateData;
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (username !== undefined) {
        fields.push(`username = $${paramCount}`);
        values.push(username);
        paramCount++;
    }
    
    if (email !== undefined) {
        fields.push(`email = $${paramCount}`);
        values.push(email);
        paramCount++;
    }
    
    if (bio !== undefined) {
        fields.push(`bio = $${paramCount}`);
        values.push(bio);
        paramCount++;
    }
    
    if (gender !== undefined) {
        fields.push(`gender = $${paramCount}`);
        values.push(gender);
        paramCount++;
    }
    
    if (birth_date !== undefined) {
        fields.push(`birth_date = $${paramCount}`);
        values.push(birth_date || null);
        paramCount++;
    }
    
    if (province !== undefined) {
        fields.push(`province = $${paramCount}`);
        values.push(province);
        paramCount++;
    }
    
    if (city !== undefined) {
        fields.push(`city = $${paramCount}`);
        values.push(city);
        paramCount++;
    }
    
    if (relationship_status !== undefined) {
        fields.push(`relationship_status = $${paramCount}`);
        values.push(relationship_status);
        paramCount++;
    }
    
    if (interests !== undefined) {
        fields.push(`interests = $${paramCount}`);
        values.push(interests);
        paramCount++;
    }
    
    if (contact !== undefined) {
        fields.push(`contact = $${paramCount}`);
        values.push(contact);
        paramCount++;
    }
    
    if (fields.length === 0) {
        return null; // 没有要更新的字段
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(userId);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// 更新用户密码
User.updatePassword = async (userId, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    const result = await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        [password_hash, userId]
    );
    
    return result.rows.length > 0;
};

module.exports = User;