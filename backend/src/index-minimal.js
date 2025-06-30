const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
  res.send('Hello from Lianyu AI Backend!');
});

// 手动定义简单路由，不使用外部路由文件
app.post('/api/users/register', (req, res) => {
  res.json({ status: 'success', message: 'Register endpoint working' });
});

app.post('/api/users/login', (req, res) => {
  res.json({ status: 'success', message: 'Login endpoint working' });
});

// 错误处理
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});