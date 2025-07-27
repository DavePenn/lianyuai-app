const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// 支持DATABASE_URL或单独的环境变量
let poolConfig;

if (process.env.DATABASE_URL) {
  // 使用DATABASE_URL连接
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: false
  };
} else {
  // 使用单独的环境变量
  poolConfig = {
    user: process.env.DB_USER || 'user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'lianyu_ai',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  };
}

const pool = new Pool(poolConfig);

// 添加连接错误处理
pool.on('error', (err, client) => {
  console.error('数据库连接池错误:', err);
});

// 测试连接
pool.connect((err, client, release) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('✅ 数据库连接成功');
    release();
  }
});

module.exports = pool;