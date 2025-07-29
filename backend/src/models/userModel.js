const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {};

User.create = async (username, password, email) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const result = await pool.query(
        'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
        [username, password_hash, email]
    );
    return {
        id: result.insertId,
        username,
        email,
        created_at: new Date()
    };
};

User.findByUsername = async (username) => {
    // 支持通过用户名或邮箱登录
    const result = await pool.query(
        'SELECT * FROM users WHERE username = ? OR email = ?', 
        [username, username]
    );
    return result.rows[0];
};

User.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

User.findByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return result.rows[0];
};

User.createWithGoogle = async (userData) => {
    const { username, email, name, googleId, avatar } = userData;
    
    const result = await pool.query(
        `INSERT INTO users (username, email, name, google_id, avatar, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [username, email, name, googleId, avatar]
    );
    
    return {
        id: result.insertId,
        username,
        email,
        name,
        google_id: googleId,
        avatar,
        created_at: new Date()
    };
};

User.updateGoogleId = async (userId, googleId) => {
    await pool.query(
        'UPDATE users SET google_id = ? WHERE id = ?',
        [googleId, userId]
    );
    return await User.findById(userId);
};

// 根据ID查找用户
User.findById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return result.rows[0];
};

// 更新用户资料
User.updateProfile = async (userId, updateData) => {
    const { username, email, bio, gender, birth_date, province, city, relationship_status, interests, contact } = updateData;
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (username !== undefined) {
        fields.push('username = ?');
        values.push(username);
    }
    
    if (email !== undefined) {
        fields.push('email = ?');
        values.push(email);
    }
    
    if (bio !== undefined) {
        fields.push('bio = ?');
        values.push(bio);
    }
    
    if (gender !== undefined) {
        fields.push('gender = ?');
        values.push(gender);
    }
    
    if (birth_date !== undefined) {
        fields.push('birth_date = ?');
        values.push(birth_date || null);
    }
    
    if (province !== undefined) {
        fields.push('province = ?');
        values.push(province);
    }
    
    if (city !== undefined) {
        fields.push('city = ?');
        values.push(city);
    }
    
    if (relationship_status !== undefined) {
        fields.push('relationship_status = ?');
        values.push(relationship_status);
    }
    
    if (interests !== undefined) {
        fields.push('interests = ?');
        values.push(interests);
    }
    
    if (contact !== undefined) {
        fields.push('contact = ?');
        values.push(contact);
    }
    
    if (fields.length === 0) {
        return null; // 没有要更新的字段
    }
    
    fields.push('updated_at = NOW()');
    values.push(userId);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    await pool.query(query, values);
    return await User.findById(userId);
};

// 更新用户密码
User.updatePassword = async (userId, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    const result = await pool.query(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [password_hash, userId]
    );
    
    return result.affectedRows > 0;
};

module.exports = User;