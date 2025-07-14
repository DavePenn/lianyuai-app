const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./config/database');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 初始化数据库
async function initDatabase() {
  try {
    const initSqlPath = path.join(__dirname, 'config', 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    await pool.query(initSql);
    console.log('✅ 数据库初始化成功');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
  }
}

// CORS配置 - 允许跨域请求
app.use(cors({
  origin: [
    'http://127.0.0.1:8081',
    'http://localhost:8081',
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://152.32.218.174:8081',
    'http://152.32.218.174:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务 - 提供前端文件
app.use(express.static(path.join(__dirname, '../..')));

const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const configRoutes = require('./routes/configRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorMiddleware');

// 根路径重定向到前端页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../..', 'index.html'));
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Lianyu AI Backend'
  });
});

app.use('/api/auth', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/config', configRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// 前端路由 - 所有非API请求都返回index.html
app.get('*', (req, res, next) => {
  // 如果是API请求，继续处理错误
  if (req.originalUrl.startsWith('/api/')) {
    next(new AppError(`无法在服务器上找到 ${req.originalUrl}`, 404));
  } else {
    // 否则返回前端页面
    res.sendFile(path.join(__dirname, '../..', 'index.html'));
  }
});

app.use(globalErrorHandler);

const server = app.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on 0.0.0.0:${port}`);
  await initDatabase();
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});