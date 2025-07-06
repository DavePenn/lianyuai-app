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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const configRoutes = require('./routes/configRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorMiddleware');

app.get('/', (req, res) => {
  res.send('Hello from Lianyu AI Backend!');
});

app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/config', configRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`无法在服务器上找到 ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

const server = app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
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