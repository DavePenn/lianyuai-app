# 恋语AI - iOS/Android移动端部署指南

## 📱 移动端部署概述

恋语AI使用Capacitor框架实现跨平台移动应用开发，支持将Web应用打包为原生iOS和Android应用。

## 🛠️ 环境准备

### 通用要求
```bash
# 1. 安装Node.js (16+)
node --version  # 确保 >= 16.0.0

# 2. 安装Capacitor CLI
npm install -g @capacitor/cli

# 3. 验证Capacitor
npx cap --version
```

### iOS开发环境
```bash
# 必需软件（仅macOS）:
# - Xcode 13+ (从App Store安装)
# - iOS Simulator
# - Command Line Tools

# 验证Xcode安装
xcode-select --version

# 安装Command Line Tools (如未安装)
xcode-select --install
```

### Android开发环境
```bash
# 必需软件:
# - Android Studio
# - Android SDK (API Level 30+)
# - Java 11+

# 验证Java版本
java --version  # 应该是 11+

# 设置环境变量 (添加到 ~/.bash_profile 或 ~/.zshrc)
export ANDROID_HOME="$HOME/Library/Android/sdk"  # macOS
export ANDROID_HOME="/opt/android-sdk"           # Linux
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
```

## 🚀 构建移动应用

### 1. 项目初始化
```bash
# 进入项目目录
cd lianyu_ai

# 安装依赖
npm install

# 构建Web应用
npm run build
```

### 2. iOS应用构建

#### 2.1 添加iOS平台
```bash
# 添加iOS平台
npx cap add ios

# 或强制重新创建
npx cap add ios --force
```

#### 2.2 同步资源
```bash
# 同步Web资源到iOS项目
npx cap sync ios

# 复制资源文件
npx cap copy ios
```

#### 2.3 打开Xcode项目
```bash
# 在Xcode中打开项目
npx cap open ios
```

#### 2.4 Xcode配置
1. **配置Team和Bundle ID**:
   - 在Xcode中选择项目 → General
   - 设置Team (需要Apple开发者账号)
   - 修改Bundle Identifier: `com.lianyuai.app`

2. **配置Info.plist权限**:
   ```xml
   
   
   <!-- 相机权限 (拍照功能) -->
   <key>NSCameraUsageDescription</key>
   <string>恋语AI需要使用相机拍摄照片</string>
   
   <!-- 相册权限 (图片上传) -->
   <key>NSPhotoLibraryUsageDescription</key>
   <string>恋语AI需要访问相册选择图片</string>
   
   <!-- 网络请求权限 -->
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
   </dict>
   ```

3. **构建和运行**:
   - 选择目标设备或模拟器
   - 点击▶️按钮构建并运行

#### 2.5 发布到App Store
```bash
# 1. 创建Archive
# 在Xcode中: Product → Archive

# 2. 上传到App Store Connect
# 使用Xcode Organizer上传

# 3. 在App Store Connect中配置应用信息
# - 应用描述、截图、分类等
# - 提交审核
```

### 3. Android应用构建

#### 3.1 添加Android平台
```bash
# 添加Android平台
npx cap add android

# 或强制重新创建
npx cap add android --force
```

#### 3.2 同步资源
```bash
# 同步Web资源到Android项目
npx cap sync android

# 复制资源文件
npx cap copy android
```

#### 3.3 打开Android Studio项目
```bash
# 在Android Studio中打开项目
npx cap open android
```

#### 3.4 Android Studio配置

1. **配置应用权限** (android/app/src/main/AndroidManifest.xml):
   ```xml
   <!-- 网络权限 -->
   <uses-permission android:name="android.permission.INTERNET" />
   
   <!-- 麦克风权限 -->
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   
   <!-- 相机权限 -->
   <uses-permission android:name="android.permission.CAMERA" />
   
   <!-- 存储权限 -->
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   
   <!-- 网络状态 -->
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```

2. **配置网络安全** (android/app/src/main/res/xml/network_security_config.xml):
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <domain-config cleartextTrafficPermitted="true">
           <domain includeSubdomains="true">152.32.218.174</domain>
           <domain includeSubdomains="true">localhost</domain>
       </domain-config>
   </network-security-config>
   ```

3. **更新应用配置** (android/app/build.gradle):
   ```gradle
   android {
       compileSdk 34
       
       defaultConfig {
           applicationId "com.lianyuai.app"
           minSdk 24
           targetSdk 34
           versionCode 1
           versionName "1.0.0"
       }
   }
   ```

#### 3.5 构建APK
```bash
# 调试版本
cd android
./gradlew assembleDebug

# 发布版本 (需要签名密钥)
./gradlew assembleRelease
```

#### 3.6 发布到Google Play
```bash
# 1. 生成签名密钥
keytool -genkey -v -keystore lianyu-ai-key.keystore -alias lianyu-ai -keyalg RSA -keysize 2048 -validity 10000

# 2. 配置签名 (android/app/build.gradle)
# 3. 构建发布版本
# 4. 上传到Google Play Console
```

## 📱 Capacitor配置优化

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lianyuai.app',
  appName: '恋语AI',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // 开发时指向本地服务器
    // url: 'http://152.32.218.174:8081',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ff3e79",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#ff3e79"
    }
  }
};

export default config;
```

## 🔧 常见问题解决

### iOS问题

1. **签名问题**:
   ```bash
   # 清理项目
   rm -rf ios/App/build
   npx cap sync ios
   ```

2. **网络请求失败**:
   - 检查Info.plist中的网络权限配置
   - 确保NSAppTransportSecurity设置正确

3. **插件不工作**:
   ```bash
   # 重新安装插件
   npm uninstall @capacitor/camera
   npm install @capacitor/camera
   npx cap sync ios
   ```

### Android问题

1. **网络明文传输错误**:
   - 确保network_security_config.xml配置正确
   - 在AndroidManifest.xml中引用该配置

2. **权限被拒绝**:
   - 检查AndroidManifest.xml权限声明
   - 确保运行时权限请求正确

3. **构建失败**:
   ```bash
   # 清理项目
   cd android
   ./gradlew clean
   cd ..
   npx cap sync android
   ```

## 📝 开发调试

### 调试Web内容
```bash
# iOS
# Safari → 开发 → 设备名 → 应用

# Android
# Chrome → chrome://inspect → 选择设备
```

### 热重载开发
```bash
# 1. 启动本地服务器
npm run dev

# 2. 配置capacitor.config.ts中的server.url
# 3. 重新构建应用
npx cap copy
```

### 日志查看
```bash
# iOS日志
npx cap run ios

# Android日志
npx cap run android
adb logcat
```

## 🚀 自动化构建脚本

### iOS自动构建
```bash
#!/bin/bash
# build-ios.sh

echo "🍎 构建iOS应用..."
npm run build
npx cap sync ios
npx cap open ios
echo "✅ 请在Xcode中完成构建和发布"
```

### Android自动构建
```bash
#!/bin/bash
# build-android.sh

echo "🤖 构建Android应用..."
npm run build
npx cap sync android

cd android
./gradlew assembleDebug
echo "✅ APK已生成: android/app/build/outputs/apk/debug/"
cd ..
```

## 📊 性能优化

### 1. 资源优化
```bash
# 压缩图片
npm install -g imagemin-cli
imagemin icons/*.png --out-dir=icons/optimized

# 代码分割
# 在构建过程中启用代码分割和懒加载
```

### 2. 启动性能
```typescript
// 在capacitor.config.ts中配置启动画面
plugins: {
  SplashScreen: {
    launchShowDuration: 1000,
    launchAutoHide: true
  }
}
```

### 3. 缓存策略
```javascript
// 在service-worker.js中配置缓存策略
// 确保离线功能正常工作
```

## 📋 发布检查清单

### 发布前检查
- [ ] 功能测试完成
- [ ] 权限配置正确
- [ ] 图标和启动画面设置
- [ ] 版本号更新
- [ ] 签名配置完成
- [ ] 隐私政策和用户协议
- [ ] 应用商店资料准备

### iOS App Store
- [ ] Apple开发者账号
- [ ] 应用截图 (所有设备尺寸)
- [ ] 应用描述和关键词
- [ ] 分级和类别设置
- [ ] 审核指南合规性检查

### Google Play
- [ ] Google Play开发者账号
- [ ] 应用截图和宣传图
- [ ] 应用描述和分类
- [ ] 内容分级
- [ ] 目标API级别要求

## 🎉 总结

通过以上步骤，您可以成功将恋语AI部署为原生iOS和Android应用。记住要：

1. **定期更新**: 保持Capacitor和相关插件为最新版本
2. **测试先行**: 在多种设备上测试应用功能
3. **性能监控**: 监控应用性能和用户反馈
4. **安全考虑**: 定期检查和更新安全配置

如有问题，请参考[Capacitor官方文档](https://capacitorjs.com/docs)或联系技术支持。
