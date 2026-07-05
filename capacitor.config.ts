import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.animalrencontre.app',
  appName: 'Animal Rencontre',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;


// npm run build
// npx cap sync android
// npx cap open android

// npx cap run android

// cd android
// ./gradlew assembleDebug  