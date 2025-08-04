const express = require("express");
const cors = require("cors");
const path = require("path");

// 根据环境加载对应的.env文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: path.join(__dirname, '../', envFile) });

const userRoutes = require("./routes/userRoutes");

const app = express();

// 环境检测
const isDevelopment = process.env.NODE_ENV !== 'production';
const isLocal = process.env.LOCAL_DEV === 'true';

// 动态CORS配置
const corsOptions = {
  origin: [
    // 本地开发域名
    "http://localhost:3001",
    "http://localhost:8000",
    "http://localhost:8080", 
    "http://localhost:8081",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    // 生产环境域名
    "http://152.32.218.174",
    "http://152.32.218.174:3000",
    "http://152.32.218.174:8000",
    "http://152.32.218.174:8080",
    "http://152.32.218.174:8081"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// 开发环境允许所有来源（仅用于调试）
if (isLocal) {
  corsOptions.origin = true;
}

app.use(cors(corsOptions));

// Body parser中间件
app.use(express.json());

// 静态文件服务（仅在生产环境）
if (!isDevelopment) {
  app.use(express.static(path.join(__dirname, '../..')));
}

// 基础路由
app.get("/", (req, res) => {
  if (isDevelopment) {
    res.json({ 
      message: "Lianyu AI Backend API - Development Mode",
      environment: process.env.NODE_ENV || 'development',
      cors: corsOptions.origin
    });
  } else {
    res.sendFile(path.join(__dirname, '../..', 'index.html'));
  }
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API路由
app.use("/api/auth", userRoutes);
app.use("/api/users", require("./routes/unifiedUserRoutes")); // 新的统一用户路由
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/config", require("./routes/configRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api", require("./routes/serviceRoutes"));

// 前端路由处理（仅生产环境）
if (!isDevelopment) {
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        message: `Cannot find ${req.originalUrl} on this server`
      });
    }
    res.sendFile(path.join(__dirname, '../..', 'index.html'));
  });
}

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// 启动服务器
const port = process.env.PORT || 3000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server is running on 0.0.0.0:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origins: ${JSON.stringify(corsOptions.origin)}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
