// 自动生成的配置文件 - 请勿手动修改
// 生成时间: 2025-08-03T06:03:35.313Z
// 环境: production

window.AppConfig = {
    environment: 'production',
    frontend: {
        port: 80,
        host: '152.32.218.174',
        url: 'http://152.32.218.174'
    },
    backend: {
        port: 3000,
        host: '152.32.218.174',
        url: 'http://152.32.218.174:3000',
        apiPrefix: '/api'
    },
    database: {
        host: 'localhost',
        port: 3306,
        name: 'lianyu_ai',
        user: 'lianyu_user'
    },
    oauth: {
        "google": {
                "clientId": "1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com"
        }
}
};

// 兼容性函数
window.getConfig = () => window.AppConfig;
