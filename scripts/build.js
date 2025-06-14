#!/usr/bin/env node

/**
 * 恋语AI 跨平台构建脚本
 * 支持Web、小程序、iOS、Android平台的自动化构建
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const MINIPROGRAM_DIR = path.join(ROOT_DIR, 'miniprogram');

// 确保目录存在
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 执行命令
function exec(command, options = {}) {
    try {
        const result = execSync(command, {
            cwd: ROOT_DIR,
            stdio: 'inherit',
            ...options
        });
        return result;
    } catch (error) {
        throw new Error(`命令执行失败: ${command}`);
    }
}

// 复制文件
function copyFile(src, dest) {
    const srcPath = path.resolve(ROOT_DIR, src);
    const destPath = path.resolve(ROOT_DIR, dest);
    
    if (!fs.existsSync(srcPath)) {
        warning(`源文件不存在: ${src}`);
        return;
    }
    
    ensureDir(path.dirname(destPath));
    fs.copyFileSync(srcPath, destPath);
    info(`复制: ${src} -> ${dest}`);
}

// 复制目录
function copyDir(src, dest, exclude = []) {
    const srcPath = path.resolve(ROOT_DIR, src);
    const destPath = path.resolve(ROOT_DIR, dest);
    
    if (!fs.existsSync(srcPath)) {
        warning(`源目录不存在: ${src}`);
        return;
    }
    
    ensureDir(destPath);
    
    const items = fs.readdirSync(srcPath);
    items.forEach(item => {
        if (exclude.includes(item)) return;
        
        const srcItem = path.join(srcPath, item);
        const destItem = path.join(destPath, item);
        
        if (fs.statSync(srcItem).isDirectory()) {
            copyDir(path.relative(ROOT_DIR, srcItem), path.relative(ROOT_DIR, destItem), exclude);
        } else {
            fs.copyFileSync(srcItem, destItem);
        }
    });
}

// 清理目录
function cleanDir(dir) {
    const dirPath = path.resolve(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        info(`清理目录: ${dir}`);
    }
}

// Web平台构建
function buildWeb() {
    log('\n🌐 开始构建Web平台...', 'cyan');
    
    try {
        // 清理输出目录
        cleanDir('dist/web');
        ensureDir('dist/web');
        
        // 复制核心文件
        copyFile('index.html', 'dist/web/index.html');
        copyFile('manifest.json', 'dist/web/manifest.json');
        copyFile('service-worker.js', 'dist/web/service-worker.js');
        
        // 复制资源目录
        copyDir('css', 'dist/web/css');
        copyDir('js', 'dist/web/js');
        copyDir('api', 'dist/web/api');
        copyDir('config', 'dist/web/config');
        copyDir('adapters', 'dist/web/adapters');
        copyDir('images', 'dist/web/images');
        copyDir('icons', 'dist/web/icons');
        
        // 压缩CSS和JS（如果有相关工具）
        try {
            info('压缩CSS文件...');
            exec('npm run minify:css');
        } catch (e) {
            warning('CSS压缩失败，跳过');
        }
        
        try {
            info('压缩JS文件...');
            exec('npm run minify:js');
        } catch (e) {
            warning('JS压缩失败，跳过');
        }
        
        success('Web平台构建完成！');
        info(`输出目录: ${path.resolve(ROOT_DIR, 'dist/web')}`);
        
    } catch (error) {
        error(`Web平台构建失败: ${error.message}`);
        throw error;
    }
}

// 小程序平台构建
function buildMiniprogram() {
    log('\n📱 开始构建小程序平台...', 'cyan');
    
    try {
        // 清理输出目录
        cleanDir('dist/miniprogram');
        ensureDir('dist/miniprogram');
        
        // 复制小程序文件
        copyDir('miniprogram', 'dist/miniprogram');
        
        // 复制共享的适配器和配置
        copyDir('config', 'dist/miniprogram/config');
        copyDir('adapters', 'dist/miniprogram/adapters');
        
        // 复制必要的资源文件
        copyDir('images', 'dist/miniprogram/images');
        copyDir('icons', 'dist/miniprogram/icons');
        
        success('小程序平台构建完成！');
        info(`输出目录: ${path.resolve(ROOT_DIR, 'dist/miniprogram')}`);
        info('请使用微信开发者工具打开 dist/miniprogram 目录');
        
    } catch (error) {
        error(`小程序平台构建失败: ${error.message}`);
        throw error;
    }
}

// iOS平台构建
function buildIOS() {
    log('\n🍎 开始构建iOS平台...', 'cyan');
    
    try {
        // 首先构建Web版本
        buildWeb();
        
        // 检查Capacitor是否已安装
        try {
            exec('npx cap --version', { stdio: 'pipe' });
        } catch (e) {
            error('Capacitor未安装，请先运行: npm install');
            throw new Error('Capacitor未安装');
        }
        
        // 添加iOS平台（如果尚未添加）
        try {
            exec('npx cap add ios');
        } catch (e) {
            info('iOS平台已存在，跳过添加');
        }
        
        // 同步Web资源到iOS
        info('同步Web资源到iOS...');
        exec('npx cap sync ios');
        
        success('iOS平台构建完成！');
        info('请运行以下命令打开Xcode项目:');
        info('npm run cap:open:ios');
        
    } catch (error) {
        error(`iOS平台构建失败: ${error.message}`);
        throw error;
    }
}

// Android平台构建
function buildAndroid() {
    log('\n🤖 开始构建Android平台...', 'cyan');
    
    try {
        // 首先构建Web版本
        buildWeb();
        
        // 检查Capacitor是否已安装
        try {
            exec('npx cap --version', { stdio: 'pipe' });
        } catch (e) {
            error('Capacitor未安装，请先运行: npm install');
            throw new Error('Capacitor未安装');
        }
        
        // 添加Android平台（如果尚未添加）
        try {
            exec('npx cap add android');
        } catch (e) {
            info('Android平台已存在，跳过添加');
        }
        
        // 同步Web资源到Android
        info('同步Web资源到Android...');
        exec('npx cap sync android');
        
        success('Android平台构建完成！');
        info('请运行以下命令打开Android Studio项目:');
        info('npm run cap:open:android');
        
    } catch (error) {
        error(`Android平台构建失败: ${error.message}`);
        throw error;
    }
}

// 构建所有平台
function buildAll() {
    log('\n🚀 开始构建所有平台...', 'magenta');
    
    const startTime = Date.now();
    
    try {
        buildWeb();
        buildMiniprogram();
        buildIOS();
        buildAndroid();
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        log('\n🎉 所有平台构建完成！', 'green');
        info(`总耗时: ${duration}秒`);
        
        // 显示构建结果
        log('\n📦 构建结果:', 'cyan');
        info('Web平台: dist/web/');
        info('小程序: dist/miniprogram/');
        info('iOS: ios/ (需要Xcode打开)');
        info('Android: android/ (需要Android Studio打开)');
        
    } catch (error) {
        error('构建过程中出现错误，请检查上述错误信息');
        process.exit(1);
    }
}

// 显示帮助信息
function showHelp() {
    log('\n恋语AI 跨平台构建工具', 'cyan');
    log('\n用法:');
    log('  node scripts/build.js [platform]');
    log('\n支持的平台:');
    log('  web        - 构建Web平台');
    log('  miniprogram - 构建小程序平台');
    log('  ios        - 构建iOS平台');
    log('  android    - 构建Android平台');
    log('  all        - 构建所有平台');
    log('\n示例:');
    log('  node scripts/build.js web');
    log('  node scripts/build.js all');
    log('');
}

// 主函数
function main() {
    const platform = process.argv[2];
    
    if (!platform) {
        showHelp();
        return;
    }
    
    switch (platform.toLowerCase()) {
        case 'web':
            buildWeb();
            break;
        case 'miniprogram':
        case 'mp':
            buildMiniprogram();
            break;
        case 'ios':
            buildIOS();
            break;
        case 'android':
            buildAndroid();
            break;
        case 'all':
            buildAll();
            break;
        case 'help':
        case '-h':
        case '--help':
            showHelp();
            break;
        default:
            error(`未知平台: ${platform}`);
            showHelp();
            process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = {
    buildWeb,
    buildMiniprogram,
    buildIOS,
    buildAndroid,
    buildAll
};