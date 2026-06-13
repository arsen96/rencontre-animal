import { PluginListenerHandle, registerPlugin } from '@capacitor/core';

export interface PushToken {
  value: string;
}

export interface PushActionPerformed {
  actionId: string;
  notification: {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  };
}

export interface PushNotificationPermissionStatus {
  receive: 'prompt' | 'granted' | 'denied';
}

export interface PushNotificationPlugin {
  checkPermissions(): Promise<PushNotificationPermissionStatus>;
  requestPermissions(): Promise<PushNotificationPermissionStatus>;
  register(): Promise<void>;
  addListener(
    eventName: 'registration',
    listenerFunc: (token: PushToken) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'registrationError',
    listenerFunc: (error: unknown) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (notification: PushActionPerformed) => void
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const PushNotifications = registerPlugin<PushNotificationPlugin>(
  'PushNotifications'
);
