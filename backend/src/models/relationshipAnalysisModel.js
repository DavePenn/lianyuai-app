const pool = require('../config/database');

const RelationshipAnalysis = {};

RelationshipAnalysis.create = async (userId, payload, result) => {
    const [rows] = await pool.execute(
        `INSERT INTO relationship_analyses (user_id, payload, result, stage_label, concern_type)
         VALUES (?, ?, ?, ?, ?)`,
        [
            userId || null,
            JSON.stringify(payload || {}),
            JSON.stringify(result || {}),
            result && result.stage ? result.stage.label : null,
            payload && payload.concern ? payload.concern.type : null
        ]
    );
    return { id: rows.insertId, user_id: userId, created_at: new Date() };
};

RelationshipAnalysis.findByUserId = async (userId, limit = 20, offset = 0) => {
    const [rows] = await pool.execute(
        `SELECT id, stage_label, concern_type, created_at
         FROM relationship_analyses
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );
    return rows;
};

RelationshipAnalysis.findById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM relationship_analyses WHERE id = ?',
        [id]
    );
    if (!rows.length) return null;
    const row = rows[0];
    row.payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    row.result = typeof row.result === 'string' ? JSON.parse(row.result) : row.result;
    return row;
};

module.exports = RelationshipAnalysis;
