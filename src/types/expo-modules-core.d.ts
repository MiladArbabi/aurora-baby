declare module 'expo-modules-core' {
    import { EventSubscription } from 'react-native';
    export class LegacyEventEmitter {
      addListener(eventName: string, listener: (...args: any[]) => void): EventSubscription & { '@@nativeEmitterSubscription@@'?: any };
      removeListener(eventName: string, listener: (...args: any[]) => void): void;
    }
  }