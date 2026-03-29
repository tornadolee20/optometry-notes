import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ce66bdf40a7d4b6c885f08a99eb2fd7e',
  appName: '探索美好體驗',
  webDir: 'dist',
  server: {
    url: 'https://ce66bdf4-0a7d-4b6c-885f-08a99eb2fd7e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;