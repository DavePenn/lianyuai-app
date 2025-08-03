const mysql = require('mysql2/promise');
const path = require('path');

// 根据环境加载对应的.env文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.join(__dirname, '../../', envFile) });

console.log('加载环境文件:', envFile);
console.log('数据库配置:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

// MySQL连接配置
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'lianyu_user',
  password: process.env.DB_PASSWORD || 'lianyu123',
  database: process.env.DB_NAME || 'lianyu_ai',
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(poolConfig);

// 测试连接
pool.getConnection()
  .then(connection => {
    console.log('✅ 数据库连接成功');
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err.message);
    console.error('连接配置:', {
      host: poolConfig.host,
      port: poolConfig.port,
      user: poolConfig.user,
      database: poolConfig.database
    });
  });

// 为了兼容现有代码，提供query方法
pool.query = async (sql, params) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return { rows };
  } catch (error) {
    throw error;
  }
};

module.exports = pool;