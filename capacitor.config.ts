import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lianyuai.app',
  appName: '恋语AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ff3e79',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ff3e79'
    },
    Keyboard: {
      resize: 'body' as any,
      style: 'dark' as any,
      resizeOnFullScreen: true
    },
    App: {
      launchUrl: 'index.html'
    },
    Storage: {
      group: 'LianyuAI'
    },
    Camera: {
      permissions: {
        camera: 'This app needs access to camera to take photos for chat.',
        photos: 'This app needs access to photo library to select images for chat.'
      }
    },
    Geolocation: {
      permissions: {
        location: 'This app needs access to location for location-based dating suggestions.'
      }
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#ff3e79',
      sound: 'beep.wav'
    }
  },
  ios: {
    scheme: 'LianyuAI',
    contentInset: 'automatic',
    backgroundColor: '#ff3e79',
    allowsLinkPreview: false,
    scrollEnabled: true,
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: false
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
      signingType: 'apksigner'
    },
    backgroundColor: '#ffffff',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'LianyuAI/1.0.0',
    overrideUserAgent: undefined,
    useLegacyBridge: false,
    loggingBehavior: 'none'
  }
};

export default config;