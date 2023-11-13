import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.myapp',
  appName: 'My App',
  webDir: './dist/spa',
  server: {
    androidScheme: 'https'
  }
};

export default config;
