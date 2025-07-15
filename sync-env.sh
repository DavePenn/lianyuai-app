#!/bin/bash

# =============================================================================
# 环境配置同步脚本
# 用途：同步本地开发环境配置到远程服务器，确保环境一致性
# =============================================================================

set -e

# 配置变量
REMOTE_HOST="152.32.218.174"
REMOTE_USER="root"
REMOTE_PATH="/var/www/lianyu_ai"
LOCAL_PATH="$(pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 同步本地backend配置到远程
sync_backend_config() {
    log_info "同步本地backend配置到远程..."
    
    # 备份远程配置
    ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH/backend/src && cp index.js index.js.remote.backup"
    
    # 复制本地配置到远程
    scp "$LOCAL_PATH/backend/src/index.js" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/backend/src/"
    
    log_success "Backend配置同步完成"
}

# 同步远程backend配置到本地
sync_backend_config_to_local() {
    log_info "同步远程backend配置到本地..."
    
    # 备份本地配置
    cp "$LOCAL_PATH/backend/src/index.js" "$LOCAL_PATH/backend/src/index.js.local.backup"
    
    # 复制远程配置到本地
    scp "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/backend/src/index.js" "$LOCAL_PATH/backend/src/"
    
    log_success "Backend配置同步到本地完成"
}

# 对比配置差异
compare_configs() {
    log_info "对比本地和远程配置差异..."
    
    # 创建临时文件
    TEMP_REMOTE="/tmp/remote_index.js"
    scp "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/backend/src/index.js" "$TEMP_REMOTE"
    
    echo "=== 配置文件差异对比 ==="
    if diff -u "$LOCAL_PATH/backend/src/index.js" "$TEMP_REMOTE" || true; then
        log_info "配置文件对比完成"
    fi
    
    # 清理临时文件
    rm -f "$TEMP_REMOTE"
}

# 创建统一的配置模板
create_unified_config() {
    log_info "创建统一的配置模板..."
    
    cat > "$LOCAL_PATH/backend/src/index.unified.js" << 'EOF'
const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");

const app = express();

// 环境检测
const isDevelopment = process.env.NODE_ENV !== 'production';
const isLocal = process.env.LOCAL_DEV === 'true';

// 动态CORS配置
const corsOptions = {
  origin: isDevelopment ? [
    "http://localhost:3000",
    "http://localhost:8080", 
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://152.32.218.174:3000",
    "http://152.32.218.174:8080",
    "http://152.32.218.174:8081",
    "http://152.32.218.174:3001"
  ] : [
    "http://152.32.218.174:3001",
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
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/config", require("./routes/configRoutes"));

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
const port = process.env.PORT || 3001;
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
EOF

    log_success "统一配置模板已创建: backend/src/index.unified.js"
}

# 应用统一配置
apply_unified_config() {
    log_info "应用统一配置..."
    
    # 备份现有配置
    cp "$LOCAL_PATH/backend/src/index.js" "$LOCAL_PATH/backend/src/index.js.backup"
    
    # 应用统一配置
    cp "$LOCAL_PATH/backend/src/index.unified.js" "$LOCAL_PATH/backend/src/index.js"
    
    # 同步到远程
    scp "$LOCAL_PATH/backend/src/index.js" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/backend/src/"
    
    log_success "统一配置已应用到本地和远程"
}

# 创建环境变量模板
create_env_template() {
    log_info "创建环境变量模板..."
    
    cat > "$LOCAL_PATH/.env.development" << 'EOF'
# 开发环境配置
NODE_ENV=development
LOCAL_DEV=true
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lianyu_ai
DB_USER=root
DB_PASSWORD=

# API配置
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:8081

# 调试配置
DEBUG=true
LOG_LEVEL=debug
EOF

    cat > "$LOCAL_PATH/.env.production" << 'EOF'
# 生产环境配置
NODE_ENV=production
LOCAL_DEV=false
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lianyu_ai
DB_USER=root
DB_PASSWORD=daiyiping123

# API配置
API_BASE_URL=http://152.32.218.174:3001
FRONTEND_URL=http://152.32.218.174:3001

# 调试配置
DEBUG=false
LOG_LEVEL=info
EOF

    log_success "环境变量模板已创建"
}

# 显示帮助信息
show_help() {
    echo "环境配置同步脚本"
    echo ""
    echo "用法:"
    echo "  $0 --compare           # 对比本地和远程配置差异"
    echo "  $0 --sync-to-remote    # 同步本地配置到远程"
    echo "  $0 --sync-to-local     # 同步远程配置到本地"
    echo "  $0 --create-unified    # 创建统一配置模板"
    echo "  $0 --apply-unified     # 应用统一配置"
    echo "  $0 --create-env        # 创建环境变量模板"
    echo "  $0 --help              # 显示帮助"
}

# 参数处理
case "${1:-}" in
    --compare)
        compare_configs
        ;;
    --sync-to-remote)
        sync_backend_config
        ;;
    --sync-to-local)
        sync_backend_config_to_local
        ;;
    --create-unified)
        create_unified_config
        ;;
    --apply-unified)
        create_unified_config
        apply_unified_config
        ;;
    --create-env)
        create_env_template
        ;;
    --help|-h)
        show_help
        ;;
    "")
        log_info "请指定操作参数，使用 --help 查看帮助"
        show_help
        ;;
    *)
        log_error "未知参数: $1"
        show_help
        exit 1
        ;;
esac